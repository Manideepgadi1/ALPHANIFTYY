# Complete Alphanifty Deployment Script
# This script deploys frontend + nginx config to VPS

$VPS_USER = "root"  # Change this to your VPS username if different
$VPS_HOST = "82.25.105.18"
$DEPLOY_PATH = "/var/www/alphanifty"

Write-Host ""
Write-Host "Alphanifty Complete Deployment" -ForegroundColor Blue
Write-Host "===================================" -ForegroundColor Blue
Write-Host ""

# Check if dist folder exists
if (-not (Test-Path ".\dist")) {
    Write-Host "Error: dist folder not found. Run 'npm run build' first." -ForegroundColor Red
    exit 1
}

# Step 1: Upload frontend files
Write-Host "Step 1: Uploading frontend files..." -ForegroundColor Cyan
ssh ${VPS_USER}@${VPS_HOST} "mkdir -p $DEPLOY_PATH"
scp -r .\dist\* ${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to upload frontend files" -ForegroundColor Red
    exit 1
}
Write-Host "Frontend files uploaded" -ForegroundColor Green

# Step 2: Upload nginx configuration
Write-Host ""
Write-Host "Step 2: Uploading Nginx configuration..." -ForegroundColor Cyan
scp .\nginx-path-based.conf ${VPS_USER}@${VPS_HOST}:/tmp/nginx-alphanifty.conf

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to upload nginx config" -ForegroundColor Red
    exit 1
}
Write-Host "Nginx config uploaded" -ForegroundColor Green

# Step 3: Apply configuration on VPS
Write-Host ""
Write-Host "Step 3: Applying configuration on VPS..." -ForegroundColor Cyan

$cmd = "chown -R www-data:www-data $DEPLOY_PATH && chmod -R 755 $DEPLOY_PATH && cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup && cp /tmp/nginx-alphanifty.conf /etc/nginx/sites-available/default && nginx -t && systemctl reload nginx"

ssh ${VPS_USER}@${VPS_HOST} $cmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to apply configuration" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your application is now available at:" -ForegroundColor Cyan
Write-Host "http://82.25.105.18/alphanifty/" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open the URL in your browser" -ForegroundColor White
Write-Host "2. Check browser console for any errors" -ForegroundColor White
Write-Host "3. Test the application functionality" -ForegroundColor White
Write-Host ""
