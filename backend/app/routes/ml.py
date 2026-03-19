from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException

from app.schemas.schemas import PredictRequest
from app.utils.auth import get_current_user, require_roles
from app.models.database import User

from app.ml.pipeline import (
    FEATURES,
    RISK_CLASSES,
    TASKS,
    artifacts_dir,
    dataset_path,
    generate_synthetic_dataset,
    get_dataset_statistics,
    load_artifacts,
    save_artifacts,
    train_and_select_best,
)
from app.ml.recommendations import generate_recommendations, reasoning_summary

router = APIRouter(prefix="/ml", tags=["ML"])

import numpy as np
import pandas as pd


def _repo_root() -> Path:
    # backend/app/routes/ml.py -> repo root is parents[4]:
    # .../backend/app/routes/ml.py
    return Path(__file__).resolve().parents[4]


def _ensure_trained(repo_root: Path):
    arts = load_artifacts(repo_root)
    if arts is None:
        result = train_and_select_best(repo_root)
        save_artifacts(repo_root, result.model, result.metrics, result.feature_importance)
        arts = load_artifacts(repo_root)
    return arts


@router.post(
    "/train-model",
    dependencies=[Depends(require_roles("admin"))],
)
def train_model(current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    repo_root = _repo_root()

    if not dataset_path(repo_root).exists():
        generate_synthetic_dataset(repo_root, n=5000, seed=42)

    result = train_and_select_best(repo_root)
    save_artifacts(repo_root, result.model, result.metrics, result.feature_importance)

    return {
        "status": "trained",
        "artifacts_dir": str(artifacts_dir(repo_root)),
        "selected_model": result.best_model_name,
        "metrics": result.metrics,
    }


@router.get(
    "/model-metrics",
    dependencies=[Depends(require_roles("admin", "project_manager", "risk_analyst", "team_lead"))],
)
def model_metrics(current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    repo_root = _repo_root()
    arts = _ensure_trained(repo_root)
    return arts.get("metrics") or {"detail": "No metrics available"}


@router.get(
    "/feature-importance",
    dependencies=[Depends(require_roles("admin", "project_manager", "risk_analyst", "team_lead"))],
)
def feature_importance(current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    repo_root = _repo_root()
    arts = _ensure_trained(repo_root)
    fi = arts.get("feature_importance")
    if not fi:
        raise HTTPException(status_code=404, detail="Feature importance not found")
    return {"features": fi}


@router.post(
    "/predict-risk",
    dependencies=[Depends(require_roles("admin", "project_manager", "risk_analyst", "team_lead"))],
)
def predict_risk_endpoint(
    data: PredictRequest,
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    repo_root = _repo_root()
    arts = _ensure_trained(repo_root)

    risk_pipe = arts["risk_pipe"]
    aux_pipe = arts["aux_pipe"]
    fi = arts.get("feature_importance") or []

    features = data.model_dump()

    # Predict risk class probabilities
    X_df = pd.DataFrame([{f: features.get(f) for f in FEATURES}], columns=FEATURES)
    proba = risk_pipe.predict_proba(X_df)[0]  # aligned to pipe's classes_
    classes = list(getattr(risk_pipe.named_steps["clf"], "classes_", RISK_CLASSES))

    class_to_p = {c: float(p) for c, p in zip(classes, proba)}
    for c in RISK_CLASSES:
        class_to_p.setdefault(c, 0.0)

    risk_level = max(class_to_p.items(), key=lambda kv: kv[1])[0]

    # Risk score 0..100 using weighted expectation
    weights = {"Low": 15, "Medium": 45, "High": 75, "Critical": 92}
    risk_score = float(sum(class_to_p[c] * weights[c] for c in RISK_CLASSES))
    risk_score = float(np.clip(risk_score, 0, 100))

    # Predict aux probabilities safely via MultiOutputClassifier.predict_proba
    aux_proba: Dict[str, float] = {}
    proba_list = aux_pipe.predict_proba(X_df)  # list[n_outputs] of arrays [n_samples, n_classes]
    for task, p in zip(TASKS, proba_list):
        row = p[0]
        # Expect binary [P(class0), P(class1)]
        aux_proba[task] = float(row[1]) if len(row) > 1 else float(row[-1])

    # Build explainability using feature importance * deviation from healthy baseline
    baseline = {
        "team_size": 8,
        "project_budget": 250_000,
        "project_duration": 6,
        "requirement_change_count": 4,
        "average_sprint_delay": 1.5,
        "bug_count": 35,
        "testing_coverage": 75,
        "code_complexity": 4,
        "developer_experience": 5,
        "communication_frequency": 3,
        "task_completion_rate": 82,
        "client_change_requests": 3,
        "previous_project_success_rate": 78,
    }
    polarity = {
        "requirement_change_count": "higher_worse",
        "average_sprint_delay": "higher_worse",
        "bug_count": "higher_worse",
        "code_complexity": "higher_worse",
        "client_change_requests": "higher_worse",
        "project_duration": "higher_worse",
        "project_budget": "higher_worse",
        "testing_coverage": "higher_better",
        "developer_experience": "higher_better",
        "communication_frequency": "higher_better",
        "task_completion_rate": "higher_better",
        "previous_project_success_rate": "higher_better",
        "team_size": "neutral",
    }
    labels = {
        "team_size": "Team Size",
        "project_budget": "Budget",
        "project_duration": "Duration",
        "requirement_change_count": "Requirement Changes",
        "average_sprint_delay": "Average Sprint Delay",
        "bug_count": "Bug Count",
        "testing_coverage": "Testing Coverage",
        "code_complexity": "Code Complexity",
        "developer_experience": "Developer Experience",
        "communication_frequency": "Communication Frequency",
        "task_completion_rate": "Task Completion Rate",
        "client_change_requests": "Client Change Requests",
        "previous_project_success_rate": "Past Success Rate",
    }

    def factor_direction(feat: str, value: float) -> str:
        pol = polarity.get(feat, "neutral")
        base = float(baseline.get(feat, value))
        if pol == "neutral":
            return "neutral"
        if pol == "higher_worse":
            return "increased_risk" if value > base else "reduced_risk"
        return "reduced_risk" if value > base else "increased_risk"

    factors = []
    for item in fi[:10]:
        feat = item["feature"]
        imp = float(item["importance"])
        val = float(features.get(feat))
        base = float(baseline.get(feat, val))
        delta = (val - base)
        direction = factor_direction(feat, val)
        score = abs(delta) * imp
        factors.append(
            {
                "feature": feat,
                "label": labels.get(feat, feat),
                "importance": imp,
                "value": val,
                "baseline": base,
                "direction": direction,
                "driver_score": float(score),
            }
        )

    top_risk = [f for f in sorted(factors, key=lambda x: x["driver_score"], reverse=True) if f["direction"] == "increased_risk"][:5]
    top_pos = [f for f in sorted(factors, key=lambda x: x["driver_score"], reverse=True) if f["direction"] == "reduced_risk"][:5]

    # Health sub-scores out of 100
    delay_score = float((1 - aux_proba["delay"]) * 100)
    budget_score = float((1 - aux_proba["budget_overrun"]) * 100)
    quality_score = float((1 - aux_proba["quality_issues"]) * 100)
    stability_score = float((1 - aux_proba["requirement_instability"]) * 100)

    # Team efficiency: combine completion and communication, penalize sprint delay
    team_eff = float(
        np.clip(
            0.55 * float(features.get("task_completion_rate", 0))
            + 4.0 * float(features.get("communication_frequency", 0))
            - 6.0 * float(features.get("average_sprint_delay", 0)),
            0,
            100,
        )
    )

    # Confidence: max class probability
    confidence = float(max(class_to_p.values()))

    response = {
        "risk_level": risk_level,
        "risk_score": round(risk_score, 2),
        "delay_probability": round(aux_proba["delay"], 4),
        "budget_overrun_probability": round(aux_proba["budget_overrun"], 4),
        "quality_issue_probability": round(aux_proba["quality_issues"], 4),
        "requirement_instability_probability": round(aux_proba["requirement_instability"], 4),
        "confidence_score": round(confidence, 4),
        "risk_probabilities": {k: round(v, 4) for k, v in class_to_p.items()},
        "top_risk_factors": top_risk,
        "top_positive_factors": top_pos,
        "feature_importance": fi[:12],
        "health_dashboard": {
            "risk_score": round(risk_score, 2),
            "delay_score": round(delay_score, 1),
            "budget_score": round(budget_score, 1),
            "quality_score": round(quality_score, 1),
            "team_efficiency_score": round(team_eff, 1),
            "stability_score": round(stability_score, 1),
        },
    }

    response["recommendations"] = generate_recommendations(features, response)
    response["reasoning_summary"] = reasoning_summary(features, response)

    response["project_status_analysis"] = {
        "current_project_condition": f"{risk_level} risk with {round(confidence*100)}% confidence.",
        "key_risk_drivers": [f["label"] for f in top_risk[:3]],
        "predicted_outcome": {
            "delay_probability": response["delay_probability"],
            "budget_overrun_probability": response["budget_overrun_probability"],
            "quality_issue_probability": response["quality_issue_probability"],
            "requirement_instability_probability": response["requirement_instability_probability"],
        },
        "recommended_next_steps": [r["title"] for r in response["recommendations"][:3]],
    }

    # --- SHAP-style per-feature contribution ---
    shap_explanation = []
    for item in fi[:13]:
        feat = item["feature"]
        imp = float(item["importance"])
        val = float(features.get(feat, 0))
        base = float(baseline.get(feat, val))
        pol = polarity.get(feat, "neutral")
        delta = val - base
        if pol == "higher_worse":
            contribution = round(delta * imp * 100, 2)
        elif pol == "higher_better":
            contribution = round(-delta * imp * 100, 2)
        else:
            contribution = 0.0
        shap_explanation.append({
            "feature": feat,
            "label": labels.get(feat, feat),
            "value": val,
            "baseline": base,
            "contribution": contribution,
        })
    shap_explanation.sort(key=lambda x: abs(x["contribution"]), reverse=True)
    response["shap_explanation"] = shap_explanation

    # --- Model info from saved metrics ---
    metrics = arts.get("metrics") or {}
    selected = metrics.get("selected_model", "RandomForest")
    risk_metrics = (metrics.get("candidates", {}).get("risk", {}).get(selected, {}))
    response["model_info"] = {
        "model_name": selected,
        "accuracy": risk_metrics.get("accuracy"),
        "precision": risk_metrics.get("precision_macro"),
        "recall": risk_metrics.get("recall_macro"),
        "f1_score": risk_metrics.get("f1_macro"),
        "confusion_matrix": risk_metrics.get("confusion_matrix"),
        "labels": risk_metrics.get("labels"),
        "training_samples": metrics.get("training_samples"),
        "total_samples": metrics.get("total_samples"),
    }

    return response


# ─── NEW ENDPOINTS ────────────────────────────────────────────────────

from pydantic import BaseModel
from typing import List, Optional


class WhatIfScenario(BaseModel):
    label: str
    overrides: Dict[str, float]


class WhatIfRequest(BaseModel):
    base_features: Dict[str, float]
    scenarios: List[WhatIfScenario]


@router.post(
    "/what-if",
    dependencies=[Depends(require_roles("admin", "project_manager", "risk_analyst", "team_lead"))],
)
def what_if_simulation(
    data: WhatIfRequest,
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Run What-If scenarios: predict risk for each set of overrides."""
    repo_root = _repo_root()
    arts = _ensure_trained(repo_root)
    risk_pipe = arts["risk_pipe"]

    weights = {"Low": 15, "Medium": 45, "High": 75, "Critical": 92}

    results = []
    for scenario in data.scenarios:
        merged = {**data.base_features, **scenario.overrides}
        X_df = pd.DataFrame([{f: merged.get(f) for f in FEATURES}], columns=FEATURES)
        proba = risk_pipe.predict_proba(X_df)[0]
        classes = list(getattr(risk_pipe.named_steps["clf"], "classes_", RISK_CLASSES))
        class_to_p = {c: float(p) for c, p in zip(classes, proba)}
        for c in RISK_CLASSES:
            class_to_p.setdefault(c, 0.0)
        risk_level = max(class_to_p.items(), key=lambda kv: kv[1])[0]
        risk_score = float(np.clip(sum(class_to_p[c] * weights[c] for c in RISK_CLASSES), 0, 100))
        results.append({
            "label": scenario.label,
            "overrides": scenario.overrides,
            "risk_level": risk_level,
            "risk_score": round(risk_score, 2),
            "probabilities": {k: round(v, 4) for k, v in class_to_p.items()},
        })

    # Also compute baseline
    X_base = pd.DataFrame([{f: data.base_features.get(f) for f in FEATURES}], columns=FEATURES)
    base_proba = risk_pipe.predict_proba(X_base)[0]
    base_classes = list(getattr(risk_pipe.named_steps["clf"], "classes_", RISK_CLASSES))
    base_p = {c: float(p) for c, p in zip(base_classes, base_proba)}
    for c in RISK_CLASSES:
        base_p.setdefault(c, 0.0)
    base_risk = float(np.clip(sum(base_p[c] * weights[c] for c in RISK_CLASSES), 0, 100))

    return {
        "baseline": {
            "risk_score": round(base_risk, 2),
            "risk_level": max(base_p.items(), key=lambda kv: kv[1])[0],
        },
        "scenarios": results,
    }


class ForecastRequest(BaseModel):
    features: Dict[str, float]
    months: int = 3


@router.post(
    "/risk-forecast",
    dependencies=[Depends(require_roles("admin", "project_manager", "risk_analyst", "team_lead"))],
)
def risk_forecast(
    data: ForecastRequest,
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Simulate risk score trajectory over N months by progressively degrading risk factors."""
    repo_root = _repo_root()
    arts = _ensure_trained(repo_root)
    risk_pipe = arts["risk_pipe"]
    weights = {"Low": 15, "Medium": 45, "High": 75, "Critical": 92}

    # Monthly degradation rates (simulating natural project drift without intervention)
    drift = {
        "requirement_change_count": 1.5,
        "average_sprint_delay": 0.4,
        "bug_count": 8,
        "code_complexity": 0.3,
        "client_change_requests": 1,
        "testing_coverage": -1.5,
        "task_completion_rate": -1.2,
    }

    timeline = []
    current = dict(data.features)

    for month in range(data.months + 1):
        X_df = pd.DataFrame([{f: current.get(f) for f in FEATURES}], columns=FEATURES)
        proba = risk_pipe.predict_proba(X_df)[0]
        classes = list(getattr(risk_pipe.named_steps["clf"], "classes_", RISK_CLASSES))
        class_to_p = {c: float(p) for c, p in zip(classes, proba)}
        for c in RISK_CLASSES:
            class_to_p.setdefault(c, 0.0)
        risk_score = float(np.clip(sum(class_to_p[c] * weights[c] for c in RISK_CLASSES), 0, 100))
        risk_level = max(class_to_p.items(), key=lambda kv: kv[1])[0]

        timeline.append({
            "month": month,
            "label": "Current" if month == 0 else f"Month {month}",
            "risk_score": round(risk_score, 2),
            "risk_level": risk_level,
            "probabilities": {k: round(v, 4) for k, v in class_to_p.items()},
        })

        # Apply drift for next month
        for feat, delta in drift.items():
            if feat in current:
                current[feat] = float(current[feat]) + delta
                # Clamp
                if feat == "testing_coverage":
                    current[feat] = max(0, min(100, current[feat]))
                elif feat == "task_completion_rate":
                    current[feat] = max(0, min(100, current[feat]))
                elif feat in ("requirement_change_count", "bug_count", "client_change_requests"):
                    current[feat] = max(0, current[feat])

    return {"timeline": timeline}


@router.get(
    "/dataset-stats",
    dependencies=[Depends(require_roles("admin", "project_manager", "risk_analyst", "team_lead"))],
)
def dataset_stats(current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    """Return summary statistics about the training dataset."""
    repo_root = _repo_root()
    return get_dataset_statistics(repo_root)
