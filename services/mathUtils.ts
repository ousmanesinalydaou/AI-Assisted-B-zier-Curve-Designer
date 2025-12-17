import { Point3D, Parameterization } from '../types';

// --- Linear Algebra Helpers ---

export class Matrix {
  rows: number;
  cols: number;
  data: number[][];

  constructor(rows: number, cols: number, initial = 0) {
    this.rows = rows;
    this.cols = cols;
    this.data = Array(rows).fill(0).map(() => Array(cols).fill(initial));
  }

  static fromArray(arr: number[][]): Matrix {
    const m = new Matrix(arr.length, arr[0].length);
    m.data = arr;
    return m;
  }

  transpose(): Matrix {
    const m = new Matrix(this.cols, this.rows);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        m.data[j][i] = this.data[i][j];
      }
    }
    return m;
  }

  multiply(b: Matrix): Matrix {
    if (this.cols !== b.rows) throw new Error("Matrix dimension mismatch");
    const result = new Matrix(this.rows, b.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < b.cols; j++) {
        let sum = 0;
        for (let k = 0; k < this.cols; k++) {
          sum += this.data[i][k] * b.data[k][j];
        }
        result.data[i][j] = sum;
      }
    }
    return result;
  }
}

// Gaussian elimination solver for Ax = b
export function solveLinearSystem(A: Matrix, b: Matrix): Matrix {
  // Augmented matrix [A|b]
  const n = A.rows;
  const aug = new Matrix(n, n + b.cols);
  
  // Copy A and b into augmented
  for(let i=0; i<n; i++) {
    for(let j=0; j<n; j++) aug.data[i][j] = A.data[i][j];
    for(let j=0; j<b.cols; j++) aug.data[i][n+j] = b.data[i][j];
  }

  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(aug.data[k][i]) > Math.abs(aug.data[maxRow][i])) maxRow = k;
    }
    
    // Swap rows
    [aug.data[i], aug.data[maxRow]] = [aug.data[maxRow], aug.data[i]];

    // Make 0 below
    for (let k = i + 1; k < n; k++) {
      const factor = aug.data[k][i] / aug.data[i][i];
      for (let j = i; j < aug.cols; j++) {
        aug.data[k][j] -= factor * aug.data[i][j];
      }
    }
  }

  // Back substitution
  const x = new Matrix(n, b.cols);
  for (let i = n - 1; i >= 0; i--) {
    for (let col = 0; col < b.cols; col++) {
      let sum = 0;
      for (let j = i + 1; j < n; j++) {
        sum += aug.data[i][j] * x.data[j][col];
      }
      x.data[i][col] = (aug.data[i][n + col] - sum) / aug.data[i][i];
    }
  }

  return x;
}

// --- B-Spline Functions ---

// Generate uniform open knot vector
export function generateKnots(degree: number, numControlPoints: number): number[] {
  const m = numControlPoints + degree + 1;
  const knots: number[] = [];
  for (let i = 0; i < m; i++) {
    if (i <= degree) knots.push(0);
    else if (i >= m - degree - 1) knots.push(1);
    else {
      knots.push((i - degree) / (numControlPoints - degree));
    }
  }
  return knots;
}

// Cox-de Boor recursion
export function basisFunction(i: number, p: number, u: number, knots: number[]): number {
  if (p === 0) {
    return (u >= knots[i] && u < knots[i + 1]) || (u === 1 && knots[i+1] === 1) ? 1 : 0;
  }

  let left = 0;
  if (knots[i + p] - knots[i] !== 0) {
    left = ((u - knots[i]) / (knots[i + p] - knots[i])) * basisFunction(i, p - 1, u, knots);
  }

  let right = 0;
  if (knots[i + p + 1] - knots[i + 1] !== 0) {
    right = ((knots[i + p + 1] - u) / (knots[i + p + 1] - knots[i + 1])) * basisFunction(i + 1, p - 1, u, knots);
  }

  return left + right;
}

// Compute parameters for points
export function computeParameters(points: Point3D[], method: Parameterization): number[] {
  const n = points.length;
  if (n === 0) return [];
  if (n === 1) return [0];

  const params = new Array(n).fill(0);
  
  if (method === Parameterization.UNIFORM) {
    for (let i = 0; i < n; i++) {
      params[i] = i / (n - 1);
    }
  } else {
    // Chord Length
    let totalLength = 0;
    const dists = [0];
    for (let i = 1; i < n; i++) {
      const dx = points[i].x - points[i-1].x;
      const dy = points[i].y - points[i-1].y;
      const dz = points[i].z - points[i-1].z;
      const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
      totalLength += d;
      dists.push(totalLength);
    }
    
    if (totalLength === 0) {
      // Degenerate case, all points same
      return new Array(n).fill(0);
    }

    for (let i = 0; i < n; i++) {
      params[i] = dists[i] / totalLength;
    }
  }

  return params;
}

// Evaluate a B-spline curve at t
export function evaluateBSplineCurve(t: number, degree: number, controlPoints: Point3D[], knots: number[]): Point3D {
  let x = 0, y = 0, z = 0;
  const n = controlPoints.length;
  for(let i=0; i<n; i++) {
    const b = basisFunction(i, degree, t, knots);
    x += b * controlPoints[i].x;
    y += b * controlPoints[i].y;
    z += b * controlPoints[i].z;
  }
  return {x, y, z};
}

// --- Least Squares Fitting ---

/**
 * Fits a B-spline curve to a set of points.
 * Returns the control points.
 * Solves (N^T * N) * D = N^T * P
 */
export function fitCurveLeastSquares(
  points: Point3D[], 
  degree: number, 
  numControlPoints: number,
  method: Parameterization = Parameterization.UNIFORM
): Point3D[] {
  const numSamples = points.length;
  
  // Guard for small input
  if (numSamples < 2) return points; 

  // If samples < control points, reduce control points
  const safeControlPoints = Math.min(numControlPoints, numSamples);
  const safeDegree = Math.min(degree, safeControlPoints - 1);

  const knots = generateKnots(safeDegree, safeControlPoints);
  const uParams = computeParameters(points, method);

  // Build Basis Matrix N (numSamples x safeControlPoints)
  const N = new Matrix(numSamples, safeControlPoints);
  for (let i = 0; i < numSamples; i++) {
    for (let j = 0; j < safeControlPoints; j++) {
      N.data[i][j] = basisFunction(j, safeDegree, uParams[i], knots);
    }
  }

  // Build P Matrix (numSamples x 3)
  const P = new Matrix(numSamples, 3);
  for (let i = 0; i < numSamples; i++) {
    P.data[i][0] = points[i].x;
    P.data[i][1] = points[i].y;
    P.data[i][2] = points[i].z;
  }

  const NT = N.transpose();
  const A = NT.multiply(N); // (N^T * N)
  const B = NT.multiply(P); // (N^T * P)

  // Add regularization to diagonal to prevent singularity
  for(let i=0; i<A.rows; i++) A.data[i][i] += 1e-5;

  const DMatrix = solveLinearSystem(A, B);

  const controlPoints: Point3D[] = [];
  for (let i = 0; i < safeControlPoints; i++) {
    controlPoints.push({
      x: DMatrix.data[i][0],
      y: DMatrix.data[i][1],
      z: DMatrix.data[i][2]
    });
  }

  return controlPoints;
}

// Evaluate surface point S(u, v) given control points grid
export function evaluateSurface(
  u: number, 
  v: number, 
  controlNet: Point3D[][], 
  uDegree: number, 
  vDegree: number, 
  uKnots: number[],
  vKnots: number[]
): Point3D {
  const nU = controlNet.length; // rows
  const nV = controlNet[0].length; // cols

  let x = 0, y = 0, z = 0;

  for (let i = 0; i < nU; i++) {
    const nip = basisFunction(i, uDegree, u, uKnots);
    if (Math.abs(nip) < 1e-6) continue;

    for (let j = 0; j < nV; j++) {
      const mjq = basisFunction(j, vDegree, v, vKnots);
      if (Math.abs(mjq) < 1e-6) continue;

      const basis = nip * mjq;
      x += controlNet[i][j].x * basis;
      y += controlNet[i][j].y * basis;
      z += controlNet[i][j].z * basis;
    }
  }

  return { x, y, z };
}
