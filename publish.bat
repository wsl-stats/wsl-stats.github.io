@echo off
REM ============================
REM WSL Stats Publisher (Batch)
REM ============================

REM --- Обновляем GeneratedAt через PowerShell ---
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$csvPath = '.\data.csv';" ^
    "$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm UTC';" ^
    "(Get-Content $csvPath) | ForEach-Object { if ($_ -match '^# GeneratedAt:') { '# GeneratedAt: ' + $timestamp } else { $_ } } | Set-Content $csvPath; Write-Host 'Timestamp updated to ' + $timestamp"

REM --- Добавляем, коммитим и пушим через git ---
git add .
git commit -m "update stats %date% %time%"
git push

echo ============================
echo Done
pause