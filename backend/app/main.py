"""
Smart AI System for Software Project Risk Prediction and Process Optimisation
FastAPI Backend Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.database import init_db
from app.routes import auth, projects, predictions
from app.routes import ml

app = FastAPI(
    title="Smart AI Risk Prediction System",
    description="AI-driven software project risk prediction and process optimisation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Request
from fastapi.responses import JSONResponse
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    tb = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
    return JSONResponse(
        status_code=500,
        headers={"Access-Control-Allow-Origin": "*"},
        content={
            "detail": str(exc),
            "traceback": tb
        }
    )

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(predictions.router)
app.include_router(ml.router)

@app.on_event("startup")
def startup_event():
    init_db()
    print("✅ Database tables created")

@app.get("/")
def root():
    return {"message": "Smart AI Risk Prediction System API", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}

from fastapi import Depends
from sqlalchemy.orm import Session

@app.get("/debug-db")
def debug_db(db: Session = Depends(get_db)):
    import os
    db_url = os.getenv("DATABASE_URL", "sqlite:///./smartrisk.db")
    censored_url = db_url
    if "@" in db_url:
        censored_url = db_url.split("@")[-1]
    
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        status = "connected"
    except Exception as e:
        status = f"error: {str(e)}"
        
    return {
        "database_url_host": censored_url,
        "connectivity": status
    }