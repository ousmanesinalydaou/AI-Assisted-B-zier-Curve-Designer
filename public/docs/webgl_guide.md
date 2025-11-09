# WebGL Implementation Guide

## Overview

This guide details the WebGL rendering implementation in the Bézier Curve Designer, covering the rendering pipeline, shader programs, performance optimizations, and integration with Three.js.

## WebGL Architecture Choice

### Three.js vs Raw WebGL Analysis

We chose **Three.js** for WebGL rendering based on the following evaluation:

| Criteria | Three.js | Raw WebGL | Decision |
|----------|----------|-----------|----------|
| Development Speed | ⭐⭐⭐⭐⭐ | ⭐⭐ | Three.js wins |
| Performance | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Raw WebGL slightly better |
| Maintenance | ⭐⭐⭐⭐⭐ | ⭐⭐ | Three.js wins |
| Bundle Size | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Raw WebGL wins |
| Feature Richness | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Three.js wins |

**Final Decision: Three.js**
- Faster development and iteration cycles
- Built-in optimizations and cross-browser compatibility
- Rich ecosystem and community support
- Acceptable performance for our use case (~600KB bundle size trade-off)

## Rendering Pipeline Architecture

### 1. Scene Initialization

```typescript
export class WebGLRenderer {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.OrthographicCamera;

  constructor(canvas: HTMLCanvasElement) {
    // WebGL context with optimal settings
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,           // Hardware MSAA
      alpha: true,               // Transparent background
      powerPreference: 'high-performance',
      stencil: false,            // Disable stencil buffer
      depth: false,              // 2D rendering doesn't need depth
    });
    
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    
    // Orthographic camera for 2D projection
    this.camera = new THREE.OrthographicCamera(
      0, canvas.clientWidth,
      0, canvas.clientHeight,
      -1, 1
    );
    
    this.scene = new THREE.Scene();
  }
}
```

### 2. Adaptive Tessellation System

The core of our curve rendering is adaptive tessellation, which converts Bézier curves into GPU-friendly polylines:

```typescript
class CurveTessellator {
  private flatnessTolerance: number = 0.5;
  
  public tessellate(curve: CubicBezier): Point2D[] {
    const points: Point2D[] = [];
    this.subdivideRecursive(curve, 0, 1, points);
    return points;
  }
  
  private subdivideRecursive(
    curve: CubicBezier, 
    t0: number, 
    t1: number, 
    points: Point2D[]
  ): void {
    const midT = (t0 + t1) * 0.5;
    const p0 = this.evaluateBezier(curve, t0);
    const p1 = this.evaluateBezier(curve, midT);
    const p2 = this.evaluateBezier(curve, t1);
    
    // Flatness test: distance from midpoint to chord
    const chordMid = {
      x: (p0.x + p2.x) * 0.5,
      y: (p0.y + p2.y) * 0.5
    };
    
    const deviation = this.distance(p1, chordMid);
    
    if (deviation < this.flatnessTolerance || (t1 - t0) < 0.001) {
      // Curve is flat enough, add points
      if (points.length === 0) points.push(p0);
      points.push(p1);
      points.push(p2);
    } else {
      // Subdivide further
      this.subdivideRecursive(curve, t0, midT, points);
      this.subdivideRecursive(curve, midT, t1, points);
    }
  }
}
```

**Benefits of Adaptive Tessellation**:
- **Quality**: Maintains visual fidelity at all zoom levels
- **Performance**: Fewer vertices for simple curves, more for complex ones
- **Consistency**: Uniform rendering quality across different curve types
- **GPU Efficiency**: Optimal vertex buffer utilization

### 3. Buffer Management System

Efficient buffer management is crucial for performance:

```typescript
class BufferManager {
  private geometryCache: Map<string, THREE.BufferGeometry> = new Map();
  private materialCache: Map<string, THREE.Material> = new Map();
  
  public getStrokeGeometry(points: Point2D[], strokeId: string): THREE.BufferGeometry {
    if (this.geometryCache.has(strokeId)) {
      return this.geometryCache.get(strokeId)!;
    }
    
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    
    for (let i = 0; i < points.length; i++) {
      positions[i * 3] = points[i].x;
      positions[i * 3 + 1] = points[i].y;
      positions[i * 3 + 2] = 0;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometryCache.set(strokeId, geometry);
    
    return geometry;
  }
  
  public updateStrokeGeometry(points: Point2D[], strokeId: string): void {
    const geometry = this.geometryCache.get(strokeId);
    if (geometry) {
      const position = geometry.attributes.position as THREE.BufferAttribute;
      
      // Resize buffer if needed
      if (position.count < points.length) {
        const newPositions = new Float32Array(points.length * 3);
        position.array = newPositions;
        position.count = points.length;
      }
      
      // Update vertex data
      for (let i = 0; i < points.length; i++) {
        position.setXYZ(i, points[i].x, points[i].y, 0);
      }
      
      position.needsUpdate = true;
      geometry.setDrawRange(0, points.length);
    }
  }
}
```

### 4. Line Rendering with Variable Thickness

For high-quality line rendering with thickness control, we use Three.js Line2:

```typescript
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

class ThickLineRenderer {
  private createThickLine(points: Point2D[], width: number, color: number): Line2 {
    const geometry = new LineGeometry();
    const positions: number[] = [];
    
    for (const point of points) {
      positions.push(point.x, point.y, 0);
    }
    
    geometry.setPositions(positions);
    
    const material = new LineMaterial({
      color: color,
      linewidth: width,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      dashed: false,
    });
    
    return new Line2(geometry, material);
  }
  
  // Update resolution on window resize
  public updateResolution(width: number, height: number): void {
    this.thickLineMaterials.forEach(material => {
      material.resolution.set(width, height);
    });
  }
}
```

**Line Rendering Features**:
- **Pixel-perfect thickness**: Consistent width regardless of zoom
- **Smooth joints**: Proper line segment connections
- **Antialiasing**: Hardware-accelerated smoothing
- **Performance**: GPU-accelerated thick line rendering

### 5. Interactive Picking System

We implement both GPU and CPU-based picking for control points:

#### GPU Picking (Color-based)
```typescript
class GPUPicker {
  private pickingScene: THREE.Scene = new THREE.Scene();
  private pickingTexture: THREE.WebGLRenderTarget;
  
  constructor(renderer: THREE.WebGLRenderer) {
    this.pickingTexture = new THREE.WebGLRenderTarget(1, 1);
  }
  
  public pick(x: number, y: number): PickResult | null {
    // Render scene with unique colors for each object
    this.renderer.setRenderTarget(this.pickingTexture);
    this.renderer.render(this.pickingScene, this.camera);
    
    // Read pixel color
    const pixelBuffer = new Uint8Array(4);
    this.renderer.readRenderTargetPixels(
      this.pickingTexture, x, y, 1, 1, pixelBuffer
    );
    
    // Decode object ID from color
    const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2];
    return this.getObjectById(id);
  }
}
```

#### CPU Picking (Distance-based)
```typescript
class CPUPicker {
  public pickControlPoint(
    mousePos: Point2D, 
    controlPoints: Point2D[], 
    threshold: number
  ): number | null {
    let closestIndex: number | null = null;
    let minDistance = threshold;
    
    for (let i = 0; i < controlPoints.length; i++) {
      const distance = this.distance(mousePos, controlPoints[i]);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }
    
    return closestIndex;
  }
}
```

**Picking Strategy**:
- **CPU picking** for control points (simple, fast for few objects)
- **GPU picking** for complex scenes with many objects
- **Hybrid approach** based on object count and complexity

### 6. Material System and Theming

Dynamic material system supporting theme changes:

```typescript
class MaterialManager {
  private materials: Map<string, THREE.Material> = new Map();
  private currentTheme: 'light' | 'dark' = 'light';
  
  private themeColors = {
    light: {
      stroke: 0x666666,
      curve: 0x2563eb,
      controlPoint: 0xff4444,
      grid: 0xe5e5e5,
    },
    dark: {
      stroke: 0x888888,
      curve: 0x00ff88,
      controlPoint: 0xff6666,
      grid: 0x333333,
    }
  };
  
  public updateTheme(theme: 'light' | 'dark'): void {
    this.currentTheme = theme;
    const colors = this.themeColors[theme];
    
    // Update all materials
    this.materials.forEach((material, key) => {
      if (material instanceof THREE.LineBasicMaterial) {
        const materialType = this.getMaterialType(key);
        material.color.setHex(colors[materialType]);
      }
    });
  }
  
  public createMaterial(type: string, options: any): THREE.Material {
    const key = `${type}_${JSON.stringify(options)}`;
    
    if (!this.materials.has(key)) {
      const material = this.createMaterialByType(type, options);
      this.materials.set(key, material);
    }
    
    return this.materials.get(key)!;
  }
}
```

### 7. Performance Optimizations

#### Frustum Culling
```typescript
class FrustumCuller {
  private frustum: THREE.Frustum = new THREE.Frustum();
  
  public updateFrustum(camera: THREE.Camera): void {
    const matrix = new THREE.Matrix4();
    matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(matrix);
  }
  
  public cullObjects(objects: THREE.Object3D[]): THREE.Object3D[] {
    return objects.filter(obj => {
      const bbox = new THREE.Box3().setFromObject(obj);
      return this.frustum.intersectsBox(bbox);
    });
  }
}
```

#### Level of Detail (LOD)
```typescript
class CurveLOD {
  public getTessellationLevel(curve: CubicBezier, camera: THREE.Camera): number {
    const curveLength = this.calculateCurveLength(curve);
    const screenSize = this.getScreenSize(curve, camera);
    
    // Adaptive tessellation based on screen space size
    if (screenSize < 10) return 5;        // Very small: minimal tessellation
    if (screenSize < 50) return 15;       // Small: low tessellation
    if (screenSize < 200) return 30;      // Medium: standard tessellation
    return 50;                            // Large: high tessellation
  }
}
```

#### Batch Rendering
```typescript
class BatchRenderer {
  private batchedLines: THREE.LineSegments[] = [];
  
  public batchSimilarLines(lines: LineData[]): void {
    const batches = this.groupByMaterial(lines);
    
    batches.forEach((batch, material) => {
      const geometry = this.mergeGeometries(batch);
      const batchedLine = new THREE.LineSegments(geometry, material);
      this.batchedLines.push(batchedLine);
    });
  }
}
```

## Shader Integration

While Three.js handles most shader complexity, we can extend with custom shaders when needed:

### Custom Line Vertex Shader
```glsl
attribute vec3 position;
attribute vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float lineWidth;

void main() {
  // Screen-space line width calculation
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vec4 offset = vec4(normal * lineWidth * 0.5, 0.0);
  
  gl_Position = projectionMatrix * (mvPosition + offset);
}
```

### Custom Line Fragment Shader
```glsl
uniform vec3 color;
uniform float opacity;
varying float vDistance;

void main() {
  // Anti-aliased line edges
  float alpha = 1.0 - smoothstep(0.8, 1.0, abs(vDistance));
  gl_FragColor = vec4(color, opacity * alpha);
}
```

## Error Handling and Fallbacks

```typescript
class WebGLErrorHandler {
  private canvas: HTMLCanvasElement;
  private fallbackCanvas: HTMLCanvasElement | null = null;
  
  public handleContextLoss(event: Event): void {
    event.preventDefault();
    console.warn('WebGL context lost, attempting recovery...');
    
    // Preserve current state
    this.preserveApplicationState();
    
    // Show user notification
    this.showContextLossNotification();
  }
  
  public handleContextRestore(): void {
    console.log('WebGL context restored');
    
    // Reinitialize WebGL components
    this.reinitializeRenderer();
    this.restoreApplicationState();
    
    // Hide notification
    this.hideContextLossNotification();
  }
  
  public createCanvasFallback(): void {
    if (!this.supportsWebGL()) {
      this.fallbackCanvas = document.createElement('canvas');
      const ctx = this.fallbackCanvas.getContext('2d');
      
      // Implement 2D canvas rendering as fallback
      this.renderWithCanvas2D(ctx);
    }
  }
}
```

## Performance Monitoring

```typescript
class WebGLProfiler {
  private frameTime: number = 0;
  private drawCalls: number = 0;
  private vertexCount: number = 0;
  
  public startFrame(): void {
    this.frameTime = performance.now();
    this.drawCalls = 0;
    this.vertexCount = 0;
  }
  
  public endFrame(): void {
    const elapsed = performance.now() - this.frameTime;
    
    if (elapsed > 16.67) { // > 60 FPS
      console.warn(`Frame time: ${elapsed.toFixed(2)}ms (${(1000/elapsed).toFixed(1)} FPS)`);
      console.warn(`Draw calls: ${this.drawCalls}, Vertices: ${this.vertexCount}`);
    }
  }
  
  public recordDrawCall(vertexCount: number): void {
    this.drawCalls++;
    this.vertexCount += vertexCount;
  }
}
```

## Memory Management

```typescript
class WebGLResourceManager {
  private geometries: Set<THREE.BufferGeometry> = new Set();
  private materials: Set<THREE.Material> = new Set();
  private textures: Set<THREE.Texture> = new Set();
  
  public disposeGeometry(geometry: THREE.BufferGeometry): void {
    geometry.dispose();
    this.geometries.delete(geometry);
  }
  
  public disposeMaterial(material: THREE.Material): void {
    material.dispose();
    this.materials.delete(material);
  }
  
  public disposeAll(): void {
    this.geometries.forEach(g => g.dispose());
    this.materials.forEach(m => m.dispose());
    this.textures.forEach(t => t.dispose());
    
    this.geometries.clear();
    this.materials.clear();
    this.textures.clear();
  }
}
```

This WebGL implementation provides a robust, performant foundation for real-time Bézier curve rendering while maintaining clean architecture and extensibility for future enhancements.