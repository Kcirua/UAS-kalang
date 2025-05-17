// src/pages/MainPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style.css'; // Style global
import GameCanvas from '../game/GameCanvas';
import mapBackground from '../assets/map/mainmap.png'; // Sesuaikan path aset
// Import komponen yang sudah dipisah
import PlayerStats from '../mainPage/Playerstats';
import StatusBarGrid from '../mainPage/StatusBarGrid';
import ActionPanel from '../mainPage/ActionPanel';
import MovementControls from '../mainPage/MovementControls';
import { RenderClouds } from '../utils/uiUtils'; // Impor RenderClouds

// Konstanta untuk game, bisa juga diletakkan di file konfigurasi
const GAME_SPEED = 5;
const SECONDS_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const SECONDS_PER_DAY = SECONDS_PER_HOUR * HOURS_PER_DAY;

function MainPage() {
  const [gameTime, setGameTime] = useState(0);
  const [day, setDay] = useState(1);
  const [playerName, setPlayerName] = useState('Player');
  const [playerAvatar, setPlayerAvatar] = useState('');
  const navigate = useNavigate();

  // State untuk status karakter
  const [stats, setStats] = useState({
    makan: 100,
    tidur: 100,
    kesenangan: 100,
    kebersihan: 100,
    money: 0,
  });

  // State untuk mengontrol tampilan tombol (contoh)
  const [showTidurButton, setShowTidurButton] = useState(true); // Sesuaikan dengan logika game
  const [showBersihButton, setShowBersihButton] = useState(true); // Sesuaikan dengan logika game


  // Efek untuk mengambil data pemain dari localStorage dan inisialisasi game loop
  useEffect(() => {
    const storedName = localStorage.getItem('playerName');
    const storedAvatar = localStorage.getItem('playerAvatar');

    if (storedName) setPlayerName(storedName);
    if (storedAvatar) setPlayerAvatar(storedAvatar);
    else console.warn("Player avatar not found in localStorage.");

    const intervalId = setInterval(() => {
      setGameTime((prevTime) => prevTime + 1);
    }, 1000 / GAME_SPEED);

    return () => clearInterval(intervalId);
  }, []); // Dependency array kosong agar hanya berjalan sekali saat mount

  // Efek untuk update hari berdasarkan gameTime
  useEffect(() => {
    if (gameTime > 0 && gameTime % SECONDS_PER_DAY === 0) {
      setDay((prevDay) => prevDay + 1);
      // Di sini Anda bisa menambahkan logika pengurangan status harian, dll.
    }
  }, [gameTime]);

  // --- Event Handlers untuk Aksi ---
  // Implementasi handler ini akan mengubah state `stats`
  const handleMakan = () => {
    console.log("Makan clicked");
    setStats(prevStats => ({ ...prevStats, makan: Math.min(prevStats.makan + 20, 100), money: prevStats.money - 5 }));
    // Tambahkan logika lain jika ada (misalnya, cek uang cukup, dll)
  };

  const handleBermain = () => {
    console.log("Bermain clicked");
    setStats(prevStats => ({ ...prevStats, kesenangan: Math.min(prevStats.kesenangan + 30, 100), makan: Math.max(prevStats.makan - 10, 0) }));
  };

  const handleTidur = () => {
    console.log("Tidur clicked");
    setStats(prevStats => ({ ...prevStats, tidur: Math.min(prevStats.tidur + 50, 100) }));
    // Mungkin ada logika untuk skip waktu atau semacamnya
  };

  const handleBersih = () => {
    console.log("Bersih-bersih clicked");
    setStats(prevStats => ({ ...prevStats, kebersihan: Math.min(prevStats.kebersihan + 40, 100) }));
  };

  // Event handlers untuk tombol movement (jika ingin dihubungkan dari UI selain keyboard)
  // Saat ini GameCanvas.js menangani input keyboard.
  // Jika tombol ini ingin mengontrol karakter, perlu ada cara untuk GameCanvas "mendengarkan" event dari sini.
  const handleMoveUp = () => console.log("Move Up UI clicked");
  const handleMoveDown = () => console.log("Move Down UI clicked");
  const handleMoveLeft = () => console.log("Move Left UI clicked");
  const handleMoveRight = () => console.log("Move Right UI clicked");


  const handleBackToLobby = () => {
    navigate('/lobby');
  };

  // Tampilan loading jika avatar atau map belum siap
  if (!playerAvatar || !mapBackground) {
    return <div>Loading character and map assets...</div>;
  }

  return (
    <div className="container-fluid p-0">
      <RenderClouds /> {/* Menggunakan komponen RenderClouds */}
      <div className="semua">
        <div className="text-center">
          <div className="row game-panel">
            {/* Kolom Kiri: Info Player & Game Canvas */}
            <div className="col-9">
              <PlayerStats
                playerName={playerName}
                day={day}
                gameTime={gameTime}
                money={stats.money}
              />
              <StatusBarGrid stats={stats} />
              <div className="ruangmainnya bg-white p-4 rounded shadow">
                <GameCanvas
                  mapImageSrc={mapBackground}
                  characterImageSrc={playerAvatar}
                  // Anda bisa passing fungsi untuk update stats dari GameCanvas jika diperlukan
                  // Contoh: onAreaReached={(area) => console.log("Reached:", area)}
                />
              </div>
            </div>

            {/* Kolom Kanan: Aksi & Kontrol */}
            <div className="col-3 align-items-start flex-column p-4 action-panel img-fluid">
              {/* Indikator lokasi bisa menjadi state jika dinamis */}
              <div className="p-2 mb-2 location-indicator" style={{ display: 'none' }}>At home</div>
              <ActionPanel
                onMakan={handleMakan}
                onBermain={handleBermain}
                onTidur={handleTidur}
                onBersih={handleBersih}
                showTidurButton={showTidurButton} // Tergantung logika game
                showBersihButton={showBersihButton} // Tergantung logika game
              />
              <div className="separator my-4 bg-white" style={{ height: '2px', opacity: '0.5' }}></div>
              <MovementControls
                onUp={handleMoveUp}
                onDown={handleMoveDown}
                onLeft={handleMoveLeft}
                onRight={handleMoveRight}
              />
              <button onClick={handleBackToLobby} className="btn btn-info w-100 mt-4">Back to Lobby</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;