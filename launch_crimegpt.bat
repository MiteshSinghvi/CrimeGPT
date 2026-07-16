@echo off
color 0b
echo ===================================================
echo    ____      _                   ____ ____ _____ 
echo   / ___|____(_)_ __ ___   ___   / ___|  _ \_   _|
echo  | |   | '__| | '_ ` _ \ / _ \ | |  _| |_) || |  
echo  | |___| |  | | | | | | |  __/ | |_| |  __/ | |  
echo   \____|_|  |_|_| |_| |_|\___|  \____|_|    |_|  
echo.                                                  
echo ===================================================
echo Booting CrimeGPT Local AI Copilot Environment...
echo ===================================================

echo [1/3] Activating Python Virtual Environment and Starting AI Backend...
start /B cmd /c "venv\Scripts\activate.bat && uvicorn app.main:app --reload --port 8000"

echo [2/3] Waiting for AI Backend Health Check to clear...
timeout /t 2 /nobreak > NUL

echo [3/3] Starting React Frontend Client...
cd frontend
start http://localhost:5173
npm run dev
