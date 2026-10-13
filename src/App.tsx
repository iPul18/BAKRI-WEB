import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AvatarPicker } from './components/AvatarPicker';
import { HostView } from './components/HostView';
import { PlayerView } from './components/PlayerView';
import { SoloPracticeView } from './components/SoloPracticeView';
import { SpokTheoryModal } from './components/SpokTheoryModal';
import { SpokAnalyzer } from './components/SpokAnalyzer';
import { Room, Player, AppView } from './types';
import { DEFAULT_RAW_QUESTIONS, PRESET_THEMES, parseQuestions, fetchAiGeneratedQuestions } from './utils/spokParser';
import { COLOR_PALETTE } from './utils/avatars';
import {
  getRoom,
  saveRoom,
  getPlayers,
  addPlayer,
  subscribeToSync
} from './utils/realtimeBus';
import { playPopSound, playCorrectSound } from './utils/audio';
import { HelpCircle, Sparkles, BookOpen, UserCheck, Users, Wand2, RefreshCw, Layers } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [activeAction, setActiveAction] = useState<string | null>(null);

  // Host form states
  const [hostCode, setHostCode] = useState('SPOK1');
  const [hostPass, setHostPass] = useState('1234');
  const [hostTime, setHostTime] = useState(20);
  const [hostQuestionsRaw, setHostQuestionsRaw] = useState(DEFAULT_RAW_QUESTIONS);

  // AI Generator states
  const [showAiGenerator, setShowAiGenerator] = useState(false);
  const [aiTopic, setAiTopic] = useState('Aktivitas Sehari-hari & Sekolah');
  const [aiLevel, setAiLevel] = useState('Dasar (SD/SMP)');
  const [aiCount, setAiCount] = useState(6);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);

  // Player join form states
  const [joinCode, setJoinCode] = useState('');
  const [joinPass, setJoinPass] = useState('');
  const [joinName, setJoinName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🐱');
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);

  // Active game session
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [roomPlayers, setRoomPlayers] = useState<Player[]>([]);

  // Check query params for shared room links
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const preRoom = params.get('room');
      if (preRoom) {
        setJoinCode(preRoom.toUpperCase());
        setActiveAction('join');
      }
    }
  }, []);

  // Listen to realtime sync when inside a room
  useEffect(() => {
    const activeCode = currentRoom?.code;
    if (!activeCode) return;

    const unsubscribe = subscribeToSync(
      activeCode,
      (updatedRoom) => {
        if (updatedRoom) {
          setCurrentRoom(updatedRoom);
        }
      },
      (updatedPlayers) => {
        setRoomPlayers(updatedPlayers);
        // Also update local player object if exists
        if (currentPlayer) {
          const freshMe = updatedPlayers.find((p) => p.id === currentPlayer.id);
          if (freshMe) {
            setCurrentPlayer(freshMe);
          }
        }
      }
    );

    return () => unsubscribe();
  }, [currentRoom?.code, currentPlayer?.id]);

  // Host: Create Room handler
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    playPopSound();

    const code = hostCode.trim().toUpperCase();
    const pass = hostPass.trim();
    const timeLimit = Math.max(5, Math.min(120, Number(hostTime) || 20));
    const parsed = parseQuestions(hostQuestionsRaw);

    if (!code) {
      alert('Harap isi kode room.');
      return;
    }
    if (!pass) {
      alert('Harap isi password room.');
      return;
    }
    if (parsed.length === 0) {
      alert('Minimal harus ada 1 soal dengan format yang benar.');
      return;
    }

    const newRoom: Room = {
      code,
      hostId: `host_${Date.now()}`,
      pass,
      T: timeLimit,
      qs: parsed,
      phase: 'lobby',
      qi: 0,
      qStart: 0,
      createdAt: Date.now()
    };

    saveRoom(newRoom);
    setCurrentRoom(newRoom);
    setRoomPlayers([]);
    setView('host');
  };

  // Player: Join Room handler
  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    playPopSound();

    const code = joinCode.trim().toUpperCase();
    const pass = joinPass.trim();
    const name = joinName.trim();

    if (!code || !name) {
      alert('Harap isi kode room dan nama peserta.');
      return;
    }

    const room = getRoom(code);
    if (!room) {
      alert(`Room dengan kode "${code}" tidak ditemukan. Pastikan host sudah membuat room terlebih dahulu.`);
      return;
    }

    if (room.pass && room.pass !== pass) {
      alert('Password room salah. Silakan tanyakan ke guru atau host.');
      return;
    }

    const playerId = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newPlayer: Player = {
      id: playerId,
      name,
      av: selectedAvatar,
      col: selectedColor,
      score: 0,
      ans: null,
      streak: 0
    };

    addPlayer(code, newPlayer);
    setCurrentRoom(room);
    setCurrentPlayer(newPlayer);
    setView('player');
  };

  const handleExitRoom = () => {
    setCurrentRoom(null);
    setCurrentPlayer(null);
    setRoomPlayers([]);
    setView('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-[#23212b]">
      {/* 3-Zone Header Contract */}
      <Header
        currentView={view}
        onNavigate={(newView) => {
          setView(newView);
          setActiveAction(null);
        }}
        roomCode={currentRoom?.code}
        onExitRoom={handleExitRoom}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4">
        {/* VIEW 1: HOME */}
        {view === 'home' && (
          <div className="space-y-10">
            <HeroSection
              onSelectAction={(action) => {
                if (action === 'theory') {
                  setView('theory');
                } else if (action === 'analyzer') {
                  setView('analyzer');
                } else if (action === 'practice') {
                  setView('practice');
                } else {
                  setActiveAction(action);
                  // Scroll to form smoothly
                  const formEl = document.getElementById('action-form-section');
                  formEl?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              activeAction={activeAction}
            />

            {/* Inline Action Forms Section */}
            <div id="action-form-section" className="scroll-mt-24">
              {/* Host Form */}
              {activeAction === 'host' && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ece7dc] shadow-md max-w-3xl mx-auto space-y-6 animate-pop-in">
                  <div className="flex items-center justify-between pb-4 border-b border-[#f0ede6]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#efeafa] text-[#7c5cc4] flex items-center justify-center font-bold text-xl">
                        🧑‍🏫
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-[#23212b]">
                          Buat Room Baru (Host / Guru)
                        </h2>
                        <p className="text-xs text-[#8a8594]">
                          Atur waktu pengerjaan dan gunakan bank soal yang siap dimainkan
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveAction(null)}
                      className="text-xs font-bold text-[#8a8594] hover:text-[#23212b] p-1.5 cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>

                  <form onSubmit={handleCreateRoom} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#666072] uppercase tracking-wider mb-1">
                          Kode Room
                        </label>
                        <input
                          type="text"
                          value={hostCode}
                          onChange={(e) => setHostCode(e.target.value.toUpperCase())}
                          placeholder="mis. SPOK1"
                          maxLength={8}
                          className="w-full p-3 bg-white border border-[#e2dccd] rounded-xl text-sm font-black tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-[#7c5cc4]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#666072] uppercase tracking-wider mb-1">
                          Password Room
                        </label>
                        <input
                          type="text"
                          value={hostPass}
                          onChange={(e) => setHostPass(e.target.value)}
                          placeholder="mis. 1234"
                          className="w-full p-3 bg-white border border-[#e2dccd] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#7c5cc4]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#666072] uppercase tracking-wider mb-1">
                          Waktu / Soal (Detik)
                        </label>
                        <input
                          type="number"
                          value={hostTime}
                          onChange={(e) => setHostTime(Number(e.target.value))}
                          min={5}
                          max={120}
                          className="w-full p-3 bg-white border border-[#e2dccd] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#7c5cc4]"
                          required
                        />
                      </div>
                    </div>

                    {/* AI Generator & Preset Toolbar */}
                    <div className="space-y-3 pt-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              playPopSound();
                              setShowAiGenerator(!showAiGenerator);
                            }}
                            className="px-3 py-1.5 bg-[#efeafa] hover:bg-[#e4dbf7] text-[#7c5cc4] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-[#d9cff2]"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>{showAiGenerator ? 'Sembunyikan Panel AI' : '✨ Buat Soal Otomatis dengan AI'}</span>
                          </button>
                        </div>

                        {/* Preset themes */}
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-[11px] font-bold text-[#8a8594] mr-1">Paket Soal:</span>
                          {Object.keys(PRESET_THEMES).map((presetName) => (
                            <button
                              key={presetName}
                              type="button"
                              onClick={() => {
                                playPopSound();
                                setHostQuestionsRaw(PRESET_THEMES[presetName]);
                                setAiSuccessMsg(`Memuat paket: ${presetName}`);
                              }}
                              className="px-2.5 py-1 bg-[#faf8f5] hover:bg-[#f3ede1] text-[#666072] text-[11px] font-bold rounded-lg border border-[#e2dccd] transition-colors cursor-pointer"
                            >
                              {presetName.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* AI Generator Drawer */}
                      {showAiGenerator && (
                        <div className="p-4 bg-[#f8f5fd] border border-[#d9cff2] rounded-2xl space-y-3 animate-pop-in">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-[#7c5cc4]" />
                              <span className="text-xs font-extrabold text-[#5b4b8a]">
                                Generator Soal SPOK Berbasis AI (Gemini 3.8 Flash)
                              </span>
                            </div>
                            <span className="text-[10px] text-[#8a8594] font-semibold">
                              Otomatis memuat PG, CB, BS, SK, & ES
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-bold text-[#666072] uppercase mb-1">
                                Topik / Tema
                              </label>
                              <input
                                type="text"
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                                placeholder="mis. Lingkungan Hidup, Cerita Hewan, Sekolah"
                                className="w-full p-2 bg-white border border-[#d9cff2] rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#7c5cc4]"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-[#666072] uppercase mb-1">
                                Tingkat Pendidikan
                              </label>
                              <select
                                value={aiLevel}
                                onChange={(e) => setAiLevel(e.target.value)}
                                className="w-full p-2 bg-white border border-[#d9cff2] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#7c5cc4]"
                              >
                                <option value="Dasar (SD)">Tingkat Dasar (SD)</option>
                                <option value="Menengah (SMP)">Tingkat Menengah (SMP)</option>
                                <option value="Lanjutan (SMA/Umum)">Tingkat Lanjutan (SMA/Umum)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-[#666072] uppercase mb-1">
                                Jumlah Soal
                              </label>
                              <select
                                value={aiCount}
                                onChange={(e) => setAiCount(Number(e.target.value))}
                                className="w-full p-2 bg-white border border-[#d9cff2] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#7c5cc4]"
                              >
                                <option value={5}>5 Soal Campuran</option>
                                <option value={6}>6 Soal Komprehensif</option>
                                <option value={8}>8 Soal Beragam</option>
                                <option value={10}>10 Soal Lengkap</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="text-[11px] text-[#7c5cc4] font-medium">
                              {aiSuccessMsg && `✓ ${aiSuccessMsg}`}
                            </div>

                            <button
                              type="button"
                              disabled={isGeneratingAi}
                              onClick={async () => {
                                playPopSound();
                                setIsGeneratingAi(true);
                                setAiSuccessMsg(null);
                                try {
                                  const res = await fetchAiGeneratedQuestions(aiTopic, aiLevel, aiCount);
                                  if (res.success && res.text) {
                                    setHostQuestionsRaw(res.text);
                                    setAiSuccessMsg(`Berhasil menghasilkan ${parseQuestions(res.text).length} soal siap main!`);
                                    playCorrectSound();
                                  }
                                } catch (err: any) {
                                  alert('Gagal membuat soal dengan AI: ' + (err?.message || 'Error'));
                                } finally {
                                  setIsGeneratingAi(false);
                                }
                              }}
                              className="px-4 py-2 bg-[#7c5cc4] hover:bg-[#6c4eb4] disabled:opacity-50 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                              {isGeneratingAi ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Menyusun Soal AI...</span>
                                </>
                              ) : (
                                <>
                                  <Wand2 className="w-3.5 h-3.5" />
                                  <span>Generate Soal Sekarang</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Question Bank raw editor with guidelines */}
                    <div>
                      {(() => {
                        const parsedList = parseQuestions(hostQuestionsRaw);
                        const pgCount = parsedList.filter((q) => q.t === 'PG').length;
                        const cbCount = parsedList.filter((q) => q.t === 'CB').length;
                        const bsCount = parsedList.filter((q) => q.t === 'BS').length;
                        const skCount = parsedList.filter((q) => q.t === 'SK').length;
                        const esCount = parsedList.filter((q) => q.t === 'ES').length;

                        return (
                          <div className="space-y-2 mb-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <label className="text-xs font-bold text-[#666072] uppercase tracking-wider">
                                Editor Bank Soal ({parsedList.length} Soal Terdeteksi)
                              </label>

                              {/* Question Type Breakdown */}
                              <div className="flex flex-wrap gap-1 text-[10px] font-bold">
                                <span className="px-2 py-0.5 bg-[#fee2e2] text-[#b91c1c] rounded-md">PG: {pgCount}</span>
                                <span className="px-2 py-0.5 bg-[#dbeafe] text-[#1d4ed8] rounded-md">CB: {cbCount}</span>
                                <span className="px-2 py-0.5 bg-[#fef3c7] text-[#b45309] rounded-md">BS: {bsCount}</span>
                                <span className="px-2 py-0.5 bg-[#d1fae5] text-[#047857] rounded-md">SK: {skCount}</span>
                                <span className="px-2 py-0.5 bg-[#ede9fe] text-[#6d28d9] rounded-md">ES: {esCount}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Format Legend */}
                      <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#ece7dc] text-[11px] text-[#554f60] leading-relaxed mb-2">
                        <b>Format Format Soal (Pemisah tanda |):</b><br />
                        • <b>PG</b> | Soal | Pilihan A | Pilihan B | Pilihan C | Pilihan D | No Benar (1-4) | Bobot<br />
                        • <b>CB</b> | Soal | Pilihan A | Pilihan B | Pilihan C | Pilihan D | Kunci Centang (mis. 1,2) | Bobot<br />
                        • <b>BS</b> | Pernyataan S-P-O-K | B atau S | Bobot<br />
                        • <b>SK</b> | Soal | Kalimat Target S-P-O-K | Bobot<br />
                        • <b>ES</b> | Soal Isian Singkat | kata kunci1; kata kunci2 | Bobot
                      </div>

                      <textarea
                        value={hostQuestionsRaw}
                        onChange={(e) => setHostQuestionsRaw(e.target.value)}
                        rows={9}
                        className="w-full p-3 bg-white border border-[#e2dccd] rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#7c5cc4]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-[#7c5cc4] text-white font-black text-sm rounded-2xl shadow-[0_4px_0_#5a3fa0] hover:bg-[#6c4eb4] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-5 h-5" />
                      <span>Buat Room & Masuk ke Lobby</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Player Join Form */}
              {activeAction === 'join' && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ece7dc] shadow-md max-w-xl mx-auto space-y-6 animate-pop-in">
                  <div className="flex items-center justify-between pb-4 border-b border-[#f0ede6]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#e4dbf7] text-[#5b4b8a] flex items-center justify-center font-bold text-xl">
                        🎒
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-[#23212b]">
                          Gabung Sebagai Peserta Kuis
                        </h2>
                        <p className="text-xs text-[#8a8594]">
                          Masukkan kode room dari guru dan pilih avatarmu
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveAction(null)}
                      className="text-xs font-bold text-[#8a8594] hover:text-[#23212b] p-1.5 cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>

                  <form onSubmit={handleJoinRoom} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#666072] uppercase tracking-wider mb-1">
                          Kode Room
                        </label>
                        <input
                          type="text"
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                          placeholder="mis. SPOK1"
                          maxLength={8}
                          className="w-full p-3 bg-white border border-[#e2dccd] rounded-xl text-sm font-black tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-[#7c5cc4]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#666072] uppercase tracking-wider mb-1">
                          Password Room
                        </label>
                        <input
                          type="text"
                          value={joinPass}
                          onChange={(e) => setJoinPass(e.target.value)}
                          placeholder="Password dari host"
                          className="w-full p-3 bg-white border border-[#e2dccd] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#7c5cc4]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#666072] uppercase tracking-wider mb-1">
                        Nama Peserta (Maks. 14 Karakter)
                      </label>
                      <input
                        type="text"
                        value={joinName}
                        onChange={(e) => setJoinName(e.target.value)}
                        placeholder="Ketik namamu..."
                        maxLength={14}
                        className="w-full p-3 bg-white border border-[#e2dccd] rounded-xl text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-[#7c5cc4]"
                        required
                      />
                    </div>

                    {/* Avatar Selection Picker */}
                    <AvatarPicker
                      selectedAvatar={selectedAvatar}
                      selectedColor={selectedColor}
                      onSelectAvatar={setSelectedAvatar}
                      onSelectColor={setSelectedColor}
                    />

                    <button
                      type="submit"
                      className="w-full py-4 bg-[#7c5cc4] text-white font-black text-sm rounded-2xl shadow-[0_4px_0_#5a3fa0] hover:bg-[#6c4eb4] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Users className="w-5 h-5" />
                      <span>Masuk ke Room Kuis</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: HOST VIEW */}
        {view === 'host' && currentRoom && (
          <HostView
            room={currentRoom}
            players={roomPlayers}
            onExit={handleExitRoom}
          />
        )}

        {/* VIEW 3: PLAYER VIEW */}
        {view === 'player' && currentRoom && currentPlayer && (
          <PlayerView
            room={currentRoom}
            player={currentPlayer}
            onExit={handleExitRoom}
          />
        )}

        {/* VIEW 4: SOLO PRACTICE */}
        {view === 'practice' && (
          <SoloPracticeView
            onBackToHome={() => setView('home')}
            onOpenTheory={() => setView('theory')}
          />
        )}

        {/* VIEW 5: THEORY PEDOMAN */}
        {view === 'theory' && (
          <SpokTheoryModal
            onClose={() => setView('home')}
            onGoToPractice={() => setView('practice')}
            onGoToAnalyzer={() => setView('analyzer')}
          />
        )}

        {/* VIEW 6: INTERACTIVE SENTENCE ANALYZER */}
        {view === 'analyzer' && (
          <SpokAnalyzer onBack={() => setView('home')} />
        )}
      </main>

      {/* Clean Unboxed Footer with Typographic Separators */}
      <footer className="border-t border-[#e9e4d8] py-8 px-6 mt-12 bg-white/70">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-[#8a8594]">
          {/* Ujung Kiri Bawah: Copyright & Institusi */}
          <div className="space-y-1 text-left">
            <div className="font-extrabold text-[#23212b] text-sm tracking-wide">
              © {new Date().getFullYear()} MUHAMAD SYAIFUL BAKRI
            </div>
            <div className="text-xs font-bold text-[#7c5cc4] tracking-wider uppercase">
              UNIVERSITAS PENDIDIKAN INDONESIA
            </div>
            <div className="text-[11px] text-[#8a8594] flex items-center gap-1.5 pt-0.5">
              <span>Kuis Susun Kata S-P-O-K</span>
              <span aria-hidden="true">·</span>
              <span>Media Pembelajaran Bahasa Indonesia</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button
              onClick={() => { playPopSound(); setView('theory'); }}
              className="hover:text-[#7c5cc4] transition-colors cursor-pointer font-medium"
            >
              Pedoman SPOK
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => { playPopSound(); setView('analyzer'); }}
              className="hover:text-[#7c5cc4] transition-colors cursor-pointer font-medium"
            >
              Bedah Kalimat
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => { playPopSound(); setView('practice'); }}
              className="hover:text-[#7c5cc4] transition-colors cursor-pointer font-medium"
            >
              Latihan Mandiri
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
