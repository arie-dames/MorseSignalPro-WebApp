
import React from 'react';

interface SignalLampProps {
  isActive: boolean;
  color?: 'amber' | 'white' | 'red';
}

const SignalLamp: React.FC<SignalLampProps> = ({ isActive, color = 'amber' }) => {
  const colorMap = {
    amber: {
      on: 'bg-amber-400 shadow-[0_0_80px_rgba(251,191,36,0.8)]',
      off: 'bg-amber-900/30 shadow-none',
      border: 'border-amber-600/50'
    },
    white: {
      on: 'bg-slate-50 shadow-[0_0_80px_rgba(248,250,252,0.8)]',
      off: 'bg-slate-900/30 shadow-none',
      border: 'border-slate-600/50'
    },
    red: {
      on: 'bg-red-500 shadow-[0_0_80px_rgba(239,68,68,0.8)]',
      off: 'bg-red-900/30 shadow-none',
      border: 'border-red-600/50'
    }
  };

  const theme = colorMap[color];

  return (
    <div className="relative flex flex-col items-center justify-center p-8 bg-zinc-900/50 rounded-3xl border border-zinc-800 backdrop-blur-sm">
      <div className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">Visual Signal Output</div>
      
      <div className="relative">
        {/* Lamp Housing */}
        <div className={`w-48 h-48 rounded-full border-8 transition-all duration-75 flex items-center justify-center overflow-hidden ${theme.border} ${isActive ? 'scale-105' : 'scale-100'}`}>
          {/* Glass Fresnel Effect */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:4px_4px]"></div>
          
          {/* Main Light */}
          <div className={`w-full h-full transition-all duration-75 rounded-full ${isActive ? theme.on : theme.off}`}></div>
          
          {/* Lens Flare */}
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
          )}
        </div>

        {/* Halo Glow */}
        <div className={`absolute -inset-10 transition-opacity duration-75 pointer-events-none blur-3xl rounded-full bg-amber-500/10 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
      </div>

      <div className="mt-8 flex gap-2">
        <div className={`w-3 h-3 rounded-full transition-colors duration-200 ${isActive ? 'bg-amber-500 animate-pulse' : 'bg-zinc-800'}`}></div>
        <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest leading-none flex items-center">
            {isActive ? 'Transmitting' : 'Standby'}
        </div>
      </div>
    </div>
  );
};

export default SignalLamp;
