// src/pages/MainPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import InventoryPanel from '../mainPage/InventoryPanel';
import { ITEM_TYPES } from '../game/collisionData';
import playerCharacterSprite from '../game/assets/blue_mushroom_sheet_upscaled.png';

const GAME_SPEED = 5;
const SECONDS_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const SECONDS_PER_DAY = SECONDS_PER_HOUR * HOURS_PER_DAY;
const STAT_DECREASE_INTERVAL_SECONDS = 90;
const MAKAN_DECREMENT = 2;
const TIDUR_DECREMENT = 1;
const KESENANGAN_DECREMENT = 3;
const KEBERSIHAN_DECREMENT = 1;
// Konstanta untuk item makanan
const FOOD_RECOVERY = 5; // Jumlah status makan yang dipulihkan
const MAX_ITEM_STACK = 64; // Jumlah maksimum item per slot

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
  const location = useLocation();
  const [gameTime, setGameTime] = useState(0);
  const [day, setDay] = useState(1);
  const [playerName, setPlayerName] = useState('Player');
  const [stats, setStats] = useState(() => ({ ...DEFAULT_STATS }));
  const [currentMapKey, setCurrentMapKey] = useState('world');
  const [characterSpawnPosition, setCharacterSpawnPosition] = useState(() => mapDetails.world.initialPlayerPos);
  const [availableInteractionType, setAvailableInteractionType] = useState(0);
  const [isCharacterSleeping, setIsCharacterSleeping] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [inventory, setInventory] = useState([]);

  const gameTickIntervalRef = useRef(null);

  // Efek untuk inisialisasi state utama saat komponen pertama kali dimuat
  useEffect(() => {
    console.log("MainPage mounted. Initializing state to default values.");
    
    setGameTime(0);
    setDay(1);
    setStats({ ...DEFAULT_STATS });
    setCurrentMapKey('world');
    setCharacterSpawnPosition(mapDetails.world.initialPlayerPos);
    const nameFromLobby = location.state?.playerName || 'Player';
    setPlayerName(nameFromLobby);
    
    // Reset inventaris saat inisialisasi
    setInventory([]);

    setIsInitialized(true);
    console.log("Initialization complete.");

    // Fungsi cleanup untuk unmount total
    return () => {
        console.log("MainPage is UNMOUNTING. Interval will be cleared.");
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
    if (!gameTickIntervalRef.current) {
       console.log("Game tick interval starting.");
        gameTickIntervalRef.current = setInterval(() => {
          setGameTime(prevTime => prevTime + 1);
        }, 1000 / GAME_SPEED);
    }
  }, [isInitialized]);

  // Efek untuk update hari dan pengurangan stats berdasarkan gameTime
  useEffect(() => {
    if (!isInitialized || (gameTime === 0 && day === 1)) return;

    if (gameTime > 0) {
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
    }
  }, [gameTime, isCharacterSleeping, isInitialized, day]);

  // Efek untuk game over
  useEffect(() => {
    if (!isInitialized) return;
    if (playerName && (stats.makan <= 0 || stats.tidur <= 0 || stats.kesenangan <= 0 || stats.kebersihan <= 0)) {
      console.log("Game Over condition met.");
      navigate('/gameover');
    }
  }, [stats, playerName, navigate, isInitialized]);
  
  // Handler untuk transisi peta atau navigasi ke minigame
  const handleMapTransitionRequest = useCallback((targetKey, charPos = null) => {
    if (!isInitialized) {
      console.warn("Attempted map transition before initialization.");
      return;
    }
    console.log(`Map transition request to: ${targetKey}`);
    
    if (targetKey === 'minigame1_trigger') {
      console.log("Navigating to minigame. Game state will NOT be saved.");
      navigate('/minigame1');
    } else if (mapDetails[targetKey]) {
      let newSpawnPos = mapDetails[targetKey].initialPlayerPos;
      if (targetKey === 'world') {
        if (currentMapKey === 'house') newSpawnPos = mapDetails.world.entryPointFromHouse;
        else if (currentMapKey === 'swamp') newSpawnPos = mapDetails.world.entryPointFromSwamp;
        else if (currentMapKey === 'caves') newSpawnPos = mapDetails.world.entryPointFromCave;
      }
      
      setCurrentMapKey(targetKey);
      setCharacterSpawnPosition(newSpawnPos);
      setAvailableInteractionType(0);
      setIsCharacterSleeping(false);
    } else {
      console.error("Requested map key or trigger does not exist:", targetKey);
    }
  }, [currentMapKey, navigate, isInitialized]);

  // Handler untuk mengambil item dengan batas tumpukan
  const handleItemPickup = useCallback((itemType) => {
    if (!isInitialized) return;
    const itemInfo = ITEM_TYPES[itemType];
    if (!itemInfo) return;

    console.log(`Picking up item: ${itemInfo.name}`);
    setInventory(prevInventory => {
      const newInventory = [...prevInventory];
      const existingItemIndex = newInventory.findIndex(item => item.id === itemInfo.id);

      if (existingItemIndex > -1) {
        if (newInventory[existingItemIndex].quantity < MAX_ITEM_STACK) {
          newInventory[existingItemIndex].quantity += 1;
        } else {
          console.log("Tumpukan item sudah penuh!");
        }
      } else {
        if (newInventory.length < 4) { // Batasi 5 slot inventaris
          newInventory.push({ ...itemInfo, quantity: 1 });
        } else {
          console.log("Inventaris penuh!");
        }
      }
      return newInventory;
    });
  }, [isInitialized]);

  // Handler baru untuk menggunakan item dari inventaris
  const handleUseItem = useCallback((slotIndex) => {
    if (!isInitialized) return;

    const newInventory = [...inventory];
    const item = newInventory[slotIndex];

    if (!item) {
      console.log("Slot ini kosong.");
      return;
    }

    if (item.id === 'food1') {
      console.log(`Menggunakan ${item.name}`);
      
      // Pulihkan status makan
      setStats(prevStats => ({
        ...prevStats,
        makan: Math.min(100, prevStats.makan + FOOD_RECOVERY),
      }));

      // Kurangi jumlah item
      item.quantity -= 1;

      // Jika item habis, hapus dari inventaris
      if (item.quantity <= 0) {
        newInventory.splice(slotIndex, 1);
      }
      
      setInventory(newInventory);
    } else {
      console.log(`Item ${item.name} tidak bisa digunakan saat ini.`);
    }
  }, [inventory, isInitialized]);

  // Handler Aksi Pemain
  const handleMakan = () => {
    if (!isInitialized) return;
    if (stats.money >= 5) {
        setStats(prevStats => ({ 
            ...prevStats, 
            makan: Math.min(prevStats.makan + 20, 100), 
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
        makan: Math.max(0, prevStats.makan - 5),
        tidur: Math.max(0, prevStats.tidur - 5) 
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
  const handleBackToLobby = () => {
    if (!isInitialized) return;
    console.log("Kembali ke Lobby. Game state will NOT be saved.");
    navigate('/lobby');
  };

  // Callback dari GameCanvas tentang interaksi yang tersedia
  const handleInteractionAvailableFromCanvas = useCallback((type) => {
    if (!isInitialized) return;
    if (!isCharacterSleeping) {
      setAvailableInteractionType(type);
    }
  }, [isCharacterSleeping, isInitialized]);

  // Handler untuk tidur di kasur
  const handleSleepInBed = useCallback(() => {
    if (!isInitialized || isCharacterSleeping || availableInteractionType !== 99) return;
    console.log("Memulai tidur di kasur...");
    setIsCharacterSleeping(true);
    setAvailableInteractionType(0);
    setTimeout(() => {
      console.log("Bangun tidur...");
      const sleepDurationHours = 8;
      const sleepTimeAdvance = sleepDurationHours * SECONDS_PER_HOUR;
      setGameTime(prevTime => prevTime + sleepTimeAdvance);
      setStats(prevStats => ({
        ...prevStats,
        tidur: 100,
        makan: Math.max(0, prevStats.makan - 10),
      }));
      setIsCharacterSleeping(false);
    }, 3000);
  }, [isCharacterSleeping, availableInteractionType, isInitialized]);

  // Tampilan loading jika belum terinisialisasi
  if (!isInitialized || !mapDetails[currentMapKey]?.imageSrc) {
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
                  onItemPickup={handleItemPickup}
                />
              </div>
            </div>
            <div className="col-3 align-items-start flex-column p-4 action-panel img-fluid">
              <ActionPanel
                onMakan={handleMakan}
                onBermain={handleBermain}
                onTidur={handleQuickNap}
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
              
              <InventoryPanel inventory={inventory} onUseItem={handleUseItem} />

              <div className="separator my-4 bg-white" style={{ height: '2px', opacity: '0.5' }}></div>
              <MovementControls />
              <button onClick={handleBackToLobby} className="btn btn-info w-100 mt-4">Kembali ke Lobby</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;