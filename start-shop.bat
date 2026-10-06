@echo off
chcp 65001 >nul
title WRShop Launcher

echo ========================================
echo   Wild Rift Store - Bat dau shop
echo ========================================
echo.

REM Postgres (neu service ten khac, bo qua loi)
echo [0/3] Kiem tra PostgreSQL...
sc query postgresql-x64-17 >nul 2>&1 && net start postgresql-x64-17 >nul 2>&1
sc query postgresql-x64-16 >nul 2>&1 && net start postgresql-x64-16 >nul 2>&1
sc query postgresql-x64-15 >nul 2>&1 && net start postgresql-x64-15 >nul 2>&1

echo [1/3] Backend (NestJS)...
start "WRShop BE" cmd /k "cd /d C:\Users\HP VICTUS\Documents\Quocanh\wrshop\api && npm run start:dev"

timeout /t 2 /nobreak >nul

echo [2/3] Frontend (build + preview)...
start "WRShop FE" cmd /k "cd /d C:\Users\HP VICTUS\Documents\Quocanh\wrshop\web && npm run start:public"

timeout /t 2 /nobreak >nul

echo [3/3] Cloudflare Tunnel...
start "WRShop Tunnel" cmd /k "C:\cloudflared\cloudflared.exe tunnel run wrshop"

echo.
echo Da mo 3 cua so: BE / FE / Tunnel
echo Doi FE build xong roi vao: https://furywr.com
echo.
echo Luu y: giu 3 cua so do mo. Dong 1 cua so = tat phan do.
echo.
pause
