"""
Curve Fitting Service

Implements iterative least-squares cubic Bézier fitting
with Newton-Raphson reparameterization.

Based on:
- Schneider, P. J. (1990). "An Algorithm for Automatically Fitting Digitized Curves"
- Farin, G. (2002). "Curves and Surfaces for CAGD"
"""
import numpy as np
from typing import List, Tuple, Optional
from app.models.schemas import Point2D, CubicBezierCurve, FittingOptions


class CurveFittingService:
    """Service for fitting cubic Bézier curves to point data"""
    
    def __init__(self, options: FittingOptions):
        self.options = options
    
    def fit_curve(self, points: List[Point2D]) -> Tuple[CubicBezierCurve, float, float, int]:
        """
        Fit a cubic Bézier curve to a set of points.
        
        Args:
            points: List of 2D points
            
        Returns:
            Tuple of (fitted_curve, rmse, max_error, iterations)
        """
        if len(points) < 2:
            raise ValueError("Need at least 2 points to fit a curve")
        
        # Convert to numpy array
        pts = np.array([[p.x, p.y] for p in points])
        
        # Initial parameterization
        parameters = self._parameterize_points(pts)
        
        # Endpoints are fixed
        p0 = pts[0]
        p3 = pts[-1]
        
        # Estimate tangent vectors at endpoints
        tangent1 = self._estimate_left_tangent(pts)
        tangent2 = self._estimate_right_tangent(pts)
        
        best_curve = None
        best_error = float('inf')
        iterations = 0
        
        # Iterative fitting with reparameterization
        for iter_num in range(self.options.max_iterations):
            iterations = iter_num + 1
            
            # Solve for control points using least squares
            p1, p2 = self._generate_bezier_control_points(
                pts, parameters, p0, p3, tangent1, tangent2
            )
            
            curve_array = np.array([p0, p1, p2, p3])
            
            # Calculate error
            errors = self._calculate_errors(pts, curve_array, parameters)
            rmse = np.sqrt(np.mean(errors ** 2))
            max_error = np.max(errors)
            
            if rmse < best_error:
                best_error = rmse
                best_curve = curve_array
            
            # Check convergence
            if rmse < self.options.tolerance:
                break
            
            # Reparameterize using Newton-Raphson
            parameters = self._reparameterize(pts, curve_array, parameters)
        
        if best_curve is None:
            raise RuntimeError("Failed to fit curve")
        
        # Convert to response model
        fitted_curve = CubicBezierCurve(
            p0=Point2D(x=float(best_curve[0][0]), y=float(best_curve[0][1])),
            p1=Point2D(x=float(best_curve[1][0]), y=float(best_curve[1][1])),
            p2=Point2D(x=float(best_curve[2][0]), y=float(best_curve[2][1])),
            p3=Point2D(x=float(best_curve[3][0]), y=float(best_curve[3][1])),
        )
        
        final_errors = self._calculate_errors(pts, best_curve, parameters)
        final_rmse = float(np.sqrt(np.mean(final_errors ** 2)))
        final_max_error = float(np.max(final_errors))
        
        return fitted_curve, final_rmse, final_max_error, iterations
    
    def _parameterize_points(self, points: np.ndarray) -> np.ndarray:
        """
        Parameterize points using the specified method.
        
        Args:
            points: Nx2 array of points
            
        Returns:
            Array of parameters in [0, 1]
        """
        n = len(points)
        
        if self.options.parameterization == "uniform":
            return np.linspace(0, 1, n)
        
        elif self.options.parameterization == "chord-length":
            # Calculate cumulative chord lengths
            distances = np.sqrt(np.sum(np.diff(points, axis=0) ** 2, axis=1))
            cumulative = np.concatenate([[0], np.cumsum(distances)])
            
            # Normalize to [0, 1]
            total_length = cumulative[-1]
            if total_length > 0:
                return cumulative / total_length
            else:
                return np.linspace(0, 1, n)
        
        elif self.options.parameterization == "centripetal":
            # Calculate cumulative square root of distances (centripetal)
            distances = np.sqrt(np.sum(np.diff(points, axis=0) ** 2, axis=1))
            sqrt_distances = np.sqrt(distances)
            cumulative = np.concatenate([[0], np.cumsum(sqrt_distances)])
            
            # Normalize to [0, 1]
            total_length = cumulative[-1]
            if total_length > 0:
                return cumulative / total_length
            else:
                return np.linspace(0, 1, n)
        
        else:
            raise ValueError(f"Unknown parameterization: {self.options.parameterization}")
    
    def _estimate_left_tangent(self, points: np.ndarray) -> np.ndarray:
        """Estimate tangent vector at the start of the curve"""
        if len(points) < 2:
            return np.array([1.0, 0.0])
        
        tangent = points[1] - points[0]
        length = np.linalg.norm(tangent)
        
        return tangent / length if length > 0 else np.array([1.0, 0.0])
    
    def _estimate_right_tangent(self, points: np.ndarray) -> np.ndarray:
        """Estimate tangent vector at the end of the curve"""
        if len(points) < 2:
            return np.array([1.0, 0.0])
        
        tangent = points[-1] - points[-2]
        length = np.linalg.norm(tangent)
        
        return tangent / length if length > 0 else np.array([1.0, 0.0])
    
    def _generate_bezier_control_points(
        self,
        points: np.ndarray,
        parameters: np.ndarray,
        p0: np.ndarray,
        p3: np.ndarray,
        tangent1: np.ndarray,
        tangent2: np.ndarray,
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate control points P1 and P2 using least squares.
        
        Solves the linear system:
        C * [α₁, α₂]ᵀ = X
        
        where α₁ and α₂ are distances along the tangent vectors
        """
        n = len(points)
        
        # Set up the linear system
        C = np.zeros((2, 2))
        X = np.zeros(2)
        
        for i in range(n):
            t = parameters[i]
            ti = 1 - t
            
            # Bernstein basis functions
            B0 = ti * ti * ti
            B1 = 3 * ti * ti * t
            B2 = 3 * ti * t * t
            B3 = t * t * t
            
            # Basis functions for the unknowns
            A1 = tangent1 * B1
            A2 = tangent2 * B2
            
            # Accumulate matrix elements
            C[0, 0] += np.dot(A1, A1)
            C[0, 1] += np.dot(A1, A2)
            C[1, 0] = C[0, 1]  # Symmetric
            C[1, 1] += np.dot(A2, A2)
            
            # Right-hand side
            tmp = points[i] - (B0 * p0 + B3 * p3)
            X[0] += np.dot(A1, tmp)
            X[1] += np.dot(A2, tmp)
        
        # Add regularization for numerical stability
        C[0, 0] += self.options.regularization
        C[1, 1] += self.options.regularization
        
        # Solve the system
        try:
            alphas = np.linalg.solve(C, X)
        except np.linalg.LinAlgError:
            # Fallback: use a simple heuristic
            chord_length = np.linalg.norm(p3 - p0)
            alphas = np.array([chord_length / 3, chord_length / 3])
        
        # Calculate control points
        p1 = p0 + alphas[0] * tangent1
        p2 = p3 + alphas[1] * tangent2
        
        return p1, p2
    
    def _evaluate_bezier(self, control_points: np.ndarray, t: float) -> np.ndarray:
        """
        Evaluate cubic Bézier curve at parameter t.
        
        Args:
            control_points: 4x2 array of control points
            t: Parameter value in [0, 1]
            
        Returns:
            Point on the curve
        """
        ti = 1 - t
        
        B0 = ti * ti * ti
        B1 = 3 * ti * ti * t
        B2 = 3 * ti * t * t
        B3 = t * t * t
        
        return (
            B0 * control_points[0] +
            B1 * control_points[1] +
            B2 * control_points[2] +
            B3 * control_points[3]
        )
    
    def _evaluate_bezier_derivative(self, control_points: np.ndarray, t: float) -> np.ndarray:
        """
        Evaluate first derivative of cubic Bézier curve at parameter t.
        
        B'(t) = 3(1-t)²(P₁ - P₀) + 6(1-t)t(P₂ - P₁) + 3t²(P₃ - P₂)
        """
        ti = 1 - t
        
        term1 = 3 * ti * ti * (control_points[1] - control_points[0])
        term2 = 6 * ti * t * (control_points[2] - control_points[1])
        term3 = 3 * t * t * (control_points[3] - control_points[2])
        
        return term1 + term2 + term3
    
    def _evaluate_bezier_second_derivative(self, control_points: np.ndarray, t: float) -> np.ndarray:
        """
        Evaluate second derivative of cubic Bézier curve at parameter t.
        
        B''(t) = 6(1-t)(P₂ - 2P₁ + P₀) + 6t(P₃ - 2P₂ + P₁)
        """
        ti = 1 - t
        
        term1 = 6 * ti * (control_points[2] - 2 * control_points[1] + control_points[0])
        term2 = 6 * t * (control_points[3] - 2 * control_points[2] + control_points[1])
        
        return term1 + term2
    
    def _calculate_errors(
        self,
        points: np.ndarray,
        control_points: np.ndarray,
        parameters: np.ndarray
    ) -> np.ndarray:
        """
        Calculate point-to-curve distances for all points.
        
        Args:
            points: Nx2 array of data points
            control_points: 4x2 array of Bézier control points
            parameters: Array of parameter values
            
        Returns:
            Array of distances
        """
        errors = np.zeros(len(points))
        
        for i, t in enumerate(parameters):
            curve_point = self._evaluate_bezier(control_points, t)
            errors[i] = np.linalg.norm(points[i] - curve_point)
        
        return errors
    
    def _reparameterize(
        self,
        points: np.ndarray,
        control_points: np.ndarray,
        parameters: np.ndarray
    ) -> np.ndarray:
        """
        Reparameterize using Newton-Raphson iteration.
        
        For each point, find the parameter t that minimizes the distance
        to the curve using Newton's method.
        """
        new_parameters = np.copy(parameters)
        
        for i in range(len(points)):
            t = parameters[i]
            
            # Newton-Raphson iteration (max 5 iterations)
            for _ in range(5):
                # Q(t) = B(t) - P
                Q = self._evaluate_bezier(control_points, t) - points[i]
                
                # Q'(t) = B'(t)
                Q_prime = self._evaluate_bezier_derivative(control_points, t)
                
                # Q''(t) = B''(t)
                Q_double_prime = self._evaluate_bezier_second_derivative(control_points, t)
                
                # Numerator: Q(t) · Q'(t)
                numerator = np.dot(Q, Q_prime)
                
                # Denominator: Q'(t) · Q'(t) + Q(t) · Q''(t)
                denominator = np.dot(Q_prime, Q_prime) + np.dot(Q, Q_double_prime)
                
                if abs(denominator) < 1e-10:
                    break
                
                # Update t
                t_new = t - numerator / denominator
                
                # Clamp to [0, 1]
                t_new = np.clip(t_new, 0, 1)
                
                # Check convergence
                if abs(t_new - t) < 1e-6:
                    break
                
                t = t_new
            
            new_parameters[i] = t
        
        return new_parameters
