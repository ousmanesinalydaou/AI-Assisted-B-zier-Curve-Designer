import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CurveFitter } from '../algorithms/curveFitting';
import { useAppStore } from '../store/useAppStore';
import { CubicBezier, Point2D } from '../types';
import { getCanvasCoordinates, resamplePoints, smoothPoints } from '../utils/helpers';

export const WebGLCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.OrthographicCamera>();
  const strokeMaterialRef = useRef<THREE.LineBasicMaterial>();
  const curveMaterialRef = useRef<THREE.LineBasicMaterial>();
  const controlPointMaterialRef = useRef<THREE.PointsMaterial>();
  const animationFrameRef = useRef<number>();
  
  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPos, setLastPanPos] = useState({ x: 0, y: 0 });

  const {
    isDrawing,
    currentStroke,
    strokes,
    selectedStroke,
    selectedControlPoint,
    selectMode,
    theme,
    showControlPoints,
    showCurvature,
    showGrid,
    showSnapToGrid,
    showMeasurements,
    fittingOptions,
    renderOptions,
    startDrawing,
    addPoint,
    endDrawing,
    selectStroke,
    selectControlPoint,
    updateControlPoint,
    clearSelection,
  } = useAppStore();

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ 
      canvas,
      antialias: true,
      alpha: true,
    });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    
    const camera = new THREE.OrthographicCamera(
      0, canvas.clientWidth,
      0, canvas.clientHeight,
      -1, 1
    );

    // Materials
    const strokeMaterial = new THREE.LineBasicMaterial({ 
      color: theme === 'dark' ? 0x888888 : 0x666666,
      linewidth: renderOptions.strokeWidth,
    });
    
    const curveMaterial = new THREE.LineBasicMaterial({ 
      color: theme === 'dark' ? 0x00ff88 : 0x2563eb,
      linewidth: renderOptions.curveWidth,
    });
    
    const controlPointMaterial = new THREE.PointsMaterial({
      color: 0xff4444,
      size: renderOptions.controlPointSize,
      sizeAttenuation: false,
    });

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    strokeMaterialRef.current = strokeMaterial;
    curveMaterialRef.current = curveMaterial;
    controlPointMaterialRef.current = controlPointMaterial;

    // Handle resize
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      camera.left = 0;
      camera.right = rect.width;
      camera.top = rect.height;
      camera.bottom = 0;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Update materials when theme changes
  useEffect(() => {
    if (strokeMaterialRef.current && curveMaterialRef.current) {
      strokeMaterialRef.current.color.setHex(theme === 'dark' ? 0x888888 : 0x666666);
      curveMaterialRef.current.color.setHex(theme === 'dark' ? 0x00ff88 : 0x2563eb);
    }
  }, [theme]);

  // Apply zoom to camera
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.zoom = zoom;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [zoom]);

  // Apply pan to camera
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.x = -pan.x;
      cameraRef.current.position.y = pan.y;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [pan]);

  // Render scene
  const renderScene = useCallback(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;

    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;

    // Clear previous frame
    scene.clear();

    // Render grid if enabled
    if (showGrid) {
      const gridGeometry = new THREE.BufferGeometry();
      const gridPoints: number[] = [];
      const gridSize = 50;
      
      for (let x = 0; x <= camera.right; x += gridSize) {
        gridPoints.push(x, 0, 0, x, camera.top, 0);
      }
      for (let y = 0; y <= camera.top; y += gridSize) {
        gridPoints.push(0, y, 0, camera.right, y, 0);
      }
      
      gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridPoints, 3));
      const gridMaterial = new THREE.LineBasicMaterial({ 
        color: theme === 'dark' ? 0x333333 : 0xe5e5e5,
        opacity: 0.5,
        transparent: true,
      });
      const gridLines = new THREE.LineSegments(gridGeometry, gridMaterial);
      scene.add(gridLines);
    }

    // Render current stroke being drawn
    if (isDrawing && currentStroke.length > 1) {
      renderStroke(currentStroke, strokeMaterialRef.current!);
    }

    // Render all completed strokes
    strokes.forEach(stroke => {
      // Render original stroke
      if (stroke.points.length > 1) {
        renderStroke(stroke.points, strokeMaterialRef.current!);
      }

      // Render fitted curves
      const isSelected = selectedStroke === stroke.id;
      stroke.fittedCurves.forEach((curve, curveIndex) => {
        const material = isSelected ? 
          new THREE.LineBasicMaterial({ color: 0xff6600, linewidth: renderOptions.curveWidth + 1 }) :
          curveMaterialRef.current!;
        
        renderBezierCurve(curve, material, stroke.id, isSelected);

        // Render control points if enabled (show for all curves when enabled)
        if (showControlPoints) {
          renderControlPoints(stroke.id, curveIndex, curve, isSelected);
        }
      });
    });

    renderer.render(scene, camera);
  }, [
    isDrawing,
    currentStroke,
    strokes,
    selectedStroke,
    selectedControlPoint,
    theme,
    showControlPoints,
    showGrid,
    renderOptions,
  ]);

  const renderStroke = (points: Point2D[], material: THREE.LineBasicMaterial) => {
    if (!sceneRef.current || !canvasRef.current || points.length < 2) return;

    const canvas = canvasRef.current;
    const geometry = new THREE.BufferGeometry();
    const positions = points.flatMap(p => [p.x, canvas.clientHeight - p.y, 0]);
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const line = new THREE.Line(geometry, material);
    sceneRef.current.add(line);
  };

  const renderBezierCurve = (curve: CubicBezier, material: THREE.LineBasicMaterial, _strokeId: string, isSelected?: boolean) => {
    if (!sceneRef.current) return;

    const curveFitter = new CurveFitter(fittingOptions);
    const points: Point2D[] = [];
    
    // Adaptive tessellation
    const segments = 50; // Could be made adaptive based on curvature
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = curveFitter.evaluateBezier(curve, t);
      points.push(point);
    }

    const geometry = new THREE.BufferGeometry();
    const positions = points.flatMap(p => [p.x, canvasRef.current!.clientHeight - p.y, 0]);
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const line = new THREE.Line(geometry, material);
    sceneRef.current.add(line);
    
    // Add glow effect for selected curves
    if (isSelected) {
      const glowMaterial = new THREE.LineBasicMaterial({ 
        color: 0xaa44ff,
        linewidth: renderOptions.curveWidth + 4,
        opacity: 0.3,
        transparent: true,
      });
      const glowLine = new THREE.Line(geometry, glowMaterial);
      sceneRef.current.add(glowLine);
    }
    
    // Render curvature visualization if enabled
    if (showCurvature && isSelected) {
      renderCurvatureVisualization(curve);
    }
  };

  const renderCurvatureVisualization = (curve: CubicBezier) => {
    if (!sceneRef.current) return;
    
    const segments = 30;
    const curveFitter = new CurveFitter(fittingOptions);
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = curveFitter.evaluateBezier(curve, t);
      const curvature = curveFitter.calculateCurvature(curve, t);
      
      // Map curvature to color (blue = low, red = high)
      const normalizedCurvature = Math.min(1, Math.abs(curvature) / 2);
      const color = new THREE.Color();
      color.setHSL(0.6 - normalizedCurvature * 0.6, 1, 0.5); // Blue to red gradient
      
      // Render curvature indicator
      const geometry = new THREE.CircleGeometry(3, 8);
      const material = new THREE.MeshBasicMaterial({ color });
      const circle = new THREE.Mesh(geometry, material);
      circle.position.set(point.x, canvasRef.current!.clientHeight - point.y, 0);
      sceneRef.current.add(circle);
    }
  };

  const renderControlPoints = (strokeId: string, curveIndex: number, curve: CubicBezier, isSelected: boolean = false) => {
    if (!sceneRef.current) return;

    const canvas = canvasRef.current!;
    const controlPoints = [curve.p0, curve.p1, curve.p2, curve.p3];
    
    // Render control polygon first (behind the points)
    const polylinePoints = [curve.p0, curve.p1, curve.p2, curve.p3];
    const geometry = new THREE.BufferGeometry();
    const positions = polylinePoints.flatMap(p => [p.x, canvas.clientHeight - p.y, 0]);
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const material = new THREE.LineBasicMaterial({ 
      color: 0x666666, 
      opacity: 0.4, 
      transparent: true,
      linewidth: 1,
    });
    const line = new THREE.Line(geometry, material);
    sceneRef.current.add(line);
    
    // Render control points with enhanced visuals
    controlPoints.forEach((point, pointIndex) => {
      const isSelected = selectedControlPoint?.strokeId === strokeId &&
                        selectedControlPoint?.curveIndex === curveIndex &&
                        selectedControlPoint?.pointIndex === pointIndex;
      
      const size = isSelected ? renderOptions.controlPointSize * 1.5 : renderOptions.controlPointSize;
      const geometry = new THREE.CircleGeometry(size / 2, 16);
      
      // Different colors for endpoints vs control points
      let color: number;
      if (pointIndex === 0 || pointIndex === 3) {
        color = isSelected ? 0xff0000 : 0x00cc00; // Green for endpoints
      } else {
        color = isSelected ? 0xff0000 : 0x4488ff; // Blue for control points
      }
      
      const material = new THREE.MeshBasicMaterial({ color });
      
      const circle = new THREE.Mesh(geometry, material);
      circle.position.set(point.x, canvas.clientHeight - point.y, 0);
      circle.userData = { strokeId, curveIndex, pointIndex };
      if (sceneRef.current) {
        sceneRef.current.add(circle);
      }
      
      // Add white outline for better visibility
      const outlineGeometry = new THREE.CircleGeometry(size / 2 + 1, 16);
      const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
      outline.position.set(point.x, canvas.clientHeight - point.y, -0.01);
      if (sceneRef.current) {
        sceneRef.current.add(outline);
      }
    });
  };

  const renderMeasurements = () => {
    if (!showMeasurements || !selectedStroke || !canvasRef.current) return;

    const stroke = strokes.find(s => s.id === selectedStroke);
    if (!stroke || stroke.fittedCurves.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate total curve length
    let totalLength = 0;
    stroke.fittedCurves.forEach(curve => {
      // Approximate length using 50 samples
      let length = 0;
      for (let i = 0; i < 50; i++) {
        const t1 = i / 50;
        const t2 = (i + 1) / 50;
        
        const mt1 = 1 - t1;
        const mt1_2 = mt1 * mt1;
        const mt1_3 = mt1_2 * mt1;
        const t1_2 = t1 * t1;
        const t1_3 = t1_2 * t1;
        
        const x1 = mt1_3 * curve.p0.x + 3 * mt1_2 * t1 * curve.p1.x + 3 * mt1 * t1_2 * curve.p2.x + t1_3 * curve.p3.x;
        const y1 = mt1_3 * curve.p0.y + 3 * mt1_2 * t1 * curve.p1.y + 3 * mt1 * t1_2 * curve.p2.y + t1_3 * curve.p3.y;
        
        const mt2 = 1 - t2;
        const mt2_2 = mt2 * mt2;
        const mt2_3 = mt2_2 * mt2;
        const t2_2 = t2 * t2;
        const t2_3 = t2_2 * t2;
        
        const x2 = mt2_3 * curve.p0.x + 3 * mt2_2 * t2 * curve.p1.x + 3 * mt2 * t2_2 * curve.p2.x + t2_3 * curve.p3.x;
        const y2 = mt2_3 * curve.p0.y + 3 * mt2_2 * t2 * curve.p1.y + 3 * mt2 * t2_2 * curve.p2.y + t2_3 * curve.p3.y;
        
        length += Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      }
      totalLength += length;
    });

    // Display measurements
    ctx.save();
    ctx.font = '14px Inter, system-ui, sans-serif';
    ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000';
    ctx.strokeStyle = theme === 'dark' ? '#000000' : '#ffffff';
    ctx.lineWidth = 3;
    
    const text = `Length: ${totalLength.toFixed(2)}px`;
    const x = 20;
    const y = canvas.height - 30;
    
    // Draw background
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    
    // Draw distances between control points if control points are shown
    if (showControlPoints && stroke.fittedCurves.length > 0) {
      stroke.fittedCurves.forEach((curve) => {
        const points = [curve.p0, curve.p1, curve.p2, curve.p3];
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          const dist = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
          
          const midX = (p1.x + p2.x) / 2;
          const midY = canvas.height - (p1.y + p2.y) / 2;
          
          ctx.font = '11px Inter, system-ui, sans-serif';
          const distText = dist.toFixed(1);
          ctx.strokeText(distText, midX, midY);
          ctx.fillText(distText, midX, midY);
        }
      });
    }
    
    ctx.restore();
  };

  // Animation loop
  useEffect(() => {
    const animate = () => {
      renderScene();
      renderMeasurements();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [renderScene, renderMeasurements]);

  // Helper function to snap point to grid
  const snapToGrid = useCallback((point: Point2D): Point2D => {
    if (!showSnapToGrid) return point;
    const gridSize = 50; // Same as the grid rendering size
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize,
    };
  }, [showSnapToGrid]);

  // Mouse/touch event handlers
  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    if (!canvasRef.current) return;

    // Middle mouse button or Ctrl+Left for panning
    if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
      setIsPanning(true);
      setLastPanPos({ x: event.clientX, y: event.clientY });
      return;
    }

    const rawPoint = getCanvasCoordinates(event.nativeEvent, canvasRef.current);
    const point = snapToGrid(rawPoint);
    
    // Check for control point selection first
    let controlPointClicked = false;
    if (selectedStroke && showControlPoints) {
      const selectedStrokeData = strokes.find(s => s.id === selectedStroke);
      if (selectedStrokeData) {
        for (let curveIndex = 0; curveIndex < selectedStrokeData.fittedCurves.length; curveIndex++) {
          const curve = selectedStrokeData.fittedCurves[curveIndex];
          const controlPoints = [curve.p0, curve.p1, curve.p2, curve.p3];
          
          for (let pointIndex = 0; pointIndex < controlPoints.length; pointIndex++) {
            const cp = controlPoints[pointIndex];
            const distance = Math.sqrt((point.x - cp.x) ** 2 + (point.y - cp.y) ** 2);
            
            // Larger hit area for easier selection (30 pixels)
            if (distance < 30) {
              selectControlPoint(selectedStroke, curveIndex, pointIndex);
              controlPointClicked = true;
              break;
            }
          }
          
          if (controlPointClicked) break;
        }
      }
    }

    // In select mode, check for stroke selection
    if (selectMode && !controlPointClicked) {
      let strokeClicked = false;
      const clickThreshold = 15; // Distance threshold for clicking on a stroke

      // Check each stroke to see if click is near it
      for (const stroke of strokes) {
        if (stroke.fittedCurves.length === 0) continue;

        // Check if click is near any of the fitted curves
        for (const curve of stroke.fittedCurves) {
          // Sample points along the bezier curve and check distance
          const samples = 20;
          for (let i = 0; i <= samples; i++) {
            const t = i / samples;
            const t2 = t * t;
            const t3 = t2 * t;
            const mt = 1 - t;
            const mt2 = mt * mt;
            const mt3 = mt2 * mt;

            // Bezier curve formula
            const x = mt3 * curve.p0.x + 3 * mt2 * t * curve.p1.x + 3 * mt * t2 * curve.p2.x + t3 * curve.p3.x;
            const y = mt3 * curve.p0.y + 3 * mt2 * t * curve.p1.y + 3 * mt * t2 * curve.p2.y + t3 * curve.p3.y;

            const distance = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
            
            if (distance < clickThreshold) {
              selectStroke(stroke.id);
              strokeClicked = true;
              break;
            }
          }
          
          if (strokeClicked) break;
        }
        
        if (strokeClicked) break;
      }

      // If clicked on empty area in select mode, clear selection
      if (!strokeClicked) {
        clearSelection();
      }
    } else if (!controlPointClicked && !selectMode) {
      // In draw mode, start drawing
      startDrawing(point);
    }
  }, [selectedStroke, showControlPoints, strokes, renderOptions.controlPointSize, selectMode, selectControlPoint, selectStroke, startDrawing, clearSelection]);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!canvasRef.current) return;

    if (isPanning) {
      const deltaX = event.clientX - lastPanPos.x;
      const deltaY = event.clientY - lastPanPos.y;
      setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastPanPos({ x: event.clientX, y: event.clientY });
      return;
    }

    const rawPoint = getCanvasCoordinates(event.nativeEvent, canvasRef.current);
    const point = snapToGrid(rawPoint);

    if (selectedControlPoint) {
      // Update control point position
      updateControlPoint(
        selectedControlPoint.strokeId,
        selectedControlPoint.curveIndex,
        selectedControlPoint.pointIndex,
        point
      );
    } else if (isDrawing) {
      addPoint(point);
    }
  }, [selectedControlPoint, isDrawing, isPanning, lastPanPos, updateControlPoint, addPoint]);

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
    // Don't clear control point selection - let user click elsewhere or press Escape to deselect
    if (isDrawing) {
      endDrawing();
    }
  }, [isDrawing, endDrawing]);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(10, prev * delta)));
  }, []);

  // Touch gesture handlers
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; distance?: number } | null>(null);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 2) {
      // Two-finger touch for pinch-zoom
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setTouchStart({ 
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
        distance 
      });
      event.preventDefault();
    } else if (event.touches.length === 1) {
      const touch = event.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
    }
  }, []);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!touchStart) return;

    if (event.touches.length === 2 && touchStart.distance) {
      // Pinch-to-zoom
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const scale = distance / touchStart.distance;
      setZoom(prev => Math.max(0.1, Math.min(10, prev * scale)));
      setTouchStart({ ...touchStart, distance });
      event.preventDefault();
    } else if (event.touches.length === 1 && !touchStart.distance) {
      // Two-finger pan would be detected here
      const touch = event.touches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      
      // If movement is significant, treat as pan
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
        setTouchStart({ x: touch.clientX, y: touch.clientY });
      }
    }
  }, [touchStart]);

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
  }, []);

  // Fit curves after stroke is completed
  useEffect(() => {
    strokes.forEach(stroke => {
      if (stroke.fittedCurves.length === 0 && stroke.points.length > 3) {
        try {
          // Preprocess points
          const resampled = resamplePoints(stroke.points, 5);
          const smoothed = smoothPoints(resampled, 3);
          
          // Fit a single cubic Bézier curve
          const fitter = new CurveFitter(fittingOptions);
          const result = fitter.fitCurve(smoothed);
          
          // Update stroke with fitted curve
          if (result.curve) {
            stroke.fittedCurves = [result.curve];
          }
        } catch (error) {
          console.error('Failed to fit curve:', error);
        }
      }
    });
  }, [strokes, fittingOptions]);

  return (
    <div className="w-full h-full relative pointer-events-none">
      <canvas
        ref={canvasRef}
        className={`w-full h-full pointer-events-auto ${
          isPanning 
            ? 'cursor-grabbing' 
            : isDrawing 
              ? 'cursor-crosshair' 
              : selectMode 
                ? 'cursor-pointer' 
                : 'cursor-crosshair'
        } ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(e) => e.preventDefault()}
      />
      
      {/* Zoom Controls */}
      <div className={`absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-auto`}>
        {/* Zoom Indicator */}
        <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
          theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
        } shadow-lg text-center`}>
          {(zoom * 100).toFixed(0)}%
        </div>
        
        {/* Zoom Buttons */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setZoom(prev => Math.min(10, prev * 1.2))}
            className={`px-3 py-2 rounded-lg text-sm font-bold transition-all hover:scale-110 ${
              theme === 'dark' 
                ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                : 'bg-white text-gray-800 hover:bg-gray-100'
            } shadow-lg`}
            title="Zoom In (Scroll Up)"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.1, prev / 1.2))}
            className={`px-3 py-2 rounded-lg text-sm font-bold transition-all hover:scale-110 ${
              theme === 'dark' 
                ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                : 'bg-white text-gray-800 hover:bg-gray-100'
            } shadow-lg`}
            title="Zoom Out (Scroll Down)"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className={`px-2 py-1 rounded-lg text-xs transition-all hover:scale-110 ${
              theme === 'dark' 
                ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                : 'bg-white text-gray-800 hover:bg-gray-100'
            } shadow-lg`}
            title="Reset Zoom and Pan"
            aria-label="Reset view"
          >
            ⟲
          </button>
        </div>
      </div>
      
      {/* Controls hint */}
      <div className={`absolute top-4 left-4 px-3 py-2 rounded-lg text-xs pointer-events-auto ${
        theme === 'dark' ? 'bg-gray-800/80 text-gray-300' : 'bg-white/80 text-gray-600'
      } backdrop-blur-sm space-y-1`}>
        <div>🖱️ Scroll: Zoom</div>
        <div>🖱️ Middle Click: Pan</div>
        <div>⌃ + Click: Pan</div>
      </div>
    </div>
  );
};