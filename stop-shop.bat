@echo off
chcp 65001 >nul
title WRShop Stop

echo Dang dung BE / FE / Tunnel...

taskkill /FI "WINDOWTITLE eq WRShop BE*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq WRShop FE*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq WRShop Tunnel*" /T /F >nul 2>&1

REM Phong khi title khong khop
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000 .*LISTENING"') do taskkill /PID %%p /F >nul 2>&1
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":5173 .*LISTENING"') do taskkill /PID %%p /F >nul 2>&1
taskkill /IM cloudflared.exe /F >nul 2>&1

echo Xong.
timeout /t 2 >nul
