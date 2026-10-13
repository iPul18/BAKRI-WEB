import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { getMuted, setMuted, playPopSound } from '../utils/audio';
import { AppView } from '../types';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  roomCode?: string;
  onExitRoom?: () => void;
}

export function Header({ currentView, onNavigate, roomCode, onExitRoom }: HeaderProps) {
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    setMutedState(getMuted());
  }, []);

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playPopSound();
  };

  return (
    <header className="flex items-center justify-between gap-8 px-5 py-4 border-b border-[#e9e4d8] bg-[#faf8f5]/90 backdrop-blur-md sticky top-0 z-30">
      {/* Zone 1: Brand wordmark */}
      <button
        onClick={() => {
          playPopSound();
          if (roomCode && onExitRoom) {
            if (window.confirm('Keluar dari sesi room saat ini?')) {
              onExitRoom();
              onNavigate('home');
            }
          } else {
            onNavigate('home');
          }
        }}
        className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer shrink-0"
      >
        <div className="grid grid-cols-2 gap-1 w-9 h-9 shrink-0">
          <div className="bg-[#e4dbf7] text-[#5b4b8a] rounded text-[10px] font-extrabold flex items-center justify-center shadow-xs">S</div>
          <div className="bg-[#d9ecd7] text-[#3e683b] rounded text-[10px] font-extrabold flex items-center justify-center shadow-xs">P</div>
          <div className="bg-[#fbe0cf] text-[#8c4d29] rounded text-[10px] font-extrabold flex items-center justify-center shadow-xs">O</div>
          <div className="bg-[#f7ecbf] text-[#735e16] rounded text-[10px] font-extrabold flex items-center justify-center shadow-xs">K</div>
        </div>
        <div>
          <div className="text-lg font-black tracking-tight text-[#23212b] group-hover:text-[#7c5cc4] transition-colors leading-none">
            SPOK QUEST
          </div>
          <div className="text-[10px] font-extrabold tracking-[0.25em] text-[#7c5cc4] mt-1">
            KUIS BAHASA INDONESIA
          </div>
        </div>
      </button>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#666072]">
        <button
          onClick={() => { playPopSound(); onNavigate('home'); }}
          className={`hover:text-[#23212b] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'home' ? 'text-[#7c5cc4] font-bold' : ''
          }`}
        >
          Beranda
        </button>
        <button
          onClick={() => { playPopSound(); onNavigate('theory'); }}
          className={`hover:text-[#23212b] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'theory' ? 'text-[#7c5cc4] font-bold' : ''
          }`}
        >
          Pedoman SPOK
        </button>
        <button
          onClick={() => { playPopSound(); onNavigate('analyzer'); }}
          className={`hover:text-[#23212b] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'analyzer' ? 'text-[#7c5cc4] font-bold' : ''
          }`}
        >
          Bedah Kalimat
        </button>
        <button
          onClick={() => { playPopSound(); onNavigate('practice'); }}
          className={`hover:text-[#23212b] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'practice' ? 'text-[#7c5cc4] font-bold' : ''
          }`}
        >
          Latihan Mandiri
        </button>
      </nav>

      {/* Zone 3: 1 primary action & sound toggle */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={toggleSound}
          title={muted ? 'Nyalakan Efek Suara' : 'Matikan Efek Suara'}
          className="p-2 rounded-xl border border-[#e2dccd] text-[#666072] hover:text-[#23212b] hover:bg-[#efeafa] transition-colors cursor-pointer"
          aria-label={muted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#7c5cc4]" />}
        </button>

        {roomCode ? (
          <button
            onClick={() => {
              if (window.confirm('Tinggalkan room saat ini?')) {
                onExitRoom?.();
                onNavigate('home');
              }
            }}
            className="px-3.5 py-1.5 text-xs font-bold text-[#b91c1c] bg-[#fee2e2] rounded-xl hover:bg-[#fecaca] transition-colors whitespace-nowrap cursor-pointer"
          >
            Keluar Room ({roomCode})
          </button>
        ) : (
          <button
            onClick={() => { playPopSound(); onNavigate('practice'); }}
            className="px-4 py-2 text-xs font-bold text-white bg-[#7c5cc4] rounded-xl hover:bg-[#6c4eb4] shadow-[0_3px_0_#5a3fa0] active:translate-y-[2px] active:shadow-none transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mulai Bermain</span>
          </button>
        )}
      </div>
    </header>
  );
}
