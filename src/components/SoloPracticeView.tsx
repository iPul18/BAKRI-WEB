import React, { useState } from 'react';
import { Sparkles, RotateCcw, CheckCircle2, XCircle, ArrowRight, Trophy, BookOpen } from 'lucide-react';
import { Question } from '../types';
import { checkAnswer, getCorrectAnswerDisplay, DEFAULT_RAW_QUESTIONS, parseQuestions } from '../utils/spokParser';
import { playCorrectSound, playWrongSound, playFanfareSound, playPopSound } from '../utils/audio';

interface SoloPracticeViewProps {
  onBackToHome: () => void;
  onOpenTheory: () => void;
}

export function SoloPracticeView({ onBackToHome, onOpenTheory }: SoloPracticeViewProps) {
  const [questions, setQuestions] = useState<Question[]>(() => parseQuestions(DEFAULT_RAW_QUESTIONS));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [orderedWordIndices, setOrderedWordIndices] = useState<number[]>([]);
  const [essayText, setEssayText] = useState('');
  const [answeredState, setAnsweredState] = useState<{
    done: boolean;
    isCorrect: boolean;
    userAnswer: any;
  } | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (ans: any) => {
    if (answeredState?.done || !currentQ) return;
    playPopSound();

    const isCorrect = checkAnswer(currentQ, ans);
    if (isCorrect) {
      playCorrectSound();
      setScore((s) => s + currentQ.w);
      setStreak((st) => {
        const next = st + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
    } else {
      playWrongSound();
      setStreak(0);
    }

    setAnsweredState({
      done: true,
      isCorrect,
      userAnswer: ans
    });
  };

  const handleNext = () => {
    playPopSound();
    if (currentIndex + 1 >= questions.length) {
      setIsFinished(true);
      playFanfareSound();
    } else {
      setCurrentIndex((idx) => idx + 1);
      setSelectedIndices([]);
      setOrderedWordIndices([]);
      setEssayText('');
      setAnsweredState(null);
    }
  };

  const handleRestart = () => {
    playPopSound();
    setQuestions(parseQuestions(DEFAULT_RAW_QUESTIONS));
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setSelectedIndices([]);
    setOrderedWordIndices([]);
    setEssayText('');
    setAnsweredState(null);
    setIsFinished(false);
  };

  const PG_COLORS = [
    'bg-[#e74c3c] text-white',
    'bg-[#3498db] text-white',
    'bg-[#e1a800] text-white',
    'bg-[#27ae60] text-white'
  ];

  if (isFinished) {
    const maxScore = questions.reduce((acc, q) => acc + q.w, 0);
    const percentage = Math.round((score / maxScore) * 100);

    return (
      <div className="max-w-xl mx-auto py-10">
        <div className="bg-white p-8 rounded-3xl border border-[#ece7dc] shadow-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#efeafa] text-[#7c5cc4] text-4xl flex items-center justify-center mx-auto animate-bounce-slow">
            🏆
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#7c5cc4]">
              LATIHAN SELESAI
            </span>
            <h2 className="text-3xl font-black text-[#23212b] mt-1">
              Hasil Latihan SPOK Mandiri
            </h2>
            <p className="text-xs text-[#8a8594] mt-1">
              Kamu telah menyelesaikan semua {questions.length} soal latihan susun kata!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="p-4 bg-[#faf8f5] rounded-2xl border border-[#ece7dc]">
              <div className="text-xs font-bold text-[#8a8594]">Total Skor</div>
              <div className="text-2xl font-black text-[#7c5cc4]">{score} / {maxScore}</div>
              <div className="text-[11px] font-bold text-[#3e683b]">{percentage}% Akurasi</div>
            </div>
            <div className="p-4 bg-[#faf8f5] rounded-2xl border border-[#ece7dc]">
              <div className="text-xs font-bold text-[#8a8594]">Streak Tertinggi</div>
              <div className="text-2xl font-black text-amber-500">{maxStreak} 🔥</div>
              <div className="text-[11px] font-bold text-[#666072]">Jawaban Berturut-turut</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="flex-1 py-3.5 bg-[#7c5cc4] text-white font-extrabold text-sm rounded-2xl shadow-[0_3px_0_#5a3fa0] hover:bg-[#6c4eb4] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Coba Lagi</span>
            </button>
            <button
              onClick={onBackToHome}
              className="flex-1 py-3.5 bg-white text-[#23212b] border border-[#e2dccd] font-extrabold text-sm rounded-2xl hover:bg-[#faf8f5] transition-all cursor-pointer"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      {/* Top Bar for Practice */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#ece7dc] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d9ecd7] text-[#3e683b] flex items-center justify-center font-black">
            ⚡
          </div>
          <div>
            <div className="text-xs font-extrabold text-[#7c5cc4] uppercase tracking-wider">
              LATIHAN MANDIRI
            </div>
            <div className="text-sm font-extrabold text-[#23212b]">
              Soal {currentIndex + 1} dari {questions.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-bold text-[#8a8594] uppercase">Skor</div>
            <div className="text-sm font-black text-[#7c5cc4]">{score} pts</div>
          </div>
          {streak > 1 && (
            <div className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-xl text-xs font-black flex items-center gap-1">
              <span>🔥</span>
              <span>{streak}</span>
            </div>
          )}
          <button
            onClick={onBackToHome}
            className="text-xs font-bold text-[#8a8594] hover:text-[#23212b] p-2 transition-colors cursor-pointer"
          >
            Keluar
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ece7dc] shadow-md space-y-6">
        {/* Progress Bar */}
        <div className="w-full h-2 bg-[#f0ede6] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#7c5cc4] transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Type & Badge */}
        <div className="flex items-center justify-between text-xs font-bold text-[#8a8594]">
          <span className="px-2.5 py-1 bg-[#efeafa] text-[#7c5cc4] rounded-lg font-extrabold">
            {currentQ.t === 'PG' && 'PILIHAN GANDA'}
            {currentQ.t === 'CB' && 'CHECKBOX MULTI'}
            {currentQ.t === 'BS' && 'BENAR / SALAH'}
            {currentQ.t === 'SK' && 'SUSUN KATA'}
            {currentQ.t === 'ES' && 'ESAI / ISIAN'}
          </span>
          <button
            onClick={onOpenTheory}
            className="text-[#7c5cc4] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lihat Pedoman SPOK</span>
          </button>
        </div>

        {/* Question Prompt */}
        <div className="py-2 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-[#23212b] leading-relaxed">
            {currentQ.q}
          </h2>
        </div>

        {/* Interactive Input Form */}
        <div>
          {/* PG */}
          {currentQ.t === 'PG' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.o.map((opt, idx) => {
                const isSelected = answeredState?.userAnswer === idx;
                const isCorrectChoice = idx === currentQ.c;
                return (
                  <button
                    key={idx}
                    disabled={answeredState?.done}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 rounded-2xl font-extrabold text-sm text-left transition-all cursor-pointer flex items-center gap-3 ${
                      answeredState?.done
                        ? isCorrectChoice
                          ? 'bg-emerald-600 text-white shadow-md ring-3 ring-emerald-300'
                          : isSelected
                          ? 'bg-rose-500 text-white opacity-60 line-through'
                          : 'bg-slate-100 text-slate-400 opacity-40'
                        : `${PG_COLORS[idx % 4]} hover:opacity-90 active:translate-y-0.5`
                    }`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-black/15 flex items-center justify-center font-black text-xs shrink-0">
                      {['A', 'B', 'C', 'D'][idx]}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* BS */}
          {currentQ.t === 'BS' && (
            <div className="grid grid-cols-2 gap-4">
              <button
                disabled={answeredState?.done}
                onClick={() => handleSelectOption(0)}
                className={`py-5 rounded-2xl font-black text-lg transition-all cursor-pointer flex flex-col items-center gap-2 ${
                  answeredState?.done
                    ? currentQ.c === 0
                      ? 'bg-emerald-600 text-white ring-3 ring-emerald-300'
                      : 'bg-slate-100 text-slate-400 opacity-40'
                    : 'bg-[#27ae60] text-white hover:bg-[#219150]'
                }`}
              >
                <span className="text-2xl">👍</span>
                <span>BENAR</span>
              </button>
              <button
                disabled={answeredState?.done}
                onClick={() => handleSelectOption(1)}
                className={`py-5 rounded-2xl font-black text-lg transition-all cursor-pointer flex flex-col items-center gap-2 ${
                  answeredState?.done
                    ? currentQ.c === 1
                      ? 'bg-emerald-600 text-white ring-3 ring-emerald-300'
                      : 'bg-slate-100 text-slate-400 opacity-40'
                    : 'bg-[#e74c3c] text-white hover:bg-[#d63031]'
                }`}
              >
                <span className="text-2xl">👎</span>
                <span>SALAH</span>
              </button>
            </div>
          )}

          {/* CB */}
          {currentQ.t === 'CB' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQ.o.map((opt, idx) => {
                  const isChecked = selectedIndices.includes(idx);
                  return (
                    <button
                      key={idx}
                      disabled={answeredState?.done}
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setSelectedIndices((prev) =>
                          prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                        );
                      }}
                      className={`p-3.5 rounded-2xl border font-bold text-sm text-left transition-all cursor-pointer flex items-center gap-3 ${
                        isChecked
                          ? 'border-[#7c5cc4] bg-[#efeafa] text-[#5b4b8a]'
                          : 'border-[#ece7dc] bg-[#faf8f5] text-[#23212b]'
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

              {!answeredState?.done && (
                <button
                  onClick={() => handleSelectOption(selectedIndices)}
                  disabled={selectedIndices.length === 0}
                  className="w-full py-3.5 bg-[#7c5cc4] text-white font-black text-sm rounded-2xl shadow-[0_3px_0_#5a3fa0] hover:bg-[#6c4eb4] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  Kirim Jawaban Centang ({selectedIndices.length})
                </button>
              )}
            </div>
          )}

          {/* SK */}
          {currentQ.t === 'SK' && (
            <div className="space-y-4">
              {/* Assembled Area */}
              <div className="min-h-[64px] p-3.5 bg-[#efeafa] border-2 border-dashed border-[#b9a7e8] rounded-2xl flex flex-wrap gap-2 items-center justify-center">
                {orderedWordIndices.length === 0 ? (
                  <span className="text-xs text-[#8a8594] italic">
                    Ketuk kata di bawah untuk mulai menyusun kalimat
                  </span>
                ) : (
                  orderedWordIndices.map((wordIdx) => (
                    <button
                      key={wordIdx}
                      disabled={answeredState?.done}
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setOrderedWordIndices((prev) => prev.filter((i) => i !== wordIdx));
                      }}
                      className="px-3 py-1.5 bg-[#7c5cc4] text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <span>{currentQ.o[wordIdx]}</span>
                      {!answeredState?.done && <span className="text-[10px]">✕</span>}
                    </button>
                  ))
                )}
              </div>

              {/* Word Bank */}
              {!answeredState?.done && (
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
                        className="px-3.5 py-2 bg-white text-[#23212b] border border-[#d9cff2] font-extrabold text-xs rounded-xl shadow-xs hover:bg-[#efeafa] cursor-pointer"
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              )}

              {!answeredState?.done && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playPopSound();
                      setOrderedWordIndices([]);
                    }}
                    className="px-4 py-3 bg-[#f3ede1] text-[#666072] font-bold text-xs rounded-2xl hover:bg-[#e8dfcf] cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const built = orderedWordIndices.map((i) => currentQ.o[i]).join(' ');
                      handleSelectOption(built);
                    }}
                    disabled={orderedWordIndices.length === 0}
                    className="flex-1 py-3 bg-[#7c5cc4] text-white font-black text-sm rounded-2xl shadow-[0_3px_0_#5a3fa0] hover:bg-[#6c4eb4] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    Kirim Susunan Kalimat
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ES */}
          {currentQ.t === 'ES' && (
            <div className="space-y-4">
              <textarea
                disabled={answeredState?.done}
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder="Ketik kata atau frasa jawabanmu..."
                className="w-full p-4 bg-white border border-[#e2dccd] rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7c5cc4] min-h-[90px]"
              />
              {!answeredState?.done && (
                <button
                  onClick={() => handleSelectOption(essayText)}
                  disabled={!essayText.trim()}
                  className="w-full py-3.5 bg-[#7c5cc4] text-white font-black text-sm rounded-2xl shadow-[0_3px_0_#5a3fa0] hover:bg-[#6c4eb4] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  Kirim Jawaban
                </button>
              )}
            </div>
          )}
        </div>

        {/* Feedback Section */}
        {answeredState?.done && (
          <div className="p-5 rounded-2xl border space-y-3 animate-pop-in bg-[#faf8f5] border-[#ece7dc]">
            <div className="flex items-center gap-2">
              {answeredState.isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-black text-emerald-700">
                    Benar Sekali! (+{currentQ.w} Poin)
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span className="text-sm font-black text-rose-700">
                    Belum Tepat (0 Poin)
                  </span>
                </>
              )}
            </div>

            <div className="text-xs text-[#23212b]">
              <span className="font-bold text-[#8a8594]">Kunci yang tepat: </span>
              <span className="font-extrabold">{getCorrectAnswerDisplay(currentQ)}</span>
            </div>

            {currentQ.explanation && (
              <div className="text-xs text-[#5b4b8a] bg-[#efeafa] p-3 rounded-xl">
                💡 <b>Penjelasan:</b> {currentQ.explanation}
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full py-3.5 bg-[#7c5cc4] text-white font-black text-sm rounded-2xl shadow-[0_3px_0_#5a3fa0] hover:bg-[#6c4eb4] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>{currentIndex + 1 >= questions.length ? 'Lihat Hasil Akhir' : 'Lanjut ke Soal Berikutnya'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
