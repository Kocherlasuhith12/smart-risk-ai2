<div align="center">

<img src="https://img.shields.io/badge/AI%20Powered-Risk%20Prediction-blue?style=for-the-badge&logo=brain&logoColor=white" />

# 🧠 SmartRisk AI
### Software Project Risk Prediction & Process Optimisation

*An end-to-end AI-powered platform that predicts project risk, explains key failure drivers, and recommends actionable process improvements — built with a production-grade full-stack architecture.*

<br/>

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Scikit-learn](https://img.shields.io/badge/Scikit--learn-1.3+-F7931E?style=flat-square&logo=scikitlearn&logoColor=white)](https://scikit-learn.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<br/>

[Features](#-features) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [ML Model](#-ml-model) · [API Reference](#-api-reference) · [Screenshots](#-screenshots)

</div>

---

## 🎯 What is SmartRisk AI?

SmartRisk AI is a full-stack intelligent decision-support system for software engineering teams. It ingests 13 project health metrics, runs a trained **Random Forest classifier (82.5% accuracy)**, and returns a risk level, a numeric risk score, top contributing factors, and tailored process improvement recommendations — all through a clean, role-based web dashboard.

> Built as a Final Year Project in AI/ML + Full Stack Web Development.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **JWT Authentication** | Secure login/register with role-based access (Admin, Manager, Analyst) |
| 📋 **Project Management** | Create, view, and manage software projects with 13 input parameters |
| 🤖 **AI Risk Prediction** | Random Forest model classifies projects as Low / Medium / High risk |
| 📊 **Risk Scoring** | Numeric risk score (0–10) with per-class probability breakdown |
| 🔍 **Explainability** | Top risk factors displayed with feature importance visualisation |
| 💡 **Recommendation Engine** | Rule-based process optimisation suggestions per risk factor |
| 📈 **Analytics Dashboard** | Risk distribution charts, project summaries, trend analysis |
| 🗂️ **Prediction History** | Full audit trail of all past predictions |
| 🐳 **Docker Support** | One-command deployment with Docker Compose |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│         React + Vite + Tailwind CSS + Recharts             │
│   (Dashboard · Projects · Reports · History · Auth)        │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (Axios)
┌──────────────────────▼──────────────────────────────────────┐
│                        BACKEND                              │
│              FastAPI + SQLAlchemy + JWT Auth               │
│   routes/: auth · projects · predictions                   │
│   services/: prediction_service · recommendation_service   │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
┌──────────────▼────────┐   ┌─────────────▼──────────────────┐
│      DATABASE         │   │          ML MODEL              │
│  PostgreSQL / SQLite  │   │  Random Forest (.pkl)          │
│  (Projects · Users ·  │   │  Feature Scaler (.pkl)         │
│   Predictions)        │   │  Feature Metadata (.json)      │
└───────────────────────┘   └────────────────────────────────┘
```

### Project Structure

```
smart-risk-ai/
├── frontend/                   # React + Vite + Tailwind CSS
│   └── src/
│       ├── pages/              # Login, Register, Dashboard, Projects, Reports, History
│       ├── components/         # Sidebar, Layout, RiskBadge, StatCard
│       ├── context/            # AuthContext (JWT state management)
│       └── services/           # Axios API client
│
├── backend/                    # FastAPI Python backend
│   └── app/
│       ├── routes/             # auth.py, projects.py, predictions.py
│       ├── models/             # SQLAlchemy ORM models
│       ├── schemas/            # Pydantic request/response schemas
│       ├── services/           # prediction_service.py, recommendation_service.py
│       └── utils/              # JWT authentication utilities
│
├── ml/                         # Machine Learning pipeline
│   ├── dataset/                # software_project_risk_data.csv (800 rows)
│   ├── models/                 # Trained artifacts (.pkl, .json)
│   ├── generate_dataset.py     # Synthetic data generator
│   └── train_model.py          # Model training + evaluation script
│
└── docker-compose.yml          # One-command full stack deployment
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL *(or SQLite for local dev — zero config needed)*
- Git

---

### Option 1 — Docker (Recommended)

```bash
git clone https://github.com/your-username/smart-risk-ai.git
cd smart-risk-ai
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |

---

### Option 2 — Manual Setup

**Step 1 — Clone the repo**
```bash
git clone https://github.com/your-username/smart-risk-ai.git
cd smart-risk-ai
```

**Step 2 — Train the ML model**
```bash
cd ml
pip install pandas numpy scikit-learn joblib
python generate_dataset.py    # Generates 800-row synthetic dataset
python train_model.py         # Trains Random Forest, saves model artifacts
cd ..
```

**Step 3 — Run the backend**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env          # Edit with your DB credentials
                               # For SQLite: DATABASE_URL=sqlite:///./smartrisk.db
uvicorn app.main:app --reload --port 8000
```

**Step 4 — Run the frontend**
```bash
cd frontend
npm install
npm run dev
```

> Open **http://localhost:5173** in your browser.

---

## 🤖 ML Model

### Overview

| Property | Value |
|---|---|
| Algorithm | Random Forest Classifier |
| Training Data | 800 synthetic project records |
| Input Features | 13 project health attributes |
| Target Classes | Low / Medium / High Risk |
| Accuracy | **82.5%** |
| Evaluation Metrics | Precision · Recall · F1-Score |

### Input Features

| Feature | Description |
|---|---|
| `team_size` | Number of developers on the project |
| `project_budget` | Total budget in USD |
| `project_duration` | Duration in months |
| `requirement_change_count` | Number of requirement changes |
| `average_sprint_delay` | Average delay per sprint (days) |
| `bug_count` | Total bugs reported |
| `testing_coverage` | Percentage of code covered by tests |
| `code_complexity` | Complexity score (1–10) |
| `developer_experience` | Average team experience in years |
| `communication_frequency` | Stand-up meetings per week |
| `task_completion_rate` | Percentage of tasks completed on time |
| `client_change_requests` | Number of client change requests |
| `previous_project_success_rate` | Historical project success rate (%) |

### Top Risk Factors by Importance

```
Requirement Change Count    ████████████████████  19.8%
Average Sprint Delay        ████████████████      16.4%
Testing Coverage            ██████████████        14.9%
Bug Count                   █████████              9.7%
Task Completion Rate        ████████               8.9%
```

---

## 💡 Recommendation Engine

The rule-based engine maps high-risk indicators to actionable process improvements:

| Risk Signal | Recommendation |
|---|---|
| High requirement changes | Freeze requirements; implement a formal change control process |
| Sprint delays > 3 days | Improve sprint planning; adopt story point estimation |
| Testing coverage < 60% | Adopt TDD; increase unit and integration test coverage |
| Bug count > 50 | Enforce code reviews; add static analysis tooling |
| Low developer experience | Allocate mentoring time; structured onboarding |
| Low communication frequency | Increase stand-up cadence; adopt async collaboration tools |
| Low task completion rate | Reassess workload; identify and remove blockers |
| High client change requests | Establish a change control board; regular alignment meetings |
| High code complexity | Schedule refactoring sprints; enforce SOLID principles |

---

## 🔗 API Reference

All endpoints are documented interactively at **`/docs`** (Swagger UI).

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Authenticate and receive JWT |
| `GET` | `/projects/` | List all projects |
| `POST` | `/projects/` | Create a new project |
| `GET` | `/projects/{id}` | Fetch project details |
| `DELETE` | `/projects/{id}` | Delete a project |
| `POST` | `/predictions/predict/{id}` | Run AI risk analysis on saved project |
| `POST` | `/predictions/predict-instant` | Run prediction without saving |
| `GET` | `/predictions/history/{id}` | Retrieve prediction history |
| `GET` | `/predictions/summary/all` | Fetch dashboard summary statistics |

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Recharts (data visualisation)
- Axios (HTTP client)

**Backend**
- FastAPI (Python)
- SQLAlchemy ORM
- Pydantic (validation)
- JWT (python-jose)

**Machine Learning**
- Scikit-learn (Random Forest)
- NumPy + Pandas
- Joblib (model serialisation)

**Infrastructure**
- PostgreSQL / SQLite
- Docker + Docker Compose

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free to use for academic and personal purposes.

---

<div align="center">

*If this project helped you, consider giving it a ⭐*

</div>
