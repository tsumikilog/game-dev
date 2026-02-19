/* ===========================================
   MainScene.js — メインゲーム画面
   パワプロサクセス風の行動選択 + VN演出
   ステータスバー・行動ボタン・テキストボックス
   レイアウト：
     [0-55]   ステータスバー
     [55-210]  キャラ絵文字 + シーンラベル
     [210-310] テキストボックス
     [315-595] 行動選択ボタン（8個/2列4行）
   =========================================== */

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    init(data) {
        this.week = data.week || 1;
        this.turn = data.turn || 0;
        // ステータス（オブジェクトのコピー）
        this.stats = data.stats ? { ...data.stats } : { ...BALANCE.INITIAL_STATS };
        this.isAnimating = false;
        // イベント済みフラグ（EventSceneから戻った時にtrue）
        this.eventDone = data.eventDone || false;
        // 解放済みコマンド管理（アクションIDの配列）
        this.unlockedCommands = data.unlockedCommands ? [...data.unlockedCommands] : [];
        // アンロック済みフラグ（イベント後に判定をスキップするため）
        this.unlockChecked = data.unlockChecked || false;
        // Week開始時のステータスを保存（週間レポートの差分表示用）
        this.weekStartStats = data.weekStartStats ? { ...data.weekStartStats } : { ...this.stats };
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor(0x0d0b26);

        // ========== オートセーブ ==========
        try {
            localStorage.setItem('ai_rpg_save', JSON.stringify({
                week: this.week, turn: this.turn,
                stats: this.stats,
                unlockedCommands: this.unlockedCommands,
            }));
        } catch (e) { /* localStorage使用不可の場合は無視 */ }

        // ========== 背景 ==========
        this.createBackground(width, height);

        // ========== ステータスバー（画面上部） ==========
        this.createStatusBar(width);

        // ========== 中央エリア（キャラ表示） ==========
        this.characterEmoji = this.add.text(width / 2, 120, '😤', {
            fontSize: '52px',
        }).setOrigin(0.5);

        this.sceneLabel = this.add.text(width / 2, 160, '', {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '13px',
            color: '#888899',
        }).setOrigin(0.5);

        // ========== テキストボックス（キャラの下） ==========
        this.createTextBox(width);

        // ========== イベントチェック（eventDone=falseの場合のみ） ==========
        if (!this.eventDone) {
            // 固定イベント
            const fixedEvent = EVENTS.find(e =>
                e.type === 'fixed' && e.triggerWeek === this.week && e.triggerTurn === this.turn
            );
            if (fixedEvent) {
                this.time.delayedCall(500, () => {
                    this.cameras.main.fadeOut(400, 0, 0, 0);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.start('EventScene', {
                            week: this.week, turn: this.turn,
                            stats: { ...this.stats }, eventId: fixedEvent.id,
                            unlockedCommands: [...this.unlockedCommands],
                        });
                    });
                });
                return;
            }

            // ランダムイベント
            if (Math.random() < BALANCE.EVENT_CHANCE) {
                const available = EVENTS.filter(e =>
                    e.type === 'random' && e.condition(this.stats)
                );
                if (available.length > 0) {
                    const randomEvent = available[Math.floor(Math.random() * available.length)];
                    this.time.delayedCall(500, () => {
                        this.cameras.main.fadeOut(400, 0, 0, 0);
                        this.cameras.main.once('camerafadeoutcomplete', () => {
                            this.scene.start('EventScene', {
                                week: this.week, turn: this.turn,
                                stats: { ...this.stats }, eventId: randomEvent.id,
                                unlockedCommands: [...this.unlockedCommands],
                            });
                        });
                    });
                    return;
                }
            }
        }

        // ========== アンロック判定（Week開始時、turn===0 かつイベント後） ==========
        if (this.turn === 0 && !this.unlockChecked) {
            const newUnlocks = this.checkWeeklyUnlocks();
            if (newUnlocks.length > 0) {
                // アンロック演出を表示してから行動選択へ
                this.showUnlockAnimation(newUnlocks, () => {
                    this.showDialogueText('ナレーション', '何をする？ 行動を選ぼう。');
                    this.createActionButtons(width, height);
                });
                this.cameras.main.fadeIn(400, 0, 0, 0);
                return;  // 演出完了後にボタン表示するのでここでreturn
            }
        }

        // ========== ターン情報表示 ==========
        const turnLabel = TURN_LABELS[this.turn] || '🌅 朝';
        this.sceneLabel.setText(`Week ${this.week} — ${turnLabel}`);

        // ========== 行動選択ボタン ==========
        this.showDialogueText('ナレーション', '何をする？ 行動を選ぼう。');
        this.createActionButtons(width, height);

        this.cameras.main.fadeIn(400, 0, 0, 0);
    }

    // ========== 週間アンロック判定 ==========
    // 現在のWeek以下の全条件をチェックし、新たに解放されたコマンドを返す
    checkWeeklyUnlocks() {
        const newUnlocks = [];
        BALANCE.WEEKLY_UNLOCKS.forEach(unlock => {
            // 現在のWeekが解放対象のWeek以降、かつまだ解放されていない
            if (unlock.week <= this.week
                && !this.unlockedCommands.includes(unlock.actionId)
                && this.stats[unlock.stat] >= unlock.value) {
                this.unlockedCommands.push(unlock.actionId);
                newUnlocks.push(unlock);
            }
        });
        this.unlockChecked = true;  // このWeekの判定完了
        return newUnlocks;
    }

    // ========== アンロック演出 ==========
    // 新しく解放されたコマンドを順番にアニメーション表示
    showUnlockAnimation(unlocks, onComplete) {
        const { width, height } = this.cameras.main;
        let index = 0;

        const showNext = () => {
            if (index >= unlocks.length) {
                onComplete();
                return;
            }
            const unlock = unlocks[index];
            // アンロックメッセージを表示
            const msg = this.add.text(width / 2, height * 0.45, unlock.message, {
                fontFamily: 'Noto Sans JP, sans-serif', fontSize: '20px',
                color: '#ffd700', fontStyle: 'bold',
                stroke: '#000000', strokeThickness: 3,
            }).setOrigin(0.5).setAlpha(0);

            // 解放条件テキスト
            const condition = this.add.text(width / 2, height * 0.52,
                `✔ ${STAT_CONFIG.find(s => s.key === unlock.stat).label} ${this.stats[unlock.stat]} / ${unlock.value} 達成！`, {
                fontFamily: 'Noto Sans JP, sans-serif', fontSize: '13px',
                color: '#44ff88',
            }).setOrigin(0.5).setAlpha(0);

            // フラッシュ演出
            this.cameras.main.flash(400, 255, 215, 0);

            // フェードイン
            this.tweens.add({ targets: [msg, condition], alpha: 1, duration: 600 });

            // クリックで次へ
            this.input.once('pointerdown', () => {
                this.tweens.add({
                    targets: [msg, condition], alpha: 0, duration: 300,
                    onComplete: () => {
                        msg.destroy();
                        condition.destroy();
                        index++;
                        showNext();
                    }
                });
            });
        };

        // ターン情報も表示
        const turnLabel = TURN_LABELS[this.turn] || '🌅 朝';
        this.sceneLabel.setText(`Week ${this.week} — ${turnLabel}`);

        showNext();
    }

    // ========== 背景 ==========
    createBackground(w, h) {
        const bg = this.add.graphics();
        const glowColors = [0x4a0080, 0xffa500, 0x1a0060];
        const glowColor = glowColors[this.turn] || 0x4a0080;
        bg.fillStyle(glowColor, 0.06);
        bg.fillCircle(w / 2, 130, 150);
        // ヘッダー背景
        bg.fillStyle(0x000000, 0.4);
        bg.fillRect(0, 0, w, 55);
        // ボタンエリア背景
        bg.fillStyle(0x000000, 0.2);
        bg.fillRoundedRect(8, 315, w - 16, h - 320, 10);
    }

    // ========== ステータスバー ==========
    createStatusBar(w) {
        this.statBars = {};
        this.statTexts = {};
        const barW = (w - 30) / STAT_CONFIG.length - 4;
        const barH = 8;
        const startX = 15;
        const y = 8;

        STAT_CONFIG.forEach((cfg, i) => {
            const x = startX + i * (barW + 4);
            const val = this.stats[cfg.key];
            const max = BALANCE.MAX_STATS[cfg.key];
            const ratio = Math.max(0, Math.min(1, val / max));

            // ラベル
            this.add.text(x, y, cfg.label, {
                fontFamily: 'Noto Sans JP, sans-serif', fontSize: '10px',
                color: '#aaaacc',
            });

            // 数値
            this.statTexts[cfg.key] = this.add.text(x + barW, y, `${val}`, {
                fontFamily: 'Orbitron, sans-serif', fontSize: '10px',
                color: '#ffffff',
            }).setOrigin(1, 0);

            // バー背景
            const barBg = this.add.graphics();
            barBg.fillStyle(0x333355, 1);
            barBg.fillRoundedRect(x, y + 16, barW, barH, 3);

            // バー本体
            const barFill = this.add.graphics();
            barFill.fillStyle(cfg.color, 1);
            barFill.fillRoundedRect(x, y + 16, barW * ratio, barH, 3);

            this.statBars[cfg.key] = { bg: barBg, fill: barFill, x, y: y + 16, width: barW, height: barH, color: cfg.color };
        });

        // Week/Turn表示
        const turnLabel = TURN_LABELS[this.turn] || '🌅 朝';
        this.add.text(w / 2, 40, `Week ${this.week} — ${turnLabel}  (${this.getGlobalTurn()}/12)`, {
            fontFamily: 'Orbitron, sans-serif', fontSize: '11px',
            color: '#ffd700',
        }).setOrigin(0.5);
    }

    // ========== ステータスバー更新 ==========
    // 行動適用後にバーと数値を再描画（アニメーション付き）
    updateStatusBars() {
        STAT_CONFIG.forEach(cfg => {
            const bar = this.statBars[cfg.key];
            if (!bar) return;
            const val = this.stats[cfg.key];
            const max = BALANCE.MAX_STATS[cfg.key];
            const ratio = Math.max(0, Math.min(1, val / max));

            // バー再描画
            bar.fill.clear();
            bar.fill.fillStyle(bar.color, 1);
            bar.fill.fillRoundedRect(bar.x, bar.y, bar.width * ratio, bar.height, 3);

            // 数値更新
            if (this.statTexts[cfg.key]) {
                this.statTexts[cfg.key].setText(`${val}`);
            }
        });
    }

    getGlobalTurn() {
        return (this.week - 1) * BALANCE.TURNS_PER_WEEK + this.turn + 1;
    }

    // ステータスバー更新
    updateStatBars() {
        STAT_CONFIG.forEach(cfg => {
            const val = this.stats[cfg.key];
            const max = BALANCE.MAX_STATS[cfg.key];
            const ratio = Math.max(0, Math.min(1, val / max));
            const bar = this.statBars[cfg.key];
            bar.fill.clear();
            bar.fill.fillStyle(bar.color, 1);
            bar.fill.fillRoundedRect(bar.x, bar.y, bar.width * ratio, bar.height, 3);
            this.statTexts[cfg.key].setText(`${val}`);
        });
    }

    // ========== テキストボックス（固定位置: y=185〜295） ==========
    createTextBox(w) {
        const boxY = 185;
        const boxH = 85;
        const margin = 15;

        this.textBoxGraphics = this.add.graphics();
        this.textBoxGraphics.fillStyle(COLORS.TEXTBOX_BG, 0.92);
        this.textBoxGraphics.fillRoundedRect(margin, boxY, w - margin * 2, boxH, 10);
        this.textBoxGraphics.lineStyle(2, COLORS.TEXTBOX_BORDER, 0.6);
        this.textBoxGraphics.strokeRoundedRect(margin, boxY, w - margin * 2, boxH, 10);

        this.speakerText = this.add.text(margin + 14, boxY + 8, '', {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '11px',
            color: '#ffd700', fontStyle: 'bold',
        });

        this.dialogueText = this.add.text(margin + 14, boxY + 26, '', {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '14px',
            color: '#ffffff', lineSpacing: 5,
            wordWrap: { width: w - margin * 2 - 28 },
        });
    }

    showDialogueText(speaker, text) {
        this.speakerText.setText(speaker);
        this.dialogueText.setText(text);
        this.speakerText.setColor(speaker === 'ナレーション' ? '#aaaacc' : '#ffd700');
    }

    // ========== 行動選択ボタン（固定位置: y=320〜） ==========
    createActionButtons(w, h) {
        this.actionButtons = [];
        const available = ACTIONS.filter(a => {
            // requiresUnlockがないコマンドは常に使用可能
            if (!a.requiresUnlock) return true;
            // requiresUnlock=true のコマンドは、unlockedCommandsに含まれていれば使用可能
            return this.unlockedCommands.includes(a.id);
        });
        const locked = ACTIONS.filter(a => {
            if (!a.requiresUnlock) return false;
            return !this.unlockedCommands.includes(a.id);
        });

        const all = [...available, ...locked];
        const cols = 2;
        const btnW = (w - 40) / cols;
        const gap = 4;
        const rows = Math.ceil(all.length / cols);
        // ボタンエリア: y=290 からy=595 まで使う（下詰め）
        const areaTop = 290;
        const areaBottom = h - 5;
        const areaH = areaBottom - areaTop;
        const btnH = Math.min(48, Math.floor((areaH - (rows - 1) * gap) / rows));
        const totalH = rows * btnH + (rows - 1) * gap;
        const startY = areaTop + Math.floor((areaH - totalH) / 2);

        all.forEach((action, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = 12 + col * (btnW + gap);
            const y = startY + row * (btnH + gap);
            const isLocked = locked.includes(action);
            const isDisabled = isLocked || this.stats.stamina + action.effects.stamina < 0;

            const btnBg = this.add.graphics();
            const color = isDisabled ? COLORS.BTN_DISABLED : this.getActionColor(action);
            this.drawBtn(btnBg, x, y, btnW, btnH, color, isDisabled ? 0.5 : 0.85);

            const label = isLocked ? `🔒 ${action.name}` : action.name;

            const nameText = this.add.text(x + btnW / 2, y + 10, label, {
                fontFamily: 'Noto Sans JP, sans-serif', fontSize: '11px',
                color: isDisabled ? '#666666' : '#ffffff', fontStyle: 'bold',
            }).setOrigin(0.5);

            this.add.text(x + btnW / 2, y + 24, isLocked ? '次のWeek開始時に判定' : action.description, {
                fontFamily: 'Noto Sans JP, sans-serif', fontSize: '9px',
                color: isDisabled ? '#555555' : '#aaaacc',
            }).setOrigin(0.5);

            if (!isDisabled) {
                const hit = this.add.zone(x + btnW / 2, y + btnH / 2, btnW, btnH)
                    .setInteractive({ useHandCursor: true });

                hit.on('pointerover', () => {
                    if (this.isAnimating) return;
                    btnBg.clear();
                    this.drawBtn(btnBg, x, y, btnW, btnH, color, 1);
                    nameText.setScale(1.03);
                    this.showEffectPreview(action);
                });
                hit.on('pointerout', () => {
                    btnBg.clear();
                    this.drawBtn(btnBg, x, y, btnW, btnH, color, 0.85);
                    nameText.setScale(1);
                    this.showDialogueText('ナレーション', '何をする？ 行動を選ぼう。');
                });
                hit.on('pointerdown', () => {
                    if (this.isAnimating) return;
                    this.executeAction(action);
                });
                this.actionButtons.push({ hit });
            }
        });
    }

    getActionColor(action) {
        const colors = {
            'morning_exercise': COLORS.BTN_NORMAL,
            'study_ai': 0x2196f3,
            'side_hustle': 0x6a5fba,
            'family_time': 0xd45088,
            'rest': 0x4a7c59,
            'use_chatgpt': COLORS.BTN_AI_MID,
            'use_openclaw': COLORS.BTN_AI_HIGH,
            'build_gijiroku': COLORS.BTN_AI_SUPER,
        };
        return colors[action.id] || COLORS.BTN_NORMAL;
    }

    drawBtn(g, x, y, w, h, color, alpha) {
        g.fillStyle(color, alpha);
        g.fillRoundedRect(x, y, w, h, 8);
        g.fillStyle(0xffffff, 0.05);
        g.fillRoundedRect(x + 1, y + 1, w - 2, h / 2.5, { tl: 7, tr: 7, bl: 0, br: 0 });
    }

    // 効果プレビュー（テキストボックスに表示）
    showEffectPreview(action) {
        const parts = [];
        const e = action.effects;
        if (e.stamina !== 0) parts.push(`💪${e.stamina > 0 ? '+' : ''}${e.stamina}`);
        if (e.aiKnowledge !== 0) parts.push(`🧠${e.aiKnowledge > 0 ? '+' : ''}${e.aiKnowledge}`);
        if (e.sideHustle !== 0) parts.push(`💼${e.sideHustle > 0 ? '+' : ''}${e.sideHustle}`);
        if (e.family !== 0) parts.push(`👨‍👩‍👧${e.family > 0 ? '+' : ''}${e.family}`);
        if (e.motivation !== 0) parts.push(`🔥${e.motivation > 0 ? '+' : ''}${e.motivation}`);
        this.showDialogueText('効果', parts.join('  '));
    }

    // ========== 行動実行 ==========
    executeAction(action) {
        this.isAnimating = true;
        this.actionButtons.forEach(b => b.hit.disableInteractive());

        // やる気ボーナス計算
        let multiplier = 1.0;
        if (this.stats.motivation >= BALANCE.MOTIVATION_HIGH) multiplier = 1.3;
        else if (this.stats.motivation <= BALANCE.MOTIVATION_LOW) multiplier = 0.7;

        // ステータス反映
        const applied = {};
        Object.keys(action.effects).forEach(key => {
            let val = action.effects[key];
            if (val > 0) val = Math.floor(val * multiplier);
            applied[key] = val;
            this.stats[key] = Math.max(0, Math.min(
                BALANCE.MAX_STATS[key],
                this.stats[key] + val
            ));
        });

        this.updateStatBars();
        this.playActionDialogue(action, applied);
    }

    // 行動実行時のダイアログ再生
    // ダイアログを1つずつ表示し、クリックで次へ進む
    // 2回連続クリックで残りのダイアログをスキップ
    playActionDialogue(action, applied) {
        let index = 0;
        const dialogues = action.dialogue;

        const showNext = () => {
            if (index < dialogues.length) {
                const d = dialogues[index];
                this.showDialogueText(d.speaker, d.text);
                this.updateCharacterEmoji(d.speaker);
                index++;
                this.input.once('pointerdown', showNext);
            } else {
                this.showResultAndProceed(applied);
            }
        };

        // SKIPボタン（ダイアログ中のみ表示）
        const { width } = this.cameras.main;
        const skipBtn = this.add.text(width - 15, 315, '⏩ SKIP', {
            fontFamily: 'Noto Sans JP, sans-serif', fontSize: '11px',
            color: '#666688', fontStyle: 'bold',
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(10);
        skipBtn.on('pointerover', () => skipBtn.setColor('#ffd700'));
        skipBtn.on('pointerout', () => skipBtn.setColor('#666688'));
        skipBtn.on('pointerdown', () => {
            // ダイアログを全スキップして結果表示へ
            this.input.off('pointerdown');
            skipBtn.destroy();
            this.showResultAndProceed(applied);
        });

        showNext();
    }

    // 変動結果表示 → 次のターンへ（BAD END判定含む）
    showResultAndProceed(applied) {
        const parts = [];
        Object.keys(applied).forEach(key => {
            if (applied[key] !== 0) {
                const cfg = STAT_CONFIG.find(s => s.key === key);
                const sign = applied[key] > 0 ? '+' : '';
                parts.push(`${cfg.label} ${sign}${applied[key]}`);
            }
        });
        // テキストボックスに結果を表示
        this.showDialogueText('結果', parts.join('  '));

        // ========== ステータス変動ポップアップ演出 ==========
        this.showStatPopups(applied);

        // ステータスバーも更新
        this.updateStatusBars();

        // クリックで次へ
        this.input.once('pointerdown', () => {
            // ===== BAD END判定 =====
            if (this.stats.stamina <= 0 || this.stats.family <= 0) {
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('EndingScene', { stats: { ...this.stats } });
                });
                return;
            }
            this.goToNextTurn();
        });
    }

    // ========== ステータス変動ポップアップ ==========
    // 各ステータスバーの横に +10 / -5 を表示し、浮き上がってフェードアウト
    showStatPopups(applied) {
        const { width } = this.cameras.main;
        const startX = 15;
        const barW = (width - 30) / STAT_CONFIG.length - 4;

        STAT_CONFIG.forEach((cfg, i) => {
            const val = applied[cfg.key];
            if (!val || val === 0) return;

            const x = startX + i * (barW + 4) + barW / 2;
            const y = 38;  // ステータスバーの下
            const sign = val > 0 ? '+' : '';
            const color = val > 0 ? '#44ff88' : '#ff4444';

            const popup = this.add.text(x, y, `${sign}${val}`, {
                fontFamily: 'Orbitron, sans-serif', fontSize: '14px',
                color: color, fontStyle: 'bold',
                stroke: '#000000', strokeThickness: 2,
            }).setOrigin(0.5).setAlpha(0).setDepth(20);

            // フェードイン → 上に浮き上がってフェードアウト
            this.tweens.add({
                targets: popup, alpha: 1, y: y - 5,
                duration: 300, delay: i * 100,
                onComplete: () => {
                    this.tweens.add({
                        targets: popup, alpha: 0, y: y - 20,
                        duration: 800, delay: 600,
                        onComplete: () => popup.destroy(),
                    });
                },
            });
        });
    }

    updateCharacterEmoji(speaker) {
        const emojis = {
            '主人公': '😤', 'ナレーション': '📖', '妻': '👩',
            '朝活仲間': '🧑‍💻', '同僚': '👨‍💼', '子供': '👧',
            '上司': '👔', 'メンター': '🧑‍🏫', 'クライアント': '💼',
            '効果': '📊', '結果': '📊',
        };
        this.characterEmoji.setText(emojis[speaker] || '😤');
    }

    // ========== 次のターンへ遷移 ==========
    goToNextTurn() {
        const nextTurn = this.turn + 1;

        if (nextTurn >= BALANCE.TURNS_PER_WEEK) {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('WeekEndScene', {
                    week: this.week, stats: { ...this.stats },
                    unlockedCommands: [...this.unlockedCommands],
                    prevStats: { ...this.weekStartStats },  // 差分表示用
                });
            });
        } else {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainScene', {
                    week: this.week, turn: nextTurn, stats: { ...this.stats },
                    unlockedCommands: [...this.unlockedCommands],
                    unlockChecked: this.unlockChecked,
                    weekStartStats: { ...this.weekStartStats },  // 同Week内は引き継ぐ
                });
            });
        }
    }
}
