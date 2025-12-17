# Curve-Stacking Composite Surface Generator

## Project Overview
This application visualizes the construction of 3D composite surfaces by stacking 2D curves and fitting a B-spline surface through them. It implements the "Separable Least Squares" approximation method described in CAGD literature (Chapter 12: Composite Surfaces).

## How to Run Locally
1. Clone the repository.
2. Install dependencies (if using a bundler): `npm install`.
3. Run the development server: `npm start`.
4. Open `http://localhost:3000`.

## Features
- **Curve Stacking**: Generates families of 2D curves (Sine, Airfoil, Spiral) lifted into 3D.
- **Surface Approximation**: Fits a B-spline surface ($S(u,v)$) to the data points using least-squares.
- **Interactive Controls**: Modify degrees, control point counts (smoothing), and stack parameters in real-time.
- **WebGL Visualization**: Inspect the surface, wireframe, and control net.
