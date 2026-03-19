"""Prediction routes - calls ML model and recommendation engine"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from app.models.database import get_db, Project, Prediction, User
from app.schemas.schemas import PredictRequest, PredictionOut
from app.utils.auth import get_current_user, require_roles
from app.services.prediction_service import predict_risk, FEATURES
from app.services.recommendation_service import get_recommendations

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.post(
    "/predict/{project_id}",
    dependencies=[Depends(require_roles("admin", "project_manager", "team_lead"))],
)
def predict_project_risk(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    features = {f: getattr(project, f) for f in FEATURES}
    result = predict_risk(features)
    recommendations = get_recommendations(features, result["risk_level"])

    prediction = Prediction(
        project_id=project_id,
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        top_factors=json.dumps(result["top_factors"]),
        recommendations=json.dumps(recommendations)
    )
    db.add(prediction)

    project.predicted_risk = result["risk_level"]
    project.risk_score = result["risk_score"]
    db.commit()
    db.refresh(prediction)

    return {
        "risk_level": result["risk_level"],
        "risk_score": result["risk_score"],
        "probabilities": result["probabilities"],
        "top_factors": result["top_factors"],
        "recommendations": recommendations
    }


@router.post(
    "/predict-instant",
    dependencies=[Depends(require_roles("admin", "project_manager", "risk_analyst", "team_lead"))],
)
def predict_instant(
    data: PredictRequest,
    current_user: User = Depends(get_current_user),
):
    """Predict without saving to DB — for quick what-if analysis"""
    features = data.model_dump()
    result = predict_risk(features)
    recommendations = get_recommendations(features, result["risk_level"])
    return {
        "risk_level": result["risk_level"],
        "risk_score": result["risk_score"],
        "probabilities": result["probabilities"],
        "top_factors": result["top_factors"],
        "recommendations": recommendations
    }


@router.get(
    "/history/{project_id}",
    response_model=List[PredictionOut],
    dependencies=[Depends(require_roles("admin", "project_manager", "risk_analyst", "team_lead"))],
)
def prediction_history(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Prediction).filter(Prediction.project_id == project_id).order_by(Prediction.predicted_at.desc()).all()


@router.get(
    "/summary/all",
    dependencies=[Depends(require_roles("admin", "project_manager", "risk_analyst", "team_lead"))],
)
def summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Dashboard summary stats"""
    if current_user.role == "admin":
        projects = db.query(Project).all()
    else:
        projects = db.query(Project).filter(Project.owner_id == current_user.id).all()

    total = len(projects)
    high = sum(1 for p in projects if p.predicted_risk == "High")
    medium = sum(1 for p in projects if p.predicted_risk == "Medium")
    low = sum(1 for p in projects if p.predicted_risk == "Low")
    unpredicted = sum(1 for p in projects if not p.predicted_risk)

    return {
        "total_projects": total,
        "high_risk": high,
        "medium_risk": medium,
        "low_risk": low,
        "unpredicted": unpredicted
    }
