# Developer Guide

## Development Environment Setup

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 8.x or higher  
- **Git**: Latest version
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+
- **WebGL Support**: WebGL 2.0 capable graphics card/drivers

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd bezier-curve-designer

# Install dependencies
npm install

# Start development server
npm run dev

# The application will be available at http://localhost:5173
```

### Verify Installation

Run the test suite to ensure everything is working:

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
bezier-curve-designer/
├── src/                          # Source code
│   ├── algorithms/               # Mathematical algorithms
│   │   ├── curveFitting.ts      # Core curve fitting logic
│   │   └── curvatureAnalysis.ts # Curvature computation
│   ├── components/              # React components
│   │   ├── WebGLCanvas.tsx      # Main drawing canvas
│   │   ├── Toolbar.tsx          # Tool controls
│   │   ├── PropertyPanel.tsx    # Curve properties
│   │   └── modals/              # Modal dialogs
│   ├── store/                   # State management
│   │   └── useAppStore.ts       # Zustand store
│   ├── types/                   # TypeScript definitions
│   │   └── index.ts             # Shared type definitions
│   ├── utils/                   # Utility functions
│   │   └── helpers.ts           # Helper functions
│   └── App.tsx                  # Main application
├── docs/                        # Documentation
├── tests/                       # Test files
├── public/                      # Static assets
└── package.json                 # Dependencies and scripts
```

## Development Workflow

### Code Style and Standards

We use automated tools to maintain consistent code quality:

```bash
# Format code with Prettier
npm run format

# Lint code with ESLint
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Type checking
npm run typecheck
```

### Git Workflow

We follow a feature branch workflow:

```bash
# Create feature branch
git checkout -b feature/curve-smoothing-algorithm

# Make changes and commit
git add .
git commit -m "feat: implement curvature-based curve smoothing"

# Push and create pull request
git push origin feature/curve-smoothing-algorithm
```

### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add new curve fitting algorithm
fix: resolve control point dragging issue  
docs: update algorithm documentation
test: add curve fitting unit tests
refactor: optimize WebGL rendering pipeline
perf: improve tessellation performance
style: fix code formatting
```

## Testing Strategy

### Unit Testing

Test individual functions and components in isolation:

```typescript
// tests/algorithms/curveFitting.test.ts
import { CurveFitter } from '../../src/algorithms/curveFitting';

describe('CurveFitter', () => {
  it('should fit a simple line correctly', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 20 }
    ];
    
    const fitter = new CurveFitter({
      parameterization: 'centripetal',
      maxIterations: 20,
      tolerance: 0.001,
      regularization: 1e-6
    });
    
    const result = fitter.fitCurve(points);
    
    expect(result.rmse).toBeLessThan(0.1);
    expect(result.curve.p0).toEqual(points[0]);
    expect(result.curve.p3).toEqual(points[2]);
  });
});
```

### Integration Testing

Test component interactions and data flow:

```typescript
// tests/integration/canvas-interaction.test.ts
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../src/App';

describe('Canvas Interaction', () => {
  it('should create curve when drawing stroke', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const canvas = screen.getByRole('img', { name: /canvas/i });
    
    // Simulate drawing a stroke
    await user.pointer([
      { keys: '[MouseLeft>]', target: canvas, coords: { x: 10, y: 10 } },
      { target: canvas, coords: { x: 50, y: 30 } },
      { target: canvas, coords: { x: 90, y: 10 } },
      { keys: '[/MouseLeft]', target: canvas }
    ]);
    
    // Verify curve was created
    expect(screen.getByText(/curve fitted/i)).toBeInTheDocument();
  });
});
```

### End-to-End Testing

Test complete user workflows:

```typescript
// tests/e2e/curve-creation.spec.ts
import { test, expect } from '@playwright/test';

test('complete curve creation and export workflow', async ({ page }) => {
  await page.goto('/');
  
  // Draw a curve
  const canvas = page.locator('canvas');
  await canvas.click({ position: { x: 100, y: 100 } });
  await page.mouse.move(200, 150);
  await page.mouse.move(300, 100);
  await canvas.click({ position: { x: 300, y: 100 } });
  
  // Verify curve appears
  await expect(page.locator('.curve-info')).toBeVisible();
  
  // Export as SVG
  await page.click('button:has-text("Export")');
  await page.click('input[value="svg"]');
  await page.click('button:has-text("Export")');
  
  // Verify download
  const downloadPromise = page.waitForEvent('download');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.svg$/);
});
```

## Component Development

### Creating New Components

1. **Component Structure**:
```typescript
import React from 'react';
import { useAppStore } from '../store/useAppStore';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  onAction 
}) => {
  const { theme } = useAppStore();
  
  return (
    <div className={`component-wrapper ${theme}`}>
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

2. **Add to Storybook** (if using):
```typescript
// stories/MyComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from '../src/components/MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Default Title',
  },
};
```

### Algorithm Development

1. **Mathematical Functions**:
```typescript
// src/algorithms/newAlgorithm.ts

/**
 * Implements [Algorithm Name] following [Reference Paper]
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 * 
 * @param input - Description of input
 * @returns Description of output
 */
export function algorithmFunction(input: InputType): OutputType {
  // Validation
  if (!validateInput(input)) {
    throw new Error('Invalid input parameters');
  }
  
  // Implementation
  const result = performCalculation(input);
  
  // Post-processing
  return processResult(result);
}

// Helper functions (private)
function validateInput(input: InputType): boolean {
  // Implementation
}

function performCalculation(input: InputType): IntermediateType {
  // Implementation
}

function processResult(result: IntermediateType): OutputType {
  // Implementation
}
```

2. **Add Comprehensive Tests**:
```typescript
// tests/algorithms/newAlgorithm.test.ts
import { algorithmFunction } from '../../src/algorithms/newAlgorithm';

describe('New Algorithm', () => {
  describe('edge cases', () => {
    it('should handle empty input', () => {
      expect(() => algorithmFunction([])).toThrow();
    });
    
    it('should handle single point', () => {
      const result = algorithmFunction([{ x: 0, y: 0 }]);
      expect(result).toBeDefined();
    });
  });
  
  describe('mathematical correctness', () => {
    it('should satisfy mathematical properties', () => {
      const input = generateTestCase();
      const result = algorithmFunction(input);
      
      // Verify mathematical invariants
      expect(verifyMathematicalProperty(result)).toBe(true);
    });
  });
  
  describe('performance', () => {
    it('should complete within time bounds', () => {
      const largeInput = generateLargeTestCase(10000);
      const startTime = performance.now();
      
      algorithmFunction(largeInput);
      
      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(100); // 100ms limit
    });
  });
});
```

## State Management

### Zustand Store Patterns

```typescript
// Adding new state slice
interface NewFeatureState {
  featureEnabled: boolean;
  featureOptions: FeatureOptions;
}

interface NewFeatureActions {
  enableFeature: () => void;
  disableFeature: () => void;
  updateFeatureOptions: (options: Partial<FeatureOptions>) => void;
}

// Add to main store
export const useAppStore = create<AppState & AppActions & NewFeatureState & NewFeatureActions>((set, get) => ({
  // ... existing state
  
  // New feature state
  featureEnabled: false,
  featureOptions: defaultFeatureOptions,
  
  // New feature actions
  enableFeature: () => set({ featureEnabled: true }),
  disableFeature: () => set({ featureEnabled: false }),
  updateFeatureOptions: (options) => set((state) => ({
    featureOptions: { ...state.featureOptions, ...options }
  })),
}));
```

## WebGL Development

### Adding New Rendering Features

1. **Extend WebGL Canvas Component**:
```typescript
// Add new rendering method
private renderNewFeature(data: FeatureData): void {
  if (!this.scene || !data.isVisible) return;
  
  const geometry = this.createFeatureGeometry(data);
  const material = this.createFeatureMaterial(data);
  const mesh = new THREE.Mesh(geometry, material);
  
  this.scene.add(mesh);
}

private createFeatureGeometry(data: FeatureData): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  // Implementation
  return geometry;
}
```

2. **Add Performance Monitoring**:
```typescript
// Add to render loop
private renderWithProfiling(): void {
  const startTime = performance.now();
  
  this.renderScene();
  
  const elapsed = performance.now() - startTime;
  if (elapsed > 16.67) { // > 60 FPS
    console.warn(`Slow frame: ${elapsed.toFixed(2)}ms`);
  }
}
```

## Performance Optimization

### Measuring Performance

```typescript
// Custom performance hooks
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>();
  
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      // Process performance entries
      setMetrics(processEntries(entries));
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation'] });
    
    return () => observer.disconnect();
  }, []);
  
  return metrics;
};
```

### Optimization Strategies

1. **React Optimizations**:
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return performExpensiveCalculation(data);
}, [data]);

// Memoize components
const MemoizedComponent = memo(Component, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data;
});

// Use callback optimization
const handleClick = useCallback((id: string) => {
  updateItem(id);
}, [updateItem]);
```

2. **Algorithm Optimizations**:
```typescript
// Use object pools for frequent allocations
class PointPool {
  private pool: Point2D[] = [];
  
  acquire(): Point2D {
    return this.pool.pop() || { x: 0, y: 0 };
  }
  
  release(point: Point2D): void {
    this.pool.push(point);
  }
}

// Batch operations
const batchUpdate = (operations: Operation[]) => {
  const batches = operations.reduce((acc, op) => {
    const key = op.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(op);
    return acc;
  }, {} as Record<string, Operation[]>);
  
  Object.entries(batches).forEach(([type, ops]) => {
    processBatch(type, ops);
  });
};
```

## Build and Deployment

### Development Build

```bash
# Start development server with hot reload
npm run dev

# Build for development (with source maps)
npm run build:dev

# Analyze bundle size
npm run analyze
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Run production build tests
npm run test:prod
```

### Environment Configuration

```typescript
// src/config/environment.ts
export const config = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  apiUrl: process.env.VITE_API_URL || 'http://localhost:3000',
  enableLogging: process.env.VITE_ENABLE_LOGGING === 'true',
  maxCurves: parseInt(process.env.VITE_MAX_CURVES || '1000'),
};
```

### Docker Development

```bash
# Build development container
docker build -t bezier-dev -f Dockerfile.dev .

# Run development container
docker run -p 5173:5173 -v $(pwd):/app bezier-dev

# Build production container
docker build -t bezier-prod .

# Run production container
docker run -p 3000:3000 bezier-prod
```

## Troubleshooting

### Common Issues

1. **WebGL Context Lost**:
```typescript
// Handle context restoration
canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  // Stop animation loops
  // Show user notification
});

canvas.addEventListener('webglcontextrestored', () => {
  // Reinitialize WebGL resources
  // Resume animation loops
});
```

2. **Performance Issues**:
```bash
# Profile bundle size
npm run analyze

# Check for memory leaks
npm run test:memory

# Monitor performance
npm run profile
```

3. **TypeScript Errors**:
```bash
# Check types without building
npm run typecheck

# Generate type definitions
npm run types:generate
```

### Debug Mode

Enable debug mode for development:

```typescript
// Enable debug logging
if (process.env.NODE_ENV === 'development') {
  window.enableDebugMode = () => {
    localStorage.setItem('debug', 'true');
    location.reload();
  };
}

// Usage in components
const isDebugMode = localStorage.getItem('debug') === 'true';
if (isDebugMode) {
  console.log('Debug info:', debugData);
}
```

## Contributing Guidelines

### Pull Request Process

1. **Create Feature Branch**: `git checkout -b feature/description`
2. **Implement Changes**: Follow coding standards and add tests
3. **Run Tests**: `npm test` must pass
4. **Update Documentation**: Update relevant docs
5. **Create PR**: Use the provided PR template
6. **Code Review**: Address reviewer feedback
7. **Merge**: Squash and merge when approved

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Performance impact is acceptable
- [ ] No security vulnerabilities introduced
- [ ] Accessibility requirements met
- [ ] Browser compatibility maintained

This developer guide provides the foundation for contributing to and extending the Bézier Curve Designer project. For specific implementation questions, refer to the other documentation files or reach out to the development team.