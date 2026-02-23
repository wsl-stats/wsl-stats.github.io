param(
    [string]$CsvPath = "data.csv"
)

Write-Host "=== WSL Stats Publisher ==="

if (!(Test-Path $CsvPath)) {
    Write-Error "CSV file not found: $CsvPath"
    exit 1
}

# текущее время в UTC
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd HH:mm 'UTC'")

# читаем файл
$content = Get-Content $CsvPath -Raw

# удаляем старую строку GeneratedAt если есть
$content = $content -replace '^\#\s*GeneratedAt:.*\r?\n', ''

# добавляем новую строку сверху
$newContent = "# GeneratedAt: $timestamp`n$content"

# сохраняем UTF8 без BOM
[System.IO.File]::WriteAllText($CsvPath, $newContent, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "Timestamp added: $timestamp"

# git add/commit/push
git add $CsvPath

$commitMessage = "update stats $timestamp"

git commit -m $commitMessage

git push

Write-Host "=== Done ==="