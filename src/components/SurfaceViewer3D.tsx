/**
 * 3D Surface Viewer Component
 * 
 * Displays generated 3D surfaces from Bézier curves
 * Supports interactive rotation, zoom, and multiple surface types
 * 
 * Author: OUSMANE DAOU
 * Supervisor: Kunkli Roland Imre
 * University of Debrecen, Faculty of Informatics
 */

import { Download, Lightbulb, RotateCw, X, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
    create3DControlGrid,
    generateBezierPatch,
    generateExtrudedSurface,
    generateLoftedSurface,
    generateSurfaceOfRevolution,
    generateTube,
    generateVase
} from '../algorithms/bezierSurface';
import { useAppStore } from '../store/useAppStore';

export const SurfaceViewer3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  
  const {
    surfaces,
    selectedSurface,
    strokes,
    show3DView,
    toggle3DView,
    theme,
  } = useAppStore();

  useEffect(() => {
    if (!containerRef.current || !show3DView) return;

    // Setup Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme === 'dark' ? 0x1a1a1a : 0xf0f0f0);
    sceneRef.current = scene;

    // Setup Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(100, 100, 200);
    cameraRef.current = camera;

    // Setup Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Setup Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.0;
    controlsRef.current = controls;

    // Add Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(50, 100, 50);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-50, -50, -50);
    scene.add(directionalLight2);

    // Add Grid Helper
    const gridHelper = new THREE.GridHelper(200, 20, 0x888888, 0x444444);
    scene.add(gridHelper);

    // Add Axes Helper
    const axesHelper = new THREE.AxesHelper(50);
    scene.add(axesHelper);

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [show3DView, theme]);

  // Update auto-rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Generate and display surface
  useEffect(() => {
    if (!sceneRef.current || !selectedSurface || surfaces.length === 0) return;

    // Remove previous mesh
    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      if (Array.isArray(meshRef.current.material)) {
        meshRef.current.material.forEach(m => m.dispose());
      } else {
        meshRef.current.material.dispose();
      }
    }

    const surface = surfaces.find(s => s.id === selectedSurface);
    if (!surface) return;

    // Get source strokes
    const sourceStrokes = surface.sourceStrokeIds
      .map(id => strokes.find(s => s.id === id))
      .filter((s): s is typeof strokes[0] => Boolean(s));
    
    if (sourceStrokes.length === 0 || !sourceStrokes[0]?.fittedCurves[0]) return;

    const firstCurve = sourceStrokes[0].fittedCurves[0];
    let geometry: THREE.BufferGeometry | null = null;

    try {
      // Generate geometry based on surface type
      switch (surface.type) {
        case 'revolution':
          geometry = generateSurfaceOfRevolution(firstCurve, {
            resolution: surface.options.resolution,
            rotationSteps: surface.options.rotationSteps,
            axis: surface.options.axis,
          });
          break;

        case 'vase':
          geometry = generateVase(firstCurve, {
            resolution: surface.options.resolution,
            rotationSteps: surface.options.rotationSteps,
          });
          break;

        case 'tube':
          geometry = generateTube(firstCurve, surface.options.radius, {
            resolution: surface.options.resolution,
            rotationSteps: surface.options.rotationSteps,
          });
          break;

        case 'patch':
          if (sourceStrokes.length >= 4) {
            const curves = sourceStrokes.slice(0, 4).map(s => s.fittedCurves[0]);
            const controlGrid = create3DControlGrid(curves);
            geometry = generateBezierPatch(controlGrid, {
              resolution: surface.options.resolution,
            });
          }
          break;

        case 'loft':
          if (sourceStrokes.length >= 2) {
            const curves = sourceStrokes.map(s => s.fittedCurves[0]);
            geometry = generateLoftedSurface(curves, {
              resolution: surface.options.resolution,
            });
          }
          break;

        case 'extrusion':
          if (sourceStrokes.length >= 2) {
            const profile = sourceStrokes[0].fittedCurves[0];
            const path = sourceStrokes[1].fittedCurves[0];
            geometry = generateExtrudedSurface(profile, path, {
              resolution: surface.options.resolution,
            });
          }
          break;
      }

      if (geometry) {
        // Center geometry
        geometry.center();

        // Create material
        const material = new THREE.MeshPhongMaterial({
          color: theme === 'dark' ? 0x4a9eff : 0x3b82f6,
          side: THREE.DoubleSide,
          wireframe: wireframe,
          flatShading: false,
          shininess: 100,
        });

        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        meshRef.current = mesh;
        sceneRef.current.add(mesh);
      }
    } catch (error) {
      console.error('Failed to generate surface:', error);
    }
  }, [selectedSurface, surfaces, strokes, wireframe, theme]);

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(0.8);
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(1.25);
    }
  };

  const handleResetView = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(100, 100, 200);
      controlsRef.current.reset();
    }
  };

  const handleExport = () => {
    if (!rendererRef.current) return;
    const dataURL = rendererRef.current.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `3d-surface-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  if (!show3DView) return null;

  return (
    <div
      className={`fixed inset-0 z-50 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
      }`}
    >
      {/* Header */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-b`}
      >
        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          3D Surface Viewer
        </h2>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-3 py-2 rounded transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
            title="Toggle Wireframe"
          >
            <Lightbulb size={18} />
          </button>
          
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-2 rounded transition-colors ${
              autoRotate
                ? theme === 'dark'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-500 text-white'
                : theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
            title="Toggle Auto-Rotate"
          >
            <RotateCw size={18} />
          </button>
          
          <button
            onClick={handleZoomIn}
            className={`px-3 py-2 rounded transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          
          <button
            onClick={handleZoomOut}
            className={`px-3 py-2 rounded transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          
          <button
            onClick={handleResetView}
            className={`px-3 py-2 rounded transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
            title="Reset View"
          >
            Reset
          </button>
          
          <button
            onClick={handleExport}
            className={`px-3 py-2 rounded transition-colors ${
              theme === 'dark'
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-green-500 hover:bg-green-400 text-white'
            }`}
            title="Export as PNG"
          >
            <Download size={18} />
          </button>
          
          <button
            onClick={toggle3DView}
            className={`px-3 py-2 rounded transition-colors ${
              theme === 'dark'
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-red-500 hover:bg-red-400 text-white'
            }`}
            title="Close 3D Viewer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full pt-16" />

      {/* Instructions */}
      <div
        className={`absolute bottom-4 left-4 p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
        } shadow-lg max-w-xs`}
      >
        <h3 className="font-semibold mb-2">Controls:</h3>
        <ul className="text-sm space-y-1">
          <li>• Left click + drag: Rotate</li>
          <li>• Right click + drag: Pan</li>
          <li>• Scroll: Zoom</li>
          <li>• Auto-rotate button: Toggle rotation</li>
        </ul>
      </div>
    </div>
  );
};
