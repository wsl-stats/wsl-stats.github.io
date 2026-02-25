@echo off
REM ============================
REM WSL Stats Publisher (Batch)
REM ============================

REM --- Обновляем GeneratedAt ---
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$csvPath = '.\data.csv';" ^
    "$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm МСК';" ^
    "$lines = Get-Content $csvPath;" ^
    "if($lines[0] -match '^# GeneratedAt:') { $lines[0] = '# GeneratedAt: ' + $timestamp }" ^
    "else { $lines = @('# GeneratedAt: ' + $timestamp) + $lines };" ^
    "Set-Content $csvPath $lines -Encoding UTF8;" ^
    "Write-Host 'Timestamp updated to ' + $timestamp"

REM --- Добавляем, коммитим и пушим ---
git add .
git commit -m "update stats %date% %time%"
git push

echo ============================
echo Done
pause