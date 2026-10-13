import { Player, Room, Question } from '../types';
import { checkAnswer } from './spokParser';

const CHANNEL_NAME = 'spok_quest_bus_v1';

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch {
    broadcastChannel = null;
  }
}

export function getRoom(code: string): Room | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`spok_room_${code.toUpperCase()}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveRoom(room: Room): void {
  if (typeof window === 'undefined') return;
  const upper = room.code.toUpperCase();
  try {
    localStorage.setItem(`spok_room_${upper}`, JSON.stringify(room));
    broadcastChannel?.postMessage({ type: 'ROOM_UPDATE', code: upper, room });
  } catch (err) {
    console.error('Failed to save room', err);
  }
}

export function getPlayers(code: string): Player[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`spok_players_${code.toUpperCase()}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePlayers(code: string, players: Player[]): void {
  if (typeof window === 'undefined') return;
  const upper = code.toUpperCase();
  try {
    localStorage.setItem(`spok_players_${upper}`, JSON.stringify(players));
    broadcastChannel?.postMessage({ type: 'PLAYERS_UPDATE', code: upper, players });
  } catch (err) {
    console.error('Failed to save players', err);
  }
}

export function addPlayer(code: string, newPlayer: Player): void {
  const current = getPlayers(code);
  const existingIdx = current.findIndex((p) => p.id === newPlayer.id);
  let updated: Player[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...updated[existingIdx], ...newPlayer };
  } else {
    updated = [...current, newPlayer];
  }
  savePlayers(code, updated);
}

export function submitPlayerAnswer(
  code: string,
  playerId: string,
  qi: number,
  answer: any,
  q: Question,
  timeLimitSec: number,
  elapsedMs: number
): { ok: boolean; pts: number } {
  const players = getPlayers(code);
  const player = players.find((p) => p.id === playerId);
  if (!player) return { ok: false, pts: 0 };

  // If already answered for this question, ignore
  if (player.ans && player.ans.qi === qi) {
    return { ok: player.ans.ok, pts: player.ans.pts };
  }

  const ok = checkAnswer(q, answer);
  // Speed score formula: base 50% + up to 50% bonus for speed
  const maxMs = timeLimitSec * 1000;
  const clampedElapsed = Math.min(maxMs, Math.max(0, elapsedMs));
  const timeFactor = Math.max(0, 1 - clampedElapsed / maxMs);
  const pts = ok ? Math.round(q.w * (0.5 + 0.5 * timeFactor)) : 0;

  const newScore = (player.score || 0) + pts;
  const newStreak = ok ? (player.streak || 0) + 1 : 0;

  const updatedPlayers = players.map((p) => {
    if (p.id === playerId) {
      return {
        ...p,
        score: newScore,
        streak: newStreak,
        ans: {
          qi,
          ch: answer,
          ms: clampedElapsed,
          ok,
          pts
        }
      };
    }
    return p;
  });

  savePlayers(code, updatedPlayers);
  return { ok, pts };
}

// Bot Simulation for effortless host testing!
const BOT_NAMES = [
  { name: 'Budi Santoso', av: '🐱', col: '#3498db' },
  { name: 'Siti Rahma', av: '🐰', col: '#ff8fab' },
  { name: 'Ahmad Faiz', av: '🤖', col: '#2ecc71' },
  { name: 'Dewi Lestari', av: '🦊', col: '#ff9f43' },
  { name: 'Rizky Pratama', av: 'sh:0', col: '#e74c3c' },
  { name: 'Putri Ayu', av: '🦄', col: '#9b59b6' },
  { name: 'Bayu Nugroho', av: '🏎️', col: '#1abc9c' }
];

export function addBotClassmates(code: string, count = 4): void {
  const current = getPlayers(code);
  const newBots: Player[] = [];

  for (let i = 0; i < count; i++) {
    const template = BOT_NAMES[(current.length + i) % BOT_NAMES.length];
    const botId = `bot_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`;
    newBots.push({
      id: botId,
      name: `${template.name}`,
      av: template.av,
      col: template.col,
      score: 0,
      ans: null,
      isBot: true,
      streak: 0
    });
  }

  savePlayers(code, [...current, ...newBots]);
}

export function simulateBotAnswersForQuestion(room: Room): void {
  const players = getPlayers(room.code);
  const bots = players.filter((p) => p.isBot && (!p.ans || p.ans.qi !== room.qi));
  if (bots.length === 0) return;

  const currentQ = room.qs[room.qi];
  if (!currentQ) return;

  bots.forEach((bot, idx) => {
    // Generate realistic response time (between 1.5s and 80% of time limit)
    const delay = Math.min(
      room.T * 900,
      1500 + Math.random() * (room.T * 600) + idx * 400
    );

    setTimeout(() => {
      // Re-fetch room to ensure phase is still 'q'
      const freshRoom = getRoom(room.code);
      if (!freshRoom || freshRoom.phase !== 'q' || freshRoom.qi !== room.qi) return;

      // 80% accuracy
      const willBeCorrect = Math.random() < 0.82;
      let botAnswer: any;

      if (currentQ.t === 'PG') {
        botAnswer = willBeCorrect ? currentQ.c : (Number(currentQ.c) + 1) % 4;
      } else if (currentQ.t === 'BS') {
        botAnswer = willBeCorrect ? currentQ.c : (Number(currentQ.c) === 0 ? 1 : 0);
      } else if (currentQ.t === 'CB') {
        botAnswer = willBeCorrect ? currentQ.c : [0];
      } else if (currentQ.t === 'SK') {
        botAnswer = willBeCorrect ? currentQ.k[0] : currentQ.o.join(' ');
      } else if (currentQ.t === 'ES') {
        botAnswer = willBeCorrect ? currentQ.k[0] : 'tidak tahu';
      }

      submitPlayerAnswer(
        room.code,
        bot.id,
        room.qi,
        botAnswer,
        currentQ,
        room.T,
        delay
      );
    }, delay);
  });
}

export function subscribeToSync(
  code: string,
  onRoomChange: (r: Room | null) => void,
  onPlayersChange: (p: Player[]) => void
): () => void {
  const upper = code.toUpperCase();

  const handleMessage = (e: MessageEvent) => {
    if (!e.data || e.data.code !== upper) return;
    if (e.data.type === 'ROOM_UPDATE' && e.data.room) {
      onRoomChange(e.data.room);
    }
    if (e.data.type === 'PLAYERS_UPDATE' && e.data.players) {
      onPlayersChange(e.data.players);
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === `spok_room_${upper}`) {
      onRoomChange(getRoom(upper));
    }
    if (e.key === `spok_players_${upper}`) {
      onPlayersChange(getPlayers(upper));
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleMessage);
  }
  window.addEventListener('storage', handleStorage);

  // Initial read
  onRoomChange(getRoom(upper));
  onPlayersChange(getPlayers(upper));

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleMessage);
    }
    window.removeEventListener('storage', handleStorage);
  };
}
