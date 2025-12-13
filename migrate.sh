#!/bin/bash

# Alembic Database Migration Script
# Runs migrations using a temporary Docker container

set -e

# Ensure database is running
if ! docker compose -f docker-compose.dev.yml ps postgres 2>/dev/null | grep -q "Up"; then
    echo "🐘 Starting PostgreSQL..."
    docker compose -f docker-compose.dev.yml up -d postgres
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 3
fi

# Parse command
COMMAND=${1:-upgrade}
ARG=${2:-head}

# Build the alembic command
case $COMMAND in
    upgrade|up)
        echo "⬆️  Running migrations (upgrade to ${ARG})..."
        ALEMBIC_CMD="alembic upgrade $ARG"
        ;;
    downgrade|down)
        echo "⬇️  Rolling back migrations (downgrade to ${ARG})..."
        ALEMBIC_CMD="alembic downgrade $ARG"
        ;;
    current)
        echo "📍 Current migration:"
        ALEMBIC_CMD="alembic current"
        ;;
    history)
        echo "📜 Migration history:"
        ALEMBIC_CMD="alembic history --verbose"
        ;;
    heads)
        echo "📍 Current heads:"
        ALEMBIC_CMD="alembic heads"
        ;;
    revision)
        if [ -z "$2" ]; then
            echo "❌ Error: Please provide a migration message"
            echo "Usage: ./migrate.sh revision \"your migration message\""
            exit 1
        fi
        echo "📝 Creating new migration: ${ARG}"
        ALEMBIC_CMD="alembic revision --autogenerate -m \"$ARG\""
        ;;
    help|--help|-h)
        echo "Usage: ./migrate.sh [command] [argument]"
        echo ""
        echo "Commands:"
        echo "  upgrade [revision]    Apply migrations (default: head)"
        echo "  up [revision]         Alias for upgrade"
        echo "  downgrade [revision]  Rollback migrations (default: -1)"
        echo "  down [revision]       Alias for downgrade"
        echo "  current              Show current migration revision"
        echo "  history              Show migration history"
        echo "  heads                Show current heads"
        echo "  revision \"message\"    Create a new migration"
        echo "  help                 Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./migrate.sh                    # Upgrade to latest (head)"
        echo "  ./migrate.sh upgrade head       # Same as above"
        echo "  ./migrate.sh down -1            # Rollback one migration"
        echo "  ./migrate.sh current            # Show current revision"
        echo "  ./migrate.sh revision \"add users table\"  # Create new migration"
        exit 0
        ;;
    *)
        echo "❌ Unknown command: $COMMAND"
        echo "Run './migrate.sh help' for usage information"
        exit 1
        ;;
esac

# Run alembic in a temporary container
docker run --rm \
    --network jelloshot_callsheet_network \
    -v "$(pwd)/backend:/backend" \
    -w /backend \
    -e DATABASE_URL=postgresql://postgres:postgres@postgres:5432/callsheet \
    python:3.13-slim \
    bash -c "pip install -q alembic psycopg2-binary sqlalchemy pydantic pydantic-settings && $ALEMBIC_CMD"

echo "✅ Done!"
