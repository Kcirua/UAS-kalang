// src/game/gameConstants.js

export const DEBUG_DRAW_COLLISION = true; 

// Ukuran viewport canvas (jendela game yang terlihat)
export const VIEWPORT_WIDTH = 760;
export const VIEWPORT_HEIGHT = 500;

// Karakter akan coba diposisikan di tengah viewport
export const CHARACTER_VIEWPORT_OFFSET_X = VIEWPORT_WIDTH / 2;
export const CHARACTER_VIEWPORT_OFFSET_Y = VIEWPORT_HEIGHT / 2;

// Ukuran karakter untuk ditampilkan di canvas
export const CHAR_DISPLAY_WIDTH = 64;
export const CHAR_DISPLAY_HEIGHT = 64;

// Kecepatan gerak karakter (piksel per pembaruan)
export const CHARACTER_STEP_SIZE = 2; // Kecepatan dari kode asli Anda [cite: 70, 71]

// Konfigurasi default untuk sprite karakter (blue_mushroom_walk.png)
export const DEFAULT_SPRITE_CONFIG = {
  numFrames: 6,        // Jumlah frame animasi
  frameWidth: 64,      // Lebar satu frame di spritesheet
  frameHeight: 64,     // Tinggi satu frame di spritesheet
  animationSpeedMs: 150 // Kecepatan animasi dalam milidetik per frame
};