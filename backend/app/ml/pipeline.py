from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Tuple

import json
import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.multioutput import MultiOutputClassifier


FEATURES: List[str] = [
    "team_size",
    "project_budget",
    "project_duration",
    "requirement_change_count",
    "average_sprint_delay",
    "bug_count",
    "testing_coverage",
    "code_complexity",
    "developer_experience",
    "communication_frequency",
    "task_completion_rate",
    "client_change_requests",
    "previous_project_success_rate",
]

RISK_CLASSES: List[str] = ["Low", "Medium", "High", "Critical"]

TASKS: List[str] = [
    "delay",
    "budget_overrun",
    "quality_issues",
    "requirement_instability",
]


def artifacts_dir(repo_root: Path) -> Path:
    return repo_root / "ml" / "models_v2"


def dataset_path(repo_root: Path) -> Path:
    return repo_root / "ml" / "dataset" / "software_project_risk_data.csv"


def _sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-x))


def generate_synthetic_dataset(repo_root: Path, n: int = 4000, seed: int = 42) -> Path:
    """
    Generate a realistic-ish dataset if none exists.
    Produces:
      - multiclass risk_level: Low/Medium/High/Critical
      - 4 binary outcomes: delay, budget_overrun, quality_issues, requirement_instability
    """
    rng = np.random.default_rng(seed)

    team_size = rng.integers(2, 60, size=n)
    project_budget = rng.normal(250_000, 180_000, size=n).clip(15_000, 2_500_000)
    project_duration = rng.integers(1, 24, size=n)

    requirement_change_count = rng.poisson(lam=6, size=n).clip(0, 40)
    average_sprint_delay = rng.normal(2.2, 2.0, size=n).clip(0, 18)
    bug_count = rng.poisson(lam=55, size=n).clip(0, 350)
    testing_coverage = rng.normal(62, 18, size=n).clip(0, 100)
    code_complexity = rng.integers(1, 11, size=n)
    developer_experience = rng.normal(4.5, 2.4, size=n).clip(0.2, 18)
    communication_frequency = rng.integers(0, 11, size=n)  # mtgs/wk
    task_completion_rate = rng.normal(72, 16, size=n).clip(0, 100)
    client_change_requests = rng.poisson(lam=4, size=n).clip(0, 30)
    previous_project_success_rate = rng.normal(72, 18, size=n).clip(0, 100)

    # Derived latent risk score (0..1-ish) using interpretable signals
    # Higher = more risk.
    z = (
        0.08 * (requirement_change_count / 10.0)
        + 0.10 * (average_sprint_delay / 6.0)
        + 0.09 * (bug_count / 120.0)
        + 0.10 * (code_complexity / 10.0)
        + 0.07 * (client_change_requests / 10.0)
        + 0.06 * (project_duration / 18.0)
        - 0.10 * (testing_coverage / 100.0)
        - 0.08 * (developer_experience / 10.0)
        - 0.10 * (task_completion_rate / 100.0)
        - 0.09 * (previous_project_success_rate / 100.0)
        - 0.04 * (communication_frequency / 10.0)
        + 0.03 * (np.log1p(project_budget) / np.log(2_500_000))
        + rng.normal(0, 0.05, size=n)
    )
    risk_score_01 = _sigmoid((z - 0.35) * 4.2)  # spread into 0..1

    # Bucket into 4 risk classes
    # Tuned cutoffs to produce all classes.
    risk_level = np.where(
        risk_score_01 < 0.35,
        "Low",
        np.where(
            risk_score_01 < 0.55,
            "Medium",
            np.where(risk_score_01 < 0.75, "High", "Critical"),
        ),
    )

    # Individual outcome probabilities (0..1)
    delay_probability = _sigmoid((risk_score_01 - 0.45) * 4.5)
    budget_overrun_probability = _sigmoid((risk_score_01 - 0.50) * 4.2) * (0.7 + 0.3 * (project_budget / 2_500_000))
    quality_issue_probability = _sigmoid((risk_score_01 - 0.40) * 4.6) * (0.9 + 0.2 * (bug_count / 350)) * (1.05 - 0.6 * (testing_coverage / 100))
    requirement_instability_probability = _sigmoid((risk_score_01 - 0.42) * 4.4) * (0.8 + 0.4 * (requirement_change_count / 40))

    # Sample binary labels from probs
    delay = rng.binomial(1, delay_probability.clip(0, 1)).astype(int)
    budget_overrun = rng.binomial(1, budget_overrun_probability.clip(0, 1)).astype(int)
    quality_issues = rng.binomial(1, quality_issue_probability.clip(0, 1)).astype(int)
    requirement_instability = rng.binomial(1, requirement_instability_probability.clip(0, 1)).astype(int)

    df = pd.DataFrame(
        {
            "team_size": team_size,
            "project_budget": project_budget.round(2),
            "project_duration": project_duration,
            "requirement_change_count": requirement_change_count,
            "average_sprint_delay": average_sprint_delay.round(2),
            "bug_count": bug_count,
            "testing_coverage": testing_coverage.round(2),
            "code_complexity": code_complexity,
            "developer_experience": developer_experience.round(2),
            "communication_frequency": communication_frequency,
            "task_completion_rate": task_completion_rate.round(2),
            "client_change_requests": client_change_requests,
            "previous_project_success_rate": previous_project_success_rate.round(2),
            "risk_level": risk_level,
            "delay": delay,
            "budget_overrun": budget_overrun,
            "quality_issues": quality_issues,
            "requirement_instability": requirement_instability,
        }
    )

    out = dataset_path(repo_root)
    out.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out, index=False)
    return out


def _preprocess_pipeline() -> Tuple[Pipeline, List[str]]:
    numeric_features = FEATURES
    numeric_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )
    preprocessor = ColumnTransformer(
        transformers=[("num", numeric_transformer, numeric_features)],
        remainder="drop",
    )
    return preprocessor, numeric_features


@dataclass
class TrainingResult:
    best_model_name: str
    model: Any
    metrics: Dict[str, Any]
    feature_importance: List[Dict[str, Any]]


def _risk_metrics(y_true: np.ndarray, y_pred: np.ndarray, labels: List[str]) -> Dict[str, Any]:
    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision_macro": float(precision_score(y_true, y_pred, average="macro", zero_division=0)),
        "recall_macro": float(recall_score(y_true, y_pred, average="macro", zero_division=0)),
        "f1_macro": float(f1_score(y_true, y_pred, average="macro", zero_division=0)),
        "confusion_matrix": confusion_matrix(y_true, y_pred, labels=labels).tolist(),
        "labels": labels,
    }


def train_and_select_best(repo_root: Path, seed: int = 42) -> TrainingResult:
    ds = dataset_path(repo_root)
    if not ds.exists():
        generate_synthetic_dataset(repo_root, n=4000, seed=seed)

    df = pd.read_csv(ds)

    # Ensure expected columns exist; if not, fall back to synthetic generation.
    expected = set(FEATURES + ["risk_level"] + TASKS)
    if not expected.issubset(set(df.columns)):
        generate_synthetic_dataset(repo_root, n=4000, seed=seed)
        df = pd.read_csv(ds)

    X = df[FEATURES]
    y_risk = df["risk_level"].astype(str)
    y_aux = df[TASKS].astype(int)

    X_train, X_test, y_risk_train, y_risk_test, y_aux_train, y_aux_test = train_test_split(
        X, y_risk, y_aux, test_size=0.2, random_state=seed, stratify=y_risk
    )

    preprocessor, _ = _preprocess_pipeline()

    candidates: List[Tuple[str, Any]] = [
        ("RandomForest", RandomForestClassifier(
            n_estimators=200,
            max_depth=18,
            min_samples_split=5,
            random_state=seed,
            class_weight="balanced",
        )),
        ("GradientBoosting", GradientBoostingClassifier(random_state=seed)),
        ("LogisticRegression", LogisticRegression(
            max_iter=4000,
            multi_class="multinomial",
            solver="lbfgs",
        )),
    ]

    results: Dict[str, Any] = {"risk": {}, "aux": {}}
    best_name = None
    best_score = -1.0
    best_bundle = None

    # Train each candidate for risk + aux (multioutput)
    for name, clf in candidates:
        risk_pipe = Pipeline(steps=[("preprocess", preprocessor), ("clf", clf)])
        aux_pipe = Pipeline(steps=[("preprocess", preprocessor), ("clf", MultiOutputClassifier(clf))])

        risk_pipe.fit(X_train, y_risk_train)
        aux_pipe.fit(X_train, y_aux_train)

        risk_pred = risk_pipe.predict(X_test)
        risk_m = _risk_metrics(y_risk_test.to_numpy(), risk_pred, RISK_CLASSES)

        # Aux metrics: per-task binary F1
        aux_pred = aux_pipe.predict(X_test)
        aux_m = {}
        for i, task in enumerate(TASKS):
            yt = y_aux_test[task].to_numpy()
            yp = aux_pred[:, i]
            aux_m[task] = {
                "accuracy": float(accuracy_score(yt, yp)),
                "precision": float(precision_score(yt, yp, zero_division=0)),
                "recall": float(recall_score(yt, yp, zero_division=0)),
                "f1": float(f1_score(yt, yp, zero_division=0)),
                "confusion_matrix": confusion_matrix(yt, yp, labels=[0, 1]).tolist(),
                "labels": [0, 1],
            }

        results["risk"][name] = risk_m
        results["aux"][name] = aux_m

        score = risk_m["f1_macro"]
        if score > best_score:
            best_score = score
            best_name = name
            best_bundle = {"risk_pipe": risk_pipe, "aux_pipe": aux_pipe}

    assert best_name and best_bundle

    # Feature importance for best model (risk head only).
    fi = extract_feature_importance(best_bundle["risk_pipe"], FEATURES)

    metrics = {
        "selected_model": best_name,
        "selection_metric": "risk_f1_macro",
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "total_samples": len(df),
        "candidates": {
            "risk": results["risk"],
            "aux": results["aux"],
        },
    }

    return TrainingResult(
        best_model_name=best_name,
        model=best_bundle,
        metrics=metrics,
        feature_importance=fi,
    )


def extract_feature_importance(risk_pipe: Pipeline, feature_names: List[str]) -> List[Dict[str, Any]]:
    """
    Return a normalized absolute importance score per feature.
    Works for tree models and logistic regression.
    """
    clf = risk_pipe.named_steps["clf"]

    scores = None
    if hasattr(clf, "feature_importances_"):
        scores = np.asarray(clf.feature_importances_, dtype=float)
    elif hasattr(clf, "coef_"):
        # multinomial -> shape [n_classes, n_features]
        coef = np.asarray(clf.coef_, dtype=float)
        scores = np.mean(np.abs(coef), axis=0)

    if scores is None:
        scores = np.ones(len(feature_names), dtype=float)

    scores = np.maximum(scores, 0)
    total = float(scores.sum()) or 1.0
    norm = (scores / total).tolist()

    items = [{"feature": f, "importance": float(i)} for f, i in zip(feature_names, norm)]
    items.sort(key=lambda x: x["importance"], reverse=True)
    return items


def save_artifacts(repo_root: Path, bundle: Dict[str, Any], metrics: Dict[str, Any], feature_importance: List[Dict[str, Any]]):
    out_dir = artifacts_dir(repo_root)
    out_dir.mkdir(parents=True, exist_ok=True)

    joblib.dump(bundle["risk_pipe"], out_dir / "risk_model.joblib")
    joblib.dump(bundle["aux_pipe"], out_dir / "aux_models.joblib")

    with open(out_dir / "metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
    with open(out_dir / "feature_importance.json", "w") as f:
        json.dump(feature_importance, f, indent=2)


def load_artifacts(repo_root: Path) -> Dict[str, Any] | None:
    out_dir = artifacts_dir(repo_root)
    risk_path = out_dir / "risk_model.joblib"
    aux_path = out_dir / "aux_models.joblib"
    if not risk_path.exists() or not aux_path.exists():
        return None
    return {
        "risk_pipe": joblib.load(risk_path),
        "aux_pipe": joblib.load(aux_path),
        "metrics": json.loads((out_dir / "metrics.json").read_text()) if (out_dir / "metrics.json").exists() else None,
        "feature_importance": json.loads((out_dir / "feature_importance.json").read_text()) if (out_dir / "feature_importance.json").exists() else None,
    }


def get_dataset_statistics(repo_root: Path) -> Dict[str, Any]:
    """Return summary statistics and distribution data from the training dataset."""
    ds = dataset_path(repo_root)
    if not ds.exists():
        generate_synthetic_dataset(repo_root, n=4000, seed=42)
    df = pd.read_csv(ds)

    stats: Dict[str, Any] = {
        "total_projects": len(df),
        "features": {},
    }

    # Per-feature summary
    for feat in FEATURES:
        if feat in df.columns:
            col = df[feat].dropna()
            stats["features"][feat] = {
                "mean": round(float(col.mean()), 2),
                "median": round(float(col.median()), 2),
                "min": round(float(col.min()), 2),
                "max": round(float(col.max()), 2),
                "std": round(float(col.std()), 2),
            }

    # Risk level distribution
    if "risk_level" in df.columns:
        dist = df["risk_level"].value_counts().to_dict()
        stats["risk_distribution"] = {str(k): int(v) for k, v in dist.items()}

    # Histograms for key features (binned)
    def _histogram(series: pd.Series, bins: int = 10) -> list:
        counts, edges = np.histogram(series.dropna(), bins=bins)
        return [
            {"range": f"{edges[i]:.0f}-{edges[i+1]:.0f}", "count": int(counts[i])}
            for i in range(len(counts))
        ]

    stats["histograms"] = {
        "project_duration": _histogram(df["project_duration"], 8),
        "bug_count": _histogram(df["bug_count"], 10),
        "team_size": _histogram(df["team_size"], 8),
        "project_budget": _histogram(df["project_budget"], 10),
        "testing_coverage": _histogram(df["testing_coverage"], 8),
    }

    # Team size vs average risk (grouped)
    if "risk_level" in df.columns:
        risk_map = {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}
        df["_risk_num"] = df["risk_level"].map(risk_map).fillna(2)
        team_bins = pd.cut(df["team_size"], bins=6)
        grouped = df.groupby(team_bins, observed=True).agg(
            avg_risk=("_risk_num", "mean"),
            count=("_risk_num", "count"),
        ).reset_index()
        stats["team_vs_risk"] = [
            {"team_range": str(row["team_size"]), "avg_risk": round(float(row["avg_risk"]), 2), "count": int(row["count"])}
            for _, row in grouped.iterrows()
        ]

    # Budget vs success rate (grouped)
    if "previous_project_success_rate" in df.columns:
        budget_bins = pd.cut(df["project_budget"], bins=6)
        grouped2 = df.groupby(budget_bins, observed=True).agg(
            avg_success=("previous_project_success_rate", "mean"),
            count=("previous_project_success_rate", "count"),
        ).reset_index()
        stats["budget_vs_success"] = [
            {"budget_range": str(row["project_budget"]), "avg_success": round(float(row["avg_success"]), 2), "count": int(row["count"])}
            for _, row in grouped2.iterrows()
        ]

    return stats

