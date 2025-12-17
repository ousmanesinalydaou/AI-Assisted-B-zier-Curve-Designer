import React from 'react';
import { VisualizationMode, SurfaceData, Theme } from '../types';

interface RightPanelProps {
  visMode: VisualizationMode;
  setVisMode: (m: VisualizationMode) => void;
  surfaceData: SurfaceData | null;
  theme: Theme;
}

const RightPanel: React.FC<RightPanelProps> = ({ visMode, setVisMode, surfaceData, theme }) => {
  const isDark = theme === Theme.DARK;
  const headerClass = `text-[10px] font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-slate-400'}`;

  return (
    <div className={`h-full p-6 flex flex-col gap-8 custom-scrollbar overflow-y-auto ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
      
      {/* VISUALIZATION TOGGLES */}
      <section>
        <h3 className={headerClass}>Render Mode</h3>
        <div className="flex flex-col gap-2">
            {[
              { id: VisualizationMode.SOLID, label: 'Solid Surface', desc: 'Phong shaded geometry' },
              { id: VisualizationMode.HYBRID, label: 'Hybrid Mesh', desc: 'Surface + wireframe overlay' },
              { id: VisualizationMode.WIREFRAME, label: 'Wireframe', desc: 'Raw polygon structure' }
            ].map(m => (
                <button
                    key={m.id}
                    onClick={() => setVisMode(m.id)}
                    className={`text-left p-3 rounded-lg border transition-all duration-200 group ${
                        visMode === m.id
                        ? isDark ? 'bg-neutral-800 border-blue-500/50 shadow-lg shadow-blue-900/10' : 'bg-white border-blue-400 shadow-md shadow-blue-100'
                        : isDark ? 'bg-transparent border-neutral-800 hover:bg-neutral-800' : 'bg-transparent border-slate-200 hover:bg-white'
                    }`}
                >
                    <div className={`text-xs font-bold mb-0.5 ${visMode === m.id ? 'text-blue-500' : ''}`}>{m.label}</div>
                    <div className="text-[10px] opacity-60 font-medium">{m.desc}</div>
                </button>
            ))}
        </div>
      </section>

      {/* STATISTICS */}
      <section>
        <h3 className={headerClass}>Topology Stats</h3>
        {surfaceData ? (
          <div className={`grid grid-cols-2 gap-3 p-4 rounded-lg border ${isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
             <div>
                <div className="text-[10px] opacity-50 uppercase tracking-wider">Vertices</div>
                <div className="text-lg font-mono font-medium">{surfaceData.surfacePoints.length}</div>
             </div>
             <div>
                <div className="text-[10px] opacity-50 uppercase tracking-wider">Polygons</div>
                <div className="text-lg font-mono font-medium">{surfaceData.indices.length / 3}</div>
             </div>
             <div className="col-span-2 pt-2 border-t border-dashed border-opacity-20 border-gray-500">
                <div className="text-[10px] opacity-50 uppercase tracking-wider">Control Net</div>
                <div className="text-xs font-mono mt-1">
                    {surfaceData.controlPoints.length} (U) &times; {surfaceData.controlPoints[0]?.length || 0} (V)
                </div>
             </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg border border-dashed border-opacity-30 border-gray-500 text-center">
            <span className="text-xs opacity-50">No Surface Data</span>
          </div>
        )}
      </section>

      {/* INFO */}
      <section className="mt-auto">
        <div className={`p-4 rounded-lg text-[10px] leading-relaxed ${isDark ? 'bg-blue-900/20 text-blue-200' : 'bg-blue-50 text-blue-800'}`}>
            <strong className="block mb-1">Mathematical Note</strong>
            The surface is generated using Separable Least Squares approximation. The B-spline control net is computed first along U (rows), then along V (columns).
        </div>
      </section>

    </div>
  );
};

export default RightPanel;
