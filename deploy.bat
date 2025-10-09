@echo off
REM 🚀 Solana Tamagotchi - Quick Deploy Script (Windows)

echo 🎮 Solana Tamagotchi - Deploy Script
echo ====================================
echo.

REM Check if git is available
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git not found. Please install git first.
    pause
    exit /b 1
)

echo 📋 Checking status...
git status

echo.
echo 📦 Staging all changes...
git add .

echo.
echo 💬 Creating commit...
for /f "delims=" %%i in ('type GIT_COMMIT_MESSAGE.txt ^| findstr /n "^" ^| findstr "^1:"') do (
    set "firstline=%%i"
)
set "firstline=%firstline:*:=%"
git commit -m "%firstline%"

if %errorlevel% neq 0 (
    echo ❌ Commit failed. Please check git status.
    pause
    exit /b 1
)

echo.
echo 🚀 Pushing to GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ DEPLOY SUCCESSFUL!
    echo.
    echo 🌐 Your site will update in 2-3 minutes:
    echo    https://tr1h.github.io/solana-tamagotchi-v3
    echo.
    echo 📊 Database Viewer:
    echo    https://tr1h.github.io/solana-tamagotchi-v3/database-viewer.html
    echo.
    echo ⚠️  Don't forget to run database migration in Supabase:
    echo.
    echo    ALTER TABLE leaderboard 
    echo    ADD COLUMN IF NOT EXISTS nft_mint_address TEXT;
    echo.
    echo    ALTER TABLE nft_mints 
    echo    ADD COLUMN IF NOT EXISTS nft_mint_address TEXT UNIQUE;
    echo.
    echo 🎉 Ready to test!
) else (
    echo.
    echo ❌ Push failed. Please check:
    echo    1. Git credentials configured
    echo    2. Remote repository accessible
    echo    3. Internet connection
)

echo.
pause

