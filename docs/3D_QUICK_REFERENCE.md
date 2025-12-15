# 🎯 3D Features Quick Reference
## AI-Assisted Bézier Curve Designer

---

## 🚀 Quick Start

1. **Draw curves** in the main canvas
2. Click **📦 (Box icon)** in toolbar to open 3D panel
3. Select a **surface type**
4. View in **3D viewer** (opens automatically)
5. **Export** your creation!

---

## 📊 Surface Types Cheat Sheet

| Surface Type | Curves Needed | Best For | Settings |
|-------------|---------------|----------|----------|
| **Revolution** | 1 | Vases, bottles, columns | Axis, rotation steps |
| **Vase** | 1 | Pottery, containers | Resolution |
| **Tube** | 1 | Pipes, cables, hoses | Radius, rotation steps |
| **Patch** | 4 | Freeform surfaces | Resolution |
| **Loft** | 2+ | Ship hulls, organic shapes | Resolution |
| **Extrusion** | 2 | Complex profiles | Resolution |

---

## ⚙️ Settings Guide

### Resolution (8-64)
- **8-16**: Fast preview, visible facets
- **24-32**: Good quality ⭐ **Recommended**
- **48-64**: High quality, slower

### Rotation Steps (8-64)
- **8-16**: Polygonal look
- **24-32**: Smooth cylinders ⭐ **Recommended**
- **48-64**: Very smooth

### Rotation Axis
- **Y-axis**: Vertical objects (vases) ⭐ **Most common**
- **X-axis**: Horizontal rotation
- **Z-axis**: Depth-based rotation

### Tube Radius (1-20)
- **1-5**: Thin pipes
- **5-10**: Medium tubes ⭐ **Recommended**
- **10-20**: Thick cylinders

---

## 🎮 3D Viewer Controls

| Action | Control |
|--------|---------|
| **Rotate** | Left click + drag |
| **Pan** | Right click + drag |
| **Zoom** | Scroll wheel |
| **Reset** | Reset button |
| **Auto-rotate** | 🔄 button (toggles on/off) |
| **Wireframe** | 💡 button |
| **Export** | 💾 button → PNG file |
| **Close** | ❌ button or Escape |

---

## 💡 Pro Tips

### For Best Results:

1. **Smooth Input Curves**
   - Smoother curves = smoother surfaces
   - Use curve fitting for clean results

2. **Start Low Resolution**
   - Quick iteration: resolution 16
   - Final export: resolution 48+

3. **Axis Selection**
   - Think about the object's natural orientation
   - Y-axis for most standing objects

4. **Multiple Views**
   - Auto-rotate to see all angles
   - Check for unexpected artifacts

5. **Experiment!**
   - Try different settings
   - Surfaces can be deleted if not satisfied

---

## 🎨 Creative Ideas

### What to Create:

**Beginner:**
- Simple vases
- Drinking glasses
- Candle holders
- Basic columns

**Intermediate:**
- Complex bottles
- Architectural elements
- Abstract sculptures
- Organic shapes

**Advanced:**
- Character models (using patches)
- Terrain (multiple patches)
- Complex assemblies (lofting)
- Architectural structures

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **3** | Toggle 3D panel |
| **Esc** | Close 3D viewer |
| **T** | Toggle theme |
| **V** | Select/draw mode |

---

## 🐛 Troubleshooting

### "Not enough curves"
➡️ Draw more curves (check requirements)

### "Surface looks jagged"
➡️ Increase resolution slider

### "Too slow to generate"
➡️ Decrease resolution temporarily

### "Can't see my surface"
➡️ Click Reset View button
➡️ Check wireframe mode is off

### "Wrong orientation"
➡️ Try different rotation axis (X/Y/Z)

---

## 📐 Mathematical Formulas

### Surface of Revolution
```
S(u,v) = (x(u)·cos(2πv), y(u), x(u)·sin(2πv))
```

### Bézier Patch
```
S(u,v) = ΣΣ B_i,3(u) · B_j,3(v) · P_ij
```

### Lofting
```
S(u,v) = Σ N_i(v) · C_i(u)
```

---

## 🎯 Common Workflows

### Workflow 1: Create a Vase
```
1. Draw curve (side profile)
2. Click "Vase Shape"
3. Set resolution to 32
4. View and export
```

### Workflow 2: Create Complex Shape
```
1. Draw 4 boundary curves
2. Click "Bézier Patch"
3. Set resolution to 48
4. Toggle wireframe to inspect
5. Export
```

### Workflow 3: Create Pipe
```
1. Draw curve (pipe path)
2. Click "Tube/Pipe"
3. Adjust radius slider
4. Set rotation steps to 24
5. View result
```

---

## 🎓 Learning Path

### Level 1: Basics
- ✅ Create surface of revolution
- ✅ Adjust resolution
- ✅ Export PNG

### Level 2: Intermediate
- ✅ Try all surface types
- ✅ Use wireframe mode
- ✅ Experiment with axis

### Level 3: Advanced
- ✅ Create multi-curve surfaces
- ✅ Combine with AI features
- ✅ Create complex assemblies

---

## 📊 Performance Tips

| Resolution | Triangles | FPS | Use Case |
|-----------|-----------|-----|----------|
| 16 | ~1K | 60+ | Preview |
| 32 | ~4K | 60 | Standard |
| 48 | ~9K | 50+ | High quality |
| 64 | ~16K | 30-50 | Final export |

---

## 🎨 Export Tips

1. **Set high resolution** before export (48-64)
2. **Position camera** for best angle
3. **Turn off wireframe** for clean render
4. **Use auto-rotate** for animated view
5. **Take multiple screenshots** from different angles

---

## 🌟 Feature Highlights

**What Makes This Special:**
- ✨ Real-time 3D generation
- ✨ Interactive visualization
- ✨ Multiple surface types
- ✨ GPU-accelerated rendering
- ✨ Professional quality output
- ✨ Easy to use interface

---

## 📞 Need Help?

- **Documentation:** See `docs/3d_features_guide.md`
- **Tutorial:** Click Help icon in app
- **GitHub:** https://github.com/ousmanesinalydaou/AI-Assisted-B-zier-Curve-Designer
- **Live Demo:** https://bezier-designer.unideb.app

---

## 🎉 Have Fun Creating!

Remember: The best way to learn is to **experiment and play**. Try different curves, settings, and surface types. Every creation teaches something new!

**Happy Modeling! 🎨✨**

---

**OUSMANE DAOU** | University of Debrecen | November 2025
