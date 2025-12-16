import React, { useState, useMemo } from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import ControlPanel from './components/ControlPanel';
import { Point, ParameterizationMethod, CurveResult } from './types';
import { approximateCurve, generateCurvePoints, calculateResiduals } from './utils/cagdUtils';

const App: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [degree, setDegree] = useState<number>(3);
  const [selectedMethods, setSelectedMethods] = useState<Set<ParameterizationMethod>>(
    new Set([ParameterizationMethod.UNIFORM, ParameterizationMethod.CHORD_LENGTH])
  );
  const [showResiduals, setShowResiduals] = useState(false);
  const [showControlPolygon, setShowControlPolygon] = useState(false);

  // Calculate curves whenever inputs change
  const results: CurveResult[] = useMemo(() => {
    if (points.length < 2) return [];

    const res: CurveResult[] = [];
    selectedMethods.forEach(method => {
      // Degree cannot exceed n-1 for proper fitting in this implementation context, 
      // or at least we clamp it to avoid singular matrices in basic solvers if points < degree + 1.
      // For approximation we usually want degree < points.length - 1
      const effectiveDegree = Math.min(degree, Math.max(1, points.length - 1));
      
      const approximation = approximateCurve(points, effectiveDegree, method);
      if (approximation) {
        const curvePoints = generateCurvePoints(approximation.controlPoints);
        const residuals = calculateResiduals(points, approximation.controlPoints, method);
        res.push({
          method,
          controlPoints: approximation.controlPoints,
          curvePoints,
          residuals,
          error: approximation.error
        });
      }
    });
    return res;
  }, [points, degree, selectedMethods]);

  const loadPreset = (type: 'wing' | 'spiral' | 'wave') => {
      let newPoints: Point[] = [];
      // Assume a default canvas size for presets relative placement
      // Ideally we would measure the canvas, but hardcoded offsets work for this demo
      const cx = 400; 
      const cy = 300;
      
      if (type === 'wave') {
          for(let i=0; i<12; i++) {
              newPoints.push({
                  x: 100 + (i * 60),
                  y: cy + Math.sin(i * 0.8) * 120
              });
          }
      } else if (type === 'spiral') {
          for(let i=0; i<20; i++) {
              const angle = i * 0.5;
              const r = 10 + i * 15;
              newPoints.push({
                  x: cx + Math.cos(angle) * r,
                  y: cy + Math.sin(angle) * r
              });
          }
      } else if (type === 'wing') {
           // Airfoil-ish shape
           for(let i=0; i<=8; i++) {
               const t = i/8;
               newPoints.push({ x: 150 + t*500, y: cy - (Math.sin(t*Math.PI)*100) });
           }
           for(let i=1; i<8; i++) {
                const t = i/8;
                newPoints.push({ x: 650 - t*500, y: cy + (Math.sin(t*Math.PI)*40) });
           }
      }
      setPoints(newPoints);
  }

  const toggleMethod = (m: ParameterizationMethod) => {
    const newSet = new Set(selectedMethods);
    if (newSet.has(m)) newSet.delete(m);
    else newSet.add(m);
    setSelectedMethods(newSet);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-slate-50 overflow-hidden font-sans">
      {/* Main Canvas Area */}
      <div className="flex-1 p-4 h-[60vh] lg:h-full relative order-2 lg:order-1">
        <DrawingCanvas 
            points={points} 
            setPoints={setPoints} 
            results={results}
            showResiduals={showResiduals}
            showControlPolygon={showControlPolygon}
        />
        
        {/* Helper Overlay */}
        {points.length < 2 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-sm px-8 py-6 rounded-2xl shadow-xl border border-slate-200 text-slate-500 text-center max-w-sm">
                    <div className="mb-3 text-blue-500">
                        <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </div>
                    <h2 className="font-bold text-slate-800 text-lg mb-2">Interactive Curve Fitting</h2>
                    <p className="text-sm leading-relaxed">
                        Click on the grid to place points. The app will fit a Bezier curve to your data using Least Squares Approximation.
                    </p>
                </div>
            </div>
        )}
      </div>

      {/* Sidebar Controls */}
      <div className="h-[40vh] lg:h-full order-1 lg:order-2">
        <ControlPanel 
            degree={degree}
            setDegree={setDegree}
            selectedMethods={selectedMethods}
            toggleMethod={toggleMethod}
            clearPoints={() => setPoints([])}
            pointsCount={points.length}
            showResiduals={showResiduals}
            setShowResiduals={setShowResiduals}
            showControlPolygon={showControlPolygon}
            setShowControlPolygon={setShowControlPolygon}
            loadPreset={loadPreset}
            results={results}
        />
      </div>
    </div>
  );
};

export default App;