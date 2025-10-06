
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { SlotMachine } from './components/SlotMachine';
import type { Quote } from './types';

interface LocalQuotesConfig {
  pinnedQuoteText?: string;
  quotes: Quote[];
}

const BGM_URL = 'https://cdn.pixabay.com/audio/2023/06/11/audio_cf9ada1285.mp3'; // A calm, lo-fi track

const App: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [finalQuote, setFinalQuote] = useState<Quote | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [localConfig, setLocalConfig] = useState<LocalQuotesConfig>({ quotes: [] });

  const [isMuted, setIsMuted] = useState<boolean>(true);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(BGM_URL);
    audio.loop = true;
    audio.volume = 0.3;
    bgmAudioRef.current = audio;
    return () => {
      audio.pause();
    };
  }, []);

  useEffect(() => {
    if (isMuted) {
      bgmAudioRef.current?.pause();
    } else {
      bgmAudioRef.current?.play().catch(e => console.error("Error playing BGM:", e));
    }
  }, [isMuted]);

  useEffect(() => {
    fetch('./quotes-config.json')
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        setLocalConfig(data);
        setQuotes(data.quotes || []);
        setIsLoading(false);
      })
      .catch(e => {
        console.error("Error fetching local quotes:", e);
        setError("Fatal Error: Could not load quotes from the configuration file. Please check 'quotes-config.json'.");
        setIsLoading(false);
      });
  }, []);

  const startSpin = useCallback(() => {
    setError(null);
    
    if (!localConfig.quotes || localConfig.quotes.length < 2) {
      setError("Not enough quotes in quotes-config.json. Please add at least 2 quotes.");
      return;
    }

    let newFinalQuote: Quote | undefined;
    const allQuotes = localConfig.quotes;
    
    const pinnedText = localConfig.pinnedQuoteText;
    if (pinnedText) {
      newFinalQuote = allQuotes.find(q => q.text === pinnedText);
    }
    
    if (!newFinalQuote) {
      const availableQuotes = allQuotes.filter(q => q.text !== (finalQuote?.text || ''));
      newFinalQuote = availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
    }

    if (!newFinalQuote) {
        // Fallback if filtering results in an empty array (e.g., only one quote exists)
        newFinalQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
    }

    // Set quotes for the visual spin (shuffled)
    setQuotes([...allQuotes].sort(() => 0.5 - Math.random()));
    // Set the target quote for the machine
    setFinalQuote(newFinalQuote);
    // Start the spin
    setIsSpinning(true);

  }, [localConfig, finalQuote]);
  
  const handleSpinEnd = useCallback(() => {
    setIsSpinning(false);
  }, []);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const buttonText = () => {
    if (isLoading) return 'Loading Quotes...';
    if (isSpinning) return '今天要分享的是...';
    if (finalQuote) return '今天要分享的是...';
    return 'GOGOGO!!!';
  }

  return (
    <div className="relative min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 md:p-8">
      <button 
        onClick={toggleMute} 
        className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors z-30"
        aria-label={isMuted ? "Unmute background music" : "Mute background music"}
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l-4-4m0 4l4-4" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M20 4a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      <main className="w-full mx-auto flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-white mb-2">
            
          </h1>
          <p className="text-lg md:text-xl text-slate-400">
            
          </p>
        </div>
        
        <SlotMachine 
          quotes={quotes} 
          finalQuote={finalQuote} 
          isSpinning={isSpinning}
          onSpinEnd={handleSpinEnd}
        />
        
        {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
        
        <button
          onClick={startSpin}
          disabled={isSpinning || isLoading || !!error}
          className="w-full max-w-sm bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold text-xl py-4 px-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
        >
          {buttonText()}
        </button>
      </main>
      <footer className="absolute bottom-4 text-center text-slate-500 text-sm">
        <p></p>
      </footer>
    </div>
  );
};

export default App;
