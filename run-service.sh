#!/bin/bash
# run-service.sh [service-directory] [log-file]
SERVICE_DIR=$1
LOG_FILE=$2

# Load environment variables from .env.local
# Filter out comments and empty lines, then export
if [ -f ".env.local" ]; then
  export $(grep -v '^#' .env.local | grep -v '^\s*$' | xargs)
fi

# Set Java Home for JDK 21
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
export PATH=$JAVA_HOME/bin:$PATH

echo "Starting $SERVICE_DIR..."
cd "$SERVICE_DIR"
./mvnw clean spring-boot:run > "../$LOG_FILE" 2>&1 &
echo "Started $SERVICE_DIR in background, PID: $!"
