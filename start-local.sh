#!/bin/bash

# Start Local Development Servers
# This script starts the backend and frontend in separate processes

echo "🚀 Starting JelloShot Local Development..."
echo ""

# Check if database is running
if ! docker-compose ps postgres | grep -q "Up"; then
    echo "📦 Starting PostgreSQL database..."
    docker-compose up -d postgres
    sleep 3
fi

# Start backend in background
echo "🐍 Starting Backend (FastAPI) on http://localhost:8000"
cd backend
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "⚛️  Starting Frontend (React) on http://localhost:5173"
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Servers starting..."
echo ""
echo "📍 Backend API: http://localhost:8000"
echo "📍 Frontend App: http://localhost:5173"
echo "📍 API Docs: http://localhost:8000/api/docs"
echo ""
echo "📝 Logs:"
echo "   Backend: tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop: Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait


