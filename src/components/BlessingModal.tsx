import React, { useEffect, useState } from 'react';
import { X, Sparkles, Heart, Share2, Check, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio.ts';

interface BlessingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlessingModal: React.FC<BlessingModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      soundEngine.playBlessingChime();

      // Launch joyful golden festive confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#0d9488', '#ea580c', '#ffffff'],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyBlessing = () => {
    const text = `🌸 శ్రీ కృష్ణాష్టమి శుభాకాంక్షలు 2026! 🌸\n\nవసుదేవసుతం దేవం కంసచాణూరమర్దనమ్ |\nదేవకీపరమానందం కృష్ణం వందే జగద్గురుమ్ ||\n\nశ్రీకృష్ణుని దివ్య ఆశీస్సులతో మీ ఇంట ఆనందం, శాంతి, శ్రేయస్సు నిండాలని మనసారా కోరుకుంటున్నాము.\n\nజై శ్రీ కృష్ణ! ✨`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-all duration-300">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#111827] via-[#0b1329] to-[#070b19] border border-[#f59e0b]/40 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(245,158,11,0.3)]">
        {/* Close Button */}
        <button
          id="close-blessing-button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Auspicious Icon */}
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-tr from-[#f59e0b] to-[#fef08a] flex items-center justify-center shadow-lg shadow-amber-500/30">
          <Sparkles className="w-8 h-8 text-[#78350f]" />
        </div>

        {/* Telugu Sloka */}
        <div className="mb-4 py-3 px-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="font-telugu font-semibold text-lg sm:text-xl text-[#fef08a] tracking-wide leading-relaxed">
            వసుదేవసుతం దేవం కంసచాణూరమర్దనమ్ |<br />
            దేవకీపరమానందం కృష్ణం వందే జగద్గురుమ్ ||
          </p>
          <p className="text-[11px] text-[#cbd5e1] font-light mt-1.5 italic font-telugu">
            "వసుదేవుని తనయుడు, కంస-చాణూరులను సంహరించినవాడు, దేవకీమాతకు పరమానందాన్ని కలిగించిన జగద్గురువైన శ్రీకృష్ణునికి నమస్కారములు."
          </p>
        </div>

        {/* Celebration Title */}
        <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#fef3c7] mb-2 text-glow-gold">
          Happy Krishna Janmashtami 2026
        </h3>

        {/* Blessings Message */}
        <p className="text-sm text-[#e2e8f0] font-light leading-relaxed mb-6 font-telugu">
          శ్రీకృష్ణుని వేణుగానం మీ జీవితంలోకి శాంతి, ఆనందం, మరియు ప్రేమను తీసుకురావాలి. బుజ్జి కన్నయ్య అమాయకమైన చిరునవ్వులు మీ ఇంట శుభాలను కలిగించాలి.
        </p>

        {/* Divine Signature */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Flame className="w-4 h-4 text-amber-400" />
          <span className="font-telugu font-semibold text-lg text-[#f59e0b] tracking-wide">
            జై శ్రీ కృష్ణ • శ్రీ కృష్ణాష్టమి శుభాకాంక్షలు
          </span>
          <Flame className="w-4 h-4 text-amber-400" />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="copy-blessing-button"
            onClick={handleCopyBlessing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Blessing Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share Blessing</span>
              </>
            )}
          </button>

          <button
            id="continue-journey-button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            Return to Gokul
          </button>
        </div>
      </div>
    </div>
  );
};
