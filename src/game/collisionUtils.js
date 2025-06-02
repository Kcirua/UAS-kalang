// src/game/collisionUtils.js
import { getCollisionTileValue } from './collisionData'; //

/**
 * Memeriksa jenis tile pertama yang signifikan (pintu, rawa, gua, solid, atau minigame)
 * yang tumpang tindih dengan bounding box karakter pada peta yang aktif.
 * Prioritas: solid (1), lalu pintu (2), lalu rawa (3), lalu gua (4), lalu tempat tidur (99), lalu minigame (50).
 *
 * @param {number} worldX - Posisi X kiri atas karakter.
 * @param {number} worldY - Posisi Y kiri atas karakter.
 * @param {number} charWidth - Lebar bounding box kolisi karakter.
 * @param {number} charHeight - Tinggi bounding box kolisi karakter.
 * @param {object} currentCollisionMapConfig - Konfigurasi peta kolisi aktif.
 * @returns {number} Jenis tile (1 solid, 2 pintu, 3 rawa, 4 gua, 99 tempat tidur, 50 minigame, 0 bisa dilewati).
 */
export function getOverlappingTileType(worldX, worldY, charWidth, charHeight, currentCollisionMapConfig) {
  
  if (!currentCollisionMapConfig) return 0; //

  const { tileWidth, tileHeight } = currentCollisionMapConfig; //
  const startCol = Math.floor(worldX / tileWidth); //
  const endCol = Math.floor((worldX + charWidth - 1) / tileWidth); //
  const startRow = Math.floor(worldY / tileHeight); //
  const endRow = Math.floor((worldY + charHeight - 1) / tileHeight); //

  let isOverlappingSolid = false; //
  let isOverlappingDoor = false; //
  let isOverlappingSwamp = false; //
  let isOverlappingCave = false; //
  let isOverlappingBed = false; // BARU: untuk tile tempat tidur
  let isOverlappingMinigame1 = false; // BARU: untuk tile minigame

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const tileType = getCollisionTileValue(c, r, currentCollisionMapConfig); //
      if (tileType === 1) { //
        isOverlappingSolid = true; //
      } else if (tileType === 2) { //
        isOverlappingDoor = true; //
      } else if (tileType === 3) { //
        isOverlappingSwamp = true; //
      } else if (tileType === 4) { //
        isOverlappingCave = true; //
      } else if (tileType === 99) { // BARU: Cek untuk tile tempat tidur
        isOverlappingBed = true; //
      } else if (tileType === 50) { // BARU: Cek untuk tile minigame
        isOverlappingMinigame1 = true;
      }
    }
  }

  // Logika Prioritas:
  if (isOverlappingSolid) { // Solid memiliki prioritas tertinggi //
    return 1; //
  }
  // Kemudian tile interaktif lainnya
  if (isOverlappingDoor) { //
    return 2; //
  }
  if (isOverlappingSwamp) { //
    return 3; //
  }
  if (isOverlappingCave) { //
    return 4; //
  }
  if (isOverlappingBed) { // BARU: Tambahkan tempat tidur //
    return 99;
  }
  if (isOverlappingMinigame1) { // BARU: Tambahkan minigame
    return 50;
  }
  return 0; //
}


/**
 * Memeriksa apakah bounding box karakter tumpang tindih dengan tile solid (tipe 1).
 * @param {number} worldX - Posisi X kiri atas karakter.
 * @param {number} worldY - Posisi Y kiri atas karakter.
 * @param {number} charWidth - Lebar bounding box kolisi karakter.
 * @param {number} charHeight - Tinggi bounding box kolisi karakter.
 * @param {object} currentCollisionMapConfig - Konfigurasi peta kolisi aktif.
 * @returns {boolean} True jika kolisi dengan solid, false jika tidak.
 */
export function isOverlappingSolidTile(worldX, worldY, charWidth, charHeight, currentCollisionMapConfig) {
  return getOverlappingTileType(worldX, worldY, charWidth, charHeight, currentCollisionMapConfig) === 1; //
}