import React from 'react';

export const AVATAR_CATEGORIES: Record<string, string[]> = {
  'Hewan Lucu': ['🐱', '🐶', '🐰', '🐼', '🦊', '🐨', '🐸', '🐧', '🦄', '🐥', '🐻', '🐹', '🐮', '🐷', '🦋', '🐢', '🐙', '🐬', '🦔'],
  'Robot & Teknologi': ['🤖', '👾', '🦾', '🛸', '📟', '🔧', '🎛️'],
  'Kendaraan & Balap': ['🏎️', '🚗', '🚙', '🚓', '🚘', '🏁', '🔥'],
  'Pahlawan Orisinal': ['sh:0', 'sh:1', 'sh:2', 'sh:3', 'sh:4', 'sh:5', 'sh:6', 'sh:7'],
  'Fiksi & Fantasi': ['🧙', '🧚', '🧛', '🐉', '👽', '🧞', '🏴‍☠️', '🥷']
};

export const COLOR_PALETTE = [
  '#e74c3c', // Merah Koral
  '#3498db', // Biru Samudra
  '#f1c40f', // Kuning Emas
  '#2ecc71', // Hijau Zamrud
  '#9b59b6', // Ungu Royal
  '#ff8fab', // Merah Muda
  '#1abc9c', // Toska Segar
  '#ff9f43'  // Jingga Terang
];

const HERO_VARIANTS: [string, string, string][] = [
  ['#2b6cde', '#e63946', 'star'],
  ['#1d3a6e', '', 'shield'],
  ['#f4c430', '#5b3fa8', 'bolt'],
  ['#1abc9c', '', 'circ'],
  ['#2d2d3a', '#7a2fbf', 'moon'],
  ['#c0392b', '#f1c40f', 'crown'],
  ['#ff8c42', '#2b6cde', 'heart'],
  ['#e63946', '', 'bolt']
];

export function HeroSvg({ index, className = 'w-8 h-8' }: { index: number; className?: string }) {
  const safeIndex = Math.max(0, Math.min(HERO_VARIANTS.length - 1, index));
  const [suit, cape, emblem] = HERO_VARIANTS[safeIndex];

  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {cape && <path d="M20 30L11 60h42L44 30z" fill={cape} />}
      <rect x="13" y="31" width="8" height="18" rx="4" fill={suit} />
      <rect x="43" y="31" width="8" height="18" rx="4" fill={suit} />
      <rect x="20" y="30" width="24" height="28" rx="8" fill={suit} />
      <circle cx="32" cy="20" r="12" fill="#ffd7b5" />
      <path d="M20 19A12 12 0 0 1 44 19Q32 10 20 19z" fill={suit} />
      <rect x="20" y="17" width="24" height="7" rx="3.5" fill={cape || '#25232b'} />
      <ellipse cx="27" cy="20.5" rx="3" ry="1.8" fill="#fff" />
      <ellipse cx="37" cy="20.5" rx="3" ry="1.8" fill="#fff" />
      <path d="M28 27q4 3 8 0" stroke="#b5651d" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      
      {emblem === 'star' && (
        <path d="M32 36l2.5 5h5.5l-4.4 3.4 1.7 5.3-5.3-3.3-5.3 3.3 1.7-5.3L24 41h5.5z" fill="#fff" />
      )}
      {emblem === 'shield' && (
        <g>
          <circle cx="32" cy="43" r="6" fill="none" stroke="#fff" strokeWidth="2" />
          <circle cx="32" cy="43" r="2" fill="#fff" />
        </g>
      )}
      {emblem === 'bolt' && (
        <path d="M34 35L28 44h4l-2 7 8-10h-4z" fill="#fff" />
      )}
      {emblem === 'circ' && (
        <circle cx="32" cy="43" r="5" fill="#fff" />
      )}
      {emblem === 'moon' && (
        <path d="M35 36a7 7 0 1 0 0 12 5.5 5.5 0 0 1 0-12z" fill="#fff" />
      )}
      {emblem === 'crown' && (
        <path d="M26 47l2-9 4 5 4-5 2 9z" fill="#fff" />
      )}
      {emblem === 'heart' && (
        <path d="M32 49l-6-7a3.5 3.5 0 0 1 6-3 3.5 3.5 0 0 1 6 3z" fill="#fff" />
      )}
    </svg>
  );
}

export function RenderAvatar({
  avatar,
  color,
  size = 'md',
  className = ''
}: {
  avatar: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeMap = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-11 h-11 text-2xl',
    lg: 'w-14 h-14 text-3xl',
    xl: 'w-20 h-20 text-5xl'
  };

  const svgSizeMap = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
    xl: 'w-14 h-14'
  };

  const isHero = String(avatar).startsWith('sh:');
  const heroIndex = isHero ? parseInt(avatar.slice(3), 10) : 0;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full shrink-0 shadow-sm border border-black/5 transition-transform ${sizeMap[size]} ${className}`}
      style={{ backgroundColor: color || '#f1eeea' }}
    >
      {isHero ? (
        <HeroSvg index={heroIndex} className={svgSizeMap[size]} />
      ) : (
        <span className="select-none leading-none">{avatar || '🙂'}</span>
      )}
    </div>
  );
}
