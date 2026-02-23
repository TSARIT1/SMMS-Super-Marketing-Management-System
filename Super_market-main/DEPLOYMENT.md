# SMMS Deployment Guide

This guide covers deploying the SMMS (Super Market Management System) by TSAR IT using Docker and Kubernetes with high availability, global capacity, and ultra-fast performance.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Docker Deployment](#docker-deployment)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [Performance Optimizations](#performance-optimizations)
5. [SEO Implementation](#seo-implementation)
6. [Monitoring & Scaling](#monitoring--scaling)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### For Docker Deployment
- Docker 20.10+
- Docker Compose 2.0+
- 8GB+ RAM recommended
- 20GB+ disk space

### For Kubernetes Deployment
- Kubernetes 1.25+
- kubectl configured
- Helm 3.0+ (optional)
- NGINX Ingress Controller
- cert-manager (for SSL)
- 16GB+ RAM recommended
- 50GB+ disk space

---

## Docker Deployment

### Development Mode

```bash
# Clone the repository
git clone https://github.com/TSARIT1/SMMS-Super-Marketing-Management-System.git
cd Super_market-main

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Production Mode with Redis

```bash
# Create .env file with production values
cat > .env << EOF
MYSQL_ROOT_PASSWORD=your-secure-root-password
MYSQL_PASSWORD=your-secure-db-password
JWT_SECRET=your-256-bit-secret-key
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
VITE_API_BASE_URL=https://api.yourdomain.com
EOF

# Start production stack
docker-compose -f docker-compose.prod.yml up -d

# Scale backend for high traffic
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### Docker Commands

```bash
# Build images
docker-compose build

# View running containers
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Remove volumes (clean slate)
docker-compose down -v
```

---

## Kubernetes Deployment

### Quick Deploy

```bash
# Make the script executable
chmod +x k8s/apply.sh

# Run deployment script
./k8s/apply.sh
```

### Manual Deploy

```bash
# 1. Create namespace
kubectl apply -f k8s/namespace.yaml

# 2. Create secrets (UPDATE VALUES FIRST!)
kubectl apply -f k8s/secrets.yaml

# 3. Create configmaps
kubectl apply -f k8s/configmap.yaml

# 4. Deploy MySQL
kubectl apply -f k8s/mysql-deployment.yaml
kubectl rollout status deployment/mysql -n supermarket --timeout=300s

# 5. Deploy Redis
kubectl apply -f k8s/redis-deployment.yaml
kubectl rollout status deployment/redis -n supermarket --timeout=120s

# 6. Deploy Backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl rollout status deployment/backend -n supermarket --timeout=300s

# 7. Deploy Frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl rollout status deployment/frontend -n supermarket --timeout=120s

# 8. Apply Ingress
kubectl apply -f k8s/ingress.yaml

# 9. Apply PDBs and Network Policies
kubectl apply -f k8s/pdb.yaml
```

### Kubernetes Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Ingress (NGINX)                          │
│                    smms.tsaritservices.com, api.smms.tsaritservices.com │
└─────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
            ┌───────▼───────┐           ┌───────▼───────┐
            │   Frontend    │           │    Backend    │
            │   (3-10 pods) │           │   (3-20 pods) │
            │   HPA Enabled │           │   HPA Enabled │
            └───────────────┘           └───────┬───────┘
                                                │
                            ┌───────────────────┼───────────────────┐
                            │                   │                   │
                    ┌───────▼───────┐   ┌───────▼───────┐   ┌───────▼───────┐
                    │     MySQL     │   │     Redis     │   │   PVC/PVS     │
                    │   (Primary)   │   │    (Cache)    │   │  (Storage)    │
                    └───────────────┘   └───────────────┘   └───────────────┘
```

---

## Performance Optimizations

### 1. Redis Caching

Redis is configured for:
- **Session storage**: User sessions cached for fast access
- **API response caching**: Frequently accessed data cached
- **Rate limiting**: Request throttling for API protection
- **Database query caching**: Reducing database load

### 2. Nginx Optimizations

- **Gzip/Brotli compression**: 70-80% size reduction
- **Static asset caching**: 1-year cache for immutable assets
- **HTTP/2 support**: Multiplexed requests
- **Connection pooling**: Keep-alive connections
- **Rate limiting**: Protection against DDoS

### 3. Database Optimizations

- **Connection pooling**: HikariCP with optimized settings
- **Query optimization**: JPA/Hibernate tuning
- **Index optimization**: Strategic database indexes
- **Read replicas**: For scaling read operations

### 4. JVM Optimizations

```bash
-Xms512m                          # Initial heap size
-Xmx1024m                         # Max heap size
-XX:+UseG1GC                      # G1 garbage collector
-XX:MaxGCPauseMillis=200          # Max GC pause target
-XX:+UseStringDeduplication       # String deduplication
-XX:+UseCompressedOops            # Compressed object pointers
```

### 5. Frontend Optimizations

- **Code splitting**: Vendor chunks for faster loading
- **Tree shaking**: Dead code elimination
- **Minification**: ESBuild for ultra-fast minification
- **Lazy loading**: Components loaded on demand
- **Service Worker**: Offline capability (PWA)

---

## SEO Implementation

### Meta Tags
- Primary meta tags (title, description, keywords)
- Open Graph tags for social sharing
- Twitter Card tags
- Canonical URLs
- Hreflang for internationalization

### Structured Data (JSON-LD)
- Organization schema
- WebApplication schema
- SoftwareApplication schema
- BreadcrumbList schema
- FAQPage schema

### Files Created
- `/sitemap.xml` - XML sitemap for search engines
- `/robots.txt` - Crawler instructions
- `/manifest.json` - PWA manifest

### SEO Checklist
- [x] Semantic HTML structure
- [x] Meta tags for all pages
- [x] Open Graph tags
- [x] Twitter Cards
- [x] Structured data (JSON-LD)
- [x] XML Sitemap
- [x] Robots.txt
- [x] Canonical URLs
- [x] Mobile-responsive design
- [x] Fast page load (<3s)
- [x] HTTPS (via Ingress)

---

## Monitoring & Scaling

### Horizontal Pod Autoscaler (HPA)

The backend and frontend have HPA configured:

```yaml
# Backend HPA
minReplicas: 3
maxReplicas: 20
metrics:
  - cpu: 70%
  - memory: 80%

# Frontend HPA
minReplicas: 2
maxReplicas: 10
metrics:
  - cpu: 70%
  - memory: 80%
```

### Scaling Commands

```bash
# Manual scale
kubectl scale deployment/backend --replicas=5 -n supermarket

# Check HPA status
kubectl get hpa -n supermarket

# View resource usage
kubectl top pods -n supermarket
```

### Monitoring Setup

```bash
# Install Prometheus (optional)
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring

# Port forward to access Grafana
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
```

---

## Troubleshooting

### Common Issues

#### 1. Pods not starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n supermarket

# Check logs
kubectl logs <pod-name> -n supermarket

# Check events
kubectl get events -n supermarket --sort-by='.lastTimestamp'
```

#### 2. Database connection issues

```bash
# Verify MySQL is running
kubectl get pods -l app=mysql -n supermarket

# Check MySQL logs
kubectl logs deployment/mysql -n supermarket

# Test connection
kubectl run mysql-client --rm -it --image=mysql:8.0 -- mysql -h mysql-service -u root -p
```

#### 3. Ingress not working

```bash
# Check ingress
kubectl describe ingress supermarket-ingress -n supermarket

# Check ingress controller logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller

# Verify DNS
nslookup supermarket.com
```

#### 4. SSL certificate issues

```bash
# Check certificate status
kubectl get certificates -n supermarket

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager

# Force certificate renewal
kubectl delete certificate supermarket-tls-secret -n supermarket
```

### Health Checks

```bash
# Backend health
curl http://smms.tsaritservices.com/api/actuator/health

# Frontend health
curl http://smms.tsaritservices.com/health

# Redis health
kubectl exec -it deployment/redis -n supermarket -- redis-cli ping

# MySQL health
kubectl exec -it deployment/mysql -n supermarket -- mysqladmin ping -h localhost
```

---

## Environment Variables

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| SPRING_PROFILES_ACTIVE | Spring profile | prod |
| SPRING_DATASOURCE_URL | Database URL | jdbc:mysql://mysql:3306/supermarket |
| JWT_SECRET | JWT signing key | (change in production) |
| MAIL_HOST | SMTP host | smtp.gmail.com |
| RAZORPAY_KEY_ID | Razorpay key ID | (from Razorpay dashboard) |
| SPRING_DATA_REDIS_HOST | Redis host | redis-service |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_BASE_URL | API base URL | https://api.supermarket.com |

---

## Security Checklist

- [ ] Update all secrets in `k8s/secrets.yaml`
- [ ] Enable HTTPS via cert-manager
- [ ] Configure network policies
- [ ] Set up pod security policies
- [ ] Enable audit logging
- [ ] Configure backup for MySQL
- [ ] Set up disaster recovery
- [ ] Regular security updates

---

## Support

For issues and feature requests, please create an issue on GitHub:
https://github.com/TSARIT1/SMMS-Super-Marketing-Management-System/issues