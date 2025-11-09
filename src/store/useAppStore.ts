import { create } from 'zustand';
import { AppState, FittingOptions, Point2D, StrokeData } from '../types';
import { generateId } from '../utils/helpers';

interface AppActions {
  // Drawing actions
  startDrawing: (point: Point2D) => void;
  addPoint: (point: Point2D) => void;
  endDrawing: () => void;
  clearCanvas: () => void;
  
  // Selection actions
  selectStroke: (strokeId: string | null) => void;
  selectControlPoint: (strokeId: string, curveIndex: number, pointIndex: number) => void;
  clearSelection: () => void;
  
  // Editing actions
  updateControlPoint: (strokeId: string, curveIndex: number, pointIndex: number, newPoint: Point2D) => void;
  updateStroke: (strokeId: string, updates: Partial<StrokeData>) => void;
  deleteStroke: (strokeId: string) => void;
  duplicateStroke: (strokeId: string) => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  // Settings actions
  updateFittingOptions: (options: Partial<FittingOptions>) => void;
  toggleTheme: () => void;
  toggleControlPoints: () => void;
  toggleCurvature: () => void;
  toggleGrid: () => void;
  toggleAIPanel: () => void;
  toggleSnapToGrid: () => void;
  toggleMeasurements: () => void;
  toggleSelectMode: () => void;
  
  // Persistence actions
  saveProject: () => string;
  loadProject: (data: string) => void;
  exportSVG: () => string;
  exportJSON: () => string;
}

const defaultFittingOptions: FittingOptions = {
  parameterization: 'centripetal',
  maxIterations: 20,
  tolerance: 0.001,
  regularization: 1e-6,
};

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  // Initial state
  isDrawing: false,
  currentStroke: [],
  strokes: [],
  selectedStroke: null,
  selectedControlPoint: null,
  theme: 'light',
  showControlPoints: true,
  showCurvature: false,
  showGrid: false,
  showAIPanel: false,
  showSnapToGrid: false,
  showMeasurements: false,
  selectMode: false,
  history: [],
  historyIndex: -1,
  fittingOptions: defaultFittingOptions,
  renderOptions: {
    strokeWidth: 2,
    curveWidth: 3,
    controlPointSize: 8,
    showResiduals: false,
  },

  // Actions
  startDrawing: (point: Point2D) => {
    set({ isDrawing: true, currentStroke: [point], selectedStroke: null, selectedControlPoint: null });
  },

  addPoint: (point: Point2D) => {
    const state = get();
    if (state.isDrawing) {
      set({ currentStroke: [...state.currentStroke, point] });
    }
  },

  endDrawing: () => {
    const state = get();
    if (state.currentStroke.length > 2) {
      const strokeData: StrokeData = {
        points: [...state.currentStroke],
        fittedCurves: [], // Will be populated by curve fitting
        timestamp: Date.now(),
        id: generateId(),
      };
      
      const newStrokes = [...state.strokes, strokeData];
      
      // Save to history
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newStrokes))); // Deep copy
      
      set({
        isDrawing: false,
        currentStroke: [],
        strokes: newStrokes,
        selectedStroke: strokeData.id,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      });
    } else {
      set({ isDrawing: false, currentStroke: [] });
    }
  },

  clearCanvas: () => {
    const state = get();
    const newStrokes: StrokeData[] = [];
    
    // Save to history
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newStrokes))); // Deep copy
    
    set({
      strokes: newStrokes,
      currentStroke: [],
      isDrawing: false,
      selectedStroke: null,
      selectedControlPoint: null,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  selectStroke: (strokeId: string | null) => {
    set({ selectedStroke: strokeId, selectedControlPoint: null });
  },

  selectControlPoint: (strokeId: string, curveIndex: number, pointIndex: number) => {
    set({
      selectedStroke: strokeId,
      selectedControlPoint: { strokeId, curveIndex, pointIndex },
    });
  },

  clearSelection: () => {
    set({ selectedStroke: null, selectedControlPoint: null });
  },

  updateControlPoint: (strokeId: string, curveIndex: number, pointIndex: number, newPoint: Point2D) => {
    const state = get();
    const strokes = state.strokes.map(stroke => {
      if (stroke.id === strokeId && stroke.fittedCurves[curveIndex]) {
        const updatedCurves = [...stroke.fittedCurves];
        const curve = { ...updatedCurves[curveIndex] };
        
        switch (pointIndex) {
          case 0: curve.p0 = newPoint; break;
          case 1: curve.p1 = newPoint; break;
          case 2: curve.p2 = newPoint; break;
          case 3: curve.p3 = newPoint; break;
        }
        
        updatedCurves[curveIndex] = curve;
        return { ...stroke, fittedCurves: updatedCurves };
      }
      return stroke;
    });
    
    // Save to history
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(strokes))); // Deep copy
    
    set({ 
      strokes,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  updateStroke: (strokeId: string, updates: Partial<StrokeData>) => {
    const state = get();
    const strokes = state.strokes.map(stroke => {
      if (stroke.id === strokeId) {
        return { ...stroke, ...updates };
      }
      return stroke;
    });
    
    // Save to history
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(strokes))); // Deep copy
    
    set({ 
      strokes,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  deleteStroke: (strokeId: string) => {
    const state = get();
    const strokes = state.strokes.filter(s => s.id !== strokeId);
    
    // Save to history
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(strokes))); // Deep copy
    
    set({
      strokes,
      selectedStroke: state.selectedStroke === strokeId ? null : state.selectedStroke,
      selectedControlPoint: state.selectedControlPoint?.strokeId === strokeId ? null : state.selectedControlPoint,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  duplicateStroke: (strokeId: string) => {
    const state = get();
    const strokeToDuplicate = state.strokes.find(s => s.id === strokeId);
    if (strokeToDuplicate) {
      const duplicatedStroke: StrokeData = {
        ...strokeToDuplicate,
        id: generateId(),
        timestamp: Date.now(),
        // Offset the duplicate slightly so it's visible
        points: strokeToDuplicate.points.map(p => ({ x: p.x + 20, y: p.y + 20 })),
        fittedCurves: strokeToDuplicate.fittedCurves.map(curve => ({
          p0: { x: curve.p0.x + 20, y: curve.p0.y + 20 },
          p1: { x: curve.p1.x + 20, y: curve.p1.y + 20 },
          p2: { x: curve.p2.x + 20, y: curve.p2.y + 20 },
          p3: { x: curve.p3.x + 20, y: curve.p3.y + 20 },
        })),
      };
      
      const strokes = [...state.strokes, duplicatedStroke];
      
      // Save to history
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(strokes))); // Deep copy
      
      set({
        strokes,
        selectedStroke: duplicatedStroke.id,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      });
    }
  },

  saveToHistory: () => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(state.strokes))); // Deep copy
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      set({
        strokes: state.history[newIndex],
        historyIndex: newIndex,
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      set({
        strokes: state.history[newIndex],
        historyIndex: newIndex,
      });
    }
  },

  updateFittingOptions: (options: Partial<FittingOptions>) => {
    const state = get();
    set({ fittingOptions: { ...state.fittingOptions, ...options } });
  },

  toggleTheme: () => {
    const state = get();
    set({ theme: state.theme === 'light' ? 'dark' : 'light' });
  },

  toggleControlPoints: () => {
    const state = get();
    set({ showControlPoints: !state.showControlPoints });
  },

  toggleCurvature: () => {
    const state = get();
    set({ showCurvature: !state.showCurvature });
  },

  toggleGrid: () => {
    const state = get();
    set({ showGrid: !state.showGrid });
  },

  toggleAIPanel: () => {
    const state = get();
    set({ showAIPanel: !state.showAIPanel });
  },

  toggleSnapToGrid: () => {
    const state = get();
    set({ showSnapToGrid: !state.showSnapToGrid });
  },

  toggleMeasurements: () => {
    const state = get();
    set({ showMeasurements: !state.showMeasurements });
  },

  toggleSelectMode: () => {
    const state = get();
    set({ selectMode: !state.selectMode });
  },

  saveProject: () => {
    const state = get();
    const projectData = {
      strokes: state.strokes,
      fittingOptions: state.fittingOptions,
      renderOptions: state.renderOptions,
      timestamp: Date.now(),
    };
    return JSON.stringify(projectData, null, 2);
  },

  loadProject: (data: string) => {
    try {
      const projectData = JSON.parse(data);
      set({
        strokes: projectData.strokes || [],
        fittingOptions: { ...defaultFittingOptions, ...projectData.fittingOptions },
        renderOptions: { ...get().renderOptions, ...projectData.renderOptions },
        selectedStroke: null,
        selectedControlPoint: null,
      });
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  },

  exportSVG: () => {
    // Implementation for SVG export
    return '<!-- SVG export functionality to be implemented -->';
  },

  exportJSON: () => {
    const state = get();
    return JSON.stringify(state.strokes, null, 2);
  },
}));