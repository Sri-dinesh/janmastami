import React, { useState, useEffect } from 'react';
import { Sparkles, Moon, Flame } from 'lucide-react';
import { isMobile } from '../utils/device.ts';

interface LoadingScreenProps {
  onEnter: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onEnter }) => {
  const [step, setStep] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Step progression for evocative Janmashtami sequence (snappier on mobile)
    const t1 = setTimeout(() => setStep(2), isMobile ? 250 : 700);
    const t2 = setTimeout(() => setStep(3), isMobile ? 550 : 1500);
    const t3 = setTimeout(() => setStep(4), isMobile ? 950 : 2200);
    const t4 = setTimeout(() => {
      setStep(5);
      setIsLoaded(true);
    }, isMobile ? 1350 : 2900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <div
      id="loading-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070b19] px-6 text-center select-none"
    >
      {/* Subtle night stars background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#131f42]/40 via-[#070b19]/80 to-[#070b19] pointer-events-none" />

      {/* Decorative Moon & Diya Icons */}
      <div className="relative mb-8 flex items-center justify-center">
        <div
          className={`transition-all duration-1000 transform ${
            step >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#fef08a] to-[#fffbeb] shadow-[0_0_60px_rgba(254,240,138,0.4)] flex items-center justify-center">
            {/* Peacock Feather SVG */}
            <svg
              width="56"
              height="56"
              className="w-14 h-14 text-[#0d9488] drop-shadow-md"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50 90 C50 60 75 35 75 20 C75 10 60 5 50 15 C40 5 25 10 25 20 C25 35 50 60 50 90 Z"
                fill="#0d9488"
                opacity="0.9"
              />
              <path
                d="M50 80 C50 55 68 35 68 22 C68 15 58 10 50 18 C42 10 32 15 32 22 C32 35 50 55 50 80 Z"
                fill="#1e40af"
              />
              <circle cx="50" cy="24" r="7" fill="#f59e0b" />
              <circle cx="50" cy="24" r="3.5" fill="#1e1b4b" />
            </svg>
          </div>
        </div>

        {/* Small floating spark */}
        {step >= 3 && (
          <div className="absolute -top-3 -right-3 text-[#facc15] animate-pulse">
            <Sparkles className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Poetic Typography */}
      <div className="relative z-10 max-w-md space-y-3">
        <p
          className={`text-xs uppercase tracking-[0.3em] text-[#38bdf8] font-medium transition-all duration-700 ${
            step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          A little world of Krishna
        </p>

        <h1
          className={`font-cinzel text-3xl sm:text-4xl text-[#fef3c7] font-bold tracking-wide text-glow-gold transition-all duration-700 ${
            step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          Janmashtami 2026
        </h1>

        <p
          className={`text-sm text-[#cbd5e1] font-light italic transition-all duration-700 ${
            step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          "Somewhere between the moonlit Yamuna and the sweet notes of the flute, a village awakens."
        </p>

        <div
          className={`pt-2 transition-all duration-700 ${
            step >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <span className="font-telugu font-semibold text-xl text-[#f59e0b] tracking-wide">
            జై శ్రీ కృష్ణ • శ్రీ కృష్ణాష్టమి శుభాకాంక్షలు
          </span>
        </div>
      </div>

      {/* Enter World Button */}
      <div className="relative z-10 mt-10">
        {isLoaded ? (
          <button
            id="enter-world-button"
            onClick={onEnter}
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#d97706] to-[#b45309] text-white font-medium shadow-[0_0_30px_rgba(217,119,6,0.5)] hover:shadow-[0_0_40px_rgba(245,158,11,0.8)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Flame className="w-4 h-4 text-[#fef08a] group-hover:rotate-12 transition-transform" />
            <span className="tracking-wide">Enter Gokul Celebration</span>
            <Moon className="w-4 h-4 text-[#fed7aa] opacity-80" />
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-[#94a3b8] tracking-widest uppercase">
            <div className="w-2 h-2 rounded-full bg-[#f59e0b] animate-ping" />
            Preparing 3D Village...
          </div>
        )}
      </div>

      {/* Subtle bottom note */}
      <p className="absolute bottom-6 text-[11px] text-[#64748b] tracking-wider">
        Interactive 3D Experience • Audio Experience Included
      </p>
    </div>
  );
};
