# PowerShell Deployment Script for Excel-Driven Alphanifty System
# ================================================================

Write-Host "`n🚀 Deploying Excel-Driven Alphanifty System to Production" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$SERVER = "root@82.25.105.18"
$REMOTE_DIR = "/root/alphanifty/backend"

Write-Host "`n📦 Step 1: Upload Excel file..." -ForegroundColor Yellow
scp data/AlphaniftyMasterData.xlsx "${SERVER}:${REMOTE_DIR}/data/"

Write-Host "`n📦 Step 2: Upload Excel loader..." -ForegroundColor Yellow
scp data/excel_loader.py "${SERVER}:${REMOTE_DIR}/data/"

Write-Host "`n📦 Step 3: Upload modified app.py..." -ForegroundColor Yellow
scp app.py "${SERVER}:${REMOTE_DIR}/"

Write-Host "`n📦 Step 4: Install required Python packages..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_DIR && pip3 install pandas openpyxl"

Write-Host "`n🔄 Step 5: Restart backend..." -ForegroundColor Yellow
ssh $SERVER "pkill -f 'python.*app.py' ; cd $REMOTE_DIR && nohup python3 app.py > /tmp/alphanifty-backend.log 2>&1 &"

Write-Host "`n⏳ Step 6: Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`n✅ Step 7: Testing API..." -ForegroundColor Green
ssh $SERVER "curl -s http://localhost:5000/api/baskets | python3 -m json.tool | head -30"

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Notes:" -ForegroundColor Yellow
Write-Host "   • Excel file location: $REMOTE_DIR/data/AlphaniftyMasterData.xlsx"
Write-Host "   • Backend logs: tail -f /tmp/alphanifty-backend.log"
Write-Host "   • API endpoint: http://82.25.105.18:5000/api/baskets"
Write-Host ""
Write-Host "🔄 To update basket data in the future:" -ForegroundColor Cyan
Write-Host "   1. Edit AlphaniftyMasterData.xlsx locally"
Write-Host "   2. Run: scp data/AlphaniftyMasterData.xlsx ${SERVER}:${REMOTE_DIR}/data/"
Write-Host "   3. Wait 2 minutes for cache to refresh automatically"
Write-Host "   4. No backend restart needed!" -ForegroundColor Green
Write-Host ""
