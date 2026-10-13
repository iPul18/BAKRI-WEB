import React, { useState } from 'react';
import { AVATAR_CATEGORIES, COLOR_PALETTE, RenderAvatar } from '../utils/avatars';
import { playPopSound } from '../utils/audio';

interface AvatarPickerProps {
  selectedAvatar: string;
  selectedColor: string;
  onSelectAvatar: (av: string) => void;
  onSelectColor: (col: string) => void;
}

export function AvatarPicker({
  selectedAvatar,
  selectedColor,
  onSelectAvatar,
  onSelectColor
}: AvatarPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Hewan Lucu');

  return (
    <div className="space-y-4">
      {/* Current Preview */}
      <div className="flex items-center gap-3 p-3.5 bg-[#faf8f3] rounded-2xl border border-[#e9e4d8]">
        <RenderAvatar
          avatar={selectedAvatar}
          color={selectedColor}
          size="lg"
          className="ring-4 ring-white shadow-md"
        />
        <div>
          <div className="text-xs font-bold text-[#6b6676]">Avatar & Warna Terpilih</div>
          <div className="text-sm font-extrabold text-[#23212b]">
            Siap untuk bertanding di SPOK Quest!
          </div>
          <div className="text-[11px] text-[#8a8594] mt-0.5">
            Pilih ikon dan warna favoritmu di bawah ini
          </div>
        </div>
      </div>

      {/* Category selector */}
      <div>
        <label className="block text-xs font-bold text-[#6b6676] mb-1.5 uppercase tracking-wider">
          Kategori Avatar
        </label>
        <div className="flex flex-wrap gap-1.5 p-1 bg-[#f3ede1] rounded-xl">
          {Object.keys(AVATAR_CATEGORIES).map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  playPopSound();
                  setActiveCategory(cat);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#7c5cc4] shadow-xs scale-102'
                    : 'text-[#6b6676] hover:text-[#23212b]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Avatar Grid */}
      <div className="p-3 bg-white rounded-2xl border border-[#e9e4d8] max-h-48 overflow-y-auto">
        <div className="grid grid-cols-6 sm:grid-cols-7 gap-2">
          {AVATAR_CATEGORIES[activeCategory]?.map((av) => {
            const isSelected = av === selectedAvatar;
            return (
              <button
                key={av}
                type="button"
                onClick={() => {
                  playPopSound();
                  onSelectAvatar(av);
                }}
                className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#7c5cc4] bg-[#efeafa] scale-110 shadow-sm ring-2 ring-[#7c5cc4]/30'
                    : 'border-transparent hover:border-[#e2dccd] hover:bg-[#faf8f3]'
                }`}
              >
                <RenderAvatar avatar={av} size="md" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Palette */}
      <div>
        <label className="block text-xs font-bold text-[#6b6676] mb-1.5 uppercase tracking-wider">
          Warna Tema Avatar
        </label>
        <div className="flex items-center gap-2 p-2.5 bg-white rounded-2xl border border-[#e9e4d8] overflow-x-auto">
          {COLOR_PALETTE.map((col) => {
            const isSelected = col === selectedColor;
            return (
              <button
                key={col}
                type="button"
                onClick={() => {
                  playPopSound();
                  onSelectColor(col);
                }}
                className={`w-8 h-8 rounded-full cursor-pointer transition-transform shrink-0 ${
                  isSelected
                    ? 'scale-120 ring-3 ring-[#23212b] shadow-md'
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: col }}
                aria-label={`Warna ${col}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
