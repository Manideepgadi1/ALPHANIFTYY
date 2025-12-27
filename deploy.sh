#!/bin/bash
# Alphanifty Deployment Script for Hostinger VPS

echo "🚀 Alphanifty Deployment Script"
echo "================================"

# Configuration
VPS_USER="your-username"
VPS_HOST="your-vps-ip"
DEPLOY_PATH="/var/www/alphanifty"
DOMAIN="alphanifty.yourdomain.com"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Building frontend...${NC}"
npm run build

echo -e "${BLUE}Step 2: Creating deployment package...${NC}"
tar -czf alphanifty-deploy.tar.gz dist/ backend/ package.json

echo -e "${BLUE}Step 3: Uploading to VPS...${NC}"
scp alphanifty-deploy.tar.gz $VPS_USER@$VPS_HOST:/tmp/

echo -e "${BLUE}Step 4: Deploying on VPS...${NC}"
ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
    # Extract files
    sudo mkdir -p /var/www/alphanifty
    sudo tar -xzf /tmp/alphanifty-deploy.tar.gz -C /var/www/alphanifty/
    
    # Setup backend
    cd /var/www/alphanifty/backend
    sudo python3 -m venv venv
    sudo venv/bin/pip install -r requirements.txt
    
    # Set permissions
    sudo chown -R www-data:www-data /var/www/alphanifty
    
    # Restart services
    sudo systemctl restart alphanifty-api
    sudo systemctl reload nginx
    
    echo "✅ Deployment complete!"
ENDSSH

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}🌐 Visit: https://$DOMAIN${NC}"

# Cleanup
rm alphanifty-deploy.tar.gz
