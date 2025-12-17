# Mathematical Background

## Parameterization
This application uses **Uniform Parameterization** for simplicity and robustness.
$$ t_i = \frac{i}{N-1} $$
While Chord Length parameterization yields better shapes for non-uniform data, Uniform is sufficient for the procedurally generated examples (Sine, Spiral) provided.

## Basis Functions
We use the Cox-de Boor recursion formula to evaluate B-spline basis functions $N_i^p(u)$.

## Control Net Interpretation
The control net $d_{i,j}$ roughly mimics the shape of the surface but does not lie on the surface (except at corners/boundaries for open knot vectors). 
-   **Smoothing**: If the number of control points is much smaller than the number of input samples, the surface "smooths" out high-frequency noise in the input curves.
-   **Approximation**: The surface is not forced to pass through the input curves (unlike Interpolation), which is desirable when the input data is noisy or "rough".
