# 種子地圖遊戲 - React TypeScript 版本

一個使用種子碼生成可重複地圖的迷宮探索遊戲，使用 React + TypeScript 開發。

## 技術棧

- **React 18** - UI 框架
- **TypeScript** - 類型安全
- **Vite** - 構建工具
- **Canvas API** - 遊戲渲染

## 遊戲特色

- 🎲 **種子碼系統**：使用種子碼生成可重複的地圖
- 🗺️ **程序生成地圖**：使用細胞自動機演算法生成迷宮
- 💰 **收集要素**：收集 3 個閃爍的黃金
- 🌫️ **戰爭迷霧**：只能看到周圍 5 格範圍
- ⏱️ **計時系統**：記錄通關時間
- 🎮 **遊戲控制**：暫停、重新開始功能

## 安裝與運行

1. 安裝依賴：
```bash
npm install
```

2. 啟動開發服務器：
```bash
npm run dev
```

3. 構建生產版本：
```bash
npm run build
```

4. 預覽生產版本：
```bash
npm run preview
```

## 如何遊玩

1. 打開遊戲後，點擊「生成地圖」開始遊戲
2. 使用方向鍵 ↑↓←→ 移動角色
3. 收集 3 個黃金後，出口會變成藍色
4. 到達藍色出口即可通關

## 項目結構

```
homework2-4/
├── src/
│   ├── components/          # React 組件
│   │   ├── GameCanvas.tsx   # Canvas 繪製組件
│   │   ├── GameControls.tsx # 控制面板
│   │   ├── GameInfo.tsx     # 遊戲信息
│   │   ├── GameInstructions.tsx # 遊戲說明
│   │   └── WinScreen.tsx    # 通關畫面
│   ├── utils/               # 工具函數
│   │   ├── seededRandom.ts # PRNG 實作
│   │   └── mapGenerator.ts  # 地圖生成邏輯
│   ├── types.ts            # TypeScript 類型定義
│   ├── App.tsx             # 主應用組件
│   ├── App.css             # 應用樣式
│   ├── main.tsx            # 入口文件
│   └── index.css           # 全局樣式
├── index.html              # HTML 模板
├── package.json            # 項目配置
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
└── README.md               # 說明文件
```

## 技術特點

- 純前端實現（無需後端）
- 使用 React.ts (TypeScript 版本的 React)
- Mulberry32 PRNG 演算法實現種子隨機數
- 細胞自動機生成有機迷宮
- 戰爭迷霧系統
- 動畫循環實現閃爍效果
- 完整的 TypeScript 類型定義

## 瀏覽器支援

支援所有現代瀏覽器（Chrome、Firefox、Safari、Edge）
