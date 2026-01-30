/* ==========================================
   main.js - エントリーポイント＆ゲームループ
   ゲームの初期化と毎フレームの更新/描画
   ========================================== */

/**
 * ゲームクラス
 * 全てのコンポーネントを統合し、ゲームループを実行
 */
class Game {
    constructor() {
        // Canvasを取得・設定
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // マップを初期化
        this.map = new GameMap();

        // Canvasサイズをマップに合わせる
        this.canvas.width = this.map.width;
        this.canvas.height = this.map.height;

        // ゲーム状態を初期化
        this.gameState = new GameState();

        // UIマネージャを初期化
        this.ui = new UIManager(this.gameState);
        this.setupUICallbacks();

        // マウス座標
        this.mouseX = 0;
        this.mouseY = 0;
        this.hoveredCell = null;

        // イベントリスナーを設定
        this.setupCanvasEvents();

        // ゲームループを開始
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * UIコールバックを設定
     */
    setupUICallbacks() {
        // Wave開始
        this.ui.onStartWave = () => {
            this.gameState.startWave();
            this.ui.updateDisplay();
        };

        // リスタート
        this.ui.onRestart = () => {
            this.restart();
        };
    }

    /**
     * Canvas上のイベントを設定
     */
    setupCanvasEvents() {
        // マウス移動
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
            this.hoveredCell = this.map.pixelToGrid(this.mouseX, this.mouseY);
        });

        // マウスが離れたら
        this.canvas.addEventListener('mouseleave', () => {
            this.hoveredCell = null;
        });

        // クリック（タワー配置）
        this.canvas.addEventListener('click', () => {
            this.handleClick();
        });

        // 右クリック（タワーアップグレード）
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();  // コンテキストメニューを無効化
            this.handleRightClick();
        });
    }

    /**
     * 右クリック処理（タワーアップグレード）
     */
    handleRightClick() {
        if (!this.hoveredCell) return;
        if (this.gameState.gameOver || this.gameState.victory) return;

        const { col, row } = this.hoveredCell;

        // その位置にタワーがあるか探す
        const tower = this.gameState.towers.find(t => t.col === col && t.row === row);
        if (!tower) return;

        // アップグレード可能かチェック
        if (!tower.canUpgrade()) {
            effectsManager.createDamagePopup(tower.x, tower.y - 20, 'MAX!');
            return;
        }

        const upgradeCost = tower.getUpgradeCost();

        // ゴールドが足りるかチェック
        if (!this.gameState.spendGold(upgradeCost)) {
            effectsManager.createDamagePopup(tower.x, tower.y - 20, '💰不足');
            return;
        }

        // アップグレード実行
        tower.upgrade();

        // エフェクトとサウンド
        effectsManager.createPlaceEffect(tower.x, tower.y, '#ffd700');
        effectsManager.createGoldPopup(tower.x, tower.y, `Lv${tower.level}!`);
        audioManager.playTowerPlace();

        // UI更新
        this.ui.updateDisplay();
    }

    /**
     * クリック処理（タワー配置）
     */
    handleClick() {
        if (!this.hoveredCell) return;
        if (!this.ui.selectedTower) return;
        if (this.gameState.gameOver || this.gameState.victory) return;

        const { col, row } = this.hoveredCell;
        const towerType = this.ui.selectedTower;
        const cost = getTowerCost(towerType);

        // 配置可能かチェック
        if (!this.map.canPlaceTower(col, row)) return;

        // ゴールドを使用
        if (!this.gameState.spendGold(cost)) return;

        // タワーを配置
        this.map.placeTower(col, row);
        const tower = new Tower(towerType, col, row, this.map.cellSize);
        this.gameState.addTower(tower);

        // 配置エフェクトとサウンド
        effectsManager.createPlaceEffect(tower.x, tower.y, tower.color);
        audioManager.playTowerPlace();

        // UIを更新
        this.ui.updateDisplay();
    }

    /**
     * ゲームをリスタート
     */
    restart() {
        // マップをリセット
        this.map = new GameMap();

        // ゲーム状態をリセット
        this.gameState.reset();

        // UIを更新
        this.ui.hideOverlay();
        this.ui.clearSelection();
        this.ui.updateDisplay();
    }

    /**
     * ゲームループ（毎フレーム呼ばれる）
     * @param {number} timestamp - 現在時刻
     */
    gameLoop(timestamp) {
        // デルタタイム計算
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // ゲーム更新
        this.update(timestamp, deltaTime);

        // エフェクト更新
        effectsManager.update(deltaTime);

        // 描画
        this.draw(timestamp);

        // 次のフレームを予約
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * ゲーム状態を更新
     * @param {number} currentTime - 現在時刻
     */
    update(currentTime, deltaTime) {
        if (this.gameState.gameOver || this.gameState.victory) return;

        // 敵を生成
        if (this.gameState.waveInProgress) {
            this.gameState.spawnEnemy(this.map.path, currentTime);
        }

        // ゲームスピードを取得
        const gameSpeed = this.ui.getGameSpeed();

        // 敵を更新（移動）- スピードに応じて複数回更新
        for (let i = 0; i < gameSpeed; i++) {
            this.gameState.enemies.forEach(enemy => {
                if (enemy.update()) {
                    // ゴールに到達したらライフを減らす
                    this.gameState.loseLife(1);
                    this.ui.updateDisplay();

                    if (this.gameState.gameOver) {
                        this.ui.showGameOver();
                    }
                }
            });
        }

        // タワーの攻撃処理
        this.gameState.towers.forEach(tower => {
            const killed = tower.attack(this.gameState.enemies, currentTime);
            killed.forEach(enemy => {
                // 報酬を獲得
                this.gameState.earnGold(enemy.reward);
                this.ui.updateDisplay();
            });
        });

        // 死んだ敵をクリーンアップ
        this.gameState.cleanupEnemies();

        // Wave終了チェック
        if (this.gameState.checkWaveComplete()) {
            this.ui.updateDisplay();
            if (this.gameState.victory) {
                this.ui.showVictory();
            }
        }
    }

    /**
     * 描画処理
     * @param {number} currentTime - 現在時刻
     */
    draw(currentTime) {
        // キャンバスをクリア
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 画面シェイク適用
        const shake = effectsManager.getShakeOffset();
        this.ctx.save();
        this.ctx.translate(shake.x, shake.y);

        // マップを描画
        this.map.draw(this.ctx);

        // ホバー中のセルをハイライト
        this.drawHoverHighlight();

        // タワーを描画
        this.gameState.towers.forEach(tower => {
            // ホバー中のタワーは射程を表示
            const showRange = this.hoveredCell &&
                tower.col === this.hoveredCell.col &&
                tower.row === this.hoveredCell.row;
            tower.draw(this.ctx, currentTime, showRange);
        });

        // 敵を描画
        this.gameState.enemies.forEach(enemy => {
            enemy.draw(this.ctx);
        });

        // エフェクトを描画
        effectsManager.draw(this.ctx);

        // 画面シェイク終了
        this.ctx.restore();
    }

    /**
     * ホバー中のセルをハイライト
     */
    drawHoverHighlight() {
        if (!this.hoveredCell) return;
        if (!this.ui.selectedTower) return;

        const { col, row } = this.hoveredCell;
        const x = col * this.map.cellSize;
        const y = row * this.map.cellSize;
        const canPlace = this.map.canPlaceTower(col, row);

        // 配置可能なら緑、不可なら赤でハイライト
        if (canPlace) {
            this.ctx.fillStyle = 'rgba(46, 204, 113, 0.4)';
        } else {
            this.ctx.fillStyle = 'rgba(231, 76, 60, 0.4)';
        }
        this.ctx.fillRect(x, y, this.map.cellSize, this.map.cellSize);

        // 配置可能なら射程プレビューを表示
        if (canPlace) {
            const towerConfig = TOWER_TYPES[this.ui.selectedTower];
            const centerX = x + this.map.cellSize / 2;
            const centerY = y + this.map.cellSize / 2;

            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, towerConfig.range, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.setLineDash([5, 5]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }
}

// DOMが読み込まれたらゲームを開始
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
