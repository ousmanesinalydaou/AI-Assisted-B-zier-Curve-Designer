# Mathematical Concepts Lesson
## AI-Assisted Bézier Curve Designer

**Author:** OUSMANE DAOU  
**Supervisor:** Kunkli Roland Imre  
**Institution:** University of Debrecen, Faculty of Informatics  
**Course:** Geometric Modeling (MSc Computer Science)

---

## Table of Contents

1. [Introduction to Bézier Curves](#1-introduction-to-bézier-curves)
2. [Mathematical Foundations](#2-mathematical-foundations)
3. [Bernstein Polynomials](#3-bernstein-polynomials)
4. [De Casteljau's Algorithm](#4-de-casteljaus-algorithm)
5. [Curve Properties and Characteristics](#5-curve-properties-and-characteristics)
6. [Curve Fitting and Least Squares](#6-curve-fitting-and-least-squares)
7. [Neural Networks for Curve Prediction](#7-neural-networks-for-curve-prediction)
8. [3D Visualization with WebGL](#8-3d-visualization-with-webgl)
9. [Practical Exercises](#9-practical-exercises)
10. [Advanced Topics](#10-advanced-topics)

---

## 1. Introduction to Bézier Curves

### What are Bézier Curves?

Bézier curves are **parametric curves** used extensively in computer graphics, CAD/CAM systems, and vector graphics. They were developed independently by Pierre Bézier (at Renault) and Paul de Casteljau (at Citroën) in the 1960s for designing automobile bodies.

### Why Bézier Curves?

**Advantages:**
- **Intuitive Control:** Shape controlled by a small number of control points
- **Smooth Interpolation:** Produces aesthetically pleasing curves
- **Mathematical Precision:** Exact representation using polynomials
- **Affine Invariance:** Transformations (rotation, scaling, translation) can be applied to control points
- **Convex Hull Property:** Curve lies within the convex hull of control points

**Applications:**
- Font design (TrueType, PostScript fonts)
- Vector graphics (SVG, Adobe Illustrator)
- Animation and motion paths
- 3D modeling and surface design
- Your app: Hand-drawn curve approximation

---

## 2. Mathematical Foundations

### 2.1 Parametric Representation

A Bézier curve is defined parametrically as:

$$
\mathbf{C}(t) = (x(t), y(t)), \quad t \in [0, 1]
$$

Where:
- $t$ is the **parameter** ranging from 0 to 1
- $t = 0$ gives the start point
- $t = 1$ gives the end point
- $0 < t < 1$ gives intermediate points

**Example:** Linear Bézier Curve (straight line between two points)

$$
\mathbf{C}(t) = (1-t)\mathbf{P}_0 + t\mathbf{P}_1
$$

Where $\mathbf{P}_0$ and $\mathbf{P}_1$ are control points.

### 2.2 General Formula

A Bézier curve of degree $n$ with $n+1$ control points $\mathbf{P}_0, \mathbf{P}_1, \ldots, \mathbf{P}_n$ is:

$$
\mathbf{C}(t) = \sum_{i=0}^{n} B_{i,n}(t) \mathbf{P}_i, \quad t \in [0, 1]
$$

Where $B_{i,n}(t)$ are the **Bernstein basis polynomials**.

---

## 3. Bernstein Polynomials

### 3.1 Definition

The Bernstein polynomial of degree $n$ is:

$$
B_{i,n}(t) = \binom{n}{i} t^i (1-t)^{n-i}
$$

Where:
- $\binom{n}{i} = \frac{n!}{i!(n-i)!}$ is the binomial coefficient
- $i = 0, 1, 2, \ldots, n$
- $t \in [0, 1]$

### 3.2 Properties

**1. Non-negativity:** $B_{i,n}(t) \geq 0$ for all $t \in [0, 1]$

**2. Partition of Unity:** 
$$
\sum_{i=0}^{n} B_{i,n}(t) = 1, \quad \forall t \in [0, 1]
$$

**3. Symmetry:** 
$$
B_{i,n}(t) = B_{n-i,n}(1-t)
$$

**4. Endpoint Values:**
$$
B_{i,n}(0) = \begin{cases} 
1 & \text{if } i = 0 \\
0 & \text{otherwise}
\end{cases}
\quad
B_{i,n}(1) = \begin{cases} 
1 & \text{if } i = n \\
0 & \text{otherwise}
\end{cases}
$$

**5. Maximum:** $B_{i,n}(t)$ reaches its maximum at $t = \frac{i}{n}$

### 3.3 Examples

**Linear (n=1):**
$$
B_{0,1}(t) = 1-t, \quad B_{1,1}(t) = t
$$

**Quadratic (n=2):**
$$
B_{0,2}(t) = (1-t)^2, \quad B_{1,2}(t) = 2t(1-t), \quad B_{2,2}(t) = t^2
$$

**Cubic (n=3):** *(Most common in your app)*
$$
\begin{align}
B_{0,3}(t) &= (1-t)^3 \\
B_{1,3}(t) &= 3t(1-t)^2 \\
B_{2,3}(t) &= 3t^2(1-t) \\
B_{3,3}(t) &= t^3
\end{align}
$$

### 3.4 Visualization Exercise

Plot these Bernstein polynomials for $t \in [0,1]$:

```python
import numpy as np
import matplotlib.pyplot as plt

t = np.linspace(0, 1, 100)

# Cubic Bernstein polynomials
B0 = (1-t)**3
B1 = 3*t*(1-t)**2
B2 = 3*t**2*(1-t)
B3 = t**3

plt.plot(t, B0, label='$B_{0,3}(t)$')
plt.plot(t, B1, label='$B_{1,3}(t)$')
plt.plot(t, B2, label='$B_{2,3}(t)$')
plt.plot(t, B3, label='$B_{3,3}(t)$')
plt.legend()
plt.xlabel('t')
plt.ylabel('Bernstein Basis')
plt.title('Cubic Bernstein Polynomials')
plt.grid(True)
plt.show()
```

**Key Observation:** Notice how the sum equals 1 at every $t$ value!

---

## 4. De Casteljau's Algorithm

### 4.1 The Algorithm

De Casteljau's algorithm is a **recursive method** to evaluate Bézier curves. It's numerically stable and provides geometric insight.

**Recursive Formula:**
$$
\mathbf{P}_i^{(k)}(t) = (1-t)\mathbf{P}_i^{(k-1)}(t) + t\mathbf{P}_{i+1}^{(k-1)}(t)
$$

Where:
- $k$ is the recursion level ($k = 1, 2, \ldots, n$)
- $i = 0, 1, \ldots, n-k$
- $\mathbf{P}_i^{(0)} = \mathbf{P}_i$ (original control points)
- $\mathbf{P}_0^{(n)}(t) = \mathbf{C}(t)$ (final curve point)

### 4.2 Geometric Interpretation

At each level, you perform **linear interpolation** between consecutive points:

1. Start with $n+1$ control points
2. Create $n$ intermediate points by linear interpolation
3. Create $n-1$ points from those $n$ points
4. Repeat until you get a single point — that's $\mathbf{C}(t)$

### 4.3 Example: Cubic Bézier

Given control points $\mathbf{P}_0, \mathbf{P}_1, \mathbf{P}_2, \mathbf{P}_3$ and parameter $t$:

**Level 1:** (3 points)
$$
\begin{align}
\mathbf{P}_0^{(1)} &= (1-t)\mathbf{P}_0 + t\mathbf{P}_1 \\
\mathbf{P}_1^{(1)} &= (1-t)\mathbf{P}_1 + t\mathbf{P}_2 \\
\mathbf{P}_2^{(1)} &= (1-t)\mathbf{P}_2 + t\mathbf{P}_3
\end{align}
$$

**Level 2:** (2 points)
$$
\begin{align}
\mathbf{P}_0^{(2)} &= (1-t)\mathbf{P}_0^{(1)} + t\mathbf{P}_1^{(1)} \\
\mathbf{P}_1^{(2)} &= (1-t)\mathbf{P}_1^{(1)} + t\mathbf{P}_2^{(1)}
\end{align}
$$

**Level 3:** (1 point - the result!)
$$
\mathbf{C}(t) = \mathbf{P}_0^{(3)} = (1-t)\mathbf{P}_0^{(2)} + t\mathbf{P}_1^{(2)}
$$

### 4.4 Implementation

```typescript
// From your app: src/algorithms/curveFitting.ts (simplified)
function deCasteljau(controlPoints: Point[], t: number): Point {
  let points = [...controlPoints];
  
  // Recursive subdivision
  while (points.length > 1) {
    const newPoints: Point[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const x = (1 - t) * points[i].x + t * points[i + 1].x;
      const y = (1 - t) * points[i].y + t * points[i + 1].y;
      newPoints.push({ x, y });
    }
    points = newPoints;
  }
  
  return points[0];
}
```

### 4.5 Visual Exercise

Draw a cubic Bézier curve manually using De Casteljau's algorithm for $t = 0.5$:

1. Draw 4 control points: $P_0$, $P_1$, $P_2$, $P_3$
2. Mark midpoints between consecutive pairs (level 1)
3. Mark midpoints of those midpoints (level 2)
4. Mark the final midpoint (level 3) — that's $\mathbf{C}(0.5)$!

---

## 5. Curve Properties and Characteristics

### 5.1 Endpoint Interpolation

**Property:** The curve **always passes through** the first and last control points.

**Proof:**
$$
\mathbf{C}(0) = \sum_{i=0}^{n} B_{i,n}(0) \mathbf{P}_i = B_{0,n}(0) \mathbf{P}_0 = \mathbf{P}_0
$$

$$
\mathbf{C}(1) = \sum_{i=0}^{n} B_{i,n}(1) \mathbf{P}_i = B_{n,n}(1) \mathbf{P}_n = \mathbf{P}_n
$$

### 5.2 Tangent Vectors

**Property:** The curve's **tangent at the endpoints** is determined by the first and last control polygon segments.

**Derivative:**
$$
\mathbf{C}'(t) = n \sum_{i=0}^{n-1} B_{i,n-1}(t) (\mathbf{P}_{i+1} - \mathbf{P}_i)
$$

**At endpoints:**
$$
\mathbf{C}'(0) = n(\mathbf{P}_1 - \mathbf{P}_0)
$$

$$
\mathbf{C}'(1) = n(\mathbf{P}_n - \mathbf{P}_{n-1})
$$

**For cubic curves:** The tangent at $t=0$ points from $P_0$ to $P_1$ (scaled by 3).

### 5.3 Convex Hull Property

**Property:** The curve lies **entirely within** the convex hull of its control points.

**Proof:** Since:
- $B_{i,n}(t) \geq 0$ for all $i, t$
- $\sum_{i=0}^{n} B_{i,n}(t) = 1$

The curve is a **convex combination** of control points, so it must lie in their convex hull.

**Practical Implication:** You can quickly check if a curve intersects a region by checking if its control polygon intersects that region.

### 5.4 Affine Invariance

**Property:** Applying an affine transformation (translation, rotation, scaling, shearing) to the control points gives the same result as transforming the curve.

$$
T(\mathbf{C}(t)) = \sum_{i=0}^{n} B_{i,n}(t) T(\mathbf{P}_i)
$$

Where $T$ is an affine transformation.

**Practical Implication:** To rotate/scale a curve, just rotate/scale the control points!

### 5.5 Variation Diminishing Property

**Property:** A Bézier curve does not "wiggle" more than its control polygon.

Formally: The number of times a line intersects the curve is ≤ the number of times it intersects the control polygon.

**Practical Implication:** Smooth control polygon → smooth curve.

---

## 6. Curve Fitting and Least Squares

### 6.1 The Problem

**Given:** A set of data points $\{(x_i, y_i)\}_{i=1}^{m}$ (e.g., user's hand-drawn stroke)

**Goal:** Find control points $\mathbf{P}_0, \mathbf{P}_1, \ldots, \mathbf{P}_n$ such that the Bézier curve $\mathbf{C}(t)$ **best approximates** the data.

### 6.2 Parameterization

First, assign a parameter value $t_i \in [0,1]$ to each data point.

**Chord-length parameterization:** (Used in your app)

$$
t_i = \frac{\sum_{j=1}^{i} d_j}{\sum_{j=1}^{m-1} d_j}
$$

Where $d_j = \|\mathbf{D}_j - \mathbf{D}_{j-1}\|$ is the distance between consecutive data points.

**Why?** This distributes parameters proportionally to the spacing of data points.

### 6.3 Least Squares Formulation

**Objective:** Minimize the sum of squared distances:

$$
E = \sum_{i=1}^{m} \|\mathbf{D}_i - \mathbf{C}(t_i)\|^2
$$

Where:
- $\mathbf{D}_i = (x_i, y_i)$ are data points
- $\mathbf{C}(t_i)$ is the curve at parameter $t_i$

**Expanding:**
$$
\mathbf{C}(t_i) = \sum_{j=0}^{n} B_{j,n}(t_i) \mathbf{P}_j
$$

**For cubic curves** with fixed endpoints ($\mathbf{P}_0$ and $\mathbf{P}_3$), we need to find $\mathbf{P}_1$ and $\mathbf{P}_2$.

### 6.4 Matrix Formulation

Separate x and y coordinates:

$$
E_x = \sum_{i=1}^{m} \left(x_i - \sum_{j=0}^{3} B_{j,3}(t_i) P_{j,x}\right)^2
$$

$$
E_y = \sum_{i=1}^{m} \left(y_i - \sum_{j=0}^{3} B_{j,3}(t_i) P_{j,y}\right)^2
$$

**In matrix form:**
$$
\mathbf{X} = \mathbf{B} \mathbf{P}_x, \quad \mathbf{Y} = \mathbf{B} \mathbf{P}_y
$$

Where:
- $\mathbf{B}$ is an $m \times 4$ matrix with $B_{ij} = B_{j-1,3}(t_i)$
- $\mathbf{X}$, $\mathbf{Y}$ are $m \times 1$ vectors of data coordinates
- $\mathbf{P}_x$, $\mathbf{P}_y$ are $4 \times 1$ vectors of control point coordinates

### 6.5 Normal Equations

To minimize $E$, take derivatives with respect to $\mathbf{P}_1$ and $\mathbf{P}_2$ and set to zero.

This gives the **normal equations:**

$$
\mathbf{B}^T \mathbf{B} \mathbf{P}_x = \mathbf{B}^T \mathbf{X}
$$

$$
\mathbf{B}^T \mathbf{B} \mathbf{P}_y = \mathbf{B}^T \mathbf{Y}
$$

**Solution:**
$$
\mathbf{P}_x = (\mathbf{B}^T \mathbf{B})^{-1} \mathbf{B}^T \mathbf{X}
$$

$$
\mathbf{P}_y = (\mathbf{B}^T \mathbf{B})^{-1} \mathbf{B}^T \mathbf{Y}
$$

### 6.6 Implementation Example

```typescript
// Simplified from your app
function fitCubicBezier(dataPoints: Point[]): Point[] {
  const m = dataPoints.length;
  
  // Step 1: Chord-length parameterization
  const t = chordLengthParameterization(dataPoints);
  
  // Step 2: Fix endpoints
  const P0 = dataPoints[0];
  const P3 = dataPoints[m - 1];
  
  // Step 3: Build Bernstein matrix B
  const B: number[][] = [];
  for (let i = 0; i < m; i++) {
    B[i] = [
      bernstein(0, 3, t[i]),
      bernstein(1, 3, t[i]),
      bernstein(2, 3, t[i]),
      bernstein(3, 3, t[i])
    ];
  }
  
  // Step 4: Solve for P1 and P2 using normal equations
  // (Involves matrix multiplication and inversion)
  const P1 = solveForP1(B, dataPoints, P0, P3);
  const P2 = solveForP2(B, dataPoints, P0, P3);
  
  return [P0, P1, P2, P3];
}
```

### 6.7 Error Analysis

**Root Mean Square Error (RMSE):**
$$
\text{RMSE} = \sqrt{\frac{1}{m} \sum_{i=1}^{m} \|\mathbf{D}_i - \mathbf{C}(t_i)\|^2}
$$

**Maximum Error:**
$$
\text{MaxError} = \max_{i=1,\ldots,m} \|\mathbf{D}_i - \mathbf{C}(t_i)\|
$$

Lower values indicate better fit.

---

## 7. Neural Networks for Curve Prediction

### 7.1 The Problem

**Given:** Partial stroke data (first few points)

**Goal:** Predict the full set of control points for the complete curve

**Why Neural Networks?** 
- Learn patterns from user drawing behavior
- Handle noisy, incomplete data
- Real-time prediction without complex algorithms

### 7.2 Network Architecture

Your app uses a **Multi-Layer Perceptron (MLP)** with:

**Input Layer:**
- Coordinates of partial stroke points
- Flattened to 1D vector: $[x_1, y_1, x_2, y_2, \ldots]$
- Padded/truncated to fixed size (e.g., 50 points → 100 inputs)

**Hidden Layers:**
```
Input (100) → Dense(256) → ReLU → Dropout(0.3)
           → Dense(128) → ReLU → Dropout(0.3)
           → Dense(64)  → ReLU
```

**Output Layer:**
- 8 values: $[P_{1x}, P_{1y}, P_{2x}, P_{2y}, P_{3x}, P_{3y}, P_{4x}, P_{4y}]$
- These are the 4 control points (endpoints + 2 internal)

### 7.3 Activation Functions

**ReLU (Rectified Linear Unit):**
$$
\text{ReLU}(x) = \max(0, x)
$$

**Properties:**
- Non-linear (enables learning complex patterns)
- Fast to compute
- Avoids vanishing gradient problem
- Output range: $[0, \infty)$

**Gradient:**
$$
\frac{d}{dx}\text{ReLU}(x) = \begin{cases}
1 & \text{if } x > 0 \\
0 & \text{if } x \leq 0
\end{cases}
$$

### 7.4 Loss Function

**Mean Squared Error (MSE):**
$$
L = \frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2
$$

Where:
- $y_i$ are true control point coordinates
- $\hat{y}_i$ are predicted control point coordinates
- $n = 8$ (number of output values)

**Why MSE?** 
- Penalizes large errors more heavily (squared term)
- Differentiable (needed for backpropagation)
- Natural choice for regression problems

### 7.5 Training Process

**1. Forward Propagation:**
$$
\mathbf{h}_1 = \text{ReLU}(\mathbf{W}_1 \mathbf{x} + \mathbf{b}_1)
$$
$$
\mathbf{h}_2 = \text{ReLU}(\mathbf{W}_2 \mathbf{h}_1 + \mathbf{b}_2)
$$
$$
\hat{\mathbf{y}} = \mathbf{W}_3 \mathbf{h}_2 + \mathbf{b}_3
$$

**2. Compute Loss:**
$$
L = \text{MSE}(\mathbf{y}, \hat{\mathbf{y}})
$$

**3. Backpropagation:**
Compute gradients using chain rule:
$$
\frac{\partial L}{\partial \mathbf{W}_i}, \quad \frac{\partial L}{\partial \mathbf{b}_i}
$$

**4. Parameter Update (Adam Optimizer):**
$$
\mathbf{W}_i \leftarrow \mathbf{W}_i - \alpha \cdot \text{Adam}(\frac{\partial L}{\partial \mathbf{W}_i})
$$

Where $\alpha$ is the learning rate.

### 7.6 Regularization Techniques

**Dropout (p=0.3):**
- Randomly "drop" 30% of neurons during training
- Prevents overfitting
- Forces network to learn robust features
- **Not used during inference**

**Mathematical Model:**
$$
\mathbf{h}_{\text{dropout}} = \mathbf{h} \odot \mathbf{m}
$$

Where $\mathbf{m}$ is a binary mask with $P(m_i = 1) = 0.7$.

### 7.7 Evaluation Metrics

**Training Loss:** MSE on training data

**Validation Loss:** MSE on held-out validation data
- Your model achieved: **0.029460** (very good!)

**Visual Inspection:** Compare predicted curves with ground truth

### 7.8 PyTorch Implementation

```python
# From your backend: bezier_predictor.py
import torch
import torch.nn as nn

class BezierPredictor(nn.Module):
    def __init__(self, input_size=100, output_size=8):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_size, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            
            nn.Linear(128, 64),
            nn.ReLU(),
            
            nn.Linear(64, output_size)
        )
    
    def forward(self, x):
        return self.network(x)

# Training
model = BezierPredictor()
criterion = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

for epoch in range(num_epochs):
    optimizer.zero_grad()
    predictions = model(inputs)
    loss = criterion(predictions, targets)
    loss.backward()
    optimizer.step()
```

---

## 8. 3D Visualization with WebGL

### 8.1 Coordinate Systems

**Screen Space (2D):**
- Origin: Top-left corner
- X-axis: Right (+)
- Y-axis: Down (+)
- Range: $[0, \text{width}] \times [0, \text{height}]$

**Normalized Device Coordinates (NDC):**
- Origin: Center
- X-axis: Right (+)
- Y-axis: Up (+)
- Z-axis: Out of screen (+)
- Range: $[-1, 1]^3$

**Transformation:**
$$
x_{\text{NDC}} = \frac{2x_{\text{screen}}}{\text{width}} - 1
$$
$$
y_{\text{NDC}} = 1 - \frac{2y_{\text{screen}}}{\text{height}}
$$

### 8.2 3D Curve Representation

Your app renders Bézier curves in 3D by:

**1. Z-coordinate from curvature:**
$$
z(t) = k \cdot \kappa(t)
$$

Where $\kappa(t)$ is the curvature:
$$
\kappa(t) = \frac{|\mathbf{C}'(t) \times \mathbf{C}''(t)|}{|\mathbf{C}'(t)|^3}
$$

**2. First derivative:**
$$
\mathbf{C}'(t) = \frac{d\mathbf{C}}{dt} = \sum_{i=0}^{n-1} n B_{i,n-1}(t) (\mathbf{P}_{i+1} - \mathbf{P}_i)
$$

**3. Second derivative:**
$$
\mathbf{C}''(t) = \frac{d^2\mathbf{C}}{dt^2} = \sum_{i=0}^{n-2} n(n-1) B_{i,n-2}(t) (\mathbf{P}_{i+2} - 2\mathbf{P}_{i+1} + \mathbf{P}_i)
$$

### 8.3 Projection Matrix

**Perspective Projection:**
$$
\mathbf{P} = \begin{bmatrix}
\frac{1}{\tan(\text{fov}/2) \cdot \text{aspect}} & 0 & 0 & 0 \\
0 & \frac{1}{\tan(\text{fov}/2)} & 0 & 0 \\
0 & 0 & \frac{-(\text{far}+\text{near})}{\text{far}-\text{near}} & \frac{-2 \cdot \text{far} \cdot \text{near}}{\text{far}-\text{near}} \\
0 & 0 & -1 & 0
\end{bmatrix}
$$

Where:
- **fov:** Field of view (e.g., 45°)
- **aspect:** Width/height ratio
- **near, far:** Clipping planes

**View Matrix (Camera):**
$$
\mathbf{V} = \text{lookAt}(\text{eye}, \text{center}, \text{up})
$$

**Model Matrix (Rotation):**
$$
\mathbf{M} = \mathbf{R}_y(\theta_y) \cdot \mathbf{R}_x(\theta_x)
$$

**Final transformation:**
$$
\mathbf{P} \cdot \mathbf{V} \cdot \mathbf{M} \cdot \begin{bmatrix} x \\ y \\ z \\ 1 \end{bmatrix}
$$

### 8.4 Vertex Shader (GLSL)

```glsl
// Transforms vertex positions
attribute vec3 position;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

void main() {
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
```

### 8.5 Fragment Shader (GLSL)

```glsl
// Determines pixel color
uniform vec3 color;

void main() {
  gl_FragColor = vec4(color, 1.0);
}
```

### 8.6 Line Rendering

**BufferGeometry:**
- Store curve points as vertices
- Connect consecutive vertices with lines

```typescript
const geometry = new THREE.BufferGeometry();
const points = evaluateBezierCurve(controlPoints, numSamples);
geometry.setFromPoints(points);

const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
const line = new THREE.Line(geometry, material);
scene.add(line);
```

---

## 9. Practical Exercises

### Exercise 1: Manual Curve Evaluation

**Task:** Given cubic Bézier control points:
- $P_0 = (0, 0)$
- $P_1 = (1, 2)$
- $P_2 = (3, 2)$
- $P_3 = (4, 0)$

Calculate $\mathbf{C}(0.5)$ using:
1. Bernstein formula
2. De Casteljau's algorithm

**Solution:**

**Method 1: Bernstein Formula**
$$
\mathbf{C}(0.5) = B_{0,3}(0.5)P_0 + B_{1,3}(0.5)P_1 + B_{2,3}(0.5)P_2 + B_{3,3}(0.5)P_3
$$

$$
\begin{align}
B_{0,3}(0.5) &= (0.5)^3 = 0.125 \\
B_{1,3}(0.5) &= 3(0.5)(0.5)^2 = 0.375 \\
B_{2,3}(0.5) &= 3(0.5)^2(0.5) = 0.375 \\
B_{3,3}(0.5) &= (0.5)^3 = 0.125
\end{align}
$$

$$
\begin{align}
x(0.5) &= 0.125(0) + 0.375(1) + 0.375(3) + 0.125(4) = 2.0 \\
y(0.5) &= 0.125(0) + 0.375(2) + 0.375(2) + 0.125(0) = 1.5
\end{align}
$$

**Answer:** $\mathbf{C}(0.5) = (2.0, 1.5)$

**Method 2: De Casteljau**
(Try this yourself!)

---

### Exercise 2: Tangent Vectors

**Task:** For the same curve, find:
1. $\mathbf{C}'(0)$ (tangent at start)
2. $\mathbf{C}'(1)$ (tangent at end)

**Solution:**

$$
\mathbf{C}'(0) = 3(P_1 - P_0) = 3[(1,2) - (0,0)] = (3, 6)
$$

$$
\mathbf{C}'(1) = 3(P_3 - P_2) = 3[(4,0) - (3,2)] = (3, -6)
$$

**Interpretation:** At $t=0$, the curve moves right and up. At $t=1$, it moves right and down.

---

### Exercise 3: Curve Fitting

**Task:** Given data points:
- $(0, 0), (0.5, 1), (1, 1.5), (1.5, 1.8), (2, 2)$

Fit a cubic Bézier curve with fixed endpoints $P_0 = (0,0)$ and $P_3 = (2,2)$.

**Steps:**
1. Assign parameters using chord-length
2. Build Bernstein matrix $\mathbf{B}$
3. Solve normal equations for $P_1$ and $P_2$

(Full solution requires matrix operations — implement in code!)

---

### Exercise 4: Neural Network Prediction

**Task:** Design a simple neural network to predict control points from 10 input points.

**Architecture:**
- Input: 20 values (10 points × 2 coordinates)
- Hidden: 64 neurons, ReLU
- Output: 8 values (4 control points × 2 coordinates)

**Questions:**
1. How many trainable parameters does this network have?
2. What loss function would you use?
3. How would you prevent overfitting?

**Answers:**
1. Parameters: $20 \times 64 + 64$ (layer 1) $+ 64 \times 8 + 8$ (layer 2) $= 1,864$
2. Loss: Mean Squared Error (MSE)
3. Overfitting prevention: Dropout, L2 regularization, early stopping

---

### Exercise 5: 3D Visualization

**Task:** Calculate the curvature $\kappa(t)$ for the cubic curve at $t = 0.5$.

**Formulas:**
$$
\mathbf{C}'(t) = 3B_{0,2}(t)(P_1-P_0) + 3B_{1,2}(t)(P_2-P_1) + 3B_{2,2}(t)(P_3-P_2)
$$

$$
\mathbf{C}''(t) = 6B_{0,1}(t)(P_2-2P_1+P_0) + 6B_{1,1}(t)(P_3-2P_2+P_1)
$$

$$
\kappa(t) = \frac{|x'y'' - y'x''|}{(x'^2 + y'^2)^{3/2}}
$$

(Calculate numerically using the control points from Exercise 1)

---

## 10. Advanced Topics

### 10.1 Composite Bézier Curves

**$C^0$ Continuity:** Curves connect (shared endpoint)

**$C^1$ Continuity:** Curves connect with matching tangents
$$
P_{n}^{(i)} = P_0^{(i+1)}, \quad P_n^{(i)} - P_{n-1}^{(i)} = k(P_1^{(i+1)} - P_0^{(i+1)})
$$

**$C^2$ Continuity:** Curves connect with matching curvature (second derivatives)

### 10.2 Bézier Surfaces

Extend to 2D parameter space:
$$
\mathbf{S}(u, v) = \sum_{i=0}^{n} \sum_{j=0}^{m} B_{i,n}(u) B_{j,m}(v) \mathbf{P}_{ij}
$$

Used for 3D modeling (e.g., car bodies, character models).

### 10.3 Rational Bézier Curves (NURBS)

Add weights to control points:
$$
\mathbf{C}(t) = \frac{\sum_{i=0}^{n} w_i B_{i,n}(t) \mathbf{P}_i}{\sum_{i=0}^{n} w_i B_{i,n}(t)}
$$

**Advantage:** Can represent conic sections (circles, ellipses) exactly.

### 10.4 Subdivision Algorithms

Divide a Bézier curve into two curves at parameter $t$:
- Left curve: $[0, t]$
- Right curve: $[t, 1]$

Use De Casteljau to find new control points.

**Application:** Level-of-detail rendering, collision detection.

### 10.5 Degree Elevation

Increase degree from $n$ to $n+1$ without changing curve shape:
$$
\mathbf{P}_i' = \frac{i}{n+1}\mathbf{P}_{i-1} + \frac{n+1-i}{n+1}\mathbf{P}_i
$$

### 10.6 Optimization Techniques

**Gradient Descent for Control Points:**
Minimize distance to target curve by adjusting control points iteratively.

**Genetic Algorithms:**
Evolve control points to match desired shapes.

### 10.7 Real-Time Applications

**GPU Tessellation:**
Evaluate Bézier curves on GPU for massive parallelism.

**WebGL Instancing:**
Render many curves efficiently using instanced drawing.

---

## Summary and Key Takeaways

### Core Mathematical Concepts

1. **Parametric Curves:** $\mathbf{C}(t)$, $t \in [0,1]$
2. **Bernstein Polynomials:** Basis functions with nice properties
3. **De Casteljau's Algorithm:** Recursive geometric construction
4. **Curve Properties:** Endpoint interpolation, convex hull, tangent vectors
5. **Least Squares Fitting:** Minimize error between data and curve
6. **Neural Networks:** Learn patterns for predictive modeling
7. **3D Rendering:** Transform curves to screen space using matrices

### Implementation Skills

- ✅ Evaluate Bézier curves numerically
- ✅ Fit curves to data using least squares
- ✅ Train neural networks for prediction
- ✅ Render curves in 3D using WebGL
- ✅ Handle user interaction and real-time updates

### Mathematical Foundations

- **Linear Algebra:** Vectors, matrices, transformations
- **Calculus:** Derivatives, optimization
- **Numerical Methods:** Iterative algorithms, approximation
- **Machine Learning:** Neural networks, backpropagation
- **Computer Graphics:** Coordinate systems, projections, shaders

---

## Further Reading

### Books

1. **"Curves and Surfaces for CAGD"** by Gerald Farin
   - Comprehensive treatment of Bézier curves and surfaces
   
2. **"Computer Graphics: Principles and Practice"** by Foley, van Dam, Feiner, Hughes
   - Classic reference for graphics algorithms

3. **"Deep Learning"** by Goodfellow, Bengio, Courville
   - Neural network fundamentals

### Papers

1. **"An Algorithm for Automatically Fitting Digitized Curves"** by Philip J. Schneider (1990)
   - Practical curve fitting techniques

2. **"Bézier and B-Spline Techniques"** by Hartmut Prautzsch, Wolfgang Boehm, Marco Paluszny
   - Mathematical theory and applications

### Online Resources

1. **Your App:** https://bezier-designer.unideb.app
   - Experiment with the concepts interactively!

2. **Desmos:** https://www.desmos.com
   - Plot Bernstein polynomials and curves

3. **Primer on Bézier Curves:** https://pomax.github.io/bezierinfo/
   - Interactive web-based tutorial

---

## Practice Problems

### Problem Set 1: Bernstein Polynomials

1. Prove that $\sum_{i=0}^{n} B_{i,n}(t) = 1$ using the binomial theorem.
2. Show that $B_{i,n}(t) = B_{n-i,n}(1-t)$ (symmetry property).
3. Find the maximum of $B_{2,5}(t)$ and the $t$ value where it occurs.

### Problem Set 2: Curve Evaluation

4. Implement De Casteljau's algorithm in Python for arbitrary degree $n$.
5. Compare computation time: Bernstein formula vs. De Casteljau for degree 10.
6. Visualize the construction steps of De Casteljau for $t = 0.3$.

### Problem Set 3: Curve Fitting

7. Implement chord-length parameterization.
8. Fit a quadratic Bézier to 5 data points using least squares.
9. Compare different parameterization methods (uniform, chord-length, centripetal).

### Problem Set 4: Neural Networks

10. Train a network on synthetic Bézier curve data.
11. Experiment with different architectures (deeper vs. wider).
12. Implement early stopping based on validation loss.

### Problem Set 5: 3D Graphics

13. Derive the perspective projection matrix from first principles.
14. Implement a simple camera rotation using quaternions.
15. Calculate curvature along a Bézier curve and visualize it in 3D.

---

## Conclusion

You've now covered the **complete mathematical foundation** of your AI-Assisted Bézier Curve Designer:

- ✅ **Geometric Theory:** Bézier curves, Bernstein polynomials, De Casteljau
- ✅ **Numerical Methods:** Curve fitting, least squares optimization
- ✅ **Machine Learning:** Neural networks for curve prediction
- ✅ **Computer Graphics:** 3D rendering, coordinate transformations

**Next Steps:**

1. **Practice:** Work through the exercises
2. **Experiment:** Use your app to test these concepts
3. **Explore:** Read the papers and books
4. **Build:** Extend your app with new features (surfaces, NURBS, animations)

**Remember:** Mathematics is a tool for understanding and creating beautiful things. Your Bézier Curve Designer brings these abstract concepts to life in a tangible, interactive way.

Good luck with your studies and your presentation to Professor Kunkli Roland Imre!

---

**Author:** OUSMANE DAOU  
**Email:** ousmanesinalydaou@gmail.com  
**Supervisor:** Kunkli Roland Imre  
**Institution:** University of Debrecen, Faculty of Informatics  
**Date:** November 2025

---
