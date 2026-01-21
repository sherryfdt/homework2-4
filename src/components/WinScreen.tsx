interface WinScreenProps {
  winTime: string;
  elapsedSeconds: number;
  onPlayAgain: () => void;
  onEndGame: () => void;
}

export function WinScreen({ winTime, elapsedSeconds, onPlayAgain, onEndGame }: WinScreenProps) {
  const showEncouragement = elapsedSeconds < 30;

  return (
    <div className="win-screen">
      <div className="win-content">
        <h2>🎉 通關成功！</h2>
        <p>
          花費時間：<span>{winTime}</span>
        </p>
        {showEncouragement && (
          <p className="encouragement-msg">
            ⭐ 超棒的！ ⭐
          </p>
        )}
        <div className="win-buttons">
          <button onClick={onPlayAgain} className="play-again-btn">
            🔄 再玩一次
          </button>
          <button onClick={onEndGame} className="end-game-btn">
            ❌ 結束遊戲
          </button>
        </div>
      </div>
    </div>
  );
}
