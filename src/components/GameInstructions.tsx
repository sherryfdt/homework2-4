export function GameInstructions() {
  return (
    <div className="game-instructions">
      <h3>🎮 遊戲說明</h3>
      <div className="instructions-content">
        <p>
          <strong>遊戲類型：</strong>地牢探索遊戲
        </p>
        <p>
          <strong>遊戲目標：</strong>收集3個黃金，然後到達藍色出口通關
        </p>
        <p>
          <strong>操作方式：</strong>
        </p>
        <ul>
          <li>方向鍵 ↑↓←→</li>
          <li>只能在深色地板區域移動</li>
          <li>無法穿過藍色牆壁</li>
        </ul>
        <p>
          <strong>遊戲機制：</strong>
        </p>
        <ul>
          <li>💰 收集3個閃爍的黃金</li>
          <li>🔵 收集完後出口會變藍色並開啟</li>
          <li>🌫️ 只能看到周圍5格（戰爭迷霧）</li>
          <li>⏱️ 計時器記錄通關時間</li>
        </ul>
        <p>
          <strong>種子系統：</strong>
        </p>
        <ul>
          <li>種子碼決定地圖的生成方式</li>
          <li>相同種子會產生相同的地圖</li>
          <li>可以分享種子給朋友，讓他們看到相同的地圖</li>
        </ul>
      </div>
    </div>
  );
}
