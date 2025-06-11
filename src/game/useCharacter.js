// src/game/useCharacter.js
import { useState, useEffect, useRef, useCallback } from 'react'; //
import { DEFAULT_SPRITE_CONFIG, SLEEP_SPRITE_CONFIG, IDLE_SPRITE_CONFIG } from './gameConstants';
// Impor IDLE_SPRITE_CONFIG

function useCharacter({
  initialPosition,
}) {
  const [worldPosition, setWorldPosition] = useState(initialPosition); //
  const [isMoving, setIsMoving] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0); //
  const [facingDirection, setFacingDirection] = useState('down'); // DIUBAH: Default menghadap ke bawah
  const activeKeysRef = useRef(new Set()); //
  const interactionKeyRef = useRef(false); //
  const [isSleepingForAnimation, setIsSleepingForAnimation] = useState(false);
  const lastDirectionKey = useRef(null); // BARU: Untuk melacak tombol arah terakhir

  const updateWorldPosition = useCallback((newPosition) => { //
    setWorldPosition(newPosition);
  }, []);
  useEffect(() => { //
    setWorldPosition(initialPosition);
    setIsSleepingForAnimation(false);
    setCurrentFrame(0); // Reset frame saat posisi berubah
  }, [initialPosition]);
  const setSleepingState = useCallback((shouldSleep) => { //
    setIsSleepingForAnimation(shouldSleep);
    if (shouldSleep) {
      setIsMoving(false);
      activeKeysRef.current.clear();
      setCurrentFrame(0); // Mulai animasi tidur dari frame pertama
    } else {
      setCurrentFrame(0); // Reset frame saat bangun (ke frame pertama idle/jalan)
    }
  }, []);
  // Event listener untuk input keyboard (gerakan dan interaksi)
  useEffect(() => { //
    const handleKeyDown = (event) => {
      if (isSleepingForAnimation) return; // Abaikan input jika sedang tidur

      const moveKeys = ['arrowup', 'w', 'arrowdown', 's', 'arrowleft', 'a', 'arrowright', 'd'];
      const interactionKeys = ['e', 'enter'];
      const keyLower = event.key.toLowerCase();

      if (moveKeys.includes(keyLower)) { //
        event.preventDefault();

        // --- PERUBAHAN UTAMA: Logika Gerakan 4 Arah ---
        // Jika tombol yang ditekan berbeda dari yang terakhir, reset.
        if (keyLower !== lastDirectionKey.current) {
            activeKeysRef.current.clear(); // Hapus semua tombol gerakan lain
            lastDirectionKey.current = keyLower; // Set tombol baru sebagai yang terakhir
            activeKeysRef.current.add(keyLower); // Tambahkan tombol baru
        }
        
        if (!isMoving) setIsMoving(true); //

        // DIUBAH: Menentukan arah hadap untuk 4 arah
        if (keyLower === 'arrowleft' || keyLower === 'a') { //
          setFacingDirection('left');
        } else if (keyLower === 'arrowright' || keyLower === 'd') {
          setFacingDirection('right');
        } else if (keyLower === 'arrowup' || keyLower === 'w') {
          setFacingDirection('up');
        } else if (keyLower === 'arrowdown' || keyLower === 's') {
          setFacingDirection('down');
        }
      }
      if (interactionKeys.includes(keyLower)) { //
        event.preventDefault();
        interactionKeyRef.current = true; //
      }
    };

    const handleKeyUp = (event) => {
      if (isSleepingForAnimation) return;

      const moveKeys = ['arrowup', 'w', 'arrowdown', 's', 'arrowleft', 'a', 'arrowright', 'd'];
      const keyLower = event.key.toLowerCase();

      if (moveKeys.includes(keyLower)) { //
        event.preventDefault();
        // Hanya hapus tombol jika itu adalah tombol yang terakhir ditekan
        if(keyLower === lastDirectionKey.current) {
            activeKeysRef.current.delete(keyLower);
            lastDirectionKey.current = null; // Reset pelacak
            if (activeKeysRef.current.size === 0) {
              setIsMoving(false);
              setCurrentFrame(0);
            }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown); //
    window.addEventListener('keyup', handleKeyUp); //
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp); //
    };
  }, [isMoving, isSleepingForAnimation]);
  // Logika untuk menentukan sprite config yang aktif
  const spriteConfigToUse = (() => {
    if (isSleepingForAnimation) {
      return SLEEP_SPRITE_CONFIG;
    }
    if (!isMoving) { // Tidak bergerak DAN tidak tidur -> IDLE
      return IDLE_SPRITE_CONFIG;
    }
    // Jika bergerak (dan tidak tidur) -> DEFAULT (jalan)
    return DEFAULT_SPRITE_CONFIG;
  })();
  // Efek untuk mengelola loop animasi (pergantian frame)
  useEffect(() => { //
    let animationInterval;
    const currentConfig = spriteConfigToUse; // Gunakan config yang sudah ditentukan
    if (currentConfig.numFrames > 0) { // Pastikan ada frame untuk dianimasikan
         animationInterval = setInterval(() => {
            setCurrentFrame(prevFrame => (prevFrame + 1) % currentConfig.numFrames);
        }, currentConfig.animationSpeedMs);
    } else {
        setCurrentFrame(0); // Jika tidak ada frame (atau numFrames 0), default ke frame 0
    }

    return () => clearInterval(animationInterval);
  }, [isMoving, isSleepingForAnimation, spriteConfigToUse]);
  return {
    characterWorldPosition: worldPosition,
    updateWorldPosition,
    isMoving,
    currentFrame,
    facingDirection,
    activeKeysRef,
    interactionKeyRef,
    isSleeping: isSleepingForAnimation, // Expose status tidur aktual untuk logika game
    setSleepingState,                 // Fungsi untuk mengontrol status tidur dari luar
    spriteConfigToUse,                // Expose sprite 
  };
}

export default useCharacter; //