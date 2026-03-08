#!/bin/bash
# Quick Data Update Script for Alphanifty VPS
# Updates only mock_data.py on the VPS

echo "🚀 Alphanifty Data Update Script"
echo "================================"

# Configuration - Update these values with your VPS details
VPS_USER="root"
VPS_HOST="82.25.105.18"
DEPLOY_PATH="/root/ALPHANIFTYY"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 This will update basket data (mock_data.py) on your VPS${NC}"
echo ""

# Check if mock_data.py exists
if [ ! -f "backend/data/mock_data.py" ]; then
    echo "❌ Error: backend/data/mock_data.py not found!"
    exit 1
fi

echo -e "${BLUE}Step 1: Backing up current data on VPS...${NC}"
ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
    if [ -f /root/ALPHANIFTYY/backend/data/mock_data.py ]; then
        cp /root/ALPHANIFTYY/backend/data/mock_data.py /root/ALPHANIFTYY/backend/data/mock_data.py.backup.$(date +%Y%m%d_%H%M%S)
        echo "✅ Backup created"
    else
        echo "⚠️  No existing file to backup"
    fi
ENDSSH

echo -e "${BLUE}Step 2: Uploading updated mock_data.py...${NC}"
scp backend/data/mock_data.py $VPS_USER@$VPS_HOST:$DEPLOY_PATH/backend/data/mock_data.py

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ File uploaded successfully${NC}"
else
    echo "❌ Upload failed!"
    exit 1
fi

echo -e "${BLUE}Step 3: Restarting backend service...${NC}"
ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
    # Restart the backend service
    sudo systemctl restart alphanifty-api
    
    # Check if service is running
    if systemctl is-active --quiet alphanifty-api; then
        echo "✅ Backend service restarted successfully"
    else
        echo "⚠️  Service may not be running. Check with: sudo systemctl status alphanifty-api"
    fi
ENDSSH

echo ""
echo -e "${GREEN}✅ Data update complete!${NC}"
echo -e "${GREEN}🌐 Your baskets should now show updated portfolio data${NC}"
echo ""
echo "📝 To verify the update:"
echo "   - Visit your Alphanifty explore baskets page"
echo "   - Open any basket to check the portfolio holdings"
echo ""
echo "🔧 If you need to rollback:"
echo "   ssh $VPS_USER@$VPS_HOST"
echo "   cd $DEPLOY_PATH/backend/data"
echo "   ls -la mock_data.py.backup.*  # See available backups"
echo "   cp mock_data.py.backup.YYYYMMDD_HHMMSS mock_data.py  # Restore a backup"
echo "   sudo systemctl restart alphanifty-api"
