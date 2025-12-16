import React, { useRef, useState, useEffect } from 'react';
import { Point, CurveResult, ParameterizationMethod } from '../types';

interface DrawingCanvasProps {
  points: Point[];
  setPoints: (points: Point[]) => void;
  results: CurveResult[];
  showResiduals: boolean;
  showControlPolygon: boolean;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ 
  points, 
  setPoints, 
  results,
  showResiduals,
  showControlPolygon
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, index: number) => {
    e.stopPropagation(); // Prevent adding a new point
    setDraggedIndex(index);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (draggedIndex !== null) return;
    const { x, y } = getCoordinates(e);
    setPoints([...points, { x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (draggedIndex !== null) {
      const { x, y } = getCoordinates(e);
      const newPoints = [...points];
      newPoints[draggedIndex] = { x, y };
      setPoints(newPoints);
    }
  };

  const handleMouseUp = () => {
    setDraggedIndex(null);
  };

  // Convert points array to SVG path string
  const pointsToPath = (pts: Point[]) => {
    if (pts.length === 0) return '';
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    return d;
  };

  const colors = {
    [ParameterizationMethod.UNIFORM]: '#3B82F6', // Blue
    [ParameterizationMethod.CHORD_LENGTH]: '#EF4444' // Red
  };

  return (
    <div className="w-full h-full border border-slate-200 rounded-xl overflow-hidden bg-white shadow-inner relative group">
      <div className="absolute top-4 left-4 text-xs text-slate-400 pointer-events-none select-none">
        Click to add points • Drag to move points
      </div>
      <svg
        ref={svgRef}
        className="w-full h-full touch-none cursor-crosshair"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Render Results */}
        {results.map((res) => (
          <g key={res.method} className="opacity-90">
            {/* Control Polygon (Optional) */}
            {showControlPolygon && (
              <path
                d={pointsToPath(res.controlPoints)}
                fill="none"
                stroke={colors[res.method]}
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.4"
              />
            )}
            
            {/* Control Points (Optional or debug) */}
            {showControlPolygon && res.controlPoints.map((cp, idx) => (
               <circle key={`cp-${res.method}-${idx}`} cx={cp.x} cy={cp.y} r="2" fill={colors[res.method]} opacity="0.4" />
            ))}

            {/* Residuals (Error lines) */}
            {showResiduals && res.residuals.map((line, idx) => (
               <line 
                key={`res-${res.method}-${idx}`}
                x1={line.start.x} y1={line.start.y}
                x2={line.end.x} y2={line.end.y}
                stroke={colors[res.method]}
                strokeWidth="1"
                opacity="0.3"
               />
            ))}

            {/* The Approximated Curve */}
            <path
              d={pointsToPath(res.curvePoints)}
              fill="none"
              stroke={colors[res.method]}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ))}

        {/* User Data Points */}
        {points.map((p, i) => (
          <g key={i} transform={`translate(${p.x}, ${p.y})`} style={{ cursor: 'grab' }}>
             <circle
              r="12"
              fill="transparent"
              onMouseDown={(e) => handleMouseDown(e, i)}
              onTouchStart={(e) => handleMouseDown(e, i)}
            />
            <circle
              r="5"
              className={`${draggedIndex === i ? 'fill-emerald-500 scale-125' : 'fill-slate-800'} transition-all duration-150`}
              pointerEvents="none"
            />
            <text y="-10" textAnchor="middle" className="text-[10px] fill-slate-400 select-none pointer-events-none font-mono">
                p{i}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default DrawingCanvas;
