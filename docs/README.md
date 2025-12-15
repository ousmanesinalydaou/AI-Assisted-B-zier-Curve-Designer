# AI-Assisted Bézier Curve Designer

[![WebGL](https://img.shields.io/badge/WebGL-2.0-blue.svg)](https://www.khronos.org/webgl/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-green.svg)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-ready web application for interactive Bézier curve design with advanced mathematical curve fitting, real-time WebGL rendering, and AI-powered curvature analysis.

## 🎯 Features

### Core Functionality
- **High-Performance WebGL Rendering**: Smooth, antialiased curve rendering with 60 FPS performance
- **Advanced Curve Fitting**: Iterative least-squares with Newton-Raphson reparameterization
- **Real-Time Interaction**: Drag control points with immediate visual feedback
- **Curvature Analysis**: C¹/C² continuity detection with smoothing suggestions
- **Multi-Format Export**: SVG, JSON, and PNG export capabilities

### 🌟 NEW: 3D Surface Generation
- **Surface of Revolution**: Rotate curves around X/Y/Z axes to create vases, bottles, and columns
- **Bézier Patches**: Bicubic surface patches from 4×4 control point grids
- **Lofted Surfaces**: Smooth interpolation between multiple cross-section curves
- **Tube/Pipe Generation**: Circular extrusion along curve paths with adjustable radius
- **Extrusion Along Path**: Sweep profile curves along path curves
- **Interactive 3D Viewer**: Real-time camera controls, wireframe mode, auto-rotate, and PNG export

### Mathematical Algorithms
- Centripetal parameterization (Farin method)
- Newton-Raphson optimization for minimal fitting error
- Adaptive tessellation for WebGL rendering
- Curvature computation with tangent analysis
- Douglas-Peucker simplification for stroke preprocessing
- **Tensor product Bézier surfaces** ✨
- **Surface of revolution algorithms** ✨
- **Mesh generation and triangulation** ✨

### User Experience
- Touch and mouse support with responsive design
- Dark/light theme with accessibility features
- Interactive tutorial with mathematical explanations
- Real-time error visualization and performance monitoring
- Professional-grade UI with subtle animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern browser with WebGL 2.0 support
- Optional: Docker for containerized deployment

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd bezier-curve-designer

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📖 Documentation

### Core Documentation
- **[Architecture Guide](./architecture.md)** - System design and component overview
- **[WebGL Implementation](./webgl_guide.md)** - Rendering pipeline and shader details
- **[Algorithm Documentation](./algorithms.md)** - Mathematical foundations and pseudocode
- **[Developer Guide](./developer_guide.md)** - Setup, build process, and contributing
- **[User Guide](./user_guide.md)** - How to use the application effectively

### 🌟 NEW: 3D Features
- **[3D Features Guide](./3d_features_guide.md)** - Complete guide to 3D surface generation
- **[3D Quick Reference](./3D_QUICK_REFERENCE.md)** - Quick reference for 3D features
- **[3D Features Summary](./3D_FEATURES_SUMMARY.md)** - Implementation overview and details

### Learning Materials
- **[Mathematical Concepts Lesson](./mathematical_concepts_lesson.md)** - Comprehensive mathematical tutorial
- **[Presentation Script & Q&A](./presentation_script_and_qa.md)** - Presentation materials

## 🏗️ Architecture

The application follows a modular, production-ready architecture:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React UI      │    │   Zustand Store  │    │   WebGL Engine  │
│   Components    │◄──►│   State Mgmt     │◄──►│   Three.js      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Curve Fitting │    │   Data Pipeline  │    │   Export System │
│   Algorithms    │    │   Processing     │    │   SVG/JSON/PNG  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Key Components

- **WebGLCanvas**: High-performance rendering with Three.js
- **CurveFitter**: Advanced mathematical curve fitting algorithms
- **Toolbar**: Interactive controls and view options
- **PropertyPanel**: Real-time curve analysis and parameter adjustment

## 🔬 Algorithm Details

### Curve Fitting Process

1. **Stroke Capture**: High-frequency sampling with timestamp data
2. **Preprocessing**: 
   - Arc-length resampling for uniform point distribution
   - Savitzky-Golay smoothing for noise reduction
   - Douglas-Peucker simplification for optimization
3. **Parameterization**: Centripetal method for robust fitting
4. **Iterative Optimization**: Newton-Raphson reparameterization
5. **Error Analysis**: RMSE calculation and residual visualization

### WebGL Rendering Pipeline

1. **Adaptive Tessellation**: CPU-based curve subdivision
2. **Buffer Management**: Efficient vertex buffer updates
3. **GPU Rendering**: Antialiased line rendering with thickness
4. **Interactive Picking**: GPU-based control point selection

## 📊 Performance Characteristics

- **Fitting Accuracy**: Sub-pixel RMSE for typical hand-drawn curves
- **Rendering Performance**: 60 FPS at 1080p with 50+ simultaneous curves
- **Memory Usage**: <100MB for complex projects with 1000+ control points
- **Startup Time**: <2 seconds on modern hardware

## 🛠️ Development

### Code Structure

```
src/
├── algorithms/          # Mathematical curve fitting
├── components/          # React UI components
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── utils/              # Helper functions
└── App.tsx             # Main application component
```

### Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

### Build and Deploy

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Deploy to hosting platform
npm run deploy
```

## 📝 API Usage

For programmatic curve fitting:

```javascript
import { CurveFitter } from './algorithms/curveFitting';

const fitter = new CurveFitter({
  parameterization: 'centripetal',
  maxIterations: 20,
  tolerance: 0.001,
  regularization: 1e-6
});

const result = fitter.fitCurve(strokePoints);
console.log(`RMSE: ${result.rmse}, Iterations: ${result.iterations}`);
```

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Code style and conventions
- Testing requirements
- Pull request process
- Development workflow

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎓 Academic References

- Schneider, P. (1990). "An Algorithm for Automatically Fitting Digitized Curves"
- Farin, G. (2002). "Curves and Surfaces for CAGD: A Practical Guide"
- Piegl, L. & Tiller, W. (1997). "The NURBS Book"

## 🔗 Related Projects

- [paperjs/paper.js](https://github.com/paperjs/paper.js) - Vector graphics scripting
- [d3/d3-shape](https://github.com/d3/d3-shape) - Path generation utilities
- [mattdesl/adaptive-bezier-curve](https://github.com/mattdesl/adaptive-bezier-curve) - Adaptive tessellation

---

*Built with ❤️ using React, TypeScript, Three.js, and advanced computational geometry*