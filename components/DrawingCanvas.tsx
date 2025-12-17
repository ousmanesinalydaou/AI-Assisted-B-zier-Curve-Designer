import React, { useRef, useEffect, useState } from 'react';
import { Point3D, Parameterization, Theme } from '../types';
import { fitCurveLeastSquares, evaluateBSplineCurve, generateKnots } from '../services/mathUtils';

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  activeCurveIndex: number;
  curves: Point3D[][]; 
  onChange: (newCurves: Point3D[][]) => void;
  uDegree: number;
  uControlPoints: number;
  parameterization: Parameterization;
  theme: Theme;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width = 300,
  height = 300,
  activeCurveIndex,
  curves,
  onChange,
  uDegree,
  uControlPoints,
  parameterization,
  theme
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Theme Colors
  const isDark = theme === Theme.DARK;
  const colors = {
    grid: isDark ? '#333333' : '#e5e7eb',
    rawPoints: isDark ? '#fbbf24' : '#d97706', // amber-400 vs amber-600
    curveActive: isDark ? '#60a5fa' : '#2563eb', // blue-400 vs blue-600
    curveInactive: isDark ? '#4b5563' : '#9ca3af', // gray-600 vs gray-400
    controlPoly: isDark ? '#ef4444' : '#dc2626', // red-500 vs red-600
  };

  const screenToWorld = (sx: number, sy: number) => {
    const wx = (sx / width) * 10 - 5;
    const wy = -((sy / height) * 10 - 5);
    return { x: wx, y: wy, z: 0 };
  };

  const worldToScreen = (wx: number, wy: number) => {
    const sx = ((wx + 5) / 10) * width;
    const sy = ((-wy + 5) / 10) * height;
    return { x: sx, y: sy };
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    
    // Grid
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width/2, 0); ctx.lineTo(width/2, height);
    ctx.moveTo(0, height/2); ctx.lineTo(width, height/2);
    ctx.stroke();

    curves.forEach((curvePoints, idx) => {
      const isActive = idx === activeCurveIndex;
      
      if (curvePoints.length === 0) return;

      if (isActive) {
        ctx.fillStyle = colors.rawPoints;
        curvePoints.forEach(p => {
          const s = worldToScreen(p.x, p.y);
          ctx.fillRect(s.x - 1.5, s.y - 1.5, 3, 3);
        });
      }

      if (curvePoints.length > 1) {
        try {
          const controlPoints = fitCurveLeastSquares(curvePoints, uDegree, uControlPoints, parameterization);
          const safeDegree = Math.min(uDegree, controlPoints.length - 1);
          const knots = generateKnots(safeDegree, controlPoints.length);

          ctx.strokeStyle = isActive ? colors.curveActive : colors.curveInactive;
          ctx.lineWidth = isActive ? 2 : 1;
          ctx.beginPath();
          const samples = 50;
          for (let i = 0; i <= samples; i++) {
            const t = i / samples;
            const p = evaluateBSplineCurve(t, safeDegree, controlPoints, knots);
            const s = worldToScreen(p.x, p.y);
            if (i === 0) ctx.moveTo(s.x, s.y);
            else ctx.lineTo(s.x, s.y);
          }
          ctx.stroke();

          if (isActive) {
             ctx.strokeStyle = colors.controlPoly;
             ctx.lineWidth = 1;
             ctx.setLineDash([3, 3]);
             ctx.beginPath();
             controlPoints.forEach((cp, i) => {
               const s = worldToScreen(cp.x, cp.y);
               if (i===0) ctx.moveTo(s.x, s.y);
               else ctx.lineTo(s.x, s.y);
               ctx.fillStyle = colors.controlPoly;
               ctx.fillRect(s.x - 2, s.y - 2, 4, 4);
             });
             ctx.stroke();
             ctx.setLineDash([]);
          }

        } catch (e) {
          // ignore
        }
      }
    });
  };

  useEffect(() => {
    draw();
  }, [curves, activeCurveIndex, uDegree, uControlPoints, parameterization, theme]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDrawing(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = canvasRef.current!.getBoundingClientRect();
    const pt = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const newCurves = [...curves];
    newCurves[activeCurveIndex] = [pt];
    onChange(newCurves);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const pt = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const newCurves = [...curves];
    const currentPts = newCurves[activeCurveIndex];
    const last = currentPts[currentPts.length - 1];
    const dist = Math.hypot(pt.x - last.x, pt.y - last.y);
    if (dist > 0.05) {
      newCurves[activeCurveIndex] = [...currentPts, pt];
      onChange(newCurves);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDrawing(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className={`relative border rounded overflow-hidden touch-none transition-colors duration-300 ${
      isDark 
        ? 'border-neutral-700 bg-neutral-900/50' 
        : 'border-slate-300 bg-white/50'
    }`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="cursor-crosshair w-full h-full block"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <div className={`absolute top-2 left-2 pointer-events-none text-[10px] uppercase tracking-widest font-bold ${
        isDark ? 'text-neutral-500' : 'text-slate-400'
      }`}>
        2D Input
      </div>
      <div className={`absolute bottom-2 right-2 pointer-events-none text-[10px] font-mono ${
        isDark ? 'text-neutral-600' : 'text-slate-400'
      }`}>
        Curve {activeCurveIndex + 1}/{curves.length}
      </div>
    </div>
  );
};

export default DrawingCanvas;
