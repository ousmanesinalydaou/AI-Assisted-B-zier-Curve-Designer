import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Viewer3D from './components/Viewer3D';
import Controls from './components/Controls';
import RightPanel from './components/RightPanel';
import { CurveType, GeneratorParams, VisualizationMode, InputMode, Point3D, Parameterization, Theme } from './types';
import { generateStackedCurves } from './services/dataGenerator';
import { generateCompositeSurface } from './services/surfaceEngine';

const App: React.FC = () => {
  // --- STATE ---
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Sidebar Visibility State
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  // Detect desktop vs mobile for initial render to avoid layout shifts
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true);

  const [params, setParams] = useState<GeneratorParams>({
    mode: InputMode.PRESET,
    curveType: CurveType.SINE_WAVE,
    parameterization: Parameterization.UNIFORM,
    numCurves: 6,
    pointsPerCurve: 30,
    stackSpacing: 2.0,
    uDegree: 3,
    vDegree: 3,
    uControlPoints: 8,
    vControlPoints: 4
  });

  const [visMode, setVisMode] = useState<VisualizationMode>(VisualizationMode.HYBRID);
  const [drawnCurves, setDrawnCurves] = useState<Point3D[][]>([[]]); 
  const [activeCurveIndex, setActiveCurveIndex] = useState(0);

  // --- LOGIC ---
  
  // Resize Listener for Responsive Layout Logic
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeInputCurves = useMemo(() => {
    if (params.mode === InputMode.PRESET) {
      return generateStackedCurves(
        params.curveType,
        params.numCurves,
        params.pointsPerCurve,
        params.stackSpacing
      );
    } else {
      const num = drawnCurves.length;
      return drawnCurves.map((curve, index) => {
        const z = index * params.stackSpacing - ((num - 1) * params.stackSpacing) / 2;
        return curve.map(p => ({ x: p.x, y: p.y, z }));
      });
    }
  }, [params, drawnCurves]);

  const surfaceData = useMemo(() => {
    try {
      if (activeInputCurves.length < 2) return null;
      if (activeInputCurves.some(c => c.length < 2)) return null;

      return generateCompositeSurface(
        activeInputCurves,
        params.uDegree,
        params.vDegree,
        params.uControlPoints,
        params.vControlPoints,
        params.parameterization
      );
    } catch (e) {
      return null;
    }
  }, [activeInputCurves, params]);

  // --- HANDLERS ---
  const toggleTheme = () => {
      setTheme(t => t === Theme.DARK ? Theme.LIGHT : Theme.DARK);
  };
  
  const isDark = theme === Theme.DARK;

  // --- RENDER ---
  return (
    <div className={`${isDark ? 'dark' : ''} h-screen w-screen overflow-hidden transition-colors duration-500`}>
      <div className="h-full w-full flex flex-col md:flex-row bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-gray-100 font-sans">
        
        {/* HEADER (Mobile Only) */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md z-50">
           <h1 className="text-sm font-bold tracking-widest uppercase">CurveStack</h1>
           <div className="flex gap-4">
             <button onClick={toggleTheme} className="p-1">
               {isDark ? '☀️' : '🌙'}
             </button>
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1">
               <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
             </button>
           </div>
        </header>

        {/* LEFT PANEL (Controls) */}
        <motion.aside 
            initial={false}
            animate={isDesktop 
              ? { width: isLeftPanelOpen ? 320 : 0, x: 0, opacity: 1 } 
              : { width: 320, x: isMobileMenuOpen ? 0 : '-100%', opacity: 1 }
            }
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`
                fixed inset-y-0 left-0 z-40 shadow-2xl md:shadow-none
                flex flex-col border-r border-light-border dark:border-dark-border
                bg-light-panel dark:bg-dark-panel glass-panel
                overflow-hidden
                ${isDesktop ? 'relative' : ''}
            `}
        >
            <div className="w-[320px] h-full flex flex-col">
                <div className="p-6 border-b border-light-border dark:border-dark-border flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-display font-bold tracking-tight bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                            CurveStack
                        </h1>
                        <p className="text-[10px] font-mono opacity-50 uppercase mt-1">Surface Modeler v2.1</p>
                    </div>
                    {/* Desktop Theme Toggle */}
                    <button onClick={toggleTheme} className="hidden md:block p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        {isDark ? '☀️' : '🌙'}
                    </button>
                </div>

                <Controls 
                    params={params} setParams={setParams}
                    drawnCurves={drawnCurves} setDrawnCurves={setDrawnCurves}
                    activeCurveIndex={activeCurveIndex} setActiveCurveIndex={setActiveCurveIndex}
                    theme={theme}
                />
            </div>
        </motion.aside>

        {/* CENTER (Viewer) */}
        <main className="flex-1 relative z-0 flex flex-col min-w-0">
            {/* Desktop Toggle Button */}
            <button
                onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
                className={`
                    absolute top-4 left-4 z-50 p-2 rounded-lg 
                    bg-white/50 dark:bg-black/40 backdrop-blur-md 
                    border border-light-border dark:border-dark-border
                    text-gray-700 dark:text-gray-200
                    hover:bg-white/80 dark:hover:bg-black/60
                    transition-all duration-200
                    hidden md:flex items-center justify-center
                    shadow-sm group
                `}
                title={isLeftPanelOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
                <svg 
                    width="20" height="20" viewBox="0 0 24 24" 
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="transform transition-transform group-hover:scale-110"
                >
                   <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                   <line x1="9" y1="3" x2="9" y2="21" />
                   {/* Arrow indicator */}
                   {isLeftPanelOpen 
                     ? <path d="M14 12l-2 0m-2 0l2-2m-2 2l2 2" className="opacity-0 group-hover:opacity-100" /> 
                     : <path d="M12 12l2 0m2 0l-2-2m2 2l-2 2" className="opacity-0 group-hover:opacity-100" />
                   }
                </svg>
            </button>

            <Viewer3D 
                surfaceData={surfaceData} 
                inputCurves={activeInputCurves} 
                mode={visMode} 
                theme={theme}
            />
            
            {/* Overlay Gradient for depth */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,var(--tw-gradient-stops))] from-transparent via-transparent to-light-bg/20 dark:to-dark-bg/80"></div>
        </main>

        {/* RIGHT PANEL (Visualization) */}
        <aside className="hidden lg:block w-[280px] border-l border-light-border dark:border-dark-border bg-light-panel dark:bg-dark-panel glass-panel z-10">
            <RightPanel 
                visMode={visMode} 
                setVisMode={setVisMode} 
                surfaceData={surfaceData}
                theme={theme}
            />
        </aside>

        {/* Mobile Overlay for Menu */}
        {isMobileMenuOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                onClick={() => setIsMobileMenuOpen(false)}
            />
        )}
      </div>
    </div>
  );
};

export default App;