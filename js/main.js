/* ===========================================
   main.js — ゲームのエントリーポイント
   Phaserのゲームインスタンスを生成し、
   すべてのシーンを登録する
   =========================================== */

// ページ読み込み完了時にゲームを初期化
window.addEventListener('load', () => {
    // Phaserのゲーム設定
    const config = {
        type: Phaser.AUTO,
        width: GAME_WIDTH,     // 内部解像度は800x600で固定
        height: GAME_HEIGHT,
        parent: 'game-container',
        backgroundColor: COLORS.BG_DARK,

        scene: [
            TitleScene,
            PrologueScene,
            MainScene,
            EventScene,
            WeekEndScene,
            EndingScene,
        ],

        render: {
            antialias: true,
            pixelArt: false,
        },

        // Phaserのスケーリングは無効化（自前で制御する）
        scale: {
            mode: Phaser.Scale.NONE,
            autoCenter: Phaser.Scale.NO_CENTER,
        },
    };

    // ゲームインスタンスを作成
    const game = new Phaser.Game(config);

    // ========== ビューポートフィット処理 ==========
    // canvasのCSS transformで縮小表示する
    // これがPhaserのインラインstyleを完全に回避する唯一の方法
    function fitGameToScreen() {
        const canvas = game.canvas;
        if (!canvas) return;

        const container = document.getElementById('game-container');
        const pad = 16; // 余白

        // ビューポートに対して使える幅と高さ
        const availW = window.innerWidth - pad;
        const availH = window.innerHeight - pad;

        // canvasの元サイズ（800x600）に対する縮小率を計算
        const scaleX = availW / GAME_WIDTH;
        const scaleY = availH / GAME_HEIGHT;
        // 小さい方に合わせる（アスペクト比を維持）
        const scale = Math.min(scaleX, scaleY, 1); // 1以上にはしない

        // 表示後の実際のサイズ
        const displayW = Math.floor(GAME_WIDTH * scale);
        const displayH = Math.floor(GAME_HEIGHT * scale);

        // コンテナを表示サイズに設定
        container.style.width = displayW + 'px';
        container.style.height = displayH + 'px';

        // canvasをtransformで縮小（左上原点）
        canvas.style.transformOrigin = 'top left';
        canvas.style.transform = 'scale(' + scale + ')';
    }

    // Phaser初期化完了後にフィット処理を実行
    // 少し待ってcanvasが生成されてから実行
    setTimeout(fitGameToScreen, 200);
    setTimeout(fitGameToScreen, 500);

    // ウィンドウリサイズ時にも再計算
    window.addEventListener('resize', fitGameToScreen);
});
