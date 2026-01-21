/**
 * Mulberry32 PRNG 實作
 * 用於生成可重複的隨機數序列
 */
export class SeededRandom {
  private initialSeed: number;
  private seed: number;

  constructor(seed: number | string) {
    // 確保種子是數字
    if (typeof seed === 'string') {
      // 將字串轉換為數字（簡單的 hash）
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 轉換為 32 位整數
      }
      this.initialSeed = hash;
    } else {
      this.initialSeed = seed || Date.now();
    }
    this.seed = this.initialSeed;
  }

  private next(): number {
    let t = this.seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  random(): number {
    return this.next();
  }

  randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  // 重置種子（用於重複生成）
  reset(): void {
    this.seed = this.initialSeed;
  }
}
