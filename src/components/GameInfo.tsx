interface GameInfoProps {
  currentSeed: number | string | null;
  mapWidth: number;
  mapHeight: number;
}

export function GameInfo({ currentSeed, mapWidth, mapHeight }: GameInfoProps) {
  return (
    <div className="game-info">
      <div>
        <strong>當前種子：</strong>
        <span>{currentSeed || '-'}</span>
      </div>
      <div>
        <strong>地圖大小：</strong>
        <span>{mapWidth} × {mapHeight}</span>
      </div>
      <div>
        <strong>操作：</strong>方向鍵 ↑↓←→
      </div>
      <div className="legend">
        <div>🔵 藍色圓點 = 你的角色</div>
        <div>
          <span className="legend-square wall"></span>
          深藍色正方形 = 牆壁（無法通過）
        </div>
        <div>
          <span className="legend-square floor"></span>
          深灰色正方形 = 地板（可以移動）
        </div>
      </div>
    </div>
  );
}
