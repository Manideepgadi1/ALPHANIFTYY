# Alphanifty Deployment Guide for Hostinger VPS

## 🔑 Quick Answer: Your Port Configuration

**Current Development Ports:**
- Frontend (React/Vite): Port 3000
- Backend (Flask): Port 5000

**Production Ports (Recommended for Hostinger VPS):**
- **No Conflict Solution**: Use Nginx reverse proxy on port 80/443 (standard HTTP/HTTPS)
- Backend runs on internal port 5000 (not exposed to internet)
- Your existing website remains untouched

**Best Solution**: Deploy Alphanifty on subdomain (e.g., `app.yourdomain.com`) - **ZERO conflict** with existing website!

---

## Prerequisites
- SSH access to your Hostinger VPS
- Node.js and npm installed on VPS
- Python 3.x installed on VPS
- Nginx or Apache web server running

## Deployment Options

### Option 1: Subdomain (Recommended)
Deploy at: `alphanifty.yourdomain.com`

### Option 2: Subdirectory
Deploy at: `yourdomain.com/alphanifty`

---

## Step 1: Prepare Frontend for Production

### Build the React app:
```bash
# On your local machine
cd D:\Alphanifty
npm run build
```

This creates a `dist` folder with optimized production files.

---

## Step 2: Prepare Backend for Production

### Create production requirements:
Already have `backend/requirements.txt`

### Update Flask app for production (see backend/app.py changes below)

---

## Step 3: Upload to VPS

### Option A: Using SCP/SFTP
```bash
# Upload frontend build
scp -r dist/* username@your-vps-ip:/var/www/alphanifty/

# Upload backend
scp -r backend/* username@your-vps-ip:/var/www/alphanifty-api/
```

### Option B: Using Git (Recommended)
```bash
# On VPS
cd /var/www
git clone your-repo-url alphanifty
cd alphanifty
npm install
npm run build

# Setup backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## Step 4: Configure Backend Service (Systemd)

Create `/etc/systemd/system/alphanifty-api.service`:

```ini
[Unit]
Description=Alphanifty Flask API
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/alphanifty/backend
Environment="PATH=/var/www/alphanifty/backend/venv/bin"
ExecStart=/var/www/alphanifty/backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable alphanifty-api
sudo systemctl start alphanifty-api
```

---

## Step 5: Configure Nginx

### For Subdomain (alphanifty.yourdomain.com):

Create `/etc/nginx/sites-available/alphanifty`:

```nginx
server {
    listen 80;
    server_name alphanifty.yourdomain.com;

    # Frontend
    location / {
        root /var/www/alphanifty/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### For Subdirectory (/alphanifty):

Add to your existing site config:

```nginx
    location /alphanifty {
        alias /var/www/alphanifty/dist;
        try_files $uri $uri/ /alphanifty/index.html;
    }

    location /alphanifty/api {
        rewrite ^/alphanifty/api(.*)$ /api$1 break;
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/alphanifty /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 6: Update Your Existing Website

Add a button/link to launch Alphanifty:

```html
<!-- In your existing website -->
<a href="https://alphanifty.yourdomain.com" 
   target="_blank" 
   class="btn btn-primary">
   Launch Alphanifty
</a>

<!-- OR for subdirectory -->
<a href="/alphanifty" 
   target="_blank" 
   class="btn btn-primary">
   Launch Alphanifty
</a>
```

---

## Step 7: SSL Certificate (Optional but Recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d alphanifty.yourdomain.com
```

---

## Production Configuration Files

See the files created in this directory for production-ready configs.
