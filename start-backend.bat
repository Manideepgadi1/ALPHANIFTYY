@echo off
echo.
echo ========================================
echo   Alphanifty - Starting Backend
echo ========================================
echo.

cd backend

if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
    echo.
    echo Installing dependencies...
    call .venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call .venv\Scripts\activate
)

echo.
echo Starting Flask server...
echo Backend API: http://localhost:5000
echo.
python app.py
