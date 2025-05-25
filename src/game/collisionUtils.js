// src/game/collisionUtils.js
import { getCollisionTileValue } from './collisionData'; // Pastikan ini mengarah ke fungsi yang benar

/**
 * Memeriksa jenis tile pertama yang signifikan (pintu atau solid) 
 * yang tumpang tindih dengan bounding box karakter pada peta yang aktif.
 * SEKARANG: Memberi prioritas pada solid (1) untuk pemblokiran gerakan, 
 * kemudian pintu (2) jika tidak ada solid.
 *
 * @param {number} worldX - Posisi X kiri atas karakter.
 * @param {number} worldY - Posisi Y kiri atas karakter.
 * @param {number} charWidth - Lebar bounding box kolisi karakter.
 * @param {number} charHeight - Tinggi bounding box kolisi karakter.
 * @param {object} currentCollisionMapConfig - Konfigurasi peta kolisi aktif (dari collisionMapsData).
 * @returns {number} Jenis tile (1 untuk solid, 2 untuk pintu jika tidak ada solid, 0 untuk bisa dilewati).
 */
export function getOverlappingTileType(worldX, worldY, charWidth, charHeight, currentCollisionMapConfig) {
  if (!currentCollisionMapConfig) return 0; // Tidak ada peta, anggap bisa dilewati

  const { tileWidth, tileHeight } = currentCollisionMapConfig;

  const startCol = Math.floor(worldX / tileWidth);
  const endCol = Math.floor((worldX + charWidth - 1) / tileWidth);
  const startRow = Math.floor(worldY / tileHeight);
  const endRow = Math.floor((worldY + charHeight - 1) / tileHeight);

  let isOverlappingSolid = false;
  let isOverlappingDoor = false;

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const tileType = getCollisionTileValue(c, r, currentCollisionMapConfig); // Menggunakan fungsi dan config baru
      if (tileType === 1) {
        isOverlappingSolid = true; // Tandai jika tile solid ditemukan
      } else if (tileType === 2) {
        isOverlappingDoor = true; // Tandai jika tile pintu ditemukan
      }
    }
  }

  // Logika Prioritas BARU:
  // 1. Jika ada tile solid (1) yang tumpang tindih, area dianggap solid untuk memblokir gerakan.
  // 2. Jika tidak ada tile solid, tetapi ada tile pintu (2), area dianggap pintu (untuk interaksi & gerakan).
  // 3. Jika tidak keduanya, area bisa dilewati (0).

  if (isOverlappingSolid) {
    return 1; // Ditemukan tile solid, ini memblokir gerakan.
  }
  if (isOverlappingDoor) {
    return 2; // Tidak ada tile solid, tapi ada pintu.
  }
  return 0; // Hanya tile yang bisa dilewati atau di luar batas.
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
  return getOverlappingTileType(worldX, worldY, charWidth, charHeight, currentCollisionMapConfig) === 1;
}