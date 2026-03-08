#!/bin/bash
# Deploy AlphaNifty UI Updates to VPS
# This script builds locally and uploads to VPS

set -e

echo "🚀 AlphaNifty UI Update Deployment"
echo "===================================="

# Configuration
VPS_USER="root"
VPS_HOST="82.25.105.18"
VPS_PATH="/root/ALPHANIFTYY"
WEB_PATH="/var/www/alphanifty"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Build production bundle
echo -e "${BLUE}Step 1/5: Building production bundle...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build completed${NC}"

# Step 2: Create backup on VPS
echo -e "${BLUE}Step 2/5: Creating backup on VPS...${NC}"
ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
    if [ -d /var/www/alphanifty ]; then
        sudo cp -r /var/www/alphanifty /var/www/alphanifty.backup.$(date +%Y%m%d_%H%M%S)
        echo "✅ Backup created"
    else
        echo "⚠️  No existing deployment found"
    fi
ENDSSH

# Step 3: Upload dist folder
echo -e "${BLUE}Step 3/5: Uploading files to VPS...${NC}"
rsync -avz --delete dist/ $VPS_USER@$VPS_HOST:/tmp/alphanifty-dist/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Upload failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Files uploaded${NC}"

# Step 4: Deploy files on VPS
echo -e "${BLUE}Step 4/5: Deploying files...${NC}"
ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
    # Create directory if it doesn't exist
    sudo mkdir -p /var/www/alphanifty
    
    # Copy files from tmp to web directory
    sudo cp -r /tmp/alphanifty-dist/* /var/www/alphanifty/
    
    # Set proper permissions
    sudo chown -R www-data:www-data /var/www/alphanifty
    sudo chmod -R 755 /var/www/alphanifty
    
    # Clean up tmp
    rm -rf /tmp/alphanifty-dist
    
    echo "✅ Files deployed"
ENDSSH

# Step 5: Test nginx config and reload
echo -e "${BLUE}Step 5/5: Reloading Nginx...${NC}"
ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
    # Test nginx configuration
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        # Reload nginx
        sudo systemctl reload nginx
        echo "✅ Nginx reloaded"
    else
        echo "❌ Nginx configuration error!"
        exit 1
    fi
ENDSSH

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}🌐 Your AlphaNifty is now live at:${NC}"
echo "   http://82.25.105.18/alphanifty/"
echo ""
echo -e "${BLUE}💡 Tip: Clear your browser cache to see the latest changes${NC}"
