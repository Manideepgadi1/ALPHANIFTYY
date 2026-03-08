# Deploy Updated Mapping to VPS

Write-Host "🚀 Deploying scheme_mapping.json to VPS" -ForegroundColor Cyan

$VPS_USER = "root"
$VPS_HOST = "82.25.105.18"
$PROJECT_DIR = "/root/alphanifty"

# Upload mapping file
Write-Host "`nUploading scheme_mapping.json..." -ForegroundColor Blue
scp backend/scheme_mapping.json ${VPS_USER}@${VPS_HOST}:${PROJECT_DIR}/backend/

Write-Host "`n✅ Mapping file deployed!" -ForegroundColor Green
Write-Host "All mapped funds will now have NAV data available!" -ForegroundColor Cyan
