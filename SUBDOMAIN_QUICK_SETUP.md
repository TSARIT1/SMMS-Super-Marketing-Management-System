# ⚡ Quick Subdomain Setup (5 Steps)

## 🎯 Goal: Make `smms.tsaritservices.com` work

---

## Step 1️⃣: Update DNS at Your Registrar (GoDaddy, etc.)
```
Add A Record:
- Name: smms
- Type: A
- IP: 103.189.89.190
- Save & Wait 5-10 minutes
```

**Verify DNS works:**
```powershell
nslookup smms.tsaritservices.com
# Should show: 103.189.89.190
```

---

## Step 2️⃣: Copy Config File to Server

From your local machine (Windows):
```powershell
# Copy Nginx config
scp -P 2222 "d:\SuperMarket Project\SuperMarket\smms-nginx.conf" root@103.189.89.190:/tmp/

# Password: Tsarit@12345
```

---

## Step 3️⃣: Install & Configure on Server

SSH into server:
```bash
ssh -o PubkeyAuthentication=no root@103.189.89.190 -p 2222
# Password: Tsarit@12345
```

Then run these commands:
```bash
# Install Nginx & SSL tools
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx

# Setup Nginx
sudo cp /tmp/smms-nginx.conf /etc/nginx/sites-available/smms.tsaritservices.com
sudo ln -s /etc/nginx/sites-available/smms.tsaritservices.com /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default 2>/dev/null

# Test & restart
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## Step 4️⃣: Get SSL Certificate (Let's Encrypt)

```bash
# Get free certificate
sudo certbot certonly --standalone -d smms.tsaritservices.com

# When asked:
# - Email: your.email@example.com
# - Agree to terms: Y
# - Share email: Y or N (your choice)

# Restart Nginx
sudo systemctl restart nginx
```

---

## Step 5️⃣: Test It!

```bash
# From your local machine (wait 5-10 min for DNS)
curl -I https://smms.tsaritservices.com
# Should show: HTTP/2 200

# In browser
# Frontend: https://smms.tsaritservices.com
# API: https://smms.tsaritservices.com/api/health
```

---

## 🔍 Verify Services Running

On server:
```bash
docker-compose ps
# Should show: frontend (3000) ✅, backend (8080) ✅

# Or check manually:
netstat -tlnp | grep -E '3000|8080'
```

---

## 📍 File Locations

- **Nginx config:** `/etc/nginx/sites-available/smms.tsaritservices.com`
- **Access logs:** `/var/log/nginx/smms.tsaritservices.com.access.log`
- **Error logs:** `/var/log/nginx/smms.tsaritservices.com.error.log`
- **SSL cert:** `/etc/letsencrypt/live/smms.tsaritservices.com/`

---

## 🚨 If Something Goes Wrong

```bash
# Check Nginx config
sudo nginx -t

# View Nginx errors
sudo systemctl status nginx
sudo journalctl -xe -u nginx

# Check if ports are open
netstat -tlnp

# Restart everything
sudo systemctl restart nginx
docker-compose restart

# Check certificates
sudo certbot certificates
```

---

## ✅ DNS Propagation Check

If domain doesn't resolve immediately:
1. Wait 5-10 minutes
2. Clear local DNS: `ipconfig /flushdns` (Windows)
3. Check: https://www.nslookup.io/
4. Try different DNS: `nslookup smms.tsaritservices.com 8.8.8.8`

---

## 🔄 Auto-Renew SSL (90-day certificates)

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
sudo systemctl status certbot.timer
```

---

**Done!** 🎉 Your app should now be accessible at `https://smms.tsaritservices.com`
