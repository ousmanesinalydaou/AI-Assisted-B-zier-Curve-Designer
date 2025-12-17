# Technology Stack

This document outlines the libraries, frameworks, and tools used to build the **CurveStack Surface Generator**, along with the rationale for their selection and their specific role in the codebase.

## Core Framework
### React 18
-   **Why**: React provides a robust component-based architecture state management. Its declarative nature is ideal for handling the complex state flow between the 2D drawing inputs, mathematical parameters, and the 3D visualization.
-   **Where**: Used throughout the application structure.
    -   `index.tsx`: Entry point.
    -   `App.tsx`: Main layout and global state container.
    -   `components/`: Modular UI elements.

### TypeScript
-   **Why**: Strong typing is critical for a geometric application. Defining strict interfaces for mathematical structures (like `Point3D`, `SurfaceData`, and `Matrix`) prevents runtime errors during complex linear algebra operations.
-   **Where**: All source files (`.ts`, `.tsx`). Interface definitions are centralized in `types.ts`.

## Graphics & Visualization
### Three.js (r160)
-   **Why**: The industry standard for WebGL. It abstracts the complexities of the WebGL API (shaders, buffers, context management) while providing a scene graph, camera systems, and efficient mesh generation capabilities required for rendering the composite surface.
-   **Where**: 
    -   `components/Viewer3D.tsx`: Manages the 3D scene, lighting, camera controls, and updates the mesh geometry based on mathematical output.
    -   `index.html`: Imported via import map.

### HTML5 Canvas API
-   **Why**: Used for the 2D drawing interface because it offers high-performance rasterization for capturing mouse movements and rendering real-time 2D plots without the overhead of DOM elements.
-   **Where**: `components/DrawingCanvas.tsx`.

## Styling & UX
### Tailwind CSS
-   **Why**: Enables rapid UI development with a utility-first approach. It vastly simplifies responsiveness (Grid/Flex layouts) and theming (Dark/Light mode) without writing custom CSS files.
-   **Where**: 
    -   `index.html`: Configured via CDN script.
    -   `components/*.tsx`: All styling is applied via utility classes (e.g., `bg-neutral-900`, `p-4`, `flex`).

### Framer Motion
-   **Why**: Provides production-grade animations for React. It handles the complex layout morphing required when toggling the sidebar, ensuring smooth transitions between states (layout shifts) that CSS transitions struggle to handle elegantly.
-   **Where**:
    -   `App.tsx`: Animating the sidebar width (`motion.aside`).
    -   `components/Controls.tsx`: Animate entry of control panels.

## Mathematics
### Custom Linear Algebra Implementation
-   **Why**: To keep the project lightweight and educational, no external math library (like math.js or gl-matrix) was used for the core solver. Implementing Gaussian Elimination and B-Spline basis functions from scratch demonstrates the underlying algorithms of Computer Aided Geometric Design (CAGD).
-   **Where**:
    -   `services/mathUtils.ts`: Matrix operations, Linear System Solver, B-Spline basis functions.
    -   `services/surfaceEngine.ts`: Tensor product surface generation logic.

## Build & Runtime
### ES Modules (Import Maps)
-   **Why**: Allows the application to run directly in modern browsers without a heavy bundler configuration (like Webpack) for the dependencies, making the project easier to inspect and modify locally.
-   **Where**: `index.html` (inside the `<script type="importmap">` tag).
