"""
Projects Endpoints

Provides persistence for user projects with MongoDB.
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from beanie import PydanticObjectId

from app.models.schemas import SaveProjectRequest, SaveProjectResponse, LoadProjectResponse
from app.models.project import Project

router = APIRouter()


@router.post(
    "/save",
    response_model=SaveProjectResponse,
    summary="Save a project",
    description="""
    Saves a project to the database with all strokes and metadata.
    
    **Parameters**:
    - `name`: Project name (required)
    - `description`: Optional project description
    - `strokes`: Array of stroke data with fitted curves
    - `metadata`: Optional metadata (canvas size, settings, etc.)
    
    **Returns**:
    - Project ID for future loading
    - Save status
    """,
)
async def save_project(request: SaveProjectRequest):
    """
    Save a project.
    
    POST /api/projects/save
    """
    try:
        # Create new project
        project = Project(
            name=request.name,
            description=request.description,
            strokes=request.strokes,
            metadata=request.metadata,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        
        # Save to database
        await project.insert()
        
        response = SaveProjectResponse(
            project_id=str(project.id),
            status="saved",
            message=f"Project '{request.name}' saved successfully",
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save project: {str(e)}",
        )


@router.get(
    "/{project_id}",
    response_model=LoadProjectResponse,
    summary="Load a project",
    description="""
    Loads a project from the database by ID.
    
    **Parameters**:
    - `project_id`: MongoDB ObjectId of the project
    
    **Returns**:
    - Complete project data including all strokes
    """,
)
async def load_project(project_id: str):
    """
    Load a project by ID.
    
    GET /api/projects/{project_id}
    """
    try:
        # Find project
        project = await Project.get(PydanticObjectId(project_id))
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID {project_id} not found",
            )
        
        response = LoadProjectResponse(
            project_id=str(project.id),
            name=project.name,
            description=project.description,
            strokes=project.strokes,
            metadata=project.metadata,
            created_at=project.created_at.isoformat(),
            updated_at=project.updated_at.isoformat(),
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load project: {str(e)}",
        )


@router.get(
    "/",
    summary="List all projects",
    description="Returns a list of all saved projects with basic information.",
)
async def list_projects(skip: int = 0, limit: int = 100):
    """
    List all projects.
    
    GET /api/projects/
    """
    try:
        projects = await Project.find_all().skip(skip).limit(limit).to_list()
        
        return {
            "projects": [
                {
                    "project_id": str(p.id),
                    "name": p.name,
                    "description": p.description,
                    "created_at": p.created_at.isoformat(),
                    "updated_at": p.updated_at.isoformat(),
                    "stroke_count": len(p.strokes),
                }
                for p in projects
            ],
            "total": len(projects),
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list projects: {str(e)}",
        )


@router.put(
    "/{project_id}",
    response_model=SaveProjectResponse,
    summary="Update a project",
    description="Updates an existing project with new data.",
)
async def update_project(project_id: str, request: SaveProjectRequest):
    """
    Update an existing project.
    
    PUT /api/projects/{project_id}
    """
    try:
        # Find project
        project = await Project.get(PydanticObjectId(project_id))
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID {project_id} not found",
            )
        
        # Update fields
        project.name = request.name
        project.description = request.description
        project.strokes = request.strokes
        project.metadata = request.metadata
        project.updated_at = datetime.utcnow()
        
        # Save changes
        await project.save()
        
        response = SaveProjectResponse(
            project_id=str(project.id),
            status="updated",
            message=f"Project '{request.name}' updated successfully",
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update project: {str(e)}",
        )


@router.delete(
    "/{project_id}",
    summary="Delete a project",
    description="Permanently deletes a project from the database.",
)
async def delete_project(project_id: str):
    """
    Delete a project.
    
    DELETE /api/projects/{project_id}
    """
    try:
        # Find project
        project = await Project.get(PydanticObjectId(project_id))
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID {project_id} not found",
            )
        
        # Delete project
        await project.delete()
        
        return {
            "status": "deleted",
            "message": f"Project '{project.name}' deleted successfully",
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete project: {str(e)}",
        )
