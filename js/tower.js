/* ==========================================
   tower.js - タワークラス
   戦士、弓使い、魔法使いの3種類
   ========================================== */

// タワーのタイプ定義
const TOWER_TYPES = {
    warrior: {
        name: '戦士',
        emoji: '🗡️',
        cost: 50,
        damage: 30,
        range: 80,           // 近距離
        attackSpeed: 1000,   // 攻撃間隔（ミリ秒）- 遅い
        color: '#e67e22',
        splashRadius: 0      // 範囲攻撃なし
    },
    archer: {
        name: '弓使い',
        emoji: '🏹',
        cost: 75,
        damage: 15,
        range: 150,          // 長距離
        attackSpeed: 600,    // 中速
        color: '#27ae60',
        splashRadius: 0
    },
    mage: {
        name: '魔法使い',
        emoji: '🔮',
        cost: 100,
        damage: 10,
        range: 120,          // 中距離
        attackSpeed: 400,    // 速い
        color: '#9b59b6',
        splashRadius: 50     // 範囲攻撃あり
    }
};

// アップグレード設定
const UPGRADE_CONFIG = {
    maxLevel: 3,
    // レベルごとの強化倍率
    multipliers: {
        1: { damage: 1.0, range: 1.0, attackSpeed: 1.0 },
        2: { damage: 1.5, range: 1.15, attackSpeed: 0.85 },  // 攻撃速度は下がるほど良い
        3: { damage: 2.0, range: 1.3, attackSpeed: 0.7 }
    },
    // レベルごとのアップグレードコスト（元のコストの倍率）
    costMultiplier: {
        1: 0.5,  // Lv1→Lv2: 元の50%
        2: 1.0   // Lv2→Lv3: 元の100%
    }
};

/**
 * タワークラス
 * 射程内の敵を攻撃する
 */
class Tower {
    /**
     * @param {string} type - タワーのタイプ（warrior, archer, mage）
     * @param {number} col - グリッド列番号
     * @param {number} row - グリッド行番号
     * @param {number} cellSize - セルサイズ（ピクセル）
     */
    constructor(type, col, row, cellSize) {
        const config = TOWER_TYPES[type];

        this.type = type;
        this.name = config.name;
        this.emoji = config.emoji;
        this.damage = config.damage;
        this.range = config.range;
        this.attackSpeed = config.attackSpeed;
        this.color = config.color;
        this.splashRadius = config.splashRadius;

        // 位置（セルの中心）
        this.col = col;
        this.row = row;
        this.x = col * cellSize + cellSize / 2;
        this.y = row * cellSize + cellSize / 2;
        this.size = cellSize * 0.4;

        // 攻撃タイミング管理
        this.lastAttackTime = 0;

        // 攻撃エフェクト
        this.attackEffect = null;

        // アップグレードシステム
        this.level = 1;
        this.baseDamage = config.damage;
        this.baseRange = config.range;
        this.baseAttackSpeed = config.attackSpeed;
        this.baseCost = config.cost;
    }

    /**
     * アップグレード可能かチェック
     */
    canUpgrade() {
        return this.level < UPGRADE_CONFIG.maxLevel;
    }

    /**
     * アップグレードコストを取得
     */
    getUpgradeCost() {
        if (!this.canUpgrade()) return 0;
        return Math.floor(this.baseCost * UPGRADE_CONFIG.costMultiplier[this.level]);
    }

    /**
     * アップグレードを実行
     */
    upgrade() {
        if (!this.canUpgrade()) return false;

        this.level++;
        const mult = UPGRADE_CONFIG.multipliers[this.level];

        // ステータスを強化
        this.damage = Math.floor(this.baseDamage * mult.damage);
        this.range = Math.floor(this.baseRange * mult.range);
        this.attackSpeed = Math.floor(this.baseAttackSpeed * mult.attackSpeed);

        // サイズも少し大きく
        this.size *= 1.1;

        return true;
    }

    /**
     * レベル表示用の星を取得
     */
    getLevelStars() {
        return '⭐'.repeat(this.level);
    }

    /**
     * 敵を攻撃
     * @param {Array} enemies - 敵の配列
     * @param {number} currentTime - 現在時刻
     * @returns {Array} 倒した敵の配列
     */
    attack(enemies, currentTime) {
        // 攻撃クールダウン中かチェック
        if (currentTime - this.lastAttackTime < this.attackSpeed) {
            return [];
        }

        // 射程内の敵を探す
        const target = this.findTarget(enemies);
        if (!target) return [];

        this.lastAttackTime = currentTime;
        const killedEnemies = [];

        // 範囲攻撃（魔法使い）
        if (this.splashRadius > 0) {
            // スプラッシュエフェクト
            this.attackEffect = {
                x: target.x,
                y: target.y,
                radius: this.splashRadius,
                startTime: currentTime,
                duration: 200,
                type: 'splash'
            };

            // 魔法攻撃エフェクトとサウンド
            effectsManager.createMagicEffect(target.x, target.y);
            audioManager.playMageAttack();

            // 範囲内の全ての敵にダメージ
            enemies.forEach(enemy => {
                if (!enemy.alive) return;
                const dist = getDistanceToEnemy(enemy, target.x, target.y);
                if (dist <= this.splashRadius) {
                    if (enemy.takeDamage(this.damage)) {
                        killedEnemies.push(enemy);
                        // 撃破エフェクト
                        effectsManager.createDeathEffect(enemy.x, enemy.y, enemy.color);
                        effectsManager.createGoldPopup(enemy.x, enemy.y, enemy.reward);
                    } else {
                        // ダメージポップアップ
                        effectsManager.createDamagePopup(enemy.x, enemy.y, this.damage);
                    }
                }
            });
        } else {
            // 単体攻撃（戦士、弓使い）
            this.attackEffect = {
                targetX: target.x,
                targetY: target.y,
                startTime: currentTime,
                duration: 150,
                type: 'projectile'
            };

            // 攻撃サウンド
            if (this.type === 'warrior') {
                audioManager.playWarriorAttack();
            } else {
                audioManager.playArcherAttack();
            }

            if (target.takeDamage(this.damage)) {
                killedEnemies.push(target);
                // 撃破エフェクトとサウンド
                effectsManager.createDeathEffect(target.x, target.y, target.color);
                effectsManager.createGoldPopup(target.x, target.y, target.reward);
                audioManager.playEnemyDeath();
            } else {
                // ヒットエフェクト
                effectsManager.createHitEffect(target.x, target.y, this.color);
                effectsManager.createDamagePopup(target.x, target.y, this.damage);
            }
        }

        return killedEnemies;
    }

    /**
     * 射程内で最も進んでいる敵を探す
     * @param {Array} enemies - 敵の配列
     * @returns {Enemy|null} ターゲットの敵
     */
    findTarget(enemies) {
        let target = null;
        let maxProgress = -1;

        enemies.forEach(enemy => {
            if (!enemy.alive) return;

            // 敵との距離を計算
            const dist = getDistanceToEnemy(enemy, this.x, this.y);

            // 射程内かチェック
            if (dist <= this.range) {
                // 最も進んでいる敵（ウェイポイントが大きい）を優先
                if (enemy.currentWaypoint > maxProgress) {
                    maxProgress = enemy.currentWaypoint;
                    target = enemy;
                }
            }
        });

        return target;
    }

    /**
     * タワーを描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     * @param {number} currentTime - 現在時刻
     * @param {boolean} showRange - 射程を表示するか
     */
    draw(ctx, currentTime, showRange = false) {
        // 射程範囲を表示
        if (showRange) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // タワー本体（円形の台座）
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 絵文字アイコン
        ctx.font = `${this.size * 1.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x, this.y);

        // レベル表示（Lv2以上の場合）
        if (this.level > 1) {
            ctx.font = 'bold 10px Arial';
            ctx.fillStyle = '#ffd700';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            const levelText = this.getLevelStars();
            ctx.strokeText(levelText, this.x, this.y - this.size - 5);
            ctx.fillText(levelText, this.x, this.y - this.size - 5);
        }

        // 攻撃エフェクトを描画
        this.drawAttackEffect(ctx, currentTime);
    }

    /**
     * 攻撃エフェクトを描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     * @param {number} currentTime - 現在時刻
     */
    drawAttackEffect(ctx, currentTime) {
        if (!this.attackEffect) return;

        const elapsed = currentTime - this.attackEffect.startTime;
        if (elapsed > this.attackEffect.duration) {
            this.attackEffect = null;
            return;
        }

        const progress = elapsed / this.attackEffect.duration;

        if (this.attackEffect.type === 'splash') {
            // 範囲攻撃エフェクト（拡大する円）
            const radius = this.attackEffect.radius * progress;
            ctx.beginPath();
            ctx.arc(
                this.attackEffect.x,
                this.attackEffect.y,
                radius,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = `rgba(155, 89, 182, ${0.5 * (1 - progress)})`;
            ctx.fill();
        } else {
            // 弾丸エフェクト（タワーからターゲットへ飛ぶ線）
            const targetX = this.attackEffect.targetX;
            const targetY = this.attackEffect.targetY;

            // 現在位置を計算
            const currentX = this.x + (targetX - this.x) * progress;
            const currentY = this.y + (targetY - this.y) * progress;

            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(currentX, currentY);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.stroke();

            // 弾丸の先端
            ctx.beginPath();
            ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }
    }
}

/**
 * タワーのコストを取得
 * @param {string} type - タワーのタイプ
 * @returns {number} コスト
 */
function getTowerCost(type) {
    return TOWER_TYPES[type]?.cost || 0;
}
