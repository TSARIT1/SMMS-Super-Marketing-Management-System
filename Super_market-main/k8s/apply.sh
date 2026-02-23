#!/bin/bash

# SuperMarket Kubernetes Deployment Script
# This script deploys the SuperMarket application to a Kubernetes cluster

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  SuperMarket Kubernetes Deployment${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl is not installed. Please install kubectl first.${NC}"
    exit 1
fi

# Check if connected to a cluster
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: Not connected to a Kubernetes cluster. Please configure your kubeconfig.${NC}"
    exit 1
fi

echo -e "${GREEN}Connected to Kubernetes cluster${NC}"

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Prompt for namespace (default: supermarket)
read -p "Enter namespace (default: supermarket): " NAMESPACE
NAMESPACE=${NAMESPACE:-supermarket}

echo -e "${YELLOW}Deploying to namespace: ${NAMESPACE}${NC}"

# Update namespace in all files
echo -e "${BLUE}Updating namespace in manifests...${NC}"
sed -i "s/namespace: supermarket/namespace: ${NAMESPACE}/g" "$SCRIPT_DIR"/*.yaml 2>/dev/null || \
sed -i '' "s/namespace: supermarket/namespace: ${NAMESPACE}/g" "$SCRIPT_DIR"/*.yaml 2>/dev/null

# Create namespace if it doesn't exist
echo -e "${BLUE}Creating namespace...${NC}"
kubectl apply -f "$SCRIPT_DIR/namespace.yaml"

# Apply secrets first
echo -e "${BLUE}Applying secrets...${NC}"
kubectl apply -f "$SCRIPT_DIR/secrets.yaml"

# Apply configmaps
echo -e "${BLUE}Applying configmaps...${NC}"
kubectl apply -f "$SCRIPT_DIR/configmap.yaml"

# Apply MySQL deployment
echo -e "${BLUE}Deploying MySQL...${NC}"
kubectl apply -f "$SCRIPT_DIR/mysql-deployment.yaml"

# Wait for MySQL to be ready
echo -e "${YELLOW}Waiting for MySQL to be ready...${NC}"
kubectl rollout status deployment/mysql -n ${NAMESPACE} --timeout=300s

# Apply Redis deployment
echo -e "${BLUE}Deploying Redis...${NC}"
kubectl apply -f "$SCRIPT_DIR/redis-deployment.yaml"

# Wait for Redis to be ready
echo -e "${YELLOW}Waiting for Redis to be ready...${NC}"
kubectl rollout status deployment/redis -n ${NAMESPACE} --timeout=120s

# Apply Backend deployment
echo -e "${BLUE}Deploying Backend...${NC}"
kubectl apply -f "$SCRIPT_DIR/backend-deployment.yaml"

# Wait for Backend to be ready
echo -e "${YELLOW}Waiting for Backend to be ready...${NC}"
kubectl rollout status deployment/backend -n ${NAMESPACE} --timeout=300s

# Apply Frontend deployment
echo -e "${BLUE}Deploying Frontend...${NC}"
kubectl apply -f "$SCRIPT_DIR/frontend-deployment.yaml"

# Wait for Frontend to be ready
echo -e "${YELLOW}Waiting for Frontend to be ready...${NC}"
kubectl rollout status deployment/frontend -n ${NAMESPACE} --timeout=120s

# Apply Ingress
echo -e "${BLUE}Applying Ingress...${NC}"
kubectl apply -f "$SCRIPT_DIR/ingress.yaml"

# Apply Pod Disruption Budgets and Network Policies
echo -e "${BLUE}Applying PDBs and Network Policies...${NC}"
kubectl apply -f "$SCRIPT_DIR/pdb.yaml"

# Show deployment status
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "${BLUE}Deployment Status:${NC}"
kubectl get deployments -n ${NAMESPACE}

echo -e "\n${BLUE}Pod Status:${NC}"
kubectl get pods -n ${NAMESPACE}

echo -e "\n${BLUE}Services:${NC}"
kubectl get services -n ${NAMESPACE}

echo -e "\n${BLUE}Ingress:${NC}"
kubectl get ingress -n ${NAMESPACE}

echo -e "\n${BLUE}Horizontal Pod Autoscalers:${NC}"
kubectl get hpa -n ${NAMESPACE}

echo -e "\n${GREEN}To access the application:${NC}"
echo -e "  1. Update your /etc/hosts or DNS to point supermarket.com to the ingress IP"
echo -e "  2. Get the ingress IP: kubectl get ingress -n ${NAMESPACE}"
echo -e "  3. Access the application at: http://supermarket.com"

echo -e "\n${YELLOW}Important: Update the secrets in k8s/secrets.yaml with production values!${NC}"
echo -e "${YELLOW}Important: Update the domain in k8s/ingress.yaml with your actual domain!${NC}"