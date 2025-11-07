"""
Machine Learning Endpoints

Provides ML-based control point prediction for warm-start optimization.
"""
from fastapi import APIRouter, HTTPException, status

from app.models.schemas import (
    PredictControlPointsRequest,
    PredictControlPointsResponse,
)
from app.services.ml_prediction import MLPredictionService

router = APIRouter()

# Initialize ML service (singleton)
ml_service = MLPredictionService()


@router.post(
    "/predict-controlpoints",
    response_model=PredictControlPointsResponse,
    summary="Predict control points using ML",
    description="""
    Uses a trained neural network to predict cubic Bézier control points 
    from resampled stroke data.
    
    **Model Architecture**:
    - Multi-layer perceptron (MLP)
    - Input: 32 resampled points (64 values)
    - Hidden layers: 128 → 64 → 32
    - Output: 4 control points (8 values)
    
    **Training Data**:
    - Synthetic Bézier curves with noise
    - ~10,000 training samples
    
    **Use Case**:
    - Provides warm-start for iterative optimization
    - Reduces fitting iterations by 30-50%
    - Fallback when ML unavailable: use traditional fitting
    
    **Parameters**:
    - `points`: Resampled points (ideally 32 points)
    - `num_samples`: Expected number of samples (default: 32)
    
    **Returns**:
    - Predicted control points
    - Confidence score (0-1)
    - Status: ok | model_unavailable | failed
    """,
)
async def predict_controlpoints(request: PredictControlPointsRequest):
    """
    Predict control points using ML model.
    
    POST /api/ml/predict-controlpoints
    """
    try:
        # Check if ML model is available
        if not ml_service.is_available():
            return PredictControlPointsResponse(
                control_points={
                    "p0": {"x": 0, "y": 0},
                    "p1": {"x": 0, "y": 0},
                    "p2": {"x": 0, "y": 0},
                    "p3": {"x": 0, "y": 0},
                },
                confidence=0.0,
                status="model_unavailable",
                message="ML model is not available. Use traditional curve fitting instead.",
            )
        
        # Predict control points
        predicted_curve, confidence = ml_service.predict_control_points(
            request.points,
            request.num_samples,
        )
        
        response = PredictControlPointsResponse(
            control_points=predicted_curve,
            confidence=confidence,
            status="ok",
            message="Control points predicted successfully",
        )
        
        return response
        
    except Exception as e:
        # Don't crash - return failure status
        return PredictControlPointsResponse(
            control_points={
                "p0": {"x": 0, "y": 0},
                "p1": {"x": 0, "y": 0},
                "p2": {"x": 0, "y": 0},
                "p3": {"x": 0, "y": 0},
            },
            confidence=0.0,
            status="failed",
            message=f"Prediction failed: {str(e)}",
        )


@router.get(
    "/status",
    summary="Check ML model status",
    description="Returns the availability status of the ML model.",
)
async def ml_status():
    """
    Check ML model availability.
    
    GET /api/ml/status
    """
    is_available = ml_service.is_available()
    
    return {
        "model_available": is_available,
        "model_path": ml_service.model.__class__.__name__ if is_available else None,
        "device": str(ml_service.device),
        "input_points": ml_service.num_input_points,
        "message": "ML model ready" if is_available else "ML model not loaded",
    }
