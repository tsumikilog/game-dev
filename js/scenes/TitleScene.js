/* ===========================================
   TitleScene.js — タイトル画面
   ゲーム起動時に最初に表示されるシーン
   パーティクルアニメーション付きのタイトルロゴ
   =========================================== */

class TitleScene extends Phaser.Scene {
    constructor() {
        // Phaserにこのシーンを'TitleScene'として登録
        super({ key: 'TitleScene' });
    }

    /**
     * create() — シーンが開始されたときに1回だけ呼ばれる
     * ここでUI要素やアニメーションを初期化する
     */
    create() {
        const { width, height } = this.cameras.main;

        // ========== 背景グラデーション ==========
        // 夜明け前のグラデーション背景を描画
        this.createBackground(width, height);

        // ========== パーティクル（浮遊する光の粒） ==========
        this.createParticles(width, height);

        // ========== タイトルロゴ ==========
        // メインタイトル: 「AI朝活RPG」
        const title = this.add.text(width / 2, height * 0.28, 'AI 朝活 RPG', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '52px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#ff8c00',
            strokeThickness: 2,
        }).setOrigin(0.5);

        // タイトルのグロー（ふわっと明滅するアニメーション）
        this.tweens.add({
            targets: title,
            alpha: { from: 0.8, to: 1 },
            scaleX: { from: 0.98, to: 1.02 },
            scaleY: { from: 0.98, to: 1.02 },
            duration: 2000,
            yoyo: true,       // 行って戻る
            repeat: -1,       // 無限ループ
            ease: 'Sine.easeInOut',
        });

        // ========== サブタイトル ==========
        this.add.text(width / 2, height * 0.40,
            '手取り19万のパパが\nAIを武器に人生を変える', {
            fontFamily: 'Noto Sans JP, sans-serif',
            fontSize: '16px',
            color: '#aaaacc',
            align: 'center',
            lineSpacing: 8,
        }).setOrigin(0.5);

        // ========== STARTボタン ==========
        this.createStartButton(width, height);

        // ========== 「つづきから」ボタン ==========
        this.createContinueButton(width, height);

        // ========== 周回マーク ==========
        if (localStorage.getItem('ai_rpg_cleared') === 'true') {
            this.add.text(width / 2, height * 0.20, '★ CLEARED', {
                fontFamily: 'Orbitron, sans-serif', fontSize: '14px',
                color: '#ffd700',
            }).setOrigin(0.5);
        }

        // ========== フッターテキスト ==========
        this.add.text(width / 2, height * 0.92, '© 2026 ジュラ | AI朝活RPG', {
            fontFamily: 'Noto Sans JP, sans-serif',
            fontSize: '12px',
            color: '#666688',
        }).setOrigin(0.5);

        // ========== フェードインアニメーション ==========
        this.cameras.main.fadeIn(800, 15, 12, 41);
    }

    /**
     * 背景のグラデーション矩形を描画する
     */
    createBackground(width, height) {
        // Phaserのグラフィックスで背景グラデーション
        const bg = this.add.graphics();

        // 上から下へ段階的な色の変化を描画
        const steps = 20;  // グラデーションの段階数
        for (let i = 0; i < steps; i++) {
            const t = i / steps;  // 0〜1の進行度
            // 紫→暗い青のグラデーション
            const r = Math.floor(15 + t * 10);
            const g = Math.floor(12 + t * 8);
            const b = Math.floor(41 + t * 30);
            const color = (r << 16) | (g << 8) | b;
            bg.fillStyle(color, 1);
            bg.fillRect(0, (height / steps) * i, width, height / steps + 1);
        }

        // 下部にほんのりオレンジ色（朝日の予感）
        const sunrise = this.add.graphics();
        sunrise.fillStyle(0xff8c00, 0.05);
        sunrise.fillRect(0, height * 0.7, width, height * 0.3);
    }

    /**
     * 浮遊する光のパーティクルを作成する
     * 朝日が昇る前のきらめきを演出
     */
    createParticles(width, height) {
        // 小さな光の円を複数生成
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(1, 3);
            const alpha = Math.random() * 0.4 + 0.1;

            const particle = this.add.circle(x, y, size, 0xffd700, alpha);

            // 各パーティクルにふわふわ浮遊するアニメーション
            this.tweens.add({
                targets: particle,
                y: y - Phaser.Math.Between(20, 80),
                alpha: { from: alpha, to: alpha * 0.3 },
                duration: Phaser.Math.Between(3000, 6000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 3000),
            });
        }
    }

    /**
     * STARTボタンを作成する
     * ホバー・クリックアニメーション付き
     */
    createStartButton(width, height) {
        const btnY = height * 0.62;
        const btnW = 220;
        const btnH = 56;

        // ボタン背景（角丸矩形）
        const btnBg = this.add.graphics();
        this.drawButton(btnBg, width / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, COLORS.BTN_AI_HIGH, 1);

        // ボタンテキスト
        const btnText = this.add.text(width / 2, btnY, '▶  S T A R T', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '22px',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // ボタンの脈動アニメーション
        this.tweens.add({
            targets: [btnText],
            scaleX: { from: 1, to: 1.05 },
            scaleY: { from: 1, to: 1.05 },
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // クリック判定用の透明なゾーン
        const hitArea = this.add.zone(width / 2, btnY, btnW, btnH)
            .setInteractive({ useHandCursor: true });

        // ホバー時：少し明るくする
        hitArea.on('pointerover', () => {
            btnBg.clear();
            this.drawButton(btnBg, width / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, COLORS.BTN_HOVER, 1);
        });

        // ホバー解除：元の色に戻す
        hitArea.on('pointerout', () => {
            btnBg.clear();
            this.drawButton(btnBg, width / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, COLORS.BTN_AI_HIGH, 1);
        });

        // クリック時：ゲーム開始！
        hitArea.on('pointerdown', () => {
            // クリックフィードバック
            this.cameras.main.flash(200, 255, 215, 0, false);

            // フェードアウトしてステージ1のストーリーへ遷移
            this.cameras.main.fadeOut(500, 15, 12, 41);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                // プロローグシーンへ遷移
                this.scene.start('PrologueScene');
            });
        });
    }

    /**
     * 角丸の矩形ボタンを描画するヘルパー関数
     */
    drawButton(graphics, x, y, w, h, color, alpha) {
        graphics.fillStyle(color, alpha);
        graphics.fillRoundedRect(x, y, w, h, 12);
        // 上辺にハイライト（光沢感）
        graphics.fillStyle(0xffffff, 0.1);
        graphics.fillRoundedRect(x + 2, y + 2, w - 4, h / 2 - 2, { tl: 10, tr: 10, bl: 0, br: 0 });
    }

    /**
     * 「つづきから」ボタンを作成
     * localStorageにセーブデータがある場合のみ表示
     */
    createContinueButton(width, height) {
        let saveData = null;
        try {
            const raw = localStorage.getItem('ai_rpg_save');
            if (raw) saveData = JSON.parse(raw);
        } catch (e) { /* パース失敗時は無視 */ }

        if (!saveData) return;  // セーブデータなし

        const btnY = height * 0.74;
        const btnW = 200;
        const btnH = 40;

        // ボタン背景
        const btnBg = this.add.graphics();
        btnBg.fillStyle(0x2a2850, 0.9);
        btnBg.fillRoundedRect(width / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
        btnBg.lineStyle(1, 0xffd700, 0.3);
        btnBg.strokeRoundedRect(width / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);

        // ボタンテキスト
        const label = `▶ つづきから (Week${saveData.week})`;
        const btnText = this.add.text(width / 2, btnY, label, {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '14px',
            color: '#ccccee', fontStyle: 'bold',
        }).setOrigin(0.5);

        // クリック判定ゾーン
        const hit = this.add.zone(width / 2, btnY, btnW, btnH)
            .setInteractive({ useHandCursor: true });

        hit.on('pointerover', () => {
            btnBg.clear();
            btnBg.fillStyle(COLORS.BTN_HOVER, 0.9);
            btnBg.fillRoundedRect(width / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
            btnText.setColor('#ffffff');
        });
        hit.on('pointerout', () => {
            btnBg.clear();
            btnBg.fillStyle(0x2a2850, 0.9);
            btnBg.fillRoundedRect(width / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
            btnBg.lineStyle(1, 0xffd700, 0.3);
            btnBg.strokeRoundedRect(width / 2 - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
            btnText.setColor('#ccccee');
        });
        hit.on('pointerdown', () => {
            this.cameras.main.flash(200, 255, 215, 0, false);
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                // セーブデータからMainSceneを開始
                this.scene.start('MainScene', {
                    week: saveData.week,
                    turn: saveData.turn,
                    stats: { ...saveData.stats },
                    unlockedCommands: saveData.unlockedCommands || [],
                });
            });
        });
    }
}
