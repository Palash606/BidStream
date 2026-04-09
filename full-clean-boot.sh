#!/bin/bash

# Configuration
PROJECT_ROOT="/Users/aviralshah/IdeaProjects/BidStream"
JAVA_HOME_21="/opt/homebrew/opt/openjdk@21"
export JAVA_HOME=$JAVA_HOME_21
export PATH=$JAVA_HOME/bin:$PATH

echo "🚀 Starting Full Clean Boot for BidStream..."
echo "Using JDK 21 at: $JAVA_HOME"

# Load environment variables if .env.local exists
if [ -f "$PROJECT_ROOT/.env.local" ]; then
    echo "Loading environment variables from .env.local..."
    # Robust env loading: remove comments, empty lines, and handle possible spaces
    export $(grep -v '^#' "$PROJECT_ROOT/.env.local" | grep -v '^\s*$' | xargs)
else
    echo "⚠️  Warning: .env.local not found. Services might fail if they require secrets."
fi

# 1. STOP EVERYTHING
echo "🛑 Stopping any existing processes on ports 8761, 8081, 8082, 8080, 5173..."
lsof -ti:8761,8081,8082,8080,5173 | xargs kill -9 2>/dev/null || true
sleep 2

# 2. START INFRASTRUCTURE (Docker)
echo "🐳 Starting Docker Infrastructure (PostgreSQL, Redis)..."
cd "$PROJECT_ROOT"
docker-compose down # Stop if running
docker-compose up -d

echo "   Waiting for PostgreSQL to be healthy..."
# We can't easily check 'health' without pg_isready inside the script simply, so we wait and check logs
for i in {1..30}; do
    if docker logs bidstream-db 2>&1 | grep -q "database system is ready to accept connections"; then
        echo "   ✅ PostgreSQL is ready!"
        break
    fi
    echo -n "."
    sleep 1
done

# 3. EUREKA SERVER
echo "🔧 Cleaning and Starting Eureka Server..."
cd "$PROJECT_ROOT/eureka-server"
./mvnw clean spring-boot:run -DskipTests > "$PROJECT_ROOT/eureka_server.log" 2>&1 &
echo "   Waiting for Eureka to initialize (15s)..."
sleep 15

# 3. IDENTITY SERVICE
echo "🔧 Cleaning and Starting Identity Service..."
cd "$PROJECT_ROOT/identity-service"
./mvnw clean spring-boot:run -DskipTests > "$PROJECT_ROOT/identity_service.log" 2>&1 &
echo "   Starting Identity Service (10s)..."
sleep 10

# 4. AUCTION SERVICE
echo "🔧 Cleaning and Starting Auction Service..."
cd "$PROJECT_ROOT/auction-service"
./mvnw clean spring-boot:run -DskipTests > "$PROJECT_ROOT/auction_service.log" 2>&1 &
echo "   Starting Auction Service (10s)..."
sleep 10

# 5. API GATEWAY
echo "🔧 Cleaning and Starting API Gateway..."
cd "$PROJECT_ROOT/api-gateway"
./mvnw clean spring-boot:run -DskipTests > "$PROJECT_ROOT/api_gateway.log" 2>&1 &
echo "   Starting API Gateway (5s)..."
sleep 5

# 6. REACT APP (BidStream UI)
echo "🔧 Cleaning and Starting React App (UI)..."
cd "$PROJECT_ROOT/bidstream-ui"
echo "   Running npm install..."
npm install > "$PROJECT_ROOT/bidstream_ui_install.log" 2>&1
echo "   Starting UI in dev mode..."
npm run dev -- --port 5173 > "$PROJECT_ROOT/bidstream_ui.log" 2>&1 &

echo "✅ All services are booting up!"
echo "Check progress in logs:"
echo " - Eureka:   eureka_server.log"
echo " - Identity: identity_service.log"
echo " - Auction:  auction_service.log"
echo " - Gateway:  api_gateway.log"
echo " - UI:       bidstream_ui.log"
echo ""
echo "🔗 URL To Run: http://localhost:5173"
