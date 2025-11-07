import React from 'react';
import { 
  Brush, 
  Square, 
  Download, 
  Upload, 
  Settings, 
  Eye, 
  EyeOff, 
  Grid3x3, 
  RotateCcw,
  Moon,
  Sun,
  Activity
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const Toolbar: React.FC = () => {
  const {
    theme,
    showControlPoints,
    showCurvature,
    showGrid,
    toggleTheme,
    toggleControlPoints,
    toggleCurvature,
    toggleGrid,
    clearCanvas,
    saveProject,
    loadProject,
  } = useAppStore();

  const handleSaveProject = () => {
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
  };

  const handleLoadProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target?.result as string;
          loadProject(data);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const buttonClass = `p-2 rounded-lg transition-colors duration-200 ${
    theme === 'dark' 
      ? 'bg-gray-700 text-white hover:bg-gray-600' 
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }`;

  const activeButtonClass = `p-2 rounded-lg transition-colors duration-200 ${
    theme === 'dark' 
      ? 'bg-blue-600 text-white hover:bg-blue-500' 
      : 'bg-blue-500 text-white hover:bg-blue-400'
  }`;

  return (
    <div className={`fixed top-4 left-4 flex flex-col gap-2 p-3 rounded-xl shadow-lg z-10 ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border`}>
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className={buttonClass}
        title="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className={`w-full h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />

      {/* View options */}
      <button
        onClick={toggleControlPoints}
        className={showControlPoints ? activeButtonClass : buttonClass}
        title="Show/hide control points"
      >
        <Eye size={20} />
      </button>

      <button
        onClick={toggleCurvature}
        className={showCurvature ? activeButtonClass : buttonClass}
        title="Show/hide curvature analysis"
      >
        <Activity size={20} />
      </button>

      <button
        onClick={toggleGrid}
        className={showGrid ? activeButtonClass : buttonClass}
        title="Show/hide grid"
      >
        <Grid3x3 size={20} />
      </button>

      <div className={`w-full h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />

      {/* Actions */}
      <button
        onClick={clearCanvas}
        className={buttonClass}
        title="Clear canvas"
      >
        <Square size={20} />
      </button>

      <button
        onClick={handleSaveProject}
        className={buttonClass}
        title="Save project"
      >
        <Download size={20} />
      </button>

      <button
        onClick={handleLoadProject}
        className={buttonClass}
        title="Load project"
      >
        <Upload size={20} />
      </button>
    </div>
  );
};