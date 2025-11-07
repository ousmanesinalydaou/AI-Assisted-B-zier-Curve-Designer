"""
Database Models using Beanie ODM
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from beanie import Document
from pydantic import Field


class Project(Document):
    """
    Project document for storing user's curve designs
    """
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    strokes: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "projects"
        indexes = [
            "name",
            "created_at",
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "My Bezier Design",
                "description": "A beautiful curve design",
                "strokes": [
                    {
                        "id": "stroke_123",
                        "points": [[10, 20], [30, 40]],
                        "fitted_curves": [],
                        "timestamp": 1699564800000
                    }
                ],
                "metadata": {
                    "canvas_width": 1920,
                    "canvas_height": 1080
                }
            }
        }
