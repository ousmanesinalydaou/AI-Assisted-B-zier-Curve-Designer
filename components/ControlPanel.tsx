import React from 'react';
import { ParameterizationMethod, CurveResult } from '../types';

interface ControlPanelProps {
  degree: number;
  setDegree: (d: number) => void;
  selectedMethods: Set<ParameterizationMethod>;
  toggleMethod: (m: ParameterizationMethod) => void;
  clearPoints: () => void;
  pointsCount: number;
  showResiduals: boolean;
  setShowResiduals: (v: boolean) => void;
  showControlPolygon: boolean;
  setShowControlPolygon: (v: boolean) => void;
  loadPreset: (type: 'wing' | 'spiral' | 'wave') => void;
  results: CurveResult[];
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  degree,
  setDegree,
  selectedMethods,
  toggleMethod,
  clearPoints,
  pointsCount,
  showResiduals,
  setShowResiduals,
  showControlPolygon,
  setShowControlPolygon,
  loadPreset,
  results
}) => {
  return (
    <div className="w-full lg:w-96 bg-white border-l border-slate-200 p-6 flex flex-col gap-6 h-full overflow-y-auto shadow-2xl z-20 shrink-0">
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Curve Fitting</h1>
        <p className="text-sm text-slate-500 leading-snug">
          Compare <strong className="text-slate-700">Uniform</strong> vs <strong className="text-slate-700">Chord Length</strong> parameterization for Least Squares curve approximation.
        </p>
      </div>

      {/* Methods Selection */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Methods</h3>
        <div className="flex flex-col gap-2">
            <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedMethods.has(ParameterizationMethod.UNIFORM) ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'border-slate-200 hover:border-slate-300'}`}>
                <input 
                    type="checkbox" 
                    checked={selectedMethods.has(ParameterizationMethod.UNIFORM)}
                    onChange={() => toggleMethod(ParameterizationMethod.UNIFORM)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="font-semibold text-slate-800 text-sm">Uniform</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Parameters are spaced equally, regardless of physical distance.</p>
                </div>
            </label>

            <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedMethods.has(ParameterizationMethod.CHORD_LENGTH) ? 'bg-red-50 border-red-200 ring-1 ring-red-200' : 'border-slate-200 hover:border-slate-300'}`}>
                <input 
                    type="checkbox" 
                    checked={selectedMethods.has(ParameterizationMethod.CHORD_LENGTH)}
                    onChange={() => toggleMethod(ParameterizationMethod.CHORD_LENGTH)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="font-semibold text-slate-800 text-sm">Chord Length</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Parameters are proportional to the distance between points.</p>
                </div>
            </label>
        </div>
      </div>

      {/* Parameters */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Configuration</h3>
        
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-semibold text-slate-700">Polynomial Degree</label>
                <div className="text-xs font-mono bg-white border border-slate-200 px-2 py-1 rounded shadow-sm text-slate-700 min-w-[2rem] text-center">
                    {degree}
                </div>
            </div>
            <input 
                type="range" 
                min="1" 
                max="10" 
                value={degree}
                onChange={(e) => setDegree(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
            <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
                <span>1 (Linear)</span>
                <span>10 (High)</span>
            </div>
        </div>
      </div>

      {/* Analysis */}
      {results.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Error Analysis (SSE)</h3>
            <div className="bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                {results.map(res => (
                    <div key={res.method} className="flex justify-between items-center px-4 py-3 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${res.method === ParameterizationMethod.UNIFORM ? 'bg-blue-500' : 'bg-red-500'}`}></span>
                            <span className="text-sm font-medium text-slate-700">
                                {res.method === ParameterizationMethod.UNIFORM ? 'Uniform' : 'Chord Length'}
                            </span>
                        </div>
                        <span className="font-mono text-sm font-semibold text-slate-700">
                            {res.error.toFixed(1)}
                        </span>
                    </div>
                ))}
            </div>
          </div>
      )}

      {/* Visual Settings */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visualization</h3>
        <div className="grid grid-cols-2 gap-2">
            <button 
                onClick={() => setShowResiduals(!showResiduals)}
                className={`px-3 py-2 text-xs font-semibold rounded-md border transition-all ${showResiduals ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
                Show Residuals
            </button>
            <button 
                onClick={() => setShowControlPolygon(!showControlPolygon)}
                className={`px-3 py-2 text-xs font-semibold rounded-md border transition-all ${showControlPolygon ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
                Control Polygon
            </button>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto flex flex-col gap-4 pt-6 border-t border-slate-100">
        <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Load Preset</h3>
            <div className="grid grid-cols-3 gap-2">
                <button onClick={() => loadPreset('wave')} className="px-2 py-2 text-xs font-medium bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-600 hover:border-slate-300 transition-colors">Sine Wave</button>
                <button onClick={() => loadPreset('spiral')} className="px-2 py-2 text-xs font-medium bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-600 hover:border-slate-300 transition-colors">Spiral</button>
                <button onClick={() => loadPreset('wing')} className="px-2 py-2 text-xs font-medium bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-600 hover:border-slate-300 transition-colors">Airfoil</button>
            </div>
        </div>

        <button 
            onClick={clearPoints}
            className="w-full px-4 py-3 bg-white border border-red-100 text-red-600 font-medium rounded-xl hover:bg-red-50 hover:border-red-200 transition-all text-sm flex items-center justify-center gap-2 group"
        >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Canvas
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;