import React, { useState } from 'react';
import { Search, Sparkles, CheckCircle2, RotateCcw, HelpCircle } from 'lucide-react';
import { playPopSound } from '../utils/audio';

interface SampleSentence {
  text: string;
  parts: { word: string; role: 'S' | 'P' | 'O' | 'K'; note: string }[];
}

const SAMPLE_SENTENCES: SampleSentence[] = [
  {
    text: 'Ibu menyapu halaman rumah setiap pagi.',
    parts: [
      { word: 'Ibu', role: 'S', note: 'Pelaku tindakan (Siapa)' },
      { word: 'menyapu', role: 'P', note: 'Kata kerja aktif transitif (Sedang apa)' },
      { word: 'halaman rumah', role: 'O', note: 'Sasaran sapuan (Apa yang disapu)' },
      { word: 'setiap pagi', role: 'K', note: 'Keterangan waktu frekuensi (Kapan)' }
    ]
  },
  {
    text: 'Para dokter memeriksa pasien dengan teliti di rumah sakit.',
    parts: [
      { word: 'Para dokter', role: 'S', note: 'Pelaku jamak (Siapa)' },
      { word: 'memeriksa', role: 'P', note: 'Kata kerja tindakan aktif' },
      { word: 'pasien', role: 'O', note: 'Orang yang diperiksa (Sasaran)' },
      { word: 'dengan teliti', role: 'K', note: 'Keterangan cara (Bagaimana)' },
      { word: 'di rumah sakit', role: 'K', note: 'Keterangan tempat (Di mana)' }
    ]
  },
  {
    text: 'Siswa cerdas itu meminjam buku ensiklopedia kemarin siang.',
    parts: [
      { word: 'Siswa cerdas itu', role: 'S', note: 'Frasa nomina subjek' },
      { word: 'meminjam', role: 'P', note: 'Predikat verba transitif' },
      { word: 'buku ensiklopedia', role: 'O', note: 'Objek penderita' },
      { word: 'kemarin siang', role: 'K', note: 'Keterangan waktu spesifik' }
    ]
  }
];

export function SpokAnalyzer({ onBack }: { onBack: () => void }) {
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [activeWordIdx, setActiveWordIdx] = useState<number | null>(null);

  const activeSample = SAMPLE_SENTENCES[selectedSampleIndex];

  const ROLE_COLORS: Record<'S' | 'P' | 'O' | 'K', { bg: string; border: string; text: string; label: string }> = {
    S: { bg: 'bg-[#e4dbf7]', border: 'border-[#c6b4eb]', text: 'text-[#5b4b8a]', label: 'Subjek' },
    P: { bg: 'bg-[#d9ecd7]', border: 'border-[#b1dbae]', text: 'text-[#3e683b]', label: 'Predikat' },
    O: { bg: 'bg-[#fbe0cf]', border: 'border-[#f2be9f]', text: 'text-[#8c4d29]', label: 'Objek' },
    K: { bg: 'bg-[#f7ecbf]', border: 'border-[#ebd688]', text: 'text-[#735e16]', label: 'Keterangan' }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-white rounded-3xl border border-[#ece7dc] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#efeafa] text-[#7c5cc4] flex items-center justify-center text-2xl font-black">
            🔍
          </div>
          <div>
            <div className="text-[11px] font-extrabold tracking-wider text-[#7c5cc4] uppercase">
              LABORATORIUM BAHASA
            </div>
            <h1 className="text-2xl font-black text-[#23212b]">
              Bedah Kalimat SPOK Interaktif
            </h1>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#faf8f5] hover:bg-[#efeafa] text-[#666072] hover:text-[#23212b] rounded-xl text-xs font-bold border border-[#e2dccd] transition-colors cursor-pointer"
        >
          Kembali
        </button>
      </div>

      {/* Main Interactive Stage */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ece7dc] shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold text-[#8a8594] uppercase tracking-wider mb-2">
            Pilih Contoh Kalimat untuk Dibedah:
          </label>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SENTENCES.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playPopSound();
                  setSelectedSampleIndex(idx);
                  setActiveWordIdx(null);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  selectedSampleIndex === idx
                    ? 'bg-[#7c5cc4] text-white border-[#7c5cc4] shadow-xs'
                    : 'bg-[#faf8f5] text-[#666072] border-[#ece7dc] hover:border-[#7c5cc4]'
                }`}
              >
                Contoh {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Sentence Block Visualization */}
        <div className="p-6 bg-[#faf8f5] rounded-3xl border border-[#ece7dc] space-y-4">
          <div className="text-xs text-[#8a8594] font-bold">
            Ketuk pada salah satu kotak bagian kalimat untuk melihat peran & penjelasannya:
          </div>

          <div className="flex flex-wrap gap-3 items-stretch justify-center py-4">
            {activeSample.parts.map((part, idx) => {
              const meta = ROLE_COLORS[part.role];
              const isSelected = activeWordIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    playPopSound();
                    setActiveWordIdx(isSelected ? null : idx);
                  }}
                  className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col justify-between min-w-[120px] ${
                    meta.bg
                  } ${meta.border} ${
                    isSelected
                      ? 'ring-4 ring-[#7c5cc4] scale-105 shadow-md'
                      : 'hover:scale-102 shadow-xs'
                  }`}
                >
                  <span className={`text-[11px] font-black tracking-wider ${meta.text}`}>
                    {part.role} • {meta.label}
                  </span>
                  <span className="text-base sm:text-lg font-black text-[#23212b] my-2">
                    &quot;{part.word}&quot;
                  </span>
                  <span className="text-[10px] text-[#666072] font-semibold">
                    Klik untuk info ℹ️
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detailed Note Card */}
          {activeWordIdx !== null ? (
            <div className="p-4 bg-white rounded-2xl border border-[#d9cff2] shadow-xs space-y-1 animate-pop-in">
              <div className="text-xs font-black text-[#7c5cc4]">
                Analisis Bagian: &quot;{activeSample.parts[activeWordIdx].word}&quot;
              </div>
              <div className="text-sm font-extrabold text-[#23212b]">
                Berperan sebagai {ROLE_COLORS[activeSample.parts[activeWordIdx].role].label} ({activeSample.parts[activeWordIdx].role})
              </div>
              <div className="text-xs text-[#666072] mt-1">
                💡 {activeSample.parts[activeWordIdx].note}
              </div>
            </div>
          ) : (
            <div className="text-center text-xs text-[#8a8594] py-2">
              (Ketuk salah satu blok di atas untuk melihat pembuktian sintaksisnya)
            </div>
          )}
        </div>

        {/* Formula summary */}
        <div className="p-4 bg-[#efeafa] rounded-2xl border border-[#d9cff2] flex flex-wrap items-center justify-between gap-3 text-xs text-[#5b4b8a]">
          <div className="flex items-center gap-2 font-bold">
            <Sparkles className="w-4 h-4 text-[#7c5cc4]" />
            <span>Pola Kalimat Ini:</span>
            <span className="font-black text-sm text-[#23212b]">
              {activeSample.parts.map((p) => p.role).join(' - ')}
            </span>
          </div>
          <span className="text-[11px] text-[#7c5cc4] font-semibold">
            Semua unsur memenuhi tata bahasa baku Bahasa Indonesia
          </span>
        </div>
      </div>
    </div>
  );
}
