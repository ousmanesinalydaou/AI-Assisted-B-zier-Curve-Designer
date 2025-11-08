import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { DraggablePanel } from './DraggablePanel';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const { theme } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Bézier Curve Designer",
      content: (
        <div>
          <p className="mb-4">
            This application lets you draw freehand strokes and automatically fits 
            cubic Bézier curves using advanced mathematical algorithms.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>High-performance WebGL rendering</li>
            <li>Real-time curve fitting with Newton-Raphson optimization</li>
            <li>Interactive control point editing</li>
            <li>Curvature analysis and smoothing suggestions</li>
          </ul>
        </div>
      )
    },
    {
      title: "Step 1: Draw Your Curve",
      content: (
        <div>
          <p className="mb-4">
            Click and drag on the canvas to draw a freehand stroke. The application 
            captures your input with high precision and timestamps.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Works with mouse and touch input</li>
            <li>Automatic point resampling and smoothing</li>
            <li>Real-time stroke preview</li>
          </ul>
        </div>
      )
    },
    {
      title: "Step 2: Automatic Curve Fitting",
      content: (
        <div>
          <p className="mb-4">
            When you finish drawing, the app automatically fits a cubic Bézier curve 
            using iterative least-squares with reparameterization.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Centripetal parameterization (recommended)</li>
            <li>Newton-Raphson optimization for minimal error</li>
            <li>Automatic segmentation for complex curves</li>
          </ul>
        </div>
      )
    },
    {
      title: "Step 3: Edit and Export",
      content: (
        <div>
          <p className="mb-4">
            Fine-tune your curve by dragging control points, analyze curvature, 
            and export in multiple formats.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Drag P₁ and P₂ handles for precise control</li>
            <li>Real-time curve updates with WebGL rendering</li>
            <li>Export as SVG, JSON, or PNG</li>
            <li>Curvature analysis with C¹/C² continuity detection</li>
          </ul>
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <DraggablePanel
        className={`w-full max-w-lg mx-4 p-6 rounded-xl shadow-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        } border`}
        initialPosition={{ x: 0, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{steps[currentStep].title}</h2>
          <button
            onClick={onClose}
            className={`p-1 rounded hover:bg-opacity-10 hover:bg-gray-500`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 min-h-[200px]">
          {steps[currentStep].content}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
              currentStep === 0
                ? (theme === 'dark' ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed')
                : (theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700')
            }`}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep
                    ? (theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500')
                    : (theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300')
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                theme === 'dark' 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                  : 'bg-blue-500 hover:bg-blue-400 text-white'
              }`}
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                theme === 'dark' 
                  ? 'bg-green-600 hover:bg-green-500 text-white' 
                  : 'bg-green-500 hover:bg-green-400 text-white'
              }`}
            >
              Get Started
            </button>
          )}
        </div>
      </DraggablePanel>
    </div>
  );
};