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

# ✅ CORS FIX (IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://smart-risk-ai2.vercel.app",
    ],
    allow_origin_regex=r"https://.*vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ PRE-FLIGHT FIX (VERY IMPORTANT)
@app.options("/{full_path:path}")
async def preflight_handler(full_path: str):
    return {"message": "OK"}

# Routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(predictions.router)
app.include_router(ml.router)

# Startup
@app.on_event("startup")
def startup_event():
    init_db()
    print("✅ Database tables created")

# Routes
@app.get("/")
def root():
    return {"message": "Smart AI Risk Prediction System API", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}