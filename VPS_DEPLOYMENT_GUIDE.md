# Alphanifty VPS Deployment Guide

## Overview
This guide will help you deploy the Alphanifty platform on your VPS alongside your existing vsfintech project without any conflicts. The setup uses **path-based routing** where Alphanifty runs at `/alphanifty/` path.

## Prerequisites
- VPS with Ubuntu/Debian Linux
- Root or sudo access
- Nginx installed
- Python 3.8+ installed
- Node.js 16+ installed
- Git installed
- Your vsfintech project already running

## Deployment Architecture
- **Main Site**: vsfintech.in or app.vsfintech.in → existing vsfintech project
- **Alphanifty**: vsfintech.in/alphanifty/ → Alphanifty platform
- **Backend API**: Port 5000 (proxied through nginx at /alphanifty/api/)
- **Frontend**: Static files served at /alphanifty/

---

## Step 1: SSH into Your VPS

```bash
ssh your_username@82.25.105.18
# or
ssh your_username@vsfintech.in
```

---

## Step 2: Clone the Repository

```bash
# Navigate to home directory
cd ~

# Clone the repository
git clone https://github.com/Manideepgadi1/ALPHANIFTYY.git alphanifty

# Navigate to project directory
cd alphanifty
```

---

## Step 3: Set Up Python Backend

```bash
# Install Python virtual environment
sudo apt update
sudo apt install python3-venv python3-pip -y

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Test the backend
python app.py
# Press Ctrl+C to stop after verifying it starts without errors
```

---

## Step 4: Create Backend Systemd Service

Create a systemd service to keep the backend running:

```bash
# Create service file
sudo nano /etc/systemd/system/alphanifty-api.service
```

Add this content:

```ini
[Unit]
Description=Alphanifty Flask API
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/home/your_username/alphanifty/backend
Environment="PATH=/home/your_username/alphanifty/venv/bin"
ExecStart=/home/your_username/alphanifty/venv/bin/python app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Important**: Replace `your_username` with your actual VPS username.

```bash
# Reload systemd
sudo systemctl daemon-reload

# Start the service
sudo systemctl start alphanifty-api

# Enable on boot
sudo systemctl enable alphanifty-api

# Check status
sudo systemctl status alphanifty-api
```

---

## Step 5: Build Frontend

```bash
# Navigate back to project root
cd ~/alphanifty

# Install Node.js dependencies
npm install

# Build for production
npm run build
```

This will create a `dist` folder with the production-ready files.

---

## Step 6: Deploy Frontend Files

```bash
# Create directory for Alphanifty
sudo mkdir -p /var/www/alphanifty

# Copy built files to web directory
sudo cp -r dist/* /var/www/alphanifty/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/alphanifty
sudo chmod -R 755 /var/www/alphanifty

# Verify files are copied
ls -la /var/www/alphanifty
```

---

## Step 7: Update Nginx Configuration

```bash
# Backup existing configuration
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# Edit nginx configuration
sudo nano /etc/nginx/sites-available/default
```

Replace or update with this configuration:

```nginx
server {
    listen 80;
    server_name 82.25.105.18 vsfintech.in app.vsfintech.in;

    # Main site root (vsfintech)
    root /var/www/vsfintech;
    index index.html index.htm;

    # Alphanifty API proxy (MUST BE FIRST - most specific match)
    location ~ ^/alphanifty/api/(.*)$ {
        proxy_pass http://127.0.0.1:5000/api/$1$is_args$args;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Alphanifty static assets - exact match for better priority
    location ^~ /alphanifty/assets/ {
        alias /var/www/alphanifty/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Alphanifty application (with SPA fallback for routes)
    location /alphanifty/ {
        alias /var/www/alphanifty/;
        try_files $uri $uri/ /alphanifty/index.html;
        index index.html;
    }

    # Alphanifty root redirect
    location = /alphanifty {
        return 301 /alphanifty/;
    }

    # Main site (existing vsfintech)
    location / {
        try_files $uri $uri/ =404;
    }
}
```

```bash
# Test nginx configuration
sudo nginx -t

# If test is successful, reload nginx
sudo systemctl reload nginx
```

---

## Step 8: Update vsfintech Launch Button

In your vsfintech project's home page, update the launch button to redirect to:

```html
<a href="/alphanifty/" class="launch-button">
    Launch Alphanifty Platform
</a>
```

Or if using JavaScript:

```javascript
// Redirect to Alphanifty
window.location.href = '/alphanifty/';
```

---

## Step 9: Verify Deployment

1. **Check Backend API**:
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return: `{"status":"success","message":"Alphanifty API is running","version":"1.0.0"}`

2. **Check Backend Service**:
   ```bash
   sudo systemctl status alphanifty-api
   ```

3. **Check Frontend via Browser**:
   - Visit: `http://vsfintech.in/alphanifty/`
   - Should show the Alphanifty platform

4. **Check API via Browser**:
   - Visit: `http://vsfintech.in/alphanifty/api/health`
   - Should show the API health response

5. **Test from vsfintech**:
   - Visit your vsfintech home page
   - Click the "Launch Alphanifty Platform" button
   - Should redirect to Alphanifty

---

## Step 10: Enable SSL (Optional but Recommended)

If you want HTTPS:

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d vsfintech.in -d app.vsfintech.in

# Certbot will automatically update your nginx configuration
```

---

## Troubleshooting

### Backend not starting
```bash
# Check logs
sudo journalctl -u alphanifty-api -f

# Check if port 5000 is in use
sudo netstat -tulpn | grep 5000
```

### Frontend not loading
```bash
# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify files exist
ls -la /var/www/alphanifty

# Check permissions
ls -ld /var/www/alphanifty
```

### API calls failing
```bash
# Test API directly
curl http://localhost:5000/api/health

# Check nginx configuration
sudo nginx -t

# Check if backend is running
sudo systemctl status alphanifty-api
```

### CSS/JS not loading
```bash
# Clear browser cache
# Verify assets folder exists
ls -la /var/www/alphanifty/assets/

# Check nginx access logs
sudo tail -f /var/log/nginx/access.log
```

---

## Updating the Application

When you make changes and need to update:

```bash
# SSH into VPS
ssh your_username@vsfintech.in

# Pull latest changes
cd ~/alphanifty
git pull origin main

# Update Backend
cd backend
source ../venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart alphanifty-api

# Update Frontend
cd ..
npm install
npm run build
sudo cp -r dist/* /var/www/alphanifty/
sudo systemctl reload nginx
```

---

## Monitoring

### Check Backend Status
```bash
sudo systemctl status alphanifty-api
```

### View Backend Logs
```bash
sudo journalctl -u alphanifty-api -f
```

### View Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Important Notes

1. **Port Conflicts**: The backend runs on port 5000. Make sure this port is not used by other applications.

2. **Path-based Routing**: Alphanifty is accessible at `/alphanifty/` - this means it won't interfere with your main vsfintech site.

3. **Resource Usage**: Both applications share the same VPS resources. Monitor CPU and memory usage.

4. **Firewall**: Only port 80 (and 443 for HTTPS) need to be open. Port 5000 should NOT be exposed directly.

5. **Database**: Currently using in-memory storage. For production, consider adding PostgreSQL or MySQL.

---

## Security Checklist

- [ ] Backend API runs on localhost only (not exposed)
- [ ] Nginx acts as reverse proxy
- [ ] SSL certificate installed (for HTTPS)
- [ ] Firewall configured (allow only 80, 443, 22)
- [ ] Regular updates: `sudo apt update && sudo apt upgrade`
- [ ] Strong passwords for VPS access
- [ ] Consider adding rate limiting in nginx
- [ ] Set up regular backups

---

## Quick Command Reference

```bash
# Start/Stop/Restart Backend
sudo systemctl start alphanifty-api
sudo systemctl stop alphanifty-api
sudo systemctl restart alphanifty-api

# Check Backend Status
sudo systemctl status alphanifty-api

# View Backend Logs
sudo journalctl -u alphanifty-api -f

# Reload Nginx (after config changes)
sudo systemctl reload nginx

# Test Nginx Configuration
sudo nginx -t

# Pull Latest Code
cd ~/alphanifty && git pull origin main

# Rebuild Frontend
cd ~/alphanifty && npm run build && sudo cp -r dist/* /var/www/alphanifty/
```

---

## Support

If you encounter issues:
1. Check the logs (nginx and backend)
2. Verify all services are running
3. Test each component individually (backend API, frontend files, nginx proxy)
4. Ensure no port conflicts with existing projects

---

**Deployment Date**: December 29, 2025
**Repository**: https://github.com/Manideepgadi1/ALPHANIFTYY
