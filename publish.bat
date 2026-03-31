@echo off
REM ============================
REM WSL Stats Publisher (Batch)
REM ============================

REM --- Обновляем timestamp в папке Data ---
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm';" ^
    "$path = '.\last_update.txt';" ^
    "Set-Content $path $timestamp -Encoding UTF8;" ^
    "Write-Host 'Timestamp saved to ' + $path + ' -> ' + $timestamp"

REM --- Добавляем, коммитим и пушим ---
git add .
git commit -m "update stats %date% %time%"
git push

echo ============================
echo Done
pause