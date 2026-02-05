# 🚀 SERVER DEPLOYMENT GUIDE - SMMS Super Marketing Management System

**Last Updated:** February 5, 2026  
**Status:** ✅ Production Ready  
**Repository:** https://github.com/TSARIT1/SMMS-Super-Marketing-Management-System.git

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Clone Repository](#clone-repository)
3. [Environment Setup](#environment-setup)
4. [Docker Deployment](#docker-deployment)
5. [Manual Deployment](#manual-deployment)
6. [Database Setup](#database-setup)
7. [Reverse Proxy Configuration](#reverse-proxy-configuration)
8. [SSL/HTTPS Setup](#sslhttps-setup)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **OS:** Linux (Ubuntu 20.04+) or Windows Server 2019+
- **CPU:** 2+ cores minimum (4+ recommended)
- **RAM:** 4GB minimum (8GB recommended)
- **Disk:** 20GB free space minimum
- **Docker:** 20.10+ (for Docker deployment)
- **Docker Compose:** 2.0+ (for Docker deployment)

### Software Requirements
```bash
# For Linux/Ubuntu
- curl
- wget
- git
- Docker Engine
- Docker Compose
- Nginx (optional, for reverse proxy)

# For Windows
- Git for Windows
- Docker Desktop
- PowerShell 5.0+
```

### Network Requirements
- Ports available: 3000 (frontend), 8080 (backend), 3306 (MySQL)
- Outbound internet access for package downloads
- For production: Ports 80 (HTTP), 443 (HTTPS) for reverse proxy

---

## Clone Repository

### Step 1: Clone from GitHub

**Linux/Mac:**
```bash
cd /opt
sudo git clone https://github.com/TSARIT1/SMMS-Super-Marketing-Management-System.git
cd SMMS-Super-Marketing-Management-System
```

**Windows (PowerShell as Admin):**
```powershell
cd C:\Services
git clone https://github.com/TSARIT1/SMMS-Super-Marketing-Management-System.git
cd SMMS-Super-Marketing-Management-System
```

### Step 2: Verify Cloned Structure
```bash
ls -la Super_market-main/
# Should show: docker-compose.yml, verify-production.bat, PRODUCTION_READY.md, etc.
```

---

## Environment Setup

### Step 1: Copy Environment Template

**Linux/Mac:**
```bash
cd Super_market-main
cp .env.example .env
chmod 600 .env
```

**Windows:**
```powershell
cd Super_market-main
copy .env.example .env
```

### Step 2: Edit .env File
```bash
nano .env  # or vi, vim, or code .env
```

### Critical Settings to Update

**Database Credentials:**
```env
MYSQL_ROOT_PASSWORD=your_secure_root_password_min_12_chars
MYSQL_USER=supermarket_user
MYSQL_PASSWORD=your_secure_password_min_12_chars
MYSQL_DATABASE=super_market_db
```

**Security:**
```env
JWT_SECRET=your_very_secure_jwt_secret_generate_with_openssl_rand_base64
SPRING_DATASOURCE_PASSWORD=your_database_password
```

**Email Configuration:**
```env
MAIL_HOST=your_smtp_server.com
MAIL_PORT=587
MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_email_app_password
MAIL_FROM=noreply@shop.com
```

**Payment Gateway (Razorpay):**
```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

**Application Settings:**
```env
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
VITE_API_BASE_URL=http://localhost:8080/api
FRONTEND_PORT=3000
```

### Step 3: Generate Secure JWT Secret

**Linux/Mac:**
```bash
openssl rand -base64 64
# Copy output and paste as JWT_SECRET value
```

**Windows (PowerShell):**
```powershell
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -SetSeed 0).ToString())) 
# Or use online generator: https://tools.ietf.org/html/rfc4648#section-10
```

### Step 4: Verify .env Security
```bash
# Ensure .env is not readable by others
chmod 600 .env

# Verify it's in .gitignore
grep ".env" .gitignore
```

---

## Docker Deployment (RECOMMENDED)

### Automated Deployment (Linux/Mac)

**Step 1: Make Scripts Executable**
```bash
chmod +x docker-compose.yml
chmod +x DOCKER_START.bat
chmod +x START_PRODUCTION.bat
chmod +x verify-production.bat
```

**Step 2: Run Verification**
```bash
# On Linux/Mac - create this script
cat > verify-production.sh << 'EOF'
#!/bin/bash
echo "Checking Docker installation..."
docker --version || { echo "Docker not installed"; exit 1; }

echo "Checking Docker Compose..."
docker-compose --version || { echo "Docker Compose not installed"; exit 1; }

echo "Checking .env file..."
test -f .env || { echo ".env not found"; exit 1; }

echo "✓ All checks passed!"
EOF

chmod +x verify-production.sh
./verify-production.sh
```

**Step 3: Build and Start Containers**
```bash
# Build images
docker-compose build --no-cache

# Start all services
docker-compose up -d

# Monitor startup (5-10 seconds)
docker-compose logs -f
```

**Step 4: Verify Services**
```bash
# Check container status
docker-compose ps
# Should show all containers as "Up" with status "healthy"

# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql

# Check services are responding
curl http://localhost:8080/actuator/health
curl http://localhost:3000
```

### Docker Deployment (Windows)

**Step 1: Open PowerShell as Administrator**

**Step 2: Navigate to Project**
```powershell
cd "C:\Services\SMMS-Super-Marketing-Management-System\Super_market-main"
```

**Step 3: Verify Setup**
```powershell
.\verify-production.bat
```

**Step 4: Build and Start**
```powershell
docker-compose build --no-cache
docker-compose up -d
docker-compose ps
```

---

## Manual Deployment (Without Docker)

### Prerequisites
- Java 21 JDK
- Node.js 18+
- MySQL 8.0
- npm or yarn

### Backend Setup

**Step 1: Install Java 21**
```bash
# Ubuntu/Debian
sudo apt-get install openjdk-21-jdk

# Or use jdk included in project
export JAVA_HOME=/path/to/SuperMarket/jdk17/jdk-17.0.17+10
export PATH=$JAVA_HOME/bin:$PATH
```

**Step 2: Build Backend**
```bash
cd Super_market-main/SuperMarket\ Backend
./mvnw clean package -DskipTests -Dspring.profiles.active=prod
```

**Step 3: Start Backend**
```bash
java -jar target/SuperMarketBackend-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod \
  --server.port=8080 \
  --spring.datasource.url=jdbc:mysql://localhost:3306/super_market_db \
  --spring.datasource.username=supermarket_user \
  --spring.datasource.password=your_password
```

### Frontend Setup

**Step 1: Install Dependencies**
```bash
cd ../SuperMarket\ New\ Frontend
npm install
```

**Step 2: Build Frontend**
```bash
npm run build
```

**Step 3: Start with Vite (Development)**
```bash
npm run dev -- --host 0.0.0.0 --port 3000
```

**Or Serve with Production Server:**
```bash
npm install -g serve
serve -s dist -l 3000
```

---

## Database Setup

### Option 1: Docker (Automatic)

Database initializes automatically via `db-init.sql` when MySQL container starts.

### Option 2: Manual MySQL Setup

**Step 1: Connect to MySQL**
```bash
mysql -u root -p
```

**Step 2: Create Database**
```sql
CREATE DATABASE super_market_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'supermarket_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON super_market_db.* TO 'supermarket_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Step 3: Import Schema**
```bash
mysql -u supermarket_user -p super_market_db < db-init.sql
```

**Step 4: Verify**
```bash
mysql -u supermarket_user -p super_market_db
SHOW TABLES;
```

---

## Reverse Proxy Configuration

### Nginx Configuration (Linux)

**Step 1: Install Nginx**
```bash
sudo apt-get install nginx
```

**Step 2: Create Config**
```bash
sudo nano /etc/nginx/sites-available/smms
```

**Step 3: Add Configuration**
```nginx
upstream backend {
    server localhost:8080;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/private.key;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Step 4: Enable and Start**
```bash
sudo ln -s /etc/nginx/sites-available/smms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Docker Nginx (Integrated)

Nginx is already configured in `SuperMarket New Frontend/nginx.conf` and runs inside the container.

---

## SSL/HTTPS Setup

### Option 1: Let's Encrypt (Free)

**Step 1: Install Certbot**
```bash
sudo apt-get install certbot python3-certbot-nginx
```

**Step 2: Get Certificate**
```bash
sudo certbot certonly --standalone -d your-domain.com
```

**Step 3: Update Nginx Configuration**
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    # ... rest of config
}
```

**Step 4: Auto-Renewal**
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Option 2: Self-Signed (Testing Only)

```bash
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```

---

## Monitoring & Maintenance

### Health Checks

**Backend Health:**
```bash
curl http://localhost:8080/actuator/health
# Expected response:
# {"status":"UP","components":{"db":{"status":"UP"}}}
```

**Frontend Health:**
```bash
curl http://localhost:3000/health
# Expected: 200 OK
```

**Database Health:**
```bash
docker exec supermarket-mysql mysqladmin -u root -p ping
```

### View Logs

**Docker:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql
```

**Manual Deployment:**
```bash
# Backend logs (if running in background)
tail -f backend.log

# Frontend logs (check console)
```

### Backup Database

**Docker:**
```bash
docker exec supermarket-mysql mysqldump -u root -p super_market_db > backup-$(date +%Y%m%d-%H%M%S).sql
```

**Manual:**
```bash
mysqldump -u supermarket_user -p super_market_db > backup-$(date +%Y%m%d-%H%M%S).sql
```

### Restore Database

```bash
mysql -u supermarket_user -p super_market_db < backup-20260205-120000.sql
```

### Performance Monitoring

**Container Resources:**
```bash
docker stats
```

**System Resources:**
```bash
# Linux
free -h
df -h
ps aux | grep java
ps aux | grep node
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Problem:** "Address already in use"

**Solution:**
```bash
# Find process using port
sudo lsof -i :8080  # Backend
sudo lsof -i :3000  # Frontend
sudo lsof -i :3306  # MySQL

# Kill process
sudo kill -9 <PID>

# Or change port in .env
```

#### 2. Database Connection Failed

**Problem:** "Cannot connect to MySQL"

**Solution:**
```bash
# Check MySQL is running
docker-compose ps mysql

# Check MySQL logs
docker-compose logs mysql

# Verify credentials in .env
# Test connection
docker exec supermarket-mysql mysql -u root -p -e "SELECT 1;"
```

#### 3. Docker Image Build Fails

**Problem:** "Build failed"

**Solution:**
```bash
# Clean and rebuild
docker-compose down
docker system prune -a
docker-compose build --no-cache

# Check logs
docker-compose logs
```

#### 4. Certificate Errors

**Problem:** "SSL certificate problem"

**Solution:**
```bash
# Verify certificate
openssl x509 -in certificate.pem -text -noout

# For self-signed testing
export NODE_TLS_REJECT_UNAUTHORIZED=0  # Not for production!
```

#### 5. Out of Memory

**Problem:** "Java heap space" or "OOMKilled"

**Solution:**
```bash
# Increase JVM memory in docker-compose.yml
# In backend environment:
-Xmx512m  # Currently
-Xmx2g    # Increase to 2GB

# Restart
docker-compose restart backend
```

#### 6. Slow Performance

**Problem:** Response time > 1 second

**Solution:**
- Check system resources: `docker stats`
- Check database queries: Enable query logging
- Check network: `speedtest-cli`
- Review logs for errors
- See [FAST_BILLING_OPTIMIZATIONS.md](FAST_BILLING_OPTIMIZATIONS.md)

### Debug Mode

**Enable Debug Logging (Backend):**
In application-prod.properties:
```properties
logging.level.root=DEBUG
logging.level.in.main=DEBUG
```

**Enable Verbose Docker:**
```bash
docker-compose up  # Without -d to see all output
```

---

## Production Checklist

Before going live:

- [ ] All passwords changed from defaults
- [ ] .env file security verified (not in git)
- [ ] Database backed up
- [ ] SSL certificate installed
- [ ] Domain/IP configured
- [ ] Firewall rules configured
- [ ] Monitoring set up
- [ ] Backup schedule created
- [ ] Documentation read: [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)
- [ ] Documentation read: [PRODUCTION_READY.md](PRODUCTION_READY.md)
- [ ] All services tested and healthy
- [ ] Load testing completed
- [ ] Team trained on operations

---

## Quick Commands Reference

```bash
# Docker
docker-compose up -d          # Start
docker-compose down           # Stop
docker-compose ps             # Status
docker-compose logs -f        # View logs
docker-compose restart        # Restart
docker system prune -a        # Clean up

# Database
docker exec supermarket-mysql mysql -u root -p  # Access MySQL
mysqldump -u user -p db > backup.sql            # Backup
mysql -u user -p db < backup.sql                # Restore

# Java
jps                           # List Java processes
kill -9 <PID>                 # Stop Java process

# Node
npm install                   # Install dependencies
npm run build                 # Build
npm run dev                   # Development
```

---

## Support & Documentation

- **Deployment Guide:** [PRODUCTION_READY.md](PRODUCTION_READY.md)
- **Security Guide:** [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)
- **Docker Reference:** [DOCKER_COMMANDS.md](DOCKER_COMMANDS.md)
- **Troubleshooting:** [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)
- **Quick Reference:** [QUICK_REFERENCE.txt](QUICK_REFERENCE.txt)
- **Full Report:** [FINAL_PRODUCTION_REPORT.md](FINAL_PRODUCTION_REPORT.md)

---

## GitHub Repository

**Repository URL:**  
https://github.com/TSARIT1/SMMS-Super-Marketing-Management-System.git

**Clone Command:**
```bash
git clone https://github.com/TSARIT1/SMMS-Super-Marketing-Management-System.git
```

---

**Status:** ✅ Production Ready for Deployment  
**Last Updated:** February 5, 2026  
**Version:** 3.0 - Server Deployment Edition

---

*For additional support or issues, refer to the troubleshooting section or check the documentation files in the project repository.*
