import React from 'react';
import { UserCheck, Sparkles, BookOpen, Search, Users, Trophy } from 'lucide-react';
import { playPopSound } from '../utils/audio';

interface HeroSectionProps {
  onSelectAction: (action: 'host' | 'join' | 'practice' | 'theory' | 'analyzer') => void;
  activeAction: string | null;
}

export function HeroSection({ onSelectAction, activeAction }: HeroSectionProps) {
  const SPOK_CARDS = [
    { label: 'SUBJEK', word: 'Adik', code: 'S', bg: '#e4dbf7', rot: '-3deg' },
    { label: 'PREDIKAT', word: 'menggambar', code: 'P', bg: '#d9ecd7', rot: '2deg' },
    { label: 'OBJEK', word: 'pemandangan', code: 'O', bg: '#fbe0cf', rot: '-2deg' },
    { label: 'KETERANGAN', word: 'di sekolah', code: 'K', bg: '#f7ecbf', rot: '3deg' },
  ];

  return (
    <div className="py-8 space-y-10">
      {/* Hero Headline & Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headline and Pitch */}
        <div className="lg:col-span-7 space-y-5">
          <div className="text-xs font-extrabold tracking-[0.2em] text-[#7c5cc4] uppercase flex items-center gap-2">
            <span>✦</span> BELAJAR BARENG, JADI LEBIH SERU
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-[#23212b]">
            Kalimat tepat.<br />
            Keseruan{' '}
            <span className="text-[#7c5cc4] relative inline-block">
              hebat.
              <svg
                className="absolute left-0 -bottom-2 w-full h-3"
                viewBox="0 0 220 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 7 Q60 1 110 5 T218 4"
                  fill="none"
                  stroke="#7c5cc4"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#666072] leading-relaxed max-w-xl">
            Siapa bilang tata bahasa Indonesia itu membosankan? Kuasai struktur{' '}
            <b className="text-[#23212b]">Subjek, Predikat, Objek, dan Keterangan (S-P-O-K)</b>,
            adu kecepatan menjawab, dan raih podium juara bersama teman sekelasmu!
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => {
                playPopSound();
                onSelectAction('join');
              }}
              className="px-6 py-3.5 bg-[#7c5cc4] text-white font-extrabold text-sm rounded-2xl shadow-[0_4px_0_#5a3fa0] hover:bg-[#6c4eb4] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Gabung Sebagai Peserta</span>
            </button>

            <button
              onClick={() => {
                playPopSound();
                onSelectAction('host');
              }}
              className="px-6 py-3.5 bg-white text-[#5b4b8a] border-2 border-[#d9cff2] font-extrabold text-sm rounded-2xl shadow-[0_3px_0_#d9cff2] hover:bg-[#efeafa] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Buat Room (Guru / Host)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Visual Stage with Mascots & SPOK Board */}
        <div className="lg:col-span-5 relative flex items-center justify-center min-h-[340px]">
          {/* Mascots */}
          <div className="absolute -top-3 right-4 w-20 h-20 rounded-full bg-[#fde3c6] shadow-lg flex items-center justify-center text-4xl select-none z-10 border-2 border-white animate-bounce-slow">
            🐱
          </div>
          <div className="absolute -bottom-2 -left-2 w-18 h-18 rounded-full bg-[#d9dcf7] shadow-lg flex items-center justify-center text-4xl select-none z-10 border-2 border-white">
            🤖
          </div>

          {/* Floating Score Badge */}
          <div className="absolute -bottom-4 right-2 bg-white rounded-2xl px-4 py-2.5 shadow-xl border border-[#ece7dc] z-20 flex items-center gap-3 rotate-3">
            <div className="w-7 h-7 rounded-full bg-[#d9ecd7] text-[#3e683b] flex items-center justify-center font-black text-sm">
              ✓
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#8a8594] leading-tight">Jawaban Cepat!</div>
              <div className="text-sm font-black text-[#2e7d32]">+150 poin</div>
            </div>
          </div>

          {/* Educational Board */}
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-[#ece7dc] -rotate-3 transition-transform hover:rotate-0">
            <div className="flex items-center justify-between text-xs font-bold text-[#8a8594] pb-3 border-b border-[#f0ede6]">
              <span className="flex items-center gap-1.5 text-[#7c5cc4]">
                <Sparkles className="w-3.5 h-3.5" /> MISI BELAJAR
              </span>
              <span>SOAL 01 / 10</span>
            </div>

            <div className="py-4">
              <div className="text-xl font-black text-[#23212b]">
                Susun kalimat yang benar:
              </div>
              <div className="text-xs text-[#8a8594] mt-0.5">
                Pola struktur dasar Bahasa Indonesia
              </div>
            </div>

            {/* SPOK Tiles Grid */}
            <div className="grid grid-cols-4 gap-2 my-2">
              {SPOK_CARDS.map((tile) => (
                <div
                  key={tile.label}
                  className="rounded-xl p-2.5 text-center flex flex-col justify-between shadow-xs transition-transform hover:scale-105"
                  style={{
                    backgroundColor: tile.bg,
                    transform: `rotate(${tile.rot})`,
                  }}
                >
                  <span className="text-[9px] font-extrabold tracking-wider text-[#6b6676]">
                    {tile.label}
                  </span>
                  <span className="text-xs font-black text-[#23212b] my-1">
                    {tile.word}
                  </span>
                  <span className="text-[10px] font-extrabold text-[#7c5cc4] bg-white/70 rounded py-0.5">
                    {tile.code}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-center text-[11px] font-semibold text-[#8a8594] mt-4 pt-3 border-t border-[#f0ede6]">
              ✦ Setiap kalimat yang tepat membawa ke puncak podium!
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards Selection Grid */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-[11px] font-extrabold tracking-wider text-[#7c5cc4] uppercase">
              PILIH MODALITAS
            </div>
            <h2 className="text-2xl font-black text-[#23212b]">
              Mau mulai dari mana hari ini?
            </h2>
          </div>
          <span className="text-xs text-[#8a8594] hidden sm:inline">
            Klik salah satu opsi di bawah ini ↙
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Host Room */}
          <button
            onClick={() => {
              playPopSound();
              onSelectAction('host');
            }}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
              activeAction === 'host'
                ? 'bg-[#efeafa] border-[#7c5cc4] shadow-md ring-2 ring-[#7c5cc4]/20'
                : 'bg-white border-[#e9e4d8] hover:border-[#7c5cc4] hover:shadow-md hover:-translate-y-1'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#efeafa] text-[#7c5cc4] flex items-center justify-center text-xl mb-3 font-bold">
              🧑‍🏫
            </div>
            <h3 className="text-base font-extrabold text-[#23212b] mb-1">
              Jadi Host Kuis
            </h3>
            <p className="text-xs text-[#666072] leading-relaxed">
              Buat room kelas, atur waktu, tampilkan kode QR di proyektor, dan pimpin kuis.
            </p>
          </button>

          {/* Card 2: Join as Player */}
          <button
            onClick={() => {
              playPopSound();
              onSelectAction('join');
            }}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
              activeAction === 'join'
                ? 'bg-[#efeafa] border-[#7c5cc4] shadow-md ring-2 ring-[#7c5cc4]/20'
                : 'bg-white border-[#e9e4d8] hover:border-[#7c5cc4] hover:shadow-md hover:-translate-y-1'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#e4dbf7] text-[#5b4b8a] flex items-center justify-center text-xl mb-3 font-bold">
              🎒
            </div>
            <h3 className="text-base font-extrabold text-[#23212b] mb-1">
              Gabung Peserta
            </h3>
            <p className="text-xs text-[#666072] leading-relaxed">
              Masukkan kode room dari guru, pilih avatar keren, dan jawab kuis serentak.
            </p>
          </button>

          {/* Card 3: Solo Practice */}
          <button
            onClick={() => {
              playPopSound();
              onSelectAction('practice');
            }}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
              activeAction === 'practice'
                ? 'bg-[#efeafa] border-[#7c5cc4] shadow-md ring-2 ring-[#7c5cc4]/20'
                : 'bg-white border-[#e9e4d8] hover:border-[#7c5cc4] hover:shadow-md hover:-translate-y-1'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#d9ecd7] text-[#3e683b] flex items-center justify-center text-xl mb-3 font-bold">
              ⚡
            </div>
            <h3 className="text-base font-extrabold text-[#23212b] mb-1">
              Latihan Mandiri
            </h3>
            <p className="text-xs text-[#666072] leading-relaxed">
              Main sendiri tanpa host, nikmati latihan susun kata instan dengan penjelasan mendalam.
            </p>
          </button>

          {/* Card 4: SPOK Theory & Sentence Surgery */}
          <button
            onClick={() => {
              playPopSound();
              onSelectAction('theory');
            }}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
              activeAction === 'theory'
                ? 'bg-[#efeafa] border-[#7c5cc4] shadow-md ring-2 ring-[#7c5cc4]/20'
                : 'bg-white border-[#e9e4d8] hover:border-[#7c5cc4] hover:shadow-md hover:-translate-y-1'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#fbe0cf] text-[#8c4d29] flex items-center justify-center text-xl mb-3 font-bold">
              📖
            </div>
            <h3 className="text-base font-extrabold text-[#23212b] mb-1">
              Pedoman & Teori SPOK
            </h3>
            <p className="text-xs text-[#666072] leading-relaxed">
              Pelajari definisi, fungsi, contoh pola S-P, S-P-O, S-P-K, dan S-P-O-K secara visual.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
