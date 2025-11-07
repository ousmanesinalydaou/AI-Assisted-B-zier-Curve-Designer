"""
Pydantic Schemas for API Request/Response Models
"""
from typing import List, Literal, Optional
from pydantic import BaseModel, Field, validator


class Point2D(BaseModel):
    """2D Point representation"""
    x: float = Field(..., description="X coordinate")
    y: float = Field(..., description="Y coordinate")


class CubicBezierCurve(BaseModel):
    """Cubic Bézier curve with four control points"""
    p0: Point2D = Field(..., description="Start point (P₀)")
    p1: Point2D = Field(..., description="First control point (P₁)")
    p2: Point2D = Field(..., description="Second control point (P₂)")
    p3: Point2D = Field(..., description="End point (P₃)")


class FittingOptions(BaseModel):
    """Options for curve fitting"""
    parameterization: Literal["uniform", "chord-length", "centripetal"] = Field(
        default="centripetal",
        description="Parameterization method for curve fitting"
    )
    max_iterations: int = Field(
        default=20,
        ge=1,
        le=100,
        description="Maximum iterations for iterative fitting"
    )
    tolerance: float = Field(
        default=0.001,
        gt=0,
        description="Convergence tolerance for RMSE"
    )
    regularization: float = Field(
        default=1e-6,
        gt=0,
        description="Regularization parameter for numerical stability"
    )


class FitCurveRequest(BaseModel):
    """Request model for curve fitting endpoint"""
    points: List[Point2D] = Field(
        ...,
        min_length=2,
        description="Array of input points from user's stroke"
    )
    options: Optional[FittingOptions] = Field(
        default=None,
        description="Optional fitting parameters"
    )
    
    @validator("points")
    def validate_points(cls, v):
        if len(v) < 2:
            raise ValueError("At least 2 points are required")
        return v


class CurveSegment(BaseModel):
    """Single curve segment with error metrics"""
    control_points: CubicBezierCurve
    rmse: float = Field(..., description="Root mean square error")
    max_error: float = Field(..., description="Maximum point-to-curve distance")


class FitCurveResponse(BaseModel):
    """Response model for curve fitting endpoint"""
    segments: List[CurveSegment] = Field(
        ...,
        description="Array of fitted curve segments"
    )
    total_rmse: float = Field(..., description="Overall RMSE across all segments")
    iterations: int = Field(..., description="Number of iterations performed")
    status: Literal["ok", "partial", "failed"] = Field(
        default="ok",
        description="Fitting status"
    )
    message: Optional[str] = Field(
        default=None,
        description="Additional information or warnings"
    )


class SmoothCurveRequest(BaseModel):
    """Request model for curve smoothing endpoint"""
    control_points: List[CubicBezierCurve] = Field(
        ...,
        min_length=1,
        description="Array of cubic Bézier curves to smooth"
    )
    mode: Literal["C1", "C2"] = Field(
        default="C1",
        description="Continuity mode: C1 (tangent) or C2 (curvature)"
    )
    lambda_value: float = Field(
        default=0.01,
        ge=0,
        le=1,
        alias="lambda",
        description="Smoothing weight parameter (0=preserve curves, 1=maximize smoothness)"
    )


class SmoothCurveResponse(BaseModel):
    """Response model for curve smoothing endpoint"""
    control_points: List[CubicBezierCurve] = Field(
        ...,
        description="Smoothed control points"
    )
    status: Literal["smoothed", "already_smooth", "failed"] = Field(
        default="smoothed",
        description="Smoothing status"
    )
    discontinuities_fixed: int = Field(
        default=0,
        description="Number of discontinuities fixed"
    )
    message: Optional[str] = None


class PredictControlPointsRequest(BaseModel):
    """Request model for ML control point prediction"""
    points: List[Point2D] = Field(
        ...,
        min_length=2,
        description="Resampled points (typically 32 or 64 points)"
    )
    num_samples: int = Field(
        default=32,
        description="Number of samples expected by the model"
    )


class PredictControlPointsResponse(BaseModel):
    """Response model for ML control point prediction"""
    control_points: CubicBezierCurve = Field(
        ...,
        description="Predicted control points (warm start for optimization)"
    )
    confidence: float = Field(
        default=0.0,
        ge=0,
        le=1,
        description="Model confidence score"
    )
    status: Literal["ok", "model_unavailable", "failed"] = Field(
        default="ok"
    )
    message: Optional[str] = None


class CurvatureAnalysisRequest(BaseModel):
    """Request for curvature analysis"""
    control_points: CubicBezierCurve
    num_samples: int = Field(
        default=100,
        ge=10,
        le=1000,
        description="Number of samples for curvature computation"
    )


class CurvaturePoint(BaseModel):
    """Curvature at a specific point"""
    t: float = Field(..., description="Parameter value")
    curvature: float = Field(..., description="Curvature κ(t)")
    position: Point2D = Field(..., description="Point on curve")


class CurvatureAnalysisResponse(BaseModel):
    """Response for curvature analysis"""
    curvature_profile: List[CurvaturePoint]
    max_curvature: float
    min_curvature: float
    avg_curvature: float


class SaveProjectRequest(BaseModel):
    """Request to save a project"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    strokes: List[dict] = Field(..., description="Array of stroke data")
    metadata: Optional[dict] = None


class SaveProjectResponse(BaseModel):
    """Response for saving a project"""
    project_id: str
    status: str = "saved"
    message: Optional[str] = None


class LoadProjectResponse(BaseModel):
    """Response for loading a project"""
    project_id: str
    name: str
    description: Optional[str]
    strokes: List[dict]
    metadata: Optional[dict]
    created_at: str
    updated_at: str
