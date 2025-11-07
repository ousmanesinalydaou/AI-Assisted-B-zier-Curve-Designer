/**
 * API Client for Backend Communication
 * 
 * Provides type-safe API calls to the FastAPI backend.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface CubicBezierCurve {
  p0: Point2D;
  p1: Point2D;
  p2: Point2D;
  p3: Point2D;
}

export interface FittingOptions {
  parameterization?: 'uniform' | 'chord-length' | 'centripetal';
  max_iterations?: number;
  tolerance?: number;
  regularization?: number;
}

export interface CurveSegment {
  control_points: CubicBezierCurve;
  rmse: number;
  max_error: number;
}

export interface FitCurveRequest {
  points: Point2D[];
  options?: FittingOptions;
}

export interface FitCurveResponse {
  segments: CurveSegment[];
  total_rmse: number;
  iterations: number;
  status: 'ok' | 'partial' | 'failed';
  message?: string;
}

export interface SmoothCurveRequest {
  control_points: CubicBezierCurve[];
  mode: 'C1' | 'C2';
  lambda: number;
}

export interface SmoothCurveResponse {
  control_points: CubicBezierCurve[];
  status: 'smoothed' | 'already_smooth' | 'failed';
  discontinuities_fixed: number;
  message?: string;
}

export interface PredictControlPointsRequest {
  points: Point2D[];
  num_samples?: number;
}

export interface PredictControlPointsResponse {
  control_points: CubicBezierCurve;
  confidence: number;
  status: 'ok' | 'model_unavailable' | 'failed';
  message?: string;
}

export interface CurvaturePoint {
  t: number;
  curvature: number;
  position: Point2D;
}

export interface CurvatureAnalysisResponse {
  curvature_profile: CurvaturePoint[];
  max_curvature: number;
  min_curvature: number;
  avg_curvature: number;
}

export interface SaveProjectRequest {
  name: string;
  description?: string;
  strokes: any[];
  metadata?: any;
}

export interface SaveProjectResponse {
  project_id: string;
  status: string;
  message?: string;
}

export interface LoadProjectResponse {
  project_id: string;
  name: string;
  description?: string;
  strokes: any[];
  metadata?: any;
  created_at: string;
  updated_at: string;
}

/**
 * API Client class for interacting with the backend
 */
export class APIClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'http://localhost:8000/api') {
    this.baseUrl = baseUrl;
    this.timeout = 30000;
  }

  /**
   * Fit cubic Bézier curve to points
   */
  async fitCurve(
    points: Point2D[],
    options?: FittingOptions
  ): Promise<FitCurveResponse> {
    const request: FitCurveRequest = { points, options };
    
    const response = await fetch(`${this.baseUrl}/curves/fit-curve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Smooth curve segments with continuity constraints
   */
  async smoothCurve(
    control_points: CubicBezierCurve[],
    mode: 'C1' | 'C2' = 'C1',
    lambda_value: number = 0.01
  ): Promise<SmoothCurveResponse> {
    const request: SmoothCurveRequest = {
      control_points,
      mode,
      lambda: lambda_value,
    };
    
    const response = await fetch(`${this.baseUrl}/curves/smooth-curve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Predict control points using ML model
   */
  async predictControlPoints(
    points: Point2D[],
    num_samples: number = 32
  ): Promise<PredictControlPointsResponse> {
    const request: PredictControlPointsRequest = {
      points,
      num_samples,
    };
    
    const response = await fetch(`${this.baseUrl}/ml/predict-controlpoints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Analyze curvature profile of a curve
   */
  async analyzeCurvature(
    control_points: CubicBezierCurve,
    num_samples: number = 100
  ): Promise<CurvatureAnalysisResponse> {
    const request = {
      control_points,
      num_samples,
    };
    
    const response = await fetch(`${this.baseUrl}/curves/curvature-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Save a project to the database
   */
  async saveProject(
    name: string,
    strokes: any[],
    description?: string,
    metadata?: any
  ): Promise<SaveProjectResponse> {
    const request: SaveProjectRequest = {
      name,
      description,
      strokes,
      metadata,
    };
    
    const response = await fetch(`${this.baseUrl}/projects/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Load a project from the database
   */
  async loadProject(project_id: string): Promise<LoadProjectResponse> {
    const response = await fetch(`${this.baseUrl}/projects/${project_id}`, {
      method: 'GET',
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * List all projects
   */
  async listProjects(skip: number = 0, limit: number = 100): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/projects/?skip=${skip}&limit=${limit}`,
      {
        method: 'GET',
        signal: AbortSignal.timeout(this.timeout),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Check backend health status
   */
  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.baseUrl.replace('/api', '')}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Health check failed: HTTP ${response.status}`);
    }

    return response.json();
  }
}

// Create singleton instance
const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';
export const apiClient = new APIClient(apiUrl);

