# Roblox Development Workspace

Roblox Studio + Rojoで開発するための最小ワークスペースです。

## 方針

- 既存のブラウザゲームとは分離し、Roblox用のファイルはこの `roblox/` 配下に置く。
- Roblox Studioで見た目を確認し、ロジックや構成はGit管理する。
- AIへの指示は `docs/antigravity-prompt.md` を起点にする。

## セットアップ

1. Rojoをインストールする。

```bash
brew install rojo
```

2. インストール確認。

```bash
rojo --version
```

このMacでは `Rojo 7.6.1` で動作確認済み。

3. Roblox StudioにRojoプラグインを入れる。
4. このフォルダでRojoを起動する。

```bash
cd roblox
rojo serve default.project.json
```

5. Roblox StudioのRojoプラグインから接続する。

## 動作確認済み

以下のコマンドでRojoサーバー起動まで確認済み。

```bash
cd roblox
rojo serve default.project.json --port 34872
```

確認後、テスト用サーバーは停止済み。

## フォルダ構成

- `src/ReplicatedStorage`: クライアント/サーバー共有のModuleScript
- `src/ServerScriptService`: サーバー側Script
- `src/StarterPlayer/StarterPlayerScripts`: クライアント側LocalScript
- `docs`: 仕様、作業指示、設計メモ

## 最初のMVP

CryptoNinja二次創作Robloxゲームを想定し、まずは以下だけに絞る。

- プレイヤーが小さなフィールドを移動できる
- 収集アイテムを拾う
- スコアが増える
- 制限時間かゴールで終了する

IP利用・公開・収益化前に公式ガイドラインを確認する。
