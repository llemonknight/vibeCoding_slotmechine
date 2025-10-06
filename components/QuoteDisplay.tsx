
import React from 'react';
import type { Quote } from '../types';

interface QuoteDisplayProps {
  quote: Quote | null;
  isFinal?: boolean;
}

export const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ quote, isFinal = false }) => {
  if (!quote) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-2xl text-slate-400 font-playfair">今天要分享的是...</p>
      </div>
    );
  }

  // If it's the final quote, apply no animation to prevent the "pop" effect.
  // Otherwise, use the fast slide-in for the spinning effect.
  const quoteAnimation = isFinal 
    ? '' 
    : 'animate-slide-in-fast';

  return (
    <div 
      key={quote.text} 
      className={`flex flex-col justify-center items-center h-full p-8 text-center ${quoteAnimation}`}
    >
      <blockquote className="font-playfair text-3xl md:text-4xl lg:text-5xl font-semibold text-cyan-300">
        “{quote.text}”
      </blockquote>
      <cite className="mt-6 text-xl text-slate-300">- {quote.author}</cite>
    </div>
  );
};

// Removed the unused 'settle-in-final' animation to keep the code clean.
const keyframes = `
@keyframes slide-in-top-fast {
  from { opacity: 0; transform: translateY(-30%); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-in-fast {
  animation: slide-in-top-fast 0.15s ease-out forwards;
}
`;

let styleSheet = document.getElementById('quote-display-styles');
if (!styleSheet) {
  styleSheet = document.createElement("style");
  styleSheet.id = 'quote-display-styles';
  document.head.appendChild(styleSheet);
}
styleSheet.innerText = keyframes;