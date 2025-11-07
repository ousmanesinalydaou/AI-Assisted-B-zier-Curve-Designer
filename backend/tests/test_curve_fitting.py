"""
Unit Tests for Curve Fitting Service
"""
import pytest
import numpy as np
from app.services.curve_fitting import CurveFittingService
from app.models.schemas import Point2D, FittingOptions


class TestCurveFitting:
    """Test cases for curve fitting algorithm"""
    
    @pytest.fixture
    def fitting_service(self):
        """Create a curve fitting service with default options"""
        options = FittingOptions(
            parameterization="centripetal",
            max_iterations=20,
            tolerance=0.001,
            regularization=1e-6,
        )
        return CurveFittingService(options)
    
    def test_straight_line(self, fitting_service):
        """Test fitting a straight line"""
        # Create a straight line from (0, 0) to (10, 10)
        points = [Point2D(x=float(i), y=float(i)) for i in range(11)]
        
        curve, rmse, max_error, iterations = fitting_service.fit_curve(points)
        
        # Check that endpoints match
        assert curve.p0.x == pytest.approx(0.0, abs=0.1)
        assert curve.p0.y == pytest.approx(0.0, abs=0.1)
        assert curve.p3.x == pytest.approx(10.0, abs=0.1)
        assert curve.p3.y == pytest.approx(10.0, abs=0.1)
        
        # RMSE should be very small for a straight line
        assert rmse < 0.1
    
    def test_simple_curve(self, fitting_service):
        """Test fitting a simple quadratic curve"""
        # Create points along a parabola y = x^2
        points = [Point2D(x=float(x)/10, y=(float(x)/10)**2) for x in range(11)]
        
        curve, rmse, max_error, iterations = fitting_service.fit_curve(points)
        
        # Check that fitting converged
        assert iterations > 0
        assert rmse < 0.05
        
        # Endpoints should match
        assert curve.p0.x == pytest.approx(0.0, abs=0.01)
        assert curve.p3.x == pytest.approx(1.0, abs=0.01)
    
    def test_minimum_points(self, fitting_service):
        """Test with minimum number of points"""
        points = [Point2D(x=0.0, y=0.0), Point2D(x=1.0, y=1.0)]
        
        curve, rmse, max_error, iterations = fitting_service.fit_curve(points)
        
        assert curve is not None
        assert curve.p0.x == pytest.approx(0.0)
        assert curve.p3.x == pytest.approx(1.0)
    
    def test_invalid_input(self, fitting_service):
        """Test with invalid input"""
        with pytest.raises(ValueError):
            fitting_service.fit_curve([])
        
        with pytest.raises(ValueError):
            fitting_service.fit_curve([Point2D(x=0.0, y=0.0)])
    
    def test_parameterization_methods(self):
        """Test different parameterization methods"""
        points = [Point2D(x=float(i), y=float(i**2)) for i in range(10)]
        
        for param_method in ["uniform", "chord-length", "centripetal"]:
            options = FittingOptions(
                parameterization=param_method,
                max_iterations=20,
                tolerance=0.001,
            )
            service = CurveFittingService(options)
            
            curve, rmse, max_error, iterations = service.fit_curve(points)
            
            assert curve is not None
            assert rmse >= 0
            assert iterations > 0
    
    def test_noisy_data(self, fitting_service):
        """Test fitting with noisy data"""
        np.random.seed(42)
        
        # Create points with noise
        points = [
            Point2D(x=float(i)/10 + np.random.normal(0, 0.01), 
                   y=float(i)/10 + np.random.normal(0, 0.01))
            for i in range(20)
        ]
        
        curve, rmse, max_error, iterations = fitting_service.fit_curve(points)
        
        assert curve is not None
        assert rmse < 0.5  # Should still fit reasonably well
