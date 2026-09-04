import React, { useEffect, useRef, useState, useCallback } from 'react';
import { JanmashtamiWorld, SCENES } from './three/JanmashtamiWorld.ts';
import { LoadingScreen } from './components/LoadingScreen.tsx';
import { StoryOverlay } from './components/StoryOverlay.tsx';
import { HUD } from './components/HUD.tsx';
import { BlessingModal } from './components/BlessingModal.tsx';
import { KrishnaGLBViewerModal } from './components/KrishnaGLBViewerModal.tsx';
import { soundEngine } from './utils/audio.ts';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<JanmashtamiWorld | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isOrbitMode, setIsOrbitMode] = useState(false);
  const [isBlessingOpen, setIsBlessingOpen] = useState(false);
  const [isKrishnaModelOpen, setIsKrishnaModelOpen] = useState(false);
  const [interactionNotice, setInteractionNotice] = useState<string | null>(null);
  const noticeTimeoutRef = useRef<number | null>(null);
  const scrollLockRef = useRef<boolean>(false);

  // Show temporary interaction toast
  const showNotice = useCallback((_name: string, message: string) => {
    if (noticeTimeoutRef.current) clearTimeout(noticeTimeoutRef.current);
    setInteractionNotice(message);
    noticeTimeoutRef.current = window.setTimeout(() => {
      setInteractionNotice(null);
    }, 3800);
  }, []);

  // Initialize Three.js 3D World
  useEffect(() => {
    if (!containerRef.current) return;

    const world = new JanmashtamiWorld(containerRef.current, {
      onInteraction: (name, message) => showNotice(name, message),
      onSceneChange: (idx) => setCurrentSceneIndex(idx),
    });
    worldRef.current = world;

    return () => {
      world.destroy();
      worldRef.current = null;
    };
  }, [showNotice]);

  // Scroll wheel navigation through the 10 scenes
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isOrbitMode || isBlessingOpen || isKrishnaModelOpen) return;

      // Debounce scroll events to prevent jumping too many scenes
      if (scrollLockRef.current) return;
      if (Math.abs(e.deltaY) < 30) return;

      scrollLockRef.current = true;
      setTimeout(() => {
        scrollLockRef.current = false;
      }, 700);

      if (e.deltaY > 0) {
        worldRef.current?.nextScene();
      } else {
        worldRef.current?.prevScene();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isOrbitMode, isBlessingOpen, isKrishnaModelOpen]);

  // Keyboard navigation (Arrow keys / Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isBlessingOpen || isKrishnaModelOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        worldRef.current?.nextScene();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        worldRef.current?.prevScene();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBlessingOpen, isKrishnaModelOpen]);

  // Ensure background music plays smoothly on user interaction if sound is active
  useEffect(() => {
    const handleGesture = () => {
      if (!soundEngine.getMuted()) {
        soundEngine.playBackgroundMusic();
      }
    };
    window.addEventListener('pointerdown', handleGesture);
    return () => window.removeEventListener('pointerdown', handleGesture);
  }, []);

  const handleEnterWorld = () => {
    setIsLoading(false);
    // Unmute & start serene bansuri music on user entry gesture
    soundEngine.toggleMute();
    worldRef.current?.setSceneIndex(0);
  };

  const handleSelectScene = (idx: number) => {
    worldRef.current?.setSceneIndex(idx);
  };

  const handleNextScene = () => {
    worldRef.current?.nextScene();
  };

  const handlePrevScene = () => {
    worldRef.current?.prevScene();
  };

  const handleToggleOrbit = () => {
    if (!worldRef.current) return;
    const active = worldRef.current.toggleOrbitMode();
    setIsOrbitMode(active);
    if (active) {
      showNotice('camera', 'Free 3D Look active! Click and drag around to explore Gokul.');
    } else {
      showNotice('camera', 'Returned to Story Camera.');
    }
  };

  const handleShowerPetals = () => {
    worldRef.current?.triggerFlowerShower();
    showNotice('shower', 'Marigold and jasmine petals shower across Gokul!');
  };

  const handleOpenBlessing = () => {
    worldRef.current?.triggerBlessing();
    setIsBlessingOpen(true);
  };

  const handleOpenKrishnaModel = () => {
    setIsKrishnaModelOpen(true);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#070b19] select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div
        id="janmashtami-canvas-container"
        ref={containerRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Loading Sequence */}
      {isLoading && <LoadingScreen onEnter={handleEnterWorld} />}

      {/* Story Subtitles & Scene Navigation Overlay */}
      {!isLoading && (
        <StoryOverlay
          currentScene={SCENES[currentSceneIndex]}
          totalScenes={SCENES.length}
          onNext={handleNextScene}
          onPrev={handlePrevScene}
          onSelectScene={handleSelectScene}
          onOpenKrishnaModel={handleOpenKrishnaModel}
        />
      )}

      {/* Floating Bottom HUD Controls */}
      {!isLoading && (
        <HUD
          isOrbitMode={isOrbitMode}
          onToggleOrbit={handleToggleOrbit}
          onShowerPetals={handleShowerPetals}
          onOpenBlessing={handleOpenBlessing}
          onOpenKrishnaModel={handleOpenKrishnaModel}
          interactionNotice={interactionNotice}
        />
      )}

      {/* Janmashtami Blessing Dialog */}
      <BlessingModal
        isOpen={isBlessingOpen}
        onClose={() => setIsBlessingOpen(false)}
      />

      {/* Dedicated 3D GLB Model Viewer (Native WebGL Three.js Krishna & Radha Model) */}
      <KrishnaGLBViewerModal
        isOpen={isKrishnaModelOpen}
        onClose={() => setIsKrishnaModelOpen(false)}
        onJumpToScene={(idx) => worldRef.current?.setSceneIndex(idx)}
      />
    </main>
  );
}
