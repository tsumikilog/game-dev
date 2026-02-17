/* ===========================================
   EndingScene.js — エンディング + リザルト + BtoB導線
   ステータスに応じた3種のエンディング分岐
   =========================================== */

class EndingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EndingScene' });
    }

    init(data) {
        this.stats = { ...data.stats };
        // エンディング判定
        this.ending = ENDINGS.find(e => e.condition(this.stats));
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor(0x080618);

        // 背景装飾
        const bg = this.add.graphics();
        bg.fillStyle(0xffd700, 0.04);
        bg.fillCircle(width / 2, height * 0.25, 200);

        // ========== エンディングタイトル ==========
        this.add.text(width / 2, 35, this.ending.name, {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '22px',
            color: '#ffd700', fontStyle: 'bold',
        }).setOrigin(0.5);

        // ========== エンディングストーリー（VN風） ==========
        this.characterEmoji = this.add.text(width / 2, height * 0.20, '🎬', {
            fontSize: '56px',
        }).setOrigin(0.5);

        // テキストボックス
        this.createTextBox(width, height);

        // ストーリー再生
        this.storyIndex = 0;
        this.showDialogue(this.ending.story[0]);

        this.input.on('pointerdown', () => this.nextDialogue());

        this.cameras.main.fadeIn(800, 0, 0, 0);
    }

    createTextBox(w, h) {
        const boxY = h * 0.40;
        const boxH = 100;
        const margin = 25;

        this.textBoxBg = this.add.graphics();
        this.textBoxBg.fillStyle(COLORS.TEXTBOX_BG, 0.92);
        this.textBoxBg.fillRoundedRect(margin, boxY, w - margin * 2, boxH, 12);
        this.textBoxBg.lineStyle(2, 0xffd700, 0.3);
        this.textBoxBg.strokeRoundedRect(margin, boxY, w - margin * 2, boxH, 12);

        this.speakerText = this.add.text(margin + 16, boxY + 10, '', {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '12px',
            color: '#ffd700', fontStyle: 'bold',
        });
        this.dialogueText = this.add.text(margin + 16, boxY + 30, '', {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '15px',
            color: '#ffffff', lineSpacing: 6,
            wordWrap: { width: w - margin * 2 - 32 },
        });
    }

    showDialogue(d) {
        this.speakerText.setText(d.speaker);
        this.speakerText.setColor(d.speaker === 'ナレーション' ? '#aaaacc' : '#ffd700');
        this.dialogueText.setColor(d.speaker === 'ナレーション' ? '#ccccdd' : '#ffffff');

        this.isTyping = true;
        this.fullText = d.text;
        this.dialogueText.setText('');
        let i = 0;
        if (this.typeTimer) this.typeTimer.destroy();
        this.typeTimer = this.time.addEvent({
            delay: 40,
            repeat: d.text.length - 1,
            callback: () => {
                i++;
                this.dialogueText.setText(d.text.substring(0, i));
                if (i >= d.text.length) this.isTyping = false;
            },
        });

        const emojis = { '主人公': '😤', '妻': '👩', 'ナレーション': '📖' };
        this.characterEmoji.setText(emojis[d.speaker] || '🎬');
    }

    nextDialogue() {
        if (this.isTyping) {
            if (this.typeTimer) this.typeTimer.destroy();
            this.dialogueText.setText(this.fullText);
            this.isTyping = false;
            return;
        }
        this.storyIndex++;
        if (this.storyIndex < this.ending.story.length) {
            this.showDialogue(this.ending.story[this.storyIndex]);
        } else {
            this.input.off('pointerdown');
            this.showResult();
        }
    }

    // ========== リザルト表示 ==========
    showResult() {
        const { width, height } = this.cameras.main;

        // テキストボックスをフェードアウト
        this.tweens.add({ targets: [this.textBoxBg, this.speakerText, this.dialogueText], alpha: 0, duration: 300 });
        this.tweens.add({ targets: this.characterEmoji, alpha: 0, duration: 300 });

        this.time.delayedCall(400, () => {
            // ========== ステータス結果 ==========
            let y = height * 0.28;
            this.add.text(width / 2, y - 10, '📊 最終ステータス', {
                fontFamily: 'Noto Sans JP, sans-serif', fontSize: '16px',
                color: '#ffd700', fontStyle: 'bold',
            }).setOrigin(0.5);

            STAT_CONFIG.forEach((cfg, i) => {
                const statY = y + 20 + i * 24;
                this.add.text(60, statY, `${cfg.label}`, {
                    fontFamily: 'Noto Sans JP, sans-serif', fontSize: '13px', color: '#ffffff',
                });
                this.add.text(width - 60, statY, `${this.stats[cfg.key]}`, {
                    fontFamily: 'Orbitron, sans-serif', fontSize: '13px', color: '#ffd700',
                }).setOrigin(1, 0);

                // バー
                const barW = width - 180;
                const ratio = this.stats[cfg.key] / BALANCE.MAX_STATS[cfg.key];
                const barBg = this.add.graphics();
                barBg.fillStyle(0x333355, 1);
                barBg.fillRoundedRect(100, statY + 2, barW, 10, 4);
                const barFill = this.add.graphics();
                barFill.fillStyle(cfg.color, 1);
                barFill.fillRoundedRect(100, statY + 2, barW * ratio, 10, 4);
            });

            // ========== 副業収入計算 ==========
            const income = Math.floor((this.stats.sideHustle / 100) * BALANCE.HOURLY_RATE * 40);
            const incomeY = y + 155;
            this.add.text(width / 2, incomeY, `💰 推定月収: ¥${income.toLocaleString()}`, {
                fontFamily: 'Noto Sans JP, sans-serif', fontSize: '18px',
                color: '#00ff88', fontStyle: 'bold',
            }).setOrigin(0.5);

            // ========== BtoB導線 ==========
            this.createBtoB(width, incomeY + 40);

            // ========== シェア & リトライ ==========
            this.createShareButton(width, height, income);
            this.createRetryButton(width, height);
        });
    }

    // BtoB導線
    createBtoB(w, y) {
        // 区切り線
        const line = this.add.graphics();
        line.lineStyle(1, 0xffffff, 0.1);
        line.lineBetween(w * 0.15, y, w * 0.85, y);

        let cy = y + 15;
        ENDROLL_TEXT.message.forEach(text => {
            if (text === '') { cy += 4; return; }
            this.add.text(w / 2, cy, text, {
                fontFamily: 'Noto Sans JP, sans-serif', fontSize: '12px',
                color: '#ccccee', align: 'center',
            }).setOrigin(0.5);
            cy += 16;
        });

        cy += 6;
        this.createCTALink(w / 2, cy, ENDROLL_TEXT.cta.business, 0x4a90d9);
        this.createCTALink(w / 2, cy + 26, ENDROLL_TEXT.cta.personal, 0x9b59b6);
    }

    createCTALink(x, y, cta) {
        const t = this.add.text(x, y, cta.label, {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '12px',
            color: '#ffffff', fontStyle: 'bold',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        t.on('pointerover', () => t.setColor('#ffd700'));
        t.on('pointerout', () => t.setColor('#ffffff'));
        t.on('pointerdown', () => {
            if (typeof window !== 'undefined') window.open(cta.url, '_blank');
        });
    }

    // Xシェアボタン
    createShareButton(w, h, income) {
        const btnY = h - 70;
        const btnW = 240, btnH = 36;
        const bx = w / 2 - btnW / 2;

        const bg = this.add.graphics();
        bg.fillStyle(0x1da1f2, 0.9);
        bg.fillRoundedRect(bx, btnY - btnH / 2, btnW, btnH, 8);

        this.add.text(w / 2, btnY, '𝕏  結果をシェアする', {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '13px',
            color: '#ffffff', fontStyle: 'bold',
        }).setOrigin(0.5);

        const hit = this.add.zone(w / 2, btnY, btnW, btnH)
            .setInteractive({ useHandCursor: true });

        hit.on('pointerdown', () => {
            const text = ENDROLL_TEXT.shareTemplate
                .replace('{ai}', this.stats.aiKnowledge)
                .replace('{side}', this.stats.sideHustle)
                .replace('{family}', this.stats.family)
                .replace('{ending}', this.ending.name);
            const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
            if (typeof window !== 'undefined') window.open(url, '_blank');
        });
    }

    // リトライボタン
    createRetryButton(w, h) {
        const t = this.add.text(w / 2, h - 30, '🔄 もう一度プレイ', {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '13px',
            color: '#888899',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        t.on('pointerover', () => t.setColor('#ffffff'));
        t.on('pointerout', () => t.setColor('#888899'));
        t.on('pointerdown', () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('TitleScene');
            });
        });
    }
}
