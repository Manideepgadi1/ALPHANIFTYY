#!/bin/bash
# Quick Deployment Script for VPS
# Run this on your VPS to deploy Alphanifty

set -e

echo "🚀 Starting Alphanifty Deployment..."

# Variables
PROJECT_DIR="$HOME/alphanifty"
WEB_DIR="/var/www/alphanifty"
REPO_URL="https://github.com/Manideepgadi1/ALPHANIFTYY.git"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Clone or update repository
echo -e "${YELLOW}📥 Cloning/Updating repository...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    echo "Project directory exists. Pulling latest changes..."
    cd "$PROJECT_DIR"
    git pull origin main
else
    echo "Cloning repository..."
    git clone "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

# Step 2: Set up Python backend
echo -e "${YELLOW}🐍 Setting up Python backend...${NC}"
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
cd backend
pip install -r requirements.txt
cd ..

# Step 3: Build frontend
echo -e "${YELLOW}⚛️  Building frontend...${NC}"
npm install
npm run build

# Step 4: Deploy frontend files
echo -e "${YELLOW}📦 Deploying frontend files...${NC}"
sudo mkdir -p "$WEB_DIR"
sudo cp -r dist/* "$WEB_DIR/"
sudo chown -R www-data:www-data "$WEB_DIR"
sudo chmod -R 755 "$WEB_DIR"

# Step 5: Set up systemd service
echo -e "${YELLOW}⚙️  Setting up backend service...${NC}"
SERVICE_FILE="/etc/systemd/system/alphanifty-api.service"

if [ ! -f "$SERVICE_FILE" ]; then
    echo "Creating systemd service file..."
    sudo bash -c "cat > $SERVICE_FILE" <<EOF
[Unit]
Description=Alphanifty Flask API
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR/backend
Environment="PATH=$PROJECT_DIR/venv/bin"
ExecStart=$PROJECT_DIR/venv/bin/python app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    sudo systemctl daemon-reload
    sudo systemctl enable alphanifty-api
fi

# Restart the service
sudo systemctl restart alphanifty-api

# Step 6: Check if nginx config needs update
echo -e "${YELLOW}🌐 Checking Nginx configuration...${NC}"
NGINX_CONFIG="/etc/nginx/sites-available/default"

if ! grep -q "location /alphanifty/" "$NGINX_CONFIG"; then
    echo -e "${RED}⚠️  Warning: Nginx configuration needs to be updated!${NC}"
    echo "Please manually add the Alphanifty location blocks to $NGINX_CONFIG"
    echo "Refer to VPS_DEPLOYMENT_GUIDE.md for the complete nginx configuration"
else
    echo -e "${GREEN}✅ Nginx configuration already includes Alphanifty${NC}"
    sudo nginx -t && sudo systemctl reload nginx
fi

# Step 7: Verify deployment
echo -e "${YELLOW}🔍 Verifying deployment...${NC}"

# Check backend
if systemctl is-active --quiet alphanifty-api; then
    echo -e "${GREEN}✅ Backend service is running${NC}"
else
    echo -e "${RED}❌ Backend service is not running${NC}"
fi

# Check backend health
if curl -s http://localhost:5000/api/health | grep -q "success"; then
    echo -e "${GREEN}✅ Backend API is responding${NC}"
else
    echo -e "${RED}❌ Backend API is not responding${NC}"
fi

# Check frontend files
if [ -f "$WEB_DIR/index.html" ]; then
    echo -e "${GREEN}✅ Frontend files deployed${NC}"
else
    echo -e "${RED}❌ Frontend files not found${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify nginx configuration includes Alphanifty routes"
echo "2. Test the application: http://your-domain/alphanifty/"
echo "3. Update vsfintech launch button to redirect to /alphanifty/"
echo ""
echo "Useful commands:"
echo "  sudo systemctl status alphanifty-api  # Check backend status"
echo "  sudo journalctl -u alphanifty-api -f  # View backend logs"
echo "  sudo systemctl reload nginx           # Reload nginx"
echo ""
