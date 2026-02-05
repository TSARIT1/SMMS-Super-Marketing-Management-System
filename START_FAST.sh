#!/bin/bash

# SUPERMARKET POS - ULTRA-FAST BILLING SYSTEM
# Fast startup, fast billing, fast receipts

echo "🚀 SuperMarket POS - Starting Services..."

# Kill any existing processes
echo "Cleaning up ports..."
pkill -f "java.*SuperMarketBackend" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
sleep 2

# Start Backend
echo "Starting Backend (Port 8080)..."
cd "Super_market-main/SuperMarket Backend"
java -jar target/SuperMarketBackend-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev &
BACKEND_PID=$!
sleep 5
echo "Backend PID: $BACKEND_PID"

# Start Frontend
echo "Starting Frontend (Port 3000)..."
cd "../SuperMarket New Frontend"
npm run dev -- --port 3000 &
FRONTEND_PID=$!
sleep 8
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ SuperMarket POS Started!"
echo "📱 Access at: http://localhost:3000"
echo "🛒 Cart: http://localhost:3000/cart"
echo "💳 Backend: http://localhost:8080"
echo ""
echo "🖨️  Print Receipt: INSTANT (HTML - 0.5 seconds)"
echo "📄 Download PDF: FAST (1-2 seconds)"
echo ""
echo "Press Ctrl+C to stop services"
wait
