import React, { useState, useEffect } from 'react';
import { Clock, Send, RotateCcw, Check, X, Trophy, Sparkles } from 'lucide-react';
import { Room, Player, Question } from '../types';
import { RenderAvatar } from '../utils/avatars';
import { submitPlayerAnswer } from '../utils/realtimeBus';
import { getCorrectAnswerDisplay } from '../utils/spokParser';
import { playCorrectSound, playWrongSound, playPopSound } from '../utils/audio';

interface PlayerViewProps {
  room: Room;
  player: Player;
  onExit: () => void;
}

export function PlayerView({ room, player, onExit }: PlayerViewProps) {
  const currentQ: Question | undefined = room.qs[room.qi];
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [orderedWordIndices, setOrderedWordIndices] = useState<number[]>([]);
  const [essayText, setEssayText] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(room.T);

  // Reset inputs when question index changes
  useEffect(() => {
    setSelectedIndices([]);
    setOrderedWordIndices([]);
    setEssayText('');
  }, [room.qi, room.phase]);

  // Player timer countdown
  useEffect(() => {
    if (room.phase !== 'q') return;

    const interval = setInterval(() => {
      const elapsedSec = (Date.now() - room.qStart) / 1000;
      const remaining = Math.max(0, room.T - elapsedSec);
      setTimeLeft(remaining);
    }, 250);

    return () => clearInterval(interval);
  }, [room.phase, room.qi, room.qStart, room.T]);

  const hasAnswered = !!(player.ans && player.ans.qi === room.qi);

  const handleSendAnswer = (answerValue: any) => {
    if (hasAnswered || timeLeft <= 0 || !currentQ) return;
    playPopSound();

    const elapsedMs = Math.min(room.T * 1000, Date.now() - room.qStart);
    const result = submitPlayerAnswer(
      room.code,
      player.id,
      room.qi,
      answerValue,
      currentQ,
      room.T,
      elapsedMs
    );

    if (result.ok) {
      playCorrectSound();
    } else {
      playWrongSound();
    }
  };

  const PG_COLORS = [
    'bg-[#e74c3c] hover:bg-[#d63031] text-white shadow-[0_4px_0_#b71515]',
    'bg-[#3498db] hover:bg-[#2980b9] text-white shadow-[0_4px_0_#1c638f]',
    'bg-[#e1a800] hover:bg-[#c99500] text-white shadow-[0_4px_0_#9a7200]',
    'bg-[#27ae60] hover:bg-[#219150] text-white shadow-[0_4px_0_#18693a]'
  ];

  return (
    <div className="max-w-xl mx-auto py-6 space-y-6">
      {/* Player Header Bar */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#ece7dc] shadow-sm">
        <div className="flex items-center gap-3">
          <RenderAvatar avatar={player.av} color={player.col} size="md" />
          <div>
            <div className="text-sm font-extrabold text-[#23212b] leading-tight">
              {player.name}
            </div>
            <div className="text-[11px] text-[#8a8594] font-medium">
              Room: <b className="font-mono text-[#7c5cc4]">{room.code}</b> • Skor: {player.score} pts
            </div>
          </div>
        </div>

        <button
          onClick={onExit}
          className="text-xs font-bold text-[#8a8594] hover:text-[#b91c1c] p-2 transition-colors cursor-pointer"
        >
          Keluar
        </button>
      </div>

      {/* PHASE 1: LOBBY */}
      {room.phase === 'lobby' && (
        <div className="bg-white p-8 rounded-3xl border border-[#ece7dc] shadow-sm text-center space-y-6">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-[#efeafa] text-[#7c5cc4] text-4xl animate-bounce-slow">
            🎮
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#23212b]">
              Kamu Sudah Masuk!
            </h2>
            <p className="text-xs sm:text-sm text-[#666072] mt-1.5 max-w-sm mx-auto">
              Tunggu host memulai kuis di layar utama. Perhatikan proyektor untuk petunjuk kuis!
            </p>
          </div>

          <div className="p-4 bg-[#faf8f5] rounded-2xl border border-[#ece7dc] inline-block text-left text-xs text-[#666072] space-y-1">
            <div>• Kode Room: <b className="font-mono text-[#23212b]">{room.code}</b></div>
            <div>• Jumlah Soal: <b className="text-[#23212b]">{room.qs.length}</b></div>
            <div>• Waktu per Soal: <b className="text-[#23212b]">{room.T} Detik</b></div>
          </div>
        </div>
      )}

      {/* PHASE 2: ACTIVE QUESTION */}
      {room.phase === 'q' && currentQ && (
        <div className="bg-white p-6 rounded-3xl border border-[#ece7dc] shadow-md space-y-6">
          {/* Question Meta */}
          <div className="flex items-center justify-between text-xs font-bold text-[#8a8594] pb-3 border-b border-[#f0ede6]">
            <span className="px-2.5 py-1 bg-[#efeafa] text-[#7c5cc4] rounded-lg font-extrabold">
              Soal {room.qi + 1} / {room.qs.length}
            </span>
            <span>Bobot: {currentQ.w} Poin</span>
          </div>

          {/* Timer Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#8a8594]">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#7c5cc4]" /> Sisa Waktu
              </span>
              <span className="text-xl font-black text-[#7c5cc4] font-mono tabular-nums">
                {Math.ceil(timeLeft)}s
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#f0ede6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7c5cc4] transition-all duration-200"
                style={{ width: `${(timeLeft / room.T) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="py-2 text-center">
            <div className="text-lg sm:text-xl font-black text-[#23212b] leading-relaxed">
              {currentQ.q}
            </div>
          </div>

          {/* If already answered, show waiting state */}
          {hasAnswered ? (
            <div className="p-8 bg-[#efeafa]/50 border border-[#d9cff2] rounded-2xl text-center space-y-3 animate-pop-in">
              <div className="w-12 h-12 rounded-full bg-[#7c5cc4] text-white flex items-center justify-center mx-auto text-xl font-black">
                ✓
              </div>
              <div className="text-base font-extrabold text-[#23212b]">
                Jawabanmu Sudah Terkirim!
              </div>
              <p className="text-xs text-[#666072]">
                Waktu jawab: {((player.ans?.ms || 0) / 1000).toFixed(2)} detik. Menunggu peserta lain atau waktu habis...
              </p>
            </div>
          ) : (
            <div>
              {/* Question Type: PG (Multiple Choice) */}
              {currentQ.t === 'PG' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQ.o.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendAnswer(idx)}
                      className={`p-4 rounded-2xl font-extrabold text-sm text-left transition-all active:translate-y-[2px] active:shadow-none cursor-pointer flex items-center gap-3 ${PG_COLORS[idx % 4]}`}
                    >
                      <span className="w-7 h-7 rounded-lg bg-black/15 flex items-center justify-center font-black text-xs shrink-0">
                        {['A', 'B', 'C', 'D'][idx]}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Question Type: BS (True/False) */}
              {currentQ.t === 'BS' && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleSendAnswer(0)}
                    className="py-6 rounded-2xl bg-[#27ae60] hover:bg-[#219150] text-white font-black text-lg shadow-[0_4px_0_#18693a] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer flex flex-col items-center gap-2"
                  >
                    <span className="text-3xl">👍</span>
                    <span>BENAR</span>
                  </button>
                  <button
                    onClick={() => handleSendAnswer(1)}
                    className="py-6 rounded-2xl bg-[#e74c3c] hover:bg-[#d63031] text-white font-black text-lg shadow-[0_4px_0_#b71515] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer flex flex-col items-center gap-2"
                  >
                    <span className="text-3xl">👎</span>
                    <span>SALAH</span>
                  </button>
                </div>
              )}

              {/* Question Type: CB (Checkbox Multi-Select) */}
              {currentQ.t === 'CB' && (
                <div className="space-y-4">
                  <div className="text-xs text-[#8a8594] text-center font-medium">
                    (Pilih satu atau lebih jawaban yang tepat, lalu kirim)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQ.o.map((opt, idx) => {
                      const isChecked = selectedIndices.includes(idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            playPopSound();
                            setSelectedIndices((prev) =>
                              prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                            );
                          }}
                          className={`p-3.5 rounded-2xl border font-bold text-sm text-left transition-all cursor-pointer flex items-center gap-3 ${
                            isChecked
                              ? 'border-[#7c5cc4] bg-[#efeafa] text-[#5b4b8a] ring-2 ring-[#7c5cc4]/20'
                              : 'border-[#ece7dc] bg-[#faf8f5] text-[#23212b] hover:border-[#d9cff2]'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-black shrink-0 ${
                              isChecked ? 'bg-[#7c5cc4] text-white' : 'border border-[#d2cbba]'
                            }`}
                          >
                            {isChecked && '✓'}
                          </div>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handleSendAnswer(selectedIndices)}
                    disabled={selectedIndices.length === 0}
                    className="w-full py-3.5 bg-[#7c5cc4] text-white font-black text-sm rounded-2xl shadow-[0_3px_0_#5a3fa0] hover:bg-[#6c4eb4] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim Jawaban Pilihan ({selectedIndices.length})</span>
                  </button>
                </div>
              )}

              {/* Question Type: SK (Interactive Susun Kata) */}
              {currentQ.t === 'SK' && (
                <div className="space-y-4">
                  <div className="text-xs text-[#8a8594] text-center font-medium">
                    Ketuk kata di bank kata untuk menyusun kalimat yang runtut:
                  </div>

                  {/* Assembled Sentence Box */}
                  <div className="min-h-[64px] p-3.5 bg-[#efeafa] border-2 border-dashed border-[#b9a7e8] rounded-2xl flex flex-wrap gap-2 items-center justify-center">
                    {orderedWordIndices.length === 0 ? (
                      <span className="text-xs text-[#8a8594] italic">
                        (Belum ada kata yang disusun. Ketuk kata di bawah)
                      </span>
                    ) : (
                      orderedWordIndices.map((wordIdx) => (
                        <button
                          key={wordIdx}
                          type="button"
                          onClick={() => {
                            playPopSound();
                            setOrderedWordIndices((prev) => prev.filter((i) => i !== wordIdx));
                          }}
                          className="px-3 py-1.5 bg-[#7c5cc4] text-white font-extrabold text-xs rounded-xl shadow-xs hover:bg-[#6c4eb4] cursor-pointer flex items-center gap-1 group"
                          title="Ketuk untuk membatalkan kata ini"
                        >
                          <span>{currentQ.o[wordIdx]}</span>
                          <span className="text-[10px] opacity-70 group-hover:opacity-100">✕</span>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Word Bank */}
                  <div className="p-3 bg-[#faf8f5] rounded-2xl border border-[#ece7dc] flex flex-wrap gap-2 justify-center">
                    {currentQ.o.map((word, idx) => {
                      const isUsed = orderedWordIndices.includes(idx);
                      if (isUsed) return null;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            playPopSound();
                            setOrderedWordIndices((prev) => [...prev, idx]);
                          }}
                          className="px-3.5 py-2 bg-white text-[#23212b] border border-[#d9cff2] font-extrabold text-xs rounded-xl shadow-xs hover:bg-[#efeafa] cursor-pointer transition-transform hover:scale-105"
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setOrderedWordIndices([]);
                      }}
                      className="px-4 py-3 bg-[#f3ede1] text-[#666072] font-bold text-xs rounded-2xl hover:bg-[#e8dfcf] cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Ulangi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const builtSentence = orderedWordIndices.map((i) => currentQ.o[i]).join(' ');
                        handleSendAnswer(builtSentence);
                      }}
                      disabled={orderedWordIndices.length === 0}
                      className="flex-1 py-3 bg-[#7c5cc4] text-white font-black text-sm rounded-2xl shadow-[0_3px_0_#5a3fa0] hover:bg-[#6c4eb4] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Kirim Susunan Kalimat</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Question Type: ES (Essay / Fill in the blank) */}
              {currentQ.t === 'ES' && (
                <div className="space-y-4">
                  <textarea
                    value={essayText}
                    onChange={(e) => setEssayText(e.target.value)}
                    placeholder="Ketik kata atau frasa jawabanmu di sini..."
                    className="w-full p-4 bg-white border border-[#e2dccd] rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7c5cc4] min-h-[90px]"
                  />
                  <button
                    onClick={() => handleSendAnswer(essayText)}
                    disabled={!essayText.trim()}
                    className="w-full py-3.5 bg-[#7c5cc4] text-white font-black text-sm rounded-2xl shadow-[0_3px_0_#5a3fa0] hover:bg-[#6c4eb4] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim Jawaban Esai</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PHASE 3: ROUND RESULTS (FEEDBACK) */}
      {room.phase === 'r' && currentQ && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ece7dc] shadow-md text-center space-y-6 animate-pop-in">
          {player.ans && player.ans.qi === room.qi ? (
            <div className="space-y-3">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl ${
                  player.ans.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {player.ans.ok ? '🎉' : '❌'}
              </div>
              <h3 className="text-2xl font-black text-[#23212b]">
                {player.ans.ok ? 'Hebat, Jawabanmu Benar!' : 'Belum Tepat, Jangan Menyerah!'}
              </h3>
              <div className="text-sm font-black text-[#7c5cc4]">
                {player.ans.ok ? `+${player.ans.pts} Poin Diraih` : '0 Poin diperoleh'}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-3xl">⏰</div>
              <h3 className="text-xl font-bold text-[#23212b]">
                Waktu Habis! Kamu Tidak Sempat Menjawab.
              </h3>
            </div>
          )}

          {/* Reveal correct answer */}
          <div className="p-4 bg-[#faf8f5] rounded-2xl border border-[#ece7dc] text-left">
            <div className="text-xs font-bold text-[#8a8594] uppercase tracking-wider mb-1">
              Jawaban yang Tepat:
            </div>
            <div className="text-base font-black text-[#23212b]">
              {getCorrectAnswerDisplay(currentQ)}
            </div>
            {currentQ.explanation && (
              <div className="text-xs text-[#3e683b] mt-2 font-medium">
                💡 {currentQ.explanation}
              </div>
            )}
          </div>

          <div className="text-xs text-[#8a8594]">
            Menunggu host memindahkan ke soal berikutnya...
          </div>
        </div>
      )}

      {/* PHASE 4: FINAL PODIUM */}
      {room.phase === 'end' && (
        <div className="bg-white p-8 rounded-3xl border border-[#ece7dc] shadow-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#efeafa] text-[#7c5cc4] text-4xl flex items-center justify-center mx-auto animate-bounce-slow">
            🏆
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#23212b]">
              Kuis Selesai!
            </h2>
            <p className="text-xs sm:text-sm text-[#666072] mt-1">
              Total Skor Akhir: <b className="text-[#7c5cc4] text-lg">{player.score} poin</b>
            </p>
          </div>

          <p className="text-xs text-[#8a8594]">
            Perhatikan layar proyektor host untuk melihat nama-nama di podium juara!
          </p>

          <button
            onClick={onExit}
            className="w-full py-3.5 bg-[#7c5cc4] text-white font-black text-sm rounded-2xl shadow-[0_3px_0_#5a3fa0] hover:bg-[#6c4eb4] transition-all cursor-pointer"
          >
            Kembali ke Beranda
          </button>
        </div>
      )}
    </div>
  );
}
