@echo off
chcp 65001 >nul
title WRShop - Public (production)

echo ========================================
echo   Wild Rift Store - Chay internet
echo   Che do: BUILD + preview (khong lo src)
echo ========================================
echo.

REM Tat process cu tren dung port / tunnel de tranh vite DEV con sot
echo [0/4] Don process cu (BE / FE / Tunnel)...
taskkill /FI "WINDOWTITLE eq WRShop BE*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq WRShop FE*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq WRShop Tunnel*" /T /F >nul 2>&1
taskkill /IM cloudflared.exe /F >nul 2>&1
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000 .*LISTENING"') do taskkill /PID %%p /F >nul 2>&1
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":5173 .*LISTENING"') do taskkill /PID %%p /F >nul 2>&1
timeout /t 2 /nobreak >nul

REM Postgres (neu service ten khac, bo qua loi)
echo [1/4] Kiem tra PostgreSQL...
sc query postgresql-x64-17 >nul 2>&1 && net start postgresql-x64-17 >nul 2>&1
sc query postgresql-x64-16 >nul 2>&1 && net start postgresql-x64-16 >nul 2>&1
sc query postgresql-x64-15 >nul 2>&1 && net start postgresql-x64-15 >nul 2>&1

echo [2/4] Backend (NestJS)...
start "WRShop BE" cmd /k "cd /d C:\Users\HP VICTUS\Documents\Quocanh\wrshop_BE && npm run start:dev"

timeout /t 3 /nobreak >nul

echo [3/4] Frontend PRODUCTION (npm run start:public = build + vite preview)...
echo       KHONG dung npm run dev khi public.
start "WRShop FE" cmd /k "cd /d C:\Users\HP VICTUS\Documents\Quocanh\wrshop\web && npm run start:public"

timeout /t 3 /nobreak >nul

echo [4/4] Cloudflare Tunnel (furywr.com -^> localhost:5173)...
start "WRShop Tunnel" cmd /k "C:\cloudflared\cloudflared.exe tunnel run wrshop"

echo.
echo Da mo 3 cua so: BE / FE (production) / Tunnel
echo Doi cua so FE bao "Local: http://127.0.0.1:5173" roi vao:
echo   https://furywr.com
echo.
echo Luu y:
echo  - F12 chi thay JS minify, khong con source .tsx nhu luc DEV
echo  - Khi sua code: chay lai runshop.bat (hoac dung FE roi npm run start:public)
echo  - Dung bang stop-shop.bat
echo.
pause
