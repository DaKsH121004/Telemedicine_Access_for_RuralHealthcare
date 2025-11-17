# 🚀 Sehat Nabha - Local Orchestrator Setup Guide

## Overview

You've successfully converted the Sehat Nabha application to use a **local Python orchestrator backend** instead of Google Gemini AI. This allows you to run the entire chatbot with symptom analysis completely offline!

## What Changed

| Component | Before | After |
|-----------|--------|-------|
| **Chatbot** | Google Gemini API | Local Orchestrator (Python) |
| **Architecture** | Single service (Gemini) | Two services (Flask + React) |
| **Dependencies** | Google API key required | Local Python ML models |
| **Cost** | Google Gemini API costs | Free (local ML models) |

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Web Browser                              │
│              http://localhost:3000                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    Fetch API (HTTP)
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│              React Application (Port 3000)                  │
│                      (App.tsx)                              │
│  - Dashboard                                               │
│  - AI Health Assistant (Chatbot)                          │
│  - Symptom Analyzer                                       │
│  - Find Care                                              │
│  - Analyze Report                                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    REST API Calls
                   (localhost:5000/api)
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│            Flask API Server (Port 5000)                     │
│                  (api_server.py)                            │
│  POST /api/chat     → Analyze symptoms                      │
│  GET /api/health    → Health check                          │
│  GET /api/symptoms  → List all symptoms                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                  Python Function Calls
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│              Orchestrator Module                             │
│              (orchestrator.py)                              │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │ 1. NLP: Symptom Extraction                       │      │
│  │    (src/nlp/symptom_extractor.py)               │      │
│  └──────────────────────────────────────────────────┘      │
│  ┌──────────────────────────────────────────────────┐      │
│  │ 2. Rules: Triage Engine                          │      │
│  │    (src/rules/triage_engine.py)                 │      │
│  └──────────────────────────────────────────────────┘      │
│  ┌──────────────────────────────────────────────────┐      │
│  │ 3. RAG: Retrieval-Augmented Generation           │      │
│  │    (src/llm/rag_runner.py)                      │      │
│  │    Uses FAISS index for fast retrieval           │      │
│  └──────────────────────────────────────────────────┘      │
│  ┌──────────────────────────────────────────────────┐      │
│  │ 4. Knowledge: Precautions Lookup                 │      │
│  │    (src/knowledge/precaution_loader.py)         │      │
│  └──────────────────────────────────────────────────┘      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    CSV Data Files
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    Data Directory                            │
│                     (/data/)                                │
│                                                             │
│  - DiseaseAndSymptoms.csv                                 │
│  - disease_knowledgebase.csv                              │
│  - Disease precaution.csv                                 │
│                                                             │
│  FAISS Index (built once):                                │
│  - kb_faiss.index                                         │
│  - kb_texts.pkl                                           │
└──────────────────────────────────────────────────────────────┘
```

## Installation & Setup

### Prerequisites

- **Python 3.8+** (tested with Python 3.12)
- **Node.js 16+** (for React/Vite)
- **npm** (comes with Node.js)

### Step 1: Install Dependencies

#### Option A: Automated Script (Recommended)

**Windows Command Prompt or PowerShell:**
```bash
cd "c:\Users\kavay\OneDrive\Desktop\APP 2\sehat-nabha-–-rural-telemedicine-access"
setup.bat
```

#### Option B: Manual Installation

**Step 1.1: Install Python packages**
```bash
pip install flask flask-cors sentence-transformers faiss-cpu pandas PyYAML google-generativeai
```

**Step 1.2: Verify npm dependencies**
```bash
cd "c:\Users\kavay\OneDrive\Desktop\APP 2\sehat-nabha-–-rural-telemedicine-access"
npm install
```

### Step 2: Start the Services

You need to run **TWO services** simultaneously. Open **TWO separate terminals**.

#### Terminal 1: Flask API Server

```bash
cd "c:\Users\kavay\OneDrive\Desktop\APP 2\sehat-nabha-–-rural-telemedicine-access"
python api_server.py
```

Expected output:
```
Starting Sehat Nabha API Server...
API will be available at http://localhost:5000
CORS enabled for http://localhost:3000 (Vite dev server)
 * Serving Flask app 'api_server'
 * Debug mode: on
 * Running on http://0.0.0.0:5000
```

**⚠️ Keep this terminal open!**

#### Terminal 2: React Development Server

```bash
cd "c:\Users\kavay\OneDrive\Desktop\APP 2\sehat-nabha-–-rural-telemedicine-access"
npm run dev
```

Expected output:
```
  VITE v6.2.0  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.100:3000/
  ➜  press h + enter to show help
```

**⚠️ Keep this terminal open!**

### Step 3: Access the Application

Open your web browser and go to:
```
http://localhost:3000
```

## Using the Chatbot

### How to Submit Symptoms

1. Click **"AI Health Assistant"** from the dashboard
2. Type your symptoms in natural language:
   - ✅ "I have a fever, cough, and headache"
   - ✅ "45-year-old male with chest pain and shortness of breath"
   - ✅ "Persistent cough for 2 weeks, low-grade fever"

3. Press **Enter** or click the **Send button**

### Understanding the Response

The system returns:

**1. Extracted Symptoms** 📋
- List of symptoms identified from your input
- Example: `fever`, `cough`, `headache`

**2. Triage Level** ⚠️ (if applicable)
- **Emergency**: Immediate medical attention needed
- **Urgent**: Should see doctor within hours
- **Standard**: Routine consultation recommended

**3. Potential Diagnoses** 🏥
- List of likely diseases based on symptom matching
- Ranked by probability

**4. Precautions** 📋
- Recommended actions for the top diagnosis
- Self-care advice

### Example Interaction

**User Input:**
```
I've had a persistent cough for 2 weeks, along with low-grade fever and fatigue.
I'm a 35-year-old smoker.
```

**System Response:**
```
Analysis Results:

📋 Extracted Symptoms:
  • Persistent cough
  • Low-grade fever
  • Fatigue
  • Smoking history

🏥 Potential Diagnoses:
  • Bronchitis
  • Pneumonia
  • Tuberculosis
  • Chronic Obstructive Pulmonary Disease (COPD)

📋 Precautions:
  • Schedule appointment with pulmonologist
  • Get chest X-ray
  • Avoid smoke exposure
  • Stay hydrated
```

## File Structure

```
sehat-nabha-–-rural-telemedicine-access/
│
├── Frontend (React/TypeScript)
│   ├── App.tsx                    [MODIFIED] Uses Flask API instead of Gemini
│   ├── App_local.tsx              [NEW] Version with local API
│   ├── App_backup.tsx             [BACKUP] Original Gemini version
│   ├── components/
│   │   ├── ChatbotView.tsx
│   │   ├── FeatureCard.tsx
│   │   ├── LanguageSelector.tsx
│   │   └── Loader.tsx
│   ├── constants.tsx
│   ├── types.ts
│   ├── index.tsx
│   ├── index.html
│   ├── index.css
│   └── vite.config.ts
│
├── Backend (Python/Flask)
│   ├── api_server.py              [NEW] Flask API server
│   ├── orchestrator.py            [MODIFIED] Updated paths, unchanged logic
│   │
│   └── src/
│       ├── nlp/
│       │   └── symptom_extractor.py
│       ├── rules/
│       │   └── triage_engine.py
│       ├── llm/
│       │   └── rag_runner.py
│       ├── knowledge/
│       │   └── precaution_loader.py
│       └── ingest/
│           └── ingest_kb.py
│
├── Data
│   ├── DiseaseAndSymptoms.csv
│   ├── disease_knowledgebase.csv
│   └── Disease precaution.csv
│
├── Configuration & Setup
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── setup.ps1                  [NEW] PowerShell setup script
│   ├── setup.bat                  [NEW] Batch setup script
│   ├── START_SERVERS.md           [NEW] Server startup guide
│   └── LOCAL_ORCHESTRATOR.md      [THIS FILE]
│
└── Documentation
    ├── README.md
    ├── SETUP.md
    ├── PROJECT_SUMMARY.md
    └── WHAT_IS_THIS.md
```

## Troubleshooting

### Error: "Cannot connect to http://localhost:5000"

**Solution:**
1. Check Flask terminal - is it running?
2. Verify Flask server shows: `Running on http://0.0.0.0:5000`
3. Restart Flask server if needed
4. Wait 2-3 seconds after starting Flask before opening browser

### Error: "Module not found: sentence_transformers"

**Solution:**
```bash
pip install sentence-transformers
```

### Error: "FAISS index not found"

**Solution:**
1. FAISS index is built automatically on first run
2. Takes 1-2 minutes to build
3. Check Flask terminal for: `Building FAISS index...`
4. Index files created: `kb_faiss.index` and `kb_texts.pkl`

### React app loads but chatbot returns errors

**Solution:**
1. Open browser Developer Console (F12)
2. Check Network tab → see if `/api/chat` request succeeds
3. Check if Flask server logs show the request
4. Verify Flask is running on port 5000

### Port Already in Use

**If port 5000 is in use:**
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**If port 3000 is in use:**
```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Performance Notes

- **First run**: Takes 1-2 minutes to build FAISS index
- **Symptom analysis**: Typically 1-3 seconds per query
- **GPU acceleration**: Can be enabled with `faiss-gpu` instead of `faiss-cpu`

## Next Steps

1. **Test thoroughly** with various symptom combinations
2. **Integrate real disease database** if needed
3. **Add more symptoms** to CSV files for better matching
4. **Customize disclaimers** in `constants.tsx` for your use case
5. **Deploy** to production (see README.md for deployment instructions)

## Support & Development

- Python Backend: See `orchestrator.py` and `src/` modules
- React Frontend: See `App.tsx` and `components/`
- API Endpoints: See `api_server.py`
- Type Definitions: See `types.ts`

---

**Status**: ✅ Local orchestrator integration complete!

**Last Updated**: November 2025
