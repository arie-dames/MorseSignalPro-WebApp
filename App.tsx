
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { textToMorse, getSignalTimings } from './utils/morseUtils';
import { SignalConfig, MorseSequence } from './types';
import SignalLamp from './components/SignalLamp';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [currentMorse, setCurrentMorse] = useState('');
  const [isSignaling, setIsSignaling] = useState(false);
  const [activeSignal, setActiveSignal] = useState(false);
  const [config, setConfig] = useState<SignalConfig>({ unitTime: 120, frequency: 700 });
  const [history, setHistory] = useState<MorseSequence[]>([]);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timeoutRefs = useRef<number[]>([]);

  // Initialize Audio Context on demand
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioCtxRef.current.createGain();
      gainNodeRef.current.gain.value = 0;
      gainNodeRef.current.connect(audioCtxRef.current.destination);
    }
  }, []);

  const playFrequency = (on: boolean) => {
    if (!audioCtxRef.current || !gainNodeRef.current) return;
    
    if (on) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      
      oscillatorRef.current = audioCtxRef.current.createOscillator();
      oscillatorRef.current.type = 'sine';
      oscillatorRef.current.frequency.setValueAtTime(config.frequency, audioCtxRef.current.currentTime);
      oscillatorRef.current.connect(gainNodeRef.current);
      oscillatorRef.current.start();
      gainNodeRef.current.gain.setTargetAtTime(0.1, audioCtxRef.current.currentTime, 0.005);
    } else {
      if (oscillatorRef.current && gainNodeRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.005);
        oscillatorRef.current.stop(audioCtxRef.current.currentTime + 0.05);
        oscillatorRef.current = null;
      }
    }
  };

  const stopSignaling = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
    setIsSignaling(false);
    setActiveSignal(false);
    playFrequency(false);
  };

  const handleTranslate = () => {
    if (!inputText.trim()) return;
    
    initAudio();
    stopSignaling();
    
    const morse = textToMorse(inputText);
    setCurrentMorse(morse);
    setIsSignaling(true);

    const timings = getSignalTimings(morse, config.unitTime);
    let cumulativeTime = 0;

    timings.forEach((signal) => {
      const startRef = window.setTimeout(() => {
        setActiveSignal(signal.active);
        playFrequency(signal.active);
      }, cumulativeTime);

      timeoutRefs.current.push(startRef);
      cumulativeTime += signal.duration;
    });

    // Final cleanup
    const endRef = window.setTimeout(() => {
      setIsSignaling(false);
      setActiveSignal(false);
      playFrequency(false);
      
      setHistory(prev => [{
        text: inputText,
        morse: morse,
        timestamp: Date.now()
      }, ...prev].slice(0, 5));

    }, cumulativeTime);
    timeoutRefs.current.push(endRef);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0c] selection:bg-amber-500/30">
      {/* Header */}
      <header className="p-6 md:p-8 border-b border-zinc-800/50 bg-[#0c0c0e]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">Morse Signal Pro</h1>
              <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Precision Encoding System</p>
            </div>
          </div>
          
          <div className="hidden md:flex gap-6 items-center">
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">WPM Speed</span>
                <input 
                    type="range" 
                    min="50" 
                    max="300" 
                    value={350 - config.unitTime} 
                    onChange={(e) => setConfig({...config, unitTime: 350 - parseInt(e.target.value)})}
                    className="w-32 accent-amber-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left: Input and Controls */}
        <section className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
          <div className="space-y-4">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Transmission Input</label>
            <textarea
              className="w-full h-40 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-lg text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all resize-none font-mono placeholder:text-zinc-700"
              placeholder="Enter message to transmit..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSignaling}
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleTranslate}
              disabled={isSignaling || !inputText.trim()}
              className={`flex-1 py-4 px-8 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 ${
                isSignaling || !inputText.trim() 
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                  : 'bg-amber-500 text-black hover:bg-amber-400 active:scale-95 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
              }`}
            >
              {isSignaling ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Transmitting...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Begin Transmission
                </>
              )}
            </button>
            
            {isSignaling && (
              <button
                onClick={stopSignaling}
                className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {currentMorse && (
            <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl animate-in zoom-in duration-300">
               <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] mb-4 block">Encoded Sequence</label>
               <div className="font-mono text-2xl tracking-[0.2em] text-amber-500 break-all leading-relaxed">
                  {currentMorse.split('').map((char, i) => (
                    <span key={i} className={char === '/' ? 'text-zinc-700 px-2' : ''}>{char}</span>
                  ))}
               </div>
            </div>
          )}

          {/* History */}
          <div className="space-y-4">
             <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Log Archive</label>
             <div className="space-y-3">
               {history.length === 0 && <p className="text-zinc-700 font-mono text-xs italic">No previous logs found.</p>}
               {history.map((item, idx) => (
                 <div key={idx} className="p-4 bg-zinc-900/20 border border-zinc-800/50 rounded-xl flex justify-between items-center group hover:border-zinc-700 transition-colors">
                   <div className="overflow-hidden">
                     <p className="text-sm font-semibold text-zinc-300 truncate">{item.text}</p>
                     <p className="text-[10px] font-mono text-zinc-500 truncate mt-1">{item.morse}</p>
                   </div>
                   <button 
                    onClick={() => { setInputText(item.text); setCurrentMorse(item.morse); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-zinc-500 hover:text-amber-500"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                     </svg>
                   </button>
                 </div>
               ))}
             </div>
          </div>
        </section>

        {/* Right: Visual Lamp */}
        <section className="sticky top-32 space-y-8 animate-in fade-in slide-in-from-right duration-700">
           <SignalLamp isActive={activeSignal} />
           
           <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1 h-3 bg-amber-500"></div>
                Specifications
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-black/40 rounded-xl border border-zinc-800/50">
                   <p className="text-[10px] text-zinc-500 font-mono uppercase">Frequency</p>
                   <p className="text-lg font-bold text-zinc-200">{config.frequency} <span className="text-[10px] text-zinc-500">Hz</span></p>
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-zinc-800/50">
                   <p className="text-[10px] text-zinc-500 font-mono uppercase">Bit Duration</p>
                   <p className="text-lg font-bold text-zinc-200">{config.unitTime} <span className="text-[10px] text-zinc-500">ms</span></p>
                </div>
              </div>
              <p className="mt-6 text-[10px] text-zinc-600 font-mono leading-relaxed">
                Hardware: Standard Synology Web Server Environment<br/>
                Output: Browser Web Audio API + CSS Transitions<br/>
                System: 100% Client-Side Interpretation
              </p>
           </div>
        </section>
      </main>

      <footer className="p-8 border-t border-zinc-900 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600 text-[10px] font-mono uppercase tracking-[0.2em]">
          <p>© 2024 Signal Dynamics Corp.</p>
          <div className="flex gap-8">
            <span className="hover:text-amber-500 cursor-help">Technical Manual</span>
            <span className="hover:text-amber-500 cursor-help">Protocols</span>
            <span className="hover:text-amber-500 cursor-help">Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
