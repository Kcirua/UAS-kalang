// src/game/collisionUtils.js
import { COLLISION_TILE_WIDTH, COLLISION_TILE_HEIGHT, getCollisionTile } from './collisionData';

/**
 * Memeriksa jenis tile pertama yang signifikan (pintu atau solid) 
 * yang tumpang tindih dengan bounding box karakter.
 * Memberi prioritas pada pintu (2), kemudian solid (1).
 *
 * @param {number} worldX - Posisi X kiri atas karakter. [cite: 37]
 * @param {number} worldY - Posisi Y kiri atas karakter. [cite: 38]
 * @param {number} charWidth - Lebar bounding box kolisi karakter. [cite: 39]
 * @param {number} charHeight - Tinggi bounding box kolisi karakter. [cite: 40]
 * @returns {number} Jenis tile (2 untuk pintu, 1 untuk solid, 0 untuk bisa dilewati).
 */
export function getOverlappingTileType(worldX, worldY, charWidth, charHeight) {
  const startCol = Math.floor(worldX / COLLISION_TILE_WIDTH); // [cite: 42]
  const endCol = Math.floor((worldX + charWidth - 1) / COLLISION_TILE_WIDTH); // [cite: 42]
  const startRow = Math.floor(worldY / COLLISION_TILE_HEIGHT); // [cite: 43]
  const endRow = Math.floor((worldY + charHeight - 1) / COLLISION_TILE_HEIGHT); // [cite: 44]

  let foundSolidTile = false;

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const tileType = getCollisionTile(c, r);
      if (tileType === 2) {
        return 2; // Pintu ditemukan, prioritas tertinggi
      }
      if (tileType === 1) {
        foundSolidTile = true; // Tandai jika tile solid ditemukan
      }
    }
  }

  if (foundSolidTile) {
    return 1; // Tidak ada pintu, tapi ada tile solid
  }

  return 0; // Hanya tile yang bisa dilewati atau di luar batas
}

/**
 * Memeriksa apakah bounding box karakter tumpang tindih dengan tile solid (tipe 1).
 * Fungsi ini sekarang menggunakan getOverlappingTileType.
 * @param {number} worldX - Posisi X kiri atas karakter.
 * @param {number} worldY - Posisi Y kiri atas karakter.
 * @param {number} charWidth - Lebar bounding box kolisi karakter.
 * @param {number} charHeight - Tinggi bounding box kolisi karakter.
 * @returns {boolean} True jika terjadi kolisi dengan tile solid, false jika tidak. [cite: 40]
 */
export function isOverlappingSolidTile(worldX, worldY, charWidth, charHeight) {
  return getOverlappingTileType(worldX, worldY, charWidth, charHeight) === 1;
}