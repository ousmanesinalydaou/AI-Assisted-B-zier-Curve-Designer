"""
Integration Tests for API Endpoints
"""
import pytest
from fastapi.testclient import TestClient
from main import app


client = TestClient(app)


class TestCurveEndpoints:
    """Test cases for curve fitting endpoints"""
    
    def test_fit_curve_endpoint(self):
        """Test /api/curves/fit-curve endpoint"""
        request_data = {
            "points": [
                {"x": 0.0, "y": 0.0},
                {"x": 0.25, "y": 0.5},
                {"x": 0.5, "y": 0.75},
                {"x": 0.75, "y": 0.9},
                {"x": 1.0, "y": 1.0},
            ],
            "options": {
                "parameterization": "centripetal",
                "max_iterations": 20,
                "tolerance": 0.001,
            }
        }
        
        response = client.post("/api/curves/fit-curve", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "segments" in data
        assert len(data["segments"]) > 0
        assert "total_rmse" in data
        assert data["status"] == "ok"
    
    def test_smooth_curve_endpoint(self):
        """Test /api/curves/smooth-curve endpoint"""
        request_data = {
            "control_points": [
                {
                    "p0": {"x": 0.0, "y": 0.0},
                    "p1": {"x": 0.33, "y": 0.5},
                    "p2": {"x": 0.66, "y": 0.5},
                    "p3": {"x": 1.0, "y": 0.0},
                },
                {
                    "p0": {"x": 1.0, "y": 0.0},
                    "p1": {"x": 1.33, "y": 0.5},
                    "p2": {"x": 1.66, "y": 0.5},
                    "p3": {"x": 2.0, "y": 0.0},
                }
            ],
            "mode": "C1",
            "lambda": 0.5,
        }
        
        response = client.post("/api/curves/smooth-curve", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "control_points" in data
        assert "status" in data
        assert "discontinuities_fixed" in data
    
    def test_curvature_analysis_endpoint(self):
        """Test /api/curves/curvature-analysis endpoint"""
        request_data = {
            "control_points": {
                "p0": {"x": 0.0, "y": 0.0},
                "p1": {"x": 0.33, "y": 0.5},
                "p2": {"x": 0.66, "y": 0.5},
                "p3": {"x": 1.0, "y": 0.0},
            },
            "num_samples": 50,
        }
        
        response = client.post("/api/curves/curvature-analysis", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "curvature_profile" in data
        assert len(data["curvature_profile"]) == 50
        assert "max_curvature" in data
        assert "avg_curvature" in data
    
    def test_invalid_request(self):
        """Test with invalid request data"""
        # Empty points
        response = client.post("/api/curves/fit-curve", json={"points": []})
        assert response.status_code == 422  # Validation error
        
        # Missing required fields
        response = client.post("/api/curves/fit-curve", json={})
        assert response.status_code == 422


class TestMLEndpoints:
    """Test cases for ML endpoints"""
    
    def test_ml_status_endpoint(self):
        """Test /api/ml/status endpoint"""
        response = client.get("/api/ml/status")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "model_available" in data
        assert "device" in data
    
    def test_predict_controlpoints_endpoint(self):
        """Test /api/ml/predict-controlpoints endpoint"""
        # Generate 32 sample points
        points = [{"x": float(i)/31, "y": float(i)/31} for i in range(32)]
        
        request_data = {
            "points": points,
            "num_samples": 32,
        }
        
        response = client.post("/api/ml/predict-controlpoints", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "control_points" in data
        assert "status" in data
        assert "confidence" in data


class TestProjectEndpoints:
    """Test cases for project endpoints"""
    
    def test_health_check(self):
        """Test /health endpoint"""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "healthy"
        assert "version" in data
