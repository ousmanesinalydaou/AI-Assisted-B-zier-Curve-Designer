import { CurveType, Point3D } from '../types';

export function generateStackedCurves(
  type: CurveType,
  numCurves: number,
  pointsPerCurve: number,
  spacing: number
): Point3D[][] {
  const curves: Point3D[][] = [];

  for (let k = 0; k < numCurves; k++) {
    const curvePoints: Point3D[] = [];
    const z = k * spacing - (numCurves * spacing) / 2; // Center Z around 0
    
    // Parameter t goes from 0 to 1
    for (let i = 0; i < pointsPerCurve; i++) {
      const t = i / (pointsPerCurve - 1);
      let x = 0;
      let y = 0;

      switch (type) {
        case CurveType.SINE_WAVE:
          // A wave that shifts phase as it stacks
          x = (t - 0.5) * 10;
          y = Math.sin(t * Math.PI * 4 + (k * 0.5)) * 2;
          break;

        case CurveType.AIRFOIL:
          // NACA-like 4-digit symmetric airfoil approximation
          // x from 0 to 1, scaled
          const lx = t; 
          x = (lx - 0.5) * 5;
          // Thickness distribution tapering
          // Base thickness changes with stack index k to create a wing
          const thick = 0.6 * (1 - (k/numCurves) * 0.5); 
          const yt = 5 * thick * (0.2969 * Math.sqrt(lx) - 0.1260 * lx - 0.3516 * lx**2 + 0.2843 * lx**3 - 0.1015 * lx**4);
          // Upper surface for half, lower for other half? 
          // Simplified: Just returning the camber line + thickness for visual
          y = yt; 
          // Note: Real airfoil needs wrap around. We'll do a top-surface visual here.
          break;

        case CurveType.SPIRAL:
          // Spiral radius changes with stack
          const radius = 2 + Math.sin(k * 0.5);
          const angle = t * Math.PI * 2;
          x = Math.cos(angle) * radius;
          y = Math.sin(angle) * radius;
          break;
      }

      curvePoints.push({ x, y, z });
    }
    curves.push(curvePoints);
  }

  return curves;
}
