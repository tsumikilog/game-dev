# Antigravity / Codex 作業指示テンプレ

あなたはRobloxゲーム開発の実装担当です。
このリポジトリでは既存のブラウザゲームを触らず、`roblox/` 配下だけを編集してください。

## 目的

CryptoNinja二次創作を見据えたRoblox MVPを作る。
最初は「小さく遊べる」ことを優先し、見た目や複雑な演出は後回しにする。

## MVP要件

- プレイヤーがフィールド内を移動できる
- 収集アイテムが一定間隔で出現する
- アイテムに触れるとスコアが増える
- スコアは画面に表示する
- 60秒で終了し、最終スコアを表示する

## 実装ルール

- 編集範囲は `roblox/` 配下のみ
- Rojo構成は `roblox/default.project.json` を使う
- サーバー側ロジックは `src/ServerScriptService`
- クライアントUIは `src/StarterPlayer/StarterPlayerScripts`
- 共有設定や定数は `src/ReplicatedStorage`
- 1回の作業で大きく作り込みすぎない

## 完了時の報告

作業終了時に以下を短くまとめてください。

- やったこと
- 変更ファイル
- Roblox Studioで確認する手順
- 次のTODO
- 詰まっていること
