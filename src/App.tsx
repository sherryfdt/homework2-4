import { useState, useEffect, useCallback, useRef } from 'react';
import { generateMap } from './utils/mapGenerator';
import type { GameState, CellType, Position, Gold } from './types';
import { GameCanvas } from './components/GameCanvas';
import { GameControls } from './components/GameControls';
import { GameInfo } from './components/GameInfo';
import { GameInstructions } from './components/GameInstructions';
import { WinScreen } from './components/WinScreen';
import './App.css';

function App() {
  const [seed, setSeed] = useState<number | string | null>(null);
  const [map, setMap] = useState<CellType[][] | null>(null);
  const [mapWidth] = useState<number>(50);
  const [mapHeight] = useState<number>(50);
  const [playerX, setPlayerX] = useState<number>(0);
  const [playerY, setPlayerY] = useState<number>(0);
  const [exitX, setExitX] = useState<number>(0);
  const [exitY, setExitY] = useState<number>(0);
  const [golds, setGolds] = useState<Gold[]>([]);
  const [collectedCount, setCollectedCount] = useState<number>(0);
  const [fogOfWar] = useState<boolean>(true);
  const [fogRadius] = useState<number>(5);
  const [explored, setExplored] = useState<Position[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState<number>(0);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [gameTimer, setGameTimer] = useState<string>('00:00');
  const [winTime, setWinTime] = useState<string>('00:00');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const timerIntervalRef = useRef<number | null>(null);
  const goldsRef = useRef<Gold[]>([]);
  const collectedCountRef = useRef<number>(0);

  const tileSize = 12;

  // 同步 ref 和 state
  useEffect(() => {
    goldsRef.current = golds;
  }, [golds]);

  useEffect(() => {
    collectedCountRef.current = collectedCount;
  }, [collectedCount]);

  // 從 URL 讀取種子
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlSeed = urlParams.get('seed');
    
    if (urlSeed) {
      const numSeed = parseInt(urlSeed);
      setSeed(isNaN(numSeed) ? urlSeed : numSeed);
    } else {
      setSeed(Date.now());
    } // Test Git
  }, []);

  // 生成地圖
  const handleGenerateMap = useCallback(() => {
    if (seed === null) {
      const newSeed = Date.now();
      setSeed(newSeed);
      return;
    }

    const result = generateMap(seed, mapWidth, mapHeight);
    setMap(result.map);
    setPlayerX(result.playerX);
    setPlayerY(result.playerY);
    setExitX(result.exitX);
    setExitY(result.exitY);
    setGolds(result.golds);
    setCollectedCount(0);
    // 重置 ref
    goldsRef.current = result.golds;
    collectedCountRef.current = 0;
    setExplored([]);
    setGameWon(false);
    setGameState('running');
    setStartTime(Date.now());
    setPausedTime(0);
    setPauseStartTime(null);
  }, [seed, mapWidth, mapHeight]);

  // 當種子改變時自動生成地圖
  useEffect(() => {
    if (seed !== null) {
      handleGenerateMap();
    }
  }, [seed, handleGenerateMap]);

  // 檢查通關
  const checkWin = useCallback(() => {
    if (playerX === exitX && playerY === exitY && collectedCount >= 3) {
      setGameWon(true);
      setGameState('won');
      
      if (startTime) {
        const totalElapsed = Date.now() - startTime;
        const actualElapsed = totalElapsed - pausedTime;
        const elapsed = Math.floor(actualElapsed / 1000);
        setElapsedSeconds(elapsed);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        setWinTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }
  }, [playerX, playerY, exitX, exitY, collectedCount, startTime, pausedTime]);

  // 移動玩家
  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameState !== 'running' || gameWon || gameState === 'paused' || !map) return;

    const newX = playerX + dx;
    const newY = playerY + dy;

    if (newX >= 0 && newX < mapWidth &&
        newY >= 0 && newY < mapHeight &&
        map[newY]?.[newX] === 0) {
      setPlayerX(newX);
      setPlayerY(newY);
    }
  }, [gameState, gameWon, map, playerX, playerY, mapWidth, mapHeight]);

  // 鍵盤控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePlayer(1, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  // 檢查黃金和通關（當玩家位置改變時）
  useEffect(() => {
    if (gameState === 'running' && !gameWon && map) {
      // 使用 ref 來訪問最新的 golds，避免依賴項問題
      const currentGolds = goldsRef.current;
      const goldAtPosition = currentGolds.find(
        gold => !gold.collected && gold.x === playerX && gold.y === playerY
      );
      
      if (goldAtPosition) {
        // 更新黃金狀態
        setGolds(prevGolds =>
          prevGolds.map(gold =>
            gold.x === playerX && gold.y === playerY && !gold.collected
              ? { ...gold, collected: true }
              : gold
          )
        );
        // 更新收集計數（使用 ref 確保不會重複計數）
        const currentCount = collectedCountRef.current;
        setCollectedCount(currentCount + 1);
      }
      
      // 檢查通關
      checkWin();
    }
  }, [playerX, playerY, gameState, gameWon, map, checkWin]);

  // 計時器
  useEffect(() => {
    if (gameState === 'running' && startTime && !gameWon) {
      const updateTimer = () => {
        if (gameState === 'paused') return;
        
        const totalElapsed = Date.now() - startTime;
        const actualElapsed = totalElapsed - pausedTime;
        const elapsed = Math.floor(actualElapsed / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        setGameTimer(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      };

      timerIntervalRef.current = window.setInterval(updateTimer, 100);
      updateTimer();

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [gameState, startTime, pausedTime, gameWon]);

  // 暫停/繼續
  const handlePause = useCallback(() => {
    if (gameState === 'running' && !gameWon) {
      // 暫停遊戲
      setPauseStartTime(Date.now());
      setGameState('paused');
    } else if (gameState === 'paused' && !gameWon) {
      // 繼續遊戲
      if (pauseStartTime) {
        const pauseDuration = Date.now() - pauseStartTime;
        setPausedTime(prev => prev + pauseDuration);
        setPauseStartTime(null);
      }
      setGameState('running');
    }
  }, [gameState, gameWon, pauseStartTime]);

  // 重新遊戲
  const handleRestart = useCallback(() => {
    setGameState('running');
    setGameWon(false);
    setPausedTime(0);
    setPauseStartTime(null);
    setExplored([]);
    handleGenerateMap();
  }, [handleGenerateMap]);

  // 隨機種子
  const handleRandomSeed = useCallback(() => {
    const randomSeed = Math.floor(Math.random() * 1000000);
    setSeed(randomSeed);
  }, []);

  // 複製種子網址
  const handleCopySeedUrl = useCallback(() => {
    if (seed === null) return;
    
    const url = new URL(window.location.href);
    url.searchParams.set('seed', seed.toString());
    const urlString = url.toString();
    
    navigator.clipboard.writeText(urlString).then(() => {
      // 可以顯示成功訊息
    }).catch(() => {
      // 備用方案
      const textArea = document.createElement('textarea');
      textArea.value = urlString;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
  }, [seed]);

  // 再玩一次
  const handlePlayAgain = useCallback(() => {
    const newSeed = Date.now();
    setSeed(newSeed);
    setGameWon(false);
    setGameState('running');
  }, []);

  // 結束遊戲
  const handleEndGame = useCallback(() => {
    setGameWon(false);
    setGameState('waiting');
  }, []);

  return (
    <div className="app">
      <div className="game-container">
        <GameInstructions />
        <GameCanvas
          map={map}
          mapWidth={mapWidth}
          mapHeight={mapHeight}
          playerX={playerX}
          playerY={playerY}
          exitX={exitX}
          exitY={exitY}
          golds={golds}
          collectedCount={collectedCount}
          fogOfWar={fogOfWar}
          fogRadius={fogRadius}
          explored={explored}
          onExploredUpdate={setExplored}
          gameRunning={gameState === 'running'}
          gamePaused={gameState === 'paused'}
          gameWon={gameWon}
          tileSize={tileSize}
        />
        <GameControls
          seed={seed}
          onSeedChange={setSeed}
          onGenerateMap={handleGenerateMap}
          onRandomSeed={handleRandomSeed}
          onCopySeedUrl={handleCopySeedUrl}
          onPause={handlePause}
          onRestart={handleRestart}
          gameRunning={gameState === 'running'}
          gamePaused={gameState === 'paused'}
          gameTimer={gameTimer}
          goldCount={collectedCount}
        />
        <GameInfo
          currentSeed={seed}
          mapWidth={mapWidth}
          mapHeight={mapHeight}
        />
      </div>
      {gameWon && (
        <WinScreen
          winTime={winTime}
          elapsedSeconds={elapsedSeconds}
          onPlayAgain={handlePlayAgain}
          onEndGame={handleEndGame}
        />
      )}
    </div>
  );
}

export default App;
