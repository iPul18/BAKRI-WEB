import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  Users,
  Copy,
  Check,
  Play,
  SkipForward,
  Trophy,
  Clock,
  Sparkles,
  Bot,
  UserPlus
} from 'lucide-react';
import { Room, Player } from '../types';
import { RenderAvatar } from '../utils/avatars';
import { getCorrectAnswerDisplay } from '../utils/spokParser';
import {
  saveRoom,
  savePlayers,
  addBotClassmates,
  simulateBotAnswersForQuestion
} from '../utils/realtimeBus';
import { playCorrectSound, playFanfareSound, playPopSound, playTickSound } from '../utils/audio';

interface HostViewProps {
  room: Room;
  players: Player[];
  onExit: () => void;
}

export function HostView({ room, players, onExit }: HostViewProps) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(room.T);
  const lastTickRef = useRef<number>(0);

  // Generate QR Code on mount or code change
  useEffect(() => {
    const url = `${window.location.origin}${window.location.pathname}?room=${room.code}`;
    QRCode.toDataURL(url, {
      width: 220,
      margin: 2,
      color: {
        dark: '#23212b',
        light: '#ffffff'
      }
    })
      .then((data) => setQrDataUrl(data))
      .catch((err) => console.error('QR code generation error', err));
  }, [room.code]);

  // Host Countdown & phase watcher loop
  useEffect(() => {
    if (room.phase !== 'q') return;

    // Trigger bot simulations if any exist
    simulateBotAnswersForQuestion(room);

    const interval = setInterval(() => {
      const elapsedSec = (Date.now() - room.qStart) / 1000;
      const remaining = Math.max(0, room.T - elapsedSec);
      setTimeLeft(remaining);

      // Play subtle tick for last 5 seconds
      const currentCeil = Math.ceil(remaining);
      if (currentCeil <= 5 && currentCeil > 0 && currentCeil !== lastTickRef.current) {
        lastTickRef.current = currentCeil;
        playTickSound();
      }

      // Check if all players answered or time is up
      const answeredCount = players.filter((p) => p.ans && p.ans.qi === room.qi).length;
      const allAnswered = players.length > 0 && answeredCount >= players.length;

      if (remaining <= 0 || allAnswered) {
        clearInterval(interval);
        // Transition to results phase
        const updatedRoom: Room = {
          ...room,
          phase: 'r'
        };
        saveRoom(updatedRoom);
        playCorrectSound();
      }
    }, 250);

    return () => clearInterval(interval);
  }, [room.phase, room.qi, room.qStart, room.T, players.length]);

  // Trigger confetti when entering 'end' phase
  useEffect(() => {
    if (room.phase === 'end') {
      playFanfareSound();
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 400);
      } catch {
        // ignore
      }
    }
  }, [room.phase]);

  const copyRoomLink = () => {
    playPopSound();
    const url = `${window.location.origin}${window.location.pathname}?room=${room.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    if (players.length === 0) {
      alert('Belum ada peserta yang bergabung. Anda bisa klik "Tambah Bot Teman" untuk langsung menguji!');
      return;
    }
    playPopSound();
    // Reset players answers and scores for new game
    const resetPlayers = players.map((p) => ({
      ...p,
      score: 0,
      ans: null,
      streak: 0
    }));
    savePlayers(room.code, resetPlayers);

    const updatedRoom: Room = {
      ...room,
      phase: 'q',
      qi: 0,
      qStart: Date.now()
    };
    saveRoom(updatedRoom);
  };

  const handleNextQuestion = () => {
    playPopSound();
    if (room.qi + 1 >= room.qs.length) {
      // Game Over
      const updatedRoom: Room = {
        ...room,
        phase: 'end'
      };
      saveRoom(updatedRoom);
    } else {
      // Next Question
      const updatedRoom: Room = {
        ...room,
        phase: 'q',
        qi: room.qi + 1,
        qStart: Date.now()
      };
      saveRoom(updatedRoom);
    }
  };

  const handleEndQuestionEarly = () => {
    playPopSound();
    const updatedRoom: Room = {
      ...room,
      phase: 'r'
    };
    saveRoom(updatedRoom);
  };

  const handleAddBots = () => {
    playPopSound();
    addBotClassmates(room.code, 4);
  };

  const currentQ = room.qs[room.qi];
  const answeredPlayers = players.filter((p) => p.ans && p.ans.qi === room.qi);

  // Sorting for round podium (by ok, then by speed ms)
  const roundRanking = [...answeredPlayers].sort((a, b) => {
    const aOk = a.ans?.ok ? 1 : 0;
    const bOk = b.ans?.ok ? 1 : 0;
    if (bOk !== aOk) return bOk - aOk;
    return (a.ans?.ms || 999999) - (b.ans?.ms || 999999);
  });

  // Overall Leaderboard sorted by total score
  const overallRanking = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Top Banner with Room Code */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-[#ece7dc] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#efeafa] text-[#7c5cc4] flex items-center justify-center font-bold text-lg">
            🧑‍🏫
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#8a8594] uppercase tracking-wider">
              MODE HOST KELAS
            </div>
            <div className="text-xl font-black text-[#23212b] flex items-center gap-2">
              <span>KODE ROOM:</span>
              <span className="text-[#7c5cc4] tracking-widest">{room.code}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyRoomLink}
            className="px-3.5 py-2 text-xs font-bold text-[#5b4b8a] bg-[#efeafa] hover:bg-[#e4dbf7] rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Salin Tautan'}</span>
          </button>

          <button
            onClick={onExit}
            className="px-3 py-2 text-xs font-bold text-[#b91c1c] hover:bg-[#fee2e2] rounded-xl transition-all cursor-pointer"
          >
            Tutup Room
          </button>
        </div>
      </div>

      {/* PHASE 1: LOBBY */}
      {room.phase === 'lobby' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: QR Code & Big Display for Projector */}
            <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-[#ece7dc] shadow-sm flex flex-col items-center text-center">
              <div className="text-xs font-extrabold text-[#7c5cc4] uppercase tracking-wider mb-2">
                Pindai untuk Bergabung
              </div>

              {qrDataUrl ? (
                <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-[#7c5cc4]/40 shadow-inner my-2">
                  <img src={qrDataUrl} alt="Room QR Code" className="w-48 h-48 rounded-lg" />
                </div>
              ) : (
                <div className="w-48 h-48 bg-[#faf8f5] rounded-xl flex items-center justify-center text-xs text-[#8a8594]">
                  Membuat QR Code...
                </div>
              )}

              <div className="text-4xl font-black tracking-widest text-[#7c5cc4] my-2 select-all font-mono">
                {room.code}
              </div>

              <div className="text-xs text-[#666072] mt-1">
                Password: <b className="text-[#23212b] font-mono">{room.pass}</b>
              </div>

              <div className="text-[11px] text-[#8a8594] mt-2 flex items-center gap-2">
                <span>{room.qs.length} Soal</span>
                <span>•</span>
                <span>{room.T} Detik / Soal</span>
              </div>
            </div>

            {/* Right: Participant Roster & Host Action Deck */}
            <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-[#ece7dc] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#f0ede6] mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#7c5cc4]" />
                    <h3 className="text-base font-extrabold text-[#23212b]">
                      Peserta Masuk ({players.length})
                    </h3>
                  </div>

                  <button
                    onClick={handleAddBots}
                    className="px-3 py-1.5 text-xs font-bold text-[#3e683b] bg-[#d9ecd7] hover:bg-[#c6e4c3] rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    title="Tambahkan peserta virtual untuk menguji game tanpa perlu buka perangkat lain"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>+4 Bot Uji</span>
                  </button>
                </div>

                {players.length === 0 ? (
                  <div className="py-12 text-center text-[#8a8594]">
                    <div className="text-3xl mb-2">🎒</div>
                    <div className="text-sm font-bold text-[#666072]">
                      Menunggu peserta bergabung...
                    </div>
                    <div className="text-xs mt-1 max-w-xs mx-auto">
                      Siswa dapat scan barcode di samping atau buka halaman web dan masukkan kode{' '}
                      <b className="font-mono text-[#23212b]">{room.code}</b>.
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2.5 max-h-64 overflow-y-auto p-1">
                    {players.map((p) => (
                      <div
                        key={p.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#faf8f5] rounded-full border border-[#e9e4d8] shadow-xs animate-pop-in"
                      >
                        <RenderAvatar avatar={p.av} color={p.col} size="sm" />
                        <span className="text-xs font-extrabold text-[#23212b]">
                          {p.name}
                        </span>
                        {p.isBot && (
                          <span className="text-[9px] font-bold text-[#7c5cc4] bg-[#efeafa] px-1.5 py-0.2 rounded-full">
                            BOT
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Start Game Action */}
              <div className="pt-6 border-t border-[#f0ede6] mt-6">
                <button
                  onClick={handleStartGame}
                  className="w-full py-4 bg-[#7c5cc4] text-white font-black text-base rounded-2xl shadow-[0_4px_0_#5a3fa0] hover:bg-[#6c4eb4] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Mulai Kuis Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: LIVE QUESTION HOST VIEW */}
      {room.phase === 'q' && currentQ && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ece7dc] shadow-md space-y-6">
          {/* Header Bar */}
          <div className="flex items-center justify-between text-xs font-bold text-[#8a8594] pb-3 border-b border-[#f0ede6]">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-[#efeafa] text-[#7c5cc4] rounded-lg font-extrabold">
                {currentQ.t === 'PG' && 'PILIHAN GANDA'}
                {currentQ.t === 'CB' && 'CHECKBOX MULTI'}
                {currentQ.t === 'BS' && 'BENAR / SALAH'}
                {currentQ.t === 'SK' && 'SUSUN KATA'}
                {currentQ.t === 'ES' && 'ESAI / ISIAN'}
              </span>
              <span>Soal {room.qi + 1} dari {room.qs.length}</span>
            </div>
            <div className="font-extrabold text-[#23212b]">
              Bobot Maks: {currentQ.w} Poin
            </div>
          </div>

          {/* Countdown & Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#8a8594]">
                <Clock className="w-3.5 h-3.5 text-[#7c5cc4]" />
                <span>Sisa Waktu</span>
              </div>
              <div className="text-3xl font-black text-[#7c5cc4] font-mono tabular-nums">
                {Math.ceil(timeLeft)}s
              </div>
            </div>
            <div className="w-full h-3 bg-[#f0ede6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7c5cc4] transition-all duration-200"
                style={{ width: `${(timeLeft / room.T) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="py-6 text-center">
            <div className="text-2xl sm:text-3xl font-black text-[#23212b] max-w-2xl mx-auto leading-snug">
              {currentQ.q}
            </div>
          </div>

          {/* Response Tracker Status */}
          <div className="p-4 bg-[#faf8f5] rounded-2xl border border-[#ece7dc] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#7c5cc4]" />
              <span className="text-sm font-extrabold text-[#23212b]">
                {answeredPlayers.length} / {players.length} Peserta Menjawab
              </span>
            </div>

            <button
              onClick={handleEndQuestionEarly}
              className="px-4 py-2 bg-white text-[#7c5cc4] border border-[#d9cff2] font-bold text-xs rounded-xl hover:bg-[#efeafa] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Akhiri Soal Lebih Awal</span>
            </button>
          </div>
        </div>
      )}

      {/* PHASE 3: ROUND RESULTS */}
      {room.phase === 'r' && currentQ && (
        <div className="space-y-6">
          {/* Answer Reveal Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#ece7dc] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ede6]">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-black text-[#23212b]">
                  Hasil Soal {room.qi + 1}
                </h3>
              </div>
              <span className="text-xs text-[#8a8594]">
                {answeredPlayers.filter((p) => p.ans?.ok).length} dari {players.length} benar
              </span>
            </div>

            <div className="p-4 bg-[#d9ecd7]/40 border border-[#b2d8ae] rounded-2xl">
              <div className="text-xs font-bold text-[#3e683b] uppercase tracking-wider mb-1">
                Kunci Jawaban yang Benar:
              </div>
              <div className="text-xl font-black text-[#23212b]">
                {getCorrectAnswerDisplay(currentQ)}
              </div>
              {currentQ.explanation && (
                <div className="text-xs text-[#3e683b] mt-2 font-medium">
                  💡 {currentQ.explanation}
                </div>
              )}
            </div>

            {/* Question Leaderboard for this round */}
            <div>
              <div className="text-xs font-bold text-[#8a8594] uppercase tracking-wider mb-2">
                Kecepatan & Perolehan Poin Soal Ini:
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {roundRanking.length === 0 ? (
                  <div className="text-xs text-[#8a8594] py-3 text-center">
                    Tidak ada jawaban yang masuk.
                  </div>
                ) : (
                  roundRanking.map((p, idx) => (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        idx === 0 && p.ans?.ok
                          ? 'bg-[#fff9db] border-amber-300 shadow-xs'
                          : 'bg-[#faf8f5] border-[#ece7dc]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center font-black text-sm text-[#666072]">
                          {idx === 0 && p.ans?.ok ? '👑' : `${idx + 1}`}
                        </span>
                        <RenderAvatar avatar={p.av} color={p.col} size="sm" />
                        <div>
                          <div className="text-sm font-extrabold text-[#23212b]">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-[#8a8594]">
                            Waktu respon: {((p.ans?.ms || 0) / 1000).toFixed(2)} detik
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-sm font-black ${
                            p.ans?.ok ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {p.ans?.ok ? `+${p.ans?.pts} poin` : '0 poin'}
                        </div>
                        <div className="text-[10px] text-[#8a8594]">
                          Total: {p.score} poin
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action to proceed */}
            <div className="pt-4 border-t border-[#f0ede6] flex justify-end">
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3.5 bg-[#7c5cc4] text-white font-black text-sm rounded-2xl shadow-[0_4px_0_#5a3fa0] hover:bg-[#6c4eb4] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer flex items-center gap-2"
              >
                <span>{room.qi + 1 >= room.qs.length ? 'Lihat Pemenang Akhir 🏆' : 'Soal Berikutnya ➜'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 4: FINAL GRAND PODIUM */}
      {room.phase === 'end' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#ece7dc] shadow-xl text-center space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#efeafa] text-[#7c5cc4] rounded-full text-xs font-extrabold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> HASIL PERTANDINGAN KUIS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#23212b]">
              🏆 Podium Juara SPOK Quest 🏆
            </h2>
            <p className="text-xs text-[#8a8594] mt-1">
              Selamat kepada para juara penakluk struktur kalimat Bahasa Indonesia!
            </p>
          </div>

          {/* 3D-styled Podium Columns (2nd - 1st - 3rd) */}
          <div className="flex items-end justify-center gap-3 sm:gap-6 pt-6 pb-2 min-h-[300px]">
            {/* 2nd Place (Silver) */}
            {overallRanking[1] && (
              <div className="flex-1 max-w-[140px] flex flex-col items-center">
                <div className="mb-2 animate-bounce-slow">
                  <RenderAvatar
                    avatar={overallRanking[1].av}
                    color={overallRanking[1].col}
                    size="lg"
                    className="ring-4 ring-slate-300 shadow-md"
                  />
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-[#23212b] truncate max-w-full">
                  {overallRanking[1].name}
                </div>
                <div className="text-xs font-bold text-[#7c5cc4] mb-2">
                  {overallRanking[1].score} pts
                </div>
                <div
                  className="w-full bg-slate-200 border-2 border-slate-300 rounded-t-2xl flex items-center justify-center text-2xl font-black text-slate-700 shadow-md"
                  style={{ height: '140px' }}
                >
                  2
                </div>
              </div>
            )}

            {/* 1st Place (Gold) */}
            {overallRanking[0] && (
              <div className="flex-1 max-w-[150px] flex flex-col items-center">
                <div className="text-2xl mb-1">👑</div>
                <div className="mb-2 animate-bounce-slow">
                  <RenderAvatar
                    avatar={overallRanking[0].av}
                    color={overallRanking[0].col}
                    size="xl"
                    className="ring-4 ring-amber-400 shadow-lg"
                  />
                </div>
                <div className="text-sm sm:text-base font-black text-[#23212b] truncate max-w-full">
                  {overallRanking[0].name}
                </div>
                <div className="text-xs font-extrabold text-amber-600 mb-2">
                  {overallRanking[0].score} pts
                </div>
                <div
                  className="w-full bg-amber-300 border-2 border-amber-400 rounded-t-2xl flex items-center justify-center text-3xl font-black text-amber-900 shadow-lg"
                  style={{ height: '190px' }}
                >
                  1
                </div>
              </div>
            )}

            {/* 3rd Place (Bronze) */}
            {overallRanking[2] && (
              <div className="flex-1 max-w-[140px] flex flex-col items-center">
                <div className="mb-2 animate-bounce-slow">
                  <RenderAvatar
                    avatar={overallRanking[2].av}
                    color={overallRanking[2].col}
                    size="lg"
                    className="ring-4 ring-amber-700/40 shadow-md"
                  />
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-[#23212b] truncate max-w-full">
                  {overallRanking[2].name}
                </div>
                <div className="text-xs font-bold text-[#7c5cc4] mb-2">
                  {overallRanking[2].score} pts
                </div>
                <div
                  className="w-full bg-[#e8c39e] border-2 border-[#d09e73] rounded-t-2xl flex items-center justify-center text-2xl font-black text-[#6d3e1a] shadow-md"
                  style={{ height: '100px' }}
                >
                  3
                </div>
              </div>
            )}
          </div>

          {/* 4th & 5th Place List */}
          {overallRanking.length > 3 && (
            <div className="max-w-md mx-auto space-y-2 pt-4 border-t border-[#f0ede6]">
              {overallRanking.slice(3, 5).map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-[#faf8f5] rounded-xl border border-[#ece7dc]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 font-black text-xs text-[#8a8594]">
                      {idx + 4}
                    </span>
                    <RenderAvatar avatar={p.av} color={p.col} size="sm" />
                    <span className="text-xs font-extrabold text-[#23212b]">
                      {p.name}
                    </span>
                  </div>
                  <span className="text-xs font-black text-[#7c5cc4]">
                    {p.score} poin
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Reset / Return actions */}
          <div className="pt-6 flex flex-wrap justify-center gap-4">
            <button
              onClick={handleStartGame}
              className="px-6 py-3.5 bg-[#7c5cc4] text-white font-extrabold text-sm rounded-2xl shadow-[0_4px_0_#5a3fa0] hover:bg-[#6c4eb4] transition-all cursor-pointer"
            >
              Mainkan Lagi Room Ini 🔄
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3.5 bg-white text-[#23212b] border border-[#e2dccd] font-extrabold text-sm rounded-2xl hover:bg-[#faf8f5] transition-all cursor-pointer"
            >
              Kembali ke Beranda 🏠
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
