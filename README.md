# 🧠 Smart AI System for Software Project Risk Prediction and Process Optimisation

> An end-to-end AI-powered web application that predicts software project risk levels, identifies key risk factors, and recommends actionable process improvements.

---

## 📋 Project Overview

| Item | Detail |
|------|--------|
| **Project Title** | Smart AI System for Software Project Risk Prediction and Process Optimisation |
| **Type** | Final Year / Academic Project |
| **Domain** | AI/ML + Full Stack Web Development |
| **Tech Stack** | React + FastAPI + PostgreSQL + Scikit-learn |
| **Model** | Random Forest Classifier (82.5% accuracy) |

---

## 🚀 Features

- 🔐 **User Authentication** — JWT-based login/register with role-based access (Admin, Manager, Analyst)
- 📋 **Project Management** — Add, view, and delete software projects with 13 input parameters
- 🤖 **AI Risk Prediction** — Random Forest model predicts Low / Medium / High risk
- 📊 **Risk Score** — Numeric score from 0–10 with probability breakdown
- 🔍 **Explainability** — Top risk factors shown with feature importance charts
- 💡 **Recommendation Engine** — Rule-based process optimisation suggestions
- 📈 **Dashboard** — Overview charts, risk distribution, project summary
- 📂 **Reports** — Analytics across all projects with trend charts
- 🗂️ **History** — Track all past predictions

---

## 🗂️ Project Structure

```
smart-risk-ai/
├── frontend/              # React + Vite + Tailwind CSS
│   └── src/
│       ├── pages/         # Login, Register, Dashboard, Projects, Reports, History
│       ├── components/    # Sidebar, Layout, RiskBadge, StatCard
│       ├── context/       # AuthContext (JWT state)
│       └── services/      # Axios API client
│
├── backend/               # FastAPI Python backend
│   └── app/
│       ├── routes/        # auth.py, projects.py, predictions.py
│       ├── models/        # SQLAlchemy database models
│       ├── schemas/       # Pydantic validation schemas
│       ├── services/      # prediction_service.py, recommendation_service.py
│       └── utils/         # JWT auth utilities
│
├── ml/                    # Machine Learning pipeline
│   ├── dataset/           # software_project_risk_data.csv (800 rows)
│   ├── models/            # Trained model artifacts (.pkl, .json)
│   ├── generate_dataset.py
│   └── train_model.py
│
└── docker-compose.yml     # One-command deployment
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (or SQLite for development)
- Git

---

### 1. Clone the repository
```bash
git clone https://github.com/your-username/smart-risk-ai.git
cd smart-risk-ai
```

### 2. Train the ML Model
```bash
cd ml
pip install pandas numpy scikit-learn joblib
python generate_dataset.py   # Creates 800-row synthetic dataset
python train_model.py        # Trains Random Forest, saves model
cd ..
```

### 3. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

uvicorn app.main:app --reload --port 8000
```

> **Note:** For quick development, the backend uses SQLite by default (no PostgreSQL needed).
> Set `DATABASE_URL=sqlite:///./smartrisk.db` in your `.env`.

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 🐳 Docker (One-Command Setup)
```bash
docker-compose up --build
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🤖 ML Model Details

| Item | Detail |
|------|--------|
| **Algorithm** | Random Forest Classifier |
| **Dataset** | 800 synthetic project records |
| **Features** | 13 project attributes |
| **Target** | Low / Medium / High risk |
| **Accuracy** | 82.5% |
| **Evaluation** | Precision, Recall, F1-Score |

### Input Features
| Feature | Description |
|---------|-------------|
| team_size | Number of developers |
| project_budget | Total budget in USD |
| project_duration | Duration in months |
| requirement_change_count | # of requirement changes |
| average_sprint_delay | Average delay per sprint (days) |
| bug_count | Total bugs reported |
| testing_coverage | % of code covered by tests |
| code_complexity | Complexity score (1–10) |
| developer_experience | Average team experience (years) |
| communication_frequency | Stand-up meetings per week |
| task_completion_rate | % of tasks completed on time |
| client_change_requests | # of client change requests |
| previous_project_success_rate | Past project success rate (%) |

### Top Risk Factors (by Importance)
1. Requirement Change Count — 19.8%
2. Average Sprint Delay — 16.4%
3. Testing Coverage — 14.9%
4. Bug Count — 9.7%
5. Task Completion Rate — 8.9%

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get JWT token |
| GET | `/projects/` | List all projects |
| POST | `/projects/` | Create new project |
| GET | `/projects/{id}` | Get project details |
| DELETE | `/projects/{id}` | Delete a project |
| POST | `/predictions/predict/{id}` | Run AI risk analysis |
| POST | `/predictions/predict-instant` | Predict without saving |
| GET | `/predictions/history/{id}` | Get prediction history |
| GET | `/predictions/summary/all` | Dashboard summary stats |

API Docs (Swagger UI): `http://localhost:8000/docs`

---

## 💡 Recommendation Engine Rules

| Risk Factor | Recommendation |
|------------|---------------|
| High requirement changes | Freeze requirements, formal change process |
| Sprint delays > 3 days | Improve sprint planning, use story points |
| Testing coverage < 60% | Add TDD, increase unit tests |
| Bug count > 50 | Add code reviews, static analysis |
| Low developer experience | Mentoring, training allocation |
| Low communication frequency | More stand-ups, collaboration tools |
| Low task completion | Reassess workload, remove blockers |
| High client changes | Change control board, alignment meetings |
| High code complexity | Refactoring, SOLID principles |

---

## 👨‍💻 Team

Built by: [Your Name]
College: [Your College]
Year: 2024–2025
Guide: [Your Project Guide]

---

## 📄 License

MIT License — Free to use for academic purposes.
