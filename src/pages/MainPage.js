// src/pages/MainPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style.css';
import GameCanvas from '../game/GameCanvas';
import mapBackground from '../assets/map/mainmap.png';
import homeMapBackground from '../assets/map/home.png';
import swampMapBackground from '../assets/map/rawa.png';
import cavesMapBackground from '../assets/map/caves.png';
import PlayerStats from '../mainPage/Playerstats';
import StatusBarGrid from '../mainPage/StatusBarGrid';
import ActionPanel from '../mainPage/ActionPanel';
import MovementControls from '../mainPage/MovementControls';
import playerCharacterSprite from '../game/assets/blue_mushroom_sheet_upscaled.png';

const GAME_SPEED = 10;
const SECONDS_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const SECONDS_PER_DAY = SECONDS_PER_HOUR * HOURS_PER_DAY;
const STAT_DECREASE_INTERVAL_SECONDS = 360; // Setiap 1.5 menit real time pada game speed 1
const MAKAN_DECREMENT = 2;
const TIDUR_DECREMENT = 1;
const KESENANGAN_DECREMENT = 3;
const KEBERSIHAN_DECREMENT = 1;

const mapDetails = {
  world: {
    imageSrc: mapBackground,
    initialPlayerPos: { x: 1600, y: 1500 },
    entryPointFromHouse: { x: 1600, y: 1500 },
    entryPointFromSwamp: { x: 400, y: 1850 },
    entryPointFromCave: { x: 3550, y: 540 },
  },
  house: {
    imageSrc: homeMapBackground,
    initialPlayerPos: { x: 90, y: 490 },
  },
  swamp: {
    imageSrc: swampMapBackground,
    initialPlayerPos: { x: 955, y: 550 },
  },
  caves: {
    imageSrc: cavesMapBackground,
    initialPlayerPos: { x: 700, y: 200 },
  }
};

const DEFAULT_STATS = {
  makan: 60,
  tidur: 80,
  kesenangan: 85,
  kebersihan: 70,
  money: 50,
};

function MainPage() {
  const navigate = useNavigate();
  const [gameTime, setGameTime] = useState(0);
  const [day, setDay] = useState(1);
  const [playerName, setPlayerName] = useState('Player');
  const [playerAvatar, setPlayerAvatar] = useState('');
  const [stats, setStats] = useState(() => ({ ...DEFAULT_STATS }));
  const [currentMapKey, setCurrentMapKey] = useState('world');
  const [characterSpawnPosition, setCharacterSpawnPosition] = useState(() => mapDetails.world.initialPlayerPos);
  const [availableInteractionType, setAvailableInteractionType] = useState(0);
  const [isCharacterSleeping, setIsCharacterSleeping] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const gameTickIntervalRef = useRef(null);

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
      } catch (e) {
        console.error("Failed to parse sessionStorage state:", e);
        sessionStorage.removeItem('gameStateBeforeMinigame'); // Hapus jika korup
      }
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

        const lsPosition = localStorage.getItem('katak_characterPosition');
        // Pastikan initialMapKey valid sebelum mengambil initialPlayerPos
        const validInitialMapKey = mapDetails[initialMapKey] ? initialMapKey : 'world';
        if (lsPosition !== null) initialPosition = JSON.parse(lsPosition);
        else initialPosition = mapDetails[validInitialMapKey]?.initialPlayerPos || mapDetails.world.initialPlayerPos;
      } catch (e) {
         console.error("Failed to parse localStorage state:", e);
         // Reset ke default jika ada error parsing
         initialGameTime = 0;
         initialDay = 1;
         initialStats = { ...DEFAULT_STATS };
         initialMapKey = 'world';
         initialPosition = mapDetails.world.initialPlayerPos;
      }
    }

    setGameTime(initialGameTime);
    setDay(initialDay);
    setStats(initialStats);
    setCurrentMapKey(initialMapKey);
    setCharacterSpawnPosition(initialPosition);

    const storedName = localStorage.getItem('playerName');
    if (storedName) setPlayerName(storedName);
    const storedAvatar = localStorage.getItem('playerAvatar');
    if (storedAvatar) setPlayerAvatar(storedAvatar);
    else console.warn("Player avatar not found in localStorage.");

    setIsInitialized(true);
    console.log("Initialization complete. Map:", initialMapKey, "Pos:", initialPosition, "Time:", initialGameTime);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    console.log("Game tick effect started/restarted.");
    gameTickIntervalRef.current = setInterval(() => {
      setGameTime(prevTime => prevTime + 1);
    }, 1000 / GAME_SPEED);

    return () => {
      console.log("MainPage unmounting or core dependencies changed. Clearing interval and saving to localStorage.");
      clearInterval(gameTickIntervalRef.current);
      if (isInitialized) { // Hanya simpan jika sudah terinisialisasi
        localStorage.setItem('katak_gameTime', JSON.stringify(gameTime));
        localStorage.setItem('katak_day', JSON.stringify(day));
        localStorage.setItem('katak_stats', JSON.stringify(stats));
        localStorage.setItem('katak_currentMapKey', JSON.stringify(currentMapKey));
        // Simpan posisi aktual karakter jika memungkinkan, atau posisi spawn terakhir
        // Untuk kesederhanaan, kita simpan characterSpawnPosition yang terakhir di-set
        localStorage.setItem('katak_characterPosition', JSON.stringify(characterSpawnPosition));
      }
    };
  }, [isInitialized, gameTime, day, stats, currentMapKey, characterSpawnPosition]); // Dependensi penting

  useEffect(() => {
    if (!isInitialized || gameTime === 0) return; // Hindari proses saat gameTime masih 0 setelah init

    if (gameTime % SECONDS_PER_DAY === 0) {
      setDay(prevDay => prevDay + 1);
    }
    if (gameTime % STAT_DECREASE_INTERVAL_SECONDS === 0 && !isCharacterSleeping) {
      setStats(prevStats => ({
        ...prevStats,
        makan: Math.max(0, prevStats.makan - MAKAN_DECREMENT),
        tidur: Math.max(0, prevStats.tidur - TIDUR_DECREMENT),
        kesenangan: Math.max(0, prevStats.kesenangan - KESENANGAN_DECREMENT),
        kebersihan: Math.max(0, prevStats.kebersihan - KEBERSIHAN_DECREMENT),
      }));
    }
  }, [gameTime, isCharacterSleeping, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    if (playerName && (stats.makan <= 0 || stats.tidur <= 0 || stats.kesenangan <= 0 || stats.kebersihan <= 0)) {
      console.log("Game Over condition met.");
      clearInterval(gameTickIntervalRef.current);
      navigate('/gameover');
    }
  }, [stats, playerName, navigate, isInitialized]);

  const handleMapTransitionRequest = useCallback((targetKey, charPos = null) => {
    if (!isInitialized) {
      console.warn("Attempted map transition before initialization.");
      return;
    }

    console.log(`Map transition to: ${targetKey}`, charPos ? `from pos: ${JSON.stringify(charPos)}` : '');
    clearInterval(gameTickIntervalRef.current); // Hentikan timer sementara

    if (targetKey === 'minigame1_trigger' && charPos) {
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
      // Timer akan di-restart oleh useEffect saat MainPage dimuat ulang
    } else if (mapDetails[targetKey]) {
      let newSpawnPos = mapDetails[targetKey].initialPlayerPos;
      if (targetKey === 'world') {
        if (currentMapKey === 'house') newSpawnPos = mapDetails.world.entryPointFromHouse;
        else if (currentMapKey === 'swamp') newSpawnPos = mapDetails.world.entryPointFromSwamp;
        else if (currentMapKey === 'caves') newSpawnPos = mapDetails.world.entryPointFromCave;
      }
      
      // Perbarui state yang memicu re-render dan restart timer di useEffect
      setCurrentMapKey(targetKey);
      setCharacterSpawnPosition(newSpawnPos); // Ini akan memicu useEffect penyimpanan juga
      setAvailableInteractionType(0);
      setIsCharacterSleeping(false);
      // Tidak perlu restart interval di sini, useEffect [isInitialized, gameTime, ...] akan menangani
    } else {
      console.error("Requested map key or trigger does not exist:", targetKey);
      // Restart timer jika transisi gagal dan game sudah terinisialisasi
      if (isInitialized) {
        gameTickIntervalRef.current = setInterval(() => setGameTime(prev => prev + 1), 1000 / GAME_SPEED);
      }
    }
  }, [currentMapKey, navigate, gameTime, day, stats, isInitialized]);

  const handleMakan = () => {
    if (!isInitialized) return;
    if (stats.money >= 5) {
      setStats(prevStats => ({
        ...prevStats,
        makan: Math.min(prevStats.makan + 20, 100), // Naikkan lebih banyak
        money: prevStats.money - 5
      }));
    } else {
      console.log("Uang tidak cukup untuk makan!");
    }
  };

  const handleBermain = () => {
    if (!isInitialized) return;
    setStats(prevStats => ({
      ...prevStats,
      kesenangan: Math.min(prevStats.kesenangan + 20, 100),
      makan: Math.max(0, prevStats.makan - 5), // Sedikit lapar setelah bermain
      tidur: Math.max(0, prevStats.tidur - 5), // Sedikit lelah setelah bermain
    }));
  };

  const handleQuickNap = () => {
    if (!isInitialized) return;
    console.log("Melakukan tidur singkat...");
    setStats(prevStats => ({ ...prevStats, tidur: Math.min(prevStats.tidur + 30, 100), kesenangan: Math.max(0, prevStats.kesenangan - 5) }));
  };

  const handleBersih = () => {
    if (!isInitialized) return;
    setStats(prevStats => ({ ...prevStats, kebersihan: Math.min(prevStats.kebersihan + 40, 100) }));
  };
  
  const handleMoveUp = () => console.log("UI Gerak Atas diklik (belum diimplementasikan ke GameCanvas)");
  const handleMoveDown = () => console.log("UI Gerak Bawah diklik (belum diimplementasikan ke GameCanvas)");
  const handleMoveLeft = () => console.log("UI Gerak Kiri diklik (belum diimplementasikan ke GameCanvas)");
  const handleMoveRight = () => console.log("UI Gerak Kanan diklik (belum diimplementasikan ke GameCanvas)");

  const handleBackToLobby = () => {
    if (!isInitialized) return;
    console.log("Kembali ke Lobby, interval dihentikan.");
    clearInterval(gameTickIntervalRef.current);
    // State akan disimpan oleh cleanup function dari useEffect [isInitialized, ...]
    navigate('/lobby');
  };

  const handleInteractionAvailableFromCanvas = useCallback((type) => {
    if (!isInitialized) return;
    if (!isCharacterSleeping) {
      setAvailableInteractionType(type);
    }
  }, [isCharacterSleeping, isInitialized]);

  const handleSleepInBed = useCallback(() => {
    if (!isInitialized || isCharacterSleeping || availableInteractionType !== 99) return;

    console.log("Memulai tidur di kasur...");
    setIsCharacterSleeping(true);
    setAvailableInteractionType(0);
    
    clearInterval(gameTickIntervalRef.current); // Hentikan timer game selama tidur

    setTimeout(() => { // Simulasikan durasi animasi tidur
      console.log("Bangun tidur...");
      const sleepDurationHours = 8;
      const sleepTimeAdvance = sleepDurationHours * SECONDS_PER_HOUR;
      
      // Update state setelah bangun
      setGameTime(prevTime => prevTime + sleepTimeAdvance);
      setStats(prevStats => ({
        ...prevStats,
        tidur: 100,
        makan: Math.max(0, prevStats.makan - 10), // Lebih lapar setelah tidur lama
        // Mungkin kebersihan sedikit berkurang?
      }));
      setIsCharacterSleeping(false);
      
      // Restart game timer setelah semua state diupdate
      if (isInitialized) {
         gameTickIntervalRef.current = setInterval(() => {
            setGameTime(prev => prev + 1);
          }, 1000 / GAME_SPEED);
      }
    }, 3000); // Durasi animasi tidur 3 detik
  }, [isCharacterSleeping, availableInteractionType, isInitialized, SECONDS_PER_HOUR]);


  if (!isInitialized || !playerAvatar || !mapDetails[currentMapKey]?.imageSrc) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#333', color: 'white', fontSize: '20px' }}>
        Memuat permainan...
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <div className="semua">
        <div className="text-center">
          <div className="row game-panel">
            <div className="col-9">
              <PlayerStats playerName={playerName} day={day} gameTime={gameTime} money={stats.money} />
              <StatusBarGrid stats={stats} />
              <div className="ruangmainnya bg-white p-4 rounded shadow">
                <GameCanvas
                  mapImageSrc={mapDetails[currentMapKey].imageSrc}
                  characterImageSrc={playerCharacterSprite}
                  currentMapKey={currentMapKey}
                  initialCharacterPosition={characterSpawnPosition}
                  onMapTransitionRequest={handleMapTransitionRequest}
                  onInteractionAvailable={handleInteractionAvailableFromCanvas}
                  isCharacterCurrentlySleeping={isCharacterSleeping}
                  onBedInteraction={handleSleepInBed}
                />
              </div>
            </div>
            <div className="col-3 align-items-start flex-column p-4 action-panel img-fluid">
              <ActionPanel
                onMakan={handleMakan}
                onBermain={handleBermain}
                onTidur={handleQuickNap} // Tombol Tidur umum sekarang memanggil handleQuickNap
                onBersih={handleBersih}
                showTidurButton={!isCharacterSleeping} 
                showBersihButton={true} 
                currentMapKey={currentMapKey}
                availableInteractionType={availableInteractionType}
                onEnterHouse={() => handleMapTransitionRequest('house')}
                onExitHouse={() => handleMapTransitionRequest('world')}
                onEnterSwamp={() => handleMapTransitionRequest('swamp')}
                onExitSwamp={() => handleMapTransitionRequest('world')}
                onEnterCave={() => handleMapTransitionRequest('caves')}
                onExitCave={() => handleMapTransitionRequest('world')}
                onSleepInBed={handleSleepInBed}
              />
              <div className="separator my-4 bg-white" style={{ height: '2px', opacity: '0.5' }}></div>
              <MovementControls 
                onUp={handleMoveUp} 
                onDown={handleMoveDown} 
                onLeft={handleMoveLeft} 
                onRight={handleMoveRight} 
              />
              <button onClick={handleBackToLobby} className="btn btn-info w-100 mt-4">Kembali ke Lobby</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;