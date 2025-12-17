# Application Architecture

## Data Flow
The application follows a strictly unidirectional data flow:

1.  **Curve Generation (`dataGenerator.ts`)**: 
    -   Input: Curve Type, Counts, Spacing.
    -   Output: A grid of 3D points representing the raw input curves.
2.  **Surface Fitting (`surfaceEngine.ts`)**:
    -   Input: Raw points, desired B-spline degrees ($p, q$), desired control point counts ($N, M$).
    -   Process: Separable Least Squares (Fit U-direction $\to$ Fit V-direction).
    -   Output: A Control Net ($d_{i,j}$) and knot vectors.
3.  **Mesh Generation (`surfaceEngine.ts` & `Viewer3D.tsx`)**:
    -   Input: Control Net, Resolution.
    -   Process: Evaluate $S(u,v)$ at discrete intervals.
    -   Output: `Three.BufferGeometry` (Vertex positions, Indices).
4.  **Rendering (`Viewer3D.tsx`)**:
    -   React components render the Three.js scene based on the computed geometry.

## Justification of WebGL
WebGL (via Three.js) is used to handle the heavy geometric lifting required to render arbitrary B-spline surfaces at 60fps. The ability to orbit and inspect the control net relative to the surface is crucial for understanding the approximation behavior.
