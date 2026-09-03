import React from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Box } from 'lucide-react';
import { CameraWaypoint } from '../three/JanmashtamiWorld.ts';

interface StoryOverlayProps {
  currentScene: CameraWaypoint;
  totalScenes: number;
  onNext: () => void;
  onPrev: () => void;
  onSelectScene: (idx: number) => void;
  onOpenKrishnaModel: () => void;
}

export const StoryOverlay: React.FC<StoryOverlayProps> = ({
  currentScene,
  totalScenes,
  onNext,
  onPrev,
  onSelectScene,
  onOpenKrishnaModel,
}) => {
  const currentIndex = currentScene.id;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header Bar: Branding, 3D GLB Studio Trigger, and Scene Progress */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1e293b]/70 border border-[#f59e0b]/30 flex items-center justify-center backdrop-blur-md shadow-lg shadow-amber-500/10">
            <span className="font-cinzel text-xs font-bold text-[#fef08a]">
              {String(currentIndex + 1).padStart(2, '0')}
            </span>
          </div>
          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#38bdf8] font-semibold block">
              Gokul Chronicles • 2026
            </span>
            <span className="text-xs text-[#cbd5e1] font-medium hidden sm:inline">
              Scene {currentIndex + 1} of {totalScenes}
            </span>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {/* Quick Access to Krishna 3D GLB Studio */}
          <button
            id="top-3d-models-button"
            onClick={onOpenKrishnaModel}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-400/40 text-amber-200 text-xs font-medium backdrop-blur-md shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
            title="Open Krishna & Radha 3D GLB Darshan"
          >
            <Box className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-semibold">Krishna 3D (GLB)</span>
            <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full">
              3D
            </span>
          </button>

          {/* Minimal Progress Bar */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-[#0f172a]/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {Array.from({ length: totalScenes }).map((_, idx) => (
              <button
                key={idx}
                id={`progress-dot-${idx}`}
                onClick={() => onSelectScene(idx)}
                title={`Go to Scene ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? 'w-6 bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                    : 'w-1.5 bg-white/25 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Story & Typography Card */}
      <div className="flex flex-col sm:flex-row items-end sm:items-end justify-between gap-4 pb-14 sm:pb-2">
        {/* Story Text Box */}
        <div className="pointer-events-auto max-w-xl bg-gradient-to-t from-[#070b19]/95 via-[#0b1329]/85 to-[#0b1329]/50 backdrop-blur-lg border border-amber-500/20 p-5 sm:p-6 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.5)] transition-all duration-500">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#f59e0b]">
              {currentScene.subtitle}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[11px] text-[#94a3b8] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400 inline" />
              {currentScene.tagline}
            </span>
          </div>

          <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#fef3c7] tracking-wide mb-2 text-glow-gold">
            {currentScene.title}
          </h2>

          <p className="text-sm text-[#cbd5e1] font-light leading-relaxed mb-3">
            {currentScene.quote}
          </p>

          {/* Contextual 3D Model Inspection Action Pill for Scene 2 (Little Krishna) */}
          {currentIndex === 2 && (
            <div className="mb-3">
              <button
                id="inspect-krishna-glb-model"
                onClick={onOpenKrishnaModel}
                className="w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-amber-500/15 to-transparent border border-amber-400/50 hover:border-amber-400 text-amber-100 text-xs font-medium transition-all duration-200 cursor-pointer shadow-lg hover:shadow-amber-500/20"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base group-hover:scale-110 transition-transform">
                    🦚
                  </span>
                  <div className="text-left">
                    <span className="font-semibold text-amber-200 block">
                      Divine 3D Darshan: Sri Radha-Krishna
                    </span>
                    <span className="text-[10px] text-slate-300">
                      High-detail 3D GLB Model (krishna+radha+3d+model.glb)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-400/20 px-2 py-1 rounded-md border border-amber-300/40 text-[11px] text-amber-200 font-semibold group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                  <Box className="w-3 h-3" />
                  <span>3D Darshan</span>
                </div>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-white/10">
            <span className="font-telugu font-semibold text-sm text-[#f59e0b] tracking-wide">
              జై శ్రీ కృష్ణ
            </span>
            <span className="text-[11px] text-[#64748b]">
              Use arrows or scroll to journey
            </span>
          </div>
        </div>

        {/* Cinematic Arrow Navigation */}
        <div className="pointer-events-auto flex items-center gap-2 self-center sm:self-end">
          <button
            id="prev-scene-button"
            onClick={onPrev}
            disabled={currentIndex === 0}
            className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 cursor-pointer ${
              currentIndex === 0
                ? 'opacity-30 border-white/10 bg-black/20 cursor-not-allowed'
                : 'border-[#f59e0b]/40 bg-[#0f172a]/80 text-[#fef08a] hover:bg-[#1e293b] hover:border-[#f59e0b] active:scale-95 shadow-lg'
            }`}
            title="Previous Scene"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            id="next-scene-button"
            onClick={onNext}
            disabled={currentIndex === totalScenes - 1}
            className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 cursor-pointer ${
              currentIndex === totalScenes - 1
                ? 'opacity-30 border-white/10 bg-black/20 cursor-not-allowed'
                : 'border-[#f59e0b]/40 bg-[#0f172a]/80 text-[#fef08a] hover:bg-[#1e293b] hover:border-[#f59e0b] active:scale-95 shadow-lg shadow-amber-500/10'
            }`}
            title="Next Scene"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
