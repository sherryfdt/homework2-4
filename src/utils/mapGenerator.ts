import { SeededRandom } from './seededRandom';
import type { CellType, Position, Gold } from '../types';

export interface MapGenerationResult {
  map: CellType[][];
  playerX: number;
  playerY: number;
  exitX: number;
  exitY: number;
  golds: Gold[];
}

/**
 * 計算周圍牆壁數量
 */
function countWalls(map: CellType[][], x: number, y: number, mapWidth: number, mapHeight: number): number {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= mapWidth || 
          ny < 0 || ny >= mapHeight || 
          map[ny]?.[nx] === 1) {
        count++;
      }
    }
  }
  return count;
}

/**
 * 使用細胞自動機生成地圖
 */
export function generateMap(
  seed: number | string,
  mapWidth: number = 50,
  mapHeight: number = 50
): MapGenerationResult {
  const rng = new SeededRandom(seed);
  rng.reset(); // 重置 RNG 以確保可重複性

  // 初始化地圖（隨機填充）
  let initialMap: CellType[][] = [];
  const fillProbability = 0.45;

  for (let y = 0; y < mapHeight; y++) {
    initialMap[y] = [];
    for (let x = 0; x < mapWidth; x++) {
      // 邊界設為牆壁
      if (x === 0 || x === mapWidth - 1 || 
          y === 0 || y === mapHeight - 1) {
        initialMap[y][x] = 1; // 牆壁
      } else {
        initialMap[y][x] = rng.random() < fillProbability ? 1 : 0;
      }
    }
  }

  // 細胞自動機迭代（平滑地圖）
  for (let iteration = 0; iteration < 5; iteration++) {
    const newMap: CellType[][] = [];
    for (let y = 0; y < mapHeight; y++) {
      newMap[y] = [];
      for (let x = 0; x < mapWidth; x++) {
        if (x === 0 || x === mapWidth - 1 || 
            y === 0 || y === mapHeight - 1) {
          newMap[y][x] = 1;
        } else {
          const wallCount = countWalls(initialMap, x, y, mapWidth, mapHeight);
          newMap[y][x] = wallCount >= 5 ? 1 : 0;
        }
      }
    }
    initialMap = newMap;
  }

  // 確保邊界封閉
  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      if (x === 0 || x === mapWidth - 1 || 
          y === 0 || y === mapHeight - 1) {
        initialMap[y][x] = 1;
      }
    }
  }

  // 找到一個地板位置作為玩家起始點
  let playerX = 0;
  let playerY = 0;
  let foundStart = false;
  for (let y = 1; y < mapHeight - 1 && !foundStart; y++) {
    for (let x = 1; x < mapWidth - 1 && !foundStart; x++) {
      if (initialMap[y][x] === 0) {
        playerX = x;
        playerY = y;
        foundStart = true;
      }
    }
  }

  // 找到距離起點最遠的角落作為出口
  let maxDistance = 0;
  let exitX = playerX;
  let exitY = playerY;
  const corners: Position[] = [
    {x: 1, y: 1},
    {x: mapWidth - 2, y: 1},
    {x: 1, y: mapHeight - 2},
    {x: mapWidth - 2, y: mapHeight - 2}
  ];

  for (const corner of corners) {
    if (initialMap[corner.y]?.[corner.x] === 0) {
      const distance = Math.abs(corner.x - playerX) + Math.abs(corner.y - playerY);
      if (distance > maxDistance) {
        maxDistance = distance;
        exitX = corner.x;
        exitY = corner.y;
      }
    }
  }

  // 如果角落都不行，找最遠的地板位置
  if (maxDistance === 0) {
    for (let y = 1; y < mapHeight - 1; y++) {
      for (let x = 1; x < mapWidth - 1; x++) {
        if (initialMap[y][x] === 0) {
          const distance = Math.abs(x - playerX) + Math.abs(y - playerY);
          if (distance > maxDistance) {
            maxDistance = distance;
            exitX = x;
            exitY = y;
          }
        }
      }
    }
  }

  // 生成3個黃金（在地板上隨機放置）
  const golds: Gold[] = [];
  const floorPositions: Position[] = [];
  for (let y = 1; y < mapHeight - 1; y++) {
    for (let x = 1; x < mapWidth - 1; x++) {
      if (initialMap[y][x] === 0 && 
          !(x === playerX && y === playerY) &&
          !(x === exitX && y === exitY)) {
        floorPositions.push({x, y});
      }
    }
  }

  // 隨機選擇3個位置放置黃金
  for (let i = 0; i < 3 && floorPositions.length > 0; i++) {
    const index = rng.randomInt(0, floorPositions.length - 1);
    const pos = floorPositions.splice(index, 1)[0];
    golds.push({x: pos.x, y: pos.y, collected: false});
  }

  return {
    map: initialMap,
    playerX,
    playerY,
    exitX,
    exitY,
    golds,
  };
}
