# VPS Deployment Checklist

## Pre-Deployment Verification ✓

### Project Status
- [x] Code pushed to GitHub: https://github.com/Manideepgadi1/ALPHANIFTYY
- [x] Frontend configured for path-based routing (`/alphanifty/`)
- [x] Backend API configured for Flask
- [x] Nginx configuration prepared
- [x] Deployment scripts created

### Configuration Check
- [x] `vite.config.ts` - base path set to `/alphanifty/`
- [x] `nginx-path-based.conf` - Complete nginx configuration ready
- [x] Backend runs on port 5000 (localhost only)
- [x] No conflicts with existing vsfintech project

---

## VPS Deployment Steps

### 1. Initial Setup (One-time)
```bash
# SSH into your VPS
ssh your_username@82.25.105.18

# Install prerequisites if not already installed
sudo apt update
sudo apt install python3-venv python3-pip nginx -y
sudo apt install nodejs npm -y  # If not already installed
```

### 2. Deploy Alphanifty
```bash
# Option A: Use automated script
curl -o deploy.sh https://raw.githubusercontent.com/Manideepgadi1/ALPHANIFTYY/main/deploy-vps.sh
chmod +x deploy.sh
./deploy.sh

# Option B: Manual deployment (follow VPS_DEPLOYMENT_GUIDE.md)
```

### 3. Configure Nginx
```bash
# Backup existing config
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d)

# Edit nginx configuration
sudo nano /etc/nginx/sites-available/default
# Add the Alphanifty location blocks (see VPS_DEPLOYMENT_GUIDE.md)

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Update vsfintech Home Page
Add this button/link to your vsfintech home page:

```html
<a href="/alphanifty/" class="btn btn-primary">
    Launch Alphanifty Platform
</a>
```

Or with JavaScript redirect:
```javascript
document.getElementById('launch-alphanifty').addEventListener('click', function() {
    window.location.href = '/alphanifty/';
});
```

---

## Post-Deployment Verification

### Backend Checks
- [ ] Backend service running: `sudo systemctl status alphanifty-api`
- [ ] API health check: `curl http://localhost:5000/api/health`
- [ ] No errors in logs: `sudo journalctl -u alphanifty-api -n 50`

### Frontend Checks
- [ ] Files deployed: `ls -la /var/www/alphanifty/`
- [ ] Index file exists: `ls -la /var/www/alphanifty/index.html`
- [ ] Assets folder exists: `ls -la /var/www/alphanifty/assets/`
- [ ] Correct permissions: `ls -ld /var/www/alphanifty` (should be owned by www-data)

### Nginx Checks
- [ ] Configuration valid: `sudo nginx -t`
- [ ] Nginx running: `sudo systemctl status nginx`
- [ ] No errors in logs: `sudo tail -30 /var/log/nginx/error.log`

### Browser Tests
- [ ] Main vsfintech site still works: `http://vsfintech.in/`
- [ ] Alphanifty loads: `http://vsfintech.in/alphanifty/`
- [ ] API accessible: `http://vsfintech.in/alphanifty/api/health`
- [ ] Launch button redirects correctly from vsfintech
- [ ] Assets load (check browser console for 404s)
- [ ] All pages in Alphanifty work (navigation, features)

---

## Key Configuration Points

### ✅ What's Configured Correctly

1. **Path-based routing**: Both projects coexist at different paths
   - vsfintech: `/` (main site)
   - Alphanifty: `/alphanifty/`

2. **API Proxying**: Backend API accessible through nginx
   - Direct: `http://localhost:5000/api/*`
   - Through nginx: `http://vsfintech.in/alphanifty/api/*`

3. **Asset Handling**: Static files served with caching
   - Location: `/var/www/alphanifty/assets/`
   - Cache: 1 year for performance

4. **SPA Routing**: React Router works with nginx fallback
   - All routes fall back to `index.html`

5. **No Port Conflicts**: Backend runs on internal port only
   - Port 5000 not exposed externally
   - Only accessible through nginx proxy

### 🔒 Security Considerations

- Backend API not directly accessible (port 5000 blocked/internal only)
- Nginx acts as reverse proxy
- Consider adding SSL (see VPS_DEPLOYMENT_GUIDE.md)
- Set up firewall: `sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw allow 22/tcp`

---

## Troubleshooting Quick Reference

| Issue | Check | Fix |
|-------|-------|-----|
| Backend not starting | `sudo journalctl -u alphanifty-api -f` | Check Python errors, verify venv |
| 502 Bad Gateway | Backend service status | `sudo systemctl restart alphanifty-api` |
| 404 for assets | Asset folder exists | Re-copy dist files |
| API 404 | Nginx config | Verify proxy_pass configuration |
| Blank page | Browser console | Check base path in vite.config.ts |
| CSS not loading | Network tab | Check nginx asset location config |

---

## File Locations on VPS

```
/home/your_username/alphanifty/          # Project source code
├── backend/
│   ├── app.py                            # Flask application
│   └── requirements.txt
├── venv/                                 # Python virtual environment
├── dist/                                 # Built frontend (temporary)
└── ...

/var/www/alphanifty/                     # Production frontend files
├── index.html
├── assets/
│   ├── index-*.js
│   └── index-*.css
└── ...

/etc/systemd/system/alphanifty-api.service  # Backend service
/etc/nginx/sites-available/default          # Nginx configuration
```

---

## Monitoring Commands

```bash
# Check all services
sudo systemctl status alphanifty-api nginx

# Watch logs in real-time
sudo journalctl -u alphanifty-api -f
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log

# Check port usage
sudo netstat -tulpn | grep -E ':(80|5000)'

# Check disk space
df -h

# Check memory usage
free -h
```

---

## Update Procedure

When you make changes:

```bash
# 1. Push to GitHub from local machine
git add .
git commit -m "Your changes"
git push github main

# 2. On VPS, pull and redeploy
ssh your_username@vsfintech.in
cd ~/alphanifty

# Pull latest code
git pull origin main

# Update backend
source venv/bin/activate
cd backend
pip install -r requirements.txt
sudo systemctl restart alphanifty-api

# Update frontend
cd ..
npm install
npm run build
sudo cp -r dist/* /var/www/alphanifty/
sudo systemctl reload nginx
```

---

## Important URLs

- **GitHub Repository**: https://github.com/Manideepgadi1/ALPHANIFTYY
- **VPS IP**: 82.25.105.18
- **Main Site**: http://vsfintech.in/ (existing vsfintech)
- **Alphanifty**: http://vsfintech.in/alphanifty/
- **API Health**: http://vsfintech.in/alphanifty/api/health

---

## Support Resources

- Full deployment guide: `VPS_DEPLOYMENT_GUIDE.md`
- Automated deployment script: `deploy-vps.sh`
- Nginx configuration: `nginx-path-based.conf`

---

**Last Updated**: December 29, 2025
**Status**: ✅ Ready for deployment
