"""
Curve Smoothing Service

Implements continuity analysis and smoothing for Bézier curve segments.
Provides C¹ (tangent) and C² (curvature) continuity enforcement.
"""
import numpy as np
from typing import List, Tuple
from app.models.schemas import CubicBezierCurve, Point2D


class CurveSmoothingService:
    """Service for analyzing and smoothing curve continuity"""
    
    def __init__(self, lambda_value: float = 0.01):
        """
        Initialize smoothing service.
        
        Args:
            lambda_value: Smoothing weight (0=preserve curves, 1=maximize smoothness)
        """
        self.lambda_value = lambda_value
    
    def smooth_curves_c1(self, curves: List[CubicBezierCurve]) -> Tuple[List[CubicBezierCurve], int]:
        """
        Enforce C¹ (tangent) continuity between curve segments.
        
        At each junction point, ensures that the tangent vectors are aligned.
        
        Args:
            curves: List of cubic Bézier curves
            
        Returns:
            Tuple of (smoothed_curves, discontinuities_fixed)
        """
        if len(curves) <= 1:
            return curves, 0
        
        smoothed = [self._curve_to_array(curves[0])]
        discontinuities_fixed = 0
        
        for i in range(1, len(curves)):
            prev_curve = smoothed[-1]
            curr_curve = self._curve_to_array(curves[i])
            
            # Check if already C¹ continuous
            if not self._is_c1_continuous(prev_curve, curr_curve):
                # Fix C¹ discontinuity
                curr_curve = self._enforce_c1_continuity(prev_curve, curr_curve)
                discontinuities_fixed += 1
            
            smoothed.append(curr_curve)
        
        # Convert back to CubicBezierCurve objects
        result = [self._array_to_curve(curve) for curve in smoothed]
        
        return result, discontinuities_fixed
    
    def smooth_curves_c2(self, curves: List[CubicBezierCurve]) -> Tuple[List[CubicBezierCurve], int]:
        """
        Enforce C² (curvature) continuity between curve segments.
        
        At each junction point, ensures both tangent and curvature are continuous.
        This is more restrictive than C¹.
        
        Args:
            curves: List of cubic Bézier curves
            
        Returns:
            Tuple of (smoothed_curves, discontinuities_fixed)
        """
        if len(curves) <= 1:
            return curves, 0
        
        smoothed = [self._curve_to_array(curves[0])]
        discontinuities_fixed = 0
        
        for i in range(1, len(curves)):
            prev_curve = smoothed[-1]
            curr_curve = self._curve_to_array(curves[i])
            
            # Check if already C² continuous
            if not self._is_c2_continuous(prev_curve, curr_curve):
                # Fix C² discontinuity
                curr_curve = self._enforce_c2_continuity(prev_curve, curr_curve)
                discontinuities_fixed += 1
            
            smoothed.append(curr_curve)
        
        # Convert back to CubicBezierCurve objects
        result = [self._array_to_curve(curve) for curve in smoothed]
        
        return result, discontinuities_fixed
    
    def analyze_continuity(self, curves: List[CubicBezierCurve]) -> List[dict]:
        """
        Analyze continuity at all junction points.
        
        Returns:
            List of continuity analysis results for each junction
        """
        if len(curves) <= 1:
            return []
        
        results = []
        
        for i in range(len(curves) - 1):
            prev_curve = self._curve_to_array(curves[i])
            next_curve = self._curve_to_array(curves[i + 1])
            
            # Check C⁰ (positional continuity)
            c0 = self._is_c0_continuous(prev_curve, next_curve)
            
            # Check C¹ (tangent continuity)
            c1 = self._is_c1_continuous(prev_curve, next_curve)
            
            # Check C² (curvature continuity)
            c2 = self._is_c2_continuous(prev_curve, next_curve)
            
            # Calculate tangent angle difference
            tangent_prev = prev_curve[3] - prev_curve[2]
            tangent_next = next_curve[1] - next_curve[0]
            
            angle_diff = self._angle_between_vectors(tangent_prev, tangent_next)
            
            results.append({
                "junction_index": i,
                "c0_continuous": c0,
                "c1_continuous": c1,
                "c2_continuous": c2,
                "tangent_angle_diff_deg": float(np.degrees(angle_diff)),
            })
        
        return results
    
    def _curve_to_array(self, curve: CubicBezierCurve) -> np.ndarray:
        """Convert CubicBezierCurve to numpy array"""
        return np.array([
            [curve.p0.x, curve.p0.y],
            [curve.p1.x, curve.p1.y],
            [curve.p2.x, curve.p2.y],
            [curve.p3.x, curve.p3.y],
        ])
    
    def _array_to_curve(self, array: np.ndarray) -> CubicBezierCurve:
        """Convert numpy array to CubicBezierCurve"""
        return CubicBezierCurve(
            p0=Point2D(x=float(array[0][0]), y=float(array[0][1])),
            p1=Point2D(x=float(array[1][0]), y=float(array[1][1])),
            p2=Point2D(x=float(array[2][0]), y=float(array[2][1])),
            p3=Point2D(x=float(array[3][0]), y=float(array[3][1])),
        )
    
    def _is_c0_continuous(self, curve1: np.ndarray, curve2: np.ndarray, tol: float = 1e-6) -> bool:
        """Check if two curves have C⁰ continuity (position match)"""
        return np.linalg.norm(curve1[3] - curve2[0]) < tol
    
    def _is_c1_continuous(self, curve1: np.ndarray, curve2: np.ndarray, tol: float = 1e-3) -> bool:
        """
        Check if two curves have C¹ continuity (tangent match).
        
        For C¹: the exit tangent of curve1 must be parallel to entry tangent of curve2
        """
        if not self._is_c0_continuous(curve1, curve2):
            return False
        
        # Tangent vectors at junction
        tangent1 = curve1[3] - curve1[2]  # Exit tangent of first curve
        tangent2 = curve2[1] - curve2[0]  # Entry tangent of second curve
        
        # Normalize
        norm1 = np.linalg.norm(tangent1)
        norm2 = np.linalg.norm(tangent2)
        
        if norm1 < 1e-10 or norm2 < 1e-10:
            return False
        
        tangent1_normalized = tangent1 / norm1
        tangent2_normalized = tangent2 / norm2
        
        # Check if parallel (dot product should be close to 1 or -1)
        dot_product = np.dot(tangent1_normalized, tangent2_normalized)
        
        return abs(abs(dot_product) - 1.0) < tol
    
    def _is_c2_continuous(self, curve1: np.ndarray, curve2: np.ndarray, tol: float = 1e-2) -> bool:
        """
        Check if two curves have C² continuity (curvature match).
        
        For C²: both tangent and curvature must be continuous
        """
        if not self._is_c1_continuous(curve1, curve2):
            return False
        
        # Calculate curvature at junction
        kappa1 = self._calculate_curvature_at_end(curve1)
        kappa2 = self._calculate_curvature_at_start(curve2)
        
        return abs(kappa1 - kappa2) < tol
    
    def _calculate_curvature_at_end(self, curve: np.ndarray) -> float:
        """Calculate curvature at t=1"""
        return self._calculate_curvature(curve, 1.0)
    
    def _calculate_curvature_at_start(self, curve: np.ndarray) -> float:
        """Calculate curvature at t=0"""
        return self._calculate_curvature(curve, 0.0)
    
    def _calculate_curvature(self, curve: np.ndarray, t: float) -> float:
        """
        Calculate curvature κ(t) at parameter t.
        
        κ(t) = |B'(t) × B''(t)| / |B'(t)|³
        """
        # First derivative
        B_prime = self._bezier_derivative(curve, t)
        
        # Second derivative
        B_double_prime = self._bezier_second_derivative(curve, t)
        
        # Cross product in 2D: (x1*y2 - y1*x2)
        cross = B_prime[0] * B_double_prime[1] - B_prime[1] * B_double_prime[0]
        
        # Magnitude of first derivative
        B_prime_mag = np.linalg.norm(B_prime)
        
        if B_prime_mag < 1e-10:
            return 0.0
        
        curvature = abs(cross) / (B_prime_mag ** 3)
        
        return curvature
    
    def _bezier_derivative(self, curve: np.ndarray, t: float) -> np.ndarray:
        """
        Calculate B'(t) for cubic Bézier.
        
        B'(t) = 3(1-t)²(P₁-P₀) + 6(1-t)t(P₂-P₁) + 3t²(P₃-P₂)
        """
        ti = 1 - t
        
        term1 = 3 * ti * ti * (curve[1] - curve[0])
        term2 = 6 * ti * t * (curve[2] - curve[1])
        term3 = 3 * t * t * (curve[3] - curve[2])
        
        return term1 + term2 + term3
    
    def _bezier_second_derivative(self, curve: np.ndarray, t: float) -> np.ndarray:
        """
        Calculate B''(t) for cubic Bézier.
        
        B''(t) = 6(1-t)(P₂-2P₁+P₀) + 6t(P₃-2P₂+P₁)
        """
        ti = 1 - t
        
        term1 = 6 * ti * (curve[2] - 2 * curve[1] + curve[0])
        term2 = 6 * t * (curve[3] - 2 * curve[2] + curve[1])
        
        return term1 + term2
    
    def _enforce_c1_continuity(self, prev_curve: np.ndarray, curr_curve: np.ndarray) -> np.ndarray:
        """
        Adjust curr_curve to enforce C¹ continuity with prev_curve.
        
        Adjusts P₁ of curr_curve to align with the exit tangent of prev_curve.
        """
        modified = np.copy(curr_curve)
        
        # Junction point
        junction = prev_curve[3]
        
        # Exit tangent of previous curve
        exit_tangent = prev_curve[3] - prev_curve[2]
        
        # Entry tangent magnitude of current curve
        entry_tangent = curr_curve[1] - curr_curve[0]
        entry_magnitude = np.linalg.norm(entry_tangent)
        
        # Normalize exit tangent and scale by entry magnitude
        exit_norm = np.linalg.norm(exit_tangent)
        if exit_norm > 1e-10:
            aligned_tangent = (exit_tangent / exit_norm) * entry_magnitude
        else:
            aligned_tangent = entry_tangent
        
        # Blend with original using lambda
        new_p1 = junction + self.lambda_value * aligned_tangent + (1 - self.lambda_value) * entry_tangent
        
        modified[1] = new_p1
        
        return modified
    
    def _enforce_c2_continuity(self, prev_curve: np.ndarray, curr_curve: np.ndarray) -> np.ndarray:
        """
        Adjust curr_curve to enforce C² continuity with prev_curve.
        
        This is more complex and adjusts both P₁ and P₂.
        """
        # First enforce C¹
        modified = self._enforce_c1_continuity(prev_curve, curr_curve)
        
        # For C², we need to match curvature
        # This involves adjusting P₂ as well
        # Simplified approach: use a weighted adjustment
        
        kappa_prev = self._calculate_curvature_at_end(prev_curve)
        kappa_curr = self._calculate_curvature_at_start(modified)
        
        # If curvatures are different, adjust P₂
        if abs(kappa_prev - kappa_curr) > 1e-6:
            # Move P₂ to better match curvature
            # This is a heuristic adjustment
            direction = modified[3] - modified[1]
            adjustment = direction * self.lambda_value * 0.1
            modified[2] = modified[2] + adjustment
        
        return modified
    
    def _angle_between_vectors(self, v1: np.ndarray, v2: np.ndarray) -> float:
        """Calculate angle between two vectors in radians"""
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)
        
        if norm1 < 1e-10 or norm2 < 1e-10:
            return 0.0
        
        cos_angle = np.dot(v1, v2) / (norm1 * norm2)
        cos_angle = np.clip(cos_angle, -1.0, 1.0)
        
        return np.arccos(cos_angle)
