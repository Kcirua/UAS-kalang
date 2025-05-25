// src/game/collisionUtils.js
import { getCollisionTileValue } from './collisionData'; // [cite: 39]

/**
 * Memeriksa jenis tile pertama yang signifikan (pintu, rawa, atau solid)
 * yang tumpang tindih dengan bounding box karakter pada peta yang aktif.
 * SEKARANG: Memberi prioritas pada solid (1) untuk pemblokiran gerakan,
 * kemudian pintu (2) atau rawa (3) jika tidak ada solid.
 *
 * @param {number} worldX - Posisi X kiri atas karakter.
 * @param {number} worldY - Posisi Y kiri atas karakter.
 * @param {number} charWidth - Lebar bounding box kolisi karakter.
 * @param {number} charHeight - Tinggi bounding box kolisi karakter.
 * @param {object} currentCollisionMapConfig - Konfigurasi peta kolisi aktif (dari collisionMapsData).
 * @returns {number} Jenis tile (1 untuk solid, 2 untuk pintu, 3 untuk rawa, 0 untuk bisa dilewati).
 */
export function getOverlappingTileType(worldX, worldY, charWidth, charHeight, currentCollisionMapConfig) {
  if (!currentCollisionMapConfig) return 0; // [cite: 47]

  const { tileWidth, tileHeight } = currentCollisionMapConfig; // [cite: 48]
  const startCol = Math.floor(worldX / tileWidth); // [cite: 48]
  const endCol = Math.floor((worldX + charWidth - 1) / tileWidth); // [cite: 48]
  const startRow = Math.floor(worldY / tileHeight); // [cite: 49]
  const endRow = Math.floor((worldY + charHeight - 1) / tileHeight); // [cite: 49]

  let isOverlappingSolid = false; // [cite: 50]
  let isOverlappingDoor = false; // [cite: 50]
  let isOverlappingSwamp = false; // Variabel baru untuk tile rawa

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const tileType = getCollisionTileValue(c, r, currentCollisionMapConfig); // [cite: 51]
      if (tileType === 1) {
        isOverlappingSolid = true; // [cite: 52]
      } else if (tileType === 2) {
        isOverlappingDoor = true; // [cite: 53]
      } else if (tileType === 3) { // Cek untuk tile rawa
        isOverlappingSwamp = true;
      }
    }
  }

  // Logika Prioritas BARU:
  // 1. Jika ada tile solid (1) yang tumpang tindih, area dianggap solid.
  // 2. Jika tidak ada tile solid, tetapi ada tile pintu (2), area dianggap pintu.
  // 3. Jika tidak ada solid atau pintu, tetapi ada tile rawa (3), area dianggap rawa.
  // 4. Jika tidak ketiganya, area bisa dilewati (0).

  if (isOverlappingSolid) {
    return 1; // [cite: 56]
  }
  if (isOverlappingDoor) {
    return 2; // [cite: 57]
  }
  if (isOverlappingSwamp) {
    return 3; // Tile rawa terdeteksi
  }
  return 0; // [cite: 58]
}

/**
 * Memeriksa apakah bounding box karakter tumpang tindih dengan tile solid (tipe 1) pada peta aktif.
 * Fungsi ini sekarang menggunakan getOverlappingTileType yang telah dimodifikasi.
 * @param {number} worldX - Posisi X kiri atas karakter.
 * @param {number} worldY - Posisi Y kiri atas karakter.
 * @param {number} charWidth - Lebar bounding box kolisi karakter.
 * @param {number} charHeight - Tinggi bounding box kolisi karakter.
 * @param {object} currentCollisionMapConfig - Konfigurasi peta kolisi aktif.
 * @returns {boolean} True jika terjadi kolisi dengan tile solid, false jika tidak.
 */
export function isOverlappingSolidTile(worldX, worldY, charWidth, charHeight, currentCollisionMapConfig) {
  return getOverlappingTileType(worldX, worldY, charWidth, charHeight, currentCollisionMapConfig) === 1; // [cite: 65]
}