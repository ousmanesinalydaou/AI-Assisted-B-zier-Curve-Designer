# Quick Start Guide - 5 Minutes

## Prerequisites
- Docker and Docker Compose installed
- 4GB RAM available
- Modern web browser (Chrome/Firefox/Edge)

## Step 1: Clone and Start (2 minutes)

```bash
# Clone repository
git clone https://github.com/ousmanesinalydaou/AI-Assisted-B-zier-Curve-Designer.git
cd AI-Assisted-B-zier-Curve-Designer

# Start all services
docker-compose up --build
```

**Wait for** these messages:
```
✅ Connected to MongoDB
🚀 Server starting on 0.0.0.0:8000
📚 Documentation available at http://0.0.0.0:8000/docs
```

## Step 2: Access the Application (30 seconds)

Open your browser:
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Backend Health**: http://localhost:8000/health

## Step 3: Draw Your First Curve (1 minute)

1. **Draw a stroke**: Click and drag on the canvas
2. **Fit curve**: Click the "Fit Curve" button
3. **Edit**: Drag the control point handles
4. **Analyze**: Click "Show Curvature" to see κ(t)

![Demo Steps](../docs/images/demo-steps.png)

## Step 4: Export Your Design (30 seconds)

1. Click **Export** button (bottom center)
2. Choose format:
   - **SVG**: For vector graphics editors
   - **JSON**: For saving/loading projects
   - **PNG**: For raster image
3. Download!

## Step 5: Explore Features (1 minute)

### Curve Smoothing
1. Draw multiple connected curves
2. Click **Smooth** button
3. Choose **C1** (tangent) or **C2** (curvature) continuity

### Save Project
1. Click **Save Project** (toolbar)
2. Enter name and description
3. Your design is saved to MongoDB!

### Load Project
1. Click **Load Project**
2. Select from your saved projects
3. Continue editing!

## Common Commands

```bash
# Start services
docker-compose up

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after code changes
docker-compose up --build

# Run frontend only (dev mode)
npm run dev

# Run backend only
cd backend && python main.py
```

## Keyboard Shortcuts

- **Ctrl+Z**: Undo
- **Ctrl+Y**: Redo
- **Delete**: Remove selected stroke
- **Esc**: Clear selection
- **Ctrl+E**: Export modal
- **Ctrl+S**: Save project

## Troubleshooting

### Port Already in Use
```bash
# Change ports in docker-compose.yml
ports:
  - "3001:80"  # Frontend (change 3000 to 3001)
  - "8001:8000"  # Backend (change 8000 to 8001)
```

### MongoDB Connection Error
```bash
# Ensure MongoDB is running
docker-compose ps

# Restart MongoDB
docker-compose restart mongodb
```

### Frontend Build Error
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Next Steps

- **Read the User Guide**: `docs/user_guide.md`
- **Explore API**: http://localhost:8000/docs
- **Check Architecture**: `docs/architecture.md`
- **View Examples**: `example_data/sample_curves.json`

## System Requirements

### Minimum
- CPU: 2 cores
- RAM: 4GB
- GPU: WebGL 2.0 support
- Browser: Chrome 90+, Firefox 88+, Edge 90+

### Recommended
- CPU: 4+ cores
- RAM: 8GB
- GPU: Dedicated graphics card
- Browser: Latest Chrome/Firefox

## Performance Tips

1. **Reduce curve segments**: Keep < 500 for smooth performance
2. **Disable curvature overlay**: Turn off when not needed
3. **Use lower tessellation**: Adjust in settings
4. **Clear old strokes**: Delete unused curves

## Getting Help

- **Documentation**: `docs/` directory
- **Issues**: https://github.com/ousmanesinalydaou/AI-Assisted-B-zier-Curve-Designer/issues
- **Discussions**: https://github.com/ousmanesinalydaou/AI-Assisted-B-zier-Curve-Designer/discussions

---

**Congratulations!** 🎉 You've successfully set up the Bézier Curve Designer. Start creating beautiful curves!
