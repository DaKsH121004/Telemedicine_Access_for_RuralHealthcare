# Running Sehat Nabha with Local Orchestrator Backend

This document explains how to run the application with the local Python orchestrator instead of Google Gemini API.

## Architecture

The application now uses:
- **Frontend**: React (TypeScript) running on `http://localhost:3000`
- **Backend**: Flask API server running on `http://localhost:5000`
- **Orchestrator**: Python-based local medical analysis engine using:
  - FAISS for semantic search
  - Sentence Transformers for embeddings
  - Local knowledge base (CSV files)
  - Triage rules (YAML)

## Prerequisites

1. **Python 3.8+** - Required for the Flask backend
2. **Node.js 18+** - Already required for React development
3. **pip** - Python package manager

## Setup & Running

### Step 1: Install Python Dependencies

```bash
# Navigate to the project directory
cd "C:\Users\kavay\OneDrive\Desktop\APP 2\sehat-nabha-–-rural-telemedicine-access"

# Install Python packages (may take 5-10 minutes due to large dependencies)
pip install -r requirements.txt
```

**Note**: If you get errors installing FAISS, try the CPU-only version (already in requirements.txt). If issues persist, see Troubleshooting.

### Step 2: Install Node.js Dependencies

```bash
# In the same project directory
npm install
```

### Step 3: Run Both Servers

You need to run **two terminal windows/processes**:

#### Terminal 1 - Flask Backend API Server

```bash
cd "C:\Users\kavay\OneDrive\Desktop\APP 2\sehat-nabha-–-rural-telemedicine-access"
python api_server.py
```

You should see:
```
Starting Sehat Nabha API Server...
API will be available at http://localhost:5000
CORS enabled for http://localhost:3000 (Vite dev server)
 * Running on http://0.0.0.0:5000
```

#### Terminal 2 - React Dev Server

```bash
cd "C:\Users\kavay\OneDrive\Desktop\APP 2\sehat-nabha-–-rural-telemedicine-access"
npm run dev
```

You should see:
```
VITE v6.2.0  ready in 500 ms
➜  Local:   http://localhost:3000/
➜  Network: http://192.168.1.100:3000/
```

### Step 4: Open in Browser

Navigate to **http://localhost:3000** in your web browser.

## Using the Application

### Chatbot Feature

1. Click on "AI Health Assistant" from the dashboard
2. Type your symptoms in the text box (e.g., "I have fever, cough, and shortness of breath for 3 days")
3. Press Enter or click the send button
4. The backend will:
   - Extract symptoms using NLP
   - Run triage rules to check for emergencies
   - Use RAG (Retrieval Augmented Generation) to find similar cases
   - Return potential diagnoses with triage level

### Example Input

```
45-year-old male with persistent cough, fever (38.5°C), and mild shortness of breath for 3 days.
No known allergies or chronic conditions.
```

### Expected Output

```
Analysis Results:

📋 Extracted Symptoms:
  • cough
  • fever
  • shortness_of_breath

⚠️ Triage Level: Urgent
Reason: Respiratory symptoms with fever

🏥 Potential Diagnoses:
  • Pneumonia
  • Bronchitis
  • COVID-19
  • Influenza
```

## File Structure

```
project/
├── api_server.py              # Flask API wrapper around orchestrator
├── orchestrator.py             # Main medical analysis engine
├── requirements.txt            # Python dependencies
│
├── App.tsx                     # React frontend (updated for local API)
├── src/                        # Python source modules
│   ├── ingest/                # Knowledge base ingestion
│   ├── nlp/                   # NLP/symptom extraction
│   ├── llm/                   # LLM/RAG components
│   ├── knowledge/             # Precaution loader
│   └── rules/                 # Triage rules engine
│
└── data/                       # Medical knowledge bases
    ├── DiseaseAndSymptoms.csv
    ├── disease_knowledgebase.csv
    └── Disease precaution.csv
```

## API Endpoints

### POST /api/chat
Main endpoint for chatbot interaction.

**Request:**
```json
{
  "message": "symptoms description",
  "age": 30,
  "sex": "M"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "diagnoses": [...],
    "triage": { "level": "Urgent", "reason": "..." },
    "symptoms_extracted": [...],
    "mapped_precautions": {...}
  }
}
```

### GET /api/health
Health check endpoint to verify the API is running.

### GET /api/symptoms
Get the list of all recognized symptoms.

## Troubleshooting

### "pip is not recognized"
- Python is not installed or not in PATH
- Solution: Install Python from https://www.python.org/
- Make sure to check "Add Python to PATH" during installation

### ModuleNotFoundError: No module named 'flask'
```bash
pip install -r requirements.txt
```

### FAISS installation fails
If `faiss-cpu` fails:
```bash
pip install --no-binary faiss-cpu faiss-cpu
```

Or install pre-built wheels:
```bash
pip install faiss-cpu==1.7.4
```

### "Port 5000 is already in use"
- Another application is using port 5000
- Kill the process: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
- Or change the port in `api_server.py` line near `app.run(port=5000)`

### "Port 3000 is already in use"
- Similar to above
- Or modify `vite.config.ts` to use a different port

### "API server is not responding"
- Ensure `python api_server.py` is running in a terminal
- Check that both servers are on correct ports (3000 and 5000)
- Check browser console for CORS errors (should show API calls to http://localhost:5000)

### Knowledge base files not found
- Ensure `/data/` folder contains:
  - `DiseaseAndSymptoms.csv`
  - `disease_knowledgebase.csv`
  - `Disease precaution.csv`
- Check paths in `orchestrator.py` match your setup

## Features Disabled

- **Voice Input**: Not supported in local version (would require separate speech-to-text service)
- **Find Care**: Requires Google Maps API (disabled for local version)
- **Analyze Report**: Requires Gemini Vision API (disabled for local version)
- **TTS (Text-to-Speech)**: Requires external TTS service (disabled for local version)

The **Chatbot** and **Symptom Analyzer** features work with the local orchestrator.

## Next Steps

To enhance the local version:

1. **Add Voice Support**: Integrate with Vosk or another open-source STT
2. **Add Report Analysis**: Use an open-source vision model (e.g., LLaVA)
3. **Improve Diagnoses**: Add more medical data to the knowledge base
4. **Add Database**: Store conversation history in SQLite/PostgreSQL
5. **Deploy**: Package as Docker container for production

## Support

For issues related to:
- **Orchestrator Logic**: Check `src/` module documentation
- **API Endpoints**: See `api_server.py`
- **React Frontend**: Check `App.tsx` and `components/`
- **Knowledge Base**: Update CSV files in `data/`

---

**Note**: This is a diagnostic aid tool and not a substitute for professional medical advice. Always consult qualified healthcare providers.
