"""
Main API Router

Combines all endpoint routers.
"""
from fastapi import APIRouter

from app.api.endpoints import curves, projects, ml

api_router = APIRouter()

# Include sub-routers
api_router.include_router(curves.router, prefix="/curves", tags=["Curve Fitting"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(ml.router, prefix="/ml", tags=["Machine Learning"])
