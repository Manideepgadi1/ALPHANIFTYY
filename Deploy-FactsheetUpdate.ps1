# Deploy Factsheet URL Update to VPS
# PowerShell script for Windows

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🚀 Deploying Factsheet URL Feature" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$VPS_USER = "root"
$VPS_HOST = "82.25.105.18"
$BACKEND_PATH = "/var/www/alphanifty/backend"

# Check if we're in the right directory
if (-not (Test-Path ".\backend\amc_factsheet_urls.py")) {
    Write-Host "❌ Error: Please run this script from the Alphanifty directory" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Step 1: Uploading new factsheet mapping file..." -ForegroundColor Yellow
scp .\backend\amc_factsheet_urls.py "${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to upload amc_factsheet_urls.py" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Step 2: Uploading updated service file..." -ForegroundColor Yellow
scp .\backend\mf_service_enhanced.py "${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to upload mf_service_enhanced.py" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Step 3: Restarting Alphanifty backend service..." -ForegroundColor Yellow

$sshCommands = @"
sudo systemctl restart alphanifty-api
sleep 2
echo ""
echo "✅ Service Status:"
sudo systemctl status alphanifty-api --no-pager -l | head -20
echo ""
if sudo systemctl is-active --quiet alphanifty-api; then
    echo "✅ Alphanifty backend is running successfully!"
else
    echo "❌ ERROR: Service failed to start!"
    echo "Check logs: sudo journalctl -u alphanifty-api -n 50"
    exit 1
fi
"@

ssh "${VPS_USER}@${VPS_HOST}" $sshCommands

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Service restart failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "The factsheet feature is now live:" -ForegroundColor Cyan
Write-Host "• Users can click 'View Factsheet' button"
Write-Host "• Opens AMC's official factsheet page"
Write-Host "• Supports 30+ major AMCs"
Write-Host ""
Write-Host "Test URL: http://vsfintech.in/alphanifty/" -ForegroundColor Yellow
Write-Host ""
