# Paths
OPENAPI_JSON=backend/generated/openapi.json
FRONTEND_JSON=frontend/src/type-gen/openapi.json
ORVAL_CONFIG=frontend/src/type-gen/orval.config.js
ORVAL_OUTPUT=frontend/src/type-gen/api.ts

# Source files that affect OpenAPI generation
BACKEND_SOURCES := $(shell find backend/app -name '*.py' -type f 2>/dev/null)
BACKEND_SOURCES += backend/main.py

.PHONY: all generate-types format_backend format_frontend format

# Default target
all: generate-types format

# ------------------------
# OpenAPI / Orval pipeline
# ------------------------
generate-types: $(ORVAL_OUTPUT)
	@echo "=== All OpenAPI/Orval steps finished ==="

$(OPENAPI_JSON): $(BACKEND_SOURCES)
	@echo "=== Starting OpenAPI JSON generation ==="
	@docker compose -f docker-compose.dev.yml run --rm app python -m scripts.generate_openapi
	@echo "=== Finished generating openapi.json ==="

$(FRONTEND_JSON): $(OPENAPI_JSON)
	@echo "=== Copying openapi.json to frontend ==="
	@cp $(OPENAPI_JSON) $(FRONTEND_JSON) >/dev/null
	@echo "=== Finished copying openapi.json ==="

$(ORVAL_OUTPUT): $(FRONTEND_JSON) $(ORVAL_CONFIG)
	@echo "=== Running Orval to generate API hooks ==="
	@cd frontend && npx orval --config src/type-gen/orval.config.js
	@echo "=== Orval finished running ==="

# ------------------------
# Formatting steps
# ------------------------
format: format_backend format_frontend
	@echo "=== All formatting steps finished ==="

format_backend:
	@echo "=== Running Black formatter inside Docker ==="
	@docker compose -f docker-compose.dev.yml run --rm app black .
	@git add .
	@echo "=== Finished Black formatting ==="

format_frontend:
	@echo "=== Running Prettier on frontend ==="
	@cd frontend && npx prettier --write .
	@git add frontend
	@echo "=== Finished Prettier formatting ==="
