import { useEffect, useRef } from 'react';
import type { CellType, Position, Gold } from '../types';

interface GameCanvasProps {
  map: CellType[][] | null;
  mapWidth: number;
  mapHeight: number;
  playerX: number;
  playerY: number;
  exitX: number;
  exitY: number;
  golds: Gold[];
  collectedCount: number;
  fogOfWar: boolean;
  fogRadius: number;
  explored: Position[];
  onExploredUpdate: (newExplored: Position[]) => void;
  gameRunning: boolean;
  gamePaused: boolean;
  gameWon: boolean;
  tileSize: number;
}

export function GameCanvas({
  map,
  mapWidth,
  mapHeight,
  playerX,
  playerY,
  exitX,
  exitY,
  golds,
  collectedCount,
  fogOfWar,
  fogRadius,
  explored,
  onExploredUpdate,
  gameRunning,
  gamePaused,
  gameWon,
  tileSize,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // 檢查位置是否在戰爭迷霧範圍內（當前可見）
  const isVisible = (x: number, y: number): boolean => {
    if (!fogOfWar) return true;
    const distance = Math.abs(x - playerX) + Math.abs(y - playerY);
    return distance <= fogRadius;
  };

  // 檢查位置是否已探索過
  const isExplored = (x: number, y: number): boolean => {
    if (!fogOfWar) return true;
    return explored.some(pos => pos.x === x && pos.y === y);
  };

  // 更新已探索區域
  const updateExplored = (): void => {
    if (!fogOfWar || !map) return;

    const newExplored: Position[] = [...explored];
    let hasNew = false;

    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        if (isVisible(x, y)) {
          const exists = newExplored.some(pos => pos.x === x && pos.y === y);
          if (!exists) {
            newExplored.push({x, y});
            hasNew = true;
          }
        }
      }
    }

    if (hasNew) {
      onExploredUpdate(newExplored);
    }
  };

  // 繪製地圖
  const drawMap = (): void => {
    const canvas = canvasRef.current;
    if (!canvas || !map) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除畫布
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 更新已探索區域
    updateExplored();

    // 繪製地圖（帶戰爭迷霧）
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const screenX = x * tileSize;
        const screenY = y * tileSize;
        const visible = isVisible(x, y);
        const explored = isExplored(x, y);

        if (!explored) {
          // 未探索區域：完全黑色（戰爭迷霧）
          ctx.fillStyle = '#000000';
          ctx.fillRect(screenX, screenY, tileSize, tileSize);
          continue;
        }

        // 已探索但不在可見範圍內：變暗顯示
        const alpha = visible ? 1.0 : 0.3;

        if (map[y][x] === 1) {
          // 牆壁
          ctx.fillStyle = `rgba(15, 52, 96, ${alpha})`;
          ctx.fillRect(screenX, screenY, tileSize, tileSize);
          ctx.strokeStyle = `rgba(22, 33, 62, ${alpha})`;
          ctx.strokeRect(screenX, screenY, tileSize, tileSize);
        } else {
          // 地板
          ctx.fillStyle = `rgba(26, 26, 46, ${alpha})`;
          ctx.fillRect(screenX, screenY, tileSize, tileSize);
          ctx.strokeStyle = `rgba(15, 52, 96, ${alpha})`;
          ctx.strokeRect(screenX, screenY, tileSize, tileSize);
        }
      }
    }

    // 繪製黃金（只在可見範圍內）
    golds.forEach((gold) => {
      if (!gold.collected) {
        const visible = isVisible(gold.x, gold.y);
        const screenX = gold.x * tileSize;
        const screenY = gold.y * tileSize;
        const centerX = screenX + tileSize / 2;
        const centerY = screenY + tileSize / 2;

        if (visible) {
          // 在可見範圍內：閃爍的金黃色
          const time = Date.now() / 300;
          const alpha = 0.8 + Math.sin(time) * 0.2;

          // 繪製發光外圈
          ctx.shadowBlur = 25;
          ctx.shadowColor = '#ffd700';
          ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.6})`;
          ctx.beginPath();
          ctx.arc(centerX, centerY, tileSize / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // 繪製主體
          ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
          ctx.beginPath();
          ctx.arc(centerX, centerY, tileSize / 2.5, 0, Math.PI * 2);
          ctx.fill();

          // 繪製邊框
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 3;
          ctx.stroke();

          // 繪製高光
          ctx.fillStyle = `rgba(255, 255, 200, ${alpha * 0.6})`;
          ctx.beginPath();
          ctx.arc(centerX - tileSize / 10, centerY - tileSize / 10, tileSize / 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // 繪製出口
    const allCollected = collectedCount >= 3;
    const exitVisible = isVisible(exitX, exitY);

    if (exitVisible || allCollected) {
      const screenX = exitX * tileSize;
      const screenY = exitY * tileSize;
      const centerX = screenX + tileSize / 2;
      const centerY = screenY + tileSize / 2;

      if (allCollected) {
        // 出口開啟（藍色發光）
        if (exitVisible) {
          ctx.fillStyle = '#00d4ff';
          ctx.beginPath();
          ctx.arc(centerX, centerY, tileSize / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 4;
          ctx.stroke();

          // 強烈的發光效果
          ctx.shadowBlur = 30;
          ctx.shadowColor = '#00d4ff';
          ctx.fill();
          ctx.shadowBlur = 0;

          // 脈動效果
          const time = Date.now() / 500;
          const pulse = 1 + Math.sin(time) * 0.1;
          ctx.fillStyle = `rgba(0, 212, 255, ${0.3 + Math.sin(time) * 0.2})`;
          ctx.beginPath();
          ctx.arc(centerX, centerY, tileSize / 2 * pulse, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // 不在可見範圍內：顯示微弱的藍色提示
          ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
          ctx.beginPath();
          ctx.arc(centerX, centerY, tileSize / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      } else {
        // 出口關閉（灰色，只在可見範圍內顯示）
        if (exitVisible) {
          ctx.fillStyle = '#333333';
          ctx.beginPath();
          ctx.arc(centerX, centerY, tileSize / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#666666';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }

    // 繪製玩家
    const playerScreenX = playerX * tileSize;
    const playerScreenY = playerY * tileSize;
    ctx.fillStyle = '#00d4ff';
    ctx.beginPath();
    ctx.arc(
      playerScreenX + tileSize / 2,
      playerScreenY + tileSize / 2,
      tileSize / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 玩家發光效果
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00d4ff';
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  // 調整畫布大小
  const resizeCanvas = (): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const maxWidth = window.innerWidth - 320;
    const maxHeight = window.innerHeight - 40;

    const scaleX = maxWidth / (mapWidth * tileSize);
    const scaleY = maxHeight / (mapHeight * tileSize);
    const scale = Math.min(scaleX, scaleY, 1);

    canvas.width = mapWidth * tileSize;
    canvas.height = mapHeight * tileSize;
    canvas.style.width = (canvas.width * scale) + 'px';
    canvas.style.height = (canvas.height * scale) + 'px';

    drawMap();
  };

  // 動畫循環
  useEffect(() => {
    if (gameRunning && !gamePaused && !gameWon) {
      const animate = (): void => {
        drawMap();
        animationFrameIdRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      // 即使暫停也繪製一次
      if (map) {
        drawMap();
      }
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [gameRunning, gamePaused, gameWon, map, playerX, playerY, golds, collectedCount, explored]);

  // 初始化畫布大小
  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [mapWidth, mapHeight, tileSize]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        border: '2px solid #0f3460',
        background: '#16213e',
        boxShadow: '0 0 20px rgba(0, 150, 255, 0.3)',
      }}
    />
  );
}
