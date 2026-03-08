# Alphanifty Authentication System - Deployment Guide

## Overview
Complete authentication system with:
- User registration with email verification
- Login/logout with JWT tokens
- User profile management
- Password change functionality
- PostgreSQL database
- Gmail SMTP email service

## Backend Setup

### 1. Database Initialization

First, create the database on the PostgreSQL server:

```bash
# SSH to the server
ssh root@82.25.105.18

# Navigate to backend directory
cd /root/alphanifty/backend/

# Run the database setup script
python setup_database.py
```

This will:
- Create the `alphanifty` database in PostgreSQL
- Initialize all tables (users, portfolio, watchlist, cart)

### 2. Environment Configuration

The `.env` file is already configured with:

```env
DATABASE_URL=postgresql://postgres:VSFintech2026@127.0.0.1:5432/alphanifty
JWT_SECRET_KEY=vsfintech_alphanifty_2026_jwt_secret_production
MAIL_USERNAME=vsfintech@gmail.com
MAIL_PASSWORD=gluzofcihcnkiwmn
FRONTEND_URL=https://app.vsfintech.in/alphanifty
PORT=5001
```

### 3. Package Installation

All required Python packages are already installed:
- Flask-SQLAlchemy==3.1.1
- Flask-JWT-Extended==4.6.0
- Flask-Mail==0.9.1
- Flask-Bcrypt==1.0.1
- psycopg2-binary==2.9.9
- python-dateutil==2.8.2

### 4. Start Backend Server

```bash
cd /root/alphanifty/backend/

# Test run (development mode)
python app.py

# Production with PM2
pm2 start app.py --name alphanifty-backend --interpreter python3
pm2 save
```

Verify it's running:
```bash
curl http://localhost:5001/api/health
```

Expected response: `{"status": "ok"}`

### 5. Backend API Endpoints

All endpoints are prefixed with `/api/auth/`:

**Public Endpoints:**
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and get JWT tokens
- `GET /api/auth/verify-email/<token>` - Verify email address

**Protected Endpoints** (require JWT in Authorization header):
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout and blacklist token
- `POST /api/auth/refresh` - Refresh access token
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

## Frontend Setup

### 1. Build Frontend

```bash
# On local machine
cd d:\VSFintech-Platform\Alphanifty

# Install dependencies (if not already installed)
npm install

# Build for production
npm run build
```

### 2. Deploy Frontend

```bash
# Upload build files to server
scp -r dist/* root@82.25.105.18:/var/www/alphanifty/

# Or use SFTP
```

### 3. Frontend Configuration

The frontend is configured to use:
- API Base URL: `https://app.vsfintech.in/alphanifty/api`
- Token Storage: localStorage
  - `alphanifty_access_token`
  - `alphanifty_refresh_token`
  - `alphanifty_user`

### 4. New Frontend Pages

Added pages:
1. **UserProfilePage** (`/profile`) - User account management
2. **VerifyEmailPage** (`/verify-email?token=...`) - Email verification

Updated pages:
1. **Header** - Shows profile dropdown when logged in
2. **SignInPage** - Now uses AuthContext for real authentication
3. **RegisterPage** - Now creates users and sends verification emails

## Testing the Authentication Flow

### 1. User Registration

```bash
# Register a new user
curl -X POST https://app.vsfintech.in/alphanifty/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "password": "Test@1234"
  }'

# Expected response:
{
  "message": "Registration successful! Please check your email to verify your account.",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "is_verified": false
  }
}
```

Check email for verification link.

### 2. Email Verification

Click the verification link in the email:
```
https://app.vsfintech.in/alphanifty/verify-email?token=...
```

Expected result:
- Email is verified
- Welcome email is sent
- Redirected to sign-in page

### 3. User Login

```bash
# Login
curl -X POST https://app.vsfintech.in/alphanifty/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234"
  }'

# Expected response:
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "is_verified": true
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 4. Access Protected Resources

```bash
# Get current user info
curl -X GET https://app.vsfintech.in/alphanifty/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Update profile
curl -X PUT https://app.vsfintech.in/alphanifty/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "phone": "9999999999"
  }'

# Change password
curl -X PUT https://app.vsfintech.in/alphanifty/api/auth/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "Test@1234",
    "new_password": "NewPass@1234"
  }'
```

### 5. Logout

```bash
# Logout (blacklists the token)
curl -X POST https://app.vsfintech.in/alphanifty/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  phone VARCHAR(15),
  password_hash VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  avatar VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Portfolio Table
```sql
CREATE TABLE portfolio (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  basket_id VARCHAR(50),
  investment_amount DECIMAL(12, 2),
  investment_type VARCHAR(20),
  sip_date INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Watchlist Table
```sql
CREATE TABLE watchlist (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  item_type VARCHAR(20) NOT NULL,
  item_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, item_type, item_id)
);
```

### Cart Table
```sql
CREATE TABLE cart (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  basket_id VARCHAR(50),
  investment_amount DECIMAL(12, 2),
  investment_type VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Email Configuration

Gmail SMTP is configured with:
- Email: vsfintech@gmail.com
- App Password: gluzofcihcnkiwmn
- SMTP Server: smtp.gmail.com:587
- TLS: Enabled

Email templates include:
1. **Verification Email** - Beautiful HTML email with verification button
2. **Welcome Email** - Sent after successful verification

## Security Features

1. **Password Hashing** - bcrypt with automatic salt generation
2. **JWT Tokens** - Access token (24h) + Refresh token (30d)
3. **Token Blacklist** - Invalidated tokens are blacklisted on logout
4. **Email Verification** - Users must verify email before full access
5. **CORS Protection** - Only allowed origins can access API
6. **Password Validation** - Minimum 8 characters, uppercase, lowercase, number

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -U postgres -c "\l" | grep alphanifty

# Recreate database if needed
python setup_database.py
```

### Email Not Sending
```bash
# Check Flask-Mail configuration
python -c "from email_service import mail; print(mail.app.config)"

# Test Gmail SMTP
python -c "import smtplib; smtplib.SMTP('smtp.gmail.com', 587).starttls()"
```

### JWT Token Issues
```bash
# Check JWT_SECRET_KEY is set
cat .env | grep JWT_SECRET_KEY

# Verify token in Python
python -c "from flask_jwt_extended import decode_token; print(decode_token('YOUR_TOKEN'))"
```

### Frontend Not Connecting
1. Check API URL in AuthContext.tsx: `https://app.vsfintech.in/alphanifty/api`
2. Check CORS settings in init_app.py
3. Check nginx configuration for /alphanifty/api proxy

## Production Checklist

- [x] Database created and initialized
- [ ] Backend running on port 5001
- [ ] PM2 process manager configured
- [ ] Frontend built and deployed
- [ ] Nginx configured for /alphanifty path
- [ ] SSL certificate valid
- [ ] Gmail SMTP working
- [ ] Test user registration flow
- [ ] Test login flow
- [ ] Test email verification
- [ ] Test protected routes
- [ ] Test logout functionality

## Next Steps (Optional)

1. **Redis for Token Blacklist** - Replace in-memory blacklist with Redis for multi-server support
2. **Forgot Password** - Add password reset via email
3. **Social Login** - Add Google/Facebook OAuth
4. **Two-Factor Authentication** - Add TOTP-based 2FA
5. **Admin Dashboard** - Manage users, view analytics
6. **Rate Limiting** - Prevent brute force attacks
7. **Password History** - Prevent reusing recent passwords
8. **Session Management** - View and revoke active sessions

## Support

For issues or questions:
- Check logs: `pm2 logs alphanifty-backend`
- Check database: `psql -U postgres -d alphanifty`
- Check email service: Review Flask-Mail logs

---

**Deployment Date:** February 2024  
**Version:** 1.0.0  
**Status:** Ready for Production
