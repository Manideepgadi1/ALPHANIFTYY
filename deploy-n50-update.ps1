# Quick Backend Deployment - N50.xlsx Integration
# Deploys updated app.py and N50.xlsx benchmark file

$VPS_USER = "root"
$VPS_HOST = "82.25.105.18"
$BACKEND_PATH = "/root/alphanifty/backend"
$PROJECT_ROOT = "/root/alphanifty"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   N50.xlsx Backend Integration Deployment     " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Upload updated app.py
Write-Host "📤 Step 1: Uploading updated app.py..." -ForegroundColor Yellow
scp backend/app.py "${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to upload app.py" -ForegroundColor Red
    exit 1
}
Write-Host "✅ app.py uploaded" -ForegroundColor Green

# Step 2: Upload N50.xlsx benchmark file
Write-Host ""
Write-Host "📤 Step 2: Uploading N50.xlsx..." -ForegroundColor Yellow
scp N50.xlsx "${VPS_USER}@${VPS_HOST}:${PROJECT_ROOT}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to upload N50.xlsx" -ForegroundColor Red
    exit 1
}
Write-Host "✅ N50.xlsx uploaded" -ForegroundColor Green

# Step 3: Ensure openpyxl is installed
Write-Host ""
Write-Host "🐍 Step 3: Checking Python dependencies..." -ForegroundColor Yellow
ssh "$VPS_USER@$VPS_HOST" "cd $BACKEND_PATH && source venv/bin/activate && pip install openpyxl pandas"

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Warning: Could not verify openpyxl installation" -ForegroundColor Yellow
} else {
    Write-Host "✅ Dependencies verified" -ForegroundColor Green
}

# Step 4: Restart backend service
Write-Host ""
Write-Host "🔄 Step 4: Restarting backend service..." -ForegroundColor Yellow
Write-Host "🛑 Stopping existing backend..." -ForegroundColor Cyan
ssh "$VPS_USER@$VPS_HOST" "pkill -f 'python.*app.py' || true"

Start-Sleep -Seconds 2

Write-Host "▶️  Starting backend with N50.xlsx..." -ForegroundColor Cyan
ssh "$VPS_USER@$VPS_HOST" "cd $BACKEND_PATH && nohup python3 app.py > /tmp/alphanifty-backend.log 2>&1 &"

Start-Sleep -Seconds 3

# Step 5: Verify deployment
Write-Host ""
Write-Host "✓ Step 5: Verifying deployment..." -ForegroundColor Yellow
$backendCheck = ssh "$VPS_USER@$VPS_HOST" "pgrep -f 'python.*app.py'"

if ($backendCheck) {
    Write-Host "✅ Backend is running (PID: $backendCheck)" -ForegroundColor Green
    
    # Check logs for N50.xlsx loading
    Write-Host ""
    Write-Host "📋 Recent backend logs:" -ForegroundColor Cyan
    ssh "$VPS_USER@$VPS_HOST" "tail -20 /tmp/alphanifty-backend.log"
    
} else {
    Write-Host "❌ Backend is not running!" -ForegroundColor Red
    Write-Host "📋 Checking error logs:" -ForegroundColor Yellow
    ssh "$VPS_USER@$VPS_HOST" "tail -50 /tmp/alphanifty-backend.log"
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "   ✅ DEPLOYMENT COMPLETE                       " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Changes deployed:" -ForegroundColor Cyan
Write-Host "  ✓ app.py - Updated to read N50.xlsx" -ForegroundColor White
Write-Host "  ✓ N50.xlsx - Nifty 50 benchmark data (7,464 rows)" -ForegroundColor White
Write-Host ""
Write-Host "Test the API:" -ForegroundColor Cyan
Write-Host "  curl http://82.25.105.18/alphanifty/api/mf/nifty50-history" -ForegroundColor White
Write-Host ""
Write-Host "Fund Comparison page:" -ForegroundColor Cyan
Write-Host "  http://82.25.105.18/alphanifty/fund-comparison" -ForegroundColor White
Write-Host ""
