export enum CurveType {
  SINE_WAVE = 'SINE_WAVE',
  AIRFOIL = 'AIRFOIL',
  SPIRAL = 'SPIRAL'
}

export enum InputMode {
  PRESET = 'PRESET',
  DRAWN = 'DRAWN'
}

export enum Parameterization {
  UNIFORM = 'UNIFORM',
  CHORD_LENGTH = 'CHORD_LENGTH'
}

export enum VisualizationMode {
  SOLID = 'SOLID',
  WIREFRAME = 'WIREFRAME',
  HYBRID = 'HYBRID'
}

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light'
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface GeneratorParams {
  mode: InputMode;
  curveType: CurveType;
  parameterization: Parameterization;
  
  // Stacking (Preset)
  numCurves: number; 
  pointsPerCurve: number; 
  stackSpacing: number;

  // Approximation
  uDegree: number;
  vDegree: number;
  uControlPoints: number;
  vControlPoints: number;
}

export interface SurfaceData {
  controlPoints: Point3D[][]; // The fitted control net
  surfacePoints: Point3D[]; // Triangulated points for rendering
  indices: number[]; // Mesh indices
  uKnots: number[];
  vKnots: number[];
}
