#!/bin/bash
# Quick deployment script for AlphaNifty basket data update
# Run this on your local machine

VPS_USER="root"
VPS_IP="82.25.105.18"
REMOTE_PATH="/var/www/vsfintech/alphanifty"

echo "🚀 Deploying Updated Basket Data to VPS..."
echo ""

# Upload updated mock_data.py
echo "📤 Uploading backend/data/mock_data.py..."
scp backend/data/mock_data.py ${VPS_USER}@${VPS_IP}:${REMOTE_PATH}/backend/data/

if [ $? -eq 0 ]; then
    echo "✅ File uploaded successfully"
else
    echo "❌ Upload failed!"
    exit 1
fi

# Restart backend service
echo ""
echo "🔄 Restarting backend service..."
ssh ${VPS_USER}@${VPS_IP} << 'EOF'
# Try different service names
if systemctl list-units --all | grep -q alphanifty-api; then
    sudo systemctl restart alphanifty-api
    echo "✓ alphanifty-api restarted"
elif systemctl list-units --all | grep -q alphanifty-backend; then
    sudo systemctl restart alphanifty-backend
    echo "✓ alphanifty-backend restarted"
elif pm2 list | grep -q alphanifty; then
    pm2 restart alphanifty-backend
    echo "✓ pm2 alphanifty-backend restarted"
else
    # Try restarting from the directory
    cd /var/www/vsfintech/alphanifty/backend
    pm2 restart alphanifty-backend || pm2 restart all
    echo "✓ Backend restarted via pm2"
fi
EOF

echo ""
echo "✅ Deployment Complete!"
echo "🌐 Changes are now live at: http://app.vsfintech.in/alphanifty/"
echo ""
echo "Updated minimum investments:"
echo "  • THE GREAT INDIA BASKET: ₹25,000"
echo "  • EVERY COMMON INDIA: ₹25,000"
echo "  • SANKRANTI PREMIUM: ₹30,000"
echo "  • CONSERVATIVE PREMIUM: ₹25,000"
echo "  • BALANCED PREMIUM: ₹30,000"
echo "  • AGGRESSIVE PREMIUM: ₹50,000"
