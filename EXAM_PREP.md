# 📚 Exam Preparation Guide for Geometric Modeling Project

**Project:** CurveStack Composite Surface Generator  
**Date:** December 17, 2025  
**Course:** MSc Computer Science - Geometric Modeling (3rd Semester)

---

## 🎯 Project Summary

Your project is a **Curve-Stacking Composite Surface Generator** that creates 3D B-spline surfaces by:

1. **Stacking 2D curves** in 3D space
2. **Fitting B-spline surfaces** through them using **Separable Least Squares** approximation
3. **Visualizing with WebGL** (Three.js)

**Tech Stack:** React + TypeScript + Three.js + Vite  
**Algorithm:** Separable Least Squares B-spline Surface Fitting  
**Reference:** CAGD Chapter 12 - Composite Surfaces

---

## 🔑 Key Concepts You MUST Understand

### 1. Core Algorithm: Separable Least Squares (Chapter 12)

**Two-step process:**

**Step 1 (U-direction):** For each stacked curve layer, fit a B-spline curve
- Takes data points → produces control points
- Uses least squares to minimize error

**Step 2 (V-direction):** Through the control points from Step 1, fit curves in the perpendicular direction
- Creates final control point grid
- Result: Tensor product B-spline surface

**Where in code:** `services/surfaceEngine.ts` lines 10-115

```typescript
// Two-step process:
// Step 1: Fit curves in U-direction (horizontal layers)
for (let i = 0; i < numCurves; i++) {
  const fittedRow = fitCurveLeastSquares(inputCurves[i], ...);
  intermediateControlPoints.push(fittedRow);
}

// Step 2: Fit curves in V-direction (vertical columns through control points)
for (let u = 0; u < safeUCount; u++) {
  const columnPoints = intermediateControlPoints.map(row => row[u]);
  const fittedCol = fitCurveLeastSquares(columnPoints, ...);
  finalControlNet.push(fittedCol);
}
```

**Why two passes instead of direct surface fitting?**
- Separable least squares is computationally efficient (O(n²) vs O(n³))
- More numerically stable
- Transforms a 2D problem into two 1D problems

---

### 2. B-spline Fundamentals

**Key parameters:**
- **Degree (p):** Determines smoothness (cubic = degree 3)
- **Control Points (n):** Number of control points
- **Knot Vector:** Determines parameterization, size = n + p + 1

**Mathematical Definition:**

A B-spline curve is defined as:
$$C(u) = \sum_{i=0}^{n-1} N_{i,p}(u) \cdot P_i$$

Where:
- $N_{i,p}(u)$ = basis function for control point i at degree p
- $P_i$ = control point i

**Cox-de Boor Recursion** (`services/mathUtils.ts` lines 117-133):

```typescript
function basisFunction(i: number, p: number, u: number, knots: number[]): number {
  if (p === 0) {
    return (u >= knots[i] && u < knots[i + 1]) ? 1 : 0;
  }
  
  let left = ((u - knots[i]) / (knots[i + p] - knots[i])) * basisFunction(i, p - 1, u, knots);
  let right = ((knots[i + p + 1] - u) / (knots[i + p + 1] - knots[i + 1])) * basisFunction(i + 1, p - 1, u, knots);
  
  return left + right;
}
```

**Key points:**
- **Recursion base case:** Degree 0 is a step function
- **Recursion step:** Weighted blend of two lower-degree functions
- **Division by zero handling:** Check for zero denominators (flat knot spans)

---

### 3. Parameterization Methods

**Location:** `services/mathUtils.ts` lines 136-162

**Uniform Parameterization:**
$$t_i = \frac{i}{n-1}$$
- Simple, evenly spaced
- May distort spacing on irregular curves

**Chord Length Parameterization:**
$$t_i = \frac{\sum_{j=1}^{i} \|P_j - P_{j-1}\|}{\sum_{j=1}^{n-1} \|P_j - P_{j-1}\|}$$
- Proportional to cumulative distance
- Better for irregular spacing
- Reduces parametric distortion

---

### 4. Least Squares System

**Location:** `services/mathUtils.ts` lines 191-227

**Mathematical formulation:**

Find D (control points) such that:
$$(N^T \times N) \times D = N^T \times P$$

Where:
- **N** = Basis function matrix (m × n)
  - m = number of data points
  - n = number of control points
- **P** = Data points (m × 3)
- **D** = Control points (n × 3)

**In code:**
```typescript
const N = buildBasisMatrix(); // m samples × n control points
const NtN = N.transpose().multiply(N);
const NtP = N.transpose().multiply(P);
const D = solveLinearSystem(NtN, NtP); // Gaussian elimination
```

**Why minimize $(N \cdot D - P)^2$?**
- Finds best approximation when we have more data points than control points
- Overdetermined system → least squares gives optimal solution

---

### 5. Knot Vector Structure

**Code location:** `services/mathUtils.ts` lines 102-114

We use **uniform open knot vectors**:

```
[0, 0, 0, 0, 0.2, 0.4, 0.6, 0.8, 1, 1, 1, 1]
 └─ p+1 ─┘  └─ internal ─┘  └─ p+1 ─┘
```

For degree p = 3, control points n = 8:
- First `p+1 = 4` knots are 0 → surface interpolates first control point
- Last `p+1 = 4` knots are 1 → surface interpolates last control point
- Internal knots evenly spaced → uniform parameterization

**Formula:**
- Total knots: $m = n + p + 1$
- Internal knots: $m - 2(p+1)$

---

## 🗣️ Common Professor Questions & Model Answers

### Q1: "Explain how your surface fitting works"

**Answer:**
"We use separable least squares approximation. The algorithm works in two passes:

1. **First pass (U-direction):** For each input curve (stacked layer), we fit a B-spline curve using least squares. This gives us intermediate control points - essentially we replace each data curve with a smoother approximation.

2. **Second pass (V-direction):** We look at columns through these intermediate control points and fit B-spline curves through them. This gives us our final control point grid.

3. **Result:** A tensor product B-spline surface that approximates all the input data points.

The advantage of this separable approach is computational efficiency - we solve multiple small linear systems instead of one massive system, reducing complexity from O(n³) to O(n²)."

---

### Q2: "Why do you need at least degree+1 control points?"

**Answer:**
"A B-spline curve of degree p requires at least p+1 control points to be mathematically well-defined. This comes from the basis function recursion:

- For degree 0, we need 1 point (piecewise constant)
- For degree 1, we need 2 points (piecewise linear)
- For degree 3 (cubic), we need 4 points

The reason is that the knot vector has size m = n + p + 1, and we need enough knots to properly define the basis functions. If we have fewer control points than degree+1, the basis functions can't be evaluated properly.

In my code, I handle this with safety checks:"

```typescript
const safeControlPoints = Math.min(numControlPoints, numSamples);
const safeDegree = Math.min(degree, safeControlPoints - 1);
```

---

### Q3: "What's the difference between control points and data points?"

**Answer:**
"**Data points** are the actual curve points we want to approximate - the input. In our case, these are the points on the stacked curves.

**Control points** form the control polygon that defines the B-spline. The curve doesn't necessarily pass through them (except at boundaries with open knot vectors), but they influence the shape through the basis functions.

The relationship is:
$$C(u) = \sum N_i(u) \cdot P_i$$

Where $P_i$ are control points and $N_i(u)$ are basis functions. The curve is a weighted blend of the control points.

When we have more data points than control points, we use least squares to find the control points that give the best approximation."

---

### Q4: "How do knot vectors work?"

**Answer:**
"Knot vectors determine where and how the basis functions blend together. They're a non-decreasing sequence that partitions the parameter space.

In our implementation, we use **uniform open knot vectors**:

1. **Open:** First and last knots are repeated p+1 times. This makes the curve interpolate the first and last control points - important for our surface to actually touch the boundary curves.

2. **Uniform:** Internal knots are evenly spaced, giving uniform parameterization.

For example, with degree 3 and 8 control points:
```
[0, 0, 0, 0, 0.2, 0.4, 0.6, 0.8, 1, 1, 1, 1]
```

Each basis function $N_{i,p}(u)$ is defined over p+2 consecutive knots, and the knot vector determines where each function is non-zero."

---

### Q5: "What's the difference between uDegree/vDegree and uControlPoints/vControlPoints?"

**Answer:**
"These are independent parameters that serve different purposes:

**Degree (uDegree/vDegree):**
- Controls the polynomial degree of the basis functions
- Degree 3 = cubic curves (most common in CAD)
- Higher degree = smoother blending, but less local control
- Affects the shape of basis functions

**Control Points (uControlPoints/vControlPoints):**
- Determines how many control points we use for approximation
- More control points = tighter fit to data (less smoothing)
- Fewer control points = more approximation (more smoothing)
- Affects how closely we approximate the input data

**Constraint:** We must have `controlPoints ≥ degree + 1`

The trade-off: More control points give better approximation but less smoothing. Fewer control points give more smoothing but may not capture details."

---

### Q6: "Why use Gaussian elimination instead of matrix inverse?"

**Answer:**
"There are several reasons:

1. **Numerical stability:** Computing matrix inverse can amplify numerical errors, especially for ill-conditioned matrices. Gaussian elimination with partial pivoting is more stable.

2. **Efficiency:** We only need to solve $Ax = b$, not compute the full inverse. Gaussian elimination is O(n³) but with a smaller constant than matrix inversion.

3. **Memory:** We can solve in-place with augmented matrix, don't need to store the inverse.

4. **Our system:** $(N^T N)$ can be poorly conditioned when we have many data points. Direct solution is safer.

In the code, I implement Gaussian elimination with partial pivoting in `solveLinearSystem()`."

---

### Q7: "Walk me through what happens when I click 'Generate Surface'"

**Answer:**
"Here's the complete flow:

1. **User Input:** User either draws curves or selects preset curves. These are stored in the `inputCurves` state array.

2. **State Update:** React's `useMemo` detects parameter changes and triggers recalculation.

3. **Surface Generation Call:** `generateCompositeSurface()` is invoked with:
   - Input curves (Point3D[][])
   - Degrees (uDegree, vDegree)
   - Control point counts
   - Parameterization method

4. **U-Pass:** Each input curve is approximated with a B-spline:
   - Compute parameters (uniform or chord length)
   - Build basis matrix N
   - Solve least squares: $(N^T N)D = N^T P$
   - Get intermediate control points

5. **V-Pass:** Columns of intermediate points are fitted:
   - Extract columns (varying V, fixed U)
   - Fit B-spline curves through each column
   - Get final control point grid

6. **Tessellation:** Surface is evaluated on a grid:
   - Loop over u, v parameters
   - Evaluate $S(u,v) = \sum \sum N_i(u)N_j(v)P_{ij}$
   - Generate triangle indices for mesh

7. **Rendering:** Three.js in `Viewer3D` component:
   - Create BufferGeometry from points and indices
   - Apply materials based on visualization mode
   - Render with WebGL

8. **Display:** User sees the surface, wireframe, and/or control net."

---

## 💻 Critical Code Sections to Master

### 1. Surface Generation Entry Point

**File:** `services/surfaceEngine.ts`  
**Lines:** 10-115

```typescript
export function generateCompositeSurface(
  inputCurves: Point3D[][],
  uDegree: number,
  vDegree: number,
  uControlCount: number,
  vControlCount: number,
  parameterization: Parameterization = Parameterization.UNIFORM,
  renderResolution: number = 20
): SurfaceData
```

**Key sections:**
- Lines 22-24: Input validation
- Lines 28-34: U-direction fitting loop
- Lines 48-61: V-direction fitting loop
- Lines 72-95: Surface tessellation

---

### 2. Least Squares Curve Fitting

**File:** `services/mathUtils.ts`  
**Lines:** 191-236

```typescript
export function fitCurveLeastSquares(
  points: Point3D[], 
  degree: number, 
  numControlPoints: number,
  method: Parameterization = Parameterization.UNIFORM
): Point3D[]
```

**What it does:**
1. Computes parameters for data points
2. Builds basis matrix N (m × n)
3. Solves $(N^T N)D = N^T P$ for each coordinate
4. Returns control points

---

### 3. Cox-de Boor Basis Function

**File:** `services/mathUtils.ts`  
**Lines:** 117-133

```typescript
export function basisFunction(
  i: number, 
  p: number, 
  u: number, 
  knots: number[]
): number
```

**Recursive implementation:**
- Base case: p=0 → step function
- Recursive case: weighted blend of lower degree functions

---

### 4. Gaussian Elimination Solver

**File:** `services/mathUtils.ts`  
**Lines:** 51-96

```typescript
export function solveLinearSystem(A: Matrix, b: Matrix): Matrix
```

**Algorithm:**
1. Create augmented matrix [A|b]
2. Forward elimination with partial pivoting
3. Back substitution
4. Return solution vector

---

### 5. Three.js Rendering

**File:** `components/Viewer3D.tsx`  
**Lines:** 1-252

**Key responsibilities:**
- Scene setup (camera, lights, grid)
- Mesh creation from surface data
- Wireframe generation
- Control net visualization
- OrbitControls for interaction

---

## 🧪 Practice Scenarios for Live Coding

### Scenario 1: Change Rendering Quality

**Task:** "Make the surface smoother/coarser"

**Solution:** Modify `renderResolution` in `services/surfaceEngine.ts` line 17:

```typescript
// Original
renderResolution: number = 20

// For smoother surface
renderResolution: number = 40

// For coarser (faster rendering)
renderResolution: number = 10
```

**Impact:**
- Higher value → more triangles → smoother appearance, slower
- Lower value → fewer triangles → faceted appearance, faster

---

### Scenario 2: Add Input Validation

**Task:** "Add better error messages for invalid inputs"

**Solution:** In `services/surfaceEngine.ts` after line 22:

```typescript
// Enhanced validation
if (numCurves < 2) {
  throw new Error(`Surface requires at least 2 curves. You provided: ${numCurves}`);
}

if (inputCurves.some(c => c.length < 2)) {
  const invalidIndex = inputCurves.findIndex(c => c.length < 2);
  throw new Error(`Curve ${invalidIndex} has only ${inputCurves[invalidIndex].length} point(s). Need at least 2.`);
}

if (uControlCount < uDegree + 1) {
  throw new Error(`U control points (${uControlCount}) must be ≥ degree + 1 (${uDegree + 1})`);
}

if (vControlCount < vDegree + 1) {
  throw new Error(`V control points (${vControlCount}) must be ≥ degree + 1 (${vDegree + 1})`);
}
```

---

### Scenario 3: Add Centripetal Parameterization

**Task:** "Implement a third parameterization method"

**Step 1:** Add to `types.ts`:

```typescript
export enum Parameterization {
  UNIFORM = 'UNIFORM',
  CHORD_LENGTH = 'CHORD_LENGTH',
  CENTRIPETAL = 'CENTRIPETAL'  // NEW
}
```

**Step 2:** Modify `services/mathUtils.ts` in `computeParameters()`:

```typescript
export function computeParameters(points: Point3D[], method: Parameterization): number[] {
  const n = points.length;
  if (n === 0) return [];
  if (n === 1) return [0];

  const params = new Array(n).fill(0);
  
  if (method === Parameterization.UNIFORM) {
    for (let i = 0; i < n; i++) {
      params[i] = i / (n - 1);
    }
  } else if (method === Parameterization.CHORD_LENGTH) {
    // ... existing chord length code
  } else if (method === Parameterization.CENTRIPETAL) {
    // NEW: Centripetal method
    let totalLength = 0;
    const dists = [0];
    
    for (let i = 1; i < n; i++) {
      const dx = points[i].x - points[i-1].x;
      const dy = points[i].y - points[i-1].y;
      const dz = points[i].z - points[i-1].z;
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
      const d = Math.sqrt(dist); // Square root of distance
      totalLength += d;
      dists.push(totalLength);
    }
    
    if (totalLength === 0) {
      return new Array(n).fill(0);
    }
    
    for (let i = 0; i < n; i++) {
      params[i] = dists[i] / totalLength;
    }
  }

  return params;
}
```

**Step 3:** Add UI control in `components/Controls.tsx`.

**Why centripetal?**
- Uses $\sqrt{distance}$ instead of $distance$
- Reduces overshooting on sharp corners
- Better for curves with large curvature variations

---

### Scenario 4: Add Debug Logging

**Task:** "Add logging to track the fitting process"

**Solution:** In `services/surfaceEngine.ts`:

```typescript
export function generateCompositeSurface(...): SurfaceData {
  console.log('=== Surface Generation Started ===');
  console.log(`Input: ${numCurves} curves, U-degree: ${uDegree}, V-degree: ${vDegree}`);
  console.log(`Control points: U=${uControlCount}, V=${vControlCount}`);
  
  // ... after U-pass
  console.log(`U-pass complete. Intermediate control points: ${intermediateControlPoints.length} x ${intermediateControlPoints[0].length}`);
  
  // ... after V-pass
  console.log(`V-pass complete. Final control net: ${finalControlNet.length} x ${finalControlNet[0].length}`);
  console.log(`Surface tessellation: ${surfacePoints.length} points, ${indices.length/3} triangles`);
  console.log('=== Surface Generation Complete ===');
  
  return { ... };
}
```

---

### Scenario 5: Change Default Parameters

**Task:** "Modify initial settings to show a different preset"

**Solution:** In `App.tsx` lines 24-32:

```typescript
const [params, setParams] = useState<GeneratorParams>({
  mode: InputMode.PRESET,
  curveType: CurveType.SPIRAL,  // Changed from SINE_WAVE
  parameterization: Parameterization.CHORD_LENGTH,  // Changed from UNIFORM
  numCurves: 8,  // Changed from 6
  pointsPerCurve: 40,  // Changed from 30
  stackSpacing: 1.5,  // Changed from 2.0
  uDegree: 3,
  vDegree: 3,
  uControlPoints: 10,  // Changed from 8
  vControlPoints: 6  // Changed from 4
});
```

---

### Scenario 6: Add Surface Area Calculation

**Task:** "Calculate and display approximate surface area"

**Solution:** Add function to `services/mathUtils.ts`:

```typescript
export function calculateSurfaceArea(surfacePoints: Point3D[], indices: number[]): number {
  let totalArea = 0;
  
  // Sum area of all triangles
  for (let i = 0; i < indices.length; i += 3) {
    const p0 = surfacePoints[indices[i]];
    const p1 = surfacePoints[indices[i + 1]];
    const p2 = surfacePoints[indices[i + 2]];
    
    // Vectors for two edges
    const v1 = {
      x: p1.x - p0.x,
      y: p1.y - p0.y,
      z: p1.z - p0.z
    };
    
    const v2 = {
      x: p2.x - p0.x,
      y: p2.y - p0.y,
      z: p2.z - p0.z
    };
    
    // Cross product
    const cross = {
      x: v1.y * v2.z - v1.z * v2.y,
      y: v1.z * v2.x - v1.x * v2.z,
      z: v1.x * v2.y - v1.y * v2.x
    };
    
    // Half the magnitude of cross product = triangle area
    const triangleArea = 0.5 * Math.sqrt(cross.x**2 + cross.y**2 + cross.z**2);
    totalArea += triangleArea;
  }
  
  return totalArea;
}
```

Then use in `App.tsx` or display in UI.

---

## ⚡ Quick Debugging Tips

### If surface looks wrong:

1. **Check console for errors** - validation might have failed
2. **Verify parameters:**
   - `degree < controlPoints - 1`?
   - `controlPoints ≥ degree + 1`?
3. **Check curve count:** `≥ 2 curves`?
4. **Inspect data:** Are curves degenerate (all same point)?
5. **Check parameterization:** Try switching between UNIFORM and CHORD_LENGTH

### If surface is too rough/faceted:

- Increase `renderResolution` (line 17 in surfaceEngine.ts)
- More tessellation triangles = smoother appearance

### If surface is too smooth (loses detail):

- Increase `uControlPoints` or `vControlPoints`
- Fewer control points = more approximation/smoothing
- More control points = tighter fit to data

### If surface doesn't match input curves:

- **Too few control points:** Under-approximation
- **Wrong parameterization:** Try CHORD_LENGTH for irregular curves
- **Degree too high:** Try degree 2 or 3

### If performance is slow:

- Reduce `renderResolution` (fewer triangles)
- Reduce `numCurves` or `pointsPerCurve`
- Check for unnecessary re-renders in React components

---

## 📊 Project Architecture

```
┌─────────────────────────────────────────────────────────┐
│                       App.tsx                            │
│  - Main state management                                 │
│  - Parameter controls                                    │
│  - Data flow orchestration                               │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────┐     ┌──────────┐
│Controls │     │ Viewer3D │
│  .tsx   │     │   .tsx   │
└────┬────┘     └────┬─────┘
     │               │
     │               │ Uses Three.js
     │               │
     ▼               ▼
┌─────────────────────────┐
│   Data Flow              │
│                          │
│  1. Input Curves         │
│  2. generateCompositeSurface()
│  3. Surface Data         │
│  4. Rendering            │
└────┬────────────────────┘
     │
     │ Calls
     │
     ▼
┌──────────────────────────────────────┐
│     services/                         │
│                                       │
│  ┌──────────────────────────────┐   │
│  │  surfaceEngine.ts            │   │
│  │  - Separable least squares   │   │
│  │  - U/V direction fitting     │   │
│  │  - Tessellation              │   │
│  └──────────┬───────────────────┘   │
│             │                        │
│             │ Uses                   │
│             ▼                        │
│  ┌──────────────────────────────┐   │
│  │  mathUtils.ts                │   │
│  │  - Basis functions           │   │
│  │  - Least squares solver      │   │
│  │  - Parameterization          │   │
│  │  - Linear algebra            │   │
│  └──────────────────────────────┘   │
│                                       │
│  ┌──────────────────────────────┐   │
│  │  dataGenerator.ts            │   │
│  │  - Preset curve generation   │   │
│  │  - Sine, Airfoil, Spiral     │   │
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

---

## 📝 Mathematical Formulas Summary

### B-spline Curve:
$$C(u) = \sum_{i=0}^{n-1} N_{i,p}(u) \cdot P_i$$

### B-spline Surface (Tensor Product):
$$S(u,v) = \sum_{i=0}^{n-1} \sum_{j=0}^{m-1} N_{i,p}(u) \cdot N_{j,q}(v) \cdot P_{ij}$$

### Cox-de Boor Recursion:
$$N_{i,0}(u) = \begin{cases} 1 & \text{if } u_i \leq u < u_{i+1} \\ 0 & \text{otherwise} \end{cases}$$

$$N_{i,p}(u) = \frac{u - u_i}{u_{i+p} - u_i} N_{i,p-1}(u) + \frac{u_{i+p+1} - u}{u_{i+p+1} - u_{i+1}} N_{i+1,p-1}(u)$$

### Least Squares:
Minimize: $\| N \cdot D - P \|^2$

Solution: $(N^T N) D = N^T P$

### Knot Vector Size:
$$m = n + p + 1$$
- $m$ = number of knots
- $n$ = number of control points  
- $p$ = degree

### Parameterization:

**Uniform:**
$$t_i = \frac{i}{n-1}$$

**Chord Length:**
$$t_i = \frac{\sum_{j=1}^{i} \|P_j - P_{j-1}\|}{\sum_{j=1}^{n-1} \|P_j - P_{j-1}\|}$$

---

## 🎯 What to Practice Right Now

### 1. Run and Test the Project

```powershell
# In the project directory
npm install  # If not already done
npm run dev
```

**Try all features:**
- Switch between Preset and Drawn modes
- Try different curve types (Sine, Airfoil, Spiral)
- Adjust degrees (1-5)
- Adjust control points
- Change visualization modes (Solid, Wireframe, Hybrid)
- Test parameterization methods

### 2. Make Small Edits (Build Confidence)

**Easy edits:**
- Change default parameter values in `App.tsx`
- Modify colors in `Viewer3D.tsx`
- Add console.log statements to trace execution

**Medium edits:**
- Add input validation with custom error messages
- Implement the centripetal parameterization
- Add surface area calculation

**Advanced edits:**
- Implement a different basis function (e.g., Catmull-Rom)
- Add export functionality (STL, OBJ format)
- Implement adaptive tessellation (more triangles where curvature is high)

### 3. Explain Out Loud

Practice explaining to yourself:
1. What is separable least squares and why use it?
2. How does the Cox-de Boor recursion work?
3. What's the relationship between knots, degree, and control points?
4. Walk through the entire data flow from user input to rendered surface
5. What happens when you change each parameter?

### 4. Prepare for Live Coding

**Common tasks professors ask:**
- "Add a new parameter"
- "Change the default behavior"
- "Add validation"
- "Add logging/debugging output"
- "Explain this function" (then ask you to modify it)

**Practice:**
- Adding a simple validation check
- Adding a console.log statement
- Changing a numeric constant
- Adding a new case to an if/switch statement

---

## 🎓 Key Files Cheat Sheet

| File | Primary Responsibility | Key Lines |
|------|----------------------|-----------|
| `App.tsx` | State management, UI orchestration | 1-210 |
| `services/surfaceEngine.ts` | Separable least squares algorithm | 10-115 |
| `services/mathUtils.ts` | B-spline math, basis functions, solver | 1-275 |
| `services/dataGenerator.ts` | Preset curve generation | - |
| `components/Viewer3D.tsx` | Three.js rendering | 1-252 |
| `components/Controls.tsx` | UI controls and parameters | 1-267 |
| `types.ts` | TypeScript type definitions | 1-58 |

---

## 🚀 Final Tips for Exam Success

### Before the Exam:

1. **Run the project** - Make sure it works perfectly
2. **Review this document** - Understand all concepts
3. **Practice explaining** - Out loud, to yourself or a friend
4. **Make a small edit** - Build confidence with the codebase
5. **Prepare questions** - Have 2-3 questions ready to ask the professor

### During the Exam:

1. **Stay calm** - You built this, you know it
2. **Think before coding** - Understand what's being asked
3. **Explain as you go** - Talk through your reasoning
4. **Test your changes** - If time allows, verify your edit works
5. **Ask for clarification** - If you're unsure what they want

### Key Confidence Boosters:

✅ You implemented a complex CAGD algorithm  
✅ You understand the mathematical foundations  
✅ You built a full-stack visualization application  
✅ You can explain both theory and implementation  
✅ You can navigate and modify your codebase  

### Remember:

- **Professors want to see understanding**, not perfection
- **Explaining your thought process** is often more important than getting the exact syntax right
- **It's okay to say "I'm not sure, but I would..."** if you're uncertain
- **Your project demonstrates real skill** - be proud of it!

---

## 📚 Additional Resources

### Mathematical Background:
- CAGD Textbook - Chapter 12: Composite Surfaces
- Chapter on B-spline Curves and Surfaces
- Least Squares Approximation theory

### Technical Documentation:
- `docs/algorithms.md` - Algorithm details
- `docs/math_background.md` - Mathematical foundations
- `docs/surface_pipeline.md` - Pipeline explanation
- `docs/user_guide.md` - User interface guide

### Online Resources:
- Three.js documentation: https://threejs.org/docs/
- B-spline visualization tools
- CAD/CAM textbooks on surface modeling

---

## Good Luck! 🎉

You've built an impressive project that demonstrates:
- Strong understanding of geometric modeling
- Solid programming skills in TypeScript/React
- Ability to implement complex mathematical algorithms
- Good software architecture and code organization

**You've got this!** Be confident, explain clearly, and show your understanding. The professor will be impressed with your work.

---

**Last Updated:** December 17, 2025
