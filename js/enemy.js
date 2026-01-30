/* ==========================================
   enemy.js - 敵キャラクター
   スライム、ゴブリン、オークの3種類
   ========================================== */

// 敵のタイプ定義
const ENEMY_TYPES = {
    slime: {
        name: 'スライム',
        emoji: '🟢',
        maxHp: 50,
        speed: 1.5,
        reward: 10,
        color: '#2ecc71',
        size: 20,
        isBoss: false
    },
    goblin: {
        name: 'ゴブリン',
        emoji: '👺',
        maxHp: 100,
        speed: 2,
        reward: 20,
        color: '#e67e22',
        size: 22,
        isBoss: false
    },
    orc: {
        name: 'オーク',
        emoji: '👹',
        maxHp: 200,
        speed: 1,
        reward: 40,
        color: '#9b59b6',
        size: 28,
        isBoss: false
    },
    // 新しい敵タイプ
    skeleton: {
        name: 'スケルトン',
        emoji: '💀',
        maxHp: 40,
        speed: 3,      // 速い！
        reward: 15,
        color: '#bdc3c7',
        size: 18,
        isBoss: false
    },
    dragon: {
        name: 'ドラゴン',
        emoji: '🐉',
        maxHp: 300,
        speed: 1.2,
        reward: 60,
        color: '#e74c3c',
        size: 30,
        isBoss: false
    },
    // ボス敵
    demon: {
        name: 'デーモン',
        emoji: '😈',
        maxHp: 1000,
        speed: 0.8,
        reward: 200,
        color: '#8e44ad',
        size: 40,
        isBoss: true
    }
};

/**
 * 敵クラス
 * 経路に沿って移動し、ゴールを目指す
 */
class Enemy {
    /**
     * @param {string} type - 敵のタイプ（slime, goblin, orc）
     * @param {Array} path - 経路のウェイポイント配列
     */
    constructor(type, path) {
        const config = ENEMY_TYPES[type];

        this.type = type;
        this.name = config.name;
        this.emoji = config.emoji;
        this.maxHp = config.maxHp;
        this.hp = config.maxHp;
        this.speed = config.speed;
        this.reward = config.reward;
        this.color = config.color;
        this.size = config.size;

        // 経路情報
        this.path = path;
        this.currentWaypoint = 0;

        // 位置（最初のウェイポイントからスタート）
        this.x = path[0].x;
        this.y = path[0].y;

        // 状態
        this.alive = true;
        this.reachedEnd = false;
        this.isBoss = config.isBoss || false;

        // アニメーション用
        this.animationTime = Math.random() * 1000;  // ランダムオフセット
        this.hitFlash = 0;  // ダメージ時のフラッシュ
    }

    /**
     * 敵を更新（移動処理）
     * @returns {boolean} ゴールに到達したらtrue
     */
    update() {
        if (!this.alive || this.reachedEnd) return false;

        // 次のウェイポイントへ向かう
        const target = this.path[this.currentWaypoint];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // ウェイポイントに到達した場合
        if (distance < this.speed) {
            this.currentWaypoint++;

            // 最後のウェイポイント（ゴール）に到達
            if (this.currentWaypoint >= this.path.length) {
                this.reachedEnd = true;
                return true;
            }
        } else {
            // ウェイポイントに向かって移動
            const vx = (dx / distance) * this.speed;
            const vy = (dy / distance) * this.speed;
            this.x += vx;
            this.y += vy;
        }

        // アニメーション時間を更新
        this.animationTime += 16;  // 約60FPS

        // ダメージフラッシュを減衰
        if (this.hitFlash > 0) {
            this.hitFlash -= 0.1;
        }

        return false;
    }

    /**
     * ダメージを受ける
     * @param {number} damage - ダメージ量
     * @returns {boolean} 死亡したらtrue
     */
    takeDamage(damage) {
        this.hp -= damage;
        this.hitFlash = 1;  // ダメージ時にフラッシュ
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
            return true;
        }
        return false;
    }

    /**
     * 敵を描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    draw(ctx) {
        if (!this.alive) return;

        // 歩行アニメーション（上下の揺れ）
        const bobAmount = Math.sin(this.animationTime * 0.01) * 2;
        const drawY = this.y + bobAmount;

        // スケールアニメーション（左右の揺れ）
        const squashAmount = 1 + Math.sin(this.animationTime * 0.02) * 0.05;

        ctx.save();
        ctx.translate(this.x, drawY);
        ctx.scale(squashAmount, 1 / squashAmount);  // スクォッシュ＆ストレッチ

        // ダメージフラッシュ（白く光る）
        if (this.hitFlash > 0) {
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 20 * this.hitFlash;
        }

        // 敵本体（円）
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);

        // ダメージ時は白くなる
        if (this.hitFlash > 0.5) {
            ctx.fillStyle = '#fff';
        } else {
            ctx.fillStyle = this.color;
        }
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 絵文字を表示
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;  // 絵文字には影なし
        ctx.fillText(this.emoji, 0, 0);

        ctx.restore();

        // HPバー（揺れとは別に元の位置に描画）
        this.drawHealthBar(ctx);
    }

    /**
     * HPバーを描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    drawHealthBar(ctx) {
        const barWidth = this.size * 2;
        const barHeight = 5;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.size - 10;

        // 背景（赤）
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // 現在HP（緑のグラデーション）
        const hpRatio = this.hp / this.maxHp;
        // HP残量に応じて色を変更
        if (hpRatio > 0.5) {
            ctx.fillStyle = '#27ae60';
        } else if (hpRatio > 0.25) {
            ctx.fillStyle = '#f39c12';
        } else {
            ctx.fillStyle = '#e74c3c';
        }
        ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

        // 枠線
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
}

/**
 * 指定座標との距離を計算
 * @param {Enemy} enemy - 敵オブジェクト
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @returns {number} 距離
 */
function getDistanceToEnemy(enemy, x, y) {
    const dx = enemy.x - x;
    const dy = enemy.y - y;
    return Math.sqrt(dx * dx + dy * dy);
}
