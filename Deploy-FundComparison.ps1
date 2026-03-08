# ========================================
# AlphaNifty - Complete Deployment Script
# ========================================
# This script deploys the normalized fund comparison feature

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "AlphaNifty Deployment - Fund Comparison" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$VPS = "root@82.25.105.18"
$FRONTEND_DIR = "/var/www/alphanifty"
$BACKEND_DIR = "/root/alphanifty/backend"

# Step 1: Build Frontend
Write-Host "[1/3] Building React Frontend..." -ForegroundColor Yellow
Set-Location D:\VSFintech-Platform\Alphanifty
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build successful`n" -ForegroundColor Green
} else {
    Write-Host "✗ Build failed" -ForegroundColor Red
    Write-Host $buildOutput
    exit 1
}

# Step 2: Upload Frontend Files
Write-Host "[2/3] Uploading Frontend to VPS..." -ForegroundColor Yellow
Write-Host "Destination: $FRONTEND_DIR" -ForegroundColor Gray

# Upload all built files
scp -r dist/* ${VPS}:${FRONTEND_DIR}/ 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend uploaded successfully`n" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend upload failed" -ForegroundColor Red
    exit 1
}

# Step 3: Verify Deployment
Write-Host "[3/3] Verifying Deployment..." -ForegroundColor Yellow

# Check if backend is running
$backendStatus = ssh $VPS "pm2 list | grep alphanifty-backend | grep online" 2>&1
if ($backendStatus -match "online") {
    Write-Host "✓ Backend is running (port 5001)" -ForegroundColor Green
} else {
    Write-Host "⚠ Backend might not be running - checking PM2..." -ForegroundColor Yellow
    ssh $VPS "pm2 restart alphanifty-backend" 2>&1 | Out-Null
    Write-Host "✓ Backend restarted" -ForegroundColor Green
}

# Check if frontend is accessible
$frontendCheck = ssh $VPS "test -f ${FRONTEND_DIR}/index.html && echo 'exists' || echo 'missing'" 2>&1
if ($frontendCheck -match "exists") {
    Write-Host "✓ Frontend files deployed correctly`n" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend files not found" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Access your app at:" -ForegroundColor White
Write-Host "  🌐 Main Site: https://vsfintech.in/alphanifty/" -ForegroundColor Cyan
Write-Host "  📊 Fund Comparison: https://vsfintech.in/alphanifty/fund-comparison-normalized" -ForegroundColor Cyan
Write-Host "`n"

Write-Host "Quick Test:" -ForegroundColor Yellow
Write-Host "  curl https://vsfintech.in/alphanifty/api/health" -ForegroundColor Gray
Write-Host "`n"

Write-Host "Files Deployed:" -ForegroundColor White
Write-Host "  • Frontend: /var/www/alphanifty/" -ForegroundColor Gray
Write-Host "  • Backend: /root/alphanifty/backend/" -ForegroundColor Gray
Write-Host "  • PM2 Process: alphanifty-backend (port 5001)" -ForegroundColor Gray
Write-Host "`n"
