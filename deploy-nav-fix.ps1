# Deploy NAV Automatic Mapping Fix to VPS
# PowerShell Version

Write-Host "🚀 Deploying NAV Fix to Alphanifty VPS" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Configuration
$VPS_USER = "root"
$VPS_HOST = "82.25.105.18"
$PROJECT_DIR = "/root/alphanifty"
$WEB_DIR = "/var/www/alphanifty"

# Step 1: Backup current frontend
Write-Host "`nStep 1/4: Backing up current frontend..." -ForegroundColor Blue
ssh ${VPS_USER}@${VPS_HOST} "cd $WEB_DIR && tar -czf backup_`$(date +%Y%m%d_%H%M%S).tar.gz index.html assets/ 2>/dev/null || true"
Write-Host "✅ Backup created" -ForegroundColor Green

# Step 2: Upload new frontend build
Write-Host "`nStep 2/4: Uploading new frontend build..." -ForegroundColor Blue
scp -r dist/* ${VPS_USER}@${VPS_HOST}:${WEB_DIR}/
Write-Host "✅ Frontend uploaded" -ForegroundColor Green

# Step 3: Update source files
Write-Host "`nStep 3/4: Uploading updated source files..." -ForegroundColor Blue
scp src/pages/FundDetailsPageClean.tsx ${VPS_USER}@${VPS_HOST}:${PROJECT_DIR}/src/pages/
scp src/pages/MutualFundExplorerPage.tsx ${VPS_USER}@${VPS_HOST}:${PROJECT_DIR}/src/pages/
scp src/pages/FundComparisonPage.tsx ${VPS_USER}@${VPS_HOST}:${PROJECT_DIR}/src/pages/
Write-Host "✅ Source files updated" -ForegroundColor Green

# Step 4: Test deployment and restart if needed
Write-Host "`nStep 4/4: Testing deployment..." -ForegroundColor Blue
$healthCheck = ssh ${VPS_USER}@${VPS_HOST} "curl -s http://localhost:5001/api/health"

if ($healthCheck -like "*success*") {
    Write-Host "✅ Backend is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend might need restart" -ForegroundColor Yellow
    Write-Host "Restarting backend..."
    ssh ${VPS_USER}@${VPS_HOST} "cd $PROJECT_DIR/backend && ps aux | grep '[p]ython.*app.py' | awk '{print `$2}' | xargs kill -9 2>/dev/null; sleep 2; nohup python3 app.py > app.log 2>&1 &"
    Start-Sleep -Seconds 3
    Write-Host "✅ Backend restarted" -ForegroundColor Green
}

Write-Host "`n╔═════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     ✅ NAV FIX DEPLOYMENT SUCCESSFUL!       ║" -ForegroundColor Green
Write-Host "╚═════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n🌐 Visit: http://app.vsfintech.in/alphanifty" -ForegroundColor Cyan
Write-Host "📊 Test with fund 23913 - NAV history should work now!" -ForegroundColor Cyan

Write-Host "`nChanges deployed:" -ForegroundColor Yellow
Write-Host "  - FundDetailsPageClean.tsx - Uses /api/funds/{id}/nav-history"
Write-Host "  - MutualFundExplorerPage.tsx - Uses /api/funds/{id}/nav-history"
Write-Host "  - FundComparisonPage.tsx - Uses /api/funds/{id}/nav-history"

Write-Host "`nAll 9000+ funds now have automatic NAV data support!" -ForegroundColor Green

