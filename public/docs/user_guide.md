# User Guide

## Getting Started

The AI-Assisted Bézier Curve Designer is an advanced web application for creating, editing, and analyzing smooth curves. This guide will help you master all features and workflows.

## Interface Overview

### Main Components

```
┌─────────────────────────────────────────────────────────────────┐
│  [☀️] [👁️] [📊] [⚏] [⬜] [💾] [📂]     Toolbar (Left)           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Drawing Canvas                               │
│              (WebGL-accelerated)                               │
│                                                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│              [?] Tutorial  [↗] Export                          │
│                   Bottom Actions                                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │
┌───────────────────────────────┘
│  Property Panel (Right)
│  ┌─────────────────────────┐
│  │ Curve Properties    [×] │
│  │ ─────────────────────── │
│  │ Original Points: 45     │
│  │ Fitted Curves: 1        │
│  │ P0: (100, 150)          │
│  │ P1: (120, 100)          │
│  │ P2: (180, 100)          │
│  │ P3: (200, 150)          │
│  │                         │
│  │ Fitting Parameters      │
│  │ ─────────────────────── │
│  │ Parameterization: ▼     │
│  │ Max Iterations: ━━━━○   │
│  │ Tolerance: ━━━○────     │
│  │                         │
│  │ [Smooth Curvature (C²)] │
│  │ [Align Tangents (C¹)]   │
│  │ [Re-fit Curve]          │
│  └─────────────────────────┘
```

## Basic Workflow

### 1. Drawing Your First Curve

1. **Start Drawing**: Click and drag on the canvas to create a freehand stroke
2. **Complete the Stroke**: Release the mouse/finger to finish drawing
3. **Automatic Fitting**: The application automatically fits a cubic Bézier curve
4. **View Results**: The fitted curve appears in blue/green (depending on theme)

**Tips for Better Results**:
- Draw smoothly and consistently
- Avoid sharp corners or sudden direction changes
- Maintain steady drawing speed
- Use the full canvas space for better precision

### 2. Understanding the Curve Fitting Process

The application uses advanced mathematical algorithms to convert your freehand drawing into a precise Bézier curve:

1. **Point Capture**: Records your stroke with high precision (up to 120 Hz)
2. **Preprocessing**: Cleans and optimizes the captured points
3. **Parameterization**: Uses centripetal method for optimal distribution
4. **Iterative Fitting**: Applies Newton-Raphson optimization for minimal error
5. **Quality Analysis**: Calculates error metrics and convergence

### 3. Editing Control Points

Once a curve is fitted, you can fine-tune it by manipulating control points:

**Control Point Types**:
- **P₀ (Green)**: Start point of the curve - moves the beginning endpoint
- **P₁ (Blue)**: First control point - controls departure angle and curvature from P₀
- **P₂ (Blue)**: Second control point - controls arrival angle and curvature to P₃  
- **P₃ (Green)**: End point of the curve - moves the ending endpoint

**How to Edit Control Points**:
1. **Enable Select Mode**: Press `V` or click the select tool in the toolbar
2. **Select a Curve**: Click on any drawn curve (it will turn orange/red)
3. **View Control Points**: Four control points appear automatically (2 green, 2 blue)
4. **Select a Control Point**: Click on any control point (30-pixel hit area for easy selection)
5. **Drag to Modify**: Click and drag the selected control point to reshape the curve
6. **Real-time Update**: The curve updates instantly as you drag
7. **Deselect**: Press `Escape` or click elsewhere on the canvas

**Visual Feedback**:
- **Unselected control points**: Normal size with white outline
- **Selected control point**: 1.5× larger size, turns red
- **Control polygon**: Dashed gray line connecting all four points shows curve structure
- **Curve highlight**: Selected curve appears in orange/red color

**Control Point Effects on Curve Shape**:
- **Moving P₀ (green)**: Translates the curve's starting position
- **Moving P₁ (blue)**: Changes how sharply the curve departs from P₀
  - Move away from P₀ for gentler curves
  - Move closer to P₀ for tighter curves
- **Moving P₂ (blue)**: Changes how the curve approaches P₃
  - Move away from P₃ for gentler arrival
  - Move closer to P₃ for sharper arrival
- **Moving P₃ (green)**: Translates the curve's ending position

**Tips for Effective Editing**:
- Adjust P₁ and P₂ to control curve tension and smoothness
- Keep control points roughly aligned for C¹ continuity
- Use equal distances from endpoints for symmetric curves
- Longer control arms create more pronounced curves

## Advanced Features

### Curvature Analysis

Enable curvature visualization to understand your curve's mathematical properties:

1. Click the **Activity (📊)** button in the toolbar
2. A curvature heatmap overlays your curve:
   - **Red areas**: High curvature (tight bends)
   - **Green areas**: Low curvature (gentle bends)
   - **Blue areas**: Very low curvature (nearly straight)

**Curvature Information**:
- Measured in inverse radius units (1/pixel)
- Higher values indicate tighter curves
- Zero curvature means perfectly straight
- Useful for identifying smoothness issues

### Continuity Analysis and Smoothing

The application can analyze and improve curve continuity:

#### C¹ Continuity (Tangent Continuity)
- Ensures smooth tangent transitions between curve segments
- Click **"Align Tangents (C¹)"** to automatically align
- Visual indicators show tangent discontinuities

#### C² Continuity (Curvature Continuity)  
- Ensures smooth curvature transitions
- Click **"Smooth Curvature (C²)"** for optimal smoothness
- Higher-order smoothness for professional results

### Parameter Adjustment

Fine-tune the fitting algorithm through the Property Panel:

#### Parameterization Methods
- **Uniform**: Evenly spaced parameters (simple, less accurate)
- **Chord-Length**: Distance-based spacing (good general purpose)
- **Centripetal**: Square-root distance spacing (best for hand-drawn curves) ⭐

#### Iteration Control
- **Max Iterations**: More iterations = better accuracy (3-50 range)
- **Tolerance**: Convergence threshold (0.0001-0.01 range)
- Higher values = faster computation, lower accuracy

#### Advanced Options
- **Regularization**: Prevents numerical instability
- **Error Visualization**: Shows fitting residuals
- **Segmentation**: Automatic curve splitting for complex shapes

## Tools and Controls

### Toolbar Reference

| Icon | Tool | Function | Shortcut |
|------|------|----------|----------|
| ☀️/🌙 | Theme Toggle | Switch between light and dark themes | `T` |
| 👁️ | Control Points | Show/hide control points and polygon | `C` |
| 📊 | Curvature | Show/hide curvature analysis overlay | `K` |
| ⚏ | Grid | Show/hide alignment grid | `G` |
| ⬜ | Clear | Clear all curves from canvas | `Delete` |
| 💾 | Save | Save project to file | `Ctrl+S` |
| 📂 | Load | Load project from file | `Ctrl+O` |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Key | Action |
|-----|--------|
| `V` | Toggle select/draw mode |
| `M` | Toggle measurements display |
| `R` | Reset view (zoom and pan) |
| `G` | Toggle snap to grid |
| `C` | Toggle curvature visualization |
| `Space` | Start/stop drawing mode |
| `Escape` | Deselect current curve or control point |
| `Delete` | Delete selected curve |
| `Ctrl+Z` | Undo last action |
| `Ctrl+Y` | Redo last action |
| `Ctrl+D` | Duplicate selected curve |
| `Ctrl+A` | Select all curves |
| `+` / `-` | Zoom in/out |

### Mouse and Touch Controls

**Drawing Mode** (Default):
- **Click + Drag**: Draw a freehand curve
- **Release**: Automatically fit Bézier curve to stroke

**Select Mode** (Press `V`):
- **Click on Curve**: Select the curve (turns orange/red)
- **Click on Control Point**: Select and start dragging (30px hit area)
- **Click + Drag Control Point**: Reshape the curve in real-time
- **Click Empty Area**: Deselect current selection
- **Press `Escape`**: Deselect control point or curve

**Control Point Editing**:
- **Click on Point**: Select control point (turns red and enlarges)
- **Drag**: Move control point to modify curve shape
- **Release**: Complete the modification
- All four control points (P₀, P₁, P₂, P₃) are editable

**Navigation**:
- **Mouse Wheel**: Zoom in/out
- **Middle Click + Drag**: Pan around canvas
- **Ctrl + Left Click + Drag**: Pan around canvas
- **Pinch Gesture** (touch): Zoom
- **Two-finger Drag** (touch): Pan

## Export and Sharing

### Export Formats

#### SVG (Scalable Vector Graphics) ⭐ Recommended
- **Best for**: Print, web graphics, vector editing
- **Contains**: Precise mathematical curve definitions
- **File Size**: Smallest for simple curves
- **Scalability**: Infinite resolution
- **Compatibility**: All modern browsers, vector editors

**Use Cases**:
- Logo design and branding
- Web graphics and icons
- Print materials
- Further editing in Illustrator/Inkscape

#### JSON (Data Format)
- **Best for**: Programmatic use, data analysis
- **Contains**: Raw control point coordinates and metadata
- **Integration**: Easy to parse in other applications
- **Format**: Human-readable structured data

**Example JSON Structure**:
```json
{
  "curves": [
    {
      "id": "curve_001",
      "controlPoints": {
        "p0": {"x": 100, "y": 150},
        "p1": {"x": 120, "y": 100},
        "p2": {"x": 180, "y": 100},
        "p3": {"x": 200, "y": 150}
      },
      "metadata": {
        "rmse": 0.0023,
        "iterations": 5,
        "timestamp": 1699123456789
      }
    }
  ]
}
```

#### PNG (Raster Image)
- **Best for**: Documentation, presentations, sharing
- **Contains**: Visual representation of current canvas
- **Resolution**: Matches current canvas size
- **Transparency**: Supports transparent backgrounds

### Project Management

#### Saving Projects
1. Click the **Save (💾)** button
2. Choose filename and location
3. Project saves as `.json` file with all curves and settings
4. Includes fitting parameters and view settings

#### Loading Projects
1. Click the **Load (📂)** button
2. Select previously saved `.json` project file
3. All curves and settings are restored
4. Compatible with all application versions

#### Auto-Save Feature
- Projects automatically save to browser local storage
- Recovered on application restart
- No data loss during browser crashes
- Clear local data via browser settings if needed

## Tips and Best Practices

### Drawing Techniques

**For Smooth Curves**:
- Use consistent, flowing motions
- Don't rush - steady speed works better
- Practice drawing circles and S-curves
- Use your whole arm, not just wrist movement

**For Precise Results**:
- Draw slightly larger than your target size
- Use multiple shorter strokes for complex shapes
- Enable grid for alignment reference
- Zoom in for fine detail work

**For Complex Shapes**:
- Break complex shapes into simpler curve segments
- Use the automatic segmentation feature
- Connect segments with C¹ or C² continuity
- Consider using multiple curves instead of one complex curve

### Algorithm Understanding

**Parameterization Choice**:
- **Centripetal**: Best for most hand-drawn curves (default)
- **Chord-length**: Good for technical/CAD-style curves
- **Uniform**: Only use for evenly-spaced point data

**Iteration Settings**:
- **Low iterations (5-10)**: Fast, good for rough sketches
- **Medium iterations (10-20)**: Balance of speed and accuracy
- **High iterations (20-50)**: Maximum accuracy, slower computation

**Quality Indicators**:
- **RMSE < 1.0**: Excellent fit for typical use
- **RMSE 1.0-3.0**: Good fit, acceptable for most applications
- **RMSE > 3.0**: Poor fit, consider re-drawing or segmentation

### Performance Optimization

**For Smooth Performance**:
- Close unused browser tabs
- Use Chrome or Firefox for best WebGL performance
- Enable hardware acceleration in browser settings
- Reduce curve complexity for older devices

**For Large Projects**:
- Regularly save your work
- Use curve segmentation for complex shapes
- Clear unnecessary curves from canvas
- Monitor browser memory usage

### Accessibility Features

**Keyboard Navigation**:
- Full application control via keyboard
- Tab navigation through all interactive elements
- Arrow keys for precise control point adjustment

**Visual Accessibility**:
- High contrast themes available
- Adjustable control point sizes
- Clear visual feedback for all interactions
- Screen reader compatible interface elements

## Troubleshooting

### Common Issues

**Curve Won't Fit Properly**:
- Try drawing the stroke more smoothly
- Increase maximum iterations in settings
- Use centripetal parameterization
- Break complex curves into simpler segments

**Performance is Slow**:
- Check WebGL support in browser
- Update graphics drivers
- Close other applications
- Reduce browser zoom level

**Control Points Not Visible**:
- Click the Eye (👁️) button to show control points
- Select a curve first
- Check if theme colors are too similar

**Export Not Working**:
- Check browser download settings
- Try different export format
- Ensure pop-ups are not blocked
- Use "Save As" from browser menu

### Browser Compatibility

**Fully Supported**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Limited Support**:
- Older browsers may lack WebGL 2.0
- Some mobile browsers have reduced features
- Internet Explorer not supported

### Getting Help

**Documentation**:
- This user guide for general usage
- Developer guide for technical details
- Algorithm documentation for mathematical background

**Community**:
- GitHub issues for bug reports
- Discussion forums for usage questions
- Video tutorials for visual learners

**Support**:
- Check browser console for error messages
- Include system information when reporting issues
- Provide example files that demonstrate problems

This comprehensive guide covers all aspects of using the Bézier Curve Designer effectively. For advanced technical details, refer to the developer and algorithm documentation.