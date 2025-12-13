import os
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api.endpoints import projects, shotlists, shotlist_items, clients
from app.core.config import settings
from app.db.database import engine
from sqlalchemy.exc import OperationalError
from sqlalchemy import text
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.api.endpoints import auth
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Check database connection on startup
    try:
        with engine.connect() as conn:
            pass
    except OperationalError:
        print(
            "WARNING: Could not connect to database. Application may not function correctly."
        )

    yield

    # Dispose of the engine on shutdown
    engine.dispose()


# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        return response


app = FastAPI(
    title="Call Sheet API",
    description="Create and manage call sheets",
    version="1.0.0",
    docs_url="/api/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/api/redoc" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan,
)

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET,
    https_only=True,
    same_site="lax",
)

# Auth routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# Application routes
app.include_router(clients.router, prefix="/api/clients", tags=["Clients"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(shotlists.router, prefix="/api", tags=["Shotlists"])
app.include_router(shotlist_items.router, prefix="/api", tags=["Shotlist Items"])

# Mount static assets (JS, CSS, images) - must be before catch-all
app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

# Serve uploaded files
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Catch-all route to serve the SPA for client-side routing
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Try to serve static file if it exists
    static_file = os.path.join(os.getcwd(), "static", full_path)
    if os.path.isfile(static_file):
        return FileResponse(static_file)
    
    # Otherwise serve the SPA index.html for client-side routing
    index_path = os.path.join(os.getcwd(), "static", "index.html")
    return FileResponse(index_path)
