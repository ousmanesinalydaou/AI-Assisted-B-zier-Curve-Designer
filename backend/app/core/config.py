"""
Application Configuration

Centralized configuration management using Pydantic Settings.
Loads environment variables from .env file.
"""
from typing import List
from pydantic_settings import BaseSettings
from pydantic import validator
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Project Info
    PROJECT_NAME: str = "AI-Assisted Bézier Curve Designer API"
    PROJECT_DESCRIPTION: str = "Backend API for interactive Bézier curve design with ML-assisted fitting"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
    ]
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v
    
    # Database Configuration
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "bezier_designer"
    
    # ML Model Configuration
    ML_MODEL_PATH: str = "./models/control_point_predictor.pth"
    ML_MODEL_ENABLED: bool = True
    
    # Curve Fitting Parameters
    DEFAULT_MAX_ITERATIONS: int = 20
    DEFAULT_TOLERANCE: float = 0.001
    DEFAULT_REGULARIZATION: float = 1e-6
    
    # Security (for future authentication)
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
