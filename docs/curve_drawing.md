# Interactive 2D Curve Drawing

## Overview
The application now includes a "Drawn" input mode that allows users to sketch curves freehand. These curves are then processed, approximated, and lifted into 3D space to form the composite surface.

## Input Capturing
- **Canvas API**: Raw pointer events (`pointerdown`, `pointermove`) are captured on a HTML5 Canvas.
- **Coordinate Mapping**: Screen coordinates (pixels) are mapped to a normalized World Coordinate system (approx -5 to +5 range) to match the scale of the 3D viewer.
- **Sampling**: Points are sampled at a throttled distance interval to avoid excessive data density while maintaining shape fidelity.

## Real-Time Approximation
As the user draws, the application runs the **Least Squares B-Spline Fitting** algorithm on the raw stroke points in real-time (or near real-time).
- **Visual Feedback**: 
  - **Yellow Dots**: Raw input samples.
  - **Blue Line**: The approximated B-spline curve.
  - **Red Squares**: The control polygon (if active).
- This allows the user to immediately see how the mathematical model interprets their hand-drawn stroke.

## Stacking Logic
- The user creates a list of "Slices".
- Each slice corresponds to a curve $C_k(u)$ at a specific $z_k$ height.
- The $z$ height is determined automatically by the index of the slice and the `Stack Spacing` parameter.
- **Ghosting**: While not explicitly rendered as "ghosts" in the 2D canvas, the 3D viewer updates instantly, allowing the user to see the new curve in relation to previous ones in 3D space.
