#!/bin/bash

echo "🔍 Checking Docker installation..."

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    docker --version
else
    echo "❌ Docker is not installed or not in PATH"
    echo "Please make sure Docker Desktop is running"
    exit 1
fi

# Check if Docker daemon is running
if docker info &> /dev/null; then
    echo "✅ Docker daemon is running"
else
    echo "⚠️  Docker is installed but the daemon is not running"
    echo "Please start Docker Desktop from your Applications folder"
    exit 1
fi

# Check Docker Compose
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose (standalone) is available"
    docker-compose --version
fi

# Check Docker Compose plugin
if docker compose version &> /dev/null; then
    echo "✅ Docker Compose (plugin) is available"
    docker compose version
fi

echo ""
echo "🎉 Docker is ready! You can now run:"
echo "   docker-compose up"
echo "   or"
echo "   docker compose up"