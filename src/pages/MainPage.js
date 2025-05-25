// src/pages/MainPage.js
import React, { useState, useEffect, useCallback } from 'react'; // Tambahkan useCallback
import { useNavigate } from 'react-router-dom';
import '../style.css'; //
import GameCanvas from '../game/GameCanvas';
import mapBackground from '../assets/map/mainmap.png'; //
import homeMapBackground from '../assets/map/home.png'; // <-- Aset peta rumah BARU
import PlayerStats from '../mainPage/Playerstats'; //
import StatusBarGrid from '../mainPage/StatusBarGrid'; //
import ActionPanel from '../mainPage/ActionPanel'; //
import MovementControls from '../mainPage/MovementControls'; //
import playerCharacterSprite from '../game/assets/blue_mushroom_sheet_upscaled.png'; //

// Konstanta game... (tidak berubah)
const GAME_SPEED = 5; //
const SECONDS_PER_HOUR = 60; //
const HOURS_PER_DAY = 24; //
const SECONDS_PER_DAY = SECONDS_PER_HOUR * HOURS_PER_DAY; //
const STAT_DECREASE_INTERVAL_SECONDS = 90; //
const MAKAN_DECREMENT = 2; //
const TIDUR_DECREMENT = 1;
const KESENANGAN_DECREMENT = 3; //
const KEBERSIHAN_DECREMENT = 1; //

// Objek untuk detail peta
const mapDetails = {
  world: {
    imageSrc: mapBackground,
    initialPlayerPos: { x: 1335, y: 1760 }, // Posisi awal di peta dunia
    entryPointFromHouse: { x: 1335, y: 1800 }, // Posisi saat keluar dari rumah (misalnya, di depan pintu)
  },
  house: {
    imageSrc: homeMapBackground,
    initialPlayerPos: { x: 230, y: 370 }, // Posisi awal di dalam rumah (misal, dekat pintu masuk dari dalam)
    // Tile pintu keluar di peta rumah akan menjadi tile tipe 2 juga
  }
};

function MainPage() {
  const [gameTime, setGameTime] = useState(0); //
  const [day, setDay] = useState(1); //
  const [playerName, setPlayerName] = useState('Player'); //
  const [playerAvatar, setPlayerAvatar] = useState(''); //
  const navigate = useNavigate(); //
  const [stats, setStats] = useState({
    makan: 100,
    tidur: 100,
    kesenangan: 100,
    kebersihan: 100,
    money: 50, //
  });
  const [showTidurButton, setShowTidurButton] = useState(true); //
  const [showBersihButton, setShowBersihButton] = useState(true); //

  // State untuk peta saat ini dan posisi spawn karakter
  const [currentMapKey, setCurrentMapKey] = useState('world');
  const [characterSpawnPosition, setCharacterSpawnPosition] = useState(mapDetails.world.initialPlayerPos);

  // Efek untuk mengambil data pemain... (tidak berubah signifikan, kecuali initial spawn)
  useEffect(() => {
    const storedName = localStorage.getItem('playerName');
    const storedAvatar = localStorage.getItem('playerAvatar');
    if (storedName) setPlayerName(storedName);
    if (storedAvatar) setPlayerAvatar(storedAvatar);
    else console.warn("Player avatar not found in localStorage.");

    // Set posisi spawn awal berdasarkan peta awal (world)
    setCharacterSpawnPosition(mapDetails.world.initialPlayerPos);

    const intervalId = setInterval(() => {
      setGameTime((prevTime) => prevTime + 1);
    }, 1000 / GAME_SPEED); //
    return () => clearInterval(intervalId); //
  }, []); //

  // useEffect untuk update hari dan pengurangan status... (tidak berubah)
  useEffect(() => {
    if (gameTime > 0) {
      if (gameTime % SECONDS_PER_DAY === 0) {
        setDay((prevDay) => prevDay + 1);
      }
      if (gameTime % STAT_DECREASE_INTERVAL_SECONDS === 0) {
        setStats(prevStats => ({
          ...prevStats,
          makan: Math.max(0, prevStats.makan - MAKAN_DECREMENT),
          tidur: Math.max(0, prevStats.tidur - TIDUR_DECREMENT),
          kesenangan: Math.max(0, prevStats.kesenangan - KESENANGAN_DECREMENT),
          kebersihan: Math.max(0, prevStats.kebersihan - KEBERSIHAN_DECREMENT), //
          money: prevStats.money
        }));
      }
    }
  }, [gameTime]); //

  // useEffect untuk game over... (tidak berubah)
  useEffect(() => {
    if (playerName && (stats.makan <= 0 && stats.tidur <= 0 && stats.kesenangan <= 0 && stats.kebersihan <= 0)) {
      navigate('/gameover');
    }
  }, [stats, playerName, navigate]);

  // Event Handlers untuk Aksi (handleMakan, handleBermain, dst.)... (tidak berubah)
  const handleMakan = () => { //
    if (stats.money >= 5) {
        setStats(prevStats => ({ 
            ...prevStats, 
            makan: Math.min(prevStats.makan + 20, 100), 
            money: prevStats.money - 5 
        })); //
    } else {
        console.log("Uang tidak cukup untuk makan!"); //
    }
  };
  const handleBermain = () => { //
    setStats(prevStats => ({ 
        ...prevStats, 
        kesenangan: Math.min(prevStats.kesenangan + 30, 100), 
        makan: Math.max(prevStats.makan - 10, 0)
    })); //
  };
  const handleTidur = () => { //
    setStats(prevStats => ({ ...prevStats, tidur: Math.min(prevStats.tidur + 50, 100) })); //
  };
  const handleBersih = () => { //
    setStats(prevStats => ({ ...prevStats, kebersihan: Math.min(prevStats.kebersihan + 40, 100) })); //
  };
  const handleMoveUp = () => console.log("UI Gerak Atas diklik"); //
  const handleMoveDown = () => console.log("UI Gerak Bawah diklik"); //
  const handleMoveLeft = () => console.log("UI Gerak Kiri diklik"); //
  const handleMoveRight = () => console.log("UI Gerak Kanan diklik"); //
  const handleBackToLobby = () => navigate('/lobby'); //


  // Fungsi untuk menangani permintaan transisi peta dari GameCanvas
  const handleMapTransitionRequest = useCallback((targetMapKey) => {
    if (mapDetails[targetMapKey]) {
      if (targetMapKey === 'world' && currentMapKey === 'house') {
        // Saat keluar dari rumah, gunakan entryPointFromHouse
        setCharacterSpawnPosition(mapDetails.world.entryPointFromHouse);
      } else {
        setCharacterSpawnPosition(mapDetails[targetMapKey].initialPlayerPos);
      }
      setCurrentMapKey(targetMapKey);
    } else {
      console.error("Requested map key does not exist:", targetMapKey);
    }
  }, [currentMapKey]); // Tambahkan currentMapKey sebagai dependensi

  if (!playerAvatar || !mapDetails[currentMapKey]?.imageSrc) { //
    return <div>Memuat aset karakter dan peta...</div>;
  }

  return (
    <div className="container-fluid p-0">
      <div className="semua">
        <div className="text-center">
          <div className="row game-panel">
            <div className="col-9">
              <PlayerStats
                playerName={playerName} //
                day={day} //
                gameTime={gameTime} //
                money={stats.money} //
              />
              <StatusBarGrid stats={stats} /> {/* */}
              <div className="ruangmainnya bg-white p-4 rounded shadow">
                <GameCanvas
                  mapImageSrc={mapDetails[currentMapKey].imageSrc} // Dinamis berdasarkan currentMapKey
                  characterImageSrc={playerCharacterSprite} //
                  currentMapKey={currentMapKey}
                  initialCharacterPosition={characterSpawnPosition}
                  onMapTransitionRequest={handleMapTransitionRequest} // Callback untuk transisi
                  // Kita akan butuh mapDetails di GameCanvas untuk logika interaksi pintu keluar rumah nanti
                  worldEntryFromHousePosition={mapDetails.world.entryPointFromHouse}
                />
              </div>
            </div>
            <div className="col-3 align-items-start flex-column p-4 action-panel img-fluid"> {/* */}
              <div className="p-2 mb-2 location-indicator" style={{ display: 'none' }}>At home</div> {/* */}
              <ActionPanel
                onMakan={handleMakan} //
                onBermain={handleBermain} //
                onTidur={handleTidur} //
                onBersih={handleBersih} //
                showTidurButton={showTidurButton} //
                showBersihButton={showBersihButton} //
              />
              <div className="separator my-4 bg-white" style={{ height: '2px', opacity: '0.5' }}></div> {/* */}
              <MovementControls
                onUp={handleMoveUp} //
                onDown={handleMoveDown} //
                onLeft={handleMoveLeft} //
                onRight={handleMoveRight} //
              /> {/* */}
              <button onClick={handleBackToLobby} className="btn btn-info w-100 mt-4">Kembali ke Lobby</button> {/* */}
            </div>
          </div>
        </div>
      </div>
    </div>
  ); //
}

export default MainPage;