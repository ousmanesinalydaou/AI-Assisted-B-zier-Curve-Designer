import { Point2D, CubicBezier, FittingOptions, FittingResult } from '../types';
import { distance } from '../utils/helpers';

/**
 * Implements cubic Bézier curve fitting using iterative least-squares
 * with Newton-Raphson reparameterization based on Schneider & Farin methods
 */

export class CurveFitter {
  private options: FittingOptions;

  constructor(options: FittingOptions) {
    this.options = options;
  }

  /**
   * Fit a cubic Bézier curve to a set of points
   */
  public fitCurve(points: Point2D[]): FittingResult {
    if (points.length < 2) {
      throw new Error('Need at least 2 points to fit a curve');
    }

    // Initial parameterization
    let parameters = this.parameterizePoints(points);
    
    // Endpoints are fixed
    const p0 = points[0];
    const p3 = points[points.length - 1];
    
    // Estimate tangent vectors at endpoints
    const tangent1 = this.estimateLeftTangent(points);
    const tangent2 = this.estimateRightTangent(points);
    
    let bestCurve: CubicBezier | null = null;
    let bestError = Infinity;
    let iterations = 0;
    
    // Iterative fitting with reparameterization
    for (let iter = 0; iter < this.options.maxIterations; iter++) {
      iterations = iter + 1;
      
      // Solve for control points using least squares
      const curve = this.generateBezier(points, parameters, tangent1, tangent2);
      
      // Calculate error
      const errors = this.calculateErrors(points, curve, parameters);
      const rmse = this.calculateRMSE(errors);
      const maxError = Math.max(...errors);
      
      if (rmse < bestError) {
        bestError = rmse;
        bestCurve = curve;
      }
      
      // Check convergence
      if (rmse < this.options.tolerance) {
        break;
      }
      
      // Reparameterize using Newton-Raphson
      parameters = this.reparameterize(points, curve, parameters);
    }
    
    if (!bestCurve) {
      throw new Error('Failed to fit curve');
    }
    
    const finalErrors = this.calculateErrors(points, bestCurve, parameters);
    
    return {
      curve: bestCurve,
      rmse: this.calculateRMSE(finalErrors),
      maxError: Math.max(...finalErrors),
      iterations,
      segments: 1,
    };
  }

  /**
   * Parameterize points using chord-length, centripetal, or uniform parameterization
   */
  private parameterizePoints(points: Point2D[]): number[] {
    const n = points.length;
    const parameters: number[] = [0];
    
    switch (this.options.parameterization) {
      case 'uniform':
        for (let i = 1; i < n; i++) {
          parameters.push(i / (n - 1));
        }
        break;
        
      case 'chord-length':
        let totalLength = 0;
        const lengths: number[] = [0];
        
        for (let i = 1; i < n; i++) {
          const segmentLength = distance(points[i - 1], points[i]);
          totalLength += segmentLength;
          lengths.push(totalLength);
        }
        
        for (let i = 1; i < n; i++) {
          parameters.push(lengths[i] / totalLength);
        }
        break;
        
      case 'centripetal':
        let totalCentripetalLength = 0;
        const centripetalLengths: number[] = [0];
        
        for (let i = 1; i < n; i++) {
          const segmentLength = Math.sqrt(distance(points[i - 1], points[i]));
          totalCentripetalLength += segmentLength;
          centripetalLengths.push(totalCentripetalLength);
        }
        
        for (let i = 1; i < n; i++) {
          parameters.push(centripetalLengths[i] / totalCentripetalLength);
        }
        break;
    }
    
    return parameters;
  }

  /**
   * Estimate left tangent vector from first few points
   */
  private estimateLeftTangent(points: Point2D[]): Point2D {
    if (points.length < 2) return { x: 1, y: 0 };
    
    const dx = points[1].x - points[0].x;
    const dy = points[1].y - points[0].y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    return length > 0 ? { x: dx / length, y: dy / length } : { x: 1, y: 0 };
  }

  /**
   * Estimate right tangent vector from last few points
   */
  private estimateRightTangent(points: Point2D[]): Point2D {
    const n = points.length;
    if (n < 2) return { x: 1, y: 0 };
    
    const dx = points[n - 1].x - points[n - 2].x;
    const dy = points[n - 1].y - points[n - 2].y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    return length > 0 ? { x: dx / length, y: dy / length } : { x: 1, y: 0 };
  }

  /**
   * Generate Bézier curve using least squares method
   */
  private generateBezier(
    points: Point2D[],
    parameters: number[],
    tangent1: Point2D,
    tangent2: Point2D
  ): CubicBezier {
    const n = points.length;
    const p0 = points[0];
    const p3 = points[n - 1];
    
    // Set up the linear system A * [α₁, α₂] = b
    // where α₁ and α₂ are the distances along the tangent vectors
    let C00 = 0, C01 = 0, C11 = 0;
    let X0 = 0, X1 = 0, Y0 = 0, Y1 = 0;
    
    for (let i = 0; i < n; i++) {
      const t = parameters[i];
      const ti = 1 - t;
      
      // Bernstein basis functions
      const B0 = ti * ti * ti;
      const B1 = 3 * ti * ti * t;
      const B2 = 3 * ti * t * t;
      const B3 = t * t * t;
      
      // Basis functions for the unknowns
      const A1 = B1 * tangent1.x;
      const A2 = B2 * tangent2.x;
      const B1y = B1 * tangent1.y;
      const B2y = B2 * tangent2.y;
      
      // Accumulate matrix elements
      C00 += A1 * A1 + B1y * B1y;
      C01 += A1 * A2 + B1y * B2y;
      C11 += A2 * A2 + B2y * B2y;
      
      // Right-hand side
      const temp = points[i];
      const tmpX = temp.x - (B0 * p0.x + B3 * p3.x);
      const tmpY = temp.y - (B0 * p0.y + B3 * p3.y);
      
      X0 += A1 * tmpX;
      Y0 += B1y * tmpY;
      X1 += A2 * tmpX;
      Y1 += B2y * tmpY;
    }
    
    // Add regularization to prevent singular matrices
    C00 += this.options.regularization;
    C11 += this.options.regularization;
    
    // Solve the linear system
    const det = C00 * C11 - C01 * C01;
    let alpha1 = 0, alpha2 = 0;
    
    if (Math.abs(det) > 1e-10) {
      alpha1 = ((X0 + Y0) * C11 - (X1 + Y1) * C01) / det;
      alpha2 = ((X1 + Y1) * C00 - (X0 + Y0) * C01) / det;
    }
    
    // Ensure minimum distance to avoid degenerate curves
    const minDistance = distance(p0, p3) * 0.1;
    alpha1 = Math.max(alpha1, minDistance);
    alpha2 = Math.max(alpha2, minDistance);
    
    // Calculate control points
    const p1 = {
      x: p0.x + alpha1 * tangent1.x,
      y: p0.y + alpha1 * tangent1.y,
    };
    
    const p2 = {
      x: p3.x + alpha2 * tangent2.x,
      y: p3.y + alpha2 * tangent2.y,
    };
    
    return { p0, p1, p2, p3 };
  }

  /**
   * Calculate errors between points and curve
   */
  private calculateErrors(points: Point2D[], curve: CubicBezier, parameters: number[]): number[] {
    return parameters.map((t, i) => {
      const curvePoint = this.evaluateBezier(curve, t);
      return distance(points[i], curvePoint);
    });
  }

  /**
   * Calculate Root Mean Square Error
   */
  private calculateRMSE(errors: number[]): number {
    const sumSquares = errors.reduce((sum, error) => sum + error * error, 0);
    return Math.sqrt(sumSquares / errors.length);
  }

  /**
   * Reparameterize using Newton-Raphson method
   */
  private reparameterize(points: Point2D[], curve: CubicBezier, oldParams: number[]): number[] {
    return oldParams.map((t, i) => {
      return this.newtonRaphsonRootFind(curve, points[i], t);
    });
  }

  /**
   * Newton-Raphson iteration to find better parameter value
   */
  private newtonRaphsonRootFind(curve: CubicBezier, point: Point2D, t: number): number {
    const maxIterations = 5;
    
    for (let i = 0; i < maxIterations; i++) {
      const q = this.evaluateBezier(curve, t);
      const qprime = this.evaluateBezierDerivative(curve, t);
      
      const numerator = (q.x - point.x) * qprime.x + (q.y - point.y) * qprime.y;
      const denominator = qprime.x * qprime.x + qprime.y * qprime.y +
                         (q.x - point.x) * this.evaluateBezierSecondDerivative(curve, t).x +
                         (q.y - point.y) * this.evaluateBezierSecondDerivative(curve, t).y;
      
      if (Math.abs(denominator) < 1e-10) break;
      
      const newT = t - numerator / denominator;
      
      if (Math.abs(newT - t) < 1e-6) break;
      
      t = Math.max(0, Math.min(1, newT));
    }
    
    return t;
  }

  /**
   * Evaluate Bézier curve at parameter t
   */
  public evaluateBezier(curve: CubicBezier, t: number): Point2D {
    const ti = 1 - t;
    const t2 = t * t;
    const ti2 = ti * ti;
    const t3 = t2 * t;
    const ti3 = ti2 * ti;
    
    return {
      x: ti3 * curve.p0.x + 3 * ti2 * t * curve.p1.x + 3 * ti * t2 * curve.p2.x + t3 * curve.p3.x,
      y: ti3 * curve.p0.y + 3 * ti2 * t * curve.p1.y + 3 * ti * t2 * curve.p2.y + t3 * curve.p3.y,
    };
  }

  /**
   * Evaluate first derivative of Bézier curve at parameter t
   */
  private evaluateBezierDerivative(curve: CubicBezier, t: number): Point2D {
    const ti = 1 - t;
    const ti2 = ti * ti;
    const t2 = t * t;
    
    return {
      x: 3 * (-ti2 * curve.p0.x + ti2 * curve.p1.x - 2 * ti * t * curve.p1.x - t2 * curve.p2.x + 2 * ti * t * curve.p2.x + t2 * curve.p3.x),
      y: 3 * (-ti2 * curve.p0.y + ti2 * curve.p1.y - 2 * ti * t * curve.p1.y - t2 * curve.p2.y + 2 * ti * t * curve.p2.y + t2 * curve.p3.y),
    };
  }

  /**
   * Evaluate second derivative of Bézier curve at parameter t
   */
  private evaluateBezierSecondDerivative(curve: CubicBezier, t: number): Point2D {
    const ti = 1 - t;
    
    return {
      x: 6 * (ti * curve.p0.x - 2 * ti * curve.p1.x + ti * curve.p2.x + t * curve.p1.x - 2 * t * curve.p2.x + t * curve.p3.x),
      y: 6 * (ti * curve.p0.y - 2 * ti * curve.p1.y + ti * curve.p2.y + t * curve.p1.y - 2 * t * curve.p2.y + t * curve.p3.y),
    };
  }
}

/**
 * Calculate curvature at parameter t
 */
export function calculateCurvature(curve: CubicBezier, t: number): number {
  const fitter = new CurveFitter({ parameterization: 'centripetal', maxIterations: 1, tolerance: 0.001, regularization: 1e-6 });
  
  const firstDerivative = fitter['evaluateBezierDerivative'](curve, t);
  const secondDerivative = fitter['evaluateBezierSecondDerivative'](curve, t);
  
  const dx = firstDerivative.x;
  const dy = firstDerivative.y;
  const ddx = secondDerivative.x;
  const ddy = secondDerivative.y;
  
  const numerator = Math.abs(dx * ddy - dy * ddx);
  const denominator = Math.pow(dx * dx + dy * dy, 1.5);
  
  return denominator > 1e-10 ? numerator / denominator : 0;
}