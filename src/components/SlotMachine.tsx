
import React, { useState, useEffect, useRef } from 'react';
import type { Quote } from '../types';
import { QuoteDisplay } from './QuoteDisplay';
import { SLOT_TICK_MS, SPIN_DURATION_MS } from '../constants';

interface SlotMachineProps {
  quotes: Quote[];
  finalQuote: Quote | null; // During spin, this is the target. After spin, it's the result.
  isSpinning: boolean;
  onSpinEnd: () => void;
}

// Sound effect URLs
const SPIN_SOUND_URL = 'https://cdn.pixabay.com/audio/2022/03/15/audio_bd91fe76ba.mp3';
const WIN_SOUND_URL = '';

// Animation constants
const SLOWDOWN_DURATION_MS = 1800; // The landing sequence will take this long.

export const SlotMachine: React.FC<SlotMachineProps> = ({ quotes, finalQuote, isSpinning, onSpinEnd }) => {
  // displayQuote is for the animation frames, while finalQuote is the settled result from parent
  const [displayQuote, setDisplayQuote] = useState<Quote | null>(finalQuote);
  const timeoutIdRef = useRef<number | undefined>(undefined);

  const spinAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    spinAudioRef.current = new Audio(SPIN_SOUND_URL);
    spinAudioRef.current.loop = true;
    winAudioRef.current = new Audio(WIN_SOUND_URL);
    return () => {
      spinAudioRef.current?.pause();
      winAudioRef.current?.pause();
    }
  }, []);

  useEffect(() => {
    if (isSpinning) {
      spinAudioRef.current?.play().catch(e => console.error("Error playing spin sound:", e));
    } else {
      spinAudioRef.current?.pause();
      if (spinAudioRef.current) spinAudioRef.current.currentTime = 0;
      if (finalQuote) {
        winAudioRef.current?.play().catch(e => console.error("Error playing win sound:", e));
      }
    }
  }, [isSpinning, finalQuote]);

  useEffect(() => {
    if (isSpinning && finalQuote && quotes.length > 0) {
      const targetIndex = quotes.findIndex(q => q.text === finalQuote.text);

      if (targetIndex === -1) {
        console.error("Target quote not found, stopping spin.");
        setTimeout(() => onSpinEnd(), SPIN_DURATION_MS);
        return;
      }

      let currentTickIndex = 0;
      const spinStartTime = Date.now();
      const fastSpinDuration = SPIN_DURATION_MS - SLOWDOWN_DURATION_MS;

      const tick = () => {
        const elapsedTime = Date.now() - spinStartTime;
        if (elapsedTime < fastSpinDuration) {
          // Phase 1: Fast spinning through random quotes
          currentTickIndex = (currentTickIndex + 1) % quotes.length;
          setDisplayQuote(quotes[currentTickIndex]);
          timeoutIdRef.current = window.setTimeout(tick, SLOT_TICK_MS);
        } else {
          // Phase 2: Orchestrated landing sequence
          const landingSteps = [
            { index: (targetIndex - 3 + quotes.length) % quotes.length, delay: SLOWDOWN_DURATION_MS * 0.15 },
            { index: (targetIndex - 2 + quotes.length) % quotes.length, delay: SLOWDOWN_DURATION_MS * 0.25 },
            { index: (targetIndex - 1 + quotes.length) % quotes.length, delay: SLOWDOWN_DURATION_MS * 0.35 },
            { index: targetIndex, delay: SLOWDOWN_DURATION_MS * 0.25 },
          ];

          const performLanding = (step: number) => {
            if (step >= landingSteps.length) {
              onSpinEnd();
              return;
            }
            const { index, delay } = landingSteps[step];
            setDisplayQuote(quotes[index]);
            timeoutIdRef.current = window.setTimeout(() => performLanding(step + 1), delay);
          };
          performLanding(0);
        }
      };

      tick();
    } else if (!isSpinning) {
      // When not spinning, ensure displayQuote matches the finalQuote from props
      setDisplayQuote(finalQuote);
    }

    return () => {
      clearTimeout(timeoutIdRef.current);
    };
  }, [isSpinning, quotes, finalQuote, onSpinEnd]);

  const quoteToRender = isSpinning ? displayQuote : finalQuote;
  const currentImageUrl = quoteToRender?.imageUrl;

  return (
    <div 
      className="relative w-full h-[400px] md:h-[800px] bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 transition-colors duration-500"
      style={{ perspective: '1000px' }}
    >
      {currentImageUrl && (
        <div 
          key={currentImageUrl}
          className="absolute inset-0 z-0 opacity-0 animate-fade-in-slow"
        >
          <img 
            src={currentImageUrl} 
            alt={`Background for "${quoteToRender?.text}"`}
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        </div>
      )}

      <div className={`absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-slate-900 via-slate-900/70 to-transparent z-10 pointer-events-none transition-opacity duration-500 ${!isSpinning && currentImageUrl ? 'opacity-0' : 'opacity-100'}`}></div>
      <div className={`absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent z-10 pointer-events-none transition-opacity duration-500 ${!isSpinning && currentImageUrl ? 'opacity-0' : 'opacity-100'}`}></div>
      
      <div className="relative z-20 w-full h-full flex justify-center items-center">
        <QuoteDisplay quote={quoteToRender} isFinal={!isSpinning && !!finalQuote} />
      </div>
    </div>
  );
};

const keyframes = `
@keyframes fade-in-slow {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in-slow {
  animation: fade-in-slow 0.4s ease-out forwards;
}
`;
if (!document.getElementById('slot-machine-styles')) {
  const styleSheet = document.createElement("style");
  styleSheet.id = 'slot-machine-styles';
  styleSheet.innerText = keyframes;
  document.head.appendChild(styleSheet);
}