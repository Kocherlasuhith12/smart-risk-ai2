"""Pydantic schemas for request/response validation"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "project_manager"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ─── Project ─────────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    project_name: str
    team_size: int
    project_budget: float
    project_duration: int
    requirement_change_count: int
    average_sprint_delay: float
    bug_count: int
    testing_coverage: float
    code_complexity: int
    developer_experience: float
    communication_frequency: int
    task_completion_rate: float
    client_change_requests: int
    previous_project_success_rate: float

class ProjectOut(BaseModel):
    id: int
    project_name: str
    team_size: int
    project_budget: float
    project_duration: int
    requirement_change_count: int
    average_sprint_delay: float
    bug_count: int
    testing_coverage: float
    code_complexity: int
    developer_experience: float
    communication_frequency: int
    task_completion_rate: float
    client_change_requests: int
    previous_project_success_rate: float
    predicted_risk: Optional[str]
    risk_score: Optional[float]
    created_at: datetime
    class Config:
        from_attributes = True


class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    team_size: Optional[int] = None
    project_budget: Optional[float] = None
    project_duration: Optional[int] = None
    requirement_change_count: Optional[int] = None
    average_sprint_delay: Optional[float] = None
    bug_count: Optional[int] = None
    testing_coverage: Optional[float] = None
    code_complexity: Optional[int] = None
    developer_experience: Optional[float] = None
    communication_frequency: Optional[int] = None
    task_completion_rate: Optional[float] = None
    client_change_requests: Optional[int] = None
    previous_project_success_rate: Optional[float] = None


# ─── Prediction ───────────────────────────────────────────────────────────────

class PredictionOut(BaseModel):
    id: int
    project_id: int
    risk_score: float
    risk_level: str
    top_factors: str
    recommendations: str
    predicted_at: datetime
    class Config:
        from_attributes = True

class PredictRequest(BaseModel):
    team_size: int
    project_budget: float
    project_duration: int
    requirement_change_count: int
    average_sprint_delay: float
    bug_count: int
    testing_coverage: float
    code_complexity: int
    developer_experience: float
    communication_frequency: int
    task_completion_rate: float
    client_change_requests: int
    previous_project_success_rate: float
