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
	@docker-compose run --rm backend python -m scripts.generate_openapi >/dev/null 2>&1
	@echo "=== Finished generating openapi.json ==="

copy: openapi
	@echo "=== Copying openapi.json to frontend ==="
	@cp $(OPENAPI_JSON) $(FRONTEND_JSON) >/dev/null 2>&1
	@echo "=== Finished copying openapi.json ==="

orval: copy
	@echo "=== Running Orval to generate API hooks ==="
	@docker-compose run --rm frontend npx orval --config $(ORVAL_CONFIG) >/dev/null 2>&1
	@echo "=== Orval finished running ==="

# ------------------------
# Formatting steps
# ------------------------
format: format_backend format_frontend
	@echo "=== All formatting steps finished ==="

format_backend:
	@echo "=== Running Black formatter inside Docker ==="
	@docker-compose run --rm backend black . >/dev/null 2>&1
	@git add .
	@echo "=== Finished Black formatting ==="

format_frontend:
	@echo "=== Running Prettier on frontend ==="
	@docker-compose run --rm frontend npx prettier --write . >/dev/null 2>&1
	@git add frontend
	@echo "=== Finished Prettier formatting ==="
