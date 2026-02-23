# SuperMarket High Scale Deployment Guide

## Overview

This guide documents the high-scale infrastructure configuration for supporting **10 million users** with **sub-60ms response times** and **Google first-rank SEO optimization**.

## Architecture Summary

### Target Metrics
| Metric | Target | Implementation |
|--------|--------|----------------|
| Concurrent Users | 10,000,000 | Auto-scaling pods (10-200 backend) |
| Response Time | < 60ms | Redis cache, CDN, optimized queries |
| Availability | 99.99% | Multi-replica, PDB, health checks |
| SEO Score | 100/100 | Structured data, sitemap, meta tags |

### Infrastructure Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        CDN (CloudFlare/AWS CloudFront)          │
│                    Global Edge Locations (200+)                 │
└─────────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────────────────────────────────────┐
│                     Load Balancer (AWS NLB/GCP LB)              │
│                    SSL Termination, DDoS Protection             │
└─────────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────────────────────────────────────┐
│                     NGINX Ingress Controller                     │
│              Rate Limiting, Caching, HTTP/2, HTTP/3             │
└─────────────────────────────────────────────────────────────────┘
                    │                           │
        ┌───────────────────────┐   ┌───────────────────────┐
        │   Frontend (5-50)     │   │   Backend (10-200)    │
        │   React + Nginx       │   │   Spring Boot 3.4     │
        │   Static Assets       │   │   Java 21 + G1GC      │
        └───────────────────────┘   └───────────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
        ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐
        │   Redis Cluster (6)   │   │   MySQL Primary       │   │   MySQL Replicas (3)  │
        │   Distributed Cache   │   │   Write Operations    │   │   Read Operations     │
        │   Session Storage     │   │   500GB SSD           │   │   200GB SSD each      │
        └───────────────────────┘   └───────────────────────┘   └───────────────────────┘
```

## File Structure

```
k8s/highscale/
├── mysql-cluster.yaml        # MySQL Primary + 3 Replicas
├── redis-cluster.yaml        # Redis 6-node cluster
├── backend-highscale.yaml    # Backend deployment with HPA/VPA
├── frontend-highscale.yaml   # Frontend deployment with Nginx
├── ingress-cdn.yaml          # Ingress with CDN integration
└── apply-highscale.sh        # Deployment script

SuperMarket Backend/src/main/resources/
├── application-highscale.properties  # High-scale configuration
└── db/indexes.sql                    # Database indexes

SuperMarket Frontend/public/
├── sitemap.xml               # SEO sitemap
└── robots.txt                # SEO robots configuration
```

## Quick Start

### Prerequisites
- Kubernetes cluster (EKS, GKE, or AKS)
- kubectl configured
- Helm 3.x (optional)
- 64GB+ RAM cluster minimum
- SSD storage classes

### Deploy

```bash
# Make script executable
chmod +x k8s/highscale/apply-highscale.sh

# Deploy to Kubernetes
./k8s/highscale/apply-highscale.sh
```

## Configuration Details

### 1. Database (MySQL Cluster)

**Primary Node:**
- 8 CPU cores, 32GB RAM
- 500GB SSD storage
- 5000 max connections
- 8GB InnoDB buffer pool

**Read Replicas (3x):**
- 4 CPU cores, 16GB RAM each
- 200GB SSD storage each
- 3000 max connections each
- Read-only mode

**Key Optimizations:**
```sql
-- InnoDB settings for 60ms response
innodb_buffer_pool_size=8G
innodb_log_file_size=1G
innodb_flush_log_at_trx_commit=2
innodb_io_capacity=2000
innodb_read_io_threads=8
innodb_write_io_threads=8
```

### 2. Cache (Redis Cluster)

**6-Node Cluster:**
- 2 CPU cores, 8GB RAM each
- 10GB SSD storage each
- 4GB max memory per node
- LRU eviction policy

**Key Features:**
- Cluster mode enabled
- Sentinel for HA
- Latency monitoring (50ms threshold)
- IO threads for performance

### 3. Backend (Spring Boot)

**Deployment Configuration:**
- Min replicas: 10
- Max replicas: 200
- CPU: 2-4 cores per pod
- Memory: 8-10GB per pod

**JVM Optimizations:**
```bash
-Xms4g -Xmx6g
-XX:+UseG1GC
-XX:MaxGCPauseMillis=50
-XX:G1HeapRegionSize=32m
-XX:+UseStringDeduplication
-XX:+UseNUMA
```

**Cache Configuration:**
| Cache | TTL | Purpose |
|-------|-----|---------|
| users | 30 min | User profiles |
| products | 2 min | Product catalog |
| categories | 1 hour | Category tree |
| inventory | 1 min | Stock levels |
| dashboard | 30 sec | Dashboard data |

### 4. Frontend (React + Nginx)

**Deployment Configuration:**
- Min replicas: 5
- Max replicas: 50
- CPU: 100-500m per pod
- Memory: 128-256MB per pod

**Nginx Optimizations:**
- Worker processes: auto
- Worker connections: 65,535
- Gzip + Brotli compression
- HTTP/2 and HTTP/3 (QUIC)
- Static asset caching (1 year)

### 5. Ingress & CDN

**Features:**
- Let's Encrypt SSL (auto-renewal)
- HTTP/2 and HTTP/3 support
- Brotli compression
- Rate limiting (1000 RPS per IP)
- Session affinity
- Global load balancing

**CDN Integration:**
- CloudFlare / AWS CloudFront
- Edge caching for static assets
- DDoS protection
- Web Application Firewall (WAF)

## SEO Optimization

### 1. Meta Tags (index.html)
- Title tags optimized for keywords
- Meta descriptions (150-160 chars)
- Open Graph tags for social sharing
- Twitter Card meta tags
- Canonical URLs

### 2. Structured Data (JSON-LD)
- Organization schema
- WebApplication schema
- SoftwareApplication schema
- BreadcrumbList schema
- FAQPage schema

### 3. Technical SEO
- XML Sitemap with priorities
- Robots.txt optimized
- HSTS preload
- Mobile-responsive design
- Core Web Vitals optimized

### 4. Performance SEO
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- TTFB < 60ms

## Performance Tuning

### Database Indexes

Run the index script for optimal query performance:

```bash
mysql -u root -p supermarket < SuperMarket\ Backend/src/main/resources/db/indexes.sql
```

**Key Indexes:**
- Composite indexes for common queries
- Full-text search indexes
- Partial indexes for filtered queries
- Covering indexes for frequent selects

### Connection Pooling

**HikariCP Configuration:**
```properties
spring.datasource.hikari.maximum-pool-size=100
spring.datasource.hikari.minimum-idle=20
spring.datasource.hikari.connection-timeout=500
```

### Query Optimization

1. Use read replicas for SELECT queries
2. Enable query cache for repeated queries
3. Use batch inserts for bulk operations
4. Implement pagination for large datasets

## Monitoring

### Prometheus Metrics

```yaml
# Available metrics
- http_server_requests_seconds
- jvm_memory_used_bytes
- hikaricp_connections_active
- redis_commands_latency
- mysql_queries_per_second
```

### Grafana Dashboards

1. **Application Dashboard**
   - Request rate
   - Response time (p50, p95, p99)
   - Error rate

2. **Infrastructure Dashboard**
   - CPU/Memory usage
   - Database connections
   - Cache hit ratio

3. **Business Dashboard**
   - Active users
   - Orders per minute
   - Revenue tracking

## Scaling Guidelines

### Horizontal Scaling

```bash
# Scale backend manually
kubectl scale deployment/backend --replicas=50 -n supermarket

# Scale frontend manually
kubectl scale deployment/frontend --replicas=20 -n supermarket
```

### Auto-Scaling Triggers

| Metric | Scale Up | Scale Down |
|--------|----------|------------|
| CPU | > 60% | < 30% |
| Memory | > 70% | < 40% |
| RPS | > 1000/pod | < 200/pod |

## Cost Estimation

### Monthly Infrastructure Cost (AWS)

| Component | Quantity | Unit Cost | Monthly |
|-----------|----------|-----------|---------|
| EKS Cluster | 1 | $73 | $73 |
| EC2 Nodes (m6i.2xlarge) | 10 | $280 | $2,800 |
| RDS MySQL (db.r6g.2xlarge) | 4 | $350 | $1,400 |
| ElastiCache Redis | 6 | $150 | $900 |
| ALB/NLB | 2 | $25 | $50 |
| CloudFront CDN | 10TB | $85/TB | $850 |
| S3 Storage | 500GB | $0.023/GB | $12 |
| **Total** | | | **~$6,085** |

## Troubleshooting

### Common Issues

1. **High Response Time**
   ```bash
   # Check cache hit ratio
   redis-cli info stats | grep keyspace
   
   # Check slow queries
   kubectl exec -it mysql-primary-0 -- mysql -e "SHOW PROCESSLIST;"
   ```

2. **Pod Scaling Issues**
   ```bash
   # Check HPA status
   kubectl describe hpa backend-hpa -n supermarket
   
   # Check resource usage
   kubectl top pods -n supermarket
   ```

3. **Database Connection Exhaustion**
   ```bash
   # Check connections
   kubectl exec -it mysql-primary-0 -- mysql -e "SHOW STATUS LIKE 'Threads_connected';"
   
   # Increase pool size in ConfigMap
   kubectl edit configmap supermarket-config -n supermarket
   ```

## Security Checklist

- [x] SSL/TLS enabled (Let's Encrypt)
- [x] HSTS header configured
- [x] CSP header configured
- [x] Rate limiting enabled
- [x] Network policies applied
- [x] Secrets stored in Kubernetes Secrets
- [x] Container images scanned
- [x] RBAC configured
- [x] Pod Security Standards applied

## Backup Strategy

### Database Backups
```bash
# Automated daily backups
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mysql-backup
  namespace: supermarket
spec:
  schedule: "0 2 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: mysql:8.0
            command:
            - sh
            - -c
            - mysqldump -h mysql-primary-service -u root -p$MYSQL_ROOT_PASSWORD supermarket | gzip > /backup/supermarket-$(date +%Y%m%d).sql.gz
EOF
```

### Redis Persistence
- AOF disabled for performance
- RDB snapshots every 5 minutes
- Cross-region replication optional

## Support

For issues or questions:
- GitHub: https://github.com/TSARIT1/SMMS-Super-Marketing-Management-System
- Email: support@supermarket.com

---

**Last Updated:** February 2026  
**Version:** 2.0.0  
**Author:** SuperMarket DevOps Team