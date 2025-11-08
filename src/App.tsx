import { FileDown, FolderOpen, HelpCircle, Sparkles, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient } from './api/client';
import { AIPanel } from './components/AIPanel';
import { ExportModal } from './components/ExportModal';
import { ProjectBrowser } from './components/ProjectBrowser';
import { PropertyPanel } from './components/PropertyPanel';
import { Toolbar } from './components/Toolbar';
import { TutorialModal } from './components/TutorialModal';
import { WebGLCanvas } from './components/WebGLCanvas';
import { useAppStore } from './store/useAppStore';
import { geometricPatterns, glassMorphism } from './styles/designSystem';

function App() {
  const { 
    theme, 
    showAIPanel, 
    toggleAIPanel, 
    toggleTheme,
    toggleControlPoints,
    toggleCurvature,
    toggleGrid,
    toggleSnapToGrid,
    toggleMeasurements,
    toggleSelectMode,
    clearCanvas,
    clearSelection,
    strokes,
    selectedStroke,
    saveProject,
    undo,
    redo,
    duplicateStroke,
  } = useAppStore();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showProjectBrowser, setShowProjectBrowser] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save functionality
  useEffect(() => {
    if (strokes.length === 0) return;

    const autoSaveInterval = setInterval(async () => {
      try {
        setAutoSaveStatus('saving');
        const projectData = saveProject();
        
        // Save to backend
        await apiClient.saveProject(
          `Auto-save ${new Date().toLocaleString()}`,
          JSON.parse(projectData).strokes,
          'Automatically saved project'
        );
        
        setAutoSaveStatus('saved');
        setLastSaved(new Date());
        
        // Reset to idle after 2 seconds
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setAutoSaveStatus('idle');
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [strokes, saveProject]);

  // Show tutorial on first visit
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('bezier-tutorial-seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      localStorage.setItem('bezier-tutorial-seen', 'true');
    }
    
    // Simulate initial load
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  // Keyboard navigation for modals (Escape key)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Close modals with Escape
      if (event.key === 'Escape') {
        if (showExportModal) {
          setShowExportModal(false);
        } else if (showProjectBrowser) {
          setShowProjectBrowser(false);
        } else if (showTutorial) {
          setShowTutorial(false);
        } else if (showAIPanel) {
          toggleAIPanel();
        } else {
          // Clear selection if nothing else to close
          clearSelection();
        }
        return;
      }

      // Prevent shortcuts when typing in inputs
      if ((event.target as HTMLElement).tagName === 'INPUT' || 
          (event.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      // Keyboard shortcuts
      const key = event.key.toLowerCase();
      
      // T - Toggle theme
      if (key === 't') {
        toggleTheme();
      }
      // V - Toggle select/draw mode
      else if (key === 'v') {
        toggleSelectMode();
      }
      // C - Toggle control points
      else if (key === 'c') {
        toggleControlPoints();
      }
      // K - Toggle curvature
      else if (key === 'k') {
        toggleCurvature();
      }
      // G - Toggle grid
      else if (key === 'g') {
        toggleGrid();
      }
      // M - Toggle snap to grid
      else if (key === 'm') {
        toggleSnapToGrid();
      }
      // R - Toggle measurements
      else if (key === 'r') {
        toggleMeasurements();
      }
      // Ctrl+Z - Undo
      else if (event.ctrlKey && key === 'z') {
        event.preventDefault();
        undo();
      }
      // Ctrl+Y - Redo
      else if (event.ctrlKey && key === 'y') {
        event.preventDefault();
        redo();
      }
      // Ctrl+D - Duplicate
      else if (event.ctrlKey && key === 'd') {
        event.preventDefault();
        if (selectedStroke) {
          duplicateStroke(selectedStroke);
        }
      }
      // Delete/Backspace - Clear canvas
      else if (key === 'delete' || (key === 'backspace' && event.ctrlKey)) {
        if (confirm('Clear entire canvas?')) {
          clearCanvas();
        }
      }
      // Ctrl+S - Save project
      else if (event.ctrlKey && key === 's') {
        event.preventDefault();
        const data = saveProject();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bezier-project-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    showExportModal, 
    showProjectBrowser, 
    showTutorial, 
    showAIPanel, 
    selectedStroke,
    toggleTheme, 
    toggleSelectMode,
    toggleControlPoints, 
    toggleCurvature, 
    toggleGrid, 
    toggleSnapToGrid,
    toggleMeasurements,
    toggleAIPanel, 
    clearCanvas, 
    saveProject,
    undo,
    redo,
    duplicateStroke,
  ]);

  if (isLoading) {
    return (
      <div className={`w-screen h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-600" size={24} />
          </div>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading AI-Assisted Bézier Designer...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`w-screen h-screen overflow-hidden relative ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
      style={geometricPatterns.dots(theme)}
    >
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full h-full">
        {/* Main Canvas */}
        <WebGLCanvas />
        
        {/* Left Toolbar */}
        <Toolbar />
        
        {/* Right Property Panel */}
        <PropertyPanel />
        
        {/* AI Assistant Panel */}
        <AIPanel />
        
        {/* Top Header Bar */}
        <div 
          className="fixed top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-2xl shadow-lg z-50 backdrop-blur-md"
          style={glassMorphism(theme)}
        >
          <Sparkles className="text-purple-500" size={20} />
          <h1 className={`text-lg font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent`}>
            AI-Assisted Bézier Designer
          </h1>
          <div className="flex items-center gap-2 ml-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">AI Active</span>
          </div>
          
          {/* Sync Status */}
          {autoSaveStatus !== 'idle' && (
            <div className={`flex items-center gap-2 ml-2 px-3 py-1 rounded-full ${
              autoSaveStatus === 'saving' 
                ? 'bg-cyan-500/20 border border-cyan-500/30' 
                : 'bg-green-500/20 border border-green-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                autoSaveStatus === 'saving' ? 'bg-cyan-500 animate-pulse' : 'bg-green-500'
              }`}></div>
              <span className={`text-xs font-medium ${
                autoSaveStatus === 'saving' 
                  ? 'text-cyan-600 dark:text-cyan-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {autoSaveStatus === 'saving' ? 'Saving...' : 'Saved'}
              </span>
            </div>
          )}
          
          {lastSaved && autoSaveStatus === 'idle' && (
            <span className={`text-xs ml-2 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div 
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 p-3 rounded-2xl shadow-2xl backdrop-blur-md z-50"
          style={glassMorphism(theme)}
        >
          <button
            onClick={() => setShowTutorial(true)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium ${
              theme === 'dark' 
                ? 'bg-gray-800 hover:bg-gray-700 text-white hover:shadow-lg hover:scale-105' 
                : 'bg-white hover:bg-gray-50 text-gray-700 hover:shadow-lg hover:scale-105'
            }`}
          >
            <HelpCircle size={18} />
            <span className="text-sm">Tutorial</span>
          </button>
          
          <button
            onClick={() => setShowProjectBrowser(true)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium ${
              theme === 'dark' 
                ? 'bg-gray-800 hover:bg-gray-700 text-white hover:shadow-lg hover:scale-105' 
                : 'bg-white hover:bg-gray-50 text-gray-700 hover:shadow-lg hover:scale-105'
            }`}
          >
            <FolderOpen size={18} />
            <span className="text-sm">Projects</span>
          </button>
          
          <button
            onClick={toggleAIPanel}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium ${
              showAIPanel
                ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/50 scale-105'
                : theme === 'dark' 
                  ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:shadow-lg hover:scale-105' 
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-700 hover:shadow-lg hover:scale-105'
            }`}
          >
            <Zap size={18} className={showAIPanel ? 'animate-pulse' : ''} />
            <span className="text-sm">AI Assistant</span>
          </button>
          
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105"
          >
            <FileDown size={18} />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <ProjectBrowser 
        isOpen={showProjectBrowser} 
        onClose={() => setShowProjectBrowser(false)} 
      />
      
      <ExportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
      />
      
      <TutorialModal 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
      />
    </div>
  );
}

export default App;