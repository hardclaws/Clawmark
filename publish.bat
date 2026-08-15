@echo off
REM Push this folder to GitHub for Pages hosting.
REM Usage: publish.bat https://github.com/YOURNAME/REPO.git
cd /d "%~dp0"
if "%~1"=="" (
  echo.
  echo   Usage: publish.bat https://github.com/YOURNAME/REPO.git
  echo.
  echo   1. Create an empty PUBLIC repo at github.com/new
  echo   2. Run this with its URL
  echo   3. Then: Settings - Pages - Branch: main / root
  echo.
  pause
  exit /b 1
)
if not exist ".git" (
  git init
  git branch -M main
)
git add .
git commit -m "Shoutout overlay"
git remote remove origin 2>nul
git remote add origin %~1
git push -u origin main
echo.
echo   Pushed. Now enable Pages in Settings - Pages - main / root
echo.
pause
