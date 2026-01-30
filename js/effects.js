/* ==========================================
   effects.js - パーティクル＆エフェクトシステム
   攻撃エフェクト、撃破演出、画面シェイク
   ========================================== */

/**
 * パーティクルクラス
 * 単一のパーティクル（火花、破片など）
 */
class Particle {
    /**
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} config - パーティクル設定
     */
    constructor(x, y, config = {}) {
        this.x = x;
        this.y = y;

        // 速度（ランダムな方向）
        const angle = config.angle ?? Math.random() * Math.PI * 2;
        const speed = config.speed ?? (2 + Math.random() * 3);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        // 重力（下に落ちる効果）
        this.gravity = config.gravity ?? 0.1;

        // サイズ
        this.size = config.size ?? (3 + Math.random() * 4);
        this.originalSize = this.size;

        // 色
        this.color = config.color ?? '#ffaa00';

        // 寿命
        this.life = config.life ?? 1.0;
        this.decay = config.decay ?? 0.02;

        // 形状（'circle', 'square', 'star'）
        this.shape = config.shape ?? 'circle';

        // 回転（正方形用）
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.3;
    }

    /**
     * パーティクルを更新
     * @returns {boolean} 生存中ならtrue
     */
    update() {
        // 移動
        this.x += this.vx;
        this.y += this.vy;

        // 重力適用
        this.vy += this.gravity;

        // 減速（空気抵抗）
        this.vx *= 0.98;
        this.vy *= 0.98;

        // 回転
        this.rotation += this.rotationSpeed;

        // 寿命を減らす
        this.life -= this.decay;

        // サイズを縮小
        this.size = this.originalSize * this.life;

        return this.life > 0;
    }

    /**
     * パーティクルを描画
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.shape === 'square') {
            ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
        } else if (this.shape === 'star') {
            this.drawStar(ctx, 5, this.size, this.size * 0.5);
        }

        ctx.restore();
    }

    /**
     * 星形を描画
     */
    drawStar(ctx, points, outerRadius, innerRadius) {
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / points - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    }
}

/**
 * エフェクトマネージャー
 * 全てのエフェクトを管理
 */
class EffectsManager {
    constructor() {
        this.particles = [];
        this.textPopups = [];

        // 画面シェイク
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeOffset = { x: 0, y: 0 };
    }

    /**
     * 攻撃ヒットエフェクト（戦士・弓使い用）
     */
    createHitEffect(x, y, color = '#ffaa00') {
        // 火花パーティクル
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(x, y, {
                color: color,
                speed: 2 + Math.random() * 2,
                size: 2 + Math.random() * 3,
                gravity: 0.05,
                decay: 0.04,
                shape: 'circle'
            }));
        }
    }

    /**
     * 魔法攻撃エフェクト（魔法使い用）
     */
    createMagicEffect(x, y) {
        // 紫色の魔法パーティクル
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            this.particles.push(new Particle(x, y, {
                angle: angle,
                color: ['#9b59b6', '#8e44ad', '#e056fd'][Math.floor(Math.random() * 3)],
                speed: 3 + Math.random() * 2,
                size: 4 + Math.random() * 3,
                gravity: 0,
                decay: 0.03,
                shape: 'star'
            }));
        }
    }

    /**
     * 敵撃破エフェクト
     */
    createDeathEffect(x, y, color = '#2ecc71') {
        // 大きな爆発パーティクル
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(x, y, {
                color: color,
                speed: 3 + Math.random() * 4,
                size: 4 + Math.random() * 6,
                gravity: 0.15,
                decay: 0.025,
                shape: Math.random() > 0.5 ? 'circle' : 'square'
            }));
        }

        // ゴールド獲得の金色パーティクル
        for (let i = 0; i < 5; i++) {
            this.particles.push(new Particle(x, y - 10, {
                color: '#ffd700',
                speed: 1 + Math.random() * 2,
                size: 3 + Math.random() * 2,
                gravity: -0.05,  // 上に浮く
                decay: 0.015,
                shape: 'star'
            }));
        }

        // 画面シェイク
        this.triggerShake(3, 100);
    }

    /**
     * タワー配置エフェクト
     */
    createPlaceEffect(x, y, color) {
        // 円形に広がるパーティクル
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            this.particles.push(new Particle(x, y, {
                angle: angle,
                color: color,
                speed: 4,
                size: 3,
                gravity: 0,
                decay: 0.05,
                shape: 'circle'
            }));
        }
    }

    /**
     * ダメージ数値ポップアップ
     */
    createDamagePopup(x, y, damage, isCritical = false) {
        this.textPopups.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y,
            text: damage.toString(),
            color: isCritical ? '#ff6b6b' : '#fff',
            size: isCritical ? 24 : 16,
            life: 1.0,
            vy: -2
        });
    }

    /**
     * ゴールド獲得ポップアップ
     */
    createGoldPopup(x, y, amount) {
        this.textPopups.push({
            x: x,
            y: y - 20,
            text: `+${amount}G`,
            color: '#ffd700',
            size: 14,
            life: 1.0,
            vy: -1.5
        });
    }

    /**
     * 画面シェイクをトリガー
     * @param {number} intensity - 揺れの強さ
     * @param {number} duration - 持続時間（ミリ秒）
     */
    triggerShake(intensity, duration) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
        this.shakeDuration = Math.max(this.shakeDuration, duration);
    }

    /**
     * 毎フレーム更新
     * @param {number} deltaTime - 経過時間
     */
    update(deltaTime) {
        // パーティクル更新
        this.particles = this.particles.filter(p => p.update());

        // テキストポップアップ更新
        this.textPopups = this.textPopups.filter(popup => {
            popup.y += popup.vy;
            popup.life -= 0.02;
            return popup.life > 0;
        });

        // 画面シェイク更新
        if (this.shakeDuration > 0) {
            this.shakeOffset.x = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeOffset.y = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeDuration -= deltaTime;
            this.shakeIntensity *= 0.9;
        } else {
            this.shakeOffset.x = 0;
            this.shakeOffset.y = 0;
            this.shakeIntensity = 0;
        }
    }

    /**
     * 全エフェクトを描画
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        // パーティクル描画
        this.particles.forEach(p => p.draw(ctx));

        // テキストポップアップ描画
        this.textPopups.forEach(popup => {
            ctx.save();
            ctx.globalAlpha = popup.life;
            ctx.font = `bold ${popup.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // 影
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillText(popup.text, popup.x + 1, popup.y + 1);

            // テキスト本体
            ctx.fillStyle = popup.color;
            ctx.fillText(popup.text, popup.x, popup.y);

            ctx.restore();
        });
    }

    /**
     * 画面シェイクオフセットを取得
     */
    getShakeOffset() {
        return this.shakeOffset;
    }
}

// グローバルエフェクトマネージャー
const effectsManager = new EffectsManager();
