# SMMS Subdomain Setup Guide

## Overview
This guide will help you set up `smms.tsaritservices.com` to point to your SMMS application on server 103.189.89.190

---

## Prerequisites

- ✅ Server IP: **103.189.89.190** (port 2222)
- ✅ Root access to server
- ✅ Domain: **tsaritservices.com** (with registrar access)
- ✅ Application deployed via Docker (frontend: 3000, backend: 8080)

---

## Step 1: Update DNS Records (5-10 minutes)

### At Your Domain Registrar (GoDaddy, Namecheap, etc.)

1. Log in to your domain registrar
2. Go to **DNS Records** or **DNS Management**
3. Add an **A Record**:
   ```
   Name/Subdomain: smms
   Type: A
   Value/IP Address: 103.189.89.190
   TTL: 3600 (or leave as default)
   ```

4. **Save/Update**
5. **Wait 5-10 minutes** for DNS propagation

### Verify DNS (after 5-10 minutes)
```powershell
nslookup smms.tsaritservices.com
# Should show: Address: 103.189.89.190
```

---

## Step 2: Install Nginx & SSL Certificate (On Server)

### Login to Server
```bash
ssh -o PubkeyAuthentication=no root@103.189.89.190 -p 2222
# Password: Tsarit@12345
```

### Install Required Tools
```bash
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx
```

### Copy Nginx Configuration
From your local machine (Windows):
```powershell
# Copy the Nginx config file to server
$sshCmd = 'scp -P 2222 "d:\SuperMarket Project\SuperMarket\smms-nginx.conf" root@103.189.89.190:/tmp/smms-nginx.conf'
Invoke-Expression $sshCmd
# You'll need to enter password: Tsarit@12345
```

### On Server: Setup Nginx
```bash
# Copy config to Nginx
sudo cp /tmp/smms-nginx.conf /etc/nginx/sites-available/smms.tsaritservices.com

# Enable the site (create symlink)
sudo ln -s /etc/nginx/sites-available/smms.tsaritservices.com /etc/nginx/sites-enabled/

# Disable default site (optional)
sudo rm /etc/nginx/sites-enabled/default 2>/dev/null

# Test Nginx config
sudo nginx -t
# Should show: nginx: configuration file test is successful

# Start/Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## Step 3: Get SSL Certificate (On Server)

### Option A: Using Let's Encrypt (Automatic - Recommended)
```bash
sudo certbot certonly --standalone -d smms.tsaritservices.com
# Or if Nginx is already running:
sudo certbot certonly --nginx -d smms.tsaritservices.com
```

When prompted:
- Email: (your email)
- Agree to ToS: (Y)
- Share email: (N or Y, your choice)

### Option B: Self-Signed Certificate (Temporary - for testing)
```bash
sudo mkdir -p /etc/letsencrypt/live/smms.tsaritservices.com
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/letsencrypt/live/smms.tsaritservices.com/privkey.pem \
  -out /etc/letsencrypt/live/smms.tsaritservices.com/fullchain.pem \
  -subj "/CN=smms.tsaritservices.com"
```

### Restart Nginx with SSL
```bash
sudo systemctl restart nginx
```

### Verify Certificate (should work after 5-10 min)
```bash
curl -I https://smms.tsaritservices.com
# Should show: HTTP/2 200 (after DNS propagates)
```

---

## Step 4: Verify Deployment

### Check Services Running
```bash
# On server
docker-compose ps
# Should show frontend (3000) and backend (8080) as "up"

# Or if using manual commands:
ps aux | grep java
ps aux | grep node
```

### Test the Subdomain
```bash
# From your local machine (after DNS propagates - 5-10 min)
curl -I https://smms.tsaritservices.com
# Should return: HTTP/2 200

curl -I https://smms.tsaritservices.com/api/health
# Backend API health check
```

### Access in Browser
After DNS propagates:
- Frontend: https://smms.tsaritservices.com
- API Endpoint: https://smms.tsaritservices.com/api/

---

## Step 5: Auto-Renew SSL Certificate

SSL certificates expire after 90 days. Set up auto-renewal:

```bash
# On server
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verify it's running
sudo systemctl status certbot.timer
```

---

## Troubleshooting

### DNS isn't resolving yet
- Wait 5-10 minutes after updating DNS records
- Clear your local DNS cache:
  ```powershell
  ipconfig /flushdns
  ```
- Verify DNS at: https://www.nslookup.io/

### SSL Certificate error
```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew --dry-run
```

### Nginx config errors
```bash
sudo nginx -t  # Test config
sudo systemctl status nginx  # Check status
sudo journalctl -xe -u nginx  # View logs
```

### Backend not responding (/api/ errors)
```bash
# On server, check if backend is running
netstat -tlnp | grep 8080
# Or
docker-compose logs backend

# Verify docker-compose.yml has port 8080 exposed
```

---

## Complete Server Command Summary

Save these commands in a file `setup-subdomain.sh` on your server:

```bash
#!/bin/bash

# Update system
apt-get update && apt-get install -y nginx certbot python3-certbot-nginx

# Copy Nginx config (must be done from local machine first)
# Then on server:
cp /tmp/smms-nginx.conf /etc/nginx/sites-available/smms.tsaritservices.com
ln -s /etc/nginx/sites-available/smms.tsaritservices.com /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default 2>/dev/null

# Test config
nginx -t

# Get SSL certificate
certbot certonly --standalone -d smms.tsaritservices.com

# Start services
systemctl restart nginx
systemctl enable nginx
systemctl enable certbot.timer
systemctl start certbot.timer

echo "Setup complete! Visit https://smms.tsaritservices.com after DNS propagates"
```

---

## Timeline

1. **Update DNS** (at registrar): 1-2 minutes to do, 5-10 minutes to propagate
2. **Install Tools** (on server): 2-3 minutes
3. **Copy & Configure Nginx**: 2-3 minutes
4. **Get SSL Certificate**: 1-2 minutes
5. **Verify**: 2-3 minutes

**Total: ~15-20 minutes**

---

## Important Notes

⚠️ **Before going LIVE:**
- ✅ Update `smms-nginx.conf` if your domain is different
- ✅ Update `application.properties` backend config to use `https://smms.tsaritservices.com` instead of localhost
- ✅ Update frontend API endpoints if hardcoded
- ✅ Test all API endpoints after deployment
- ✅ Set up CORS properly for subdomain

---

## Next Steps After Setup

1. Update `.env` file to set domain:
   ```
   FRONTEND_URL=https://smms.tsaritservices.com
   BACKEND_URL=https://smms.tsaritservices.com/api
   ```

2. Set up email/notification domains if using email features

3. Update payment gateway (Razorpay) callbacks to use new subdomain

4. Monitor logs:
   ```bash
   tail -f /var/log/nginx/smms.tsaritservices.com.access.log
   tail -f /var/log/nginx/smms.tsaritservices.com.error.log
   ```

---

**Questions?** Check the logs when anything doesn't work. Most issues show up in:
- Nginx logs: `/var/log/nginx/`
- Docker logs: `docker-compose logs`
- DNS issues: use `nslookup` or `dig`
