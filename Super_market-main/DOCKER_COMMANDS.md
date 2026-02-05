# 🐳 Docker Quick Reference - SuperMarket Application

## 🚀 Essential Commands

### Start Application
```bash
# Build and start all containers
docker-compose up -d --build

# Start without rebuild
docker-compose up -d

# Start specific service
docker-compose up -d frontend
```

### Stop Application
```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v

# Stop specific service
docker-compose stop backend
```

### View Status
```bash
# Check all containers
docker-compose ps

# Detailed status
docker ps -a --filter "name=supermarket"

# Check health
docker inspect supermarket-backend --format='{{.State.Health.Status}}'
```

### View Logs
```bash
# All services (follow mode)
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Last 100 lines
docker-compose logs --tail=100 backend

# Since specific time
docker-compose logs --since="2024-05-01" backend
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Rebuild Service
```bash
# Rebuild backend
docker-compose build backend
docker-compose up -d backend

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend

# Force rebuild (no cache)
docker-compose build --no-cache backend
```

### Execute Commands in Container
```bash
# Backend shell
docker exec -it supermarket-backend sh

# Frontend shell
docker exec -it supermarket-frontend sh

# MySQL shell
docker exec -it supermarket-mysql mysql -u root -p

# Run Java command in backend
docker exec supermarket-backend java -version
```

## 🗄️ Database Operations

### Backup Database
```bash
# Full backup
docker exec supermarket-mysql mysqldump -u root -p supermarket > backup_$(date +%Y%m%d).sql

# Backup specific table
docker exec supermarket-mysql mysqldump -u root -p supermarket users > users_backup.sql
```

### Restore Database
```bash
# Restore from backup
docker exec -i supermarket-mysql mysql -u root -p supermarket < backup.sql

# Create new database and restore
docker exec supermarket-mysql mysql -u root -p -e "CREATE DATABASE supermarket_new;"
docker exec -i supermarket-mysql mysql -u root -p supermarket_new < backup.sql
```

### Run SQL Query
```bash
# Single query
docker exec supermarket-mysql mysql -u root -p -e "SELECT COUNT(*) FROM supermarket.users;"

# Execute SQL file
docker exec -i supermarket-mysql mysql -u root -p supermarket < script.sql
```

### Export/Import Data
```bash
# Export table to CSV
docker exec supermarket-mysql mysql -u root -p -e "SELECT * FROM supermarket.products" | sed 's/\t/,/g' > products.csv

# Show database size
docker exec supermarket-mysql mysql -u root -p -e "SELECT table_schema AS 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.tables WHERE table_schema='supermarket';"
```

## 📦 Volume Management

### List Volumes
```bash
docker volume ls | grep supermarket
```

### Inspect Volume
```bash
# MySQL data volume
docker volume inspect super_market-main_mysql_data

# Backend uploads volume
docker volume inspect super_market-main_backend_uploads
```

### Backup Volume
```bash
# Backup MySQL data
docker run --rm -v super_market-main_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql_backup.tar.gz -C /data .

# Backup uploads
docker run --rm -v super_market-main_backend_uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads_backup.tar.gz -C /data .
```

### Restore Volume
```bash
# Restore MySQL data
docker run --rm -v super_market-main_mysql_data:/data -v $(pwd):/backup alpine tar xzf /backup/mysql_backup.tar.gz -C /data

# Restore uploads
docker run --rm -v super_market-main_backend_uploads:/data -v $(pwd):/backup alpine tar xzf /backup/uploads_backup.tar.gz -C /data
```

### Copy Files
```bash
# Copy file from container
docker cp supermarket-backend:/app/uploads/file.pdf ./local_file.pdf

# Copy file to container
docker cp ./local_file.pdf supermarket-backend:/app/uploads/

# Copy entire directory
docker cp supermarket-backend:/app/uploads ./uploads_backup
```

## 🔍 Debugging

### Container Resource Usage
```bash
# Real-time stats
docker stats

# Specific container
docker stats supermarket-backend

# Get memory usage
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### Network Debugging
```bash
# List networks
docker network ls

# Inspect network
docker network inspect super_market-main_supermarket-network

# Test connectivity
docker exec supermarket-backend ping mysql
docker exec supermarket-frontend ping backend

# Check open ports
docker exec supermarket-backend netstat -tuln
```

### Container Inspection
```bash
# Full container details
docker inspect supermarket-backend

# Get IP address
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' supermarket-backend

# Get environment variables
docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' supermarket-backend

# Get mounted volumes
docker inspect -f '{{range .Mounts}}{{.Source}} -> {{.Destination}}{{println}}{{end}}' supermarket-backend
```

### Application Logs
```bash
# Backend application logs
docker exec supermarket-backend cat /app/logs/application.log

# Nginx access logs
docker exec supermarket-frontend cat /var/log/nginx/access.log

# Nginx error logs
docker exec supermarket-frontend cat /var/log/nginx/error.log
```

## 🧹 Cleanup

### Remove Stopped Containers
```bash
docker container prune
```

### Remove Unused Images
```bash
# Remove dangling images
docker image prune

# Remove all unused images
docker image prune -a
```

### Remove Unused Volumes
```bash
# WARNING: This removes ALL unused volumes
docker volume prune
```

### Full System Cleanup
```bash
# Remove everything unused
docker system prune -a --volumes
```

### Remove Specific Items
```bash
# Remove specific container
docker rm supermarket-backend

# Remove specific image
docker rmi supermarket-backend:latest

# Remove specific volume
docker volume rm super_market-main_mysql_data
```

## 🔧 Performance Tuning

### View Container Limits
```bash
docker inspect supermarket-backend --format='{{.HostConfig.Memory}}'
docker inspect supermarket-backend --format='{{.HostConfig.CpuShares}}'
```

### Update Resource Limits
```yaml
# Add to docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Monitor Performance
```bash
# Real-time monitoring
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
```

## 🔐 Security

### Update Images
```bash
# Pull latest base images
docker-compose pull

# Rebuild with latest
docker-compose up -d --build
```

### Check for Vulnerabilities
```bash
# Scan image
docker scan supermarket-backend:latest
```

### View Container Processes
```bash
# List processes
docker top supermarket-backend

# Check running user
docker exec supermarket-backend whoami
```

## 📊 Health Checks

### Manual Health Check
```bash
# Backend health
curl http://localhost:8080/actuator/health

# Frontend health
curl http://localhost:3000/health

# MySQL health
docker exec supermarket-mysql mysqladmin ping -h localhost
```

### Automatic Health Monitoring
```bash
# Watch health status
watch -n 5 'docker ps --format "table {{.Names}}\t{{.Status}}"'
```

## 🎯 Quick Fixes

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Remove and recreate
docker-compose rm -f backend
docker-compose up -d backend
```

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :8080

# Kill process (Windows)
taskkill /PID <process_id> /F

# Or change port in .env file
echo BACKEND_PORT=8081 >> .env
```

### Out of Disk Space
```bash
# Check Docker disk usage
docker system df

# Clean up
docker system prune -a --volumes
```

### Database Connection Failed
```bash
# Restart MySQL
docker-compose restart mysql

# Wait for healthy
docker-compose ps mysql

# Check logs
docker-compose logs mysql
```

## 📱 One-Liners

```bash
# Full restart
docker-compose down && docker-compose up -d --build

# Quick rebuild backend
docker-compose up -d --build --no-deps backend

# Tail all logs
docker-compose logs -f --tail=50

# Check if all healthy
docker ps --filter "name=supermarket" --format "{{.Names}}: {{.Status}}"

# Database quick backup
docker exec supermarket-mysql mysqldump -u root -p supermarket | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Clear all logs
docker-compose down && docker system prune -f && docker-compose up -d

# Force recreate everything
docker-compose down -v && docker-compose up -d --build --force-recreate
```

---

**Pro Tip:** Save frequently used commands as shell aliases or batch scripts!
