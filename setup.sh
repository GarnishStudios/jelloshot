#!/bin/bash

echo "🎬 Setting up Call Sheet MVP..."

# Create environment files from examples
echo "📝 Creating environment files..."
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Install backend dependencies
echo "🐍 Setting up backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Initialize Alembic
echo "🗄️ Initializing database migrations..."
alembic init alembic
cd ..

# Install frontend dependencies
echo "⚛️ Setting up frontend..."
cd frontend
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. With Docker: docker-compose up"
echo "2. Without Docker:"
echo "   - Start PostgreSQL"
echo "   - Backend: cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "   - Frontend: cd frontend && npm run dev"
echo ""
echo "Access the application at:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/api/docs"