# ========= FRONTEND BUILD =========
FROM node:18 AS frontend
WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build


# ========= BACKEND IMAGE =========
FROM python:3.13-slim AS backend
WORKDIR /backend

# Install OS deps for psycopg/postgres
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Install backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ .

# Copy frontend build into backend/client-bundle
COPY --from=frontend /frontend/dist ./client-bundle

EXPOSE 8000