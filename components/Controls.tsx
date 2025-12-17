import React from 'react';
import { GeneratorParams, CurveType, InputMode, Parameterization, Theme } from '../types';
import DrawingCanvas from './DrawingCanvas';
import { Point3D } from '../types';
import { motion } from 'framer-motion';

interface ControlsProps {
  params: GeneratorParams;
  setParams: React.Dispatch<React.SetStateAction<GeneratorParams>>;
  drawnCurves: Point3D[][];
  setDrawnCurves: React.Dispatch<React.SetStateAction<Point3D[][]>>;
  activeCurveIndex: number;
  setActiveCurveIndex: React.Dispatch<React.SetStateAction<number>>;
  theme: Theme;
}

const Controls: React.FC<ControlsProps> = ({ 
  params, 
  setParams,
  drawnCurves,
  setDrawnCurves,
  activeCurveIndex,
  setActiveCurveIndex,
  theme
}) => {
  const isDark = theme === Theme.DARK;
  
  const handleChange = (key: keyof GeneratorParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const addNewCurve = () => {
    setDrawnCurves(prev => [...prev, []]);
    setActiveCurveIndex(drawnCurves.length);
  };

  const clearCurrentCurve = () => {
    const newCurves = [...drawnCurves];
    newCurves[activeCurveIndex] = [];
    setDrawnCurves(newCurves);
  };

  const deleteCurrentCurve = () => {
    if (drawnCurves.length <= 1) return;
    const newCurves = drawnCurves.filter((_, i) => i !== activeCurveIndex);
    setDrawnCurves(newCurves);
    setActiveCurveIndex(prev => Math.max(0, prev - 1));
  };

  const containerClass = `h-full overflow-y-auto custom-scrollbar p-6 space-y-8 ${isDark ? 'text-gray-300' : 'text-slate-700'}`;
  
  const sectionHeaderClass = `text-xs font-bold uppercase tracking-[0.2em] mb-4 pb-2 border-b ${
    isDark ? 'text-blue-400 border-neutral-800' : 'text-blue-600 border-slate-200'
  }`;

  const btnClass = (active: boolean) => `flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-200 ${
    active 
      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
      : isDark 
        ? 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white' 
        : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
  }`;

  return (
    <div className={containerClass}>
      
      {/* INPUT MODE */}
      <section>
        <h3 className={sectionHeaderClass}>Input Mode</h3>
        <div className={`p-1 rounded-lg flex gap-1 ${isDark ? 'bg-neutral-900' : 'bg-slate-100'}`}>
          <button
            onClick={() => handleChange('mode', InputMode.PRESET)}
            className={btnClass(params.mode === InputMode.PRESET)}
          >
            Preset
          </button>
          <button
            onClick={() => handleChange('mode', InputMode.DRAWN)}
            className={btnClass(params.mode === InputMode.DRAWN)}
          >
            Drawn
          </button>
        </div>
      </section>

      {/* DYNAMIC CONTENT */}
      {params.mode === InputMode.PRESET ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Curve Shape</label>
            <select 
              value={params.curveType}
              onChange={(e) => handleChange('curveType', e.target.value)}
              className={`w-full p-2.5 rounded-lg text-xs font-medium outline-none border transition-colors ${
                isDark 
                  ? 'bg-neutral-800 border-neutral-700 text-white focus:border-blue-500' 
                  : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500 shadow-sm'
              }`}
            >
              <option value={CurveType.SINE_WAVE}>Sine Wave Stack</option>
              <option value={CurveType.AIRFOIL}>Airfoil Stack</option>
              <option value={CurveType.SPIRAL}>Twisted Spiral</option>
            </select>
          </div>

          <div className="space-y-5">
            <ControlSlider 
              label="Curve Count" value={params.numCurves} min={3} max={20} step={1}
              onChange={(v) => handleChange('numCurves', v)} isDark={isDark}
            />
            <ControlSlider 
              label="Samples / Curve" value={params.pointsPerCurve} min={10} max={100} step={5}
              onChange={(v) => handleChange('pointsPerCurve', v)} isDark={isDark}
            />
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
          <div className="aspect-square w-full shadow-lg rounded-lg overflow-hidden">
            <DrawingCanvas 
              activeCurveIndex={activeCurveIndex}
              curves={drawnCurves}
              onChange={setDrawnCurves}
              uDegree={params.uDegree}
              uControlPoints={params.uControlPoints}
              parameterization={params.parameterization}
              theme={theme}
            />
          </div>
          
          <div className="flex items-center justify-between gap-3 bg-opacity-50 p-2 rounded-lg border border-transparent">
            <button onClick={() => setActiveCurveIndex(Math.max(0, activeCurveIndex - 1))} className={`p-2 rounded hover:bg-opacity-10 ${isDark ? 'hover:bg-white text-gray-400' : 'hover:bg-black text-slate-500'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
             <span className="text-xs font-mono font-bold">
               {activeCurveIndex + 1} <span className="opacity-40">/</span> {drawnCurves.length}
             </span>
            <button onClick={() => setActiveCurveIndex(Math.min(drawnCurves.length - 1, activeCurveIndex + 1))} className={`p-2 rounded hover:bg-opacity-10 ${isDark ? 'hover:bg-white text-gray-400' : 'hover:bg-black text-slate-500'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={addNewCurve} className="col-span-2 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs uppercase tracking-wide transition-colors">
              Add Slice
            </button>
            <button onClick={clearCurrentCurve} className={`py-1.5 border rounded text-[10px] uppercase font-bold transition-colors ${
                isDark ? 'border-neutral-700 hover:bg-neutral-800' : 'border-slate-300 hover:bg-slate-50'
            }`}>
              Clear
            </button>
            <button onClick={deleteCurrentCurve} className={`py-1.5 border rounded text-[10px] uppercase font-bold transition-colors text-red-500 ${
                isDark ? 'border-neutral-700 hover:bg-neutral-800' : 'border-slate-300 hover:bg-slate-50'
            }`}>
              Delete
            </button>
          </div>
        </motion.div>
      )}

      {/* STACKING & PARAMETERIZATION */}
      <section>
        <h3 className={sectionHeaderClass}>Geometry Config</h3>
        <div className="space-y-5">
            <ControlSlider 
              label="Stack Spacing" value={params.stackSpacing} min={0.5} max={5.0} step={0.1}
              onChange={(v) => handleChange('stackSpacing', v)} isDark={isDark}
            />
            
            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Parameterization</label>
                <div className="flex gap-2">
                    {[Parameterization.UNIFORM, Parameterization.CHORD_LENGTH].map(p => (
                        <button
                            key={p}
                            onClick={() => handleChange('parameterization', p)}
                            className={`flex-1 py-1.5 px-2 rounded text-[10px] uppercase font-bold border transition-all ${
                                params.parameterization === p 
                                ? 'border-blue-500 bg-blue-500/10 text-blue-500' 
                                : isDark ? 'border-neutral-700 bg-neutral-800 text-gray-500' : 'border-slate-200 bg-white text-slate-400'
                            }`}
                        >
                            {p === Parameterization.UNIFORM ? 'Uniform' : 'Chord'}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* APPROXIMATION */}
      <section>
        <h3 className={sectionHeaderClass}>Approximation</h3>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">U Degree</label>
                <select 
                    value={params.uDegree}
                    onChange={(e) => handleChange('uDegree', parseInt(e.target.value))}
                    className={`w-full p-1.5 rounded text-[10px] font-mono outline-none border ${
                        isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-slate-200'
                    }`}
                >
                    <option value={1}>1 (Linear)</option>
                    <option value={2}>2 (Quad)</option>
                    <option value={3}>3 (Cubic)</option>
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">V Degree</label>
                <select 
                    value={params.vDegree}
                    onChange={(e) => handleChange('vDegree', parseInt(e.target.value))}
                    className={`w-full p-1.5 rounded text-[10px] font-mono outline-none border ${
                        isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-slate-200'
                    }`}
                >
                    <option value={1}>1 (Linear)</option>
                    <option value={2}>2 (Quad)</option>
                    <option value={3}>3 (Cubic)</option>
                </select>
            </div>
          </div>
          
          <ControlSlider 
            label="U Control Pts" value={params.uControlPoints} min={params.uDegree + 1} max={20} step={1}
            onChange={(v) => handleChange('uControlPoints', v)} highlight isDark={isDark}
          />

          <ControlSlider 
            label="V Control Pts" value={params.vControlPoints} min={params.vDegree + 1} max={20} step={1}
            onChange={(v) => handleChange('vControlPoints', v)} isDark={isDark}
          />
        </div>
      </section>
    </div>
  );
};

const ControlSlider = ({ label, value, min, max, step, onChange, highlight = false, isDark }: any) => (
  <div className="group">
    <div className="flex justify-between mb-2 items-center">
      <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${highlight ? 'text-blue-500' : 'opacity-60'}`}>{label}</span>
      <span className={`font-mono text-xs ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{value.toFixed(Number.isInteger(step) ? 0 : 1)}</span>
    </div>
    <div className="relative h-1.5 w-full rounded-full bg-opacity-20 bg-gray-500">
      <input 
        type="range" min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div 
        className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-75"
        style={{ width: `${((value - min) / (max - min)) * 100}%` }}
      />
      <div 
        className={`absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full shadow transition-all duration-75 pointer-events-none ${isDark ? 'bg-white' : 'bg-white border border-slate-200'}`}
        style={{ left: `${((value - min) / (max - min)) * 100}%` }}
      />
    </div>
  </div>
);

export default Controls;
