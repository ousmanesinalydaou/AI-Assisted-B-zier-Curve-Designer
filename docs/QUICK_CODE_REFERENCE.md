# ⚡ Quick Code Reference for Exam
## Fast Lookup Guide

---

## 🎯 Most Important Files

### Core Algorithms
1. **`src/algorithms/curveFitting.ts`** - Curve fitting implementation
2. **`src/algorithms/bezierSurface.ts`** - 3D surface generation
3. **`src/components/WebGLCanvas.tsx`** - Main rendering
4. **`src/store/useAppStore.ts`** - State management

### Key Components
5. **`src/components/SurfaceControlPanel.tsx`** - 3D UI
6. **`src/components/SurfaceViewer3D.tsx`** - 3D viewer
7. **`src/components/Toolbar.tsx`** - Main toolbar
8. **`src/types/index.ts`** - Type definitions

---

## 🔍 Where to Find Things

### "Where is the curve fitting algorithm?"
**File:** `src/algorithms/curveFitting.ts`
**Function:** `fitCurve(points: Point2D[]): FittingResult`
**Line:** ~20

### "Where is centripetal parameterization?"
**File:** `src/algorithms/curveFitting.ts`
**Function:** `parameterizePoints(points: Point2D[]): number[]`
**Line:** ~80
**Look for:** `case 'centripetal':`

### "Where is surface of revolution?"
**File:** `src/algorithms/bezierSurface.ts`
**Function:** `generateSurfaceOfRevolution(curve, options)`
**Line:** ~55

### "Where is the drawing logic?"
**File:** `src/components/WebGLCanvas.tsx`
**Functions:**
- `handleMouseDown` - Start drawing
- `handleMouseMove` - Continue drawing
- `handleMouseUp` - End drawing

### "Where is the neural network called?"
**File:** `src/api/client.ts`
**Function:** `optimizeCurve(controlPoints)`
**Backend:** `backend/routers/curve_router.py`

### "Where are control points rendered?"
**File:** `src/components/WebGLCanvas.tsx`
**Function:** `renderControlPoints(strokeId, curveIndex, curve, isSelected)`
**Line:** ~290

### "Where is the state stored?"
**File:** `src/store/useAppStore.ts`
**State variables:**
- `strokes` - All drawn curves
- `surfaces` - Generated 3D objects
- `selectedStroke` - Currently selected
- `show3DPanel` - Panel visibility

---

## 📝 Common Code Patterns

### Pattern 1: Evaluating a Bézier Curve
```typescript
// Location: src/algorithms/bezierSurface.ts, line ~32
function evaluateBezierCurve(curve: CubicBezier, t: number): Point2D {
  const t2 = t * t;
  const t3 = t2 * t;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;

  return {
    x: mt3 * curve.p0.x + 3 * mt2 * t * curve.p1.x + 
       3 * mt * t2 * curve.p2.x + t3 * curve.p3.x,
    y: mt3 * curve.p0.y + 3 * mt2 * t * curve.p1.y + 
       3 * mt * t2 * curve.p2.y + t3 * curve.p3.y,
  };
}
```

### Pattern 2: Adding State to Zustand
```typescript
// Location: src/store/useAppStore.ts

// 1. Add to state type (top of file)
interface AppState {
  myNewState: boolean;
}

// 2. Initialize in create() function
const useAppStore = create<AppState & AppActions>((set, get) => ({
  myNewState: false,
  
  // 3. Add action to modify it
  setMyNewState: (value: boolean) => {
    set({ myNewState: value });
  },
}));
```

### Pattern 3: Adding a UI Control
```typescript
// Location: Any component file

// 1. Get state from store
const { myValue, setMyValue } = useAppStore();

// 2. Create input
<input
  type="range"
  value={myValue}
  onChange={(e) => setMyValue(Number(e.target.value))}
/>
```

### Pattern 4: Creating Three.js Geometry
```typescript
// Pattern used in bezierSurface.ts

const geometry = new THREE.BufferGeometry();
const vertices: number[] = [];
const indices: number[] = [];

// Add vertex data
vertices.push(x, y, z);

// Add triangle indices
indices.push(a, b, c);

// Set attributes
geometry.setAttribute('position', 
  new THREE.Float32BufferAttribute(vertices, 3));
geometry.setIndex(indices);
geometry.computeVertexNormals();

return geometry;
```

### Pattern 5: Distance Calculation
```typescript
// Location: src/utils/helpers.ts
export function distance(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}
```

---

## 🔧 Quick Edits Cheat Sheet

### Change Control Point Size
**File:** `src/components/WebGLCanvas.tsx`
**Find:** `controlPointSize`
**Change:** The number value

### Change Curve Color
**File:** `src/components/WebGLCanvas.tsx`
**Find:** `new THREE.LineBasicMaterial({ color: 0x8b5cf6 })`
**Change:** The hex color code

### Change Default Resolution
**File:** `src/components/SurfaceControlPanel.tsx`
**Find:** `const [resolution, setResolution] = useState(32);`
**Change:** The number 32

### Add New Parameterization
**File:** `src/algorithms/curveFitting.ts`
**Function:** `parameterizePoints`
**Add:** New case in switch statement

### Change Iteration Limit
**File:** `src/algorithms/curveFitting.ts`
**Find:** `for (let iter = 0; iter < this.options.maxIterations; iter++)`
**Change:** `maxIterations` value in options

### Add Console Log for Debugging
```typescript
// In curve fitting:
console.log('RMSE:', rmse, 'Iteration:', iter);

// In surface generation:
console.log('Generating surface of type:', surface.type);
console.log('Vertices count:', vertices.length / 3);
```

---

## 💡 Important Concepts Locations

### Least Squares Fitting
**File:** `src/algorithms/curveFitting.ts`
**Function:** `generateBezier()`
**Explanation:** Solves `A^T * A * x = A^T * b` for control points

### Newton-Raphson Reparameterization
**File:** `src/algorithms/curveFitting.ts`
**Function:** `reparameterize()`
**Purpose:** Improves parameter values iteratively

### Tangent Estimation
**File:** `src/algorithms/curveFitting.ts`
**Functions:**
- `estimateLeftTangent()` - Uses first 3 points
- `estimateRightTangent()` - Uses last 3 points

### Bernstein Polynomial
**File:** `src/algorithms/curveFitting.ts`
**Function:** `bernstein(i, n, t)`
**Formula:** `C(n,i) * t^i * (1-t)^(n-i)`

### Surface Tessellation
**File:** `src/algorithms/bezierSurface.ts`
**All generation functions**
**Pattern:** Nested loops over (u,v) parameters

---

## 🎨 UI Component Hierarchy

```
App.tsx
└── BezierApp.tsx
    ├── Toolbar.tsx
    │   └── Tool buttons (Draw, Fit, 3D, etc.)
    ├── WebGLCanvas.tsx
    │   └── Main drawing area
    ├── PropertyPanel.tsx
    │   └── Stroke properties
    ├── SurfaceControlPanel.tsx
    │   └── 3D surface controls
    ├── SurfaceViewer3D.tsx
    │   └── 3D visualization
    ├── AIPanel.tsx
    │   └── Neural network suggestions
    ├── ExportModal.tsx
    │   └── Export options
    └── TutorialModal.tsx
        └── Help/tutorial
```

---

## 🚀 Performance Critical Sections

### 1. Rendering Loop
**File:** `src/components/WebGLCanvas.tsx`
**Function:** `animate()`
**Why Critical:** Runs 60 times per second
**Optimization:** Use BufferGeometry, minimize state changes

### 2. Curve Fitting
**File:** `src/algorithms/curveFitting.ts`
**Function:** `fitCurve()`
**Why Critical:** Can take many iterations
**Optimization:** Early termination, efficient matrix operations

### 3. Surface Generation
**File:** `src/algorithms/bezierSurface.ts`
**All functions**
**Why Critical:** Large vertex arrays
**Optimization:** Adjustable resolution, geometry caching

---

## 📊 Type Definitions Quick Reference

### Core Types
```typescript
// From src/types/index.ts

interface Point2D {
  x: number;
  y: number;
}

interface CubicBezier {
  p0: Point2D;  // Start point
  p1: Point2D;  // First control point
  p2: Point2D;  // Second control point
  p3: Point2D;  // End point
}

interface StrokeData {
  id: string;
  points: Point2D[];
  fittedCurves: CubicBezier[];
  timestamp: number;
  color?: string;
}

interface SurfaceData {
  id: string;
  type: SurfaceType;
  sourceStrokeIds: string[];
  timestamp: number;
  options: {
    resolution: number;
    rotationSteps: number;
    axis: 'x' | 'y' | 'z';
    radius: number;
  };
}

type Parameterization = 'uniform' | 'chord-length' | 'centripetal';
type SurfaceType = 'revolution' | 'vase' | 'tube' | 'patch' | 'loft' | 'extrusion';
```

---

## 🔢 Important Constants

### Default Fitting Options
**File:** `src/store/useAppStore.ts`
```typescript
const defaultFittingOptions = {
  tolerance: 2.0,          // Error threshold
  maxIterations: 10,       // Iteration limit
  parameterization: 'centripetal',
};
```

### Render Options
**File:** `src/store/useAppStore.ts`
```typescript
const renderOptions = {
  strokeWidth: 2,
  controlPointSize: 8,
  curveColor: 0x8b5cf6,    // Purple
  guideColor: 0x666666,    // Gray
};
```

### 3D Default Settings
**File:** `src/components/SurfaceControlPanel.tsx`
```typescript
const [resolution, setResolution] = useState(32);
const [rotationSteps, setRotationSteps] = useState(32);
const [radius, setRadius] = useState(5);
```

---

## 🎯 Exam Day Checklist

### Before You Start
- [ ] Open the project in VS Code
- [ ] Run `npm run dev` to start dev server
- [ ] Open browser to localhost:5173
- [ ] Have this reference open
- [ ] Test basic drawing

### Know These Files by Heart
- [ ] `curveFitting.ts` - Main algorithm
- [ ] `bezierSurface.ts` - 3D generation
- [ ] `WebGLCanvas.tsx` - Rendering
- [ ] `useAppStore.ts` - State

### Be Ready to Explain
- [ ] Centripetal parameterization
- [ ] Least squares fitting
- [ ] Surface of revolution
- [ ] Why TypeScript
- [ ] Component architecture

### Quick Edits You Might Be Asked
- [ ] Change a color
- [ ] Add a console.log
- [ ] Modify a default value
- [ ] Add a simple UI element
- [ ] Change iteration count

---

## 📞 Emergency Quick Fixes

### If Drawing Doesn't Work
**Check:** `WebGLCanvas.tsx` - mouse event handlers
**Common issue:** Event not bound correctly

### If Curve Fitting Fails
**Check:** `curveFitting.ts` - tolerance too strict
**Fix:** Increase tolerance or maxIterations

### If 3D Panel Won't Open
**Check:** `useAppStore.ts` - `show3DPanel` state
**Check:** `SurfaceControlPanel.tsx` - conditional render

### If Surface Generation Crashes
**Check:** Strokes have `fittedCurves`
**Check:** Enough curves for surface type
**Check:** Resolution not too high

---

## 🎓 Key Takeaways

**Remember:**
1. **Centripetal is best** - prevents loops
2. **Least squares** - minimizes error
3. **Iterative refinement** - gets better each iteration
4. **TypeScript** - catches bugs early
5. **WebGL** - GPU acceleration
6. **Zustand** - simple state management
7. **Three.js** - industry standard 3D

**You know this project inside and out! Be confident! 🚀**