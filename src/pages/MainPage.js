// src/pages/MainPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style.css'; // [cite: 280]
import GameCanvas from '../game/GameCanvas'; // [cite: 281]
import mapBackground from '../assets/map/mainmap.png'; // [cite: 281]
import homeMapBackground from '../assets/map/home.png'; // [cite: 281]
import swampMapBackground from '../assets/map/rawa.png'; // [cite: 281]
import cavesMapBackground from '../assets/map/caves.png'; // [cite: 282]
import PlayerStats from '../mainPage/Playerstats'; // [cite: 282]
import StatusBarGrid from '../mainPage/StatusBarGrid'; // [cite: 282]
import ActionPanel from '../mainPage/ActionPanel'; // [cite: 283]
import MovementControls from '../mainPage/MovementControls'; // [cite: 283]
import playerCharacterSprite from '../game/assets/blue_mushroom_sheet_upscaled.png'; // [cite: 283]

const GAME_SPEED = 5; // [cite: 284]
const SECONDS_PER_HOUR = 60; // [cite: 284]
const HOURS_PER_DAY = 24; // [cite: 284]
const SECONDS_PER_DAY = SECONDS_PER_HOUR * HOURS_PER_DAY; // [cite: 285]
const STAT_DECREASE_INTERVAL_SECONDS = 90; // Setiap 1.5 menit real time pada game speed default // [cite: 285]
const MAKAN_DECREMENT = 2; // [cite: 285]
const TIDUR_DECREMENT = 1; // [cite: 286]
const KESENANGAN_DECREMENT = 3; // [cite: 286]
const KEBERSIHAN_DECREMENT = 1; // [cite: 286]

const mapDetails = { // [cite: 287]
  world: {
    imageSrc: mapBackground, // [cite: 287]
    initialPlayerPos: { x: 1600, y: 1500 }, // [cite: 287]
    entryPointFromHouse: { x: 1600, y: 1500 }, // [cite: 287]
    entryPointFromSwamp: { x: 400, y: 1850 }, // [cite: 287]
    entryPointFromCave: { x: 3550, y: 540 }, // [cite: 287]
  },
  house: {
    imageSrc: homeMapBackground, // [cite: 287]
    initialPlayerPos: { x: 90, y: 490 }, // [cite: 287]
  },
  swamp: {
    imageSrc: swampMapBackground, // [cite: 287]
    initialPlayerPos: { x: 955, y: 550 }, // [cite: 288]
  },
  caves: {
    imageSrc: cavesMapBackground, // [cite: 288]
    initialPlayerPos: { x: 700, y: 200 }, // [cite: 288]
  }
};

const DEFAULT_STATS = { // [cite: 291]
  makan: 60,
  tidur: 80,
  kesenangan: 85,
  kebersihan: 70,
  money: 50,
};

function MainPage() {
  const navigate = useNavigate(); // [cite: 280]
  const [gameTime, setGameTime] = useState(0); // [cite: 289]
  const [day, setDay] = useState(1); // [cite: 289]
  const [playerName, setPlayerName] = useState('Player'); // [cite: 290]
  const [playerAvatar, setPlayerAvatar] = useState(''); // [cite: 290]
  const [stats, setStats] = useState(() => ({ ...DEFAULT_STATS })); // [cite: 291]
  const [currentMapKey, setCurrentMapKey] = useState('world'); // [cite: 294]
  const [characterSpawnPosition, setCharacterSpawnPosition] = useState(() => mapDetails.world.initialPlayerPos); // [cite: 294]
  const [availableInteractionType, setAvailableInteractionType] = useState(0); // [cite: 295]
  const [isCharacterSleeping, setIsCharacterSleeping] = useState(false); // [cite: 295]
  const [isInitialized, setIsInitialized] = useState(false);

  const gameTickIntervalRef = useRef(null);

  // Efek untuk inisialisasi state utama saat komponen pertama kali dimuat
  useEffect(() => {
    console.log("MainPage mounted. Initializing state...");
    let initialMapKey = 'world';
    let initialPosition = mapDetails.world.initialPlayerPos;
    let initialGameTime = 0;
    let initialDay = 1;
    let initialStats = { ...DEFAULT_STATS };

    const savedStateFromMinigame = sessionStorage.getItem('gameStateBeforeMinigame');
    if (savedStateFromMinigame) {
      console.log("Loading state from sessionStorage (returned from minigame).");
      try {
        const { mapKey, position, gameTime: sgTime, day: sgDay, stats: sgStats } = JSON.parse(savedStateFromMinigame);
        initialMapKey = mapKey || initialMapKey;
        initialPosition = position || initialPosition;
        initialGameTime = typeof sgTime === 'number' ? sgTime : initialGameTime;
        initialDay = typeof sgDay === 'number' ? sgDay : initialDay;
        initialStats = sgStats || initialStats;
        sessionStorage.removeItem('gameStateBeforeMinigame');
      } catch (e) { console.error("Failed to parse sessionStorage state:", e); sessionStorage.removeItem('gameStateBeforeMinigame'); }
    } else {
      console.log("No sessionStorage state, trying localStorage.");
      try {
        const lsGameTime = localStorage.getItem('katak_gameTime');
        if (lsGameTime !== null) initialGameTime = JSON.parse(lsGameTime);
        const lsDay = localStorage.getItem('katak_day');
        if (lsDay !== null) initialDay = JSON.parse(lsDay);
        const lsStats = localStorage.getItem('katak_stats');
        if (lsStats !== null) initialStats = JSON.parse(lsStats);
        const lsMapKey = localStorage.getItem('katak_currentMapKey');
        if (lsMapKey !== null) initialMapKey = JSON.parse(lsMapKey);
        
        const validInitialMapKey = mapDetails[initialMapKey] ? initialMapKey : 'world';
        const lsPosition = localStorage.getItem('katak_characterPosition');
        if (lsPosition !== null) initialPosition = JSON.parse(lsPosition);
        else initialPosition = mapDetails[validInitialMapKey]?.initialPlayerPos || mapDetails.world.initialPlayerPos;

      } catch (e) {
         console.error("Failed to parse localStorage state, resetting to defaults:", e);
         initialGameTime = 0; initialDay = 1; initialStats = { ...DEFAULT_STATS };
         initialMapKey = 'world'; initialPosition = mapDetails.world.initialPlayerPos;
      }
    }

    setGameTime(initialGameTime); setDay(initialDay); setStats(initialStats);
    setCurrentMapKey(initialMapKey); setCharacterSpawnPosition(initialPosition);

    const storedName = localStorage.getItem('playerName'); // [cite: 295]
    if (storedName) setPlayerName(storedName);
    const storedAvatar = localStorage.getItem('playerAvatar'); // [cite: 295]
    if (storedAvatar) setPlayerAvatar(storedAvatar);
    else console.warn("Player avatar not found in localStorage."); // [cite: 295]
    
    setIsInitialized(true);
    console.log("Initialization complete. Map:", initialMapKey, "Pos:", initialPosition, "Time:", initialGameTime);

    // Fungsi cleanup untuk UNMOUNT TOTAL dari MainPage (misalnya kembali ke home, bukan lobby/gameover)
    // Penyimpanan utama terjadi sebelum navigasi di handleBackToLobby dan game over.
    return () => {
        console.log("MainPage is UNMOUNTING TOTAL. Interval should be cleared.");
        if (gameTickIntervalRef.current) {
            clearInterval(gameTickIntervalRef.current);
            gameTickIntervalRef.current = null;
        }
    };
  }, []); // Hanya berjalan sekali saat mount

  // Efek untuk interval game tick (TIMER UTAMA)
  useEffect(() => {
    if (!isInitialized) {
      if (gameTickIntervalRef.current) {
        clearInterval(gameTickIntervalRef.current);
        gameTickIntervalRef.current = null;
      }
      return;
    }

    if (!gameTickIntervalRef.current) { // Hanya mulai jika belum ada
        console.log("Game tick interval starting.");
        gameTickIntervalRef.current = setInterval(() => {
          setGameTime(prevTime => prevTime + 1);
        }, 1000 / GAME_SPEED); // [cite: 296]
    }

    // Fungsi cleanup untuk efek ini: hanya membersihkan interval jika isInitialized berubah atau unmount
    return () => {
      if (gameTickIntervalRef.current) {
        console.log("Cleaning up game tick interval (isInitialized: false, or component unmounting).");
        clearInterval(gameTickIntervalRef.current);
        gameTickIntervalRef.current = null;
      }
    };
  }, [isInitialized]); // Hanya bergantung pada isInitialized

  // Efek untuk update hari dan pengurangan stats berdasarkan gameTime
  useEffect(() => {
    if (!isInitialized || gameTime === 0 && day === 1) return; // Hindari proses saat init gameTime masih 0

    if (gameTime > 0) { // [cite: 297]
        if (gameTime % SECONDS_PER_DAY === 0) { // [cite: 297]
            setDay(prevDay => prevDay + 1); // [cite: 297]
        }
        if (gameTime % STAT_DECREASE_INTERVAL_SECONDS === 0 && !isCharacterSleeping) { // [cite: 297]
            setStats(prevStats => ({ // [cite: 297]
            ...prevStats,
            makan: Math.max(0, prevStats.makan - MAKAN_DECREMENT), // [cite: 297]
            tidur: Math.max(0, prevStats.tidur - TIDUR_DECREMENT), // [cite: 298]
            kesenangan: Math.max(0, prevStats.kesenangan - KESENANGAN_DECREMENT), // [cite: 298]
            kebersihan: Math.max(0, prevStats.kebersihan - KEBERSIHAN_DECREMENT), // [cite: 298]
            }));
        }
    }
  }, [gameTime, isCharacterSleeping, isInitialized, day]); // Tambahkan day jika logikanya bergantung padanya

  // Efek untuk game over
  useEffect(() => {
    if (!isInitialized) return;
    if (playerName && (stats.makan <= 0 || stats.tidur <= 0 || stats.kesenangan <= 0 || stats.kebersihan <= 0)) { // [cite: 299]
      console.log("Game Over condition met. Saving state before navigation.");
      if (gameTickIntervalRef.current) {
        clearInterval(gameTickIntervalRef.current);
        gameTickIntervalRef.current = null;
      }
      // Simpan state secara eksplisit SEBELUM navigasi
      localStorage.setItem('katak_gameTime', JSON.stringify(gameTime));
      localStorage.setItem('katak_day', JSON.stringify(day));
      localStorage.setItem('katak_stats', JSON.stringify(stats));
      localStorage.setItem('katak_currentMapKey', JSON.stringify(currentMapKey));
      localStorage.setItem('katak_characterPosition', JSON.stringify(characterSpawnPosition));
      
      navigate('/gameover'); // [cite: 299]
    }
  }, [stats, playerName, navigate, isInitialized, gameTime, day, currentMapKey, characterSpawnPosition]);


  // Handler untuk transisi peta atau navigasi ke minigame
  const handleMapTransitionRequest = useCallback((targetKey, charPos = null) => {
    if (!isInitialized) {
      console.warn("Attempted map transition before initialization.");
      return;
    }
    console.log(`Map transition request to: ${targetKey}`, charPos ? `from pos: ${JSON.stringify(charPos)}` : '');
    if (gameTickIntervalRef.current) { // Selalu hentikan interval utama saat transisi
      clearInterval(gameTickIntervalRef.current);
      gameTickIntervalRef.current = null;
      console.log("Main game interval stopped for transition.");
    }

    if (targetKey === 'minigame1_trigger' && charPos) { // [cite: 314]
      const gameStateBeforeMinigame = {
        mapKey: currentMapKey,
        position: charPos,
        gameTime: gameTime,
        day: day,
        stats: stats,
      };
      sessionStorage.setItem('gameStateBeforeMinigame', JSON.stringify(gameStateBeforeMinigame));
      console.log("Saved state to sessionStorage for minigame:", gameStateBeforeMinigame);
      navigate('/minigame1');
      // isInitialized akan menjadi true lagi saat kembali, dan timer akan restart via useEffect [isInitialized]
    } else if (mapDetails[targetKey]) { // [cite: 314]
      let newSpawnPos = mapDetails[targetKey].initialPlayerPos; // [cite: 317]
      if (targetKey === 'world') { // [cite: 314]
        if (currentMapKey === 'house') newSpawnPos = mapDetails.world.entryPointFromHouse; // [cite: 314]
        else if (currentMapKey === 'swamp') newSpawnPos = mapDetails.world.entryPointFromSwamp; // [cite: 314]
        else if (currentMapKey === 'caves') newSpawnPos = mapDetails.world.entryPointFromCave; // [cite: 315]
      }
      
      setCurrentMapKey(targetKey); // [cite: 317]
      setCharacterSpawnPosition(newSpawnPos);
      setAvailableInteractionType(0); // [cite: 318]
      setIsCharacterSleeping(false); // [cite: 318]
      // Interval akan di-restart oleh useEffect [isInitialized] karena isInitialized masih true
      // dan interval sudah di-set ke null.
    } else {
      console.error("Requested map key or trigger does not exist:", targetKey); // [cite: 320]
      // Jika transisi gagal, coba restart interval jika game memang sudah terinisialisasi
      if (isInitialized && !gameTickIntervalRef.current) {
         console.log("Restarting interval after failed transition.");
         gameTickIntervalRef.current = setInterval(() => setGameTime(prev => prev + 1), 1000 / GAME_SPEED);
      }
    }
  }, [currentMapKey, navigate, gameTime, day, stats, isInitialized]);


  // Handler Aksi Pemain
  const handleMakan = () => { // [cite: 300]
    if (!isInitialized) return;
    if (stats.money >= 5) { // [cite: 300]
        setStats(prevStats => ({  // [cite: 300]
            ...prevStats, 
            makan: Math.min(prevStats.makan + 20, 100), 
            money: prevStats.money - 5 // Uang berkurang
        }));
    } else {
        console.log("Uang tidak cukup untuk makan!"); // [cite: 301]
    }
  };
  const handleBermain = () => { // [cite: 302]
    if (!isInitialized) return;
    setStats(prevStats => ({  // [cite: 302]
        ...prevStats, 
        kesenangan: Math.min(prevStats.kesenangan + 20, 100), // [cite: 303]
        makan: Math.max(0, prevStats.makan - 5), // [cite: 303]
        tidur: Math.max(0, prevStats.tidur - 5) 
    }));
  };
  const handleQuickNap = () => { // [cite: 304]
    if (!isInitialized) return;
    console.log("Melakukan tidur singkat..."); // [cite: 304]
    setStats(prevStats => ({ ...prevStats, tidur: Math.min(prevStats.tidur + 30, 100), kesenangan: Math.max(0, prevStats.kesenangan - 5) })); // [cite: 305]
  };
  const handleBersih = () => { // [cite: 307]
     if (!isInitialized) return;
     setStats(prevStats => ({ ...prevStats, kebersihan: Math.min(prevStats.kebersihan + 40, 100) })); // [cite: 307]
  };
  
  // Placeholder untuk kontrol UI gerakan (GameCanvas menangani input keyboard)
  const handleMoveUp = () => console.log("UI Gerak Atas diklik"); // [cite: 308]
  const handleMoveDown = () => console.log("UI Gerak Bawah diklik"); // [cite: 309]
  const handleMoveLeft = () => console.log("UI Gerak Kiri diklik"); // [cite: 310]
  const handleMoveRight = () => console.log("UI Gerak Kanan diklik"); // [cite: 311]

  // Handler kembali ke lobi
  const handleBackToLobby = () => { // [cite: 312]
    if (!isInitialized) return;
    console.log("Kembali ke Lobby. Saving game state before navigation.");
    if (gameTickIntervalRef.current) {
      clearInterval(gameTickIntervalRef.current);
      gameTickIntervalRef.current = null;
    }
    // Simpan state secara eksplisit SEBELUM navigasi
    localStorage.setItem('katak_gameTime', JSON.stringify(gameTime));
    localStorage.setItem('katak_day', JSON.stringify(day));
    localStorage.setItem('katak_stats', JSON.stringify(stats));
    localStorage.setItem('katak_currentMapKey', JSON.stringify(currentMapKey));
    localStorage.setItem('katak_characterPosition', JSON.stringify(characterSpawnPosition));
    
    navigate('/lobby'); // [cite: 312]
  };

  // Callback dari GameCanvas tentang interaksi yang tersedia
  const handleInteractionAvailableFromCanvas = useCallback((type) => { // [cite: 313]
    if (!isInitialized) return;
    if (!isCharacterSleeping) { // [cite: 313]
      setAvailableInteractionType(type); // [cite: 313]
    }
  }, [isCharacterSleeping, isInitialized]); // [cite: 313]

  // Handler untuk tidur di kasur
  const handleSleepInBed = useCallback(() => { // [cite: 325]
    if (!isInitialized || isCharacterSleeping || availableInteractionType !== 99) return; // [cite: 325]

    console.log("Memulai tidur di kasur..."); // [cite: 325]
    setIsCharacterSleeping(true); // [cite: 325]
    setAvailableInteractionType(0); // [cite: 325]
    
    if (gameTickIntervalRef.current) { // Hentikan timer game selama tidur
      clearInterval(gameTickIntervalRef.current);
      gameTickIntervalRef.current = null;
      console.log("Main game interval stopped for sleeping.");
    }

    setTimeout(() => { // Simulasikan durasi animasi tidur
      console.log("Bangun tidur..."); // [cite: 327]
      const sleepDurationHours = 8; // [cite: 325]
      const sleepTimeAdvance = sleepDurationHours * SECONDS_PER_HOUR; // [cite: 325]
      
      setGameTime(prevTime => prevTime + sleepTimeAdvance); // [cite: 325]
      setStats(prevStats => ({ // [cite: 325]
        ...prevStats,
        tidur: 100, // [cite: 326]
        makan: Math.max(0, prevStats.makan - 10), // [cite: 326]
      }));
      setIsCharacterSleeping(false); // [cite: 326]
      
      // Restart game timer utama setelah semua state diupdate
      // useEffect [isInitialized] akan menangani restart timer karena interval sudah null
    }, 3000); // Durasi animasi tidur 3 detik // [cite: 327]
  }, [isCharacterSleeping, availableInteractionType, isInitialized, SECONDS_PER_HOUR, gameTime, stats]); // [cite: 328]


  // Tampilan loading jika belum terinisialisasi
  if (!isInitialized || !playerAvatar || !mapDetails[currentMapKey]?.imageSrc) { // [cite: 329]
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#333', color: 'white', fontSize: '20px' }}>
        Memuat permainan... {/* [cite: 329] */}
      </div>
    );
  }

  return (
    <div className="container-fluid p-0"> {/* [cite: 330] */}
      <div className="semua"> {/* [cite: 330] */}
        <div className="text-center"> {/* [cite: 330] */}
          <div className="row game-panel"> {/* [cite: 330] */}
            <div className="col-9"> {/* [cite: 330] */}
              <PlayerStats playerName={playerName} day={day} gameTime={gameTime} money={stats.money} /> {/* [cite: 330] */}
              <StatusBarGrid stats={stats} /> {/* [cite: 331] */}
              <div className="ruangmainnya bg-white p-4 rounded shadow"> {/* [cite: 331] */}
                <GameCanvas
                  mapImageSrc={mapDetails[currentMapKey].imageSrc} // [cite: 331]
                  characterImageSrc={playerCharacterSprite} // [cite: 331]
                  currentMapKey={currentMapKey} // [cite: 331]
                  initialCharacterPosition={characterSpawnPosition} // [cite: 332]
                  onMapTransitionRequest={handleMapTransitionRequest} // [cite: 332]
                  onInteractionAvailable={handleInteractionAvailableFromCanvas} // [cite: 332]
                  isCharacterCurrentlySleeping={isCharacterSleeping} // [cite: 332]
                  onBedInteraction={handleSleepInBed} // [cite: 332]
                />
              </div>
            </div>
            <div className="col-3 align-items-start flex-column p-4 action-panel img-fluid"> {/* [cite: 333] */}
              <ActionPanel
                onMakan={handleMakan} // [cite: 334]
                onBermain={handleBermain} // [cite: 334]
                onTidur={handleQuickNap} // [cite: 334]
                onBersih={handleBersih} // [cite: 334]
                showTidurButton={!isCharacterSleeping} // [cite: 334]
                showBersihButton={true} // [cite: 335]
                currentMapKey={currentMapKey} // [cite: 335]
                availableInteractionType={availableInteractionType} // [cite: 335]
                onEnterHouse={() => handleMapTransitionRequest('house')} // [cite: 335]
                onExitHouse={() => handleMapTransitionRequest('world')} // [cite: 335]
                onEnterSwamp={() => handleMapTransitionRequest('swamp')} // [cite: 336]
                onExitSwamp={() => handleMapTransitionRequest('world')} // [cite: 336]
                onEnterCave={() => handleMapTransitionRequest('caves')} // [cite: 336]
                onExitCave={() => handleMapTransitionRequest('world')} // [cite: 336]
                onSleepInBed={handleSleepInBed} // [cite: 336]
              />
              <div className="separator my-4 bg-white" style={{ height: '2px', opacity: '0.5' }}></div> {/* [cite: 337] */}
              <MovementControls 
                onUp={handleMoveUp} 
                onDown={handleMoveDown} 
                onLeft={handleMoveLeft} 
                onRight={handleMoveRight} 
              /> {/* [cite: 337] */}
              <button onClick={handleBackToLobby} className="btn btn-info w-100 mt-4">Kembali ke Lobby</button> {/* [cite: 337] */}
            </div>
          </div>
        </div>
      </div> {/* [cite: 338] */}
    </div> // [cite: 338]
  );
}

export default MainPage; // [cite: 339]