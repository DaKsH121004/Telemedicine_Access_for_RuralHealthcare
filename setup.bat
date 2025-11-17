@echo off
REM Sehat Nabha - Quick Start Script

echo.
echo ================================
echo Sehat Nabha - Quick Start
echo ================================
echo.

REM Navigate to project directory
cd /d "c:\Users\kavay\OneDrive\Desktop\APP 2\sehat-nabha-–-rural-telemedicine-access"

echo Step 1: Installing Python packages...
echo This may take 2-5 minutes...
echo.

python -m pip install flask flask-cors sentence-transformers faiss-cpu pandas PyYAML google-generativeai

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install Python packages
    echo Please ensure Python is installed correctly
    pause
    exit /b 1
)

echo.
echo Step 2: Checking npm dependencies...
if exist node_modules (
    echo npm dependencies already installed
) else (
    echo Installing npm dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: Failed to install npm dependencies
        pause
        exit /b 1
    )
)

echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo IMPORTANT: Open TWO NEW Command Prompt windows
echo.
echo Terminal 1: Run this command
echo cd "c:\Users\kavay\OneDrive\Desktop\APP 2\sehat-nabha-–-rural-telemedicine-access"
echo python api_server.py
echo (Keep this running - Flask API server on port 5000)
echo.
echo Terminal 2: Run this command
echo cd "c:\Users\kavay\OneDrive\Desktop\APP 2\sehat-nabha-–-rural-telemedicine-access"
echo npm run dev
echo (Keep this running - React dev server on port 3000)
echo.
echo Then open browser to: http://localhost:3000
echo.
pause
