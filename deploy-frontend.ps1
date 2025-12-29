# Alphanifty Frontend Deployment Script
# This script uploads the built frontend to the VPS

$VPS_USER = "root"  # Change this to your VPS username
$VPS_HOST = "82.25.105.18"
$DEPLOY_PATH = "/var/www/alphanifty"

Write-Host "🚀 Deploying Alphanifty Frontend to VPS..." -ForegroundColor Blue
Write-Host "============================================" -ForegroundColor Blue

# Check if dist folder exists
if (-not (Test-Path ".\dist")) {
    Write-Host "❌ Error: dist folder not found. Run 'npm run build' first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Step 1: Uploading frontend files..." -ForegroundColor Cyan

# Create the directory on VPS if it doesn't exist
ssh ${VPS_USER}@${VPS_HOST} "mkdir -p $DEPLOY_PATH"

# Upload the dist folder contents
scp -r .\dist\* ${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/

Write-Host ""
Write-Host "🔧 Step 2: Setting permissions..." -ForegroundColor Cyan

# Set proper permissions
ssh ${VPS_USER}@${VPS_HOST} "chown -R www-data:www-data $DEPLOY_PATH && chmod -R 755 $DEPLOY_PATH"

Write-Host ""
Write-Host "✅ Frontend deployment complete!" -ForegroundColor Green
Write-Host "🌐 Visit: http://82.25.105.18/alphanifty/" -ForegroundColor Green
