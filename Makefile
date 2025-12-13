# Paths
OPENAPI_JSON=backend/generated/openapi.json
FRONTEND_JSON=frontend/src/type-gen/openapi.json
ORVAL_CONFIG=src/type-gen/orval.config.js

.PHONY: all generate-types openapi copy orval format_backend format_frontend

# Default target
all: generate-types format

# ------------------------
# OpenAPI / Orval pipeline
# ------------------------
generate-types: openapi copy orval
	@echo "=== All OpenAPI/Orval steps finished ==="

openapi:
	@echo "=== Starting OpenAPI JSON generation ==="
	@docker compose -f docker-compose.dev.yml run --rm app python -m scripts.generate_openapi
	@echo "=== Finished generating openapi.json ==="

copy: openapi
	@echo "=== Copying openapi.json to frontend ==="
	@cp $(OPENAPI_JSON) $(FRONTEND_JSON) >/dev/null
	@echo "=== Finished copying openapi.json ==="

orval: copy
	@echo "=== Running Orval to generate API hooks ==="
	@cd frontend && npx orval --config $(ORVAL_CONFIG)
	@echo "=== Orval finished running ==="
	@echo "=== Formatting generated code with Prettier ==="
	@cd frontend && npx prettier --write src/type-gen/
	@echo "=== Finished formatting generated code ==="

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
