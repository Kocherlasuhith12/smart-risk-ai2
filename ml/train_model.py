"""
Smart AI System for Software Project Risk Prediction and Process Optimisation
Model Training Script (v2) - Advanced pipeline with model selection & aux tasks
"""

import sys
import os
from pathlib import Path

# Add backend to path so we can import the specialized pipeline
repo_root = Path(__file__).resolve().parents[1]
sys.path.append(str(repo_root / "backend"))

try:
    from app.ml.pipeline import train_and_select_best, save_artifacts
    print("✅ Successfully imported advanced pipeline from backend/app/ml")
except ImportError as e:
    print(f"❌ Could not import backend pipeline: {e}")
    print("Ensure you have a 'backend/app/ml/pipeline.py' file.")
    sys.exit(1)

def train_system():
    print("🚀 Starting SmartRisk AI Training Sequence...")
    
    # 1. Ensure dataset exists
    ds_path = repo_root / "ml" / "dataset" / "software_project_risk_data.csv"
    if not ds_path.exists():
        print("⚠️ Dataset not found. Generating...")
        from generate_dataset import generate_dataset
        generate_dataset()

    # 2. Run advanced training & selection
    print("📊 Training multiple candidates (RF, GB, Logistic) and auxiliary tasks...")
    result = train_and_select_best(repo_root)

    # 3. Save artifacts
    print(f"🏆 Best model selected: {result.best_model_name} (F1: {result.metrics['selection_metric']})")
    save_artifacts(repo_root, result.model, result.metrics, result.feature_importance)
    
    # Also save to old models/ directory for backwards compatibility if needed
    import joblib
    old_dir = repo_root / "ml" / "models"
    old_dir.mkdir(exist_ok=True)
    joblib.dump(result.model["risk_pipe"], old_dir / "risk_model.pkl")
    print("✅ Training complete. Artifacts saved to ml/models_v2/ and ml/models/")

if __name__ == "__main__":
    train_system()
