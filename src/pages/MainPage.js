// src/pages/MainPage.js
import React, { useState, useEffect, useCallback } from 'react'; // [cite: 240]
import { useNavigate } from 'react-router-dom'; // [cite: 240]
import '../style.css';
import GameCanvas from '../game/GameCanvas';
import mapBackground from '../assets/map/mainmap.png'; // [cite: 241]
import homeMapBackground from '../assets/map/home.png'; // [cite: 241]
import swampMapBackground from '../assets/map/rawa.png'; // <-- Aset peta rawa BARU (buat file ini)
import PlayerStats from '../mainPage/Playerstats'; // [cite: 242]
import StatusBarGrid from '../mainPage/StatusBarGrid'; // [cite: 242]
import ActionPanel from '../mainPage/ActionPanel'; // [cite: 242]
import MovementControls from '../mainPage/MovementControls'; // [cite: 242]
import playerCharacterSprite from '../game/assets/blue_mushroom_sheet_upscaled.png'; // [cite: 242]

const GAME_SPEED = 5; // [cite: 243]
const SECONDS_PER_HOUR = 60; // [cite: 243]
const HOURS_PER_DAY = 24; // [cite: 243]
const SECONDS_PER_DAY = SECONDS_PER_HOUR * HOURS_PER_DAY; // [cite: 243]
const STAT_DECREASE_INTERVAL_SECONDS = 90; // [cite: 244]
const MAKAN_DECREMENT = 2; // [cite: 244]
const TIDUR_DECREMENT = 1; // [cite: 245]
const KESENANGAN_DECREMENT = 3; // [cite: 245]
const KEBERSIHAN_DECREMENT = 1; // [cite: 245]

const mapDetails = {
  world: {
    imageSrc: mapBackground,
    initialPlayerPos: { x: 1335, y: 1760 }, // [cite: 246]
    entryPointFromHouse: { x: 1335, y: 1800 }, // [cite: 246]
    entryPointFromSwamp: { x: 140, y: 1850 }, // Posisi saat keluar dari rawa (misalnya, di depan pintu masuk rawa di dunia)
  },
  house: {
    imageSrc: homeMapBackground,
    initialPlayerPos: { x: 230, y: 370 }, // [cite: 246]
  },
  // TAMBAHKAN DETAIL PETA RAWA
  swamp: {
    imageSrc: swampMapBackground, // Ganti dengan path ke gambar peta rawa Anda
    initialPlayerPos: { x: 955, y: 550 }, // Posisi awal di dalam rawa
    // entryPointToWorld: { x: ..., y: ...} // Jika perlu posisi keluar spesifik dari rawa
  }
};

function MainPage() {
  const [gameTime, setGameTime] = useState(0); // [cite: 247]
  const [day, setDay] = useState(1); // [cite: 247]
  const [playerName, setPlayerName] = useState('Player'); // [cite: 247]
  const [playerAvatar, setPlayerAvatar] = useState(''); // [cite: 248]
  const navigate = useNavigate(); // [cite: 248]
  const [stats, setStats] = useState({ // [cite: 249]
    makan: 100,
    tidur: 100,
    kesenangan: 100,
    kebersihan: 100,
    money: 50,
  });
  const [showTidurButton, setShowTidurButton] = useState(true); // [cite: 250]
  const [showBersihButton, setShowBersihButton] = useState(true); // [cite: 250]

  const [currentMapKey, setCurrentMapKey] = useState('world'); // [cite: 251]
  const [characterSpawnPosition, setCharacterSpawnPosition] = useState(mapDetails.world.initialPlayerPos); // [cite: 251]

  useEffect(() => {
    const storedName = localStorage.getItem('playerName'); // [cite: 252]
    const storedAvatar = localStorage.getItem('playerAvatar'); // [cite: 252]
    if (storedName) setPlayerName(storedName); // [cite: 252]
    if (storedAvatar) setPlayerAvatar(storedAvatar); // [cite: 252]
    else console.warn("Player avatar not found in localStorage.");

    setCharacterSpawnPosition(mapDetails.world.initialPlayerPos); // [cite: 252]

    const intervalId = setInterval(() => {
      setGameTime((prevTime) => prevTime + 1);
    }, 1000 / GAME_SPEED); // [cite: 252]
    return () => clearInterval(intervalId); // [cite: 252]
  }, []);

  useEffect(() => { // [cite: 254]
    if (gameTime > 0) {
      if (gameTime % SECONDS_PER_DAY === 0) {
        setDay((prevDay) => prevDay + 1);
      }
      if (gameTime % STAT_DECREASE_INTERVAL_SECONDS === 0) {
        setStats(prevStats => ({
          ...prevStats,
          makan: Math.max(0, prevStats.makan - MAKAN_DECREMENT),
          tidur: Math.max(0, prevStats.tidur - TIDUR_DECREMENT), // [cite: 254]
          kesenangan: Math.max(0, prevStats.kesenangan - KESENANGAN_DECREMENT), // [cite: 254]
          kebersihan: Math.max(0, prevStats.kebersihan - KEBERSIHAN_DECREMENT),
          money: prevStats.money
        }));
      }
    }
  }, [gameTime]);

  useEffect(() => { // [cite: 256]
    if (playerName && (stats.makan <= 0 && stats.tidur <= 0 && stats.kesenangan <= 0 && stats.kebersihan <= 0)) {
      navigate('/gameover');
    }
  }, [stats, playerName, navigate]);

  const handleMakan = () => { // [cite: 257]
    if (stats.money >= 5) {
        setStats(prevStats => ({ 
            ...prevStats, 
            makan: Math.min(prevStats.makan + 20, 100), 
            money: prevStats.money - 5 
        }));
    } else {
        console.log("Uang tidak cukup untuk makan!"); // [cite: 258]
    }
  };
  const handleBermain = () => { // [cite: 259]
    setStats(prevStats => ({ 
        ...prevStats, 
        kesenangan: Math.min(prevStats.kesenangan + 30, 100), 
        makan: Math.max(prevStats.makan - 10, 0)
    }));
  };
  const handleTidur = () => { // [cite: 260]
    setStats(prevStats => ({ ...prevStats, tidur: Math.min(prevStats.tidur + 50, 100) }));
  };
  const handleBersih = () => { // [cite: 261]
    setStats(prevStats => ({ ...prevStats, kebersihan: Math.min(prevStats.kebersihan + 40, 100) }));
  };
  const handleMoveUp = () => console.log("UI Gerak Atas diklik"); // [cite: 262]
  const handleMoveDown = () => console.log("UI Gerak Bawah diklik"); // [cite: 263]
  const handleMoveLeft = () => console.log("UI Gerak Kiri diklik"); // [cite: 264]
  const handleMoveRight = () => console.log("UI Gerak Kanan diklik"); // [cite: 264]
  const handleBackToLobby = () => navigate('/lobby'); // [cite: 265]


  const handleMapTransitionRequest = useCallback((targetMapKey) => {
    if (mapDetails[targetMapKey]) {
      if (targetMapKey === 'world') {
        if (currentMapKey === 'house') {
          setCharacterSpawnPosition(mapDetails.world.entryPointFromHouse); // [cite: 266]
        } else if (currentMapKey === 'swamp') {
          // Saat keluar dari rawa, gunakan entryPointFromSwamp jika ada, atau default world
          setCharacterSpawnPosition(mapDetails.world.entryPointFromSwamp || mapDetails.world.initialPlayerPos);
        } else {
           setCharacterSpawnPosition(mapDetails.world.initialPlayerPos);
        }
      } else if (targetMapKey === 'swamp' && currentMapKey === 'world') {
        setCharacterSpawnPosition(mapDetails.swamp.initialPlayerPos);
      } else {
        setCharacterSpawnPosition(mapDetails[targetMapKey].initialPlayerPos); // [cite: 266]
      }
      setCurrentMapKey(targetMapKey); // [cite: 266]
    } else {
      console.error("Requested map key does not exist:", targetMapKey); // [cite: 266]
    }
  }, [currentMapKey]); // [cite: 267]

  if (!playerAvatar || !mapDetails[currentMapKey]?.imageSrc) { // [cite: 268]
    return <div>Memuat aset karakter dan peta...</div>;
  }

  return (
    <div className="container-fluid p-0"> {/* [cite: 269] */}
      <div className="semua">
        <div className="text-center">
          <div className="row game-panel">
            <div className="col-9">
              <PlayerStats
                playerName={playerName}
                day={day}
                gameTime={gameTime} // [cite: 269]
                money={stats.money}
              />
              <StatusBarGrid stats={stats} /> {/* [cite: 270] */}
              <div className="ruangmainnya bg-white p-4 rounded shadow">
                <GameCanvas
                  mapImageSrc={mapDetails[currentMapKey].imageSrc} // [cite: 270]
                  characterImageSrc={playerCharacterSprite}
                  currentMapKey={currentMapKey} // [cite: 271]
                  initialCharacterPosition={characterSpawnPosition} // [cite: 271]
                  onMapTransitionRequest={handleMapTransitionRequest} // [cite: 271]
                  worldEntryFromHousePosition={mapDetails.world.entryPointFromHouse} // [cite: 271]
                  // worldEntryFromSwampPosition={mapDetails.world.entryPointFromSwamp} // Opsional
                />
              </div>
            </div>
            <div className="col-3 align-items-start flex-column p-4 action-panel img-fluid"> {/* [cite: 272] */}
              <div className="p-2 mb-2 location-indicator" style={{ display: 'none' }}>At home</div>
              <ActionPanel
                onMakan={handleMakan}
                onBermain={handleBermain} // [cite: 273]
                onTidur={handleTidur}
                onBersih={handleBersih} // [cite: 273]
                showTidurButton={showTidurButton}
                showBersihButton={showBersihButton} // [cite: 273]
              />
              <div className="separator my-4 bg-white" style={{ height: '2px', opacity: '0.5' }}></div> {/* [cite: 274] */}
              <MovementControls
                onUp={handleMoveUp}
                onDown={handleMoveDown} // [cite: 274]
                onLeft={handleMoveLeft}
                onRight={handleMoveRight} // [cite: 274]
              />
              <button onClick={handleBackToLobby} className="btn btn-info w-100 mt-4">Kembali ke Lobby</button> {/* [cite: 275] */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;