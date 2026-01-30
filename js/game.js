/* ==========================================
   game.js - ゲーム状態管理
   ライフ、ゴールド、Wave、ゲーム進行を管理
   ========================================== */

// ゲーム状態の初期設定
const GAME_CONFIG = {
    initialLives: 10,      // 初期ライフ
    initialGold: 200,      // 初期ゴールド
    maxWaves: 5,           // 全Wave数
};

// 各Waveの敵構成
const WAVE_DATA = [
    // Wave 1: スライムのみ（チュートリアル）
    {
        enemies: [
            { type: 'slime', count: 5, delay: 1000 }
        ]
    },
    // Wave 2: スライム + スケルトン（速い敵登場）
    {
        enemies: [
            { type: 'slime', count: 3, delay: 800 },
            { type: 'skeleton', count: 4, delay: 600 }
        ]
    },
    // Wave 3: ゴブリン + 大量スケルトン
    {
        enemies: [
            { type: 'goblin', count: 3, delay: 1000 },
            { type: 'skeleton', count: 8, delay: 500 }
        ]
    },
    // Wave 4: オーク + ドラゴン登場
    {
        enemies: [
            { type: 'orc', count: 3, delay: 1500 },
            { type: 'dragon', count: 2, delay: 2000 }
        ]
    },
    // Wave 5: ボス戦！
    {
        enemies: [
            { type: 'skeleton', count: 5, delay: 400 },
            { type: 'dragon', count: 2, delay: 1500 },
            { type: 'demon', count: 1, delay: 3000 }  // ボス！
        ]
    }
];

/**
 * ゲームステートクラス
 * ゲームの状態を管理し、Wave進行を制御
 */
class GameState {
    constructor() {
        this.reset();
    }

    /**
     * ゲーム状態をリセット
     */
    reset() {
        this.lives = GAME_CONFIG.initialLives;
        this.gold = GAME_CONFIG.initialGold;
        this.currentWave = 0;
        this.waveInProgress = false;
        this.gameOver = false;
        this.victory = false;
        this.enemies = [];           // 現在の敵リスト
        this.towers = [];            // 配置されたタワーリスト
        this.pendingEnemies = [];    // 生成待ちの敵
        this.lastSpawnTime = 0;      // 最後に敵を生成した時刻
    }

    /**
     * ゴールドを使用
     * @param {number} amount - 使用量
     * @returns {boolean} 使用成功ならtrue
     */
    spendGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }

    /**
     * ゴールドを獲得
     * @param {number} amount - 獲得量
     */
    earnGold(amount) {
        this.gold += amount;
    }

    /**
     * ライフを減らす
     * @param {number} amount - ダメージ量
     * @returns {boolean} ゲームオーバーならtrue
     */
    loseLife(amount = 1) {
        this.lives -= amount;
        if (this.lives <= 0) {
            this.lives = 0;
            this.gameOver = true;
            return true;
        }
        return false;
    }

    /**
     * Waveを開始
     * @returns {boolean} 開始成功ならtrue
     */
    startWave() {
        // 既にゲーム終了または進行中なら開始しない
        if (this.gameOver || this.victory || this.waveInProgress) {
            return false;
        }

        // 全Wave完了済みなら勝利
        if (this.currentWave >= GAME_CONFIG.maxWaves) {
            this.victory = true;
            return false;
        }

        this.waveInProgress = true;
        this.currentWave++;

        // このWaveの敵を生成キューに追加
        const waveData = WAVE_DATA[this.currentWave - 1];
        this.pendingEnemies = [];

        waveData.enemies.forEach(group => {
            for (let i = 0; i < group.count; i++) {
                this.pendingEnemies.push({
                    type: group.type,
                    delay: group.delay
                });
            }
        });

        this.lastSpawnTime = 0;
        return true;
    }

    /**
     * 敵を生成（タイマーベース）
     * @param {Array} path - 敵の経路
     * @param {number} currentTime - 現在時刻
     * @returns {Enemy|null} 生成された敵（なければnull）
     */
    spawnEnemy(path, currentTime) {
        if (this.pendingEnemies.length === 0) return null;

        const nextEnemy = this.pendingEnemies[0];
        if (currentTime - this.lastSpawnTime >= nextEnemy.delay) {
            this.pendingEnemies.shift();
            this.lastSpawnTime = currentTime;
            const enemy = new Enemy(nextEnemy.type, path);
            this.enemies.push(enemy);
            return enemy;
        }
        return null;
    }

    /**
     * Wave終了をチェック
     * @returns {boolean} Wave終了ならtrue
     */
    checkWaveComplete() {
        if (!this.waveInProgress) return false;

        // 生成待ちがなく、全ての敵がいなくなったらWave終了
        const allEnemiesGone = this.enemies.every(e => !e.alive || e.reachedEnd);
        if (this.pendingEnemies.length === 0 && allEnemiesGone) {
            this.waveInProgress = false;

            // 全Wave完了なら勝利
            if (this.currentWave >= GAME_CONFIG.maxWaves) {
                this.victory = true;
            }
            return true;
        }
        return false;
    }

    /**
     * タワーを追加
     * @param {Tower} tower - タワーオブジェクト
     */
    addTower(tower) {
        this.towers.push(tower);
    }

    /**
     * 死んだ敵をクリーンアップ
     */
    cleanupEnemies() {
        this.enemies = this.enemies.filter(e => e.alive && !e.reachedEnd);
    }
}
