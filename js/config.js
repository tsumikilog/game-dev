/* ===========================================
   config.js — ゲーム全体の設定と定数
   アマガミ × パワプロサクセス 風デザイン
   =========================================== */

// ゲーム画面のサイズ設定
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

// ========== カラーパレット ==========
const COLORS = {
    // 背景色
    BG_DARK: 0x0f0c29,
    BG_MEDIUM: 0x1a1a3e,
    BG_PANEL: 0x252552,

    // テキスト色
    TEXT_WHITE: '#ffffff',
    TEXT_GOLD: '#ffd700',
    TEXT_ORANGE: '#ff8c00',
    TEXT_GRAY: '#aaaacc',
    TEXT_RED: '#ff4444',
    TEXT_GREEN: '#44ff88',
    TEXT_CYAN: '#00e5ff',

    // ステータスバーの色
    STAT_HP: 0x44ff88,        // 体力（緑）
    STAT_AI: 0x00bfff,        // AI知識（水色）
    STAT_SIDE: 0xffd700,      // 副業力（金）
    STAT_FAMILY: 0xff69b4,    // 家族幸福度（ピンク）
    STAT_MOTIVATION: 0xff8c00, // やる気（オレンジ）

    // UI色
    HP_BG: 0x333366,
    BTN_NORMAL: 0x4a3f8a,
    BTN_AI_MID: 0x2196f3,
    BTN_AI_HIGH: 0x00c853,
    BTN_AI_SUPER: 0xff6f00,
    BTN_HOVER: 0x6a5fba,
    BTN_DISABLED: 0x333355,

    // テキストボックス
    TEXTBOX_BG: 0x1a1830,
    TEXTBOX_BORDER: 0x4a4580,

    // その他
    ACCENT_PURPLE: 0x8a2be2,
    ACCENT_ORANGE: 0xff8c00,
    GLOW_GOLD: 0xffd700,
};

// ========== フォント設定 ==========
const FONTS = {
    TITLE: {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '48px',
        color: COLORS.TEXT_GOLD,
        fontStyle: 'bold',
    },
    SUBTITLE: {
        fontFamily: 'Noto Sans JP, sans-serif',
        fontSize: '18px',
        color: COLORS.TEXT_GRAY,
    },
    BODY: {
        fontFamily: 'Noto Sans JP, sans-serif',
        fontSize: '16px',
        color: COLORS.TEXT_WHITE,
    },
    BODY_BOLD: {
        fontFamily: 'Noto Sans JP, sans-serif',
        fontSize: '16px',
        color: COLORS.TEXT_WHITE,
        fontStyle: 'bold',
    },
    HEADING: {
        fontFamily: 'Noto Sans JP, sans-serif',
        fontSize: '24px',
        color: COLORS.TEXT_WHITE,
        fontStyle: 'bold',
    },
};

// ========== ゲームバランス設定 ==========
const BALANCE = {
    // ゲーム構成
    TOTAL_WEEKS: 4,           // 4週間
    TURNS_PER_WEEK: 3,        // 1週あたり3ターン
    TOTAL_TURNS: 12,          // 合計12ターン

    // ステータス初期値
    INITIAL_STATS: {
        stamina: 100,         // 💪 体力
        aiKnowledge: 0,       // 🧠 AI知識
        sideHustle: 0,        // 💼 副業力
        family: 50,           // 👨‍👩‍👧 家族幸福度
        motivation: 80,       // 🔥 やる気
    },

    // ステータス上限
    MAX_STATS: {
        stamina: 100,
        aiKnowledge: 100,
        sideHustle: 100,
        family: 100,
        motivation: 100,
    },

    // やる気ボーナス閾値
    MOTIVATION_HIGH: 70,      // これ以上でステータス1.3倍
    MOTIVATION_LOW: 30,       // これ以下でステータス0.7倍

    // 週間アンロック判定設定
    // 各Weekの開始時にステータスをチェックし、条件を満たしていればコマンドを解放
    WEEKLY_UNLOCKS: [
        { week: 2, actionId: 'use_chatgpt', stat: 'aiKnowledge', value: 15, message: '🤖 「ChatGPT活用」が解放されました！' },
        { week: 3, actionId: 'use_openclaw', stat: 'aiKnowledge', value: 40, message: '⚡ 「OpenClaw活用」が解放されました！' },
        { week: 4, actionId: 'build_gijiroku', stat: 'aiKnowledge', value: 70, message: '🔥 「議事録AI構築」が解放されました！' },
    ],

    // イベント発生確率
    EVENT_CHANCE: 0.35,       // 35%でランダムイベント

    // 副業の時給（リザルト計算用）
    HOURLY_RATE: 3000,
};

// ========== ターン名 ==========
const TURN_LABELS = ['🌅 朝', '☀️ 昼', '🌙 夜'];

// ========== ステータス表示設定 ==========
const STAT_CONFIG = [
    { key: 'stamina', label: '💪体力', color: COLORS.STAT_HP },
    { key: 'aiKnowledge', label: '🧠AI知識', color: COLORS.STAT_AI },
    { key: 'sideHustle', label: '💼副業力', color: COLORS.STAT_SIDE },
    { key: 'family', label: '👨‍👩‍👧家族', color: COLORS.STAT_FAMILY },
    { key: 'motivation', label: '🔥やる気', color: COLORS.STAT_MOTIVATION },
];
