// Basic Linear Algebra Solver for A * x = b
// A is square matrix (n x n), b is vector (n)
export const solveLinearSystem = (A: number[][], b: number[][]): number[][] | null => {
  const n = A.length;
  // Deep copy to avoid modifying inputs
  const Mat = A.map(row => [...row]);
  // We handle b as a matrix of columns (for x and y coordinates simultaneously usually, 
  // but here we might treat x and y separately or together. 
  // Let's assume b is (n x k) where k is dimension (2 for 2D points).
  const Rhs = b.map(row => [...row]);

  // Gaussian elimination with partial pivoting
  for (let i = 0; i < n; i++) {
    // Pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(Mat[k][i]) > Math.abs(Mat[maxRow][i])) {
        maxRow = k;
      }
    }

    // Swap rows in Mat and Rhs
    [Mat[i], Mat[maxRow]] = [Mat[maxRow], Mat[i]];
    [Rhs[i], Rhs[maxRow]] = [Rhs[maxRow], Rhs[i]];

    // Check singular
    if (Math.abs(Mat[i][i]) < 1e-10) return null;

    // Eliminate
    for (let k = i + 1; k < n; k++) {
      const factor = Mat[k][i] / Mat[i][i];
      Mat[k][i] = 0; // consistent zeroing
      for (let j = i + 1; j < n; j++) {
        Mat[k][j] -= factor * Mat[i][j];
      }
      for (let j = 0; j < Rhs[0].length; j++) {
        Rhs[k][j] -= factor * Rhs[i][j];
      }
    }
  }

  // Back substitution
  const result: number[][] = Array(n).fill(0).map(() => Array(Rhs[0].length).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = 0; j < Rhs[0].length; j++) {
      let sum = 0;
      for (let k = i + 1; k < n; k++) {
        sum += Mat[i][k] * result[k][j];
      }
      result[i][j] = (Rhs[i][j] - sum) / Mat[i][i];
    }
  }

  return result;
};

// Matrix Transpose
export const transpose = (M: number[][]): number[][] => {
  const rows = M.length;
  const cols = M[0].length;
  const T: number[][] = Array(cols).fill(0).map(() => Array(rows).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      T[j][i] = M[i][j];
    }
  }
  return T;
};

// Matrix Multiplication A (m x n) * B (n x p) -> C (m x p)
export const multiply = (A: number[][], B: number[][]): number[][] => {
  const m = A.length;
  const n = A[0].length;
  const p = B[0].length;
  const C: number[][] = Array(m).fill(0).map(() => Array(p).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < p; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += A[i][k] * B[k][j];
      }
      C[i][j] = sum;
    }
  }
  return C;
};

// Binomial Coefficient
export const combinations = (n: number, k: number): number => {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n / 2) k = n - k;
  let res = 1;
  for (let i = 1; i <= k; i++) {
    res = res * (n - i + 1) / i;
  }
  return res;
};

// Bernstein Basis Function B_i^n(t)
export const bernstein = (n: number, i: number, t: number): number => {
  return combinations(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
};
