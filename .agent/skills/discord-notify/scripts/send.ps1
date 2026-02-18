# Discord Webhook送信スクリプト
# 使い方: .\send.ps1 -Message "投稿したいメッセージ"

param(
    # 投稿するメッセージ内容（必須）
    [Parameter(Mandatory = $true)]
    [string]$Message
)

# Discord Webhook URL
$webhookUrl = "https://discordapp.com/api/webhooks/1473565891559030785/MFR35R3aVjesfSujW-57VBcgemuTfrx0AfDHMQjkZ13M9G3lTCegODmBJsvAL7UdOUdi"

# 2000文字制限チェック
if ($Message.Length -gt 2000) {
    Write-Warning "メッセージが2000文字を超えています（${($Message.Length)}文字）。切り詰めます。"
    $Message = $Message.Substring(0, 1997) + "..."
}

# JSON形式に変換
$body = @{ content = $Message } | ConvertTo-Json -Depth 10

# UTF-8エンコードで送信（日本語対応）
try {
    Invoke-RestMethod -Uri $webhookUrl -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) -ContentType "application/json; charset=utf-8"
    Write-Host "✅ Discordへの投稿が完了しました" -ForegroundColor Green
}
catch {
    Write-Error "❌ Discordへの投稿に失敗しました: $_"
    exit 1
}
