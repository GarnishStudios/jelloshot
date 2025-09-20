from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import auth, projects, shotlists, shotlist_items
from app.core.config import settings
from app.db.database import engine
from app.models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Call Sheet API",
    description="Production management platform for creating and managing call sheets",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(shotlists.router, prefix="/api", tags=["Shotlists"])
app.include_router(shotlist_items.router, prefix="/api", tags=["Shotlist Items"])

@app.get("/")
def read_root():
    return {"message": "Call Sheet API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}