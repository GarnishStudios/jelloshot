#!/bin/bash

# Alembic Database Migration Script for Production (Supabase)
# Uses uv to run alembic without requiring local Python/pip installation

set -e

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "❌ uv is not installed. Install it with:"
    echo "   brew install uv"
    exit 1
fi

# Prompt for DATABASE_URL
echo "🔐 Enter your Supabase DATABASE_URL:"
echo "   (e.g., postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres)"
read -s DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL cannot be empty"
    exit 1
fi

echo ""
echo "⬆️  Running migrations (upgrade to head)..."

cd "$(dirname "$0")/backend"

DATABASE_URL="$DATABASE_URL" uv run \
    --with alembic \
    --with psycopg2-binary \
    --with sqlalchemy \
    --with pydantic \
    --with pydantic-settings \
    alembic upgrade head

echo "✅ Done!"

