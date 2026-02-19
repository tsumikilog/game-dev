/* ===========================================
   EventScene.js — イベントシーン（VN風）
   固定イベント / ランダムイベント の演出
   選択肢分岐 + ステータス変動
   =========================================== */

class EventScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EventScene' });
    }

    init(data) {
        this.week = data.week;
        this.turn = data.turn;
        this.stats = { ...data.stats };
        this.eventId = data.eventId;
        // 解放済みコマンドを引き継ぎ
        this.unlockedCommands = data.unlockedCommands ? [...data.unlockedCommands] : [];
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor(0x0d0a25);

        // イベントデータ取得
        this.event = EVENTS.find(e => e.id === this.eventId);
        if (!this.event) {
            // イベントが見つからない場合はMainSceneに戻る
            this.scene.start('MainScene', {
                week: this.week, turn: this.turn, stats: this.stats,
            });
            return;
        }

        // 背景装飾
        const bg = this.add.graphics();
        bg.fillStyle(0xff6600, 0.05);
        bg.fillCircle(width / 2, height * 0.30, 250);

        // 「EVENT」ラベル
        this.add.text(width / 2, 20, '✨ EVENT', {
            fontFamily: 'Orbitron, sans-serif', fontSize: '16px',
            color: '#ffd700', fontStyle: 'bold', letterSpacing: 4,
        }).setOrigin(0.5);

        this.add.text(width / 2, 42, this.event.name, {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '18px',
            color: '#ffffff', fontStyle: 'bold',
        }).setOrigin(0.5);

        // キャラ絵文字（コンパクトに配置）
        this.characterEmoji = this.add.text(width / 2, 115, '❓', {
            fontSize: '56px',
        }).setOrigin(0.5);

        // テキストボックス
        this.createTextBox(width, height);

        // ダイアログ再生
        this.dialogueIndex = 0;
        this.showDialogue(this.event.dialogue[0]);

        // クリックで進む
        this.input.on('pointerdown', () => this.nextDialogue());

        // ========== SKIPボタン ==========
        const skipBtn = this.add.text(width - 20, 20, '⏩ SKIP', {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '13px',
            color: '#666688', fontStyle: 'bold',
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
        skipBtn.on('pointerover', () => skipBtn.setColor('#ffd700'));
        skipBtn.on('pointerout', () => skipBtn.setColor('#666688'));
        skipBtn.on('pointerdown', (pointer) => {
            pointer.event.stopPropagation();  // 通常のクリック進行と衝突しないように
            this.skipEvent();
        });

        this.cameras.main.fadeIn(400, 0, 0, 0);
    }

    // テキストボックス（上寄せ配置で選択肢の余地を確保）
    createTextBox(w, h) {
        const boxY = 170;
        const boxH = 90;
        const margin = 15;

        this.textBoxBg = this.add.graphics();
        this.textBoxBg.fillStyle(COLORS.TEXTBOX_BG, 0.92);
        this.textBoxBg.fillRoundedRect(margin, boxY, w - margin * 2, boxH, 10);
        this.textBoxBg.lineStyle(2, 0xff8c00, 0.4);
        this.textBoxBg.strokeRoundedRect(margin, boxY, w - margin * 2, boxH, 10);

        this.speakerText = this.add.text(margin + 14, boxY + 8, '', {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '11px',
            color: '#ffd700', fontStyle: 'bold',
        });

        this.dialogueText = this.add.text(margin + 14, boxY + 26, '', {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '15px',
            color: '#ffffff', lineSpacing: 5,
            wordWrap: { width: w - margin * 2 - 28 },
        });

        // ▼マーク
        this.nextIndicator = this.add.text(w - margin - 18, boxY + boxH - 16, '▼', {
            fontSize: '12px', color: '#ffd700',
        }).setOrigin(0.5);
        this.tweens.add({
            targets: this.nextIndicator, y: this.nextIndicator.y + 5,
            duration: 600, yoyo: true, repeat: -1,
        });

        this.textBoxY = boxY;
        this.textBoxH = boxH;
    }

    // セリフ表示
    showDialogue(d) {
        this.speakerText.setText(d.speaker);
        if (d.speaker === 'ナレーション') {
            this.speakerText.setColor('#aaaacc');
            this.dialogueText.setColor('#ccccdd');
        } else {
            this.speakerText.setColor('#ffd700');
            this.dialogueText.setColor('#ffffff');
        }

        // タイプライター
        this.isTyping = true;
        this.fullText = d.text;
        this.dialogueText.setText('');
        let i = 0;
        if (this.typeTimer) this.typeTimer.destroy();
        this.typeTimer = this.time.addEvent({
            delay: 30,
            repeat: d.text.length - 1,
            callback: () => {
                i++;
                this.dialogueText.setText(d.text.substring(0, i));
                if (i >= d.text.length) this.isTyping = false;
            },
        });

        // 絵文字更新
        this.updateEmoji(d.speaker);
    }

    updateEmoji(speaker) {
        const emojis = {
            '主人公': '😓', '妻': '👩', '子供': '👧',
            '朝活仲間': '🧑‍💻', '同僚': '👨‍💼', '上司': '👔',
            'ナレーション': '📖',
        };
        this.characterEmoji.setText(emojis[speaker] || '❓');
    }

    // 次のセリフ / 選択肢表示
    nextDialogue() {
        // タイプ中ならスキップ
        if (this.isTyping) {
            if (this.typeTimer) this.typeTimer.destroy();
            this.dialogueText.setText(this.fullText);
            this.isTyping = false;
            return;
        }

        this.dialogueIndex++;
        if (this.dialogueIndex < this.event.dialogue.length) {
            // まだセリフがある
            this.showDialogue(this.event.dialogue[this.dialogueIndex]);
        } else {
            // セリフ完了 → 選択肢 or 自動効果
            this.input.off('pointerdown');
            if (this.event.choices) {
                this.showChoices();
            } else {
                // 固定イベント（選択肢なし）
                this.applyAutoEffect();
            }
        }
    }

    // ========== 選択肢表示 ==========
    showChoices() {
        const { width, height } = this.cameras.main;
        this.nextIndicator.setVisible(false);

        // 選択肢の数に応じて下からレイアウト
        const choiceCount = this.event.choices.length;
        const btnH = 44;
        const gap = 8;
        const totalH = choiceCount * btnH + (choiceCount - 1) * gap;
        // 画面下部に配置（余裕を持って）
        const startY = height - totalH - 15;
        const btnW = width - 40;

        this.event.choices.forEach((choice, i) => {
            const y = startY + i * (btnH + gap);
            const colors = [0x2a4a80, 0x6a2a50, 0x2a6a3a];
            const hoverColors = [0x3a6aa0, 0x8a3a60, 0x3a8a4a];
            const baseColor = colors[i] || colors[0];
            const hoverColor = hoverColors[i] || hoverColors[0];

            const bg = this.add.graphics();
            bg.fillStyle(baseColor, 0.85);
            bg.fillRoundedRect(20, y, btnW, btnH, 8);

            const text = this.add.text(width / 2, y + btnH / 2, choice.text, {
                fontFamily: 'Noto Sans JP, sans-serif', fontSize: '14px',
                color: '#ffffff', fontStyle: 'bold',
            }).setOrigin(0.5);

            const hit = this.add.zone(width / 2, y + btnH / 2, btnW, btnH)
                .setInteractive({ useHandCursor: true });

            hit.on('pointerover', () => {
                bg.clear();
                bg.fillStyle(hoverColor, 1);
                bg.fillRoundedRect(20, y, btnW, btnH, 8);
                text.setScale(1.03);
            });
            hit.on('pointerout', () => {
                bg.clear();
                bg.fillStyle(baseColor, 0.85);
                bg.fillRoundedRect(20, y, btnW, btnH, 8);
                text.setScale(1);
            });
            hit.on('pointerdown', () => {
                this.selectChoice(choice);
            });
        });
    }

    // 選択肢実行
    selectChoice(choice) {
        // ステータス適用
        Object.keys(choice.effects).forEach(key => {
            this.stats[key] = Math.max(0, Math.min(
                BALANCE.MAX_STATS[key],
                this.stats[key] + choice.effects[key]
            ));
        });

        // 選択結果のダイアログを再生
        if (choice.response && choice.response.length > 0) {
            this.playResponse(choice.response, 0);
        } else {
            this.returnToMain();
        }
    }

    // 選択結果ダイアログ再生
    playResponse(responses, idx) {
        if (idx >= responses.length) {
            // ===== BAD END判定 =====
            this.checkBadEndOrReturn();
            return;
        }
        this.showDialogue(responses[idx]);

        // 使い捨てリスナー
        const handler = () => {
            if (this.isTyping) {
                if (this.typeTimer) this.typeTimer.destroy();
                this.dialogueText.setText(this.fullText);
                this.isTyping = false;
                this.input.once('pointerdown', handler);
                return;
            }
            this.playResponse(responses, idx + 1);
        };
        this.input.once('pointerdown', handler);
    }

    // 自動効果（固定イベント用）
    applyAutoEffect() {
        if (this.event.autoEffect) {
            Object.keys(this.event.autoEffect).forEach(key => {
                this.stats[key] = Math.max(0, Math.min(
                    BALANCE.MAX_STATS[key],
                    this.stats[key] + this.event.autoEffect[key]
                ));
            });
        }

        // クリックでBAD END判定→MainSceneに戻る
        this.input.once('pointerdown', () => this.checkBadEndOrReturn());
    }

    // ===== BAD END判定 =====
    // 体力0 or 家族0ならEndingSceneへ直行、そうでなければMainSceneへ戻る
    checkBadEndOrReturn() {
        if (this.stats.stamina <= 0 || this.stats.family <= 0) {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('EndingScene', { stats: { ...this.stats } });
            });
        } else {
            this.returnToMain();
        }
    }

    // ========== イベントダイアログをスキップ ==========
    skipEvent() {
        // タイプライターを停止
        if (this.typeTimer) this.typeTimer.destroy();
        this.isTyping = false;
        // クリックリスナーを解除
        this.input.off('pointerdown');

        if (this.event.choices) {
            // 選択肢があるイベント → 最後のセリフを表示して選択肢へ
            const lastDialogue = this.event.dialogue[this.event.dialogue.length - 1];
            this.showDialogue(lastDialogue);
            // タイプライターも即座に完了させる
            if (this.typeTimer) this.typeTimer.destroy();
            this.dialogueText.setText(lastDialogue.text);
            this.isTyping = false;
            this.showChoices();
        } else {
            // 選択肢なし（固定イベント） → 自動効果を適用して戻る
            this.applyAutoEffect();
        }
    }

    // MainSceneに戻る（eventDone=true で再イベント防止）
    returnToMain() {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MainScene', {
                week: this.week,
                turn: this.turn,
                stats: { ...this.stats },
                eventDone: true,
                unlockedCommands: [...this.unlockedCommands],  // 解放済み情報を引き継ぎ
            });
        });
    }
}
