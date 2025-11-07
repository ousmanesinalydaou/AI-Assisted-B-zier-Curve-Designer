import { create } from 'zustand';
import { AppState, Point2D, StrokeData, FittingOptions } from '../types';
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
  deleteStroke: (strokeId: string) => void;
  
  // Settings actions
  updateFittingOptions: (options: Partial<FittingOptions>) => void;
  toggleTheme: () => void;
  toggleControlPoints: () => void;
  toggleCurvature: () => void;
  toggleGrid: () => void;
  
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
      
      set({
        isDrawing: false,
        currentStroke: [],
        strokes: [...state.strokes, strokeData],
        selectedStroke: strokeData.id,
      });
    } else {
      set({ isDrawing: false, currentStroke: [] });
    }
  },

  clearCanvas: () => {
    set({
      strokes: [],
      currentStroke: [],
      isDrawing: false,
      selectedStroke: null,
      selectedControlPoint: null,
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
    
    set({ strokes });
  },

  deleteStroke: (strokeId: string) => {
    const state = get();
    set({
      strokes: state.strokes.filter(s => s.id !== strokeId),
      selectedStroke: state.selectedStroke === strokeId ? null : state.selectedStroke,
      selectedControlPoint: state.selectedControlPoint?.strokeId === strokeId ? null : state.selectedControlPoint,
    });
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
    const state = get();
    return '<!-- SVG export functionality to be implemented -->';
  },

  exportJSON: () => {
    const state = get();
    return JSON.stringify(state.strokes, null, 2);
  },
}));