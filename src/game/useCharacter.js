// src/game/useCharacter.js
import { useState, useEffect, useRef, useCallback } from 'react'; // [cite: 180]
import { DEFAULT_SPRITE_CONFIG } from './gameConstants'; // Asumsi SLEEP_SPRITE_CONFIG akan didefinisikan di sini atau di gameConstants

// Definisikan konfigurasi sprite tidur (bisa juga di gameConstants.js)
export const SLEEP_SPRITE_CONFIG = {
  numFrames: 7, // Jumlah frame animasi tidur (misalnya)
  frameWidth: 64, // Lebar frame
  frameHeight: 64, // Tinggi frame
  animationSpeedMs: 500, // Kecepatan animasi tidur
  rowIndex: 3, // Baris pada sprite sheet untuk animasi tidur (0-indexed)
};

function useCharacter({
  initialPosition,
  spriteConfig = DEFAULT_SPRITE_CONFIG, // Default ke sprite biasa
  // isCurrentlySleeping, // Prop BARU untuk mengontrol status tidur dari luar
}) {
  const [worldPosition, setWorldPosition] = useState(initialPosition); // [cite: 181]
  const [isMoving, setIsMoving] = useState(false); // [cite: 182]
  const [currentFrame, setCurrentFrame] = useState(0); // [cite: 182]
  const [facingDirection, setFacingDirection] = useState('right'); // [cite: 183]
  const activeKeysRef = useRef(new Set()); // [cite: 183]
  const interactionKeyRef = useRef(false); // [cite: 183]

  // BARU: State internal untuk status tidur, dikontrol oleh fungsi
  const [isSleepingForAnimation, setIsSleepingForAnimation] = useState(false);

  const updateWorldPosition = useCallback((newPosition) => { // [cite: 184]
    setWorldPosition(newPosition);
  }, []);

  useEffect(() => { // [cite: 185]
    setWorldPosition(initialPosition);
    setIsSleepingForAnimation(false); // Pastikan tidak tidur saat posisi reset
  }, [initialPosition]);

  // BARU: Fungsi untuk mengontrol status tidur untuk animasi
  const setSleepingState = useCallback((shouldSleep) => {
    setIsSleepingForAnimation(shouldSleep);
    if (shouldSleep) {
      setIsMoving(false); // Karakter tidak bergerak saat tidur
      activeKeysRef.current.clear(); // Hapus semua input gerakan aktif
      setCurrentFrame(0); // Mulai animasi tidur dari frame pertama
    }
  }, []);


  useEffect(() => {
    const handleKeyDown = (event) => { // [cite: 186]
      if (isSleepingForAnimation) return; // Abaikan input jika sedang tidur

      const moveKeys = ['arrowup', 'w', 'arrowdown', 's', 'arrowleft', 'a', 'arrowright', 'd'];
      const interactionKeys = ['e', 'enter'];
      const keyLower = event.key.toLowerCase();

      if (moveKeys.includes(keyLower)) { // [cite: 186]
        event.preventDefault();
        activeKeysRef.current.add(keyLower);
        if (!isMoving) setIsMoving(true);
        if (keyLower === 'arrowleft' || keyLower === 'a') { // [cite: 186]
          setFacingDirection('left');
        } else if (keyLower === 'arrowright' || keyLower === 'd') {
          setFacingDirection('right');
        }
      }
      if (interactionKeys.includes(keyLower)) { // [cite: 187]
        event.preventDefault();
        interactionKeyRef.current = true;
      }
    };

    const handleKeyUp = (event) => { // [cite: 188]
      if (isSleepingForAnimation && (event.key.toLowerCase() === 'e' || event.key.toLowerCase() === 'enter')) {
        // Jika tidur dan E ditekan, mungkin untuk bangun? Untuk sekarang, E tidak akan membangunkan.
        // Logika bangun akan ditangani oleh MainPage.js melalui timeout.
      }
      if (isSleepingForAnimation) return; // Abaikan input jika sedang tidur

      const moveKeys = ['arrowup', 'w', 'arrowdown', 's', 'arrowleft', 'a', 'arrowright', 'd'];
      const keyLower = event.key.toLowerCase(); // [cite: 189]
      if (moveKeys.includes(keyLower)) { // [cite: 190]
        event.preventDefault();
        activeKeysRef.current.delete(keyLower); // [cite: 190]
        if (activeKeysRef.current.size === 0) {
          setIsMoving(false); // [cite: 191]
        } else {
          const keys = activeKeysRef.current; // [cite: 192]
          if (!keys.has('arrowleft') && !keys.has('a') && (keys.has('arrowright') || keys.has('d'))) { // [cite: 193]
            setFacingDirection('right');
          } else if (!keys.has('arrowright') && !keys.has('d') && (keys.has('arrowleft') || keys.has('a'))) { // [cite: 194]
            setFacingDirection('left');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isMoving, isSleepingForAnimation]); // Tambahkan isSleepingForAnimation ke dependency

  useEffect(() => {
    let animationInterval;
    if (isSleepingForAnimation) {
      animationInterval = setInterval(() => {
        setCurrentFrame(prevFrame => (prevFrame + 1) % SLEEP_SPRITE_CONFIG.numFrames);
      }, SLEEP_SPRITE_CONFIG.animationSpeedMs);
    } else if (isMoving) {
      animationInterval = setInterval(() => {
        setCurrentFrame(prevFrame => (prevFrame + 1) % spriteConfig.numFrames);
      }, spriteConfig.animationSpeedMs);
    } else {
      setCurrentFrame(0); // Frame diam
    }
    return () => clearInterval(animationInterval);
  }, [isMoving, isSleepingForAnimation, spriteConfig]); // Tambahkan isSleepingForAnimation

  return {
    characterWorldPosition: worldPosition,
    updateWorldPosition,
    isMoving, // Tetap ada untuk animasi jalan jika tidak tidur
    currentFrame,
    facingDirection,
    activeKeysRef,
    interactionKeyRef,
    isSleeping: isSleepingForAnimation, // Expose status tidur untuk rendering
    setSleepingState, // Expose fungsi untuk dikontrol dari GameCanvas/MainPage
    spriteConfigToUse: isSleepingForAnimation ? SLEEP_SPRITE_CONFIG : spriteConfig, // Memberikan config sprite yang sesuai
  };
}

export default useCharacter;