/* ===========================================
   WeekEndScene.js — 週末まとめ画面
   1週間のステータス推移を振り返る
   =========================================== */

class WeekEndScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WeekEndScene' });
    }

    init(data) {
        this.week = data.week;
        this.stats = { ...data.stats };
        // 解放済みコマンドを引き継ぎ
        this.unlockedCommands = data.unlockedCommands ? [...data.unlockedCommands] : [];
        // 前週のステータス（差分表示用）
        this.prevStats = data.prevStats ? { ...data.prevStats } : null;
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor(0x0a0825);

        // 背景装飾
        const bg = this.add.graphics();
        bg.fillStyle(0xffd700, 0.03);
        bg.fillCircle(width / 2, height * 0.35, 250);

        // ========== Week完了タイトル ==========
        this.add.text(width / 2, 40, `📊 Week ${this.week} 完了！`, {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '26px',
            color: '#ffd700', fontStyle: 'bold',
        }).setOrigin(0.5);

        const weekMessages = {
            1: '気合いだけの日々…大変だった。',
            2: 'AIとの出会いで世界が変わり始めた。',
            3: 'AIエージェントの力、ヤバい。',
            4: '最終week完了！自分でAIを作る側に。',
        };
        this.add.text(width / 2, 72, weekMessages[this.week] || '', {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '14px',
            color: '#aaaacc',
        }).setOrigin(0.5);

        // ========== ステータス表示 ==========
        const startY = 110;
        STAT_CONFIG.forEach((cfg, i) => {
            const y = startY + i * 52;
            const val = this.stats[cfg.key];
            const max = BALANCE.MAX_STATS[cfg.key];
            const ratio = Math.max(0, Math.min(1, val / max));

            // ラベル
            this.add.text(40, y, cfg.label, {
                fontFamily: 'Noto Sans JP, sans-serif', fontSize: '15px',
                color: '#ffffff', fontStyle: 'bold',
            });

            // 数値
            this.add.text(width - 40, y, `${val} / ${max}`, {
                fontFamily: 'Orbitron, sans-serif', fontSize: '14px',
                color: '#ffd700',
            }).setOrigin(1, 0);

            // 前週との差分表示
            if (this.prevStats) {
                const diff = val - (this.prevStats[cfg.key] || 0);
                if (diff !== 0) {
                    const sign = diff > 0 ? '▲+' : '▼';
                    const color = diff > 0 ? '#44ff88' : '#ff4444';
                    this.add.text(width - 40, y + 16, `${sign}${diff}`, {
                        fontFamily: 'Noto Sans JP, sans-serif', fontSize: '11px',
                        color: color,
                    }).setOrigin(1, 0);
                }
            }

            // バー
            const barW = width - 80;
            const barH = 14;
            const barY = y + 22;

            const barBg = this.add.graphics();
            barBg.fillStyle(0x333355, 1);
            barBg.fillRoundedRect(40, barY, barW, barH, 5);

            const barFill = this.add.graphics();
            // アニメーション付きでバーを伸ばす
            this.tweens.addCounter({
                from: 0, to: ratio,
                duration: 800, delay: i * 150,
                ease: 'Power2',
                onUpdate: (tween) => {
                    barFill.clear();
                    barFill.fillStyle(cfg.color, 1);
                    barFill.fillRoundedRect(40, barY, barW * tween.getValue(), barH, 5);
                },
            });
        });

        // ========== 次へボタン ==========
        const btnY = height - 65;
        if (this.week < BALANCE.TOTAL_WEEKS) {
            this.createNextButton(width, btnY, `➡️  Week ${this.week + 1} へ`);
        } else {
            this.createNextButton(width, btnY, '🎬  エンディングへ');
        }

        // ========== コメント ==========
        this.createWeekComment(width, height);

        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    // Week別コメント
    createWeekComment(w, h) {
        let comment = '';
        if (this.stats.stamina < 20) comment = '⚠️ 体力がヤバい…休息を忘れずに！';
        else if (this.stats.family < 30) comment = '⚠️ 家族が心配…バランスが大事。';
        else if (this.stats.aiKnowledge >= 50) comment = '💡 AI知識が育ってきた！活用していこう。';
        else if (this.stats.motivation < 40) comment = '😓 やる気が低い…休息で回復しよう。';
        else comment = '👍 いい感じ！この調子で頑張ろう。';

        this.add.text(w / 2, h - 120, comment, {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '13px',
            color: '#ffcc44',
        }).setOrigin(0.5);
    }

    // 次へボタン
    createNextButton(w, y, label) {
        const btnW = 280, btnH = 46;
        const bx = w / 2 - btnW / 2;

        const bg = this.add.graphics();
        bg.fillStyle(0x4a3f8a, 0.9);
        bg.fillRoundedRect(bx, y - btnH / 2, btnW, btnH, 10);

        const text = this.add.text(w / 2, y, label, {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '18px',
            color: '#ffffff', fontStyle: 'bold',
        }).setOrigin(0.5);

        this.tweens.add({ targets: text, scaleX: 1.03, scaleY: 1.03, duration: 800, yoyo: true, repeat: -1 });

        const hit = this.add.zone(w / 2, y, btnW, btnH)
            .setInteractive({ useHandCursor: true });

        hit.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(COLORS.BTN_HOVER, 1);
            bg.fillRoundedRect(bx, y - btnH / 2, btnW, btnH, 10);
        });
        hit.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x4a3f8a, 0.9);
            bg.fillRoundedRect(bx, y - btnH / 2, btnW, btnH, 10);
        });
        hit.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                if (this.week < BALANCE.TOTAL_WEEKS) {
                    // 次のWeekのMainSceneへ
                    this.scene.start('MainScene', {
                        week: this.week + 1,
                        turn: 0,
                        stats: { ...this.stats },
                        unlockedCommands: [...this.unlockedCommands],  // 解放済み情報を引き継ぎ
                    });
                } else {
                    // 全Week完了 → エンディング
                    this.scene.start('EndingScene', {
                        stats: { ...this.stats },
                    });
                }
            });
        });
    }
}
