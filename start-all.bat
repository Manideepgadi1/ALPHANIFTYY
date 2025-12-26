@echo off
echo.
echo =============================================
echo   Alphanifty Investment Platform
echo   Phase 1 - Complete Setup
echo =============================================
echo.
echo This will:
echo 1. Setup backend virtual environment
echo 2. Install Python dependencies
echo 3. Start both frontend and backend servers
echo.
pause

echo.
echo [1/3] Setting up backend...
cd backend
if not exist ".venv" (
    python -m venv .venv
    call .venv\Scripts\activate
    pip install -r requirements.txt
)
cd ..

echo.
echo [2/3] Starting backend server...
start cmd /k "cd /d %CD% && start-backend.bat"

timeout /t 3 /nobreak > nul

echo.
echo [3/3] Starting frontend server...
start cmd /k "cd /d %CD% && start-frontend.bat"

echo.
echo =============================================
echo   Setup Complete!
echo =============================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Press any key to close this window...
pause > nul
