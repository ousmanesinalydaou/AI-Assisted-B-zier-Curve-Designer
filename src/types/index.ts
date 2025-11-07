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

export interface AppState {
  // Drawing state
  isDrawing: boolean;
  currentStroke: Point2D[];
  strokes: StrokeData[];
  selectedStroke: string | null;
  selectedControlPoint: { strokeId: string; curveIndex: number; pointIndex: number } | null;
  
  // UI state
  theme: 'light' | 'dark';
  showControlPoints: boolean;
  showCurvature: boolean;
  showGrid: boolean;
  
  // Settings
  fittingOptions: FittingOptions;
  renderOptions: {
    strokeWidth: number;
    curveWidth: number;
    controlPointSize: number;
    showResiduals: boolean;
  };
}