"""
ML Model Service for Control Point Prediction

Implements a lightweight neural network for predicting Bézier control points
from resampled stroke data. Provides warm-start for optimization.
"""
import torch
import torch.nn as nn
import numpy as np
from typing import List, Optional, Tuple
from pathlib import Path

from app.models.schemas import Point2D, CubicBezierCurve
from app.core.config import settings


class ControlPointPredictor(nn.Module):
    """
    Neural network for predicting Bézier control points.
    
    Architecture:
    - Input: Flattened resampled stroke points (e.g., 32 points × 2 coords = 64 values)
    - Hidden layers: 128 → 64 → 32
    - Output: 8 values (4 control points × 2 coords)
    """
    
    def __init__(self, num_input_points: int = 32):
        super().__init__()
        
        input_dim = num_input_points * 2  # x, y coordinates
        output_dim = 8  # 4 control points, each with x and y
        
        self.network = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.BatchNorm1d(128),
            nn.Dropout(0.2),
            
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.BatchNorm1d(64),
            nn.Dropout(0.2),
            
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.BatchNorm1d(32),
            
            nn.Linear(32, output_dim),
        )
    
    def forward(self, x):
        """
        Forward pass.
        
        Args:
            x: Tensor of shape (batch_size, num_input_points * 2)
            
        Returns:
            Tensor of shape (batch_size, 8) representing control points
        """
        return self.network(x)


class MLPredictionService:
    """Service for ML-based control point prediction"""
    
    def __init__(self):
        self.model: Optional[ControlPointPredictor] = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.num_input_points = 32
        
        # Try to load model if available
        if settings.ML_MODEL_ENABLED:
            self._load_model()
    
    def _load_model(self):
        """Load trained model from disk"""
        model_path = Path(settings.ML_MODEL_PATH)
        
        if model_path.exists():
            try:
                self.model = ControlPointPredictor(self.num_input_points)
                self.model.load_state_dict(torch.load(model_path, map_location=self.device))
                self.model.to(self.device)
                self.model.eval()
                print(f"✅ Loaded ML model from {model_path}")
            except Exception as e:
                print(f"⚠️ Failed to load ML model: {e}")
                self.model = None
        else:
            print(f"⚠️ ML model not found at {model_path}")
    
    def is_available(self) -> bool:
        """Check if ML model is available"""
        return self.model is not None and settings.ML_MODEL_ENABLED
    
    def predict_control_points(
        self,
        points: List[Point2D],
        num_samples: int = 32
    ) -> Tuple[CubicBezierCurve, float]:
        """
        Predict control points from resampled stroke data.
        
        Args:
            points: List of input points
            num_samples: Number of samples to resample to
            
        Returns:
            Tuple of (predicted_curve, confidence)
        """
        if not self.is_available():
            raise RuntimeError("ML model is not available")
        
        # Resample points to fixed number
        resampled = self._resample_points(points, num_samples)
        
        # Convert to tensor
        input_tensor = torch.tensor(resampled, dtype=torch.float32).flatten().unsqueeze(0)
        input_tensor = input_tensor.to(self.device)
        
        # Predict
        with torch.no_grad():
            output = self.model(input_tensor)
            output = output.cpu().numpy()[0]
        
        # Convert output to control points
        control_points = output.reshape(4, 2)
        
        # Create CubicBezierCurve
        curve = CubicBezierCurve(
            p0=Point2D(x=float(control_points[0][0]), y=float(control_points[0][1])),
            p1=Point2D(x=float(control_points[1][0]), y=float(control_points[1][1])),
            p2=Point2D(x=float(control_points[2][0]), y=float(control_points[2][1])),
            p3=Point2D(x=float(control_points[3][0]), y=float(control_points[3][1])),
        )
        
        # Calculate confidence (simplified: based on output variance)
        confidence = 0.75  # Placeholder
        
        return curve, confidence
    
    def _resample_points(self, points: List[Point2D], num_samples: int) -> np.ndarray:
        """
        Resample points to a fixed number using linear interpolation.
        
        Args:
            points: List of input points
            num_samples: Target number of samples
            
        Returns:
            numpy array of shape (num_samples, 2)
        """
        pts = np.array([[p.x, p.y] for p in points])
        
        if len(pts) < 2:
            # Pad with duplicates
            return np.tile(pts[0], (num_samples, 1))
        
        # Calculate cumulative arc length
        distances = np.sqrt(np.sum(np.diff(pts, axis=0) ** 2, axis=1))
        cumulative = np.concatenate([[0], np.cumsum(distances)])
        
        # Normalize to [0, 1]
        if cumulative[-1] > 0:
            cumulative = cumulative / cumulative[-1]
        
        # Create evenly spaced samples
        sample_positions = np.linspace(0, 1, num_samples)
        
        # Interpolate x and y separately
        resampled_x = np.interp(sample_positions, cumulative, pts[:, 0])
        resampled_y = np.interp(sample_positions, cumulative, pts[:, 1])
        
        return np.column_stack([resampled_x, resampled_y])
