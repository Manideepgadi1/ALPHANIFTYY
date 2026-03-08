# Quick Restart - Alphanifty Backend Only
$ErrorActionPreference = "Stop"
$VPS_USER = "root"
$VPS_HOST = "82.25.105.18"
$BACKEND_PATH = "/root/alphanifty/backend"

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "   Restarting Alphanifty Backend     " -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

Write-Host "Stopping Backend..." -ForegroundColor Yellow
ssh "$VPS_USER@$VPS_HOST" "pkill -f 'python.*app.py' || true"
Start-Sleep -Seconds 2
Write-Host "  Stopped`n" -ForegroundColor Green

Write-Host "Starting Backend..." -ForegroundColor Yellow
ssh "$VPS_USER@$VPS_HOST" "cd $BACKEND_PATH ; nohup python3 app.py > /tmp/alphanifty-backend.log 2>&1 &"
Start-Sleep -Seconds 3

$backendPid = ssh "$VPS_USER@$VPS_HOST" "pgrep -f 'python.*app.py'"
if ($backendPid) {
    Write-Host "  Backend running (PID: $backendPid)`n" -ForegroundColor Green
    Write-Host "Backend restarted successfully!" -ForegroundColor Green
    Write-Host "API: http://82.25.105.18:5001`n" -ForegroundColor Cyan
} else {
    Write-Host "  Warning: Backend may not be running`n" -ForegroundColor Red
}
