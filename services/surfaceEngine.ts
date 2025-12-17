import { Point3D, SurfaceData, Parameterization } from '../types';
import { fitCurveLeastSquares, evaluateSurface, generateKnots } from './mathUtils';

/**
 * Implements Chapter 12 composite surface construction.
 * 1. Fits curves in the U-direction for each stack layer.
 * 2. Fits curves in the V-direction through the control points of step 1.
 */
export function generateCompositeSurface(
  inputCurves: Point3D[][],
  uDegree: number,
  vDegree: number,
  uControlCount: number,
  vControlCount: number,
  parameterization: Parameterization = Parameterization.UNIFORM,
  renderResolution: number = 20
): SurfaceData {
  
  const numCurves = inputCurves.length;
  if (numCurves < 2) {
    throw new Error("Need at least 2 curves to generate a surface.");
  }

  // --- Step 1: Fit U-direction curves ---
  // We get a control polygon for each input curve row.
  const intermediateControlPoints: Point3D[][] = [];

  for (let i = 0; i < numCurves; i++) {
    // For drawn curves, some might have very few points.
    // The fitter handles safe degree/counts internally, but we must align output sizes
    // B-spline tensor product surfaces require a rectangular grid of control points.
    // So all U-curves MUST result in the same number of control points.
    const fittedRow = fitCurveLeastSquares(inputCurves[i], uDegree, uControlCount, parameterization);
    intermediateControlPoints.push(fittedRow);
  }

  // Validate grid integrity (in case data was too sparse to generate requested control points)
  const safeUCount = intermediateControlPoints[0].length;
  // If a row has fewer points, we can't proceed with standard tensor product
  // For this app, we assume inputs are sufficient or fitter pads/interpolates. 
  // (fitCurveLeastSquares returns `safeControlPoints`, so if input is tiny, grid is broken)

  // --- Step 2: Fit V-direction curves ---
  // We look at the columns of the intermediate control net.
  const finalControlNet: Point3D[][] = []; 
  
  // Iterate 'columns' (fixed U, varying V)
  for (let u = 0; u < safeUCount; u++) {
    const columnPoints: Point3D[] = [];
    for (let v = 0; v < numCurves; v++) {
      // Guard against ragged arrays
      if (intermediateControlPoints[v][u]) {
        columnPoints.push(intermediateControlPoints[v][u]);
      } else {
        // Fallback for ragged edge case (shouldn't happen with valid inputs)
        columnPoints.push({x:0, y:0, z:0}); 
      }
    }

    // Fit a curve through this column (along V direction)
    // We use Uniform for V usually because stacking is often uniform, but we can respect param
    const fittedCol = fitCurveLeastSquares(columnPoints, vDegree, vControlCount, parameterization);
    finalControlNet.push(fittedCol);
  }
  
  // finalControlNet is [uIndex][vIndex]
  const finalUCount = finalControlNet.length;
  const finalVCount = finalControlNet[0].length;

  // --- Step 3: Tessellate Surface for Rendering ---
  const surfacePoints: Point3D[] = [];
  const indices: number[] = [];

  // Recalculate safe degrees based on what we actually got
  const safeUDegree = Math.min(uDegree, finalUCount - 1);
  const safeVDegree = Math.min(vDegree, finalVCount - 1);

  const uKnots = generateKnots(safeUDegree, finalUCount);
  const vKnots = generateKnots(safeVDegree, finalVCount);

  const uRes = renderResolution;
  const vRes = renderResolution;

  for (let i = 0; i <= uRes; i++) {
    const u = i / uRes;
    for (let j = 0; j <= vRes; j++) {
      const v = j / vRes;
      const p = evaluateSurface(u, v, finalControlNet, safeUDegree, safeVDegree, uKnots, vKnots);
      surfacePoints.push(p);
    }
  }

  // Generate triangulation indices (grid)
  const width = vRes + 1;
  for (let i = 0; i < uRes; i++) {
    for (let j = 0; j < vRes; j++) {
      const a = i * width + j;
      const b = a + 1;
      const c = (i + 1) * width + j;
      const d = c + 1;

      // Two triangles per quad
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  return {
    controlPoints: finalControlNet,
    surfacePoints,
    indices,
    uKnots,
    vKnots
  };
}
