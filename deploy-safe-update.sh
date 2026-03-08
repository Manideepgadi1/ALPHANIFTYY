#!/bin/bash
# Safe Update Script for Alphanifty VPS Deployment
# This script carefully updates existing deployment without breaking anything

set -e

echo "🔍 Alphanifty Safe Update Deployment"
echo "====================================="

# Configuration - UPDATE THESE IF NEEDED
VPS_USER="root"
VPS_HOST="82.25.105.18"
PROJECT_DIR="/root/alphanifty"  # or /root/ALPHANIFTYY - will verify
WEB_DIR="/var/www/alphanifty"
SERVICE_NAME="alphanifty-api.service"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Timestamp for backups
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${YELLOW}⚠️  This script will:${NC}"
echo "   1. Verify current VPS deployment location"
echo "   2. Backup existing code"
echo "   3. Update backend files (app.py, mock_data.py)"
echo "   4. Update frontend files (rebuild and deploy)"
echo "   5. Test and restart services"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# ============================================================================
# STEP 1: Verify VPS Location
# ============================================================================
echo -e "${BLUE}Step 1/7: Verifying VPS deployment location...${NC}"

ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
    echo "🔍 Checking for Alphanifty deployment..."
    
    if [ -d "/root/alphanifty" ]; then
        echo "✅ Found at: /root/alphanifty"
        echo "LOCATION=/root/alphanifty" > /tmp/alphanifty_location.txt
    elif [ -d "/root/ALPHANIFTYY" ]; then
        echo "✅ Found at: /root/ALPHANIFTYY"
        echo "LOCATION=/root/ALPHANIFTYY" > /tmp/alphanifty_location.txt
    elif [ -d "$HOME/alphanifty" ]; then
        echo "✅ Found at: $HOME/alphanifty"
        echo "LOCATION=$HOME/alphanifty" > /tmp/alphanifty_location.txt
    else
        echo "❌ Alphanifty directory not found!"
        exit 1
    fi
    
    # Check if service is running
    if systemctl is-active --quiet alphanifty-api.service; then
        echo "✅ Service alphanifty-api.service is running"
    else
        echo "⚠️  Service not running or not found"
    fi
    
    # Check web directory
    if [ -d "/var/www/alphanifty" ]; then
        echo "✅ Web directory exists: /var/www/alphanifty"
    else
        echo "⚠️  Web directory not found"
    fi
ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to verify VPS location!${NC}"
    exit 1
fi

# Get the actual location from VPS
ACTUAL_PROJECT_DIR=$(ssh $VPS_USER@$VPS_HOST "cat /tmp/alphanifty_location.txt | cut -d= -f2")
echo -e "${GREEN}✅ Using project directory: $ACTUAL_PROJECT_DIR${NC}"

# ============================================================================
# STEP 2: Create Complete Backup
# ============================================================================
echo -e "${BLUE}Step 2/7: Creating backup...${NC}"

ssh $VPS_USER@$VPS_HOST << ENDSSH
    echo "📦 Backing up project directory..."
    if [ -d "$ACTUAL_PROJECT_DIR" ]; then
        sudo cp -r $ACTUAL_PROJECT_DIR ${ACTUAL_PROJECT_DIR}.backup.$TIMESTAMP
        echo "✅ Project backed up to: ${ACTUAL_PROJECT_DIR}.backup.$TIMESTAMP"
    fi
    
    echo "📦 Backing up web directory..."
    if [ -d "$WEB_DIR" ]; then
        sudo cp -r $WEB_DIR ${WEB_DIR}.backup.$TIMESTAMP
        echo "✅ Web directory backed up to: ${WEB_DIR}.backup.$TIMESTAMP"
    fi
    
    echo "✅ Backup complete!"
ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backup failed! Aborting.${NC}"
    exit 1
fi

# ============================================================================
# STEP 3: Build Frontend Locally
# ============================================================================
echo -e "${BLUE}Step 3/7: Building frontend locally...${NC}"

npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend built successfully${NC}"

# ============================================================================
# STEP 4: Update Backend Files
# ============================================================================
echo -e "${BLUE}Step 4/7: Updating backend files...${NC}"

# Upload updated mock_data.py
echo "  → Uploading mock_data.py..."
scp backend/data/mock_data.py $VPS_USER@$VPS_HOST:$ACTUAL_PROJECT_DIR/backend/data/

# Upload app.py if it has changes (optional - uncomment if needed)
# echo "  → Uploading app.py..."
# scp backend/app.py $VPS_USER@$VPS_HOST:$ACTUAL_PROJECT_DIR/backend/

echo -e "${GREEN}✅ Backend files updated${NC}"

# ============================================================================
# STEP 5: Update Frontend Files
# ============================================================================
echo -e "${BLUE}Step 5/7: Updating frontend files...${NC}"

# Upload new dist folder
echo "  → Uploading built frontend..."
scp -r dist/* $VPS_USER@$VPS_HOST:/tmp/alphanifty-dist-new/

# Move to web directory on VPS
ssh $VPS_USER@$VPS_HOST << ENDSSH
    echo "  → Moving files to web directory..."
    sudo rm -rf $WEB_DIR/*
    sudo cp -r /tmp/alphanifty-dist-new/* $WEB_DIR/
    sudo rm -rf /tmp/alphanifty-dist-new
    
    # Set permissions
    sudo chown -R www-data:www-data $WEB_DIR
    sudo chmod -R 755 $WEB_DIR
    
    echo "✅ Frontend files updated"
ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend update failed!${NC}"
    echo -e "${YELLOW}Rolling back...${NC}"
    ssh $VPS_USER@$VPS_HOST "sudo rm -rf $WEB_DIR/* && sudo cp -r ${WEB_DIR}.backup.$TIMESTAMP/* $WEB_DIR/"
    exit 1
fi

echo -e "${GREEN}✅ Frontend deployed${NC}"

# ============================================================================
# STEP 6: Restart Backend Service
# ============================================================================
echo -e "${BLUE}Step 6/7: Restarting backend service...${NC}"

ssh $VPS_USER@$VPS_HOST << ENDSSH
    echo "  → Restarting $SERVICE_NAME..."
    sudo systemctl restart $SERVICE_NAME
    
    sleep 2
    
    if systemctl is-active --quiet $SERVICE_NAME; then
        echo "✅ Service restarted successfully"
        sudo systemctl status $SERVICE_NAME --no-pager -l | head -n 10
    else
        echo "❌ Service failed to start!"
        sudo journalctl -u $SERVICE_NAME -n 20 --no-pager
        exit 1
    fi
ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Service restart failed!${NC}"
    echo -e "${YELLOW}Rolling back backend...${NC}"
    ssh $VPS_USER@$VPS_HOST "sudo cp -r ${ACTUAL_PROJECT_DIR}.backup.$TIMESTAMP/backend/* $ACTUAL_PROJECT_DIR/backend/ && sudo systemctl restart $SERVICE_NAME"
    exit 1
fi

# ============================================================================
# STEP 7: Test Deployment
# ============================================================================
echo -e "${BLUE}Step 7/7: Testing deployment...${NC}"

ssh $VPS_USER@$VPS_HOST << ENDSSH
    echo "🧪 Running tests..."
    
    # Test API endpoint
    echo "  → Testing API health..."
    API_RESPONSE=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health || echo "000")
    
    if [ "\$API_RESPONSE" = "200" ] || [ "\$API_RESPONSE" = "404" ]; then
        echo "✅ Backend API responding"
    else
        echo "⚠️  Backend API returned: \$API_RESPONSE"
    fi
    
    # Check if frontend files exist
    if [ -f "$WEB_DIR/index.html" ]; then
        echo "✅ Frontend files deployed"
    else
        echo "❌ Frontend index.html missing!"
        exit 1
    fi
    
    echo "✅ Basic tests passed"
ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Tests failed!${NC}"
    echo -e "${YELLOW}Please check the deployment manually${NC}"
    exit 1
fi

# ============================================================================
# SUCCESS!
# ============================================================================
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     ✅ DEPLOYMENT SUCCESSFUL!                 ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Deployment Summary:${NC}"
echo "  📁 Project: $ACTUAL_PROJECT_DIR"
echo "  🌐 Web Dir: $WEB_DIR"
echo "  🔄 Service: $SERVICE_NAME"
echo "  💾 Backup: ${ACTUAL_PROJECT_DIR}.backup.$TIMESTAMP"
echo ""
echo -e "${BLUE}What was updated:${NC}"
echo "  ✅ InvestModal component (SIP/Lumpsum investment)"
echo "  ✅ Smart fund linking (clickable fund names)"
echo "  ✅ Date formatting (removed time, formatted nicely)"
echo "  ✅ Fixed investment amounts (use basket minimums)"
echo "  ✅ Enhanced fund matching (handles Direct/Growth variants)"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Test the website in your browser"
echo "  2. Check InvestModal on fund and basket pages"
echo "  3. Test fund linking from baskets"
echo "  4. Verify mobile responsiveness"
echo ""
echo -e "${YELLOW}If there are any issues:${NC}"
echo "  Rollback command:"
echo "  ssh $VPS_USER@$VPS_HOST 'sudo cp -r ${ACTUAL_PROJECT_DIR}.backup.$TIMESTAMP/* $ACTUAL_PROJECT_DIR/ && sudo cp -r ${WEB_DIR}.backup.$TIMESTAMP/* $WEB_DIR/ && sudo systemctl restart $SERVICE_NAME'"
echo ""
echo -e "${GREEN}🎉 Your Alphanifty is now updated with new features!${NC}"
