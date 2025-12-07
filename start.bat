@echo off
title HatPro7 Launcher
echo ==========================================
echo       HatPro7 Portable Launcher
echo ==========================================

:: Check for Node.js
echo Checking for Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check for node_modules
if not exist "node_modules" (
    echo.
    echo [INFO] First time setup detected.
    echo [INFO] Installing dependencies... This may take a few minutes.
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed.
)

:: Start the app
echo.
echo [INFO] Starting RadFlow...
echo [INFO] Your browser will open automatically when ready.
echo.
call npm run dev

pause
