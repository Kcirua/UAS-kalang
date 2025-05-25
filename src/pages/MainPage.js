// src/pages/MainPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style.css'; // Style global [cite: 217]
import GameCanvas from '../game/GameCanvas';
import mapBackground from '../assets/map/mainmap.png'; // Sesuaikan path aset [cite: 217]
// Import komponen yang sudah dipisah
import PlayerStats from '../mainPage/Playerstats'; // [cite: 218]
import StatusBarGrid from '../mainPage/StatusBarGrid'; // [cite: 218]
import ActionPanel from '../mainPage/ActionPanel'; // [cite: 218]
import MovementControls from '../mainPage/MovementControls'; // [cite: 219]
import playerCharacterSprite from '../game/assets/blue_mushroom_sheet_upscaled.png'; // [cite: 219]

// Konstanta untuk game, bisa juga diletakkan di file konfigurasi
const GAME_SPEED = 5; // [cite: 220]
const SECONDS_PER_HOUR = 60; // [cite: 220]
const HOURS_PER_DAY = 24; // [cite: 220]
const SECONDS_PER_DAY = SECONDS_PER_HOUR * HOURS_PER_DAY; // [cite: 221]

// --- Konstanta BARU untuk pengurangan status ---
// Frekuensi status diperbarui (dalam detik waktu game)
const STAT_DECREASE_INTERVAL_SECONDS = 90; // Contoh: Kurangi status setiap 5 detik waktu game
// Jumlah poin status berkurang setiap interval
const MAKAN_DECREMENT = 2;         // Makan berkurang 2 poin
const TIDUR_DECREMENT = 1;         // Tidur berkurang 1 poin (lebih lambat)
const KESENANGAN_DECREMENT = 3;    // Kesenangan berkurang 3 poin (lebih cepat)
const KEBERSIHAN_DECREMENT = 1;    // Kebersihan berkurang 1 poin
// --- Akhir Konstanta BARU ---

function MainPage() {
  const [gameTime, setGameTime] = useState(0); // [cite: 221]
  const [day, setDay] = useState(1); // [cite: 221]
  const [playerName, setPlayerName] = useState('Player'); // [cite: 221]
  const [playerAvatar, setPlayerAvatar] = useState(''); // [cite: 222]
  const navigate = useNavigate();

  // State untuk status karakter
  const [stats, setStats] = useState({
    makan: 70,
    tidur: 95,
    kesenangan: 80,
    kebersihan: 85,
    money: 500, // Uang awal, bisa disesuaikan. Sebelumnya 0. [cite: 223]
  }); // [cite: 223]

  // State untuk mengontrol tampilan tombol (contoh)
  const [showTidurButton, setShowTidurButton] = useState(true); // [cite: 224]
  const [showBersihButton, setShowBersihButton] = useState(true); // [cite: 225]


  // Efek untuk mengambil data pemain dari localStorage dan inisialisasi game loop
  useEffect(() => {
    const storedName = localStorage.getItem('playerName');
    const storedAvatar = localStorage.getItem('playerAvatar');

    if (storedName) setPlayerName(storedName);
    if (storedAvatar) setPlayerAvatar(storedAvatar);
    else console.warn("Player avatar not found in localStorage.");

    const intervalId = setInterval(() => {
      setGameTime((prevTime) => prevTime + 1);
    }, 1000 / GAME_SPEED); // [cite: 226]

    return () => clearInterval(intervalId);
  }, []); // [cite: 226]

  // --- MODIFIKASI useEffect untuk update hari DAN mengurangi status berdasarkan gameTime ---
  useEffect(() => {
    if (gameTime > 0) {
      // Update hari
      if (gameTime % SECONDS_PER_DAY === 0) {
        setDay((prevDay) => prevDay + 1);
        // Di sini Anda bisa menambahkan logika pengurangan status harian yang lebih besar, dll.
        // Misalnya, jika pemain tidak tidur seharian, status tidur bisa berkurang drastis.
      }

      // Kurangi status secara berkala
      if (gameTime % STAT_DECREASE_INTERVAL_SECONDS === 0) {
        setStats(prevStats => ({
          ...prevStats,
          makan: Math.max(0, prevStats.makan - MAKAN_DECREMENT),
          tidur: Math.max(0, prevStats.tidur - TIDUR_DECREMENT),
          kesenangan: Math.max(0, prevStats.kesenangan - KESENANGAN_DECREMENT),
          kebersihan: Math.max(0, prevStats.kebersihan - KEBERSIHAN_DECREMENT),
          money: prevStats.money // Uang tidak berkurang otomatis di sini
        }));
      }
    }
  }, [gameTime]); // Dependensi tetap gameTime [cite: 227]
  // --- Akhir MODIFIKASI useEffect ---

  // --- useEffect BARU untuk memeriksa kondisi game over ---
  useEffect(() => {
    // Hanya periksa kondisi game over jika nama pemain sudah dimuat (artinya game sudah dimulai)
    // dan stats bukan nilai awal (meskipun nilai awal 100, ini untuk kehati-hatian).
    if (playerName && (stats.makan <= 0 && stats.tidur <= 0 && stats.kesenangan <= 0 && stats.kebersihan <= 0)) {
      console.log("Kondisi Game Over terpenuhi: Semua status nol atau kurang.");
      // Anda bisa menyimpan alasan game over jika perlu, misalnya:
      // localStorage.setItem('gameOverReason', 'Semua status habis');
      navigate('/gameover');
    }
  }, [stats, playerName, navigate]); // Tambahkan playerName sebagai dependensi
  // --- Akhir useEffect BARU ---

  // --- Event Handlers untuk Aksi ---
  const handleMakan = () => {
    console.log("Makan diklik"); // [cite: 228]
    if (stats.money >= 5) { // Cek apakah uang cukup
        setStats(prevStats => ({ 
            ...prevStats, 
            makan: Math.min(prevStats.makan + 20, 100), 
            money: prevStats.money - 5 
        })); // [cite: 228]
    } else {
        console.log("Uang tidak cukup untuk makan!");
        // Mungkin tampilkan pesan ke pemain
    }
  };

  const handleBermain = () => {
    console.log("Bermain diklik"); // [cite: 231]
    setStats(prevStats => ({ 
        ...prevStats, 
        kesenangan: Math.min(prevStats.kesenangan + 30, 100), 
        makan: Math.max(prevStats.makan - 10, 0) // Bermain membuat lapar
    })); // [cite: 231]
  };

  const handleTidur = () => {
    console.log("Tidur diklik"); // [cite: 233]
    setStats(prevStats => ({ 
        ...prevStats, 
        tidur: Math.min(prevStats.tidur + 50, 100) 
        // Pertimbangkan juga apakah tidur harus mengurangi status lain atau memajukan waktu game
    })); // [cite: 233]
  };

  const handleBersih = () => {
    console.log("Bersih-bersih diklik"); // [cite: 236]
    setStats(prevStats => ({ 
        ...prevStats, 
        kebersihan: Math.min(prevStats.kebersihan + 40, 100) 
    })); // [cite: 236]
  };

  const handleMoveUp = () => console.log("UI Gerak Atas diklik"); // [cite: 239]
  const handleMoveDown = () => console.log("UI Gerak Bawah diklik"); // [cite: 239]
  const handleMoveLeft = () => console.log("UI Gerak Kiri diklik"); // [cite: 240]
  const handleMoveRight = () => console.log("UI Gerak Kanan diklik"); // [cite: 240]

  const handleBackToLobby = () => {
    navigate('/lobby'); // [cite: 241]
  };

  // Tampilan loading jika avatar atau map belum siap
  if (!playerAvatar || !mapBackground) {
    return <div>Memuat aset karakter dan peta...</div>; // [cite: 242]
  }

  return (
    <div className="container-fluid p-0">
      <div className="semua">
        <div className="text-center">
          <div className="row game-panel">
            {/* Kolom Kiri: Info Player & Game Canvas */}
            <div className="col-9">
              <PlayerStats
                playerName={playerName} // [cite: 244]
                day={day} // [cite: 244]
                gameTime={gameTime} // [cite: 244]
                money={stats.money} // [cite: 244]
              />
              <StatusBarGrid stats={stats} /> {/* [cite: 244] */}
              <div className="ruangmainnya bg-white p-4 rounded shadow">
                <GameCanvas
                  mapImageSrc={mapBackground} // [cite: 245]
                  characterImageSrc={playerCharacterSprite} // [cite: 245]
                  // Anda bisa passing fungsi untuk update stats dari GameCanvas jika diperlukan
                  // Contoh: onAreaReached={(area) => console.log("Reached:", area)}
                />
              </div>
            </div>

            {/* Kolom Kanan: Aksi & Kontrol */}
            <div className="col-3 align-items-start flex-column p-4 action-panel img-fluid">
              <div className="p-2 mb-2 location-indicator" style={{ display: 'none' }}>At home</div> {/* [cite: 247] */}
              <ActionPanel
                onMakan={handleMakan} // [cite: 247]
                onBermain={handleBermain} // [cite: 247]
                onTidur={handleTidur} // [cite: 248]
                onBersih={handleBersih} // [cite: 248]
                showTidurButton={showTidurButton} // [cite: 248]
                showBersihButton={showBersihButton} // [cite: 248]
              />
              <div className="separator my-4 bg-white" style={{ height: '2px', opacity: '0.5' }}></div> {/* [cite: 248] */}
              <MovementControls
                onUp={handleMoveUp} // [cite: 249]
                onDown={handleMoveDown} // [cite: 249]
                onLeft={handleMoveLeft} // [cite: 249]
                onRight={handleMoveRight} // [cite: 249]
              />
              <button onClick={handleBackToLobby} className="btn btn-info w-100 mt-4">Kembali ke Lobby</button> {/* [cite: 250] */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;