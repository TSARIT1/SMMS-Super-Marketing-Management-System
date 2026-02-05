#!/bin/bash

# Super Market Docker Deployment Script
# This script builds and deploys the entire Super Market application using Docker

set -e

echo "🚀 Super Market - Docker Deployment Script"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"

# Navigate to project directory
cd "$(dirname "$0")"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created. Please review and update if needed.${NC}"
fi

# Load environment variables
source .env

echo ""
echo "📋 Configuration:"
echo "   - MySQL Database: ${MYSQL_DATABASE}"
echo "   - Backend Port: ${BACKEND_PORT}"
echo "   - Frontend Port: ${FRONTEND_PORT}"
echo ""

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images (optional - uncomment to clean build)
# echo "🗑️  Removing old images..."
# docker-compose down --rmi all

# Build images
echo ""
echo "🔨 Building Docker images..."
docker-compose build --no-cache

# Start services
echo ""
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

# Check MySQL health
echo ""
echo "🔍 Checking MySQL..."
timeout=60
counter=0
until docker-compose exec -T mysql mysqladmin ping -h localhost -uroot -p${MYSQL_ROOT_PASSWORD} --silent &> /dev/null; do
    counter=$((counter + 1))
    if [ $counter -eq $timeout ]; then
        echo -e "${RED}❌ MySQL failed to start within ${timeout} seconds${NC}"
        docker-compose logs mysql
        exit 1
    fi
    echo -e "${YELLOW}⏳ Waiting for MySQL... (${counter}/${timeout})${NC}"
    sleep 2
done
echo -e "${GREEN}✅ MySQL is healthy${NC}"

# Check Backend health
echo ""
echo "🔍 Checking Backend..."
timeout=120
counter=0
until curl -f http://localhost:${BACKEND_PORT}/actuator/health &> /dev/null; do
    counter=$((counter + 1))
    if [ $counter -eq $timeout ]; then
        echo -e "${RED}❌ Backend failed to start within ${timeout} seconds${NC}"
        docker-compose logs backend
        exit 1
    fi
    echo -e "${YELLOW}⏳ Waiting for Backend... (${counter}/${timeout})${NC}"
    sleep 2
done
echo -e "${GREEN}✅ Backend is healthy${NC}"

# Check Frontend health
echo ""
echo "🔍 Checking Frontend..."
timeout=30
counter=0
until curl -f http://localhost:${FRONTEND_PORT}/health &> /dev/null; do
    counter=$((counter + 1))
    if [ $counter -eq $timeout ]; then
        echo -e "${RED}❌ Frontend failed to start within ${timeout} seconds${NC}"
        docker-compose logs frontend
        exit 1
    fi
    echo -e "${YELLOW}⏳ Waiting for Frontend... (${counter}/${timeout})${NC}"
    sleep 1
done
echo -e "${GREEN}✅ Frontend is healthy${NC}"

# Display final status
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Super Market Application Deployed Successfully!${NC}"
echo ""
echo "📱 Access URLs:"
echo "   - Frontend: http://localhost:${FRONTEND_PORT}"
echo "   - Backend API: http://localhost:${BACKEND_PORT}"
echo "   - MySQL: localhost:${MYSQL_PORT}"
echo ""
echo "🔐 Default Super Admin Credentials:"
echo "   - Email: superadmin@tsar.com"
echo "   - Password: SuperAdmin@123"
echo ""
echo "📊 Useful Commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop: docker-compose stop"
echo "   - Restart: docker-compose restart"
echo "   - Remove: docker-compose down"
echo ""
echo "=========================================="
