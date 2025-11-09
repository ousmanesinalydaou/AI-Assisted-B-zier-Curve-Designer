# API Reference

## Overview

The Bézier Curve Designer API provides RESTful endpoints for curve fitting, smoothing, curvature analysis, ML-based predictions, and project persistence.

**Base URL**: `http://localhost:8000/api`

**Documentation**: Interactive Swagger UI available at `http://localhost:8000/docs`

---

## Authentication

Currently, the API does not require authentication. Future versions will implement JWT-based authentication for project management.

---

## Endpoints

### Curve Fitting

#### POST /api/curves/fit-curve

Fits one or more cubic Bézier curves to input points using iterative least-squares with Newton-Raphson reparameterization.

**Request Body**:
```json
{
  "points": [
    {"x": 0.0, "y": 0.0},
    {"x": 0.5, "y": 0.5},
    {"x": 1.0, "y": 1.0}
  ],
  "options": {
    "parameterization": "centripetal",
    "max_iterations": 20,
    "tolerance": 0.001,
    "regularization": 0.000001
  }
}
```

**Parameters**:
- `points` (required): Array of 2D points (minimum 2 points)
- `options` (optional): Fitting parameters
  - `parameterization`: `"uniform"` | `"chord-length"` | `"centripetal"` (default: `"centripetal"`)
  - `max_iterations`: Maximum optimization iterations (default: 20)
  - `tolerance`: Convergence tolerance for RMSE (default: 0.001)
  - `regularization`: Numerical stability parameter (default: 1e-6)

**Response** (200 OK):
```json
{
  "segments": [
    {
      "control_points": {
        "p0": {"x": 0.0, "y": 0.0},
        "p1": {"x": 0.33, "y": 0.25},
        "p2": {"x": 0.66, "y": 0.75},
        "p3": {"x": 1.0, "y": 1.0}
      },
      "rmse": 0.0012,
      "max_error": 0.0035
    }
  ],
  "total_rmse": 0.0012,
  "iterations": 8,
  "status": "ok",
  "message": null
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input (e.g., too few points)
- `500 Internal Server Error`: Curve fitting failed

---

#### POST /api/curves/smooth-curve

Enforces continuity constraints (C¹ or C²) between multiple curve segments.

**Request Body**:
```json
{
  "control_points": [
    {
      "p0": {"x": 0.0, "y": 0.0},
      "p1": {"x": 0.33, "y": 0.5},
      "p2": {"x": 0.66, "y": 0.5},
      "p3": {"x": 1.0, "y": 0.0}
    },
    {
      "p0": {"x": 1.0, "y": 0.0},
      "p1": {"x": 1.33, "y": -0.5},
      "p2": {"x": 1.66, "y": -0.5},
      "p3": {"x": 2.0, "y": 0.0}
    }
  ],
  "mode": "C1",
  "lambda": 0.5
}
```

**Parameters**:
- `control_points` (required): Array of cubic Bézier curves
- `mode` (required): `"C1"` (tangent continuity) or `"C2"` (curvature continuity)
- `lambda` (required): Smoothing weight (0 = preserve original, 1 = maximum smoothness)

**Response** (200 OK):
```json
{
  "control_points": [
    { /* adjusted curve 1 */ },
    { /* adjusted curve 2 */ }
  ],
  "status": "smoothed",
  "discontinuities_fixed": 1,
  "message": "Fixed 1 discontinuities"
}
```

---

#### POST /api/curves/curvature-analysis

Computes curvature profile κ(t) along a cubic Bézier curve.

**Request Body**:
```json
{
  "control_points": {
    "p0": {"x": 0.0, "y": 0.0},
    "p1": {"x": 0.33, "y": 0.5},
    "p2": {"x": 0.66, "y": 0.5},
    "p3": {"x": 1.0, "y": 0.0}
  },
  "num_samples": 100
}
```

**Response** (200 OK):
```json
{
  "curvature_profile": [
    {
      "t": 0.0,
      "curvature": 1.234,
      "position": {"x": 0.0, "y": 0.0}
    },
    ...
  ],
  "max_curvature": 2.456,
  "min_curvature": 0.123,
  "avg_curvature": 1.234
}
```

---

### Machine Learning

#### POST /api/ml/predict-controlpoints

Uses a trained neural network to predict cubic Bézier control points from resampled stroke data (warm-start for optimization).

**Request Body**:
```json
{
  "points": [
    {"x": 0.0, "y": 0.0},
    {"x": 0.03125, "y": 0.03},
    ... // 32 points total
  ],
  "num_samples": 32
}
```

**Response** (200 OK):
```json
{
  "control_points": {
    "p0": {"x": 0.0, "y": 0.0},
    "p1": {"x": 0.35, "y": 0.45},
    "p2": {"x": 0.65, "y": 0.55},
    "p3": {"x": 1.0, "y": 1.0}
  },
  "confidence": 0.87,
  "status": "ok",
  "message": "Control points predicted successfully"
}
```

**Response** (model unavailable):
```json
{
  "status": "model_unavailable",
  "message": "ML model is not available. Use traditional curve fitting instead."
}
```

---

#### GET /api/ml/status

Checks ML model availability.

**Response** (200 OK):
```json
{
  "model_available": true,
  "model_path": "ControlPointPredictor",
  "device": "cpu",
  "input_points": 32,
  "message": "ML model ready"
}
```

---

### Projects

#### POST /api/projects/save

Saves a project to the database.

**Request Body**:
```json
{
  "name": "My Design",
  "description": "A beautiful curve design",
  "strokes": [
    {
      "id": "stroke_123",
      "points": [[10, 20], [30, 40]],
      "fitted_curves": [],
      "timestamp": 1699564800000
    }
  ],
  "metadata": {
    "canvas_width": 1920,
    "canvas_height": 1080
  }
}
```

**Response** (200 OK):
```json
{
  "project_id": "507f1f77bcf86cd799439011",
  "status": "saved",
  "message": "Project 'My Design' saved successfully"
}
```

---

#### GET /api/projects/{project_id}

Loads a project from the database.

**Response** (200 OK):
```json
{
  "project_id": "507f1f77bcf86cd799439011",
  "name": "My Design",
  "description": "A beautiful curve design",
  "strokes": [...],
  "metadata": {...},
  "created_at": "2023-11-07T12:00:00Z",
  "updated_at": "2023-11-07T12:30:00Z"
}
```

---

#### GET /api/projects/

Lists all projects.

**Query Parameters**:
- `skip` (optional): Number of projects to skip (default: 0)
- `limit` (optional): Maximum projects to return (default: 100)

**Response** (200 OK):
```json
{
  "projects": [
    {
      "project_id": "...",
      "name": "My Design",
      "description": "...",
      "created_at": "...",
      "updated_at": "...",
      "stroke_count": 5
    }
  ],
  "total": 1
}
```

---

#### PUT /api/projects/{project_id}

Updates an existing project.

**Request Body**: Same as save request

**Response** (200 OK):
```json
{
  "project_id": "507f1f77bcf86cd799439011",
  "status": "updated",
  "message": "Project 'My Design' updated successfully"
}
```

---

#### DELETE /api/projects/{project_id}

Deletes a project permanently.

**Response** (200 OK):
```json
{
  "status": "deleted",
  "message": "Project 'My Design' deleted successfully"
}
```

---

### Health Check

#### GET /health

Health check endpoint for monitoring.

**Response** (200 OK):
```json
{
  "status": "healthy",
  "service": "AI-Assisted Bézier Curve Designer API",
  "version": "1.0.0"
}
```

---

## Error Handling

All endpoints return standard HTTP status codes:

- **200 OK**: Request succeeded
- **400 Bad Request**: Invalid input parameters
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation error
- **500 Internal Server Error**: Server error

Error responses include a `detail` field:

```json
{
  "detail": "Error message describing the problem"
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. Production deployments should implement rate limiting at the reverse proxy level.

---

## CORS Configuration

The API accepts requests from the following origins:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:8080`

Configure additional origins via the `BACKEND_CORS_ORIGINS` environment variable.

---

## Interactive Documentation

Visit these URLs when the server is running:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/api/openapi.json`
