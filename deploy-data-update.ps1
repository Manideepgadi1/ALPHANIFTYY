# Quick Data Update Script for Alphanifty VPS (PowerShell)
# Updates only mock_data.py on the VPS

Write-Host "Alphanifty Data Update Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$VPS_USER = "root"
$VPS_HOST = "82.25.105.18"
$DEPLOY_PATH = "/root/alphanifty"

Write-Host "This will update basket data on your VPS" -ForegroundColor Yellow
Write-Host ""

# Check if mock_data.py exists
if (-not (Test-Path "backend\data\mock_data.py")) {
    Write-Host "Error: backend\data\mock_data.py not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Backing up current data on VPS..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" 'if [ -f /root/alphanifty/backend/data/mock_data.py ]; then cp /root/alphanifty/backend/data/mock_data.py /root/alphanifty/backend/data/mock_data.py.backup.$(date +%Y%m%d_%H%M%S) && echo "Backup created"; else echo "No existing file to backup"; fi'

Write-Host ""
Write-Host "Step 2: Uploading updated mock_data.py..." -ForegroundColor Blue
scp backend\data\mock_data.py "${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/backend/data/mock_data.py"

if ($LASTEXITCODE -eq 0) {
    Write-Host "File uploaded successfully" -ForegroundColor Green
} else {
    Write-Host "Upload failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Restarting backend service..." -ForegroundColor Blue
ssh "$VPS_USER@$VPS_HOST" "sudo systemctl restart alphanifty-api"

Write-Host ""
Write-Host "Checking service status..." -ForegroundColor Blue
$serviceStatus = ssh "$VPS_USER@$VPS_HOST" "sudo systemctl is-active alphanifty-api"

if ($serviceStatus -eq "active") {
    Write-Host "Backend service is running" -ForegroundColor Green
} else {
    Write-Host "Service status: $serviceStatus" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Data update complete!" -ForegroundColor Green
Write-Host "Your baskets should now show updated portfolio data" -ForegroundColor Green
Write-Host ""
Write-Host "To verify the update:" -ForegroundColor Cyan
Write-Host "  - Visit your Alphanifty explore baskets page"
Write-Host "  - Open any basket to check the portfolio holdings"
