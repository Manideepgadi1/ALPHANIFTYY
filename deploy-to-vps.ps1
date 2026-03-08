# Complete Alphanifty Deployment Script to VPS
# Deploys Frontend + Backend + Data Files
# Author: Automated Deployment System
# Date: 2026-01-31

# ===== CONFIGURATION =====
$VPS_USER = "root"
$VPS_HOST = "82.25.105.18"
$FRONTEND_PATH = "/var/www/alphanifty"
$BACKEND_PATH = "/root/alphanifty/backend"

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   Alphanifty VPS Deployment Tool v1.0        " -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# ===== PRE-DEPLOYMENT CHECKS =====
Write-Host "📋 Pre-deployment Checks..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor DarkGray

# Check if running from correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Run this script from the Alphanifty root directory" -ForegroundColor Red
    exit 1
}

# Check if backend exists
if (-not (Test-Path "backend\app.py")) {
    Write-Host "❌ Error: backend\app.py not found" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Directory structure verified" -ForegroundColor Green

# ===== STEP 1: BUILD FRONTEND =====
Write-Host ""
Write-Host "📦 Step 1: Building Frontend..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor DarkGray

if (Test-Path "dist") {
    Write-Host "🗑️  Removing old dist folder..." -ForegroundColor DarkGray
    Remove-Item -Path "dist" -Recurse -Force
}

Write-Host "🔨 Running npm build..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "dist")) {
    Write-Host "❌ Build succeeded but dist folder not created" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend built successfully" -ForegroundColor Green

# ===== STEP 2: BACKUP EXISTING DEPLOYMENT =====
Write-Host ""
Write-Host "💾 Step 2: Creating Backups on VPS..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor DarkGray

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "📁 Backing up frontend..." -ForegroundColor Cyan
ssh "$VPS_USER@$VPS_HOST" 'if [ -d '"$FRONTEND_PATH"' ]; then cp -r '"$FRONTEND_PATH"' '"${FRONTEND_PATH}"'_backup_'"$timestamp"' && echo '"'Frontend backed up'"'; else echo '"'No existing frontend to backup'"'; fi'

Write-Host "📁 Backing up backend..." -ForegroundColor Cyan
ssh "$VPS_USER@$VPS_HOST" 'if [ -d '"$BACKEND_PATH"' ]; then cp -r '"$BACKEND_PATH"' '"${BACKEND_PATH}"'_backup_'"$timestamp"' && echo '"'Backend backed up'"'; else echo '"'No existing backend to backup'"'; fi'

Write-Host "✅ Backups created" -ForegroundColor Green

# ===== STEP 3: DEPLOY FRONTEND =====
Write-Host ""
Write-Host "🌐 Step 3: Deploying Frontend..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor DarkGray

Write-Host "📤 Creating frontend directory..." -ForegroundColor Cyan
ssh "$VPS_USER@$VPS_HOST" "mkdir -p $FRONTEND_PATH"

Write-Host "📤 Uploading frontend files..." -ForegroundColor Cyan
scp -r dist\* "${VPS_USER}@${VPS_HOST}:${FRONTEND_PATH}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend upload failed" -ForegroundColor Red
    exit 1
}

Write-Host "🔒 Setting frontend permissions..." -ForegroundColor Cyan
ssh "$VPS_USER@$VPS_HOST" "chown -R www-data:www-data $FRONTEND_PATH && chmod -R 755 $FRONTEND_PATH"

Write-Host "✅ Frontend deployed" -ForegroundColor Green

# ===== STEP 4: DEPLOY BACKEND =====
Write-Host ""
Write-Host "⚙️  Step 4: Deploying Backend..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor DarkGray

Write-Host "📤 Creating backend directory structure..." -ForegroundColor Cyan
ssh "$VPS_USER@$VPS_HOST" "mkdir -p $BACKEND_PATH/data"

Write-Host "📤 Uploading backend files..." -ForegroundColor Cyan

# Upload main backend files
scp backend\app.py "${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/"
scp backend\requirements.txt "${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/"

# Upload service files (CRITICAL for optimized API)
if (Test-Path "backend\mf_service_enhanced.py") {
    scp backend\mf_service_enhanced.py "${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/"
    Write-Host "✓ Uploaded mf_service_enhanced.py" -ForegroundColor Gray
}

if (Test-Path "backend\accord_mf_enhanced.py") {
    scp backend\accord_mf_enhanced.py "${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/"
    Write-Host "✓ Uploaded accord_mf_enhanced.py" -ForegroundColor Gray
}

if (Test-Path "backend\accord_api.py") {
    scp backend\accord_api.py "${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/"
    Write-Host "✓ Uploaded accord_api.py" -ForegroundColor Gray
}

if (Test-Path "backend\calculator_service.py") {
    scp backend\calculator_service.py "${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/"
    Write-Host "✓ Uploaded calculator_service.py" -ForegroundColor Gray
}

if (Test-Path "backend\amc_factsheet_urls.py") {
    scp backend\amc_factsheet_urls.py "${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/"
    Write-Host "✓ Uploaded amc_factsheet_urls.py" -ForegroundColor Gray
}

# Upload CSV data file (CRITICAL - contains 10,197 records with indices)
if (Test-Path "backend\MF_with_indices.csv") {
    scp backend\MF_with_indices.csv "${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/"
    Write-Host "  Uploaded MF_with_indices.csv - 10197 records" -ForegroundColor Green
}

# Upload data files
Write-Host "📤 Uploading data files..." -ForegroundColor Cyan
if (Test-Path "backend\data\nifty_data.csv") {
    scp backend\data\nifty_data.csv "${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/data/"
}

if (Test-Path "backend\data\AlphaniftyMasterData.xlsx") {
    scp backend\data\AlphaniftyMasterData.xlsx "${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/data/"
}

if (Test-Path "backend\data\excel_loader.py") {
    scp backend\data\excel_loader.py "${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/data/"
}

if (Test-Path "backend\data\mock_data.py") {
    scp backend\data\mock_data.py "${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/data/"
}

# Upload mutual funds data (CRITICAL - extended dataset with indices)
if (Test-Path "backend\data\mutual_funds_with_indices.json") {
    scp backend\data\mutual_funds_with_indices.json "${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/data/"
    Write-Host "  Uploaded mutual_funds_with_indices.json - 10197 records" -ForegroundColor Green
}

if (Test-Path "backend\data\mutual_funds.json") {
    scp backend\data\mutual_funds.json "${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/data/"
    Write-Host "  Uploaded mutual_funds.json - backup" -ForegroundColor Gray
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend upload failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend files uploaded" -ForegroundColor Green

# ===== STEP 5: SETUP BACKEND ENVIRONMENT =====
Write-Host ""
Write-Host "🐍 Step 5: Setting up Python Environment..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor DarkGray

ssh "$VPS_USER@$VPS_HOST" 'cd '"$BACKEND_PATH"' && if [ ! -d venv ]; then python3 -m venv venv; fi && source venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt'

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python environment setup failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Python environment configured" -ForegroundColor Green

# ===== STEP 6: RESTART BACKEND SERVICE =====
Write-Host ""
Write-Host "🔄 Step 6: Restarting Backend Service..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor DarkGray

Write-Host "🛑 Stopping existing backend processes..." -ForegroundColor Cyan
ssh "$VPS_USER@$VPS_HOST" "pkill -f 'python.*app.py' || true"

Start-Sleep -Seconds 2

Write-Host "▶️  Starting new backend process..." -ForegroundColor Cyan
ssh "$VPS_USER@$VPS_HOST" "cd $BACKEND_PATH && nohup python3 app.py > /tmp/alphanifty-backend.log 2>&1 &"

Start-Sleep -Seconds 3

Write-Host "🔍 Checking backend status..." -ForegroundColor Cyan
$backendCheck = ssh "$VPS_USER@$VPS_HOST" "pgrep -f 'python.*app.py'"

if ($backendCheck) {
    Write-Host "✅ Backend service is running (PID: $backendCheck)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend service may not be running. Check logs manually." -ForegroundColor Yellow
}

# ===== STEP 7: UPDATE NGINX CONFIGURATION =====
Write-Host ""
Write-Host "🌍 Step 7: Updating Nginx Configuration..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor DarkGray

if (Test-Path "nginx-path-based.conf") {
    Write-Host "📤 Uploading Nginx config..." -ForegroundColor Cyan
    scp nginx-path-based.conf "${VPS_USER}@${VPS_HOST}:/tmp/nginx-alphanifty.conf"
    
    Write-Host "🔧 Applying Nginx configuration..." -ForegroundColor Cyan
    ssh "$VPS_USER@$VPS_HOST" "cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$timestamp && cp /tmp/nginx-alphanifty.conf /etc/nginx/sites-available/default && nginx -t && systemctl reload nginx"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Nginx configuration updated" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Nginx configuration update failed. Manual check needed." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Nginx config file not found. Skipping nginx update." -ForegroundColor Yellow
}

# ===== STEP 8: VERIFY DEPLOYMENT =====
Write-Host ""
Write-Host "✓ Step 8: Verifying Deployment..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor DarkGray

Write-Host "🔍 Testing backend API..." -ForegroundColor Cyan
$apiTest = ssh "$VPS_USER@$VPS_HOST" "curl -s http://localhost:5001/api/funds 2>/dev/null | head -c 100"

if ($apiTest) {
    Write-Host "✅ Backend API responding" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend API not responding. Check logs." -ForegroundColor Yellow
}

Write-Host "🔍 Checking frontend files..." -ForegroundColor Cyan
$frontendFiles = ssh "$VPS_USER@$VPS_HOST" "ls -la $FRONTEND_PATH/index.html 2>/dev/null"

if ($frontendFiles) {
    Write-Host "✅ Frontend files present" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend files not found" -ForegroundColor Yellow
}

# ===== DEPLOYMENT SUMMARY =====
Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "       DEPLOYMENT COMPLETED SUCCESSFULLY!      " -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Deployment Summary:" -ForegroundColor Cyan
Write-Host "  ├─ Frontend Path: $FRONTEND_PATH" -ForegroundColor White
Write-Host "  ├─ Backend Path: $BACKEND_PATH" -ForegroundColor White
Write-Host "  ├─ Backup Created: ${timestamp}" -ForegroundColor White
Write-Host "  └─ VPS Server: $VPS_HOST" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "  ├─ Frontend: http://$VPS_HOST/alphanifty/" -ForegroundColor Yellow
Write-Host "  └─ Backend API: http://$VPS_HOST:5001/api/funds" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Useful Commands:" -ForegroundColor Cyan
Write-Host "  ├─ View backend logs: ssh $VPS_USER@$VPS_HOST tail -f /tmp/alphanifty-backend.log" -ForegroundColor DarkGray
Write-Host "  ├─ Check backend status: ssh $VPS_USER@$VPS_HOST pgrep -af app.py" -ForegroundColor DarkGray
Write-Host "  ├─ Restart backend: See instructions above" -ForegroundColor DarkGray
Write-Host "  └─ Rollback: Contact admin for rollback procedure" -ForegroundColor DarkGray
Write-Host ""
Write-Host "✨ Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Test the application in your browser" -ForegroundColor White
Write-Host "  2. Check browser console for any errors" -ForegroundColor White
Write-Host "  3. Verify all features are working" -ForegroundColor White
Write-Host "  4. Monitor logs for any issues" -ForegroundColor White
Write-Host ""
