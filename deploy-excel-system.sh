#!/bin/bash

echo "🚀 Deploying Excel-Driven Alphanifty System to Production"
echo "=========================================================="

SERVER="root@82.25.105.18"
REMOTE_DIR="/root/alphanifty/backend"

echo ""
echo "📦 Step 1: Upload Excel file..."
scp data/AlphaniftyMasterData.xlsx $SERVER:$REMOTE_DIR/data/

echo ""
echo "📦 Step 2: Upload Excel loader..."
scp data/excel_loader.py $SERVER:$REMOTE_DIR/data/

echo ""
echo "📦 Step 3: Upload modified app.py..."
scp app.py $SERVER:$REMOTE_DIR/

echo ""
echo "📦 Step 4: Install required Python packages..."
ssh $SERVER "cd $REMOTE_DIR && pip3 install pandas openpyxl"

echo ""
echo "🔄 Step 5: Restart backend..."
ssh $SERVER "pkill -f 'python.*app.py' ; cd $REMOTE_DIR && nohup python3 app.py > /tmp/alphanifty-backend.log 2>&1 &"

echo ""
echo "⏳ Step 6: Waiting for backend to start..."
sleep 5

echo ""
echo "✅ Step 7: Testing API..."
ssh $SERVER "curl -s http://localhost:5000/api/baskets | python3 -m json.tool | head -30"

echo ""
echo "=========================================================="
echo "🎉 Deployment Complete!"
echo ""
echo "📝 Notes:"
echo "   • Excel file location: $REMOTE_DIR/data/AlphaniftyMasterData.xlsx"
echo "   • Backend logs: tail -f /tmp/alphanifty-backend.log"
echo "   • API endpoint: http://82.25.105.18:5000/api/baskets"
echo ""
echo "🔄 To update basket data:"
echo "   1. Edit AlphaniftyMasterData.xlsx locally"
echo "   2. Run: scp data/AlphaniftyMasterData.xlsx $SERVER:$REMOTE_DIR/data/"
echo "   3. Wait 2 minutes for cache to refresh"
echo ""
