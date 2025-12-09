from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.endpoints import projects, shotlists, shotlist_items, clients
from app.core.config import settings
from app.db.database import engine
from sqlalchemy.exc import OperationalError
from sqlalchemy import text
import os

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Check database connection on startup
    try:
        with engine.connect() as conn:
            pass
    except OperationalError:
        print("WARNING: Could not connect to database. Application may not function correctly.")
    
    yield
    
    # Dispose of the engine on shutdown
    engine.dispose()

app = FastAPI(
    title="Call Sheet API",
    description="Production management platform for creating and managing call sheets",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

print(f"🌐 CORS Origins loaded: {settings.CORS_ORIGINS}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # Specific origins required for credentials
    allow_credentials=True,  # Required for cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create static directory if it doesn't exist
os.makedirs("static/uploads", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

from starlette.middleware.sessions import SessionMiddleware
from app.api.endpoints import auth

# ... imports ...

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET,
    https_only=False,  # Set to True in production
    same_site="lax"
)

# ... cors middleware ...

# Auth routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# User routes (optional, if we want /me to be under /api/users/me, but auth router handles /me)
# app.include_router(users.router, prefix="/api/users", tags=["users"])

# Existing application routes
app.include_router(clients.router, prefix="/api/clients", tags=["Clients"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(shotlists.router, prefix="/api", tags=["Shotlists"])
app.include_router(shotlist_items.router, prefix="/api", tags=["Shotlist Items"])

@app.get("/")
def read_root():
    return {"message": "Call Sheet API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}