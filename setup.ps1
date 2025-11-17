#!/usr/bin/env powershell
# Sehat Nabha - Local Orchestrator Setup Script

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Sehat Nabha - Local Orchestrator" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Get the project directory
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectDir

Write-Host "Project Directory: $ProjectDir" -ForegroundColor Green
Write-Host ""

# Step 1: Check Python
Write-Host "Step 1: Checking Python installation..." -ForegroundColor Yellow
$pythonPath = "C:/Users/kavay/AppData/Local/Programs/Python/Python312/python.exe"
if (Test-Path $pythonPath) {
    Write-Host "✓ Python found at $pythonPath" -ForegroundColor Green
} else {
    Write-Host "✗ Python not found!" -ForegroundColor Red
    Write-Host "Please install Python from https://python.org" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Install Python packages
Write-Host "Step 2: Installing Python dependencies..." -ForegroundColor Yellow
Write-Host "This may take 2-5 minutes..." -ForegroundColor Cyan
$packages = @(
    "flask",
    "flask-cors", 
    "sentence-transformers",
    "faiss-cpu",
    "pandas",
    "PyYAML",
    "google-generativeai"
)

foreach ($package in $packages) {
    Write-Host "Installing $package..." -ForegroundColor Gray
    & $pythonPath -m pip install $package -q
    if ($?) {
        Write-Host "✓ $package installed" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install $package" -ForegroundColor Red
    }
}
Write-Host ""

# Step 3: Check Node.js
Write-Host "Step 3: Checking Node.js installation..." -ForegroundColor Yellow
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Write-Host "✓ npm $npmVersion found" -ForegroundColor Green
} else {
    Write-Host "✗ npm not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Check node_modules
Write-Host "Step 4: Checking npm dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✓ npm dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "Installing npm dependencies..." -ForegroundColor Cyan
    npm install
    if ($?) {
        Write-Host "✓ npm dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install npm dependencies" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# Step 5: Summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open TWO NEW PowerShell terminals" -ForegroundColor Cyan
Write-Host ""

Write-Host "In Terminal 1, run:" -ForegroundColor Cyan
Write-Host '   cd "c:\Users\kavay\OneDrive\Desktop\APP 2\sehat-nabha-–-rural-telemedicine-access"' -ForegroundColor White
Write-Host "   python api_server.py" -ForegroundColor White
Write-Host "   Keep this running!" -ForegroundColor Green
Write-Host ""

Write-Host "In Terminal 2, run:" -ForegroundColor Cyan
Write-Host '   cd "c:\Users\kavay\OneDrive\Desktop\APP 2\sehat-nabha-–-rural-telemedicine-access"' -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "   Keep this running!" -ForegroundColor Green
Write-Host ""

Write-Host "2. Open browser and go to:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""

Write-Host "3. Click 'AI Health Assistant' and test with symptoms!" -ForegroundColor Green
Write-Host ""
