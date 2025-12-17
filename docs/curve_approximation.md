# Curve Approximation & Parameterization

## Least Squares Fitting
The core algorithm solves the normal equations $(N^T N) D = N^T P$.
The quality of this fit depends heavily on the **Parameterization** of the data points $P_k$.

## Parameterization Methods

### 1. Uniform Parameterization
$$ t_i = \frac{i}{N-1} $$
- **Pros**: Fast, simple.
- **Cons**: Assumes data points are spaced equally in the curve's domain. If a user draws slowly (dense points) then quickly (sparse points), uniform parameterization will distort the curve shape, causing loops or bunching.

### 2. Chord Length Parameterization
$$ L = \sum |P_{i} - P_{i-1}| $$
$$ t_0 = 0, \quad t_i = t_{i-1} + \frac{|P_i - P_{i-1}|}{L} $$
- **Pros**: Adapts to the geometric distribution of points. Dense areas take up less "parameter space", preserving the physical shape of the stroke.
- **Cons**: Slightly more computational cost (square roots).
- **Usage**: Highly recommended for **Drawn Input** mode where hand speed varies.

## Control Point Influence
- **Smoothing vs. Fitting**: 
  - If $N_{control} \approx N_{samples}$, the curve will wiggle to hit every noise artifact.
  - If $N_{control} \ll N_{samples}$, the curve acts as a low-pass filter, smoothing out hand jitters.
