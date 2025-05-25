// src/game/collisionUtils.js
import { getCollisionTileValue } from './collisionData'; // [cite: 39]

/**
 * Memeriksa jenis tile pertama yang signifikan (pintu, rawa, gua, atau solid)
 * yang tumpang tindih dengan bounding box karakter pada peta yang aktif.
 * Prioritas: solid (1), lalu pintu (2), lalu rawa (3), lalu gua (4).
 *
 * @param {number} worldX - Posisi X kiri atas karakter. [cite: 41]
 * @param {number} worldY - Posisi Y kiri atas karakter. [cite: 42]
 * @param {number} charWidth - Lebar bounding box kolisi karakter. [cite: 43]
 * @param {number} charHeight - Tinggi bounding box kolisi karakter. [cite: 43]
 * @param {object} currentCollisionMapConfig - Konfigurasi peta kolisi aktif. [cite: 44]
 * @returns {number} Jenis tile (1 solid, 2 pintu, 3 rawa, 4 gua, 0 bisa dilewati). [cite: 45]
 */
export function getOverlappingTileType(worldX, worldY, charWidth, charHeight, currentCollisionMapConfig) {
  if (!currentCollisionMapConfig) return 0; // [cite: 46]

  const { tileWidth, tileHeight } = currentCollisionMapConfig; // [cite: 47]
  const startCol = Math.floor(worldX / tileWidth); // [cite: 48]
  const endCol = Math.floor((worldX + charWidth - 1) / tileWidth); // [cite: 48]
  const startRow = Math.floor(worldY / tileHeight); // [cite: 49]
  const endRow = Math.floor((worldY + charHeight - 1) / tileHeight); // [cite: 49]

  let isOverlappingSolid = false; // [cite: 49]
  let isOverlappingDoor = false; // [cite: 50]
  let isOverlappingSwamp = false;
  let isOverlappingCave = false; // Variabel baru untuk tile gua

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const tileType = getCollisionTileValue(c, r, currentCollisionMapConfig); // [cite: 50]
      if (tileType === 1) {
        isOverlappingSolid = true; // [cite: 51]
      } else if (tileType === 2) {
        isOverlappingDoor = true; // [cite: 52]
      } else if (tileType === 3) {
        isOverlappingSwamp = true;
      } else if (tileType === 4) { // Cek untuk tile gua
        isOverlappingCave = true;
      }
    }
  }

  // Logika Prioritas:
  if (isOverlappingSolid) {
    return 1; // [cite: 56]
  }
  if (isOverlappingDoor) {
    return 2; // [cite: 57]
  }
  if (isOverlappingSwamp) {
    return 3;
  }
  if (isOverlappingCave) {
    return 4; // Tile gua terdeteksi
  }
  return 0; // [cite: 58]
}

/**
 * Memeriksa apakah bounding box karakter tumpang tindih dengan tile solid (tipe 1).
 * @param {number} worldX - Posisi X kiri atas karakter. [cite: 61]
 * @param {number} worldY - Posisi Y kiri atas karakter. [cite: 61]
 * @param {number} charWidth - Lebar bounding box kolisi karakter. [cite: 62]
 * @param {number} charHeight - Tinggi bounding box kolisi karakter. [cite: 62]
 * @param {object} currentCollisionMapConfig - Konfigurasi peta kolisi aktif. [cite: 63]
 * @returns {boolean} True jika kolisi dengan solid, false jika tidak. [cite: 63]
 */
export function isOverlappingSolidTile(worldX, worldY, charWidth, charHeight, currentCollisionMapConfig) {
  return getOverlappingTileType(worldX, worldY, charWidth, charHeight, currentCollisionMapConfig) === 1; // [cite: 65]
}