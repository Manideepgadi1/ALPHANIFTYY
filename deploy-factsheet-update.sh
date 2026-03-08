#!/bin/bash

# Deploy Factsheet URL Update to VPS
# This script uploads the new factsheet mapping and restarts the backend

set -e  # Exit on error

echo "================================================"
echo "🚀 Deploying Factsheet URL Feature"
echo "================================================"

VPS_USER="root"
VPS_HOST="82.25.105.18"
BACKEND_PATH="/var/www/alphanifty/backend"

echo ""
echo "📦 Step 1: Uploading new factsheet mapping file..."
scp backend/amc_factsheet_urls.py ${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/

echo ""
echo "📦 Step 2: Uploading updated service file..."
scp backend/mf_service_enhanced.py ${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/

echo ""
echo "🔄 Step 3: Restarting Alphanifty backend service..."
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
    # Restart the service
    sudo systemctl restart alphanifty-api
    
    # Wait a moment
    sleep 2
    
    # Check status
    echo ""
    echo "✅ Service Status:"
    sudo systemctl status alphanifty-api --no-pager -l
    
    # Check if running
    if sudo systemctl is-active --quiet alphanifty-api; then
        echo ""
        echo "✅ Alphanifty backend is running successfully!"
    else
        echo ""
        echo "❌ ERROR: Service failed to start!"
        echo "Check logs: sudo journalctl -u alphanifty-api -n 50"
        exit 1
    fi
ENDSSH

echo ""
echo "================================================"
echo "✅ Deployment Complete!"
echo "================================================"
echo ""
echo "The factsheet feature is now live:"
echo "• Users can click 'View Factsheet' button"
echo "• Opens AMC's official factsheet page"
echo "• Supports 30+ major AMCs"
echo ""
echo "Test URL: http://vsfintech.in/alphanifty/"
echo ""
