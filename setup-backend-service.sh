#!/bin/bash

# Create systemd service file
cat > /etc/systemd/system/alphanifty-api.service << 'EOF'
[Unit]
Description=Alphanifty Flask API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/ALPHANIFTYY/backend
Environment=PATH=/root/ALPHANIFTYY/venv/bin:/usr/bin:/bin
ExecStart=/root/ALPHANIFTYY/venv/bin/python app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
systemctl daemon-reload

# Enable and start service
systemctl enable alphanifty-api
systemctl start alphanifty-api

# Show status
systemctl status alphanifty-api
