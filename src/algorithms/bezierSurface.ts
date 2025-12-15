/**
 * Bézier Surface Generation Algorithms
 * 
 * This module implements advanced 3D surface generation techniques:
 * - Surface of Revolution (rotating curves around an axis)
 * - Bézier Patches (bicubic surface patches)
 * - Lofting (surfaces between multiple curves)
 * - Extrusion (sweeping curves along paths)
 * 
 * Author: OUSMANE DAOU
 * Supervisor: Kunkli Roland Imre
 * University of Debrecen, Faculty of Informatics
 */

import * as THREE from 'three';
import { CubicBezier, Point2D } from '../types';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface SurfaceOptions {
  resolution: number; // Number of divisions for mesh generation
  rotationSteps?: number; // For surface of revolution
  axis?: 'x' | 'y' | 'z'; // Rotation axis
}

/**
 * Evaluate a cubic Bézier curve at parameter t
 */
function evaluateBezierCurve(curve: CubicBezier, t: number): Point2D {
  const t2 = t * t;
  const t3 = t2 * t;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;

  return {
    x: mt3 * curve.p0.x + 3 * mt2 * t * curve.p1.x + 3 * mt * t2 * curve.p2.x + t3 * curve.p3.x,
    y: mt3 * curve.p0.y + 3 * mt2 * t * curve.p1.y + 3 * mt * t2 * curve.p2.y + t3 * curve.p3.y,
  };
}

/**
 * Generate a Surface of Revolution by rotating a Bézier curve around an axis
 * 
 * Mathematical Formula:
 * For a curve C(t) = (x(t), y(t)) rotated around the Y-axis:
 * S(u, v) = (x(u)cos(2πv), y(u), x(u)sin(2πv))
 * where u ∈ [0,1] is the curve parameter, v ∈ [0,1] is the rotation parameter
 */
export function generateSurfaceOfRevolution(
  curve: CubicBezier,
  options: SurfaceOptions = { resolution: 32, rotationSteps: 32, axis: 'y' }
): THREE.BufferGeometry {
  const { resolution, rotationSteps = 32, axis = 'y' } = options;
  
  const geometry = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Generate surface points
  for (let i = 0; i <= resolution; i++) {
    const u = i / resolution;
    const point = evaluateBezierCurve(curve, u);
    
    for (let j = 0; j <= rotationSteps; j++) {
      const v = j / rotationSteps;
      const angle = v * Math.PI * 2;
      
      let x: number, y: number, z: number;
      
      // Apply rotation based on axis
      switch (axis) {
        case 'y': // Rotate around Y-axis
          x = point.x * Math.cos(angle);
          y = point.y;
          z = point.x * Math.sin(angle);
          break;
        case 'x': // Rotate around X-axis
          x = point.x;
          y = point.y * Math.cos(angle);
          z = point.y * Math.sin(angle);
          break;
        case 'z': // Rotate around Z-axis
          x = point.x * Math.cos(angle);
          y = point.x * Math.sin(angle);
          z = point.y;
          break;
      }
      
      vertices.push(x, y, z);
      uvs.push(u, v);
      
      // Calculate normal (simplified - perpendicular to surface)
      const normal = new THREE.Vector3(x, y, z).normalize();
      normals.push(normal.x, normal.y, normal.z);
    }
  }

  // Generate indices for triangles
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < rotationSteps; j++) {
      const a = i * (rotationSteps + 1) + j;
      const b = a + rotationSteps + 1;
      const c = a + 1;
      const d = b + 1;
      
      // Two triangles per quad
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals(); // Recalculate smooth normals

  return geometry;
}

/**
 * Generate a Bicubic Bézier Patch from a 4x4 grid of control points
 * 
 * Mathematical Formula:
 * S(u, v) = Σ(i=0 to 3) Σ(j=0 to 3) B_i,3(u) * B_j,3(v) * P_ij
 * where B_i,n(t) are Bernstein polynomials
 */
export function generateBezierPatch(
  controlPoints: Point3D[][], // 4x4 grid of control points
  options: SurfaceOptions = { resolution: 32 }
): THREE.BufferGeometry {
  const { resolution } = options;
  
  if (controlPoints.length !== 4 || controlPoints.some(row => row.length !== 4)) {
    throw new Error('Bézier patch requires a 4x4 grid of control points');
  }

  const geometry = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Bernstein polynomial
  const bernstein = (i: number, n: number, t: number): number => {
    const binomial = (n: number, k: number): number => {
      let coeff = 1;
      for (let x = n - k + 1; x <= n; x++) coeff *= x;
      for (let x = 1; x <= k; x++) coeff /= x;
      return coeff;
    };
    return binomial(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
  };

  // Evaluate patch at (u, v)
  const evaluatePatch = (u: number, v: number): Point3D => {
    let x = 0, y = 0, z = 0;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const blend = bernstein(i, 3, u) * bernstein(j, 3, v);
        x += blend * controlPoints[i][j].x;
        y += blend * controlPoints[i][j].y;
        z += blend * controlPoints[i][j].z;
      }
    }
    return { x, y, z };
  };

  // Generate surface points
  for (let i = 0; i <= resolution; i++) {
    const u = i / resolution;
    for (let j = 0; j <= resolution; j++) {
      const v = j / resolution;
      const point = evaluatePatch(u, v);
      
      vertices.push(point.x, point.y, point.z);
      uvs.push(u, v);
    }
  }

  // Generate indices
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const a = i * (resolution + 1) + j;
      const b = a + resolution + 1;
      const c = a + 1;
      const d = b + 1;
      
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Generate a lofted surface between multiple Bézier curves
 * Creates a smooth surface that interpolates between the given curves
 */
export function generateLoftedSurface(
  curves: CubicBezier[],
  options: SurfaceOptions = { resolution: 32 }
): THREE.BufferGeometry {
  const { resolution } = options;
  const numCurves = curves.length;
  
  if (numCurves < 2) {
    throw new Error('Lofting requires at least 2 curves');
  }

  const geometry = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Generate surface points
  for (let i = 0; i < numCurves; i++) {
    for (let j = 0; j <= resolution; j++) {
      const t = j / resolution;
      const point = evaluateBezierCurve(curves[i], t);
      
      vertices.push(point.x, point.y, i * 10); // Spacing between curves
      uvs.push(t, i / (numCurves - 1));
    }
  }

  // Generate indices
  for (let i = 0; i < numCurves - 1; i++) {
    for (let j = 0; j < resolution; j++) {
      const a = i * (resolution + 1) + j;
      const b = a + resolution + 1;
      const c = a + 1;
      const d = b + 1;
      
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Extrude a Bézier curve along a path
 * Creates a 3D surface by sweeping the curve along another curve
 */
export function generateExtrudedSurface(
  profile: CubicBezier,
  path: CubicBezier,
  options: SurfaceOptions = { resolution: 32 }
): THREE.BufferGeometry {
  const { resolution } = options;
  
  const geometry = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const indices: number[] = [];

  // Sample points along both curves
  const profilePoints: Point2D[] = [];
  const pathPoints: Point2D[] = [];
  
  for (let i = 0; i <= resolution; i++) {
    const t = i / resolution;
    profilePoints.push(evaluateBezierCurve(profile, t));
    pathPoints.push(evaluateBezierCurve(path, t));
  }

  // Generate surface by sweeping profile along path
  for (let i = 0; i <= resolution; i++) {
    const pathPoint = pathPoints[i];
    for (let j = 0; j <= resolution; j++) {
      const profilePoint = profilePoints[j];
      
      // Simple extrusion: add profile offset to path position
      vertices.push(
        pathPoint.x + profilePoint.x * 0.1,
        pathPoint.y + profilePoint.y * 0.1,
        i * 0.1
      );
    }
  }

  // Generate indices
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const a = i * (resolution + 1) + j;
      const b = a + resolution + 1;
      const c = a + 1;
      const d = b + 1;
      
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Create a simple vase shape from a curve (demonstration of surface of revolution)
 */
export function generateVase(
  curve: CubicBezier,
  options: SurfaceOptions = { resolution: 64, rotationSteps: 64 }
): THREE.BufferGeometry {
  return generateSurfaceOfRevolution(curve, options);
}

/**
 * Convert 2D control points to 3D for patch generation
 */
export function create3DControlGrid(
  curves: CubicBezier[],
  heightMap?: number[][]
): Point3D[][] {
  const grid: Point3D[][] = [];
  
  // Create a 4x4 grid from multiple curves
  for (let i = 0; i < 4; i++) {
    grid[i] = [];
    const curveIndex = Math.min(i, curves.length - 1);
    const curve = curves[curveIndex];
    
    const points = [curve.p0, curve.p1, curve.p2, curve.p3];
    for (let j = 0; j < 4; j++) {
      const point = points[j];
      const height = heightMap ? heightMap[i][j] : 0;
      grid[i][j] = { x: point.x, y: point.y, z: height };
    }
  }
  
  return grid;
}

/**
 * Generate a pipe/tube along a curve
 */
export function generateTube(
  curve: CubicBezier,
  radius: number = 5,
  options: SurfaceOptions = { resolution: 32, rotationSteps: 16 }
): THREE.BufferGeometry {
  const { resolution, rotationSteps = 16 } = options;
  
  const geometry = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const indices: number[] = [];

  // Sample curve points and create circular cross-sections
  for (let i = 0; i <= resolution; i++) {
    const t = i / resolution;
    const point = evaluateBezierCurve(curve, t);
    
    for (let j = 0; j <= rotationSteps; j++) {
      const angle = (j / rotationSteps) * Math.PI * 2;
      const x = point.x + radius * Math.cos(angle);
      const y = point.y + radius * Math.sin(angle);
      const z = t * 100; // Extrude along Z
      
      vertices.push(x, y, z);
    }
  }

  // Generate indices
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < rotationSteps; j++) {
      const a = i * (rotationSteps + 1) + j;
      const b = a + rotationSteps + 1;
      const c = a + 1;
      const d = b + 1;
      
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}
