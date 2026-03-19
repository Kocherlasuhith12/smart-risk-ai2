"""
Database connection and table definitions
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./smartrisk.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="project_manager")  # admin / project_manager / risk_analyst / team_lead
    created_at = Column(DateTime, default=datetime.utcnow)
    projects = relationship("Project", back_populates="owner")


class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String(200), nullable=False)
    team_size = Column(Integer)
    project_budget = Column(Float)
    project_duration = Column(Integer)
    requirement_change_count = Column(Integer)
    average_sprint_delay = Column(Float)
    bug_count = Column(Integer)
    testing_coverage = Column(Float)
    code_complexity = Column(Integer)
    developer_experience = Column(Float)
    communication_frequency = Column(Integer)
    task_completion_rate = Column(Float)
    client_change_requests = Column(Integer)
    previous_project_success_rate = Column(Float)
    predicted_risk = Column(String(20))
    risk_score = Column(Float)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    owner = relationship("User", back_populates="projects")
    predictions = relationship("Prediction", back_populates="project")


class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    risk_score = Column(Float)
    risk_level = Column(String(20))
    top_factors = Column(Text)
    recommendations = Column(Text)
    predicted_at = Column(DateTime, default=datetime.utcnow)
    project = relationship("Project", back_populates="predictions")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
