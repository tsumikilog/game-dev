/* ==========================================
   ui.js - UI更新とイベント処理
   タワー選択、ゲーム情報表示、イベントリスナー
   ========================================== */

/**
 * UIマネージャークラス
 * ゲームのUI要素を管理し、ユーザー入力を処理
 */
class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.selectedTower = null;  // 現在選択中のタワータイプ

        // DOM要素を取得
        this.livesElement = document.getElementById('lives');
        this.goldElement = document.getElementById('gold');
        this.waveElement = document.getElementById('wave');
        this.startWaveBtn = document.getElementById('startWaveBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.gameOverlay = document.getElementById('gameOverlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlayMessage = document.getElementById('overlayMessage');
        this.overlayRestartBtn = document.getElementById('overlayRestartBtn');
        this.towerButtons = document.querySelectorAll('.tower-btn');
        this.speedButtons = document.querySelectorAll('.speed-btn');
        this.waveInfoElement = document.getElementById('waveInfo');
        this.nextWaveEnemiesElement = document.getElementById('nextWaveEnemies');

        // ゲームスピード（デフォルト2倍速）
        this.gameSpeed = 2;

        // イベントリスナーを設定
        this.setupEventListeners();
    }

    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // タワー選択ボタン
        this.towerButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const towerType = btn.dataset.tower;
                this.selectTower(towerType);
            });
        });

        // Wave開始ボタン
        this.startWaveBtn.addEventListener('click', () => {
            if (this.onStartWave) {
                audioManager.playWaveStart();
                this.onStartWave();
            }
        });

        // リスタートボタン
        this.restartBtn.addEventListener('click', () => {
            if (this.onRestart) {
                this.onRestart();
            }
        });

        // オーバーレイのリスタートボタン
        this.overlayRestartBtn.addEventListener('click', () => {
            if (this.onRestart) {
                this.onRestart();
            }
        });

        // スピードボタン
        this.speedButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const speed = parseInt(btn.dataset.speed);
                this.setGameSpeed(speed);
            });
        });
    }

    /**
     * ゲームスピードを設定
     * @param {number} speed - スピード倍率
     */
    setGameSpeed(speed) {
        this.gameSpeed = speed;

        // ボタンのアクティブ状態を更新
        this.speedButtons.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.speed) === speed);
        });

        audioManager.playClick();
    }

    /**
     * 現在のゲームスピードを取得
     */
    getGameSpeed() {
        return this.gameSpeed;
    }

    /**
     * タワーを選択
     * @param {string} type - タワータイプ
     */
    selectTower(type) {
        // コスト確認
        const cost = getTowerCost(type);
        if (this.gameState.gold < cost) {
            return;  // ゴールド不足
        }

        // 既に選択中なら解除
        if (this.selectedTower === type) {
            this.selectedTower = null;
        } else {
            this.selectedTower = type;
            audioManager.playClick();
        }

        // ボタンの見た目を更新
        this.updateTowerButtons();
    }

    /**
     * タワーボタンの状態を更新
     */
    updateTowerButtons() {
        this.towerButtons.forEach(btn => {
            const towerType = btn.dataset.tower;
            const cost = getTowerCost(towerType);

            // 選択状態
            btn.classList.toggle('selected', this.selectedTower === towerType);

            // ゴールド不足で無効化
            btn.classList.toggle('disabled', this.gameState.gold < cost);
        });
    }

    /**
     * ステータス表示を更新
     */
    updateDisplay() {
        this.livesElement.textContent = this.gameState.lives;
        this.goldElement.textContent = this.gameState.gold;
        this.waveElement.textContent = this.gameState.currentWave;

        // タワーボタンの有効/無効を更新
        this.updateTowerButtons();

        // Wave中はボタンを無効化
        if (this.gameState.waveInProgress) {
            this.startWaveBtn.disabled = true;
            this.startWaveBtn.textContent = 'Wave進行中...';
            this.waveInfoElement.style.display = 'none';
        } else if (this.gameState.currentWave >= GAME_CONFIG.maxWaves) {
            this.startWaveBtn.disabled = true;
            this.startWaveBtn.textContent = '全Wave完了';
            this.waveInfoElement.style.display = 'none';
        } else {
            this.startWaveBtn.disabled = false;
            this.startWaveBtn.textContent = `Wave ${this.gameState.currentWave + 1} 開始`;

            // 次Waveの敵情報を表示
            this.updateWaveInfo();
        }
    }

    /**
     * 次Waveの敵情報を更新
     */
    updateWaveInfo() {
        const nextWaveIndex = this.gameState.currentWave;
        if (nextWaveIndex >= WAVE_DATA.length) {
            this.waveInfoElement.style.display = 'none';
            return;
        }

        const waveData = WAVE_DATA[nextWaveIndex];
        const enemyIcons = {
            slime: '🟢',
            goblin: '👺',
            orc: '👹',
            skeleton: '💀',
            dragon: '🐉',
            demon: '😈'  // ボス!
        };

        // 敵の情報を文字列化
        const enemyText = waveData.enemies.map(e =>
            `${enemyIcons[e.type] || '❓'}x${e.count}`
        ).join(' ');

        this.nextWaveEnemiesElement.textContent = enemyText;
        this.waveInfoElement.style.display = 'flex';
    }

    /**
     * ゲームオーバー画面を表示
     */
    showGameOver() {
        this.gameOverlay.style.display = 'flex';
        this.overlayTitle.textContent = 'ゲームオーバー';
        this.overlayTitle.className = 'game-over';
        this.overlayMessage.textContent = '防衛に失敗しました...';
        audioManager.playGameOver();
    }

    /**
     * 勝利画面を表示
     */
    showVictory() {
        this.gameOverlay.style.display = 'flex';
        this.overlayTitle.textContent = '🎉 勝利！';
        this.overlayTitle.className = 'victory';
        this.overlayMessage.textContent = 'すべてのWaveを撃退しました！';
        audioManager.playVictory();
    }

    /**
     * オーバーレイを非表示
     */
    hideOverlay() {
        this.gameOverlay.style.display = 'none';
    }

    /**
     * 選択中のタワーをクリア
     */
    clearSelection() {
        this.selectedTower = null;
        this.updateTowerButtons();
    }
}
