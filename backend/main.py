from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.endpoints import auth, projects, shotlists, shotlist_items, clients
from app.core.config import settings
from app.db.database import engine
from app.models import Base
from sqlalchemy.exc import OperationalError
import os

# Try to create tables, but don't fail if database isn't available
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Database connection successful")
except OperationalError as e:
    print(f"⚠️  Warning: Could not connect to database: {e}")
    print("   The API will still start, but database operations will fail until PostgreSQL is running.")

app = FastAPI(
    title="Call Sheet API",
    description="Production management platform for creating and managing call sheets",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

print(f"🌐 CORS Origins loaded: {settings.CORS_ORIGINS}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create static directory if it doesn't exist
os.makedirs("static/uploads", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
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