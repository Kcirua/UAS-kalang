// src/game/gameConstants.js

export const DEBUG_DRAW_COLLISION = true;

// Ukuran viewport canvas (jendela game yang terlihat)
export const VIEWPORT_WIDTH = 760; //
export const VIEWPORT_HEIGHT = 500; //

// Karakter akan coba diposisikan di tengah viewport
export const CHARACTER_VIEWPORT_OFFSET_X = VIEWPORT_WIDTH / 2; //
export const CHARACTER_VIEWPORT_OFFSET_Y = VIEWPORT_HEIGHT / 2; //

// Ukuran karakter untuk ditampilkan di canvas
export const CHAR_DISPLAY_WIDTH = 64; //
export const CHAR_DISPLAY_HEIGHT = 64; //

// Kecepatan gerak karakter (piksel per pembaruan)
export const CHARACTER_STEP_SIZE = 1; //

// Konfigurasi default untuk sprite karakter (blue_mushroom_walk.png)
// Asumsi: Baris 0 untuk jalan/hadap kanan, Baris 1 untuk jalan/hadap kiri
export const DEFAULT_SPRITE_CONFIG = {
  numFrames: 4,        // Jumlah frame animasi jalan
  frameWidth: 64,      // Lebar satu frame di spritesheet
  frameHeight: 64,     // Tinggi satu frame di spritesheet
  animationSpeedMs: 100, // Kecepatan animasi dalam milidetik per frame
  // rowIndex akan ditentukan secara dinamis di useCharacter atau GameCanvas berdasarkan facingDirection
}; //

// Konfigurasi untuk sprite tidur
export const SLEEP_SPRITE_CONFIG = {
  numFrames: 6, // Jumlah frame animasi tidur
  frameWidth: 64, // Lebar frame
  frameHeight: 64, // Tinggi frame
  animationSpeedMs: 500, // Kecepatan animasi tidur
  rowIndex: 2, // Baris pada sprite sheet untuk animasi tidur (0-indexed, sesuaikan dengan aset Anda)
}; //

// BARU: Konfigurasi untuk sprite idle
// Sesuaikan rowIndex dan numFrames dengan aset idle Anda
export const IDLE_SPRITE_CONFIG = {
  numFrames: 6, // Contoh: 4 frame untuk animasi idle
  frameWidth: 64,
  frameHeight: 64,
  animationSpeedMs: 300, // Kecepatan animasi idle (mungkin sedikit lebih lambat dari jalan)
  rowIndex: 3, // Contoh: Baris ke-2 (0-indexed) pada sprite sheet untuk animasi idle
};

export const MAKAN_SPRITE_CONFIG = {
  numFrames: 12, // Example: 6 frames for eating animation
  frameWidth: 64,
  frameHeight: 64,
  animationSpeedMs: 200, // Animation speed for eating
  rowIndex: 1, // ASSUMPTION: The eating animation is on the 10th row (index 9)
};

export const BATH_SPRITE_CONFIG = {
  numFrames: 6, // Asumsi 8 frame untuk animasi mandi
  frameWidth: 64,
  frameHeight: 64,
  animationSpeedMs: 250, // Kecepatan animasi mandi
  rowIndex: 0, // Asumsi: Animasi mandi ada di baris ke-9 (indeks 8)
};

export const MINIMAP_WIDTH = 150; //
export const MINIMAP_HEIGHT = 100; //
export const MINIMAP_CHARACTER_DOT_SIZE = 5; //
export const MINIMAP_VIEWPORT_BORDER_COLOR = 'rgba(255, 255, 255, 0.7)'; //
export const MINIMAP_CHARACTER_DOT_COLOR = 'red'; //