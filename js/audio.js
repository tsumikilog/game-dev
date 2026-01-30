/* ==========================================
   audio.js - オーディオマネージャー
   BGM、SE、Web Audio API対応
   ========================================== */

/**
 * オーディオマネージャー
 * ゲームのサウンドを管理
 */
class AudioManager {
    constructor() {
        // Web Audio APIコンテキスト
        this.audioContext = null;
        this.initialized = false;

        // 音量設定
        this.masterVolume = 0.7;
        this.sfxVolume = 0.8;
        this.bgmVolume = 0.5;

        // サウンドエフェクト用オシレータープール
        this.oscillators = [];

        // BGM用（将来のため）
        this.currentBGM = null;
    }

    /**
     * オーディオコンテキストを初期化
     * ユーザーインタラクション後に呼び出す必要がある
     */
    init() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(this.audioContext.destination);
            this.initialized = true;
            console.log('🔊 Audio initialized');
        } catch (e) {
            console.warn('Audio API not supported:', e);
        }
    }

    /**
     * シンセサイザー音を再生
     * @param {Object} config - 音の設定
     */
    playSynth(config) {
        if (!this.initialized || !this.audioContext) return;

        const {
            frequency = 440,
            type = 'sine',       // sine, square, sawtooth, triangle
            duration = 0.1,
            volume = 0.3,
            attack = 0.01,
            decay = 0.1
        } = config;

        const now = this.audioContext.currentTime;

        // オシレーター（音源）を作成
        const osc = this.audioContext.createOscillator();
        osc.type = type;
        osc.frequency.value = frequency;

        // ゲイン（音量）を作成
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume * this.sfxVolume, now + attack);
        gainNode.gain.linearRampToValueAtTime(0, now + attack + decay);

        // 接続
        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        // 再生
        osc.start(now);
        osc.stop(now + duration);
    }

    /**
     * 攻撃音（戦士）
     */
    playWarriorAttack() {
        this.playSynth({
            frequency: 150,
            type: 'sawtooth',
            duration: 0.15,
            volume: 0.2,
            attack: 0.01,
            decay: 0.12
        });
    }

    /**
     * 攻撃音（弓使い）
     */
    playArcherAttack() {
        this.playSynth({
            frequency: 800,
            type: 'sine',
            duration: 0.08,
            volume: 0.15,
            attack: 0.005,
            decay: 0.07
        });
        // 矢が飛ぶ音
        setTimeout(() => {
            this.playSynth({
                frequency: 400,
                type: 'sine',
                duration: 0.05,
                volume: 0.1,
                attack: 0.01,
                decay: 0.03
            });
        }, 50);
    }

    /**
     * 攻撃音（魔法使い）
     */
    playMageAttack() {
        // 魔法のスパークル音
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.playSynth({
                    frequency: 600 + Math.random() * 400,
                    type: 'sine',
                    duration: 0.2,
                    volume: 0.12,
                    attack: 0.02,
                    decay: 0.15
                });
            }, i * 30);
        }
    }

    /**
     * 敵撃破音
     */
    playEnemyDeath() {
        // 爆発音
        this.playSynth({
            frequency: 100,
            type: 'sawtooth',
            duration: 0.3,
            volume: 0.25,
            attack: 0.01,
            decay: 0.25
        });
        // ポップ音
        setTimeout(() => {
            this.playSynth({
                frequency: 300,
                type: 'sine',
                duration: 0.1,
                volume: 0.2,
                attack: 0.01,
                decay: 0.08
            });
        }, 50);
    }

    /**
     * ゴールド獲得音
     */
    playGoldEarn() {
        // チャリン音
        this.playSynth({
            frequency: 1200,
            type: 'sine',
            duration: 0.15,
            volume: 0.15,
            attack: 0.005,
            decay: 0.12
        });
        setTimeout(() => {
            this.playSynth({
                frequency: 1500,
                type: 'sine',
                duration: 0.1,
                volume: 0.12,
                attack: 0.005,
                decay: 0.08
            });
        }, 80);
    }

    /**
     * タワー配置音
     */
    playTowerPlace() {
        this.playSynth({
            frequency: 200,
            type: 'triangle',
            duration: 0.2,
            volume: 0.2,
            attack: 0.01,
            decay: 0.15
        });
        setTimeout(() => {
            this.playSynth({
                frequency: 400,
                type: 'triangle',
                duration: 0.15,
                volume: 0.15,
                attack: 0.01,
                decay: 0.12
            });
        }, 100);
    }

    /**
     * Wave開始音
     */
    playWaveStart() {
        const notes = [262, 330, 392, 523];  // C E G C
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playSynth({
                    frequency: freq,
                    type: 'triangle',
                    duration: 0.3,
                    volume: 0.2,
                    attack: 0.01,
                    decay: 0.25
                });
            }, i * 100);
        });
    }

    /**
     * ゲームオーバー音
     */
    playGameOver() {
        const notes = [392, 330, 262, 196];  // G E C下 G下
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playSynth({
                    frequency: freq,
                    type: 'sawtooth',
                    duration: 0.4,
                    volume: 0.2,
                    attack: 0.02,
                    decay: 0.35
                });
            }, i * 200);
        });
    }

    /**
     * 勝利音
     */
    playVictory() {
        const notes = [262, 330, 392, 523, 659, 784];  // C E G C E G
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playSynth({
                    frequency: freq,
                    type: 'triangle',
                    duration: 0.3,
                    volume: 0.2,
                    attack: 0.01,
                    decay: 0.25
                });
            }, i * 120);
        });
    }

    /**
     * ボタンクリック音
     */
    playClick() {
        this.playSynth({
            frequency: 500,
            type: 'sine',
            duration: 0.05,
            volume: 0.1,
            attack: 0.005,
            decay: 0.04
        });
    }
}

// グローバルオーディオマネージャー
const audioManager = new AudioManager();

// ユーザーインタラクションでオーディオを初期化
document.addEventListener('click', () => {
    audioManager.init();
}, { once: true });
