# Quick Start Guide - Local Orchestrator Version

Get Sehat Nabha running with local Python backend in 5 minutes!

## Prerequisites
- Python 3.8+ installed
- Node.js installed
- No API keys required! ✅

## Setup (5 Steps)

### 1. Install Python Packages
```powershell
pip install flask flask-cors sentence-transformers faiss-cpu pandas PyYAML google-generativeai
```

### 2. Install Node Dependencies
```powershell
npm install
```

### 3. Start Flask Server (Terminal 1)
```powershell
python api_server.py
```
Keep this running! You'll see: `Running on http://0.0.0.0:5000`

### 4. Start React Server (Terminal 2)
```powershell
npm run dev
```
Keep this running! You'll see: `Local: http://localhost:3000/`

### 5. Open Browser
Go to **http://localhost:3000** and click "AI Health Assistant"!

## That's It! 🎉

**Type symptoms** → **System analyzes** → **Get diagnoses!**

For detailed instructions, see [LOCAL_ORCHESTRATOR.md](LOCAL_ORCHESTRATOR.md)

For understanding what this app is, see [WHAT_IS_THIS.md](WHAT_IS_THIS.md)

