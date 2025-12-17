# Surface Generation Pipeline

The transformation from 2D strokes to a 3D surface follows this pipeline:

1.  **Input Acquisition**:
    *   **Preset**: Procedural generation (Sine, Airfoil).
    *   **Drawn**: User strokes captured as `Point3D[][]` (with $z=0$ initially).

2.  **Lifting (2D $\to$ 3D)**:
    *   The engine assigns a $z$-coordinate to each curve based on its index $k$ in the stack.
    *   $P_{k,i}.z = k \cdot \text{spacing} - \text{offset}$.

3.  **U-Direction Fitting (Curves)**:
    *   For each stack layer $k$, we fit a B-spline curve $C_k(u)$ defined by control points $D_k$.
    *   This step uses the selected parameterization (Uniform or Chord Length).
    *   Result: A set of row control polygons.

4.  **V-Direction Fitting (Lofting)**:
    *   We treat the $i$-th control point of every row as a data set in the $v$ direction.
    *   We fit a B-spline curve through these points.
    *   Result: The final 2D grid of control points $d_{i,j}$ defining the surface $S(u,v)$.

5.  **Tessellation**:
    *   The tensor product surface $S(u,v)$ is evaluated at a grid of $(u,v)$ values.
    *   Indices are generated to form triangle strips/lists for WebGL rendering.
