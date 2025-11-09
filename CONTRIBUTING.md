# Contributing to AI-Assisted Bézier Curve Designer

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards others

### Enforcement

Instances of unacceptable behavior may be reported to the project maintainers. All complaints will be reviewed and investigated promptly and fairly.

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.11+
- Docker and Docker Compose
- Git
- Code editor (VS Code recommended)

### First-Time Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/ousmanesinalydaou/AI-Assisted-B-zier-Curve-Designer.git
   cd AI-Assisted-B-zier-Curve-Designer
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

4. **Start development environment**
   ```bash
   docker-compose up --build
   ```

---

## Development Setup

### Frontend Development

```bash
# Run development server
npm run dev

# Run linter
npm run lint

# Format code
npm run format

# Type check
npm run typecheck

# Run tests
npm test
```

### Backend Development

```bash
cd backend

# Run development server
python main.py

# Run tests
pytest

# Run linter
black . && flake8

# Type check
mypy .
```

### Running Full Stack

```bash
docker-compose up --build
```

Access:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/ousmanesinalydaou/AI-Assisted-B-zier-Curve-Designer/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, versions)

### Suggesting Features

1. Check [Issues](https://github.com/ousmanesinalydaou/AI-Assisted-B-zier-Curve-Designer/issues) for existing suggestions
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach
   - Any mockups or examples

### Code Contributions

1. **Pick an issue** or create one
2. **Comment** on the issue to let others know you're working on it
3. **Fork and branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```
4. **Make changes** following coding standards
5. **Test thoroughly**
6. **Commit** with clear messages
7. **Push** to your fork
8. **Create Pull Request**

---

## Coding Standards

### TypeScript/JavaScript (Frontend)

```typescript
// Use TypeScript strict mode
// Prefer const over let
// Use meaningful variable names
// Add JSDoc comments for public functions

/**
 * Calculate distance between two points
 */
function calculateDistance(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}
```

**Style Guide**:
- Use ESLint and Prettier (configured in project)
- 2 spaces for indentation
- Single quotes for strings
- Trailing commas in multi-line
- No semicolons (follows project style)

### Python (Backend)

```python
# Follow PEP 8
# Use type hints
# Add docstrings for all public functions/classes

def fit_cubic_bezier(
    points: List[Point2D], 
    options: FittingOptions
) -> CubicBezierCurve:
    """
    Fit cubic Bézier curve to points.
    
    Args:
        points: Input data points
        options: Fitting configuration
        
    Returns:
        Fitted cubic Bézier curve
    """
    pass
```

**Style Guide**:
- Use Black formatter
- 4 spaces for indentation
- Type hints for all function signatures
- Docstrings in Google style

### Git Workflow

1. Keep commits focused and atomic
2. Write descriptive commit messages
3. Rebase on main before submitting PR
4. Squash commits if necessary

---

## Testing Guidelines

### Unit Tests

```typescript
// Frontend (Vitest)
describe('CurveFitting', () => {
  it('should fit straight line correctly', () => {
    const points = generateStraightLine(0, 0, 10, 10);
    const curve = fitCurve(points);
    expect(curve.rmse).toBeLessThan(0.1);
  });
});
```

```python
# Backend (pytest)
def test_fit_curve():
    """Test curve fitting with simple data"""
    points = [Point2D(x=float(i), y=float(i)) for i in range(10)]
    service = CurveFittingService(options)
    curve, rmse, _, _ = service.fit_curve(points)
    assert rmse < 0.1
```

### Integration Tests

```python
def test_api_fit_curve(client):
    """Test /api/curves/fit-curve endpoint"""
    response = client.post("/api/curves/fit-curve", json=request_data)
    assert response.status_code == 200
    assert "segments" in response.json()
```

### Test Coverage

- Aim for >80% code coverage
- Test edge cases and error conditions
- Run tests before submitting PR

```bash
# Frontend
npm run test:coverage

# Backend
pytest --cov=app tests/
```

---

## Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:

```
feat(api): add curvature analysis endpoint

Implements /api/curves/curvature-analysis endpoint that
computes κ(t) along a Bézier curve.

Closes #42
```

```
fix(frontend): resolve control point dragging issue

Control points were not updating correctly on touch devices.
Added touch event handlers and normalized coordinates.

Fixes #38
```

---

## Pull Request Process

### Before Submitting

1. ✅ Code follows style guidelines
2. ✅ All tests pass
3. ✅ New tests added for new features
4. ✅ Documentation updated
5. ✅ Commit messages follow conventions
6. ✅ No merge conflicts with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated checks**: CI must pass (linting, tests)
2. **Code review**: At least one approval required
3. **Discussion**: Address review comments
4. **Merge**: Maintainer will merge when approved

---

## Development Tips

### WebGL Debugging

```javascript
// Enable WebGL debugging
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl2', { 
  antialias: true,
  alpha: false 
});

// Check WebGL errors
function checkGLError(gl, operation) {
  const error = gl.getError();
  if (error !== gl.NO_ERROR) {
    console.error(`WebGL error after ${operation}: ${error}`);
  }
}
```

### Backend Debugging

```python
# Use Python debugger
import pdb; pdb.set_trace()

# Or logging
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
logger.debug(f"Processing {len(points)} points")
```

### Performance Profiling

```bash
# Frontend
npm run build --analyze

# Backend
python -m cProfile -o output.prof main.py
```

---

## Documentation

### Writing Documentation

- Use Markdown format
- Include code examples
- Add diagrams when helpful
- Keep it up-to-date

### Documentation Structure

```
docs/
├── README.md           # Overview
├── architecture.md     # System design
├── algorithms.md       # Mathematical details
├── api_reference.md    # API documentation
├── developer_guide.md  # Setup and development
└── user_guide.md       # User-facing features
```

---

## Getting Help

- **Discord**: [Join our community](https://discord.gg/...)
- **GitHub Discussions**: [Ask questions](https://github.com/ousmanesinalydaou/AI-Assisted-B-zier-Curve-Designer/discussions)
- **Email**: maintainers@example.com

---

## Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes
- About page in the application

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
