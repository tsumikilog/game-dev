/* ==========================================
   map.js - マップ/グリッド管理
   敵の経路とタワー配置可能エリアを定義
   ========================================== */

// マップの設定
const MAP_CONFIG = {
    // グリッドのセルサイズ（ピクセル）
    cellSize: 50,
    // グリッドの列数と行数
    cols: 16,
    rows: 10,
};

// セルのタイプ
const CELL_TYPES = {
    EMPTY: 0,      // 何もない（タワー配置可能）
    PATH: 1,       // 敵の経路（タワー配置不可）
    TOWER: 2,      // タワーが配置済み
    START: 3,      // 敵のスタート地点
    END: 4,        // 敵のゴール地点
};

/**
 * マップクラス
 * グリッドベースのマップを管理し、敵の経路を定義する
 */
class GameMap {
    constructor() {
        // キャンバスサイズを計算
        this.width = MAP_CONFIG.cols * MAP_CONFIG.cellSize;
        this.height = MAP_CONFIG.rows * MAP_CONFIG.cellSize;
        this.cellSize = MAP_CONFIG.cellSize;
        this.cols = MAP_CONFIG.cols;
        this.rows = MAP_CONFIG.rows;

        // グリッドを初期化（2次元配列）
        this.grid = this.createGrid();

        // 敵の経路を設定
        this.path = this.createPath();
    }

    /**
     * グリッドを作成
     * 全てのセルを空（配置可能）で初期化
     */
    createGrid() {
        const grid = [];
        for (let row = 0; row < this.rows; row++) {
            grid[row] = [];
            for (let col = 0; col < this.cols; col++) {
                grid[row][col] = CELL_TYPES.EMPTY;
            }
        }
        return grid;
    }

    /**
     * 敵の経路を作成
     * 左から右へ蛇行するパスを定義
     * @returns {Array} 経路の座標配列（ピクセル座標）
     */
    createPath() {
        // 経路のウェイポイント（グリッド座標）
        // 左端から入って、蛇行しながら右端へ
        const waypoints = [
            { col: -1, row: 4 },   // スタート（画面外左）
            { col: 2, row: 4 },
            { col: 2, row: 2 },
            { col: 6, row: 2 },
            { col: 6, row: 7 },
            { col: 10, row: 7 },
            { col: 10, row: 3 },
            { col: 14, row: 3 },
            { col: 14, row: 5 },
            { col: 16, row: 5 },  // ゴール（画面外右）
        ];

        // グリッド上に経路をマーク
        this.markPathOnGrid(waypoints);

        // ピクセル座標に変換（セルの中心）
        return waypoints.map(wp => ({
            x: wp.col * this.cellSize + this.cellSize / 2,
            y: wp.row * this.cellSize + this.cellSize / 2
        }));
    }

    /**
     * グリッド上に経路をマーク
     * ウェイポイント間の直線を全てPATHとしてマーク
     */
    markPathOnGrid(waypoints) {
        for (let i = 0; i < waypoints.length - 1; i++) {
            const start = waypoints[i];
            const end = waypoints[i + 1];

            // 水平移動の場合
            if (start.row === end.row) {
                const minCol = Math.max(0, Math.min(start.col, end.col));
                const maxCol = Math.min(this.cols - 1, Math.max(start.col, end.col));
                for (let col = minCol; col <= maxCol; col++) {
                    this.grid[start.row][col] = CELL_TYPES.PATH;
                }
            }
            // 垂直移動の場合
            else if (start.col === end.col) {
                const minRow = Math.min(start.row, end.row);
                const maxRow = Math.max(start.row, end.row);
                if (start.col >= 0 && start.col < this.cols) {
                    for (let row = minRow; row <= maxRow; row++) {
                        this.grid[row][start.col] = CELL_TYPES.PATH;
                    }
                }
            }
        }
    }

    /**
     * 指定されたセルにタワーを配置できるか確認
     * @param {number} col - 列番号
     * @param {number} row - 行番号
     * @returns {boolean} 配置可能ならtrue
     */
    canPlaceTower(col, row) {
        // 範囲外チェック
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
            return false;
        }
        // 空のセルのみ配置可能
        return this.grid[row][col] === CELL_TYPES.EMPTY;
    }

    /**
     * タワーを配置
     * @param {number} col - 列番号
     * @param {number} row - 行番号
     * @returns {boolean} 配置成功ならtrue
     */
    placeTower(col, row) {
        if (this.canPlaceTower(col, row)) {
            this.grid[row][col] = CELL_TYPES.TOWER;
            return true;
        }
        return false;
    }

    /**
     * ピクセル座標からグリッド座標に変換
     * @param {number} x - X座標（ピクセル）
     * @param {number} y - Y座標（ピクセル）
     * @returns {Object} グリッド座標 {col, row}
     */
    pixelToGrid(x, y) {
        return {
            col: Math.floor(x / this.cellSize),
            row: Math.floor(y / this.cellSize)
        };
    }

    /**
     * グリッド座標からピクセル座標（セル中心）に変換
     * @param {number} col - 列番号
     * @param {number} row - 行番号
     * @returns {Object} ピクセル座標 {x, y}
     */
    gridToPixel(col, row) {
        return {
            x: col * this.cellSize + this.cellSize / 2,
            y: row * this.cellSize + this.cellSize / 2
        };
    }

    /**
     * マップを描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    draw(ctx) {
        // グリッドを描画
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const x = col * this.cellSize;
                const y = row * this.cellSize;
                const cellType = this.grid[row][col];

                // セルの背景色を設定
                if (cellType === CELL_TYPES.PATH) {
                    // 経路は茶色
                    ctx.fillStyle = '#8B7355';
                } else if (cellType === CELL_TYPES.EMPTY) {
                    // 配置可能エリアは緑
                    ctx.fillStyle = '#3d6b4f';
                } else {
                    // タワー配置済みは暗い緑
                    ctx.fillStyle = '#2d4a3e';
                }
                ctx.fillRect(x, y, this.cellSize, this.cellSize);

                // グリッド線を描画
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.strokeRect(x, y, this.cellSize, this.cellSize);
            }
        }
    }
}
