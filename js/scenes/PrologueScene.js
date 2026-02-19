/* ===========================================
   PrologueScene.js — プロローグ（VN風）
   主人公の境遇を紹介するオープニング
   =========================================== */

class PrologueScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PrologueScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor(0x0a0820);

        // プロローグのセリフデータ
        this.dialogues = [
            { speaker: 'ナレーション', text: '——ある朝。スマホのアラームが鳴った。' },
            { speaker: 'ナレーション', text: '5時30分。まだ外は薄暗い。' },
            { speaker: '主人公', text: '…もう朝か。体が重い。' },
            { speaker: 'ナレーション', text: '手取り19万。毎日12時間拘束。' },
            { speaker: 'ナレーション', text: '妻と子供を養うには、副業するしかない。' },
            { speaker: '主人公', text: 'でも…副業する時間が、どこにもない。' },
            { speaker: '主人公', text: '朝しかないんだよな…。' },
            { speaker: 'ナレーション', text: 'こうして始まった、1ヶ月間の「朝活チャレンジ」。' },
            { speaker: 'ナレーション', text: '体力も知識もゼロからのスタート。' },
            { speaker: 'ナレーション', text: 'でも、ひとつだけ持っているものがある——' },
            { speaker: '主人公', text: '変わりたい、っていう気持ちだけは。' },
            { speaker: 'ナレーション', text: '——4週間の成長ジャーニーが、今始まる。' },
        ];

        this.currentIndex = 0;  // 現在のセリフ番号

        // ========== 背景装飾 ==========
        const bg = this.add.graphics();
        bg.fillStyle(0x4a0080, 0.05);
        bg.fillCircle(width / 2, height * 0.35, 250);

        // ========== キャラ表示エリア（絵文字MVP） ==========
        this.characterEmoji = this.add.text(width / 2, height * 0.30, '😓', {
            fontSize: '80px',
        }).setOrigin(0.5);

        // ========== テキストボックス ==========
        this.createTextBox(width, height);

        // ========== 最初のセリフを表示 ==========
        this.showDialogue(this.dialogues[0]);

        // ========== クリックで次のセリフへ ==========
        this.input.on('pointerdown', () => this.nextDialogue());

        // ========== SKIPボタン ==========
        const skipBtn = this.add.text(width - 20, 20, '⏩ SKIP', {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '13px',
            color: '#666688', fontStyle: 'bold',
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
        // ホバーで色変更
        skipBtn.on('pointerover', () => skipBtn.setColor('#ffd700'));
        skipBtn.on('pointerout', () => skipBtn.setColor('#666688'));
        // クリックでプロローグ全体をスキップ
        skipBtn.on('pointerdown', () => this.skipPrologue());

        this.cameras.main.fadeIn(600, 0, 0, 0);
    }

    // テキストボックスUI作成
    createTextBox(w, h) {
        const boxY = h - 170;
        const boxH = 140;
        const boxMargin = 20;

        // テキストボックス背景
        this.textBoxBg = this.add.graphics();
        this.textBoxBg.fillStyle(COLORS.TEXTBOX_BG, 0.92);
        this.textBoxBg.fillRoundedRect(boxMargin, boxY, w - boxMargin * 2, boxH, 12);
        this.textBoxBg.lineStyle(2, COLORS.TEXTBOX_BORDER, 0.6);
        this.textBoxBg.strokeRoundedRect(boxMargin, boxY, w - boxMargin * 2, boxH, 12);

        // スピーカー名
        this.speakerText = this.add.text(boxMargin + 20, boxY + 12, '', {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '13px',
            color: '#ffd700', fontStyle: 'bold',
        });

        // セリフテキスト
        this.dialogueText = this.add.text(boxMargin + 20, boxY + 35, '', {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '17px',
            color: '#ffffff', lineSpacing: 8,
            wordWrap: { width: w - boxMargin * 2 - 40 },
        });

        // ▼マーク（次へ）
        this.nextIndicator = this.add.text(w - boxMargin - 20, boxY + boxH - 20, '▼', {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '14px',
            color: '#ffd700',
        }).setOrigin(0.5);
        this.tweens.add({
            targets: this.nextIndicator, y: this.nextIndicator.y + 5,
            duration: 600, yoyo: true, repeat: -1,
        });
    }

    // セリフを表示
    showDialogue(d) {
        this.speakerText.setText(d.speaker);

        // スピーカーに応じた色
        if (d.speaker === 'ナレーション') {
            this.speakerText.setColor('#aaaacc');
            this.dialogueText.setColor('#ccccdd');
        } else if (d.speaker === '主人公') {
            this.speakerText.setColor('#44ddff');
            this.dialogueText.setColor('#ffffff');
        } else {
            this.speakerText.setColor('#ffd700');
            this.dialogueText.setColor('#ffffff');
        }

        // タイプライター風表示
        this.isTyping = true;
        this.fullText = d.text;
        this.dialogueText.setText('');
        let charIndex = 0;

        if (this.typeTimer) this.typeTimer.destroy();
        this.typeTimer = this.time.addEvent({
            delay: 35,
            repeat: d.text.length - 1,
            callback: () => {
                charIndex++;
                this.dialogueText.setText(d.text.substring(0, charIndex));
                if (charIndex >= d.text.length) this.isTyping = false;
            },
        });

        // 絵文字変更
        this.updateCharacterEmoji(d.speaker);
    }

    // キャラ絵文字をスピーカーに応じて変更
    updateCharacterEmoji(speaker) {
        const emojis = {
            '主人公': '😓',
            'ナレーション': '📖',
            '妻': '👩',
        };
        const emoji = emojis[speaker] || '😓';
        this.characterEmoji.setText(emoji);
        // 登場アニメ
        this.characterEmoji.setScale(0.5).setAlpha(0.5);
        this.tweens.add({ targets: this.characterEmoji, scaleX: 1, scaleY: 1, alpha: 1, duration: 300 });
    }

    // 次のセリフへ
    nextDialogue() {
        // タイプ中ならスキップ
        if (this.isTyping) {
            if (this.typeTimer) this.typeTimer.destroy();
            this.dialogueText.setText(this.fullText);
            this.isTyping = false;
            return;
        }

        this.currentIndex++;
        if (this.currentIndex < this.dialogues.length) {
            this.showDialogue(this.dialogues[this.currentIndex]);
        } else {
            // プロローグ終了 → MainSceneへ
            this.cameras.main.fadeOut(600, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainScene', {
                    week: 1,
                    turn: 0,
                    stats: { ...BALANCE.INITIAL_STATS },
                    unlockedCommands: [],  // 初期状態：解放コマンドなし
                });
            });
        }
    }

    // ========== プロローグを丸ごとスキップ ==========
    skipPrologue() {
        // タイプライターを停止
        if (this.typeTimer) this.typeTimer.destroy();
        // クリックリスナーを解除
        this.input.off('pointerdown');
        // MainSceneへ直接遷移
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MainScene', {
                week: 1,
                turn: 0,
                stats: { ...BALANCE.INITIAL_STATS },
                unlockedCommands: [],
            });
        });
    }
}
