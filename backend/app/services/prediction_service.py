"""
ML Prediction Service
Loads trained model and makes risk predictions with explanations
"""

import joblib
import numpy as np
import json
from pathlib import Path

# prediction_service.py lives at: backend/app/services/prediction_service.py
# Repo root is 3 parents up from backend/: .../smart-risk-ai
REPO_ROOT = Path(__file__).resolve().parents[3]
ML_DIR = REPO_ROOT / "ml" / "models"

# Lazy-load model artifacts
_model = None
_scaler = None
_le = None
_metadata = None

FEATURES = [
    "team_size", "project_budget", "project_duration",
    "requirement_change_count", "average_sprint_delay",
    "bug_count", "testing_coverage", "code_complexity",
    "developer_experience", "communication_frequency",
    "task_completion_rate", "client_change_requests",
    "previous_project_success_rate"
]

FEATURE_LABELS = {
    "requirement_change_count": "Frequent Requirement Changes",
    "average_sprint_delay": "High Sprint Delays",
    "testing_coverage": "Low Testing Coverage",
    "bug_count": "High Bug Count",
    "task_completion_rate": "Low Task Completion Rate",
    "code_complexity": "High Code Complexity",
    "developer_experience": "Low Developer Experience",
    "client_change_requests": "Many Client Change Requests",
    "previous_project_success_rate": "Low Past Success Rate",
    "communication_frequency": "Poor Communication Frequency",
    "team_size": "Team Size",
    "project_budget": "Project Budget",
    "project_duration": "Project Duration"
}


def _load():
    global _model, _scaler, _le, _metadata
    if _model is None:
        # If model artifacts are missing, train them from the bundled dataset.
        required = ["risk_model.pkl", "scaler.pkl", "label_encoder.pkl", "model_metadata.json"]
        missing = [f for f in required if not (ML_DIR / f).exists()]
        if missing:
            _train_and_save()
        _model = joblib.load(ML_DIR / "risk_model.pkl")
        _scaler = joblib.load(ML_DIR / "scaler.pkl")
        _le = joblib.load(ML_DIR / "label_encoder.pkl")
        with open(ML_DIR / "model_metadata.json") as f:
            _metadata = json.load(f)


def _train_and_save():
    """
    Train the ML model from the bundled dataset and write artifacts into ml/models/.
    This keeps the project runnable even if pkls weren't shipped.
    """
    import pandas as pd
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import LabelEncoder, StandardScaler
    from sklearn.metrics import accuracy_score

    dataset_path = REPO_ROOT / "ml" / "dataset" / "software_project_risk_data.csv"
    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset not found at {dataset_path}")

    df = pd.read_csv(dataset_path)
    X = df[FEATURES]
    y = df["risk_level"]

    le = LabelEncoder()
    le.fit(["Low", "Medium", "High"])
    y_encoded = le.transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = RandomForestClassifier(
        n_estimators=250,
        max_depth=16,
        min_samples_split=5,
        random_state=42,
        class_weight="balanced",
    )
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    acc = float(accuracy_score(y_test, y_pred))

    importances = dict(zip(FEATURES, model.feature_importances_.tolist()))
    importances = dict(sorted(importances.items(), key=lambda x: x[1], reverse=True))

    ML_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, ML_DIR / "risk_model.pkl")
    joblib.dump(scaler, ML_DIR / "scaler.pkl")
    joblib.dump(le, ML_DIR / "label_encoder.pkl")

    metadata = {
        "features": FEATURES,
        "classes": le.classes_.tolist(),
        "accuracy": round(acc, 4),
        "feature_importances": importances,
    }
    with open(ML_DIR / "model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)


def predict_risk(features: dict) -> dict:
    _load()

    # Build feature vector
    X = np.array([[features[f] for f in FEATURES]])
    X_scaled = _scaler.transform(X)

    proba = _model.predict_proba(X_scaled)[0]
    pred_idx = np.argmax(proba)
    risk_level = _le.inverse_transform([pred_idx])[0]

    # Risk score (0-10 scale)
    class_order = _le.classes_.tolist()  # ['High', 'Low', 'Medium']
    high_idx = class_order.index("High")
    med_idx = class_order.index("Medium")
    low_idx = class_order.index("Low")

    risk_score = round(
        proba[high_idx] * 10 + proba[med_idx] * 5 + proba[low_idx] * 1,
        2
    )

    # Feature importances from model
    importances = _metadata["feature_importances"]
    sorted_feats = sorted(importances.items(), key=lambda x: x[1], reverse=True)

    # Identify top contributing factors based on feature value + importance
    top_factors = []
    for feat, imp in sorted_feats[:6]:
        val = features.get(feat, 0)
        label = FEATURE_LABELS.get(feat, feat)
        top_factors.append({"feature": feat, "label": label, "importance": round(imp, 4), "value": val})

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "probabilities": {
            "High": round(float(proba[high_idx]), 4),
            "Medium": round(float(proba[med_idx]), 4),
            "Low": round(float(proba[low_idx]), 4),
        },
        "top_factors": top_factors,
    }
