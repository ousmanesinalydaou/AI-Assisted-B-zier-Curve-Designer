import { Point, ParameterizationMethod } from '../types';
import { solveLinearSystem, transpose, multiply, bernstein } from './mathUtils';

// Calculate parameter values t_i for each point
export const calculateParameters = (points: Point[], method: ParameterizationMethod): number[] => {
  const L = points.length - 1;
  if (L < 0) return [];
  if (L === 0) return [0]; // Single point

  const t: number[] = new Array(points.length).fill(0);

  if (method === ParameterizationMethod.UNIFORM) {
    for (let i = 0; i <= L; i++) {
      t[i] = i / L;
    }
  } else if (method === ParameterizationMethod.CHORD_LENGTH) {
    t[0] = 0;
    let totalLength = 0;
    
    // Calculate cumulative distances
    for (let i = 1; i <= L; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      t[i] = t[i - 1] + dist;
      totalLength += dist;
    }

    // Normalize to [0, 1]
    if (totalLength > 0) {
      for (let i = 0; i <= L; i++) {
        t[i] /= totalLength;
      }
    } else {
        // Fallback if all points are same
        for (let i = 0; i <= L; i++) {
            t[i] = i / L;
        }
    }
  }

  return t;
};

// Least Squares Approximation
// Returns Control Points for a Bezier curve of degree n
export const approximateCurve = (points: Point[], degree: number, method: ParameterizationMethod): { controlPoints: Point[], error: number } | null => {
  const numPoints = points.length;
  // Need at least degree + 1 points to even define the problem properly, 
  // though strictly LS works as long as we have enough points to minimize.
  // We typically want numPoints > degree for approximation. 
  // If numPoints = degree + 1, it's interpolation.
  
  if (numPoints < 2) return null;

  const t = calculateParameters(points, method);

  // Construct Matrix M ((L+1) x (degree+1))
  // M_ij = B_j^n(t_i)
  const M: number[][] = [];
  for (let i = 0; i < numPoints; i++) {
    const row: number[] = [];
    for (let j = 0; j <= degree; j++) {
      row.push(bernstein(degree, j, t[i]));
    }
    M.push(row);
  }

  // Construct Matrix P ((L+1) x 2)
  const P_mat: number[][] = points.map(p => [p.x, p.y]);

  // Normal Equations: (M^T * M) * B = M^T * P
  // Let A = M^T * M
  // Let b_vec = M^T * P
  // Solve A * X = b_vec for X (Control Points)

  const MT = transpose(M);
  const A = multiply(MT, M);
  const b_vec = multiply(MT, P_mat);

  const solution = solveLinearSystem(A, b_vec);

  if (!solution) return null;

  const controlPoints: Point[] = solution.map(row => ({ x: row[0], y: row[1] }));
  
  // Calculate Error (Sum of Squared Distances)
  let error = 0;
  // Re-evaluate curve at parameters t[i] to see deviation
  for(let i=0; i<numPoints; i++) {
      const pObs = points[i];
      const pEst = evaluateBezier(controlPoints, t[i]);
      const dx = pObs.x - pEst.x;
      const dy = pObs.y - pEst.y;
      error += (dx*dx + dy*dy);
  }

  return { controlPoints, error };
};

// Evaluate Bezier curve at t using De Casteljau or explicit sum
export const evaluateBezier = (controlPoints: Point[], t: number): Point => {
  let x = 0;
  let y = 0;
  const n = controlPoints.length - 1;
  for (let i = 0; i <= n; i++) {
    const b = bernstein(n, i, t);
    x += b * controlPoints[i].x;
    y += b * controlPoints[i].y;
  }
  return { x, y };
};

// Generate points for drawing the smooth curve
export const generateCurvePoints = (controlPoints: Point[], samples: number = 100): Point[] => {
  const curve: Point[] = [];
  for (let i = 0; i <= samples; i++) {
    curve.push(evaluateBezier(controlPoints, i / samples));
  }
  return curve;
};

// Calculate residuals for visualization
export const calculateResiduals = (dataPoints: Point[], controlPoints: Point[], method: ParameterizationMethod) => {
    const t = calculateParameters(dataPoints, method);
    const lines = [];
    for(let i = 0; i < dataPoints.length; i++) {
        const curvePt = evaluateBezier(controlPoints, t[i]);
        lines.push({ start: dataPoints[i], end: curvePt });
    }
    return lines;
}
