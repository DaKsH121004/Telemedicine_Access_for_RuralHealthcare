# Running Sehat Nabha with Local Orchestrator

## Quick Start

### Step 1: Install Python Dependencies
Run this in PowerShell:
```powershell
pip install flask flask-cors sentence-transformers faiss-cpu pandas PyYAML google-generativeai
```

Wait for installation to complete.

### Step 2: Start the Flask API Server
Open a NEW PowerShell terminal and run:
```powershell
cd "c:\Users\kavay\OneDrive\Desktop\APP 2\sehat-nabha-–-rural-telemedicine-access"
python api_server.py
```

You should see:
```
Starting Sehat Nabha API Server...
API will be available at http://localhost:5000
 * Running on http://0.0.0.0:5000
```

**Keep this terminal open!**

### Step 3: Start the React Development Server
Open ANOTHER NEW PowerShell terminal and run:
```powershell
cd "c:\Users\kavay\OneDrive\Desktop\APP 2\sehat-nabha-–-rural-telemedicine-access"
npm run dev
```

You should see:
```
  VITE v6.2.0  ready in 500 ms
  ➜  Local:   http://localhost:3000/
```

### Step 4: Open the Application
Open your browser and go to: **http://localhost:3000**

## How to Use

1. Click on "AI Health Assistant" from the dashboard
2. Type your symptoms (e.g., "I have a fever, cough, and shortness of breath")
3. Click send or press Enter
4. The local orchestrator will analyze your symptoms and provide:
   - Extracted symptoms
   - Triage level (if emergency)
   - Potential diagnoses
   - Precautions

## Troubleshooting

**Error: "API server is not running"**
- Make sure the Flask server (Step 2) is still running on port 5000
- Check the Flask terminal for errors

**Error: "Cannot find module"**
- Run `pip install flask flask-cors sentence-transformers faiss-cpu pandas PyYAML`

**Application won't load**
- Make sure both terminals are running (Flask on port 5000, React on port 3000)
- Check that no other application is using these ports

## Architecture

```
Browser (Port 3000)
        ↓
    React App
        ↓
   Fetch API
        ↓
Flask Server (Port 5000)
        ↓
orchestrator.py (analyze function)
        ↓
src/ modules:
  - NLP: Symptom extraction
  - RAG: Retrieval-Augmented Generation
  - Rules: Triage engine
  - Knowledge: Precautions lookup
        ↓
CSV Data Files in /data/
```

## Files Modified

- `App.tsx` - Updated to use local Flask API instead of Google Gemini
- `api_server.py` - NEW Flask server wrapping orchestrator
- `orchestrator.py` - Updated paths to use relative paths
