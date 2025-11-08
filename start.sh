#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Hummingbird Application...${NC}\n"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Virtual environment not found. Creating one...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${BLUE}Activating virtual environment...${NC}"
source venv/bin/activate

# Install Python dependencies
echo -e "${BLUE}Installing Python dependencies...${NC}"
pip install -q -r requirements.txt

# Install Node dependencies for frontend
echo -e "${BLUE}Installing Node dependencies...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    npm install --silent
fi
cd ..

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found. Using defaults.${NC}"
fi

# Start backend server in background
echo -e "${GREEN}Starting backend server on port 5001...${NC}"
cd backend
source ../venv/bin/activate
python app.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend server in background
echo -e "${GREEN}Starting frontend server on port 3000...${NC}"
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Save PIDs to file for easy cleanup
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

echo -e "\n${GREEN}✓ Servers started successfully!${NC}"
echo -e "${BLUE}Backend:${NC} http://localhost:5001 (PID: $BACKEND_PID)"
echo -e "${BLUE}Frontend:${NC} http://localhost:3000 (PID: $FRONTEND_PID)"
echo -e "\n${YELLOW}Logs:${NC}"
echo -e "  Backend:  tail -f backend.log"
echo -e "  Frontend: tail -f frontend.log"
echo -e "\n${YELLOW}To stop servers:${NC} ./stop.sh or kill the PIDs"

