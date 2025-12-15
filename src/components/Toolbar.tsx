import {
    Activity,
    Box,
    Copy,
    Download,
    Eye,
    Grid3x3,
    Keyboard,
    Magnet,
    Moon,
    MousePointer2,
    Pencil,
    Redo2,
    RotateCcw,
    Ruler,
    Sun,
    Undo2,
    Upload
} from 'lucide-react';
import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { glassMorphism } from '../styles/designSystem';
import { DraggablePanel } from './DraggablePanel';

export const Toolbar: React.FC = () => {
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);

  const {
    theme,
    showControlPoints,
    showCurvature,
    showGrid,
    showSnapToGrid,
    showMeasurements,
    selectMode,
    selectedStroke,
    show3DPanel,
    toggleTheme,
    toggleControlPoints,
    toggleCurvature,
    toggleGrid,
    toggleSnapToGrid,
    toggleMeasurements,
    toggleSelectMode,
    toggle3DPanel,
    clearCanvas,
    saveProject,
    loadProject,
    undo,
    redo,
    duplicateStroke,
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

  return (
    <>
      <DraggablePanel
        className="top-4 left-4 flex flex-col gap-1.5 p-2 rounded-xl shadow-2xl z-50 backdrop-blur-md"
        style={glassMorphism(theme)}
        initialPosition={{ x: 0, y: 0 }}
        showGrip={false}
      >
        {/* Theme toggle */}
        <ToolbarButton
          onClick={toggleTheme}
          icon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          title="Toggle theme (T)"
          theme={theme}
        />

        <Divider theme={theme} />

        {/* Drawing mode toggles */}
        <ToolbarButton
          onClick={toggleSelectMode}
          icon={selectMode ? <MousePointer2 size={16} /> : <Pencil size={16} />}
          title={selectMode ? "Select mode (V)" : "Draw mode (V)"}
          isActive={selectMode}
          theme={theme}
        />

        <Divider theme={theme} />

        {/* View options */}
        <ToolbarButton
          onClick={toggleControlPoints}
          icon={<Eye size={16} />}
          title="Show/hide control points (C)"
          isActive={showControlPoints}
          theme={theme}
        />

        <ToolbarButton
          onClick={toggleCurvature}
          icon={<Activity size={16} />}
          title="Show/hide curvature (K)"
          isActive={showCurvature}
          theme={theme}
        />

        <ToolbarButton
          onClick={toggleGrid}
          icon={<Grid3x3 size={16} />}
          title="Show/hide grid (G)"
          isActive={showGrid}
          theme={theme}
        />

        <ToolbarButton
          onClick={toggleSnapToGrid}
          icon={<Magnet size={16} />}
          title="Snap to grid (M)"
          isActive={showSnapToGrid}
          theme={theme}
        />

        <ToolbarButton
          onClick={toggleMeasurements}
          icon={<Ruler size={16} />}
          title="Show measurements (R)"
          isActive={showMeasurements}
          theme={theme}
        />

        <Divider theme={theme} />

        {/* Edit actions */}
        <ToolbarButton
          onClick={undo}
          icon={<Undo2 size={16} />}
          title="Undo (Ctrl+Z)"
          theme={theme}
        />

        <ToolbarButton
          onClick={redo}
          icon={<Redo2 size={16} />}
          title="Redo (Ctrl+Y)"
          theme={theme}
        />

        <ToolbarButton
          onClick={() => selectedStroke && duplicateStroke(selectedStroke)}
          icon={<Copy size={16} />}
          title="Duplicate selected stroke (Ctrl+D)"
          theme={theme}
          disabled={!selectedStroke}
        />

        <Divider theme={theme} />

        {/* Actions */}
        <ToolbarButton
          onClick={clearCanvas}
          icon={<RotateCcw size={16} />}
          title="Clear canvas (⌫)"
          theme={theme}
        />

        <ToolbarButton
          onClick={handleSaveProject}
          icon={<Download size={16} />}
          title="Save project (Ctrl+S)"
          theme={theme}
        />

        <ToolbarButton
          onClick={handleLoadProject}
          icon={<Upload size={16} />}
          title="Load project (Ctrl+O)"
          theme={theme}
        />

        <Divider theme={theme} />

        {/* 3D Surface Generator */}
        <ToolbarButton
          onClick={toggle3DPanel}
          icon={<Box size={16} />}
          title="3D Surface Generator (3)"
          isActive={show3DPanel}
          theme={theme}
        />

        <Divider theme={theme} />

        {/* Keyboard shortcuts */}
        <ToolbarButton
          onClick={() => setShowKeyboardHints(!showKeyboardHints)}
          icon={<Keyboard size={16} />}
          title="Keyboard shortcuts (?)"
          isActive={showKeyboardHints}
          theme={theme}
        />
      </DraggablePanel>

      {/* Keyboard shortcuts overlay */}
      {showKeyboardHints && (
        <div 
          className="fixed top-4 left-24 p-4 rounded-2xl shadow-2xl z-10 backdrop-blur-md max-w-xs"
          style={glassMorphism(theme)}
        >
          <h3 className={`text-sm font-bold mb-3 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
          }`}>
            Keyboard Shortcuts
          </h3>
          <div className={`space-y-2 text-xs ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <div className="flex justify-between">
              <span>Toggle theme</span>
              <kbd className="px-2 py-0.5 rounded bg-gray-700 text-gray-200">T</kbd>
            </div>
            <div className="flex justify-between">
              <span>Draw/Select mode</span>
              <kbd className="px-2 py-0.5 rounded bg-gray-700 text-gray-200">V</kbd>
            </div>
            <div className="flex justify-between">
              <span>Control points</span>
              <kbd className="px-2 py-0.5 rounded bg-gray-700 text-gray-200">C</kbd>
            </div>
            <div className="flex justify-between">
              <span>Curvature</span>
              <kbd className="px-2 py-0.5 rounded bg-gray-700 text-gray-200">K</kbd>
            </div>
            <div className="flex justify-between">
              <span>Grid</span>
              <kbd className="px-2 py-0.5 rounded bg-gray-700 text-gray-200">G</kbd>
            </div>
            <div className="flex justify-between">
              <span>Snap to grid</span>
              <kbd className="px-2 py-0.5 rounded bg-gray-700 text-gray-200">M</kbd>
            </div>
            <div className="flex justify-between">
              <span>Measurements</span>
              <kbd className="px-2 py-0.5 rounded bg-gray-700 text-gray-200">R</kbd>
            </div>
            <div className="flex justify-between">
              <span>Undo</span>
              <kbd className="px-2 py-0.5 rounded bg-gray-700 text-gray-200">Ctrl+Z</kbd>
            </div>
            <div className="flex justify-between">
              <span>Redo</span>
              <kbd className="px-2 py-0.5 rounded bg-gray-700 text-gray-200">Ctrl+Y</kbd>
            </div>
            <div className="flex justify-between">
              <span>Duplicate</span>
              <kbd className="px-2 py-0.5 rounded bg-gray-700 text-gray-200">Ctrl+D</kbd>
            </div>
            <div className="flex justify-between">
              <span>Save project</span>
              <kbd className="px-2 py-0.5 rounded bg-gray-700 text-gray-200">Ctrl+S</kbd>
            </div>
            <div className="flex justify-between">
              <span>Load project</span>
              <kbd className="px-2 py-0.5 rounded bg-gray-700 text-gray-200">Ctrl+O</kbd>
            </div>
            <div className="flex justify-between">
              <span>Clear canvas</span>
              <kbd className="px-2 py-0.5 rounded bg-gray-700 text-gray-200">Delete</kbd>
            </div>
            <div className="flex justify-between">
              <span>Pan view</span>
              <kbd className="px-2 py-0.5 rounded bg-gray-700 text-gray-200">Middle Click</kbd>
            </div>
            <div className="flex justify-between">
              <span>Zoom</span>
              <kbd className="px-2 py-0.5 rounded bg-gray-700 text-gray-200">Scroll</kbd>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  isActive?: boolean;
  theme: 'light' | 'dark';
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  onClick, 
  icon, 
  title, 
  isActive, 
  theme,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={isActive ? 'true' : 'false'}
      disabled={disabled}
      className={`p-1.5 rounded-lg transition-all duration-300 hover:scale-110 ${
        disabled
          ? 'opacity-30 cursor-not-allowed'
          : isActive
          ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-md shadow-purple-500/50'
          : theme === 'dark' 
            ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 hover:text-white' 
            : 'bg-white/50 text-gray-700 hover:bg-gray-100/70 hover:text-gray-900'
      }`}
    >
      {icon}
    </button>
  );
};

interface DividerProps {
  theme: 'light' | 'dark';
}

const Divider: React.FC<DividerProps> = ({ theme }) => {
  return (
    <div className={`w-full h-px ${
      theme === 'dark' ? 'bg-gradient-to-r from-transparent via-gray-600 to-transparent' : 'bg-gradient-to-r from-transparent via-gray-300 to-transparent'
    }`} />
  );
};