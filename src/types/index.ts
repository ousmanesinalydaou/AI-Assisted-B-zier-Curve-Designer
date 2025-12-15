export interface Point2D {
  x: number;
  y: number;
  timestamp?: number;
}

export interface CubicBezier {
  p0: Point2D;
  p1: Point2D;
  p2: Point2D;
  p3: Point2D;
}

export interface FittingOptions {
  parameterization: 'uniform' | 'chord-length' | 'centripetal';
  maxIterations: number;
  tolerance: number;
  regularization: number;
}

export interface FittingResult {
  curve: CubicBezier;
  rmse: number;
  maxError: number;
  iterations: number;
  segments: number;
}

export interface StrokeData {
  points: Point2D[];
  fittedCurves: CubicBezier[];
  timestamp: number;
  id: string;
}

export interface CurvatureData {
  t: number;
  curvature: number;
  point: Point2D;
  tangent: Point2D;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export type SurfaceType = 'revolution' | 'patch' | 'loft' | 'extrusion' | 'tube' | 'vase';

export interface SurfaceData {
  id: string;
  type: SurfaceType;
  sourceStrokeIds: string[]; // Stroke(s) used to generate this surface
  timestamp: number;
  options: {
    resolution: number;
    rotationSteps?: number;
    axis?: 'x' | 'y' | 'z';
    radius?: number;
  };
}

export interface AppState {
  // Drawing state
  isDrawing: boolean;
  currentStroke: Point2D[];
  strokes: StrokeData[];
  selectedStroke: string | null;
  selectedControlPoint: { strokeId: string; curveIndex: number; pointIndex: number } | null;
  
  // 3D Surface state
  surfaces: SurfaceData[];
  selectedSurface: string | null;
  show3DView: boolean;
  show3DPanel: boolean;
  surfaceMode: SurfaceType | null;
  
  // UI state
  theme: 'light' | 'dark';
  showControlPoints: boolean;
  showCurvature: boolean;
  showGrid: boolean;
  showAIPanel: boolean;
  showSnapToGrid: boolean;
  showMeasurements: boolean;
  selectMode: boolean;
  
  // History
  history: StrokeData[][];
  historyIndex: number;
  
  // Settings
  fittingOptions: FittingOptions;
  renderOptions: {
    strokeWidth: number;
    curveWidth: number;
    controlPointSize: number;
    showResiduals: boolean;
  };
}