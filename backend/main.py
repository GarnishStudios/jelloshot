import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api.endpoints import projects, shotlists, shotlist_items, clients
from app.core.config import settings
from app.db.database import engine
from sqlalchemy.exc import OperationalError
from sqlalchemy import text
from starlette.middleware.sessions import SessionMiddleware
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


app = FastAPI(
    title="Call Sheet API",
    description="Create and manage call sheets",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET,
    https_only=True,
    same_site="lax",
)

# Auth routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# User routes (optional, if we want /me to be under /api/users/me, but auth router handles /me)
# app.include_router(users.router, prefix="/api/users", tags=["users"])

# Existing application routes
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
    # Serve static files from the dist root (like vite.svg)
    static_file = os.path.join(os.getcwd(), "static", full_path)
    if os.path.isfile(static_file) and not full_path.startswith("api"):
        return FileResponse(static_file)
    
    # Otherwise serve the SPA index.html for client-side routing
    index_path = os.path.join(os.getcwd(), "static", "index.html")
    return FileResponse(index_path)
