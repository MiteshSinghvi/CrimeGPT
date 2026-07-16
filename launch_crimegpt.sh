#!/bin/bash

# ASCII Art Banner
echo "==================================================="
echo "   ____      _                   ____ ____ _____ "
echo "  / ___|____(_)_ __ ___   ___   / ___|  _ \_   _|"
echo " | |   | '__| | '_ \ _ \ / _ \ | |  _| |_) || |  "
echo " | |___| |  | | | | | | |  __/ | |_| |  __/ | |  "
echo "  \____|_|  |_|_| |_| |_|\___|  \____|_|    |_|  "
echo "                                                 "
echo "==================================================="
echo "Booting CrimeGPT Local AI Copilot Environment..."
echo "==================================================="

echo "[1/3] Activating Python Virtual Environment and Starting AI Backend..."
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 &

echo "[2/3] Waiting for AI Backend Health Check to clear..."
sleep 2

echo "[3/3] Starting React Frontend Client..."
cd frontend
# Optionally open the browser automatically if on macOS/Linux
if which xdg-open > /dev/null; then
  xdg-open http://localhost:5173 &
elif which open > /dev/null; then
  open http://localhost:5173 &
fi
npm run dev
