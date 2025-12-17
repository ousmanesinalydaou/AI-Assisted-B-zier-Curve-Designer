import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SurfaceData, VisualizationMode, Point3D, Theme } from '../types';

interface ViewerProps {
  surfaceData: SurfaceData | null;
  inputCurves: Point3D[][];
  mode: VisualizationMode;
  theme: Theme;
}

const Viewer3D: React.FC<ViewerProps> = ({ surfaceData, inputCurves, mode, theme }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const surfaceMeshRef = useRef<THREE.Mesh | null>(null);
  const wireframeRef = useRef<THREE.LineSegments | null>(null);
  const controlNetRef = useRef<THREE.Group | null>(null);
  const inputCurvesRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const isDark = theme === Theme.DARK;

  // Init Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    
    // Grid
    const gridHelper = new THREE.GridHelper(30, 30);
    gridHelper.position.y = -5;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x3b82f6, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(-5, 10, 10);
    scene.add(dirLight);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 8, 15);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    sceneRef.current = scene;
    rendererRef.current = renderer;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Use ResizeObserver for robust layout changes (e.g. sidebar toggle)
    const resizeObserver = new ResizeObserver(() => {
        if (!mountRef.current || !renderer || !camera) return;
        const newWidth = mountRef.current.clientWidth;
        const newHeight = mountRef.current.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });
    
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Theme Updates
  useEffect(() => {
    if (!sceneRef.current || !gridHelperRef.current) return;
    
    if (isDark) {
        sceneRef.current.background = new THREE.Color(0x0a0a0a);
        sceneRef.current.fog = new THREE.FogExp2(0x0a0a0a, 0.02);
        // Update Grid Colors for Dark Mode
        sceneRef.current.remove(gridHelperRef.current);
        const gh = new THREE.GridHelper(30, 30, 0x333333, 0x1a1a1a);
        gh.position.y = -5;
        sceneRef.current.add(gh);
        gridHelperRef.current = gh;
    } else {
        sceneRef.current.background = new THREE.Color(0xf8fafc); // Slate-50
        sceneRef.current.fog = new THREE.FogExp2(0xf8fafc, 0.015);
        sceneRef.current.remove(gridHelperRef.current);
        const gh = new THREE.GridHelper(30, 30, 0xcbd5e1, 0xe2e8f0);
        gh.position.y = -5;
        sceneRef.current.add(gh);
        gridHelperRef.current = gh;
    }

  }, [theme, isDark]);

  // Update Geometry
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // --- 1. Input Curves ---
    if (inputCurvesRef.current) {
      scene.remove(inputCurvesRef.current);
      inputCurvesRef.current.clear();
    }
    const curvesGroup = new THREE.Group();
    inputCurves.forEach(curve => {
      if (curve.length < 2) return;
      const points = curve.map(p => new THREE.Vector3(p.x, p.y, p.z));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
          color: isDark ? 0xf59e0b : 0xd97706, 
          opacity: 0.8, 
          transparent: true 
      });
      curvesGroup.add(new THREE.Line(geometry, material));
      
      const ptsGeo = new THREE.BufferGeometry().setFromPoints(points);
      const ptsMat = new THREE.PointsMaterial({ 
          color: isDark ? 0xfbbf24 : 0xf59e0b, 
          size: 0.15 
      });
      curvesGroup.add(new THREE.Points(ptsGeo, ptsMat));
    });
    inputCurvesRef.current = curvesGroup;
    scene.add(curvesGroup);


    if (!surfaceData) {
        if(surfaceMeshRef.current) { surfaceMeshRef.current.visible = false; }
        if(wireframeRef.current) { wireframeRef.current.visible = false; }
        if(controlNetRef.current) { controlNetRef.current.visible = false; }
        return;
    }

    // --- 2. Surface Mesh ---
    if (surfaceMeshRef.current) {
      scene.remove(surfaceMeshRef.current);
      surfaceMeshRef.current.geometry.dispose();
    }
    if (wireframeRef.current) {
      scene.remove(wireframeRef.current);
      wireframeRef.current.geometry.dispose();
    }

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(surfaceData.surfacePoints.flatMap(p => [p.x, p.y, p.z]));
    const indices = surfaceData.indices;

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhysicalMaterial({
      color: 0x3b82f6,
      side: THREE.DoubleSide,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.5,
      transparent: true,
      opacity: 0.9,
      wireframe: mode === VisualizationMode.WIREFRAME,
      flatShading: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    surfaceMeshRef.current = mesh;

    // --- 3. Wireframe Overlay ---
    if (mode === VisualizationMode.HYBRID || mode === VisualizationMode.SOLID) {
        scene.add(mesh);
        
        if (mode === VisualizationMode.HYBRID) {
          const wireGeo = new THREE.WireframeGeometry(geometry);
          const wireMat = new THREE.LineBasicMaterial({ color: isDark ? 0xa5f3fc : 0x1e3a8a, transparent: true, opacity: 0.15 });
          const wireframe = new THREE.LineSegments(wireGeo, wireMat);
          wireframeRef.current = wireframe;
          scene.add(wireframe);
        }
    } else if (mode === VisualizationMode.WIREFRAME) {
        scene.add(mesh);
    }

    // --- 4. Control Net ---
    if (controlNetRef.current) {
      scene.remove(controlNetRef.current);
      controlNetRef.current.clear();
    }
    const netGroup = new THREE.Group();
    const netColor = isDark ? 0xff4444 : 0xdc2626;

    // Lines U
    surfaceData.controlPoints.forEach(row => {
        const linePts = row.map(p => new THREE.Vector3(p.x, p.y, p.z));
        const geo = new THREE.BufferGeometry().setFromPoints(linePts);
        netGroup.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: netColor, opacity: 0.3, transparent: true })));
    });
    // Lines V
    const numRows = surfaceData.controlPoints.length;
    const numCols = surfaceData.controlPoints[0].length;
    for(let j=0; j<numCols; j++) {
        const linePts = [];
        for(let i=0; i<numRows; i++) {
            const p = surfaceData.controlPoints[i][j];
            linePts.push(new THREE.Vector3(p.x, p.y, p.z));
        }
        const geo = new THREE.BufferGeometry().setFromPoints(linePts);
        netGroup.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: netColor, opacity: 0.3, transparent: true })));
    }
    // Vertices
    const netPointsVertices: number[] = [];
    surfaceData.controlPoints.forEach(row => row.forEach(p => netPointsVertices.push(p.x, p.y, p.z)));
    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute('position', new THREE.Float32BufferAttribute(netPointsVertices, 3));
    const pointsMat = new THREE.PointsMaterial({ color: netColor, size: 0.12 });
    netGroup.add(new THREE.Points(pointsGeo, pointsMat));

    controlNetRef.current = netGroup;
    scene.add(netGroup);

  }, [surfaceData, inputCurves, mode, isDark]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

export default Viewer3D;