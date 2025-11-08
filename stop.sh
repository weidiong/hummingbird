#!/bin/bash

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping Hummingbird servers...${NC}\n"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Stop backend if PID file exists
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${RED}Stopping backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID
        rm .backend.pid
    else
        echo "Backend process not found"
        rm .backend.pid
    fi
fi

# Stop frontend if PID file exists
if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${RED}Stopping frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID
        rm .frontend.pid
    else
        echo "Frontend process not found"
        rm .frontend.pid
    fi
fi

# Also kill any remaining processes
pkill -f "python.*backend.app" 2>/dev/null
pkill -f "vite" 2>/dev/null

echo -e "\n${YELLOW}✓ Servers stopped${NC}"

