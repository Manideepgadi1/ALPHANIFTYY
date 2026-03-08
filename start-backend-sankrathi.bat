@echo off
echo ========================================
echo Starting Alphanifty Backend Server
echo ========================================
echo.

cd /d "D:\VSFintech-Platform\Alphanifty"

echo Starting Flask backend on http://127.0.0.1:5000
echo.
echo Available endpoints:
echo   - GET /api/baskets
echo   - GET /api/baskets/b16 (Sankrathi Basket)
echo   - GET /api/baskets/b16/excel-performance?period=1Y
echo.
echo Time periods: 1M, 6M, YTD, 1Y, 3Y, 5Y, All
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

python backend/app.py

pause
