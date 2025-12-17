# User Guide

## Modes

### 1. Preset Mode
Generates mathematical examples automatically.
1.  Select a **Curve Type** (Sine, Airfoil, Spiral).
2.  Adjust **Curve Count** and **Spacing** to change the volume.
3.  Use **U/V Control Pts** sliders to see how the surface smooths the data.

### 2. Drawn Mode (New!)
Allows freehand sketching of surface slices.
1.  Switch input mode to **DRAW**.
2.  **Draw**: Click and drag in the "2D Input Canvas" to draw a curve.
3.  **Add Slice**: Click "+ Add New Slice" to create the next layer in the stack.
4.  **Navigation**: Use Prev/Next buttons to select a specific slice to redraw/edit.
5.  **3D View**: Watch the surface update in real-time as you draw.

## Tips for Best Results
-   **Use Chord Length Parameterization**: Switch to "Chord Length" when drawing freehand to prevent the curve from bunching up if you draw at variable speeds.
-   **Smoothness**: If your hand is shaky, reduce the **U Control Points** count. The B-spline math will automatically smooth out your stroke.
-   **Minimum Curves**: You need at least 2 curves to form a surface. If you only draw one, the 3D view will show the curve but no surface mesh.
