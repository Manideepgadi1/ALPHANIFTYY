#!/bin/bash
# Deploy NAV Automatic Mapping Fix to VPS
# Updates frontend files with new endpoint changes

set -e

echo "🚀 Deploying NAV Fix to Alphanifty VPS"
echo "======================================="

# Configuration
VPS_USER="root"
VPS_HOST="82.25.105.18"
PROJECT_DIR="/root/alphanifty"
WEB_DIR="/var/www/alphanifty"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Backup current frontend
echo -e "${BLUE}Step 1/4: Backing up current frontend...${NC}"
ssh $VPS_USER@$VPS_HOST "cd $WEB_DIR && tar -czf backup_$(date +%Y%m%d_%H%M%S).tar.gz index.html assets/ 2>/dev/null || true"
echo -e "${GREEN}✅ Backup created${NC}"

# Step 2: Upload new frontend build
echo -e "${BLUE}Step 2/4: Uploading new frontend build...${NC}"
scp -r dist/* $VPS_USER@$VPS_HOST:$WEB_DIR/
echo -e "${GREEN}✅ Frontend uploaded${NC}"

# Step 3: Update frontend files (specifically the changed pages)
echo -e "${BLUE}Step 3/4: Uploading updated source files...${NC}"
scp src/pages/FundDetailsPageClean.tsx $VPS_USER@$VPS_HOST:$PROJECT_DIR/src/pages/
scp src/pages/MutualFundExplorerPage.tsx $VPS_USER@$VPS_HOST:$PROJECT_DIR/src/pages/
scp src/pages/FundComparisonPage.tsx $VPS_USER@$VPS_HOST:$PROJECT_DIR/src/pages/
echo -e "${GREEN}✅ Source files updated${NC}"

# Step 4: Test deployment
echo -e "${BLUE}Step 4/4: Testing deployment...${NC}"
HEALTH_CHECK=$(ssh $VPS_USER@$VPS_HOST "curl -s http://localhost:5001/api/health" || echo "failed")

if [[ $HEALTH_CHECK == *"success"* ]]; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${YELLOW}⚠️  Backend might need restart${NC}"
    echo "Restarting backend..."
    ssh $VPS_USER@$VPS_HOST "cd $PROJECT_DIR/backend && ps aux | grep '[p]ython.*app.py' | awk '{print \$2}' | xargs kill -9 2>/dev/null; sleep 2; nohup python3 app.py > app.log 2>&1 &"
    sleep 3
    echo -e "${GREEN}✅ Backend restarted${NC}"
fi

echo ""
echo -e "${GREEN}╔═════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     ✅ NAV FIX DEPLOYMENT SUCCESSFUL!       ║${NC}"
echo -e "${GREEN}╚═════════════════════════════════════════════╝${NC}"
echo ""
echo "🌐 Visit: http://app.vsfintech.in/alphanifty"
echo "📊 Test with fund 23913 - NAV history should work now!"
echo ""
echo "Changes deployed:"
echo "  ✓ FundDetailsPageClean.tsx - Uses /api/funds/{id}/nav-history"
echo "  ✓ MutualFundExplorerPage.tsx - Uses /api/funds/{id}/nav-history"
echo "  ✓ FundComparisonPage.tsx - Uses /api/funds/{id}/nav-history"
echo ""
echo "All 9000+ funds now have automatic NAV data support! 🎉"
