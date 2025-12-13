#!/bin/bash

# Start Local Development Servers
# This script starts the backend, database, and frontend watcher

echo "🚀 Starting JelloShot Local Development..."
echo ""

# Start Docker Compose services in background
echo "🐳 Starting Docker services (PostgreSQL + Backend)..."
docker compose -f docker-compose.dev.yml up -d

# Wait for services to start
echo "⏳ Waiting for services to be ready..."
sleep 5

# Start frontend watch mode
echo "⚛️  Starting Frontend watch mode..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi
npm run watch > ../frontend-watch.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Development environment is running!"
echo ""
echo "📍 Application: http://localhost:8000"
echo "📍 API Docs: http://localhost:8000/api/docs"
echo "📍 Database: localhost:5432"
echo ""
echo "📝 Logs:"
echo "   Docker services: docker compose -f docker-compose.dev.yml logs -f"
echo "   Frontend watch: tail -f frontend-watch.log"
echo ""
echo "🛑 To stop:"
echo "   Frontend: Press Ctrl+C"
echo "   Docker services: docker compose -f docker-compose.dev.yml down"
echo ""

# Wait for user interrupt
trap "kill $FRONTEND_PID 2>/dev/null; docker compose -f docker-compose.dev.yml down; exit" INT TERM
wait


