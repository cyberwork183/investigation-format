@echo off
title Form III - Arrest / Court Surrender Form Generator
echo ============================================================
echo   FORM III - ARREST / COURT SURRENDER FORM GENERATOR
echo   Starting local React application...
echo ============================================================
echo.

:: Ensure we are in the script's directory
cd /d "%~dp0"

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if dependencies are installed
if not exist "node_modules" (
    echo [INFO] Dependencies not found. Running npm install...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
    echo.
)

:: Start Vite dev server and automatically open browser
echo [INFO] Starting Vite development server and opening browser...
echo Local URL: http://localhost:3000
echo.
call npm run dev -- --open

if %errorlevel% neq 0 (
    echo.
    echo [NOTICE] Server stopped.
)
pause
