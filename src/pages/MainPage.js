// src/pages/MainPage.js
import React, { useState, useEffect, useCallback } from 'react'; // [cite: 284]
import { useNavigate } from 'react-router-dom'; // [cite: 284]
import '../style.css'; // [cite: 285]
import GameCanvas from '../game/GameCanvas';
import mapBackground from '../assets/map/mainmap.png'; // [cite: 285]
import homeMapBackground from '../assets/map/home.png'; // [cite: 285]
import swampMapBackground from '../assets/map/rawa.png'; // [cite: 285]
import cavesMapBackground from '../assets/map/caves.png'; // [cite: 286]
import PlayerStats from '../mainPage/Playerstats'; // [cite: 286]
import StatusBarGrid from '../mainPage/StatusBarGrid'; // [cite: 286]
import ActionPanel from '../mainPage/ActionPanel'; // [cite: 287]
import MovementControls from '../mainPage/MovementControls'; // [cite: 287]
import playerCharacterSprite from '../game/assets/blue_mushroom_sheet_upscaled.png'; // [cite: 287]

const GAME_SPEED = 5; // [cite: 288]
const SECONDS_PER_HOUR = 60; // [cite: 288]
const HOURS_PER_DAY = 24; // [cite: 289]
const SECONDS_PER_DAY = SECONDS_PER_HOUR * HOURS_PER_DAY; // [cite: 289]
const STAT_DECREASE_INTERVAL_SECONDS = 90; // [cite: 289]
const MAKAN_DECREMENT = 2; // [cite: 290]
const TIDUR_DECREMENT = 1; // [cite: 290]
const KESENANGAN_DECREMENT = 3; // [cite: 290]
const KEBERSIHAN_DECREMENT = 1; // [cite: 290]

const mapDetails = { // [cite: 291]
  world: {
    imageSrc: mapBackground,
    initialPlayerPos: { x: 1335, y: 1760 }, // [cite: 291]
    entryPointFromHouse: { x: 1335, y: 1800 }, // [cite: 291]
    entryPointFromSwamp: { x: 140, y: 1850 }, // [cite: 291]
    entryPointFromCave: { x: 3450, y: 540 }, // [cite: 291]
  },
  house: {
    imageSrc: homeMapBackground,
    initialPlayerPos: { x: 230, y: 370 }, // [cite: 291]
  },
  swamp: { // [cite: 291]
    imageSrc: swampMapBackground,
    initialPlayerPos: { x: 955, y: 550 },
  },
  caves: { // [cite: 292]
    imageSrc: cavesMapBackground,
    initialPlayerPos: { x: 700, y: 200 },
  }
};

function MainPage() {
  const [gameTime, setGameTime] = useState(0); // [cite: 293]
  const [day, setDay] = useState(1); // [cite: 293]
  const [playerName, setPlayerName] = useState('Player'); // [cite: 294]
  const [playerAvatar, setPlayerAvatar] = useState(''); // [cite: 294]
  const navigate = useNavigate(); // [cite: 294]
  const [stats, setStats] = useState({ // [cite: 295]
    makan: 60,
    tidur: 80,
    kesenangan: 85,
    kebersihan: 70,
    money: 50,
  });
  // Tombol Tidur/Bersih di ActionPanel mungkin tidak relevan jika ada tempat tidur/kamar mandi
  // const [showTidurButton, setShowTidurButton] = useState(true); // [cite: 295]
  // const [showBersihButton, setShowBersihButton] = useState(true); // [cite: 296]

  const [currentMapKey, setCurrentMapKey] = useState('world'); // [cite: 297]
  const [characterSpawnPosition, setCharacterSpawnPosition] = useState(mapDetails.world.initialPlayerPos); // [cite: 297]
  
  const [availableInteractionType, setAvailableInteractionType] = useState(0); // [cite: 298]
  const [isCharacterSleeping, setIsCharacterSleeping] = useState(false); // BARU: State tidur

  // ... (useEffect untuk localStorage, game time, stat decrease, game over tetap sama) ...
  useEffect(() => { // [cite: 299]
    const storedName = localStorage.getItem('playerName');
    const storedAvatar = localStorage.getItem('playerAvatar');
    if (storedName) setPlayerName(storedName);
    if (storedAvatar) setPlayerAvatar(storedAvatar);
    else console.warn("Player avatar not found in localStorage.");
    setCharacterSpawnPosition(mapDetails.world.initialPlayerPos);
    const intervalId = setInterval(() => {
      setGameTime((prevTime) => prevTime + 1);
    }, 1000 / GAME_SPEED);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => { // [cite: 300]
    if (gameTime > 0) {
      if (gameTime % SECONDS_PER_DAY === 0) {
        setDay((prevDay) => prevDay + 1);
      }
      if (gameTime % STAT_DECREASE_INTERVAL_SECONDS === 0 && !isCharacterSleeping) { // Jangan kurangi stats saat tidur
        setStats(prevStats => ({
          ...prevStats,
          makan: Math.max(0, prevStats.makan - MAKAN_DECREMENT),
          tidur: Math.max(0, prevStats.tidur - TIDUR_DECREMENT), // [cite: 300]
          kesenangan: Math.max(0, prevStats.kesenangan - KESENANGAN_DECREMENT), // [cite: 301]
          kebersihan: Math.max(0, prevStats.kebersihan - KEBERSIHAN_DECREMENT),
          money: prevStats.money
        }));
      }
    }
  }, [gameTime, isCharacterSleeping]); // Tambahkan isCharacterSleeping

  useEffect(() => { // [cite: 302]
    if (playerName && (stats.makan <= 0 && stats.tidur <= 0 && stats.kesenangan <= 0 && stats.kebersihan <= 0)) {
      navigate('/gameover');
    }
  }, [stats, playerName, navigate]);

  const handleMakan = () => { /* ... (tetap sama) ... */ // [cite: 303]
    if (stats.money >= 5) {
        setStats(prevStats => ({ 
            ...prevStats, 
            makan: Math.min(prevStats.makan + 10, 100), 
            money: prevStats.money 
        }));
    } else {
        console.log("Uang tidak cukup untuk makan!"); // [cite: 304]
    }
  };
  const handleBermain = () => { /* ... (tetap sama) ... */ // [cite: 305]
    setStats(prevStats => ({ 
        ...prevStats, 
        kesenangan: Math.min(prevStats.kesenangan + 20, 100), 
        makan: Math.max(prevStats.makan - 10, 0)
    }));
  };

  // Fungsi handleTidur ini bisa untuk tombol Tidur cepat (jika masih ada)
  // Untuk tidur di kasur, kita akan buat fungsi baru.
  const handleQuickNap = () => { // [cite: 306]
    console.log("Melakukan tidur singkat...");
    setStats(prevStats => ({ ...prevStats, tidur: Math.min(prevStats.tidur + 20, 100), kesenangan: Math.max(0, prevStats.kesenangan - 5) }));
     // Mungkin ada sedikit pengurangan kesenangan karena tidur singkat di sembarang tempat
  };
  const handleBersih = () => { /* ... (tetap sama) ... */ // [cite: 307]
     setStats(prevStats => ({ ...prevStats, kebersihan: Math.min(prevStats.kebersihan + 40, 100) }));
  };

  const handleMoveUp = () => console.log("UI Gerak Atas diklik"); // [cite: 308]
  const handleMoveDown = () => console.log("UI Gerak Bawah diklik"); // [cite: 309]
  const handleMoveLeft = () => console.log("UI Gerak Kiri diklik"); // [cite: 310]
  const handleMoveRight = () => console.log("UI Gerak Kanan diklik"); // [cite: 311]
  const handleBackToLobby = () => navigate('/lobby'); // [cite: 312]

  const handleInteractionAvailableFromCanvas = useCallback((type) => { // [cite: 313]
    if (!isCharacterSleeping) { // Jangan update jika sedang tidur
      setAvailableInteractionType(type);
    }
  }, [isCharacterSleeping]);

  const handleMapTransitionRequest = useCallback((targetMapKey) => { // [cite: 314]
    if (mapDetails[targetMapKey]) {
      // ... (logika transisi peta tetap sama)
      if (targetMapKey === 'world') {
        if (currentMapKey === 'house') {
          setCharacterSpawnPosition(mapDetails.world.entryPointFromHouse); // [cite: 314]
        } else if (currentMapKey === 'swamp') {
          setCharacterSpawnPosition(mapDetails.world.entryPointFromSwamp || mapDetails.world.initialPlayerPos); // [cite: 314]
        } else if (currentMapKey === 'caves') {
          setCharacterSpawnPosition(mapDetails.world.entryPointFromCave || mapDetails.world.initialPlayerPos); // [cite: 314]
        } else {
           setCharacterSpawnPosition(mapDetails.world.initialPlayerPos);
        }
      } else if (targetMapKey === 'swamp' && currentMapKey === 'world') {
        setCharacterSpawnPosition(mapDetails.swamp.initialPlayerPos); // [cite: 315]
      } else if (targetMapKey === 'caves' && currentMapKey === 'world') {
        setCharacterSpawnPosition(mapDetails.caves.initialPlayerPos); // [cite: 315]
      } else {
        setCharacterSpawnPosition(mapDetails[targetMapKey].initialPlayerPos); // [cite: 316]
      }
      setCurrentMapKey(targetMapKey); // [cite: 317]
      setAvailableInteractionType(0);
      setIsCharacterSleeping(false); // Pastikan bangun saat pindah peta
    } else {
      console.error("Requested map key does not exist:", targetMapKey); // [cite: 318]
    }
  }, [currentMapKey]); // [cite: 319]

  // Handlers untuk ActionPanel
  const triggerEnterHouse = () => handleMapTransitionRequest('house'); // [cite: 319]
  const triggerExitHouse = () => handleMapTransitionRequest('world');
  const triggerEnterSwamp = () => handleMapTransitionRequest('swamp');
  const triggerExitSwamp = () => handleMapTransitionRequest('world');
  const triggerEnterCave = () => handleMapTransitionRequest('caves'); // [cite: 320]
  const triggerExitCave = () => handleMapTransitionRequest('world');

  // BARU: Handler untuk tidur di kasur
  const handleSleepInBed = useCallback(() => {
    if (isCharacterSleeping || availableInteractionType !== 99) return; // Jangan lakukan jika sudah tidur atau bukan di kasur

    console.log("Memulai tidur di kasur...");
    setIsCharacterSleeping(true);
    setAvailableInteractionType(0); // Sembunyikan tombol interaksi lain

    // Efek tidur: majukan waktu, pulihkan stats
    const sleepDurationHours = 8;
    const sleepDurationSeconds = sleepDurationHours * SECONDS_PER_HOUR;
    
    setGameTime(prevTime => prevTime + sleepDurationSeconds);
    setStats(prevStats => ({
      ...prevStats,
      tidur: 100, // Pulihkan tidur sepenuhnya
      makan: Math.max(0, prevStats.makan - 5), // Sedikit lapar setelah tidur lama
      // Tambahkan pemulihan stats lain jika diinginkan
    }));

    // Atur timeout untuk "bangun"
    setTimeout(() => {
      console.log("Bangun tidur...");
      setIsCharacterSleeping(false);
      // Panggil onInteractionAvailable lagi untuk mendeteksi ulang jika masih di atas kasur
      // Ini akan ditangani oleh GameCanvas secara otomatis saat karakterWorldPosition tidak berubah.
    }, 3000); // Durasi animasi tidur (misalnya 3 detik)

  }, [isCharacterSleeping, availableInteractionType, SECONDS_PER_HOUR]);


  if (!playerAvatar || !mapDetails[currentMapKey]?.imageSrc) { // [cite: 321]
    return <div>Memuat aset karakter dan peta...</div>;
  }

  return (
    <div className="container-fluid p-0"> {/* [cite: 322] */}
      <div className="semua">
        <div className="text-center">
          <div className="row game-panel">
            <div className="col-9">
              <PlayerStats playerName={playerName} day={day} gameTime={gameTime} money={stats.money} /> {/* [cite: 323] */}
              <StatusBarGrid stats={stats} /> {/* [cite: 324] */}
              <div className="ruangmainnya bg-white p-4 rounded shadow">
                <GameCanvas
                  mapImageSrc={mapDetails[currentMapKey].imageSrc} // [cite: 324]
                  characterImageSrc={playerCharacterSprite} // [cite: 325]
                  currentMapKey={currentMapKey} // [cite: 325]
                  initialCharacterPosition={characterSpawnPosition} // [cite: 325]
                  onMapTransitionRequest={handleMapTransitionRequest} // [cite: 325]
                  onInteractionAvailable={handleInteractionAvailableFromCanvas}
                  isCharacterCurrentlySleeping={isCharacterSleeping} // Prop BARU
                  onBedInteraction={handleSleepInBed} // Prop BARU untuk 'E' key di kasur
                />
              </div>
            </div>
            <div className="col-3 align-items-start flex-column p-4 action-panel img-fluid"> {/* [cite: 326] */}
              <ActionPanel
                // ... (props lainnya: onMakan, onBermain)
                onMakan={handleMakan} // [cite: 327]
                onBermain={handleBermain} // [cite: 327]
                onTidur={handleQuickNap} // Tombol Tidur umum sekarang memanggil handleQuickNap
                onBersih={handleBersih} // [cite: 327]
                showTidurButton={!isCharacterSleeping} // Sembunyikan tombol Tidur umum jika sedang tidur di kasur
                showBersihButton={true} // [cite: 328]
                currentMapKey={currentMapKey}
                availableInteractionType={availableInteractionType}
                onEnterHouse={triggerEnterHouse} // [cite: 328]
                onExitHouse={triggerExitHouse}
                onEnterSwamp={triggerEnterSwamp}
                onExitSwamp={triggerExitSwamp}
                onEnterCave={triggerEnterCave}
                onExitCave={triggerExitCave}
                onSleepInBed={handleSleepInBed} // Prop BARU
              />
              <div className="separator my-4 bg-white" style={{ height: '2px', opacity: '0.5' }}></div> {/* [cite: 329] */}
              <MovementControls onUp={handleMoveUp} onDown={handleMoveDown} onLeft={handleMoveLeft} onRight={handleMoveRight} /> {/* [cite: 330] */}
              <button onClick={handleBackToLobby} className="btn btn-info w-100 mt-4">Kembali ke Lobby</button> {/* [cite: 330] */}
            </div>
          </div>
        </div>
      </div>
    </div> // [cite: 331]
  );
}

export default MainPage;