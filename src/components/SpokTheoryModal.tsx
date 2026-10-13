import React from 'react';
import { BookOpen, Check, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { playPopSound } from '../utils/audio';

interface SpokTheoryModalProps {
  onClose: () => void;
  onGoToPractice?: () => void;
  onGoToAnalyzer?: () => void;
}

export function SpokTheoryModal({ onClose, onGoToPractice, onGoToAnalyzer }: SpokTheoryModalProps) {
  const SPOK_PILLARS = [
    {
      code: 'S',
      title: 'Subjek (S)',
      desc: 'Pelaku, tokoh, atau benda yang dibicarakan dalam kalimat.',
      question: 'Siapa atau apa yang melakukan tindakan?',
      examples: ['Ayah', 'Ibu', 'Siswa-siswi', 'Kucing belang', 'Dokter'],
      bg: 'bg-[#e4dbf7]',
      border: 'border-[#c6b4eb]',
      text: 'text-[#5b4b8a]'
    },
    {
      code: 'P',
      title: 'Predikat (P)',
      desc: 'Kegiatan, tindakan, atau sifat yang sedang dilakukan oleh Subjek.',
      question: 'Sedang melakukan apa atau bagaimana keadaannya?',
      examples: ['membaca', 'menyapu', 'menjelaskan', 'bermain', 'memeriksa'],
      bg: 'bg-[#d9ecd7]',
      border: 'border-[#b1dbae]',
      text: 'text-[#3e683b]'
    },
    {
      code: 'O',
      title: 'Objek (O)',
      desc: 'Sesuatu yang dikenai tindakan secara langsung oleh predikat (kata kerja transitif). Objek dapat berpindah posisi menjadi subjek dalam kalimat pasif.',
      question: 'Apa atau siapa yang dikenai tindakan?',
      examples: ['koran', 'halaman rumah', 'surat cinta', 'bola sepak', 'pasien'],
      bg: 'bg-[#fbe0cf]',
      border: 'border-[#f2be9f]',
      text: 'text-[#8c4d29]'
    },
    {
      code: 'K',
      title: 'Keterangan (K)',
      desc: 'Keterangan tambahan mengenai tempat, waktu, cara, alat, atau tujuan dalam peristiwa tersebut.',
      question: 'Di mana, kapan, bagaimana, atau untuk apa?',
      examples: ['di teras rumah', 'setiap pagi', 'kemarin sore', 'dengan teliti', 'untuk nenek'],
      bg: 'bg-[#f7ecbf]',
      border: 'border-[#ebd688]',
      text: 'text-[#735e16]'
    }
  ];

  const SENTENCE_PATTERNS = [
    {
      pattern: 'S - P',
      example: 'Adik menangis.',
      breakdown: [{ c: 'S', w: 'Adik' }, { c: 'P', w: 'menangis' }]
    },
    {
      pattern: 'S - P - O',
      example: 'Ayah membaca koran.',
      breakdown: [{ c: 'S', w: 'Ayah' }, { c: 'P', w: 'membaca' }, { c: 'O', w: 'koran' }]
    },
    {
      pattern: 'S - P - K',
      example: 'Ibu memasak di dapur.',
      breakdown: [{ c: 'S', w: 'Ibu' }, { c: 'P', w: 'memasak' }, { c: 'K', w: 'di dapur' }]
    },
    {
      pattern: 'S - P - O - K',
      example: 'Siswa membaca buku di perpustakaan sore hari.',
      breakdown: [
        { c: 'S', w: 'Siswa' },
        { c: 'P', w: 'membaca' },
        { c: 'O', w: 'buku' },
        { c: 'K', w: 'di perpustakaan sore hari' }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Title Header */}
      <div className="flex items-center justify-between p-5 bg-white rounded-3xl border border-[#ece7dc] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#efeafa] text-[#7c5cc4] flex items-center justify-center text-2xl font-black">
            📖
          </div>
          <div>
            <div className="text-[11px] font-extrabold tracking-wider text-[#7c5cc4] uppercase">
              MATERI PEMBELAJARAN LENGKAP
            </div>
            <h1 className="text-2xl font-black text-[#23212b]">
              Pedoman Struktur Kalimat S-P-O-K
            </h1>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-[#faf8f5] hover:bg-[#efeafa] text-[#666072] hover:text-[#23212b] rounded-xl text-xs font-bold border border-[#e2dccd] transition-colors cursor-pointer"
        >
          Kembali
        </button>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SPOK_PILLARS.map((item) => (
          <div
            key={item.code}
            className={`p-6 rounded-3xl border ${item.bg} ${item.border} shadow-sm space-y-3`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xl font-black ${item.text}`}>{item.title}</span>
              <span className="w-9 h-9 rounded-xl bg-white/80 shadow-xs flex items-center justify-center font-black text-sm">
                {item.code}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#23212b] leading-relaxed">
              {item.desc}
            </p>

            <div className="p-3 bg-white/70 rounded-2xl text-xs text-[#554f60]">
              <b className="text-[#23212b]">🔍 Cara Cek: </b> {item.question}
            </div>

            <div className="text-xs">
              <span className="font-bold text-[#666072]">Contoh kata: </span>
              <span className="font-extrabold text-[#23212b]">
                {item.examples.join(', ')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Sentence Patterns Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ece7dc] shadow-sm space-y-5">
        <div>
          <span className="text-xs font-extrabold text-[#7c5cc4] uppercase tracking-wider">
            CONTOH RAGAM POLA KALIMAT
          </span>
          <h2 className="text-xl font-black text-[#23212b] mt-0.5">
            4 Pola Dasar Kalimat Efektif Bahasa Indonesia
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SENTENCE_PATTERNS.map((p) => (
            <div
              key={p.pattern}
              className="p-4.5 rounded-2xl border border-[#ece7dc] bg-[#faf8f5] space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#7c5cc4] px-2.5 py-1 bg-[#efeafa] rounded-lg">
                  Pola {p.pattern}
                </span>
              </div>
              <div className="text-base font-extrabold text-[#23212b]">
                &quot;{p.example}&quot;
              </div>

              {/* Tag breakdown */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {p.breakdown.map((b, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-[#e2dccd]"
                  >
                    <b className="text-[#7c5cc4]">{b.c}:</b>
                    <span>{b.w}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tips Box */}
        <div className="p-5 bg-[#faf8f3] rounded-2xl border border-[#e2dccd] text-xs text-[#554f60] leading-relaxed space-y-1.5">
          <div className="font-black text-[#23212b] text-sm">
            💡 Tips Membedakan Objek (O) dan Keterangan (K):
          </div>
          <div>
            1. <b>Objek</b> langsung mengikuti predikat transitif dan <i>bisa dipasifkan</i>: &quot;Ayah membaca koran&quot; ➜ &quot;Koran dibaca oleh Ayah&quot;.
          </div>
          <div>
            2. <b>Keterangan</b> biasanya didahului oleh preposisi (kata depan) seperti <i>di, ke, dari, pada, untuk, dengan</i> dan posisinya lebih fleksibel (bisa dipindah ke depan kalimat tanpa merusak makna).
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="pt-4 flex flex-wrap gap-3">
          {onGoToPractice && (
            <button
              onClick={() => {
                playPopSound();
                onGoToPractice();
              }}
              className="px-5 py-3 bg-[#7c5cc4] text-white font-extrabold text-xs rounded-xl shadow-[0_3px_0_#5a3fa0] hover:bg-[#6c4eb4] transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Uji Pemahaman di Latihan Mandiri</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onGoToAnalyzer && (
            <button
              onClick={() => {
                playPopSound();
                onGoToAnalyzer();
              }}
              className="px-5 py-3 bg-white text-[#5b4b8a] border border-[#d9cff2] font-extrabold text-xs rounded-xl hover:bg-[#efeafa] transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Buka Bedah Kalimat Interaktif</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
