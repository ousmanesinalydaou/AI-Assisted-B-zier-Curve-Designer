# CAGD Curve Approximation Visualizer

**Interactive Web Application for Bézier Curve Fitting using Least Squares Approximation**

*MSc Computer Science - Geometric Modeling Project*  
*Technical University - Hungary, December 2025*

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Mathematical Foundations](#mathematical-foundations)
3. [Implementation Details](#implementation-details)
4. [Features](#features)
5. [Technical Architecture](#technical-architecture)
6. [Usage Guide](#usage-guide)
7. [Installation](#installation)

---

## Project Overview

This project implements an interactive web-based visualizer for **curve approximation** using **Bézier curves** and **least squares optimization**. The application allows users to interactively place data points on a canvas and observe how different parameterization methods affect the quality of curve fitting.

### Key Objectives

- Demonstrate practical application of CAGD (Computer-Aided Geometric Design) concepts
- Implement least squares approximation for Bézier curves
- Compare different parameterization strategies
- Visualize fitting errors and residuals
- Provide an educational tool for understanding curve approximation

---

## Mathematical Foundations

### 1. Bézier Curves

A **Bézier curve** of degree $n$ is defined by $n+1$ control points $\mathbf{b}_0, \mathbf{b}_1, \ldots, \mathbf{b}_n$ and is expressed as:

$$\mathbf{C}(t) = \sum_{i=0}^{n} B_i^n(t) \mathbf{b}_i, \quad t \in [0,1]$$

where $B_i^n(t)$ are the **Bernstein basis polynomials**:

$$B_i^n(t) = \binom{n}{i} t^i (1-t)^{n-i}$$

with $\binom{n}{i}$ being the binomial coefficient:

$$\binom{n}{i} = \frac{n!}{i!(n-i)!}$$

### 2. Curve Approximation Problem

Given a set of $L+1$ data points $\mathbf{p}_0, \mathbf{p}_1, \ldots, \mathbf{p}_L$, we want to find the control points $\mathbf{b}_0, \mathbf{b}_1, \ldots, \mathbf{b}_n$ of a Bézier curve of degree $n$ (where typically $n < L$) that **best approximates** these points in the least squares sense.

#### Objective Function

Minimize the sum of squared distances:

$$E = \sum_{i=0}^{L} \|\mathbf{p}_i - \mathbf{C}(t_i)\|^2$$

where $t_i$ are parameter values assigned to each data point.

### 3. Parameterization Methods

The choice of parameter values $t_i$ significantly affects the approximation quality. Two methods are implemented:

#### a) Uniform Parameterization

Parameters are distributed uniformly:

$$t_i = \frac{i}{L}, \quad i = 0, 1, \ldots, L$$

- **Advantages**: Simple, computationally efficient
- **Disadvantages**: Ignores the spatial distribution of points, may produce poor results for unevenly spaced data

#### b) Chord Length Parameterization

Parameters are proportional to the cumulative chord lengths:

$$d_i = \|\mathbf{p}_i - \mathbf{p}_{i-1}\|$$

$$t_0 = 0, \quad t_i = t_{i-1} + d_i$$

Then normalized:

$$t_i \leftarrow \frac{t_i}{\sum_{j=1}^{L} d_j}$$

- **Advantages**: Better accounts for point spacing, generally produces superior results
- **Disadvantages**: Slightly more computational overhead

### 4. Least Squares Solution

Substituting the Bézier curve equation into the objective function:

$$\mathbf{C}(t_i) = \sum_{j=0}^{n} B_j^n(t_i) \mathbf{b}_j$$

The problem becomes:

$$\min_{\mathbf{b}_0, \ldots, \mathbf{b}_n} \sum_{i=0}^{L} \left\|\mathbf{p}_i - \sum_{j=0}^{n} B_j^n(t_i) \mathbf{b}_j\right\|^2$$

This is a **linear least squares problem** that can be expressed in matrix form:

$$\mathbf{M} \mathbf{B} = \mathbf{P}$$

where:
- $\mathbf{M}$ is an $(L+1) \times (n+1)$ matrix with entries $M_{ij} = B_j^n(t_i)$
- $\mathbf{B}$ is an $(n+1) \times 2$ matrix of unknown control points
- $\mathbf{P}$ is an $(L+1) \times 2$ matrix of data points

#### Normal Equations

The least squares solution is obtained by solving the **normal equations**:

$$\mathbf{M}^T \mathbf{M} \mathbf{B} = \mathbf{M}^T \mathbf{P}$$

Let $\mathbf{A} = \mathbf{M}^T \mathbf{M}$ (an $(n+1) \times (n+1)$ symmetric positive definite matrix) and $\mathbf{Q} = \mathbf{M}^T \mathbf{P}$, then:

$$\mathbf{A} \mathbf{B} = \mathbf{Q}$$

This system is solved using **Gaussian elimination with partial pivoting**.

### 5. Error Metric

The **approximation error** is computed as the sum of squared residuals:

$$E = \sum_{i=0}^{L} \|\mathbf{p}_i - \mathbf{C}(t_i)\|^2$$

This provides a quantitative measure of fitting quality, displayed in the application interface.

### 6. Residuals Visualization

For each data point $\mathbf{p}_i$, a **residual vector** connects the point to its corresponding position on the fitted curve $\mathbf{C}(t_i)$:

$$\mathbf{r}_i = \mathbf{p}_i - \mathbf{C}(t_i)$$

These are visualized as line segments to show local fitting errors.

---

## Implementation Details

### Core Algorithms

#### 1. Bernstein Basis Function Evaluation
```typescript
B_i^n(t) = C(n,i) * t^i * (1-t)^(n-i)
```
Implemented in `mathUtils.ts::bernstein()`

#### 2. Bézier Curve Evaluation
Uses the explicit summation formula for efficiency:
```typescript
C(t) = Σ B_i^n(t) * b_i
```
Implemented in `cagdUtils.ts::evaluateBezier()`

#### 3. Linear System Solver
Gaussian elimination with partial pivoting:
- Forward elimination with row swapping for numerical stability
- Backward substitution
- Handles multiple right-hand sides (x and y coordinates simultaneously)

Implemented in `mathUtils.ts::solveLinearSystem()`

#### 4. Matrix Operations
- **Transpose**: $\mathbf{A}^T$
- **Multiplication**: $\mathbf{A} \times \mathbf{B}$

Essential for forming and solving normal equations.

### Numerical Considerations

1. **Singularity Check**: Matrix entries below $10^{-10}$ are treated as singular
2. **Degree Limitation**: Automatically clamped to avoid ill-conditioned systems
3. **Fallback**: Uniform parameterization used if all points coincide

---

## Features

### Interactive Capabilities

- ✅ **Click-to-Place Points**: Interactive point placement on canvas
- ✅ **Point Manipulation**: Drag existing points to modify the dataset
- ✅ **Point Deletion**: Right-click to remove points
- ✅ **Real-time Updates**: Curves update instantly as parameters change

### Visualization Options

- 📊 **Multiple Parameterization Methods**: Compare uniform vs chord length simultaneously
- 📈 **Residual Display**: Toggle visualization of fitting errors
- 🔷 **Control Polygon**: Show/hide control point polygons
- 🎨 **Color-Coded Methods**: Different colors for each parameterization method

### Configuration Controls

- **Degree Selection**: Adjust Bézier curve degree (1-10)
- **Method Toggle**: Enable/disable specific parameterization methods
- **Error Display**: Real-time error metrics for each method
- **Preset Shapes**: Load example datasets (wave, spiral, wing)

### Technical Features

- 🚀 **Performance**: Efficient algorithms suitable for real-time interaction
- 📱 **Responsive Design**: Works on desktop and tablet devices
- 🎯 **Numerical Stability**: Robust linear algebra with pivoting
- 🔍 **High-Quality Rendering**: Smooth curve rendering with configurable sampling

---

## Technical Architecture

### Technology Stack

- **Frontend Framework**: React 19.2.3 with TypeScript
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS (utility-first CSS framework)
- **Language**: TypeScript 5.8.2

### Project Structure

```
├── App.tsx                    # Main application component
├── components/
│   ├── ControlPanel.tsx       # UI controls and parameter adjustment
│   └── DrawingCanvas.tsx      # Interactive canvas with rendering
├── utils/
│   ├── cagdUtils.ts          # CAGD algorithms (approximation, evaluation)
│   └── mathUtils.ts          # Linear algebra and numerical methods
├── types.ts                   # TypeScript type definitions
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Build configuration
```

### Module Responsibilities

| Module | Purpose |
|--------|---------|
| `mathUtils.ts` | Linear algebra primitives (matrix ops, Bernstein basis) |
| `cagdUtils.ts` | Curve approximation, parameterization, evaluation |
| `DrawingCanvas.tsx` | Canvas rendering, user interaction |
| `ControlPanel.tsx` | UI controls, parameter management |
| `App.tsx` | State management, computation orchestration |

---

## Usage Guide

### Basic Workflow

1. **Add Points**: Click on the canvas to place data points
2. **Adjust Degree**: Use the slider to change the Bézier curve degree
3. **Compare Methods**: Toggle parameterization methods to compare results
4. **View Residuals**: Enable residual display to see fitting errors
5. **Inspect Control Points**: Show control polygon to see curve structure
6. **Load Presets**: Try pre-defined shapes to explore different scenarios

### Understanding the Display

- **Blue Points**: Your input data points
- **Colored Curves**: Fitted Bézier curves (different colors = different methods)
- **Hollow Circles**: Control points (when control polygon is enabled)
- **Dashed Lines**: Control polygon edges
- **Red/Orange Lines**: Residuals (data point to curve distance)

### Recommended Experiments

1. **Degree Impact**: Start with degree 3, gradually increase to see smoothing effect
2. **Method Comparison**: Use both methods with unevenly spaced points
3. **Overfitting**: Set degree close to number of points to observe interpolation
4. **Noise Handling**: Add clustered points to test approximation vs interpolation

---

## Installation

### Prerequisites
- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)

### Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Build for Production

```bash
npm run build
```

The optimized application will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

---

## Conclusion

This project successfully demonstrates:
- Practical implementation of fundamental CAGD concepts
- Least squares curve approximation with Bézier curves
- Impact of parameterization on fitting quality
- Real-time interactive visualization of mathematical concepts

The application serves as both an educational tool and a practical demonstration of geometric modeling techniques essential in computer graphics, CAD systems, and scientific visualization.

---

**Technologies**: React · TypeScript · Vite · Tailwind CSS  
**Mathematical Concepts**: Bézier Curves · Least Squares · Linear Algebra · Parameterization  
**Author**: MSc Computer Science Student  
**Date**: December 2025



