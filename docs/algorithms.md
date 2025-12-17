# Algorithms

## Curve Approximation (Least Squares)
Given $K$ data points $P_k$ and a target of $N+1$ control points, we solve the overdetermined system:
$$P = N \cdot D$$
Where $N$ is the matrix of B-spline basis functions evaluated at parameter values $t_k$. We solve for control points $D$ using the Normal Equations:
$$D = (N^T N)^{-1} N^T P$$
This minimizes the sum of squared distances between the curve and the data points.

## Curve Stacking Strategy (Composite Surface)
We treat the surface as a tensor product B-spline:
$$S(u,v) = \sum_i \sum_j N_i^p(u) N_j^q(v) d_{i,j}$$

To solve for $d_{i,j}$ efficiently without building a massive matrix for all $u,v$ points simultaneously, we use the **Separable** property:
1.  **Row Fitting**: For every row $k$ of input points (along $u$), fit a curve. This produces a grid of intermediate control points.
2.  **Column Fitting**: For every column $l$ of the intermediate points (along $v$), fit a curve. The resulting control points form the final surface control net $d_{i,j}$.

This approach aligns with Chapter 12's reduction of surface problems to a series of curve problems.
