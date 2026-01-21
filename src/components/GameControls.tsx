import { useState } from 'react';

interface GameControlsProps {
  seed: number | string | null;
  onSeedChange: (seed: number | string) => void;
  onGenerateMap: () => void;
  onRandomSeed: () => void;
  onCopySeedUrl: () => void;
  onPause: () => void;
  onRestart: () => void;
  gameRunning: boolean;
  gamePaused: boolean;
  gameTimer: string;
  goldCount: number;
}

export function GameControls({
  seed,
  onSeedChange,
  onGenerateMap,
  onRandomSeed,
  onCopySeedUrl,
  onPause,
  onRestart,
  gameRunning,
  gamePaused,
  gameTimer,
  goldCount,
}: GameControlsProps) {
  const [seedInput, setSeedInput] = useState<string>(seed?.toString() || '');

  const handleSeedInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSeedInput(e.target.value);
  };

  const handleGenerate = (): void => {
    if (seedInput.trim()) {
      const numSeed = parseInt(seedInput);
      onSeedChange(isNaN(numSeed) ? seedInput : numSeed);
    } else {
      onSeedChange(Date.now());
      setSeedInput(Date.now().toString());
    }
    onGenerateMap();
  };

  const handleRandomSeed = (): void => {
    const randomSeed = Math.floor(Math.random() * 1000000);
    setSeedInput(randomSeed.toString());
    onSeedChange(randomSeed);
    onRandomSeed();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  return (
    <div className="map-settings">
      <h3>🗺️ 地圖設定</h3>
      <div className="setting-group">
        <label htmlFor="seedInput">種子碼：</label>
        <input
          id="seedInput"
          type="text"
          value={seedInput}
          onChange={handleSeedInputChange}
          onKeyPress={handleKeyPress}
          placeholder="輸入或留空自動生成"
        />
      </div>
      <div className="button-group">
        <button onClick={handleRandomSeed}>🎲 隨機種子</button>
        <button onClick={onCopySeedUrl}>📋 複製種子網址</button>
        <button onClick={handleGenerate}>✨ 生成地圖</button>
      </div>
      <div className="settings-divider">
        <div className="button-group">
          <button onClick={onPause}>
            {gamePaused ? '▶️ 繼續遊戲' : '⏸️ 暫停遊戲'}
          </button>
          <button onClick={onRestart}>🔄 重新遊戲</button>
        </div>
      </div>
      <div className="settings-divider">
        <div className="game-stats">
          <div>
            <strong>⏱️ 遊戲時間：</strong>
            <span>{gameTimer}</span>
          </div>
          <div>
            <strong>💰 已收集：</strong>
            <span>{goldCount}/3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
