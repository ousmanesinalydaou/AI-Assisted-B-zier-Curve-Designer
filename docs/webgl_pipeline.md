# WebGL Pipeline

## Surface Sampling
The B-spline surface is continuous. To render it, we discretize it into a grid (default 20x20 resolution).
-   We iterate $u$ from 0 to 1.
-   We iterate $v$ from 0 to 1.
-   We evaluate $S(u,v)$ at each step to get a vertex.

## Mesh Generation
We generate an Indexed Triangle Mesh. For a grid of size $W \times H$:
-   Two triangles are created for every quad formed by $(i,j), (i+1,j), (i,j+1), (i+1,j+1)$.

## Rendering Modes
1.  **Solid**: Standard Phong shading (blue) to show curvature and lighting.
2.  **Wireframe**: Displays the tessellation of the B-spline evaluation.
3.  **Control Net**: Renders the $d_{i,j}$ points and lines connecting them (Red). This visually demonstrates how the sparse control net influences the dense smooth surface.
