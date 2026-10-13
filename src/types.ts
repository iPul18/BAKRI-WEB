export type QuestionType = 'PG' | 'CB' | 'BS' | 'SK' | 'ES';

export interface SpokBreakdown {
  s?: string;
  p?: string;
  o?: string;
  k?: string;
  pel?: string;
}

export interface Question {
  id: string;
  t: QuestionType;
  q: string;
  o: string[]; // Options or word bank
  c: number | number[]; // Correct index for PG/BS or array of indices for CB
  k: string[]; // Keywords for ES, or correct sentence string/words for SK
  w: number; // Max weight / points
  explanation?: string;
  breakdown?: SpokBreakdown;
}

export interface PlayerAnswer {
  qi: number;
  ch: any; // index, indices array, string sentence, essay text
  ms: number;
  ok: boolean;
  pts: number;
}

export interface Player {
  id: string;
  name: string;
  av: string;
  col: string;
  score: number;
  ans: PlayerAnswer | null;
  isBot?: boolean;
  streak?: number;
}

export type RoomPhase = 'lobby' | 'q' | 'r' | 'end';

export interface Room {
  code: string;
  hostId: string;
  pass: string;
  T: number; // seconds per question
  qs: Question[];
  phase: RoomPhase;
  qi: number;
  qStart: number;
  createdAt: number;
}

export type AppView = 'home' | 'host' | 'player' | 'practice' | 'theory' | 'analyzer';
