@echo off
REM Serves this folder so the overlay can talk to Twitch.
REM Browsers block API calls on file:// URLs, so a local server is required.
cd /d "%~dp0"

set PORT=8080
if not "%~1"=="" set PORT=%~1

where python >nul 2>nul
if %ERRORLEVEL%==0 (
  python serve.py %PORT%
  goto :end
)
where py >nul 2>nul
if %ERRORLEVEL%==0 (
  py serve.py %PORT%
  goto :end
)
where npx >nul 2>nul
if %ERRORLEVEL%==0 (
  echo   Python not found - falling back to npx serve
  npx --yes serve -l %PORT% .
  goto :end
)
echo ERROR: Need Python 3 or Node installed.

:end
pause
