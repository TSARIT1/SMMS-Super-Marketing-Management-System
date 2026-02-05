# 🔐 Security Configuration Checklist

**Last Updated:** February 5, 2026  
**Status:** Production Ready

---

## 🚨 Critical Security Items (DO BEFORE PRODUCTION)

### 1. Change All Default Passwords

**Location:** `.env` file

```env
# ❌ NEVER USE THESE IN PRODUCTION:
MYSQL_ROOT_PASSWORD=SuperMarket@2026!Root
MYSQL_PASSWORD=SuperMarket@2026!User
JWT_SECRET=tsar-supermarket-jwt-secret-key-2026

# ✅ REPLACE WITH STRONG RANDOM VALUES:
```

**How to Generate Secure Passwords:**

**Windows PowerShell:**
```powershell
# Generate 32-character random password
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Generate 64-character JWT secret
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 32 -Maximum 127 -InputObject @(48..57+65..90+97..122) }) | % {[byte]$_})
```

**Linux/Mac:**
```bash
# Generate password
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 64
```

### 2. Configure JWT Secret

**Critical:** JWT secret must be unique and random

```bash
# Generate new JWT secret
openssl rand -base64 64

# Add to .env
JWT_SECRET=<paste_generated_value>
```

**Length:** Minimum 64 characters (256-bit)  
**Type:** Random alphanumeric + special characters  
**Change:** At least annually or after suspected breach

### 3. Set Strong Database Passwords

Requirements:
- ✅ Minimum 12 characters
- ✅ Mix uppercase and lowercase
- ✅ Include numbers
- ✅ Include special characters (!@#$%^&*)
- ✅ No dictionary words
- ✅ No default values

**Example:**
```
Tr0p!cal$Mang0@2026#SecureDB
```

### 4. Environment Variables Security

**Check:** All sensitive data is in `.env` file, NOT in code

```bash
# Search for hardcoded passwords
grep -r "password=" . --include="*.java" --include="*.properties" | grep -v "env" | grep -v "example"

# Search for hardcoded API keys
grep -r "apikey\|api_key\|secret_key" . --include="*.java" --include="*.js"
```

**Expected Result:** Nothing should be found (except in example files)

---

## 🔒 Application Security

### 1. CORS Configuration

**File:** `SuperMarket Backend/src/main/java/in/main/configuration/WebConfig.java`

**Check:**
```java
// ❌ NEVER USE IN PRODUCTION
allowedOrigins = {"*"}

// ✅ USE SPECIFIC DOMAINS
allowedOrigins = {"https://yourdomain.com", "https://www.yourdomain.com"}
```

### 2. Spring Security

**File:** `application-prod.properties`

**Required Settings:**
```properties
# Session security
spring.session.timeout=30m
server.servlet.session.timeout=30m

# HTTPS enforcement (when using SSL)
server.ssl.enabled=true
server.ssl.key-store=/path/to/keystore
server.ssl.key-store-password=${SSL_KEYSTORE_PASSWORD}
```

### 3. Authentication & Authorization

- ✅ JWT tokens expire after 24 hours
- ✅ Passwords hashed with BCrypt
- ✅ Role-based access control (RBAC)
- ✅ Admin endpoints protected
- ✅ Sensitive data logged securely

---

## 🐳 Docker Security

### 1. Non-Root User

**Verify both Dockerfiles use non-root user:**

```dockerfile
# ✅ CORRECT
USER spring:spring  # Backend
USER nginx          # Frontend

# ❌ INCORRECT
USER root
```

**Check:**
```bash
# Verify backend runs as non-root
docker exec supermarket-backend whoami
# Expected: spring

# Verify frontend runs as non-root
docker exec supermarket-frontend whoami
# Expected: nginx
```

### 2. Image Scanning

**Scan for vulnerabilities:**
```bash
# Scan backend image
docker scan supermarket-backend:latest

# Scan frontend image
docker scan supermarket-frontend:latest

# Scan base images
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image mysql:8.0.44
```

### 3. Network Isolation

**Verify in docker-compose.yml:**
```yaml
# ✅ CORRECT - Only frontend exposed
services:
  frontend:
    ports:
      - "3000:80"  # Exposed
  
  backend:
    ports:
      - "8080:8080"  # Exposed (for development)
  
  mysql:
    # ✅ NO ports exposed - internal only
    networks:
      - supermarket-network
```

### 4. Volume Permissions

**Check:**
```bash
# Verify upload directory permissions
docker exec supermarket-backend ls -la /app/uploads
# Expected: drwxr-xr-x spring:spring

# Verify no world-readable secrets
docker exec supermarket-backend find / -name "*.env" 2>/dev/null
# Expected: Nothing found
```

---

## 🗄️ Database Security

### 1. User Privileges

**Current Setup:**
```sql
-- Application user (restricted privileges)
GRANT SELECT, INSERT, UPDATE, DELETE ON supermarket.* TO 'supermarket_user'@'%';

-- Do NOT give:
-- GRANT SUPER ON *.* ... -- Can bypass security
-- GRANT FILE ON *.* ... -- Can read/write files
```

### 2. Database Backups

**Encryption:**
```bash
# Backup with encryption
docker exec supermarket-mysql mysqldump -u root -p supermarket | \
  openssl enc -aes-256-cbc -salt -out backup.sql.enc

# Restore encrypted backup
openssl enc -d -aes-256-cbc -in backup.sql.enc | \
  docker exec -i supermarket-mysql mysql -u root -p supermarket
```

### 3. Query Logging

**Disable in production:**
```properties
# ✅ CORRECT for production
spring.jpa.show-sql=false
SHOW_SQL=false

# ❌ NEVER in production (exposes data)
spring.jpa.show-sql=true
SHOW_SQL=true
```

---

## 🌐 Network Security

### 1. HTTPS/SSL Configuration

**For Production:**

```yaml
# Use Let's Encrypt with Caddy
caddy:
  image: caddy:latest
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./Caddyfile:/etc/caddy/Caddyfile
    - caddy_data:/data
  environment:
    ACME_AGREE: "true"
```

### 2. Firewall Rules

**Allow only required ports:**

```bash
# Windows Firewall
netsh advfirewall firewall add rule name="SuperMarket Front" dir=in action=allow protocol=tcp localport=3000
netsh advfirewall firewall add rule name="SuperMarket API" dir=in action=allow protocol=tcp localport=8080

# Linux (UFW)
sudo ufw allow 3000/tcp
sudo ufw allow 8080/tcp
sudo ufw enable
```

### 3. Reverse Proxy

**Use Nginx reverse proxy in front:**

```nginx
# ✅ RECOMMENDED: Terminate SSL at reverse proxy
proxy_pass http://backend:8080;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

---

## 📋 Deployment Checklist

### Before Going Live

- [ ] All passwords changed from defaults
- [ ] JWT_SECRET set to random value
- [ ] Database user password strong (12+ chars, mixed case, numbers, symbols)
- [ ] CORS configured for specific domains
- [ ] HTTPS/SSL enabled (if public-facing)
- [ ] Firewall configured
- [ ] Images scanned for vulnerabilities
- [ ] Non-root users verified in containers
- [ ] Backup tested and documented
- [ ] Logging configured (not showing SQL)
- [ ] Rate limiting enabled (optional but recommended)
- [ ] API keys for payment gateway configured
- [ ] Email service configured
- [ ] .env file NOT in git repository
- [ ] .gitignore includes .env
- [ ] Security headers configured
- [ ] CORS restrictions applied
- [ ] Database backups scheduled
- [ ] Monitoring configured
- [ ] Alert notifications set up
- [ ] Disaster recovery plan documented

---

## 🔄 Security Maintenance

### Weekly Tasks

```bash
# Check for security updates
docker pull mysql:8.0.44
docker pull node:20-alpine
docker pull eclipse-temurin:21-jre-alpine
docker pull nginx:1.25-alpine

# Review logs for suspicious activity
docker-compose logs --since="24h" | grep -i "error\|failed\|unauthorized"
```

### Monthly Tasks

```bash
# Scan images for CVE vulnerabilities
docker scan supermarket-backend:latest
docker scan supermarket-frontend:latest

# Verify backup integrity
docker exec supermarket-mysql mysql -u root -p -e "CHECK TABLE *;"

# Review user access logs
docker exec supermarket-mysql mysql -u root -p mysql \
  -e "SELECT user, authentication_string, password_last_changed FROM user;"
```

### Quarterly Tasks

- [ ] Rotate API keys
- [ ] Review access logs
- [ ] Update security policies
- [ ] Conduct security audit
- [ ] Update dependencies
- [ ] Review firewall rules
- [ ] Test disaster recovery

### Annual Tasks

- [ ] Full security assessment
- [ ] Penetration testing (if applicable)
- [ ] Update SSL certificates
- [ ] Review and update all passwords
- [ ] Infrastructure assessment

---

## 🚨 Incident Response

### If Password Compromised

1. **Immediate:** Stop all services
2. Change password in `.env`
3. Rebuild containers
4. Restart services
5. Check logs for unauthorized access
6. Review recent database changes

```bash
docker-compose down
# Edit .env with new password
docker-compose up -d --build
```

### If API Key Compromised

1. Revoke key immediately (Razorpay dashboard)
2. Generate new API key
3. Update `.env` with new key
4. Redeploy backend
5. Review transaction logs

### If Database Breach Suspected

1. **Enable logging:**
```sql
SET GLOBAL general_log = 'ON';
SET GLOBAL log_output = 'TABLE';
```

2. **Review logs:**
```bash
docker exec supermarket-mysql mysql -u root -p mysql \
  -e "SELECT * FROM general_log WHERE command_type != 'Query' LIMIT 10;"
```

3. **Restore from clean backup**

---

## 📞 Security Support

### Common Issues

**Q: Where should I store .env file?**
- Outside version control
- Encrypted on disk
- Use secrets management (AWS Secrets Manager, Vault)

**Q: How often should I rotate passwords?**
- Immediately if compromised
- Every 90 days for production systems
- At least annually

**Q: Is it safe to expose port 3000?**
- Yes for development/staging
- Use HTTPS and firewall rules for production
- Consider restricting to VPN/specific IPs

**Q: How to check for vulnerabilities?**
```bash
docker scan supermarket-backend:latest
npm audit
mvn dependency-check:check
```

---

## ✅ Security Verification

Run this command to verify security:

```bash
# Check no hardcoded passwords
grep -r "password.*=" . --include="*.properties" --include="*.java" | grep -v "env" | grep -v "example" | grep -v ".git"

# Check no API keys in code
grep -r "api_key\|apiKey\|secret" . --include="*.yml" --include="*.yaml" | grep -v "example" | grep -v ".git"

# Check .env not in git
git check-ignore .env
# Should output: .env
```

---

**Status:** ✅ PRODUCTION READY  
**Last Verified:** February 5, 2026  
**Next Review:** Quarterly
