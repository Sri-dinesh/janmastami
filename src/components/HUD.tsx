import React, { useState } from 'react';
import { Volume2, VolumeX, Compass, Camera, Sparkles, Gift, Box } from 'lucide-react';
import { soundEngine } from '../utils/audio.ts';

interface HUDProps {
  isOrbitMode: boolean;
  onToggleOrbit: () => void;
  onShowerPetals: () => void;
  onOpenBlessing: () => void;
  onOpenKrishnaModel: () => void;
  interactionNotice: string | null;
}

export const HUD: React.FC<HUDProps> = ({
  isOrbitMode,
  onToggleOrbit,
  onShowerPetals,
  onOpenBlessing,
  onOpenKrishnaModel,
  interactionNotice,
}) => {
  const [isAudioActive, setIsAudioActive] = useState(!soundEngine.getMuted());

  const handleToggleAudio = () => {
    const active = soundEngine.toggleMute();
    setIsAudioActive(active);
  };

  return (
    <>
      {/* Dynamic Interaction Toast Notice */}
      {interactionNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 animate-bounce pointer-events-none">
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-600/90 to-amber-800/90 border border-amber-300/40 text-amber-100 px-4 py-2 rounded-full shadow-2xl backdrop-blur-md text-xs sm:text-sm font-medium">
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>{interactionNotice}</span>
          </div>
        </div>
      )}

      {/* Floating Control Bar at Bottom Center */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2 bg-[#0b1329]/85 backdrop-blur-xl border border-amber-500/35 px-2.5 sm:px-3.5 py-2 rounded-full shadow-2xl max-w-[95vw] overflow-x-auto">
        {/* Sound Toggle */}
        <button
          id="sound-toggle-button"
          onClick={handleToggleAudio}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer shrink-0 ${
            isAudioActive
              ? 'bg-amber-500/20 border border-amber-400/50 text-amber-200'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
          title={isAudioActive ? 'Mute Flute & Ambience' : 'Play Bansuri & Ambient Sound'}
        >
          {isAudioActive ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden md:inline">Bansuri Sound</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Sound Off</span>
            </>
          )}
        </button>

        {/* Orbit / Free Camera Toggle */}
        <button
          id="camera-mode-button"
          onClick={onToggleOrbit}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer shrink-0 ${
            isOrbitMode
              ? 'bg-sky-500/25 border border-sky-400/60 text-sky-200'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
          title={isOrbitMode ? 'Switch to Story Cinematic Walk' : 'Switch to Free 3D Orbit View'}
        >
          {isOrbitMode ? (
            <>
              <Compass className="w-3.5 h-3.5 text-sky-300 animate-spin" />
              <span className="hidden md:inline">Free 3D Look</span>
            </>
          ) : (
            <>
              <Camera className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden md:inline">Story Camera</span>
            </>
          )}
        </button>

        {/* Krishna 3D GLB Model Darshan Toggle */}
        <button
          id="hud-3d-models-button"
          onClick={onOpenKrishnaModel}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/25 hover:from-amber-500/35 hover:to-amber-600/40 text-amber-200 border border-amber-400/50 text-xs font-medium transition-all duration-200 cursor-pointer active:scale-95 shadow-md shadow-amber-500/10 shrink-0"
          title="Inspect Krishna & Radha 3D Model (GLB)"
        >
          <Box className="w-3.5 h-3.5 text-amber-300" />
          <span className="font-semibold">Krishna 3D (GLB)</span>
        </button>

        {/* Flower Shower Button */}
        <button
          id="flower-shower-button"
          onClick={onShowerPetals}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-full bg-amber-500/10 hover:bg-amber-500/25 text-amber-200 border border-amber-500/30 text-xs font-medium transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
          title="Shower Marigold Petals"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Petal Shower</span>
        </button>

        {/* One Little Blessing Modal Button */}
        <button
          id="blessing-modal-button"
          onClick={onOpenBlessing}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-medium shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
          title="Receive Krishna's Blessing"
        >
          <Gift className="w-3.5 h-3.5 text-yellow-200" />
          <span className="font-semibold">One Little Blessing</span>
        </button>
      </div>
    </>
  );
};
