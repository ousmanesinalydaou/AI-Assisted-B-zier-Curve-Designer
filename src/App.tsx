import React, { useState, useEffect } from 'react';
import { WebGLCanvas } from './components/WebGLCanvas';
import { Toolbar } from './components/Toolbar';
import { PropertyPanel } from './components/PropertyPanel';
import { ExportModal } from './components/ExportModal';
import { TutorialModal } from './components/TutorialModal';
import { useAppStore } from './store/useAppStore';
import { HelpCircle, File as FileExport } from 'lucide-react';

function App() {
  const { theme } = useAppStore();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Show tutorial on first visit
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('bezier-tutorial-seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      localStorage.setItem('bezier-tutorial-seen', 'true');
    }
  }, []);

  return (
    <div className={`w-screen h-screen overflow-hidden ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Main Canvas */}
      <WebGLCanvas />
      
      {/* Left Toolbar */}
      <Toolbar />
      
      {/* Right Property Panel */}
      <PropertyPanel />
      
      {/* Bottom Action Bar */}
      <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 p-3 rounded-xl shadow-lg ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border`}>
        <button
          onClick={() => setShowTutorial(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            theme === 'dark' 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <HelpCircle size={18} />
          Tutorial
        </button>
        
        <button
          onClick={() => setShowExportModal(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            theme === 'dark' 
              ? 'bg-blue-600 hover:bg-blue-500 text-white' 
              : 'bg-blue-500 hover:bg-blue-400 text-white'
          }`}
        >
          <FileExport size={18} />
          Export
        </button>
      </div>

      {/* Modals */}
      <ExportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
      />
      
      <TutorialModal 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
      />

      {/* Performance Monitor (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded text-xs ${
          theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
        }`}>
          WebGL Bézier Curve Designer v1.0 - Development Mode
        </div>
      )}
    </div>
  );
}

export default App;