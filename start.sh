#!/bin/bash
# Quick start script for SmartRisk AI

echo "🧠 SmartRisk AI - Setup Script"
echo "================================"

# Step 1: Train ML model
echo ""
echo "📊 Step 1: Generating dataset and training ML model..."
cd ml
python3 generate_dataset.py
python3 train_model.py
cd ..

# Step 2: Backend
echo ""
echo "🚀 Step 2: Starting backend..."
cd backend
pip install -r requirements.txt -q
cp .env.example .env 2>/dev/null || true
# Use SQLite for dev
sed -i 's|postgresql://.*|sqlite:///./smartrisk.db|' .env 2>/dev/null || echo "DATABASE_URL=sqlite:///./smartrisk.db" >> .env
# Start backend
uvicorn app.main:app --port 8000 --reload &
BACKEND_PID=$!
cd ..

sleep 3

# Step 3: Frontend
echo ""
echo "🎨 Step 3: Starting frontend..."
cd frontend
npm install -q
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ SmartRisk AI is running!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

wait
