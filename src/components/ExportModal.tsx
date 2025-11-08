import { Download, FileImage, FileJson, FileType, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { glassMorphism } from '../styles/designSystem';
import { DraggablePanel } from './DraggablePanel';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { theme, exportSVG, exportJSON, strokes } = useAppStore();
  const [exportFormat, setExportFormat] = useState<'svg' | 'json' | 'png'>('svg');
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate preview
  useEffect(() => {
    if (!isOpen || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear and set background
    ctx.fillStyle = theme === 'dark' ? '#1a1a1a' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Scale factor to fit preview
    const scaleFactor = 0.25;

    // Draw curves
    ctx.strokeStyle = theme === 'dark' ? '#8b5cf6' : '#7c3aed';
    ctx.lineWidth = 2;

    strokes.forEach(stroke => {
      stroke.fittedCurves.forEach(curve => {
        ctx.beginPath();
        ctx.moveTo(curve.p0.x * scaleFactor, curve.p0.y * scaleFactor);
        ctx.bezierCurveTo(
          curve.p1.x * scaleFactor, curve.p1.y * scaleFactor,
          curve.p2.x * scaleFactor, curve.p2.y * scaleFactor,
          curve.p3.x * scaleFactor, curve.p3.y * scaleFactor
        );
        ctx.stroke();
      });
    });
  }, [isOpen, strokes, theme]);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate progress animation
    const progressInterval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 50);

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));

    let data: string;
    let filename: string;
    let mimeType: string;

    switch (exportFormat) {
      case 'svg':
        data = generateSVGExport();
        filename = `bezier-curves-${Date.now()}.svg`;
        mimeType = 'image/svg+xml';
        break;
      case 'json':
        data = exportJSON();
        filename = `bezier-curves-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      case 'png':
        handlePNGExport();
        setExportProgress(100);
        setTimeout(() => {
          setIsExporting(false);
          onClose();
        }, 500);
        return;
      default:
        setIsExporting(false);
        return;
    }

    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportProgress(100);
    setTimeout(() => {
      setIsExporting(false);
      onClose();
    }, 500);
  };

  const generateSVGExport = (): string => {
    const width = 800;
    const height = 600;
    
    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${theme === 'dark' ? '#1a1a1a' : '#ffffff'}"/>
`;

    strokes.forEach(stroke => {
      stroke.fittedCurves.forEach(curve => {
        svgContent += `  <path d="M ${curve.p0.x} ${curve.p0.y} C ${curve.p1.x} ${curve.p1.y} ${curve.p2.x} ${curve.p2.y} ${curve.p3.x} ${curve.p3.y}" 
        stroke="${theme === 'dark' ? '#00ff88' : '#2563eb'}" 
        stroke-width="3" 
        fill="none"/>
`;
      });
    });

    svgContent += '</svg>';
    return svgContent;
  };

  const handlePNGExport = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `bezier-curves-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <DraggablePanel
        className="w-[500px] max-h-[90vh] overflow-y-auto p-6 rounded-2xl shadow-2xl backdrop-blur-md"
        style={glassMorphism(theme)}
        initialPosition={{ x: 0, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
            Export Curves
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
            aria-label="Close export modal"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Export Preview */}
        <div className="mb-6">
          <h3 className={`text-sm font-semibold mb-3 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Preview
          </h3>
          <canvas 
            ref={previewCanvasRef}
            width={400}
            height={300}
            className={`w-full rounded-xl border-2 ${
              theme === 'dark' ? 'border-purple-500/30' : 'border-purple-400/30'
            }`}
          />
        </div>

        {/* Export Format */}
        <div className="mb-6">
          <label className={`block text-sm font-semibold mb-4 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Export Format
          </label>
          
          <div className="space-y-3">
            <ExportFormatOption
              icon={<FileType size={20} />}
              name="SVG Vector"
              description="Scalable vector graphics with curve data"
              value="svg"
              checked={exportFormat === 'svg'}
              onChange={() => setExportFormat('svg')}
              theme={theme}
            />

            <ExportFormatOption
              icon={<FileJson size={20} />}
              name="JSON Data"
              description="Raw control point coordinates"
              value="json"
              checked={exportFormat === 'json'}
              onChange={() => setExportFormat('json')}
              theme={theme}
            />

            <ExportFormatOption
              icon={<FileImage size={20} />}
              name="PNG Image"
              description="Rasterized canvas screenshot"
              value="png"
              checked={exportFormat === 'png'}
              onChange={() => setExportFormat('png')}
              theme={theme}
            />
          </div>
        </div>

        {/* Progress Bar */}
        {isExporting && (
          <div className="mb-4">
            <div className={`flex items-center justify-between text-xs mb-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span>Exporting...</span>
              <span>{exportProgress}%</span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            aria-label="Cancel export"
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
              isExporting
                ? 'opacity-50 cursor-not-allowed'
                : theme === 'dark' 
                  ? 'bg-gray-800/70 hover:bg-gray-700/70 text-gray-300 hover:scale-105' 
                  : 'bg-white/70 hover:bg-gray-100/70 text-gray-700 hover:scale-105'
            }`}
          >
            Cancel
          </button>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            aria-label={isExporting ? 'Exporting in progress' : 'Export file'}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              isExporting
                ? 'opacity-75 cursor-wait bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                : 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white hover:scale-105 shadow-lg shadow-purple-500/30'
            }`}
          >
            <Download size={18} />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </DraggablePanel>
    </div>
  );
};

interface ExportFormatOptionProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  theme: 'light' | 'dark';
}

const ExportFormatOption: React.FC<ExportFormatOptionProps> = ({
  icon,
  name,
  description,
  checked,
  onChange,
  theme
}) => {
  return (
    <label 
      className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
        checked
          ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-2 border-purple-500/50 scale-[1.02]'
          : theme === 'dark'
            ? 'bg-gray-800/50 hover:bg-gray-700/50 border-2 border-transparent'
            : 'bg-white/50 hover:bg-gray-100/50 border-2 border-transparent'
      }`}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        aria-label={`Export as ${name}`}
        className="sr-only"
      />
      <div className={`${checked ? 'text-purple-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className={`font-semibold ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
        }`}>
          {name}
        </div>
        <div className={`text-xs ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {description}
        </div>
      </div>
      {checked && (
        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
      )}
    </label>
  );
};