import React, { useState } from 'react';
import { X, Download } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { theme, exportSVG, exportJSON, strokes } = useAppStore();
  const [exportFormat, setExportFormat] = useState<'svg' | 'json' | 'png'>('svg');

  if (!isOpen) return null;

  const handleExport = () => {
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
        // PNG export would capture canvas content
        handlePNGExport();
        return;
      default:
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

    onClose();
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`w-96 p-6 rounded-xl shadow-xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
      } border`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Export Curves</h2>
          <button
            onClick={onClose}
            className={`p-1 rounded hover:bg-opacity-10 hover:bg-gray-500`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <label className={`block text-sm font-medium mb-3 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Export Format
          </label>
          
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="exportFormat"
                value="svg"
                checked={exportFormat === 'svg'}
                onChange={(e) => setExportFormat(e.target.value as 'svg')}
                className="mr-3"
              />
              <div>
                <div className="font-medium">SVG Vector</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Scalable vector graphics with curve data
                </div>
              </div>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="exportFormat"
                value="json"
                checked={exportFormat === 'json'}
                onChange={(e) => setExportFormat(e.target.value as 'json')}
                className="mr-3"
              />
              <div>
                <div className="font-medium">JSON Data</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Raw control point coordinates
                </div>
              </div>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="exportFormat"
                value="png"
                checked={exportFormat === 'png'}
                onChange={(e) => setExportFormat(e.target.value as 'png')}
                className="mr-3"
              />
              <div>
                <div className="font-medium">PNG Image</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Rasterized canvas screenshot
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 py-2 px-4 rounded transition-colors ${
              theme === 'dark' 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Cancel
          </button>
          
          <button
            onClick={handleExport}
            className={`flex-1 py-2 px-4 rounded transition-colors flex items-center justify-center gap-2 ${
              theme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                : 'bg-blue-500 hover:bg-blue-400 text-white'
            }`}
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>
    </div>
  );
};