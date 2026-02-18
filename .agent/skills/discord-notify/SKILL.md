---
name: discord-notify
description: 作業完了時にDiscordへサマリーを投稿するスキル
---

# Discord通知スキル v1.0

## 概要

作業完了時に、Discord Webhookを使ってサマリーをチャンネルに投稿するスキルです。

## 実行手順

### 1. サマリーを作成する

以下のフォーマットに従ってサマリーを作成してください。Discordの2000文字制限に注意してください。

```
📋 **作業完了レポート** (YYYY/MM/DD)

🎯 **タイトル:** 作業内容の一言まとめ

📝 **変更内容:**
- `ファイル名` - 変更の説明
- `ファイル名` - 変更の説明

✅ **テスト結果:** パス / スキップ / 失敗（詳細）

💡 **備考:** 次のステップや注意事項があれば記載
```

#### フォーマットルール
- **タイトル**: 作業内容を一言で表現する
- **変更内容**: 変更したファイルと主な変更点を箇条書きで記載する。ファイル名はバッククォートで囲む
- **テスト結果**: テストを実行した場合はその結果、しなかった場合は「スキップ」と記載する
- **備考**: 次のステップや注意事項。なければ「なし」

### 2. Discordに投稿する

`scripts/send.ps1` スクリプトを使ってサマリーを投稿してください。

```powershell
# $summary にサマリー文字列を代入してから実行する
& "c:\Users\manh\Dev\Game Dev\AI Morning RPG\.agent\skills\discord-notify\scripts\send.ps1" -Message $summary
```

#### 直接実行する場合（スクリプトが使えない場合）

```powershell
$webhookUrl = "https://discordapp.com/api/webhooks/1473565891559030785/MFR35R3aVjesfSujW-57VBcgemuTfrx0AfDHMQjkZ13M9G3lTCegODmBJsvAL7UdOUdi"
$body = @{ content = $summary } | ConvertTo-Json -Depth 10
Invoke-RestMethod -Uri $webhookUrl -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) -ContentType "application/json; charset=utf-8"
```

### 3. 投稿確認

コマンドがエラーなく完了すれば投稿成功です。出力は返りません（正常動作）。

## トリガーワード

ユーザーが以下のような発言をした場合、このスキルを実行してください：
- 「Discordに投稿して」
- 「Discordに通知して」
- 「サマリーをDiscordに送って」
- 「作業報告をDiscordに」
- `/discord-notify`

## 注意事項

- Webhook URLは **秘密情報** です。公開リポジトリにpushしないでください
- Discordメッセージは **2000文字** が上限です。超える場合は要約してください
- ネットワーク接続が必要です
