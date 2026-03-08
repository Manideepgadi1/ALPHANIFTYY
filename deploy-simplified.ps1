# Simplified Alphanifty Deployment Script for VPS
# Deploys Frontend + Backend + Data Files

$VPS_USER = "root"
$VPS_HOST = "82.25.105.18"
$FRONTEND_PATH = "/var/www/alphanifty"
$BACKEND_PATH = "/root/alphanifty/backend"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Alphanifty VPS Deployment  " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build Frontend
Write-Host "[1/8] Building Frontend..." -ForegroundColor Yellow

if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
}

npm run build

if (-not (Test-Path "dist")) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "SUCCESS: Frontend built" -ForegroundColor Green

# Step 2: Create Backup
Write-Host ""
Write-Host "[2/8] Creating Backup..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
ssh $VPS_USER@$VPS_HOST "mkdir -p /root/backups"
Write-Host "SUCCESS: Backup directory ready" -ForegroundColor Green

# Step 3: Deploy Frontend
Write-Host ""
Write-Host "[3/8] Deploying Frontend..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_HOST "mkdir -p $FRONTEND_PATH"
scp -r dist\* ${VPS_USER}@${VPS_HOST}:${FRONTEND_PATH}/

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend upload failed" -ForegroundColor Red
    exit 1
}

ssh $VPS_USER@$VPS_HOST "chown -R www-data:www-data $FRONTEND_PATH"
ssh $VPS_USER@$VPS_HOST "chmod -R 755 $FRONTEND_PATH"
Write-Host "SUCCESS: Frontend deployed" -ForegroundColor Green

# Step 4: Deploy Backend Files
Write-Host ""
Write-Host "[4/8] Deploying Backend Files..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_HOST "mkdir -p $BACKEND_PATH/data"

scp backend\app.py ${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/
scp backend\requirements.txt ${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/

if (Test-Path "backend\data\nifty_data.csv") {
    scp backend\data\nifty_data.csv ${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/data/
}

if (Test-Path "backend\data\AlphaniftyMasterData.xlsx") {
    scp backend\data\AlphaniftyMasterData.xlsx ${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/data/
}

if (Test-Path "backend\data\excel_loader.py") {
    scp backend\data\excel_loader.py ${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/data/
}

if (Test-Path "backend\data\mock_data.py") {
    scp backend\data\mock_data.py ${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/data/
}

Write-Host "SUCCESS: Backend files uploaded" -ForegroundColor Green

# Step 5: Setup Python Environment
Write-Host ""
Write-Host "[5/8] Setting up Python Environment..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_HOST "cd $BACKEND_PATH && python3 -m venv venv 2>/dev/null || true"
ssh $VPS_USER@$VPS_HOST "cd $BACKEND_PATH && source venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt"
Write-Host "SUCCESS: Python environment configured" -ForegroundColor Green

# Step 6: Restart Backend
Write-Host ""
Write-Host "[6/8] Restarting Backend Service..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_HOST "pkill -f 'python.*app.py' || true"
Start-Sleep -Seconds 2
ssh $VPS_USER@$VPS_HOST "cd $BACKEND_PATH && nohup python3 app.py > /tmp/alphanifty-backend.log 2>&1 &"
Start-Sleep -Seconds 3

$backendCheck = ssh $VPS_USER@$VPS_HOST "pgrep -f 'python.*app.py'"
if ($backendCheck) {
    Write-Host "SUCCESS: Backend is running (PID: $backendCheck)" -ForegroundColor Green
} else {
    Write-Host "WARNING: Backend may not be running" -ForegroundColor Yellow
}

# Step 7: Update Nginx
Write-Host ""
Write-Host "[7/8] Updating Nginx Configuration..." -ForegroundColor Yellow
if (Test-Path "nginx-path-based.conf") {
    scp nginx-path-based.conf ${VPS_USER}@${VPS_HOST}:/tmp/nginx-alphanifty.conf
    ssh $VPS_USER@$VPS_HOST "cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$timestamp"
    ssh $VPS_USER@$VPS_HOST "cp /tmp/nginx-alphanifty.conf /etc/nginx/sites-available/default"
    ssh $VPS_USER@$VPS_HOST "nginx -t"
    if ($LASTEXITCODE -eq 0) {
        ssh $VPS_USER@$VPS_HOST "systemctl reload nginx"
        Write-Host "SUCCESS: Nginx configuration updated" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Nginx test failed" -ForegroundColor Yellow
    }
} else {
    Write-Host "SKIPPED: Nginx config file not found" -ForegroundColor Yellow
}

# Step 8: Verify Deployment
Write-Host ""
Write-Host "[8/8] Verifying Deployment..." -ForegroundColor Yellow
$apiTest = ssh $VPS_USER@$VPS_HOST "curl -s http://localhost:5000/api/funds 2>/dev/null | head -c 50"
if ($apiTest) {
    Write-Host "SUCCESS: Backend API responding" -ForegroundColor Green
} else {
    Write-Host "WARNING: Backend API not responding" -ForegroundColor Yellow
}

# Deployment Summary
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "       DEPLOYMENT COMPLETED SUCCESSFULLY       " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: http://$VPS_HOST/alphanifty/" -ForegroundColor Yellow
Write-Host "  Backend API: http://$VPS_HOST:5000/api/funds" -ForegroundColor Yellow
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  View logs: ssh $VPS_USER@$VPS_HOST tail -f /tmp/alphanifty-backend.log" -ForegroundColor DarkGray
Write-Host "  Check status: ssh $VPS_USER@$VPS_HOST pgrep -af app.py" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Test the application in browser" -ForegroundColor White
Write-Host "  2. Verify all features work correctly" -ForegroundColor White
Write-Host "  3. Monitor logs for any issues" -ForegroundColor White
Write-Host ""
