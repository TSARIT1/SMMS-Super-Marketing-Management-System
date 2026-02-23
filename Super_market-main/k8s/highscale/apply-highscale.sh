#!/bin/bash

# ============================================
# High Scale Deployment Script for 10M Users
# SuperMarket Management System
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="supermarket"
KUBE_CONTEXT="${KUBE_CONTEXT:-}"
REPLICAS_BACKEND="${REPLICAS_BACKEND:-10}"
REPLICAS_FRONTEND="${REPLICAS_FRONTEND:-5}"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}SuperMarket High Scale Deployment${NC}"
echo -e "${BLUE}Optimized for 10M Users & 60ms Response${NC}"
echo -e "${BLUE}============================================${NC}"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl is not installed${NC}"
    exit 1
fi

# Check if helm is available
if ! command -v helm &> /dev/null; then
    echo -e "${YELLOW}Warning: helm is not installed. Some features may not be available.${NC}"
fi

# Set kubernetes context if specified
if [ -n "$KUBE_CONTEXT" ]; then
    echo -e "${YELLOW}Setting Kubernetes context to: $KUBE_CONTEXT${NC}"
    kubectl config use-context "$KUBE_CONTEXT"
fi

# Create namespace if it doesn't exist
echo -e "${GREEN}Creating namespace: $NAMESPACE${NC}"
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# Apply ConfigMaps and Secrets first
echo -e "${GREEN}Applying ConfigMaps and Secrets...${NC}"
kubectl apply -f ../configmap.yaml -n "$NAMESPACE" 2>/dev/null || echo "ConfigMap already exists or file not found"
kubectl apply -f ../secrets.yaml -n "$NAMESPACE" 2>/dev/null || echo "Secrets already exists or file not found"

# Apply MySQL Cluster
echo -e "${GREEN}Deploying MySQL Cluster (Primary + 3 Replicas)...${NC}"
kubectl apply -f mysql-cluster.yaml -n "$NAMESPACE"

# Wait for MySQL to be ready
echo -e "${YELLOW}Waiting for MySQL to be ready...${NC}"
kubectl rollout status statefulset/mysql-primary -n "$NAMESPACE" --timeout=600s
kubectl rollout status statefulset/mysql-replica -n "$NAMESPACE" --timeout=600s

# Apply Redis Cluster
echo -e "${GREEN}Deploying Redis Cluster (6 nodes)...${NC}"
kubectl apply -f redis-cluster.yaml -n "$NAMESPACE"

# Wait for Redis to be ready
echo -e "${YELLOW}Waiting for Redis to be ready...${NC}"
kubectl rollout status statefulset/redis -n "$NAMESPACE" --timeout=300s

# Apply Backend Deployment
echo -e "${GREEN}Deploying Backend ($REPLICAS_BACKEND replicas)...${NC}"
kubectl apply -f backend-highscale.yaml -n "$NAMESPACE"

# Wait for Backend to be ready
echo -e "${YELLOW}Waiting for Backend to be ready...${NC}"
kubectl rollout status deployment/backend -n "$NAMESPACE" --timeout=600s

# Apply Frontend Deployment
echo -e "${GREEN}Deploying Frontend ($REPLICAS_FRONTEND replicas)...${NC}"
kubectl apply -f frontend-highscale.yaml -n "$NAMESPACE"

# Wait for Frontend to be ready
echo -e "${YELLOW}Waiting for Frontend to be ready...${NC}"
kubectl rollout status deployment/frontend -n "$NAMESPACE" --timeout=300s

# Apply Ingress with CDN configuration
echo -e "${GREEN}Applying Ingress and CDN configuration...${NC}"
kubectl apply -f ingress-cdn.yaml -n "$NAMESPACE"

# Verify deployments
echo -e "${GREEN}Verifying deployments...${NC}"
kubectl get pods -n "$NAMESPACE"
kubectl get services -n "$NAMESPACE"
kubectl get hpa -n "$NAMESPACE"

# Check if all pods are running
echo -e "${GREEN}Checking pod status...${NC}"
READY_PODS=$(kubectl get pods -n "$NAMESPACE" --no-headers | grep -c "Running" || echo "0")
TOTAL_PODS=$(kubectl get pods -n "$NAMESPACE" --no-headers | wc -l)

echo -e "${BLUE}Ready pods: $READY_PODS / $TOTAL_PODS${NC}"

if [ "$READY_PODS" -lt "$TOTAL_PODS" ]; then
    echo -e "${YELLOW}Warning: Not all pods are ready. Please check the status.${NC}"
fi

# Display connection information
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
echo -e "  Frontend: https://supermarket.com"
echo -e "  API: https://api.supermarket.com"
echo -e "  CDN: https://cdn.supermarket.com"
echo ""
echo -e "${BLUE}Monitoring:${NC}"
echo -e "  Prometheus: http://prometheus.supermarket.local"
echo -e "  Grafana: http://grafana.supermarket.local"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  kubectl get pods -n $NAMESPACE"
echo -e "  kubectl logs -f deployment/backend -n $NAMESPACE"
echo -e "  kubectl top pods -n $NAMESPACE"
echo ""
echo -e "${YELLOW}Performance Targets:${NC}"
echo -e "  - Response Time: < 60ms"
echo -e "  - Throughput: 10M users"
echo -e "  - Availability: 99.99%"
echo ""
echo -e "${GREEN}High Scale Deployment Successful!${NC}"