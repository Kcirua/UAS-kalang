// src/pages/MainPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../style.css';
import GameCanvas from '../game/GameCanvas';
import mapBackground from '../assets/map/mainmap.png';
import homeMapBackground from '../assets/map/home.png';
import swampMapBackground from '../assets/map/rawa.png';
import cavesMapBackground from '../assets/map/caves.png';
import bathroomMapBackground from '../assets/map/bathroom.png';
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
const FOOD_RECOVERY = 5;
const MAX_ITEM_STACK = 64;
const mapDetails = {
  world: {
    imageSrc: mapBackground,
    initialPlayerPos: { x: 1600, y: 1500 },
    entryPointFromHouse: { x: 1600, y: 1500 },
    entryPointFromSwamp: { x: 400, y: 1850 },
    entryPointFromCave: { x: 3550, y: 540 },
    entryPointFromBathroom: { x: 300, y: 200 },
  },
  house: {
    imageSrc: homeMapBackground,
    initialPlayerPos: { x: 90, y: 490 },
  },
   swamp: {
    imageSrc: swampMapBackground,
    initialPlayerPos: { x: 955, 
    y: 550 },
  },
  caves: {
    imageSrc: cavesMapBackground,
    initialPlayerPos: { x: 700, y: 200 },
  },
  bathroom: {
    imageSrc: bathroomMapBackground,
    initialPlayerPos: { x: 285, y: 260 },
  },
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
  // State utama permainan
  const [gameTime, setGameTime] = useState(0);
  const [day, setDay] = useState(1);
  const [playerName, setPlayerName] = useState('Player');
  const [stats, setStats] = useState(() => ({ ...DEFAULT_STATS }));
  const [currentMapKey, setCurrentMapKey] = useState('world');
  const [characterSpawnPosition, setCharacterSpawnPosition] = useState(() => mapDetails.world.initialPlayerPos);
  const [availableInteractionType, setAvailableInteractionType] = useState(0);
  const [isCharacterSleeping, setIsCharacterSleeping] = useState(false);
  const [isCharacterEating, setIsCharacterEating] = useState(false);
  const [isCharacterBathing, setIsCharacterBathing] = useState(false);
  const [inventory, setInventory] = useState([]);
  // State untuk mengontrol alur permainan
  const [isReady, setIsReady] = useState(false);
  const gameTickIntervalRef = useRef(null);
  const characterPositionRef = useRef(characterSpawnPosition);

  // EFEK UTAMA: Menangani inisialisasi awal dan pemulihan state dari minigame
  useEffect(() => {
    // Cek jika kita kembali dari minigame dengan membawa state
    if (location.state?.fromMinigame && location.state?.previousGameState) {
      const { stats, gameTime, day, inventory, currentMapKey, characterPosition } = location.state.previousGameState;
      
      console.log("Kembali dari minigame. Memulihkan state:", location.state.previousGameState);

      // Pulihkan semua state
      setStats(stats);
      setGameTime(gameTime);
      setDay(day);
     
       setInventory(inventory);
      setCurrentMapKey(currentMapKey);
      setCharacterSpawnPosition(characterPosition);
      
      // Hapus state dari lokasi agar tidak terpakai lagi saat refresh halaman
      navigate(location.pathname, { replace: true, state: {} });
    } else {
       // Inisialisasi awal saat pertama kali masuk halaman
       const nameFromLobby = location.state?.playerName || 'Player';
       setPlayerName(nameFromLobby);
 }
    
    // Tandai bahwa game siap berjalan
    setIsReady(true);
  }, [location, navigate]);

  // EFEK: Menjalankan game loop (waktu dan penurunan stat)
  useEffect(() => {
    // Jangan jalankan apapun jika game belum siap
    if (!isReady) {
        if (gameTickIntervalRef.current) clearInterval(gameTickIntervalRef.current);
        gameTickIntervalRef.current = null;
        return;
    }

    // Mulai interval game tick
    gameTickIntervalRef.current = setInterval(() => {
      setGameTime(prevTime => {
        const newTime = prevTime 
 + 1;

        // Stat berkurang secara berkala
        if (newTime % STAT_DECREASE_INTERVAL_SECONDS === 0 && !isCharacterSleeping) {
          setStats(prevStats => ({
            ...prevStats,
            makan: Math.max(0, prevStats.makan - MAKAN_DECREMENT),
            tidur: Math.max(0, prevStats.tidur - TIDUR_DECREMENT),
            kesenangan: Math.max(0, prevStats.kesenangan 
 - KESENANGAN_DECREMENT),
            kebersihan: Math.max(0, prevStats.kebersihan - KEBERSIHAN_DECREMENT),
          }));
        }
        
        // Pergantian hari
        if (newTime > 0 && newTime % SECONDS_PER_DAY === 0) {
            setDay(prevDay => prevDay + 1);
 }

        return newTime;
      });
    }, 1000 / GAME_SPEED);
  // Fungsi cleanup untuk menghentikan interval saat komponen unmount
    return () => {
      if (gameTickIntervalRef.current) {
        clearInterval(gameTickIntervalRef.current);
 }
    };
  }, [isReady, isCharacterSleeping]);

  // EFEK: Cek kondisi game over
  useEffect(() => {
    if (!isReady) return;
    if (stats.makan <= 0 || stats.tidur <= 0 || stats.kesenangan <= 0 || stats.kebersihan <= 0) {
      console.log("Game Over condition met.");
      // Hapus state lokasi sebelum pindah halaman
      navigate('/gameover', { replace: true, state: {} });
    }
  }, [stats, isReady, navigate]);
  // HANDLER: Transisi antar peta atau masuk minigame
  const handleMapTransitionRequest = useCallback((targetKey, charPos = null) => {
    if (!isReady) {
      console.warn("Mencoba transisi peta sebelum game siap.");
      return;
    }
    
    const minigameTriggers = ['minigame1_trigger', 'minigame2_trigger', 'minigame3_trigger'];

    if (minigameTriggers.includes(targetKey)) {
        const minigameRoute = '/' + targetKey.replace('_trigger', '');
        
        // 1. Kemas state saat ini untuk 
        const gameStateToSave = {
            stats,
            gameTime,
            day,
            inventory,
            currentMapKey,
            characterPosition: charPos, // Simpan posisi karakter saat ini
        };

  
       console.log(`Navigasi ke ${minigameRoute}. Menyimpan state:`, gameStateToSave);
        
        // 2. Navigasi ke minigame dengan membawa state
        navigate(minigameRoute, { state: { previousGameState: gameStateToSave } });
    } else if (mapDetails[targetKey]) {
      // Logika transisi antar peta biasa
      let newSpawnPos = mapDetails[targetKey].initialPlayerPos;
      if (targetKey === 'world') {
        if (currentMapKey === 'house') newSpawnPos = mapDetails.world.entryPointFromHouse;
        else if (currentMapKey === 'swamp') newSpawnPos = mapDetails.world.entryPointFromSwamp;
        else if (currentMapKey === 'caves') newSpawnPos = mapDetails.world.entryPointFromCave;
        else if (currentMapKey === 'bathroom') newSpawnPos = mapDetails.world.entryPointFromBathroom;
      }
      setCurrentMapKey(targetKey);
      setCharacterSpawnPosition(newSpawnPos);
      setAvailableInteractionType(0);
      setIsCharacterSleeping(false);
      setIsCharacterEating(false);
      setIsCharacterBathing(false);
    } else {
      console.error("Kunci peta atau trigger tidak ada:", targetKey);
    }
  }, [isReady, currentMapKey, navigate, stats, gameTime, day, inventory]);
  // HANDLER: Mengambil item dari peta
  const handleItemPickup = useCallback((itemType) => {
    if (!isReady) return;
    const itemInfo = ITEM_TYPES[itemType];
    if (!itemInfo) return;

    console.log(`Mengambil item: ${itemInfo.name}`);
    setInventory(prevInventory => {
      const newInventory = [...prevInventory];
      const existingItemIndex = newInventory.findIndex(item => item.id === itemInfo.id);

      if (existingItemIndex > -1) {
        if (newInventory[existingItemIndex].quantity < MAX_ITEM_STACK) {
           newInventory[existingItemIndex].quantity += 
 1;
        } else {
          console.log("Tumpukan item sudah penuh!");
        }
      } else {
        if (newInventory.length < 4) { // Asumsi 4 slot inventaris
          newInventory.push({ ...itemInfo, quantity: 1 });
        } else {
          console.log("Inventaris penuh!");
        }
 
      }
      return newInventory;
    });
  }, [isReady]);
  // HANDLER: Menggunakan item dari inventaris
  const handleUseItem = useCallback((slotIndex) => {
    if (!isReady) return;

    const newInventory = [...inventory];
    const item = newInventory[slotIndex];

    if (!item) return;

    if (item.id === 'food1') {
      console.log(`Menggunakan ${item.name}`);
      
      setStats(prevStats => ({
        ...prevStats,
        makan: Math.min(100, prevStats.makan + FOOD_RECOVERY),
       }));

      
      item.quantity -= 1;

      if (item.quantity <= 0) {
        newInventory.splice(slotIndex, 1);
      }
      
      setInventory(newInventory);
    }
  }, [inventory, isReady]);
  // ... (Handler lainnya tetap sama: handleMakan, handleBermain, dll.)
  const handleMakan = () => {
    if (!isReady) return;
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
    if (!isReady) return;
    setStats(prevStats => ({ 
        ...prevStats, 
        kesenangan: Math.min(prevStats.kesenangan + 20, 100),
        makan: Math.max(0, prevStats.makan - 5),
        tidur: Math.max(0, prevStats.tidur - 5) 
    }));
  };

  const handleQuickNap = () => {
    if (!isReady) return;
    setStats(prevStats => ({ ...prevStats, tidur: Math.min(prevStats.tidur + 30, 100), kesenangan: Math.max(0, prevStats.kesenangan - 5) }));
  };
  const handleBersih = () => {
      if (!isReady) return;
      setStats(prevStats => ({ ...prevStats, kebersihan: Math.min(prevStats.kebersihan + 40, 100) }));
  };
  const handleBackToLobby = () => {
    if (!isReady) return;
    console.log("Kembali ke Lobby. Game state will NOT be saved.");
    navigate('/lobby', { replace: true, state: {} });
  };
  const handleInteractionAvailableFromCanvas = useCallback((type) => {
    if (!isReady) return;
    if (!isCharacterSleeping && !isCharacterEating && !isCharacterBathing) {
      setAvailableInteractionType(type);
    }
  },[isCharacterSleeping, isCharacterEating, isCharacterBathing, isReady]);
  const handleSleepInBed = useCallback(() => {
    if (!isReady || isCharacterSleeping || availableInteractionType !== 99) return;
    setIsCharacterSleeping(true);
    setAvailableInteractionType(0);
    setTimeout(() => {
      const sleepDurationHours = 8;
      const sleepTimeAdvance = sleepDurationHours * SECONDS_PER_HOUR;
      setGameTime(prevTime => prevTime + sleepTimeAdvance);
      setStats(prevStats => ({
        ...prevStats,
        tidur: 100,
        makan: Math.max(0, prevStats.makan - 10),
  
      }));
      setIsCharacterSleeping(false);
    }, 5000);
  }, [isCharacterSleeping, availableInteractionType, isReady]);
  const handleMakanInteraction = useCallback(() => {
    if (!isReady || isCharacterEating || availableInteractionType !== 98) return;
    setIsCharacterEating(true);
    setAvailableInteractionType(0);

    setTimeout(() => {
      setStats(prevStats => ({ ...prevStats, makan: Math.min(100, prevStats.makan + 30) }));
      setIsCharacterEating(false);
    }, 4000);
  }, [isCharacterEating, availableInteractionType, isReady]);
  const handleBersihInteraction = useCallback(() => {
    if (!isReady || isCharacterBathing || availableInteractionType !== 97) return;
    setIsCharacterBathing(true);
    setAvailableInteractionType(0);
    setTimeout(() => {
      setStats(prevStats => ({ ...prevStats, kebersihan: 100 }));
      setIsCharacterBathing(false);
    }, 4000);
  }, [isCharacterBathing, availableInteractionType, isReady]);
  // Tampilan loading jika game belum siap
  if (!isReady || !mapDetails[currentMapKey]?.imageSrc) {
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
              <div 
 className="ruangmainnya bg-white p-4 rounded shadow">
                <GameCanvas
                  mapImageSrc={mapDetails[currentMapKey].imageSrc}
                  characterImageSrc={playerCharacterSprite}
                  currentMapKey={currentMapKey}
                  initialCharacterPosition={characterSpawnPosition}
                  characterPositionRef={characterPositionRef}
                  onMapTransitionRequest={handleMapTransitionRequest}
                  onInteractionAvailable={handleInteractionAvailableFromCanvas}
                  isCharacterCurrentlySleeping={isCharacterSleeping}
                  onBedInteraction={handleSleepInBed}
                  onItemPickup={handleItemPickup}
                  
                  isCharacterCurrentlyEating={isCharacterEating}
                  onMakanInteraction={handleMakanInteraction}
                  isCharacterCurrentlyBathing={isCharacterBathing}
                  onBersihInteraction={handleBersihInteraction}
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
                onEnterBathroom={() => handleMapTransitionRequest('bathroom')}
                onExitBathroom={() => handleMapTransitionRequest('house')}
                onSleepInBed={handleSleepInBed}
                onMakanAtTable={handleMakanInteraction}
                onBathInBathroom={handleBersihInteraction}
                onEnterMinigame1={() => handleMapTransitionRequest('minigame1_trigger', characterPositionRef.current)}
                onEnterMinigame2={() => handleMapTransitionRequest('minigame2_trigger', characterPositionRef.current)}
                onEnterMinigame3={() => handleMapTransitionRequest('minigame3_trigger', characterPositionRef.current)}
                onPickupItem={() => handleItemPickup(availableInteractionType)} 
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