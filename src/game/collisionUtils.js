// src/game/collisionUtils.js
import { getCollisionTileValue, ITEM_TYPES } from './collisionData'; // 

/**
 * Memeriksa jenis tile pertama yang signifikan
 * yang tumpang tindih dengan bounding box karakter pada peta yang aktif.
 * Prioritas: solid (1), lalu pintu (2), rawa (3), gua (4), tempat tidur (99), minigame (50), item (6).
 *
 * @param {number} worldX - Posisi X kiri atas karakter. 
 * @param {number} worldY - Posisi Y kiri atas karakter. 
 * @param {number} charWidth - Lebar bounding box kolisi karakter. 
 * @param {number} charHeight - Tinggi bounding box kolisi karakter. 
 * @param {object} currentCollisionMapConfig - Konfigurasi peta kolisi aktif. 
 * @returns {number} Jenis tile (1 solid, 2 pintu, 3 rawa, 4 gua, 99 tempat tidur, 50 minigame, 6 item, 0 bisa dilewati).
 */
export function getOverlappingTileType(worldX, worldY, charWidth, charHeight, currentCollisionMapConfig) {
  
  if (!currentCollisionMapConfig) return 0; // 

  const { tileWidth, tileHeight } = currentCollisionMapConfig; 
  const startCol = Math.floor(worldX / tileWidth); // 
  const endCol = Math.floor((worldX + charWidth - 1) / tileWidth); 
  const startRow = Math.floor(worldY / tileHeight); // 
  const endRow = Math.floor((worldY + charHeight - 1) / tileHeight); 

  let isOverlappingSolid = false; // 
  let isOverlappingDoor = false; // 
  let isOverlappingSwamp = false; // 
  let isOverlappingCave = false; // 
  let isOverlappingBed = false; // 
  let isOverlappingMinigame1 = false; // 
  let isOverlappingMinigame2 = false;
  let isOverlappingItem = false; // BARU: untuk tile item

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const tileType = getCollisionTileValue(c, r, currentCollisionMapConfig); // 
      if (tileType === 1) { 
        isOverlappingSolid = true; // 
      } else if (tileType === 2) { 
        isOverlappingDoor = true; // 
      } else if (tileType === 3) { 
        isOverlappingSwamp = true; // 
      } else if (tileType === 4) { 
        isOverlappingCave = true; // 
      } else if (tileType === 99) { 
        isOverlappingBed = true; // 
      } else if (tileType === 50) { 
        isOverlappingMinigame1 = true; // 
      } else if (tileType === 51) { // NEW: Check for Minigame 2 tile
        isOverlappingMinigame2 = true; 
      }else if (ITEM_TYPES[tileType]) {
        isOverlappingItem = true;
      }
    }
  }

  // Logika Prioritas:
  if (isOverlappingSolid) { 
    return 1; // 
  }
  // Kemudian tile interaktif lainnya
  if (isOverlappingDoor) { 
    return 2; // 
  }
  if (isOverlappingSwamp) { 
    return 3; // 
  }
  if (isOverlappingCave) { 
    return 4; // 
  }
  if (isOverlappingBed) { 
    return 99; // 
  }
  if (isOverlappingMinigame1) {
    return 50;
  }
  if (isOverlappingMinigame2) {
    return 51;
  }
  if (isOverlappingItem) {
    // Kita bisa saja mengembalikan tipe item spesifik jika perlu,
    // tapi untuk sekarang, kita hanya perlu tahu itu adalah "item" secara umum.
    // Mari kita gunakan angka `6` sebagai representasi umum untuk item yang bisa diambil.
    return 6; 
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