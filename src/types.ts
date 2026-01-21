// 遊戲狀態類型
export type GameState = 'waiting' | 'running' | 'paused' | 'won';

// 地圖單元類型：0 = 地板, 1 = 牆壁
export type CellType = 0 | 1;

// 位置類型
export interface Position {
  x: number;
  y: number;
}

// 黃金類型
export interface Gold {
  x: number;
  y: number;
  collected: boolean;
}

// 遊戲狀態接口
export interface GameStateData {
  seed: number | string | null;
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
  startTime: number | null;
  pausedTime: number;
  pauseStartTime: number | null;
  gameState: GameState;
  gameWon: boolean;
}
