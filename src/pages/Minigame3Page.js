// src/pages/Minigame3Page.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom'; // DIUBAH: Impor useLocation
import '../style.css'; // Main stylesheet contains minigame styles

const INITIAL_TIME = 30;
const ITEM_AMOUNT = 6;
const ITEM_TYPES = ['🦋', '🐝', '🐜', '🦗', '🦟'];

function Minigame3Page() {
  const location = useLocation(); // DIUBAH: Dapatkan objek lokasi
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);

  const basketRef = useRef(null);
  const itemsRef = useRef([]);
  const gameState = useRef({
    basketLeft: 344, // Initial position centered
    Ypos: [],
    Xpos: [],
    Speed: [],
    Step: [],
    Cstep: [],
    caught: [],
    fallTimeout: null,
    timerInterval: null,
  });
  const resetItem = useCallback((i) => {
    const state = gameState.current;
    state.caught[i] = false;
    const item = itemsRef.current[i];
    if (item) {
      item.style.display = 'block';
      item.style.transform = 'scale(1)';
      item.style.opacity = '1';
    }
    state.Ypos[i] = -50;
    state.Xpos[i] = Math.round(Math.random() * 700);
    state.Speed[i] = Math.random() * 3 + 2;
    state.Cstep[i] = 0;
    state.Step[i] = Math.random() * 0.1 + 0.05;
   }, []);

  const checkCollisions = useCallback(() => {
    const state = gameState.current;
    for (let i = 0; i < ITEM_AMOUNT; i++) {
      if (state.caught[i]) continue;
      
      const item = itemsRef.current[i];
      if (!item) continue;

      if (state.Ypos[i] >= 635 && state.Ypos[i] <= 670) {
        const itemLeft = state.Xpos[i];
        const basketRight = state.basketLeft + 64;
           
        if (itemLeft >= state.basketLeft - 10 && itemLeft <= basketRight + 10) {
          setScore(prev => prev + 10);
          state.caught[i] = true;
          
          item.style.transform = 'scale(1.5)';
          item.style.opacity = '0.5';
          setTimeout(() => {
             item.style.display = 'none';
          }, 100);
          
          setTimeout(() => resetItem(i), 500);
        }
      }
    }
  }, [resetItem]);
  const fall = useCallback(() => {
    if (!gameRunningRef.current) return;
    const state = gameState.current;

    for (let i = 0; i < ITEM_AMOUNT; i++) {
        if (state.caught[i]) continue;

        const sy = state.Speed[i] * Math.sin(90 * Math.PI / 180);
        const sx = state.Speed[i] * Math.cos(state.Cstep[i]) * 0.3;
        
        state.Ypos[i] += sy;
        state.Xpos[i] += sx;

        if (state.Ypos[i] > 720) {
            resetItem(i);
        } else {
            const item = itemsRef.current[i];
            if (item && item.style.display !== 'none') {
                item.style.left = Math.max(0, Math.min(700, state.Xpos[i])) + 'px';
                 item.style.top = state.Ypos[i] + 'px';
            }
        }
        state.Cstep[i] += state.Step[i];
    }
    
    checkCollisions();
    state.fallTimeout = setTimeout(fall, 30);
  }, [checkCollisions, resetItem]);
  const gameRunningRef = useRef(gameRunning);
  useEffect(() => {
    gameRunningRef.current = gameRunning;
    if (gameRunning) {
        fall();
    }
  }, [gameRunning, fall]);
  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    setIsGameOver(false);
    
    const state = gameState.current;
    state.basketLeft = 344;
    if(basketRef.current) basketRef.current.style.left = state.basketLeft + 'px';

    for (let i = 0; i < ITEM_AMOUNT; i++) {
        resetItem(i);
    }
    
    setGameRunning(true);

    state.timerInterval = setInterval(() => {
        setTimeLeft(prev => {
             if (prev <= 1) {
                clearInterval(state.timerInterval);
                setGameRunning(false);
                setIsGameOver(true);
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
  }, [resetItem]);
  useEffect(() => {
    const state = gameState.current;
    
    const keyListener = (e) => {
        if (!gameRunningRef.current) return;
        if (e.keyCode === 37 && state.basketLeft > 0) { // Left
            state.basketLeft -= 15;
        }
        if (e.keyCode === 39 && state.basketLeft < 760 - 64) { // Right
             state.basketLeft += 15;
        }
        if(basketRef.current) basketRef.current.style.left = state.basketLeft + 'px';
        checkCollisions();
    };

    document.addEventListener('keydown', keyListener);

    // Initial setup
    itemsRef.current = itemsRef.current.slice(0, ITEM_AMOUNT);
    for(let i=0; i<ITEM_AMOUNT; i++) {
        resetItem(i);
    }

    return () => {
        document.removeEventListener('keydown', keyListener);
         clearTimeout(state.fallTimeout);
        clearInterval(state.timerInterval);
    };
  }, [checkCollisions, resetItem]);
  return (
    <div className="minigame3-container">
      <div id="gameContainer">
        <div id="playingArea">
           {Array.from({ length: ITEM_AMOUNT }).map((_, i) => (
             <div 
                key={i} 
                ref={el => itemsRef.current[i] = el}
                 id={`si${i}`}
                className="fallingItem"
             >
                {ITEM_TYPES[i % ITEM_TYPES.length]}
             </div>
           ))}
        </div>
        <div ref={basketRef} id="basket"></div>
         <div id="scoreBoard">
          <div>Score: <span id="score">{score}</span></div>
          <div>Time: <span id="timeLeft">{timeLeft}</span>s</div>
        </div>
        <div id="instructions">
          Use ← → arrow keys to move the basket and catch the insects!
        </div>

        {isGameOver && (
          <div id="gameOver" style={{ display: 'block' }}>
            <h2>Game Over!</h2>
            <p>Final Score: <span id="finalScore">{score}</span></p>
            <button onClick={startGame}>Play Again</button>
            {/* DIUBAH: Tambahkan properti `state` ke Link */}
            <Link to="/main" state={{ ...location.state, fromMinigame: true }} className="btn btn-info w-50 mt-4" style={{display: 'block'}}>Exit to Main Game</Link>
          </div>
        )}
        
        {!gameRunning && !isGameOver && (
             <div id="gameOver" style={{ display: 'block' }}>
                <h2>Insect Catcher</h2>
                <button onClick={startGame}>Start Game</button>
                {/* DIUBAH: Tambahkan properti `state` ke Link */}
                <Link to="/main" state={{ ...location.state, fromMinigame: true }} className="btn btn-info w-50 mt-4" style={{display: 'block'}}>Exit to Main Game</Link>
            </div>
         )}
      </div>
    </div>
  );
}

export default Minigame3Page;