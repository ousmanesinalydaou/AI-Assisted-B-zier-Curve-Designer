import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Sliders, X } from 'lucide-react';

export const PropertyPanel: React.FC = () => {
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

  if (!selectedStroke || !selectedStrokeData) {
    return (
      <div className={`fixed top-4 right-4 w-80 p-4 rounded-xl shadow-lg ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
      } border`}>
        <div className="flex items-center gap-2 mb-4">
          <Sliders size={20} />
          <span className="font-medium">Properties</span>
        </div>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Draw a curve or select an existing one to view properties
        </p>
      </div>
    );
  }

  const curve = selectedStrokeData.fittedCurves[0];

  return (
    <div className={`fixed top-4 right-4 w-80 p-4 rounded-xl shadow-lg ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700 text-white' 
        : 'bg-white border-gray-200 text-gray-900'
    } border`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sliders size={20} />
          <span className="font-medium">Curve Properties</span>
        </div>
        <button
          onClick={clearSelection}
          className={`p-1 rounded hover:bg-opacity-10 hover:bg-gray-500`}
        >
          <X size={16} />
        </button>
      </div>

      {/* Curve Information */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Curve Information</h3>
        <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          <div>Original Points: {selectedStrokeData.points.length}</div>
          <div>Fitted Curves: {selectedStrokeData.fittedCurves.length}</div>
          {curve && (
            <>
              <div>P0: ({curve.p0.x.toFixed(1)}, {curve.p0.y.toFixed(1)})</div>
              <div>P1: ({curve.p1.x.toFixed(1)}, {curve.p1.y.toFixed(1)})</div>
              <div>P2: ({curve.p2.x.toFixed(1)}, {curve.p2.y.toFixed(1)})</div>
              <div>P3: ({curve.p3.x.toFixed(1)}, {curve.p3.y.toFixed(1)})</div>
            </>
          )}
        </div>
      </div>

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
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Max Iterations: {fittingOptions.maxIterations}
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={fittingOptions.maxIterations}
              onChange={(e) => updateFittingOptions({ maxIterations: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Tolerance: {fittingOptions.tolerance.toFixed(4)}
            </label>
            <input
              type="range"
              min="0.0001"
              max="0.01"
              step="0.0001"
              value={fittingOptions.tolerance}
              onChange={(e) => updateFittingOptions({ tolerance: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h3 className="font-medium mb-2">Quick Actions</h3>
        <button className={`w-full p-2 rounded text-sm ${
          theme === 'dark' 
            ? 'bg-blue-600 hover:bg-blue-500 text-white' 
            : 'bg-blue-500 hover:bg-blue-400 text-white'
        }`}>
          Smooth Curvature (C²)
        </button>
        <button className={`w-full p-2 rounded text-sm ${
          theme === 'dark' 
            ? 'bg-green-600 hover:bg-green-500 text-white' 
            : 'bg-green-500 hover:bg-green-400 text-white'
        }`}>
          Align Tangents (C¹)
        </button>
        <button className={`w-full p-2 rounded text-sm ${
          theme === 'dark' 
            ? 'bg-orange-600 hover:bg-orange-500 text-white' 
            : 'bg-orange-500 hover:bg-orange-400 text-white'
        }`}>
          Re-fit Curve
        </button>
      </div>
    </div>
  );
};