# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-11-08

### Enhanced
- **Improved Control Point Editing**
  - Increased hit area to 30 pixels for easier control point selection
  - Enhanced visual feedback with color-coded control points
  - Endpoints (P₀, P₃) displayed in green, control points (P₁, P₂) in blue
  - Selected control points turn red and enlarge to 1.5× size
  - Control polygon now visible when curve is selected
  - White outlines added to all control points for better visibility
  
### Changed
- Simplified curve fitting to single Bézier per stroke (removed multi-segment)
- Control point selection persists during dragging (doesn't deselect on pointer up)

### Added
- Keyboard shortcut: Press `Escape` to deselect control points or curves
- Visual control polygon (dashed line) connecting all four control points

### Fixed
- Removed complex multi-segment curve fitting that was creating excessive segments
- Improved curve stability and predictability

## [1.0.0] - 2025-11-07

### Added
- Initial release of AI-Assisted Bézier Curve Designer
- WebGL-based canvas rendering using Three.js
- Interactive cubic Bézier curve fitting with iterative least-squares
- Newton-Raphson reparameterization for improved accuracy
- Three parameterization methods: uniform, chord-length, centripetal
- Curve smoothing with C¹ (tangent) and C² (curvature) continuity
- Real-time curvature analysis and visualization
- ML-based control point prediction for optimization warm-start
- Draggable control point handles with live curve updates
- Export to SVG, JSON, and PNG formats
- Project persistence with MongoDB
- RESTful API with FastAPI backend
- Comprehensive API documentation with Swagger UI
- Unit tests and integration tests
- Docker Compose deployment configuration
- Light and dark theme support
- Responsive design for desktop and tablet
- Tutorial modal for new users
- Undo/redo functionality
- Keyboard shortcuts
- Accessibility features

### Backend
- FastAPI REST API with OpenAPI documentation
- MongoDB integration with Beanie ODM
- Curve fitting service with Schneider algorithm
- Curve smoothing service with continuity analysis
- ML prediction service with PyTorch
- Project CRUD endpoints
- Health check endpoint
- CORS configuration for cross-origin requests

### Frontend
- React 18 with TypeScript
- Three.js WebGL rendering
- Zustand state management
- TailwindCSS styling
- Lucide React icons
- API client for backend communication
- Real-time performance monitoring

### Documentation
- README with quick start guide
- Architecture documentation
- Algorithm documentation with mathematical derivations
- WebGL implementation guide
- API reference with examples
- ML model documentation
- Developer guide with setup instructions
- User guide with feature explanations
- Contributing guidelines

### Development
- Vite build system
- ESLint and Prettier configuration
- TypeScript strict mode
- Hot module replacement
- Development Docker container
- Production Docker container with nginx

## [Unreleased]

### Planned Features
- GPU-accelerated curve evaluation in shaders
- Advanced picking with GPU color-buffer method
- Adaptive tessellation with flatness criterion
- Multi-segment auto-splitting for complex curves
- Real-time residual error visualization
- Curvature heatmap overlay
- User authentication and authorization
- Cloud storage integration
- Collaborative editing features
- Curve library with presets
- Animation timeline for curve morphing
- Path interpolation between curves
- Bezier surface generation (3D extension)
- Performance optimizations for mobile devices
- Progressive Web App (PWA) support
- Offline mode with local storage
- Export to more formats (PDF, DXF, AI)
- Import SVG paths
- Batch processing API
- WebAssembly acceleration
- Advanced ML features (style transfer, multi-segment)

### Known Issues
- ML model not included in repository (needs to be trained)
- Limited mobile touch support (optimized for desktop)
- No WebGL fallback to Canvas 2D
- MongoDB required for persistence (no alternative backend)

---

## Version History

### Pre-release Versions

#### [0.3.0] - 2025-11-06
- Added ML model training infrastructure
- Implemented project persistence
- Added comprehensive testing suite

#### [0.2.0] - 2025-11-05
- Implemented backend API
- Added curve smoothing algorithms
- Created API documentation

#### [0.1.0] - 2025-11-04
- Initial WebGL canvas implementation
- Basic curve fitting algorithm
- Frontend UI components

---

## Migration Guide

### From 0.x to 1.0.0

No migration needed - this is the first stable release.

---

## Breaking Changes

None yet - first stable release.

---

## Credits

### Algorithms
- Schneider, P. J. (1990). "An Algorithm for Automatically Fitting Digitized Curves"
- Farin, G. (2002). "Curves and Surfaces for CAGD"

### Libraries
- Three.js - WebGL rendering
- FastAPI - Backend framework
- PyTorch - Machine learning
- React - Frontend framework
- MongoDB - Database

---

## License

MIT License - See LICENSE file for details
