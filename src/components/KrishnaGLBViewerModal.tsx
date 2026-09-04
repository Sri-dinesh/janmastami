import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  X,
  Maximize2,
  Minimize2,
  Sparkles,
  RotateCw,
  Music,
  Heart,
  Sun,
  Moon,
  Flame,
  RefreshCw,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { soundEngine } from '../utils/audio.ts';

interface KrishnaGLBViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToScene: (sceneIdx: number) => void;
}

type LightingPreset = 'temple' | 'twilight' | 'moonlit';

export const KrishnaGLBViewerModal: React.FC<KrishnaGLBViewerModalProps> = ({
  isOpen,
  onClose,
  onJumpToScene,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [lighting, setLighting] = useState<LightingPreset>('temple');
  const [activeModel, setActiveModel] = useState<'cute-krishna' | 'radha-krishna' | 'krisha-flute'>('cute-krishna');
  const [isBlessingActive, setIsBlessingActive] = useState<boolean>(false);

  // References to Three.js instances for dynamic control
  const threeStateRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    modelGroup: THREE.Group;
    ambientLight: THREE.AmbientLight;
    mainLight: THREE.DirectionalLight;
    rimLight: THREE.PointLight;
    haloMesh: THREE.Mesh;
    pedestalGroup: THREE.Group;
    petals: THREE.Points;
    petalPositions: Float32Array;
    petalVelocities: Float32Array;
    isPetalShowerActive: boolean;
    animFrameId: number | null;
    loadGLTF?: (modelType: 'cute-krishna' | 'radha-krishna' | 'krisha-flute') => void;
  } | null>(null);

  // Initialize WebGL Three.js viewer whenever opened and not minimized
  useEffect(() => {
    if (!isOpen || isMinimized || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b19);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 3.8);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.2;
    controls.maxDistance = 8.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // don't go too far under floor
    controls.target.set(0, 1.1, 0);
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.5;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff3d6, 0.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfffbeb, 2.0);
    mainLight.position.set(4, 7, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.bias = -0.001;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.7);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xf59e0b, 2.5, 10);
    rimLight.position.set(0, 3.0, 2.0);
    scene.add(rimLight);

    // 6. Lotus Pedestal (Padmasana)
    const pedestalGroup = new THREE.Group();
    const pedestalBaseGeo = new THREE.CylinderGeometry(1.2, 1.35, 0.18, 32);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.3,
    });
    const pedestalBase = new THREE.Mesh(pedestalBaseGeo, goldMat);
    pedestalBase.receiveShadow = true;
    pedestalGroup.add(pedestalBase);

    // Lotus petals ring
    const petalCount = 16;
    const petalGeo = new THREE.ConeGeometry(0.18, 0.45, 5);
    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.4,
    });
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.position.set(Math.cos(angle) * 1.15, 0.12, Math.sin(angle) * 1.15);
      petal.rotation.x = Math.PI / 3;
      petal.rotation.y = -angle + Math.PI / 2;
      pedestalGroup.add(petal);
    }
    pedestalGroup.position.y = 0.09;
    scene.add(pedestalGroup);

    // 7. Divine Aura / Halo disk behind head
    const haloGeo = new THREE.RingGeometry(0.7, 0.95, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.set(0, 1.85, -0.3);
    scene.add(haloMesh);

    // 8. Petal Particle System (with smooth circular soft texture, no square artifacts)
    const petalCanvas = document.createElement('canvas');
    petalCanvas.width = 48;
    petalCanvas.height = 48;
    const petalCtx = petalCanvas.getContext('2d');
    if (petalCtx) {
      const pGrad = petalCtx.createRadialGradient(24, 24, 0, 24, 24, 23);
      pGrad.addColorStop(0, 'rgba(255, 248, 220, 1)');
      pGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.85)');
      pGrad.addColorStop(0.8, 'rgba(234, 88, 12, 0.4)');
      pGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
      petalCtx.fillStyle = pGrad;
      petalCtx.beginPath();
      petalCtx.arc(24, 24, 23, 0, Math.PI * 2);
      petalCtx.fill();
    }
    const petalTexture = new THREE.CanvasTexture(petalCanvas);
    petalTexture.needsUpdate = true;

    const petalParticleCount = 60;
    const petalPositions = new Float32Array(petalParticleCount * 3);
    const petalVelocities = new Float32Array(petalParticleCount * 3);
    for (let i = 0; i < petalParticleCount; i++) {
      // Keep petals around the periphery, not directly obstructing the face
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.8 + Math.random() * 1.6;
      petalPositions[i * 3] = Math.cos(angle) * radius;
      petalPositions[i * 3 + 1] = Math.random() * 4 + 0.5;
      petalPositions[i * 3 + 2] = Math.sin(angle) * radius;

      petalVelocities[i * 3] = (Math.random() - 0.5) * 0.015;
      petalVelocities[i * 3 + 1] = -0.012 - Math.random() * 0.015;
      petalVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.015;
    }
    const petalParticlesGeo = new THREE.BufferGeometry();
    petalParticlesGeo.setAttribute('position', new THREE.BufferAttribute(petalPositions, 3));
    const petalParticlesMat = new THREE.PointsMaterial({
      map: petalTexture,
      size: 0.15,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const petals = new THREE.Points(petalParticlesGeo, petalParticlesMat);
    scene.add(petals);

    // 9. Model Group & GLTF Loader
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    const loader = new GLTFLoader();

    const loadGLTF = (modelType: 'cute-krishna' | 'radha-krishna' | 'krisha-flute') => {
      // Clear previous model from scene
      while (modelGroup.children.length > 0) {
        modelGroup.remove(modelGroup.children[0]);
      }
      setIsLoaded(false);
      setLoadProgress(15);
      setLoadError(null);

      const filePath =
        modelType === 'cute-krishna'
          ? '/cute-krishna.glb'
          : modelType === 'krisha-flute'
          ? '/krisha-flute.glb'
          : '/krishna-radha.glb';
      const fallbackPath =
        modelType === 'cute-krishna'
          ? 'cute-krishna.glb'
          : modelType === 'krisha-flute'
          ? 'krisha-flute.glb'
          : undefined;

      const handleSuccess = (gltf: any) => {
        const root = gltf.scene;

        // Calculate bounding box to normalize scale and center
        const box = new THREE.Box3().setFromObject(root);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Scale model to standard height
        const targetHeight = modelType === 'krisha-flute' ? 2.0 : 2.2;
        const maxDim = modelType === 'krisha-flute' ? Math.max(size.x, size.y, size.z) || 1 : (size.y || 1);
        const scaleFactor = targetHeight / maxDim;
        root.scale.set(scaleFactor, scaleFactor, scaleFactor);

        if (modelType === 'krisha-flute') {
          // Standing vertically upright
          root.rotation.set(0.0, 0.25, 0.0);
          root.position.x = -center.x * scaleFactor;
          root.position.z = -center.z * scaleFactor;
          root.position.y = -box.min.y * scaleFactor + 0.18;
        } else {
          // Center on X and Z, set base right on top of lotus pedestal
          root.position.x = -center.x * scaleFactor;
          root.position.z = -center.z * scaleFactor;
          root.position.y = -box.min.y * scaleFactor + 0.18;
        }

        // Enable shadows and enhance materials
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              mats.forEach((m) => {
                m.side = THREE.DoubleSide;
                if (m instanceof THREE.MeshStandardMaterial) {
                  m.roughness = Math.max(0.35, m.roughness);
                  m.envMapIntensity = 1.3;
                }
              });
            }
          }
        });

        modelGroup.add(root);
        setIsLoaded(true);
        setLoadProgress(100);
      };

      const tryLoad = (url: string, fallback?: string) => {
        loader.load(
          url,
          handleSuccess,
          (xhr) => {
            if (xhr.total > 0) {
              setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
            } else {
              setLoadProgress((prev) => Math.min(prev + 15, 90));
            }
          },
          (error) => {
            if (fallback) {
              tryLoad(fallback);
            } else {
              console.error('Error loading GLB:', error);
              setLoadError('Failed to load the 3D model. Please verify file path.');
            }
          }
        );
      };

      tryLoad(filePath, fallbackPath);
    };

    // Load initial active model
    loadGLTF(activeModel);

    // Save Three.js state reference
    threeStateRef.current = {
      scene,
      camera,
      renderer,
      controls,
      modelGroup,
      ambientLight,
      mainLight,
      rimLight,
      haloMesh,
      pedestalGroup,
      petals,
      petalPositions,
      petalVelocities,
      isPetalShowerActive: true,
      animFrameId: null,
      loadGLTF,
    };

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      const state = threeStateRef.current;
      if (!state) return;

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Controls update (auto-rotate, damping)
      state.controls.update();

      // Gentle floating/breathing animation for Sri Radha-Krishna
      state.modelGroup.position.y = Math.sin(elapsed * 1.6) * 0.025;

      // Halo subtle shimmer
      state.haloMesh.rotation.z += 0.005;
      (state.haloMesh.material as THREE.MeshBasicMaterial).opacity =
        0.6 + Math.sin(elapsed * 3) * 0.15;

      // Lotus pedestal slow subtle glow
      state.pedestalGroup.rotation.y = elapsed * 0.05;

      // Petal Shower update
      const positions = state.petalPositions;
      const velocities = state.petalVelocities;
      for (let i = 0; i < petalParticleCount; i++) {
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        positions[i * 3] += Math.sin(elapsed + i) * 0.002;
        if (positions[i * 3 + 1] < 0.1) {
          positions[i * 3 + 1] = 4.0;
          positions[i * 3] = (Math.random() - 0.5) * 3;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
        }
      }
      state.petals.geometry.attributes.position.needsUpdate = true;

      // Render
      state.renderer.render(state.scene, state.camera);
      state.animFrameId = requestAnimationFrame(animate);
    };

    threeStateRef.current.animFrameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (threeStateRef.current?.animFrameId !== null) {
        cancelAnimationFrame(threeStateRef.current.animFrameId);
      }
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      threeStateRef.current = null;
    };
  }, [isOpen, isMinimized]);

  // Sync auto-rotate state with Three.js controls
  useEffect(() => {
    if (threeStateRef.current) {
      threeStateRef.current.controls.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Sync activeModel with Three.js loader
  useEffect(() => {
    if (threeStateRef.current?.loadGLTF) {
      threeStateRef.current.loadGLTF(activeModel);
    }
  }, [activeModel]);

  // Lighting preset switcher
  useEffect(() => {
    const state = threeStateRef.current;
    if (!state) return;

    if (lighting === 'temple') {
      state.ambientLight.color.setHex(0xfff3d6);
      state.ambientLight.intensity = 0.9;
      state.mainLight.color.setHex(0xffedd5);
      state.mainLight.intensity = 2.2;
      state.rimLight.color.setHex(0xf59e0b);
      state.rimLight.intensity = 2.5;
      state.scene.background = new THREE.Color(0x0c1322);
    } else if (lighting === 'twilight') {
      state.ambientLight.color.setHex(0x93c5fd);
      state.ambientLight.intensity = 0.6;
      state.mainLight.color.setHex(0xfef08a);
      state.mainLight.intensity = 1.6;
      state.rimLight.color.setHex(0x38bdf8);
      state.rimLight.intensity = 2.0;
      state.scene.background = new THREE.Color(0x060919);
    } else if (lighting === 'moonlit') {
      state.ambientLight.color.setHex(0x38bdf8);
      state.ambientLight.intensity = 0.5;
      state.mainLight.color.setHex(0xe0f2fe);
      state.mainLight.intensity = 1.4;
      state.rimLight.color.setHex(0x818cf8);
      state.rimLight.intensity = 1.8;
      state.scene.background = new THREE.Color(0x040612);
    }
  }, [lighting]);

  if (!isOpen) return null;

  const handleResetCamera = () => {
    const state = threeStateRef.current;
    if (state) {
      state.camera.position.set(0, 1.4, 3.8);
      state.controls.target.set(0, 1.1, 0);
      state.controls.update();
    }
  };

  const handleShowerPetals = () => {
    soundEngine.playTempleBell();
    // Reset all petals to top
    const state = threeStateRef.current;
    if (state) {
      const pos = state.petalPositions;
      for (let i = 0; i < pos.length / 3; i++) {
        pos[i * 3 + 1] = Math.random() * 3 + 2.5;
      }
      state.petals.geometry.attributes.position.needsUpdate = true;
    }
  };

  const handlePlayFlute = () => {
    soundEngine.playFlutePhrase();
  };

  const handleReceiveBlessing = () => {
    setIsBlessingActive(true);
    soundEngine.playBlessingChime();
    handleShowerPetals();
    setTimeout(() => setIsBlessingActive(false), 2500);
  };

  const handleJumpToScene = () => {
    onJumpToScene(2); // Scene 2 is Little Krishna
    onClose();
  };

  // Minimized PiP Viewport
  if (isMinimized) {
    return (
      <div
        id="minimized-krishna-pip"
        className="fixed bottom-20 right-4 z-50 w-72 sm:w-80 bg-[#0b1329]/95 border border-amber-500/40 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300"
      >
        <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-amber-500/20 to-transparent border-b border-amber-500/20">
          <div className="flex items-center gap-2 truncate">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-xs font-semibold text-amber-200 truncate font-cinzel">
              Sri Sri Radha Krishna (GLB)
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 text-slate-300 hover:text-amber-200 rounded hover:bg-white/10 transition-colors"
              title="Expand 3D Darshan Studio"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-300 hover:text-red-300 rounded hover:bg-white/10 transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-3 bg-[#070b19] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 text-[11px]">Native WebGL 3D Model</span>
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-amber-400 hover:text-amber-300 font-semibold underline text-xs"
          >
            Full Darshan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="krishna-glb-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="krishna-glb-modal-container"
        className="relative w-full max-w-5xl h-[92vh] max-h-[820px] bg-[#070b19] border border-amber-500/40 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-slate-200"
      >
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-gradient-to-r from-[#0d1633] via-[#091024] to-[#0d1633] border-b border-amber-500/25">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-md">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-amber-400">
                  Divine 3D GLB Model
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Native WebGL
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-cinzel font-bold text-[#fef08a] truncate">
                {activeModel === 'cute-krishna'
                  ? 'Cute Bal Krishna (Vrindavan Jhula)'
                  : activeModel === 'krisha-flute'
                  ? "Sri Krishna's Divine Bansuri (Flute)"
                  : 'Sri Sri Radha Krishna Jugal Jodi'}
              </h3>
            </div>
          </div>

          {/* Model Switcher & Controls */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
            {/* Model Switcher Pills */}
            <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-amber-500/30 text-xs">
              <button
                onClick={() => setActiveModel('cute-krishna')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  activeModel === 'cute-krishna'
                    ? 'bg-amber-500 text-black font-semibold shadow-sm'
                    : 'text-amber-200/70 hover:text-white'
                }`}
                title="Cute Bal Krishna on Jhula"
              >
                Cute Bal Krishna (Jhula)
              </button>
              <button
                onClick={() => setActiveModel('radha-krishna')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  activeModel === 'radha-krishna'
                    ? 'bg-amber-500 text-black font-semibold shadow-sm'
                    : 'text-amber-200/70 hover:text-white'
                }`}
                title="Sri Radha Krishna on Altar"
              >
                Sri Radha Krishna (Altar)
              </button>
              <button
                onClick={() => setActiveModel('krisha-flute')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  activeModel === 'krisha-flute'
                    ? 'bg-amber-500 text-black font-semibold shadow-sm'
                    : 'text-amber-200/70 hover:text-white'
                }`}
                title="Sacred Krishna Bansuri (Flute)"
              >
                Divine Bansuri (Flute)
              </button>
            </div>
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setLighting('temple')}
                className={`p-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                  lighting === 'temple'
                    ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Golden Mandir Aarti Lighting"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Aarti</span>
              </button>
              <button
                onClick={() => setLighting('twilight')}
                className={`p-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                  lighting === 'twilight'
                    ? 'bg-sky-500/30 text-sky-200 border border-sky-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Gokul Twilight Lighting"
              >
                <Sun className="w-3.5 h-3.5 text-sky-300" />
                <span className="hidden md:inline">Twilight</span>
              </button>
              <button
                onClick={() => setLighting('moonlit')}
                className={`p-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                  lighting === 'moonlit'
                    ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Vrindavan Moonlit Night"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-300" />
                <span className="hidden md:inline">Moonlit</span>
              </button>
            </div>

            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-2 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                autoRotate
                  ? 'bg-amber-500/20 border-amber-400/40 text-amber-200'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
              title="Toggle 360° Auto-Rotation"
            >
              <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Spin</span>
            </button>

            <button
              onClick={handleResetCamera}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white text-xs transition-colors"
              title="Reset Camera View"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 text-slate-300 hover:text-amber-200 rounded-lg hover:bg-white/10 transition-colors"
              title="Minimize to Corner (PiP)"
            >
              <Minimize2 className="w-4 h-4" />
            </button>

            <button
              id="close-krishna-glb-modal"
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-red-400 rounded-lg hover:bg-white/10 transition-colors"
              title="Close Darshan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* Three.js 3D Viewport */}
          <div className="flex-1 relative bg-[#04060e] flex items-center justify-center min-h-[300px]">
            <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Loading Overlay */}
            {!isLoaded && !loadError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#070b19]/90 backdrop-blur-md p-6">
                <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin mb-4" />
                <h4 className="font-cinzel text-amber-200 text-lg font-semibold mb-2">
                  Loading Sri Radha-Krishna 3D Model...
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  Streaming 16 MB high-detail GLB mesh & textures
                </p>
                <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
                <span className="text-xs text-amber-300 font-mono mt-2">{loadProgress}%</span>
              </div>
            )}

            {loadError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#070b19]/95 p-6 text-center">
                <p className="text-red-400 text-sm mb-3">{loadError}</p>
                <button
                  onClick={handleResetCamera}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-semibold"
                >
                  Retry Loading
                </button>
              </div>
            )}

            {/* Interaction Helper Pill */}
            <div className="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-slate-300">
              <RotateCw className="w-3 h-3 text-amber-400 animate-spin" />
              <span>Left-drag to Orbit 360° • Pinch / Scroll to Zoom • Right-drag to Pan</span>
            </div>

            {/* In-Canvas Floating Action Floating Dock */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-[#0b1329]/80 backdrop-blur-xl border border-amber-500/30 px-3 py-2 rounded-full shadow-2xl">
              <button
                onClick={handleShowerPetals}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 text-xs font-medium transition-all duration-200 cursor-pointer active:scale-95"
                title="Shower Golden Flower Petals"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Shower Flowers</span>
              </button>

              <button
                onClick={handlePlayFlute}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/40 text-xs font-medium transition-all duration-200 cursor-pointer active:scale-95"
                title="Play Divine Bansuri Melody"
              >
                <Music className="w-3.5 h-3.5 text-sky-400" />
                <span>Divine Bansuri</span>
              </button>

              <button
                onClick={handleReceiveBlessing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-medium shadow-md transition-all duration-200 cursor-pointer active:scale-95"
                title="Receive Divine Blessing"
              >
                <Heart className="w-3.5 h-3.5 text-yellow-200" />
                <span>Receive Blessing</span>
              </button>
            </div>
          </div>

          {/* Side Details & Devotional Panel */}
          <div className="w-full lg:w-80 xl:w-96 bg-[#090f20]/95 border-t lg:border-t-0 lg:border-l border-amber-500/20 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              {/* Asset Details Pill */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                <span className="text-slate-400">File Asset:</span>
                <span className="font-mono text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {activeModel === 'cute-krishna'
                    ? 'cute-krishna.glb'
                    : activeModel === 'krisha-flute'
                    ? 'krisha-flute.glb'
                    : 'krishna-radha.glb'}
                </span>
              </div>

              {/* Telugu Shloka Card */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-400">
                    Janmashtami Mahamantra
                  </span>
                  <span className="font-telugu font-semibold text-xs text-amber-300">శ్రీ కృష్ణ శరణం మమ</span>
                </div>
                <p className="font-telugu text-xs font-semibold text-[#fef08a] leading-relaxed">
                  "వసుదేవసుతం దేవం కంసచాణూరమర్దనమ్ |
                  <br />
                  దేవకీపరమానందం కృష్ణం వందే జగద్గురుమ్ ||"
                </p>
                <p className="font-telugu text-[11px] text-slate-300 leading-relaxed">
                  వసుదేవుని కుమారుడు, కంస-చాణూరులను సంహరించినవాడు, జగద్గురువు అయిన శ్రీకృష్ణునికి ప్రణామములు.
                </p>
              </div>

              {/* About the Jugal Jodi */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  About Sri Radha-Krishna Jugal Jodi
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Radha and Krishna together represent the eternal union of pure divine love
                  (Prema) and the Supreme Divine. In Vrindavan, their pastimes illuminate the joy of
                  devotion, beauty, and unconditional surrender.
                </p>
              </div>

              {/* Highlights */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Model Features
                </h4>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>High-poly GLB geometry with PBR metallic-roughness textures</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Golden Padmasana lotus pedestal with soft radial glow</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Dynamic Three.js lighting, shadows, and interactive flower shower</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>100% native WebGL renderer with zero external iframe dependencies</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
              <button
                id="jump-to-krishna-scene"
                onClick={handleJumpToScene}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium text-xs shadow-lg shadow-amber-600/30 transition-all duration-200 cursor-pointer active:scale-98"
              >
                <MapPin className="w-3.5 h-3.5 text-yellow-200" />
                <span>Visit Gokul Courtyard (Scene 2)</span>
              </button>

              <button
                onClick={() => setIsMinimized(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-colors cursor-pointer"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Keep in Corner View (PiP)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
