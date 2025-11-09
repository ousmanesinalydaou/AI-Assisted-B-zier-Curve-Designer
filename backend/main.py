"""
FastAPI Backend for AI-Assisted Bézier Curve Designer

This is the main entry point for the backend API server.
"""

from pathlib import Path
from contextlib import asynccontextmanager
import subprocess
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.api.routes import api_router
from app.core.database import init_db, close_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle manager for the application.
    Handles startup and shutdown events.
    """
    # --- Startup ---
    await init_db()
    print(f"🚀 Server starting on {settings.HOST}:{settings.PORT}")
    print(f"📚 Documentation available at http://{settings.HOST}:{settings.PORT}/docs")

    # --- Download ML model from Cloud Storage on startup ---
    print(f"🔍 ML_MODEL_ENABLED: {settings.ML_MODEL_ENABLED}")
    print(f"🔍 K_SERVICE env: {os.getenv('K_SERVICE', 'NOT_SET')}")
    
    if settings.ML_MODEL_ENABLED:
        model_path = Path("./models/control_point_predictor.pth")
        print(f"🔍 Checking model at: {model_path.absolute()}")
        print(f"🔍 Model exists: {model_path.exists()}")
        
        # Try to download model if it doesn't exist (Cloud Run only)
        if not model_path.exists() and os.getenv("K_SERVICE"):
            print("📥 Downloading ML model from Cloud Storage...")
            try:
                bucket_name = "unideb-bezier-models"
                gcs_path = f"gs://{bucket_name}/control_point_predictor.pth"
                
                # Ensure models directory exists
                model_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Download model using gcloud CLI
                result = subprocess.run(
                    ["gcloud", "storage", "cp", gcs_path, str(model_path)],
                    capture_output=True,
                    text=True,
                    check=True,
                )
                print(f"✅ ML model downloaded successfully from Cloud Storage")
                print(f"   Model ready at: {model_path}")
                print(f"   stdout: {result.stdout}")
            except subprocess.CalledProcessError as e:
                print(f"⚠️  Failed to download model: Command returned {e.returncode}")
                print(f"   stdout: {e.stdout}")
                print(f"   stderr: {e.stderr}")
            except Exception as e:
                print(f"⚠️  Failed to download model from Cloud Storage: {e}")
        elif model_path.exists():
            print(f"✅ ML model already exists at {model_path}")
        else:
            print(f"ℹ️  Not in Cloud Run environment, skipping model download")

    # Yield to application runtime
    yield

    # --- Shutdown ---
    await close_db()
    print("👋 Server shutting down")


# --- Create FastAPI application ---
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# --- CORS Middleware ---
# Allow all origins for Cloud Run deployment
# In production, you should restrict this to your specific frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when allow_origins is ["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Root endpoint ---
@app.get("/")
async def root():
    """Redirect to API documentation"""
    return RedirectResponse(url="/docs")


# --- Health check endpoint ---
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


# --- Include API routes ---
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )
