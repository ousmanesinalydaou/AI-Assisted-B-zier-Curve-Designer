import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../store/useAppStore';
import { CurveFitter } from '../algorithms/curveFitting';
import { getCanvasCoordinates, resamplePoints, smoothPoints } from '../utils/helpers';
import { Point2D, CubicBezier } from '../types';

export const WebGLCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.OrthographicCamera>();
  const strokeMaterialRef = useRef<THREE.LineBasicMaterial>();
  const curveMaterialRef = useRef<THREE.LineBasicMaterial>();
  const controlPointMaterialRef = useRef<THREE.PointsMaterial>();
  const animationFrameRef = useRef<number>();

  const {
    isDrawing,
    currentStroke,
    strokes,
    selectedStroke,
    selectedControlPoint,
    theme,
    showControlPoints,
    showGrid,
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
      stroke.fittedCurves.forEach((curve, curveIndex) => {
        const isSelected = selectedStroke === stroke.id;
        const material = isSelected ? 
          new THREE.LineBasicMaterial({ color: 0xff6600, linewidth: renderOptions.curveWidth + 1 }) :
          curveMaterialRef.current!;
        
        renderBezierCurve(curve, material);

        // Render control points if enabled
        if (showControlPoints && isSelected) {
          renderControlPoints(stroke.id, curveIndex, curve);
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
    if (!sceneRef.current || points.length < 2) return;

    const geometry = new THREE.BufferGeometry();
    const positions = points.flatMap(p => [p.x, canvasRef.current!.clientHeight - p.y, 0]);
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const line = new THREE.Line(geometry, material);
    sceneRef.current.add(line);
  };

  const renderBezierCurve = (curve: CubicBezier, material: THREE.LineBasicMaterial) => {
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
  };

  const renderControlPoints = (strokeId: string, curveIndex: number, curve: CubicBezier) => {
    if (!sceneRef.current) return;

    const canvas = canvasRef.current!;
    const controlPoints = [curve.p0, curve.p1, curve.p2, curve.p3];
    
    controlPoints.forEach((point, pointIndex) => {
      const isSelected = selectedControlPoint?.strokeId === strokeId &&
                        selectedControlPoint?.curveIndex === curveIndex &&
                        selectedControlPoint?.pointIndex === pointIndex;
      
      const geometry = new THREE.SphereGeometry(renderOptions.controlPointSize / 2);
      const material = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xff0000 : (pointIndex === 0 || pointIndex === 3 ? 0x00ff00 : 0x0088ff),
      });
      
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(point.x, canvas.clientHeight - point.y, 0);
      sphere.userData = { strokeId, curveIndex, pointIndex };
      sceneRef.current.add(sphere);
    });

    // Render control polygon
    const polylinePoints = [curve.p0, curve.p1, curve.p2, curve.p3];
    const geometry = new THREE.BufferGeometry();
    const positions = polylinePoints.flatMap(p => [p.x, canvas.clientHeight - p.y, 0]);
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const material = new THREE.LineBasicMaterial({ 
      color: 0x888888, 
      opacity: 0.5, 
      transparent: true,
      linewidth: 1,
    });
    const line = new THREE.Line(geometry, material);
    sceneRef.current.add(line);
  };

  // Animation loop
  useEffect(() => {
    const animate = () => {
      renderScene();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [renderScene]);

  // Mouse/touch event handlers
  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    if (!canvasRef.current) return;

    const point = getCanvasCoordinates(event.nativeEvent, canvasRef.current);
    
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
            
            if (distance < renderOptions.controlPointSize) {
              selectControlPoint(selectedStroke, curveIndex, pointIndex);
              controlPointClicked = true;
              break;
            }
          }
          
          if (controlPointClicked) break;
        }
      }
    }

    if (!controlPointClicked) {
      startDrawing(point);
    }
  }, [selectedStroke, showControlPoints, strokes, renderOptions.controlPointSize, selectControlPoint, startDrawing]);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!canvasRef.current) return;

    const point = getCanvasCoordinates(event.nativeEvent, canvasRef.current);

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
  }, [selectedControlPoint, isDrawing, updateControlPoint, addPoint]);

  const handlePointerUp = useCallback(() => {
    if (selectedControlPoint) {
      clearSelection();
    } else if (isDrawing) {
      endDrawing();
    }
  }, [selectedControlPoint, isDrawing, clearSelection, endDrawing]);

  // Fit curves after stroke is completed
  useEffect(() => {
    strokes.forEach(stroke => {
      if (stroke.fittedCurves.length === 0 && stroke.points.length > 3) {
        try {
          // Preprocess points
          const resampled = resamplePoints(stroke.points, 5);
          const smoothed = smoothPoints(resampled, 3);
          
          // Fit curve
          const fitter = new CurveFitter(fittingOptions);
          const result = fitter.fitCurve(smoothed);
          
          // Update stroke with fitted curve
          stroke.fittedCurves = [result.curve];
        } catch (error) {
          console.error('Failed to fit curve:', error);
        }
      }
    });
  }, [strokes, fittingOptions]);

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className={`w-full h-full cursor-crosshair ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-white'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};