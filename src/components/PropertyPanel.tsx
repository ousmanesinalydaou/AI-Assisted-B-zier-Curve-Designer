import { Activity, Ruler, Sliders, TrendingUp, X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { CurveFitter } from '../algorithms/curveFitting';
import { useAppStore } from '../store/useAppStore';
import { glassMorphism } from '../styles/designSystem';
import { DraggablePanel } from './DraggablePanel';

export const PropertyPanel: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    selectedStroke,
    fittingOptions,
    renderOptions,
    theme,
    updateFittingOptions,
    clearSelection,
    strokes,
  } = useAppStore();

  const selectedStrokeData = strokes.find(s => s.id === selectedStroke);
  const curveData = selectedStrokeData?.fittedCurves[0];

  // Draw curvature graph
  useEffect(() => {
    if (!canvasRef.current || !curveData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const fitter = new CurveFitter(fittingOptions);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = theme === 'dark' ? '#1f2937' : '#f3f4f6';
    ctx.fillRect(0, 0, width, height);

    // Calculate curvature values
    const samples = 100;
    const curvatureData: number[] = [];
    let maxCurvature = 0;

    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const k = Math.abs(fitter.calculateCurvature(curveData, t));
      curvatureData.push(k);
      maxCurvature = Math.max(maxCurvature, k);
    }

    // Draw grid
    ctx.strokeStyle = theme === 'dark' ? '#374151' : '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = (i / 5) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw curvature curve
    ctx.strokeStyle = theme === 'dark' ? '#8b5cf6' : '#7c3aed';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i <= samples; i++) {
      const x = (i / samples) * width;
      const normalizedK = maxCurvature > 0 ? curvatureData[i] / maxCurvature : 0;
      const y = height - normalizedK * height * 0.9; // Leave 10% margin

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw axes labels
    ctx.fillStyle = theme === 'dark' ? '#9ca3af' : '#6b7280';
    ctx.font = '10px monospace';
    ctx.fillText('t=0', 5, height - 5);
    ctx.fillText('t=1', width - 25, height - 5);
    ctx.fillText(`κ=${maxCurvature.toFixed(2)}`, 5, 15);

  }, [curveData, theme, fittingOptions]);

  if (!selectedStroke || !selectedStrokeData) {
    return (
      <DraggablePanel
        className="top-4 right-4 w-80 p-5 rounded-2xl shadow-2xl backdrop-blur-md"
        style={glassMorphism(theme)}
        initialPosition={{ x: 0, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500">
            <Sliders size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg">Properties</span>
        </div>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          🖊️ Draw a curve or select an existing one to view properties and analytics
        </p>
      </DraggablePanel>
    );
  }

  const curve = selectedStrokeData.fittedCurves[0];

  return (
    <DraggablePanel 
      className="top-4 right-4 w-96 max-h-[85vh] overflow-y-auto p-5 rounded-2xl shadow-2xl backdrop-blur-md"
      style={glassMorphism(theme)}
      initialPosition={{ x: 0, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500">
            <Sliders size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg">Curve Properties</span>
        </div>
        <button
          onClick={clearSelection}
          className={`p-1.5 rounded-lg transition-all duration-300 hover:scale-110 ${
            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
          }`}
        >
          <X size={18} />
        </button>
      </div>

      {/* Curvature Analysis Graph */}
      {curve && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={18} className="text-purple-500" />
            <h3 className="font-semibold">Curvature Analysis</h3>
          </div>
          <canvas 
            ref={canvasRef}
            width={340}
            height={120}
            className="w-full rounded-lg border-2 border-purple-500/20"
          />
        </div>
      )}

      {/* Curve Statistics */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={18} className="text-cyan-500" />
          <h3 className="font-semibold">Statistics</h3>
        </div>
        <div className={`grid grid-cols-2 gap-3 text-sm ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <StatCard 
            label="Points" 
            value={selectedStrokeData.points.length} 
            theme={theme}
          />
          <StatCard 
            label="Curves" 
            value={selectedStrokeData.fittedCurves.length} 
            theme={theme}
          />
        </div>
      </div>

      {/* Control Points */}
      {curve && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Ruler size={18} className="text-pink-500" />
            <h3 className="font-semibold">Control Points</h3>
          </div>
          <div className="space-y-2 text-sm">
            <ControlPointRow label="P0" point={curve.p0} color="bg-green-500" theme={theme} />
            <ControlPointRow label="P1" point={curve.p1} color="bg-blue-500" theme={theme} />
            <ControlPointRow label="P2" point={curve.p2} color="bg-blue-500" theme={theme} />
            <ControlPointRow label="P3" point={curve.p3} color="bg-green-500" theme={theme} />
          </div>
        </div>
      )}

      {/* Fitting Parameters */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Fitting Parameters</h3>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Parameterization
            </label>
            <select
              value={fittingOptions.parameterization}
              onChange={(e) => updateFittingOptions({ 
                parameterization: e.target.value as 'uniform' | 'chord-length' | 'centripetal' 
              })}
              className={`w-full p-2 rounded border ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="uniform">Uniform</option>
              <option value="chord-length">Chord Length</option>
              <option value="centripetal">Centripetal</option>
            </select>
          </div>

          <div>
            <label 
              htmlFor="max-iterations-slider"
              className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Max Iterations: {fittingOptions.maxIterations}
            </label>
            <input
              id="max-iterations-slider"
              type="range"
              min="5"
              max="50"
              step="1"
              value={fittingOptions.maxIterations}
              onChange={(e) => updateFittingOptions({ maxIterations: parseInt(e.target.value) })}
              aria-label={`Max iterations: ${fittingOptions.maxIterations}`}
              className="w-full"
            />
          </div>

          <div>
            <label 
              htmlFor="tolerance-slider"
              className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Tolerance: {fittingOptions.tolerance.toFixed(4)}
            </label>
            <input
              id="tolerance-slider"
              type="range"
              min="0.0001"
              max="0.01"
              step="0.0001"
              value={fittingOptions.tolerance}
              onChange={(e) => updateFittingOptions({ tolerance: parseFloat(e.target.value) })}
              aria-label={`Tolerance: ${fittingOptions.tolerance.toFixed(4)}`}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <button className="w-full p-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg shadow-purple-500/30">
          Smooth Curvature (C²)
        </button>
        <button className="w-full p-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/30">
          Align Tangents (C¹)
        </button>
        <button className="w-full p-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white shadow-lg shadow-pink-500/30">
          Re-fit Curve
        </button>
      </div>
    </DraggablePanel>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  theme: 'light' | 'dark';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, theme }) => {
  return (
    <div className={`p-3 rounded-xl ${
      theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'
    }`}>
      <div className={`text-xs font-medium ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {label}
      </div>
      <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
        {value}
      </div>
    </div>
  );
};

interface ControlPointRowProps {
  label: string;
  point: { x: number; y: number };
  color: string;
  theme: 'light' | 'dark';
}

const ControlPointRow: React.FC<ControlPointRowProps> = ({ label, point, color, theme }) => {
  return (
    <div className={`flex items-center gap-3 p-2 rounded-lg ${
      theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'
    }`}>
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="font-mono font-semibold w-8">{label}:</span>
      <span className={`flex-1 font-mono text-xs ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>
        ({point.x.toFixed(1)}, {point.y.toFixed(1)})
      </span>
    </div>
  );
};