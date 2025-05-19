// src/game/collisionUtils.js
import { COLLISION_TILE_WIDTH, COLLISION_TILE_HEIGHT, getCollisionTile } from './collisionData';

/**
 * Memeriksa apakah bounding box karakter pada posisi dunia (worldX, worldY)
 * tumpang tindih dengan tile solid mana pun di collisionGrid.
 *
 * @param {number} worldX - Posisi X kiri atas karakter (koordinat dunia).
 * @param {number} worldY - Posisi Y kiri atas karakter (koordinat dunia).
 * @param {number} charWidth - Lebar bounding box kolisi karakter.
 * @param {number} charHeight - Tinggi bounding box kolisi karakter.
 * @returns {boolean} True jika terjadi kolisi, false jika tidak.
 */
export function isOverlappingSolidTile(worldX, worldY, charWidth, charHeight) {
  // Hitung tile grid mana saja yang disentuh oleh bounding box karakter
  const startCol = Math.floor(worldX / COLLISION_TILE_WIDTH);
  const endCol = Math.floor((worldX + charWidth - 1) / COLLISION_TILE_WIDTH); // -1 agar tepat di tepi
  const startRow = Math.floor(worldY / COLLISION_TILE_HEIGHT);
  const endRow = Math.floor((worldY + charHeight - 1) / COLLISION_TILE_HEIGHT); // -1 agar tepat di tepi

  // Periksa setiap tile dalam rentang ini
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      if (getCollisionTile(c, r) === 1) { // 1 berarti solid
        return true; // Terjadi kolisi dengan tile solid
      }
    }
  }
  return false; // Tidak ada kolisi
}