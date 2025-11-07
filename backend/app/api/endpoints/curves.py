"""
Curve Fitting Endpoints

Provides endpoints for:
- Fitting cubic Bézier curves to point data
- Smoothing curves with continuity constraints
- Analyzing curvature
"""
from typing import List
from fastapi import APIRouter, HTTPException, status

from app.models.schemas import (
    FitCurveRequest,
    FitCurveResponse,
    SmoothCurveRequest,
    SmoothCurveResponse,
    CurvatureAnalysisRequest,
    CurvatureAnalysisResponse,
    CurveSegment,
    CurvaturePoint,
)
from app.services.curve_fitting import CurveFittingService
from app.services.curve_smoothing import CurveSmoothingService
from app.core.config import settings
import numpy as np

router = APIRouter()


@router.post(
    "/fit-curve",
    response_model=FitCurveResponse,
    summary="Fit cubic Bézier curve to points",
    description="""
    Fits one or more cubic Bézier curves to input points using iterative 
    least-squares with Newton-Raphson reparameterization.
    
    **Algorithm**: Based on Schneider (1990) and Farin (2002)
    
    **Parameters**:
    - `points`: Array of 2D points from user's stroke (minimum 2 points)
    - `options`: Optional fitting parameters
        - `parameterization`: uniform | chord-length | centripetal (default: centripetal)
        - `max_iterations`: Maximum optimization iterations (default: 20)
        - `tolerance`: Convergence tolerance for RMSE (default: 0.001)
        - `regularization`: Numerical stability parameter (default: 1e-6)
    
    **Returns**:
    - Fitted curve segments with error metrics
    - RMSE and maximum error for quality assessment
    """,
)
async def fit_curve(request: FitCurveRequest):
    """
    Fit cubic Bézier curve(s) to input points.
    
    POST /api/curves/fit-curve
    """
    try:
        # Use provided options or defaults
        options = request.options if request.options else {
            "parameterization": "centripetal",
            "max_iterations": settings.DEFAULT_MAX_ITERATIONS,
            "tolerance": settings.DEFAULT_TOLERANCE,
            "regularization": settings.DEFAULT_REGULARIZATION,
        }
        
        # Create fitting service
        from app.models.schemas import FittingOptions
        fitting_options = FittingOptions(**options) if isinstance(options, dict) else options
        fitter = CurveFittingService(fitting_options)
        
        # Fit curve
        fitted_curve, rmse, max_error, iterations = fitter.fit_curve(request.points)
        
        # Create response
        segment = CurveSegment(
            control_points=fitted_curve,
            rmse=rmse,
            max_error=max_error,
        )
        
        response = FitCurveResponse(
            segments=[segment],
            total_rmse=rmse,
            iterations=iterations,
            status="ok",
        )
        
        return response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Curve fitting failed: {str(e)}",
        )


@router.post(
    "/smooth-curve",
    response_model=SmoothCurveResponse,
    summary="Smooth curve segments",
    description="""
    Enforces continuity constraints between multiple curve segments.
    
    **Continuity Modes**:
    - `C1`: Tangent continuity (G¹) - ensures smooth tangent transition
    - `C2`: Curvature continuity (G²) - ensures smooth curvature transition
    
    **Parameters**:
    - `control_points`: Array of cubic Bézier curves to smooth
    - `mode`: C1 or C2 continuity
    - `lambda`: Smoothing weight (0=preserve original, 1=maximum smoothness)
    
    **Returns**:
    - Adjusted control points with enforced continuity
    - Number of discontinuities fixed
    """,
)
async def smooth_curve(request: SmoothCurveRequest):
    """
    Smooth curve segments with continuity constraints.
    
    POST /api/curves/smooth-curve
    """
    try:
        # Create smoothing service
        smoother = CurveSmoothingService(lambda_value=request.lambda_value)
        
        # Apply smoothing based on mode
        if request.mode == "C1":
            smoothed_curves, fixed_count = smoother.smooth_curves_c1(request.control_points)
        elif request.mode == "C2":
            smoothed_curves, fixed_count = smoother.smooth_curves_c2(request.control_points)
        else:
            raise ValueError(f"Unknown smoothing mode: {request.mode}")
        
        # Determine status
        if fixed_count == 0:
            response_status = "already_smooth"
            message = "No discontinuities detected"
        else:
            response_status = "smoothed"
            message = f"Fixed {fixed_count} discontinuities"
        
        response = SmoothCurveResponse(
            control_points=smoothed_curves,
            status=response_status,
            discontinuities_fixed=fixed_count,
            message=message,
        )
        
        return response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Curve smoothing failed: {str(e)}",
        )


@router.post(
    "/curvature-analysis",
    response_model=CurvatureAnalysisResponse,
    summary="Analyze curve curvature",
    description="""
    Computes curvature profile κ(t) along a cubic Bézier curve.
    
    **Curvature Formula**:
    ```
    κ(t) = |B'(t) × B''(t)| / |B'(t)|³
    ```
    
    Where:
    - B'(t) is the first derivative (tangent vector)
    - B''(t) is the second derivative (acceleration vector)
    
    **Parameters**:
    - `control_points`: Cubic Bézier curve to analyze
    - `num_samples`: Number of sample points (default: 100)
    
    **Returns**:
    - Curvature profile with κ(t) at each sample point
    - Maximum, minimum, and average curvature
    """,
)
async def curvature_analysis(request: CurvatureAnalysisRequest):
    """
    Analyze curvature of a Bézier curve.
    
    POST /api/curves/curvature-analysis
    """
    try:
        # Convert curve to numpy array
        curve = np.array([
            [request.control_points.p0.x, request.control_points.p0.y],
            [request.control_points.p1.x, request.control_points.p1.y],
            [request.control_points.p2.x, request.control_points.p2.y],
            [request.control_points.p3.x, request.control_points.p3.y],
        ])
        
        # Sample curve at regular intervals
        t_values = np.linspace(0, 1, request.num_samples)
        
        curvature_profile = []
        curvatures = []
        
        for t in t_values:
            # Evaluate curve position
            position = _evaluate_bezier(curve, float(t))
            
            # Calculate curvature
            curvature = _calculate_curvature(curve, float(t))
            curvatures.append(curvature)
            
            curvature_profile.append(
                CurvaturePoint(
                    t=float(t),
                    curvature=float(curvature),
                    position={"x": float(position[0]), "y": float(position[1])},
                )
            )
        
        response = CurvatureAnalysisResponse(
            curvature_profile=curvature_profile,
            max_curvature=float(max(curvatures)),
            min_curvature=float(min(curvatures)),
            avg_curvature=float(np.mean(curvatures)),
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Curvature analysis failed: {str(e)}",
        )


# Helper functions for curvature analysis

def _evaluate_bezier(control_points: np.ndarray, t: float) -> np.ndarray:
    """Evaluate cubic Bézier at parameter t"""
    ti = 1 - t
    B0 = ti * ti * ti
    B1 = 3 * ti * ti * t
    B2 = 3 * ti * t * t
    B3 = t * t * t
    return B0 * control_points[0] + B1 * control_points[1] + B2 * control_points[2] + B3 * control_points[3]


def _bezier_derivative(control_points: np.ndarray, t: float) -> np.ndarray:
    """Calculate first derivative B'(t)"""
    ti = 1 - t
    term1 = 3 * ti * ti * (control_points[1] - control_points[0])
    term2 = 6 * ti * t * (control_points[2] - control_points[1])
    term3 = 3 * t * t * (control_points[3] - control_points[2])
    return term1 + term2 + term3


def _bezier_second_derivative(control_points: np.ndarray, t: float) -> np.ndarray:
    """Calculate second derivative B''(t)"""
    ti = 1 - t
    term1 = 6 * ti * (control_points[2] - 2 * control_points[1] + control_points[0])
    term2 = 6 * t * (control_points[3] - 2 * control_points[2] + control_points[1])
    return term1 + term2


def _calculate_curvature(control_points: np.ndarray, t: float) -> float:
    """Calculate curvature κ(t) = |B'×B''| / |B'|³"""
    B_prime = _bezier_derivative(control_points, t)
    B_double_prime = _bezier_second_derivative(control_points, t)
    
    # 2D cross product
    cross = B_prime[0] * B_double_prime[1] - B_prime[1] * B_double_prime[0]
    
    # Magnitude of first derivative
    B_prime_mag = np.linalg.norm(B_prime)
    
    if B_prime_mag < 1e-10:
        return 0.0
    
    return abs(cross) / (B_prime_mag ** 3)
