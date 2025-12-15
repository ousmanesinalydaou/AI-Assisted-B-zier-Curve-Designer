/**
 * 3D Surface Controls Panel
 * 
 * UI for creating and managing 3D surfaces from Bézier curves
 * 
 * Author: OUSMANE DAOU
 * Supervisor: Kunkli Roland Imre
 * University of Debrecen, Faculty of Informatics
 */

import {
    Box,
    Cylinder,
    Eye,
    Hexagon,
    Layers,
    Move3d,
    Sparkles,
    Trash2
} from 'lucide-react';
import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { SurfaceType } from '../types';

export const SurfaceControlPanel: React.FC = () => {
  const {
    theme,
    strokes,
    surfaces,
    selectedStroke,
    selectedSurface,
    surfaceMode,
    show3DPanel,
    createSurface,
    deleteSurface,
    selectSurface,
    setSurfaceMode,
    toggle3DView,
  } = useAppStore();

  // Hooks must be called before any conditional returns
  const [resolution, setResolution] = useState(32);
  const [rotationSteps, setRotationSteps] = useState(32);
  const [axis, setAxis] = useState<'x' | 'y' | 'z'>('y');
  const [radius, setRadius] = useState(5);

  // Don't render if panel is hidden
  if (!show3DPanel) return null;

  const surfaceTypes: { type: SurfaceType; label: string; icon: React.ReactNode; description: string; minStrokes: number }[] = [
    {
      type: 'revolution',
      label: 'Surface of Revolution',
      icon: <Cylinder size={20} />,
      description: 'Rotate curve around axis',
      minStrokes: 1,
    },
    {
      type: 'vase',
      label: 'Vase Shape',
      icon: <Hexagon size={20} />,
      description: 'Create vase-like object',
      minStrokes: 1,
    },
    {
      type: 'tube',
      label: 'Tube/Pipe',
      icon: <Move3d size={20} />,
      description: 'Extrude as circular tube',
      minStrokes: 1,
    },
    {
      type: 'patch',
      label: 'Bézier Patch',
      icon: <Box size={20} />,
      description: 'Create bicubic patch (needs 4 curves)',
      minStrokes: 4,
    },
    {
      type: 'loft',
      label: 'Lofted Surface',
      icon: <Layers size={20} />,
      description: 'Surface between curves',
      minStrokes: 2,
    },
    {
      type: 'extrusion',
      label: 'Extrusion',
      icon: <Sparkles size={20} />,
      description: 'Sweep along path (needs 2 curves)',
      minStrokes: 2,
    },
  ];

  const handleCreateSurface = (type: SurfaceType, minStrokes: number) => {
    // Check if we have enough strokes
    if (strokes.length < minStrokes) {
      alert(`This surface type requires at least ${minStrokes} curve(s). Please draw more curves.`);
      return;
    }

    // Filter strokes that have fitted curves
    const fittedStrokes = strokes.filter(s => s.fittedCurves && s.fittedCurves.length > 0);
    
    if (fittedStrokes.length === 0) {
      alert('Please fit curves first! Draw some curves and click the "Fit Curve" button.');
      return;
    }

    if (fittedStrokes.length < minStrokes) {
      alert(`This surface type requires at least ${minStrokes} fitted curve(s). You have ${fittedStrokes.length}. Please fit more curves.`);
      return;
    }

    // For surfaces needing multiple strokes, always use the last N fitted strokes
    // For single-stroke surfaces, use selected if available
    let strokeIds: string[];
    if (minStrokes === 1 && selectedStroke) {
      const selected = strokes.find(s => s.id === selectedStroke);
      if (selected && selected.fittedCurves && selected.fittedCurves.length > 0) {
        strokeIds = [selectedStroke];
      } else {
        strokeIds = fittedStrokes.slice(-minStrokes).map(s => s.id);
      }
    } else {
      strokeIds = fittedStrokes.slice(-minStrokes).map(s => s.id);
    }

    createSurface(type, strokeIds, {
      resolution,
      rotationSteps,
      axis,
      radius,
    });

    // Open 3D viewer
    if (!useAppStore.getState().show3DView) {
      toggle3DView();
    }
  };

  const canCreate = strokes.length > 0;

  return (
    <div
      className={`fixed right-4 top-20 w-80 p-4 rounded-xl shadow-xl ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700 text-white'
          : 'bg-white border-gray-200 text-gray-900'
      } border`}
      style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Box size={20} />
        3D Surface Generator
      </h3>

      {/* Settings */}
      <div className="mb-4 space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Resolution: {resolution}
          </label>
          <input
            type="range"
            min="8"
            max="64"
            step="4"
            value={resolution}
            onChange={(e) => setResolution(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Fast</span>
            <span>Quality</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Rotation Steps: {rotationSteps}
          </label>
          <input
            type="range"
            min="8"
            max="64"
            step="4"
            value={rotationSteps}
            onChange={(e) => setRotationSteps(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rotation Axis:</label>
          <div className="flex gap-2">
            {(['x', 'y', 'z'] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAxis(a)}
                className={`flex-1 py-1 px-2 rounded text-sm font-medium transition-colors ${
                  axis === a
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {a.toUpperCase()}-Axis
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Tube Radius: {radius}
          </label>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Surface Types */}
      <div className="space-y-2 mb-4">
        <h4 className="text-sm font-semibold mb-2">Create Surface:</h4>
        {surfaceTypes.map(({ type, label, icon, description, minStrokes }) => {
          const fittedStrokes = strokes.filter(s => s.fittedCurves && s.fittedCurves.length > 0);
          const hasEnoughFittedStrokes = fittedStrokes.length >= minStrokes;
          const hasEnoughStrokes = strokes.length >= minStrokes;
          
          return (
            <button
              key={type}
              onClick={() => handleCreateSurface(type, minStrokes)}
              disabled={!canCreate || !hasEnoughFittedStrokes}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                surfaceMode === type
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : !hasEnoughFittedStrokes
                    ? theme === 'dark'
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">{icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs opacity-75 mt-1">{description}</div>
                  {!hasEnoughStrokes && (
                    <div className="text-xs text-red-400 mt-1">
                      Needs {minStrokes} curve{minStrokes > 1 ? 's' : ''} (have {strokes.length})
                    </div>
                  )}
                  {hasEnoughStrokes && !hasEnoughFittedStrokes && (
                    <div className="text-xs text-yellow-400 mt-1">
                      Needs {minStrokes} fitted curve{minStrokes > 1 ? 's' : ''} (have {fittedStrokes.length} fitted)
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Generated Surfaces List */}
      {surfaces.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-semibold mb-2">Generated Surfaces:</h4>
          <div className="space-y-2">
            {surfaces.map((surface) => (
              <div
                key={surface.id}
                className={`p-2 rounded flex items-center justify-between ${
                  selectedSurface === surface.id
                    ? theme === 'dark'
                      ? 'bg-blue-600'
                      : 'bg-blue-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700'
                      : 'bg-gray-100'
                }`}
              >
                <button
                  onClick={() => {
                    selectSurface(surface.id);
                    if (!useAppStore.getState().show3DView) {
                      toggle3DView();
                    }
                  }}
                  className="flex-1 text-left text-sm flex items-center gap-2"
                >
                  <Eye size={16} />
                  {surface.type} ({new Date(surface.timestamp).toLocaleTimeString()})
                </button>
                <button
                  onClick={() => deleteSurface(surface.id)}
                  className="p-1 rounded hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div
        className={`mt-4 p-3 rounded text-xs ${
          theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-blue-50 text-blue-800'
        }`}
      >
        <p className="font-semibold mb-1">💡 How to use:</p>
        <ol className="list-decimal list-inside space-y-1 mt-2">
          <li>Draw curves on the canvas</li>
          <li>Click "Fit Curve" button for each curve</li>
          <li>Adjust settings above (resolution, axis, etc.)</li>
          <li>Click a surface type button to generate 3D</li>
        </ol>
      </div>

      {/* View 3D Button */}
      {surfaces.length > 0 && (
        <button
          onClick={toggle3DView}
          className={`w-full mt-4 py-3 rounded-lg font-medium transition-colors ${
            theme === 'dark'
              ? 'bg-green-600 hover:bg-green-500 text-white'
              : 'bg-green-500 hover:bg-green-400 text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Box size={20} />
            {useAppStore.getState().show3DView ? 'Close' : 'Open'} 3D Viewer
          </div>
        </button>
      )}
    </div>
  );
};
