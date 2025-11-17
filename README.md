<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Sehat Nabha – Rural Telemedicine Access

A comprehensive telemedicine application designed to provide healthcare access to rural communities. This React-based web application leverages Google's Gemini AI to offer multiple healthcare services including live consultations, AI chatbot assistance, medical report analysis, symptom analysis, and location-based care finding.

## Features

- **AI Health Assistant (Voice & Text)**: Converse with an AI health assistant using voice or text in multiple languages
- **Symptom Analyzer**: AI-powered diagnostic suggestions for medical professionals
- **Medical Report Analysis**: Upload and analyze medical reports/images using AI
- **Find Care**: Location-based search for nearby hospitals, clinics, and pharmacies using Google Maps
- **Multilingual Support**: Available in English, Hindi (हिन्दी), and Punjabi (ਪੰਜਾਬੀ)

## Prerequisites

Before you begin, ensure you have the following installed:

### 1. Install Node.js (REQUIRED) ⚠️

**⚠️ IMPORTANT: You MUST install Node.js first before proceeding!**

**Getting "node is not recognized" or "npm is not recognized" error?**
→ **Node.js is not installed yet. Follow the steps below:**

#### Quick Installation Steps:

1. **📥 Download Node.js:**
   - Open your browser and go to: **https://nodejs.org/**
   - Click the **green "LTS" button** (Long Term Support version)
   - This downloads a file like `node-v20.x.x-x64.msi`

2. **💿 Install Node.js:**
   - Go to your Downloads folder
   - Double-click the downloaded `.msi` file
   - Click "Next" → Accept license → "Next"
   - **✅ IMPORTANT:** Make sure "Automatically install the necessary tools" is CHECKED
   - Click "Install" (enter password if prompted)
   - Wait 1-2 minutes for installation
   - Click "Finish"

3. **🔄 RESTART TERMINAL (CRITICAL!):**
   - **Close ALL terminal/PowerShell windows**
   - Open a **NEW** terminal/PowerShell window
   - This is required for PATH to update!

4. **✅ Verify Installation:**
   In your NEW terminal, run:
   ```bash
   node --version
   npm --version
   ```
   Both should show version numbers (like `v20.11.0` and `10.2.4`)
   
   **✅ If you see versions → Node.js is installed! Continue to Step 2 below.**
   
   **❌ If still "not recognized" → See [INSTALL_NODEJS.md](INSTALL_NODEJS.md) for detailed troubleshooting**

**📖 Need detailed step-by-step guide?** See [INSTALL_NODEJS.md](INSTALL_NODEJS.md) for complete instructions with screenshots.

### 2. Get Google Gemini API Key

- 🔑 [Get API Key from Google AI Studio](https://makersuite.google.com/app/apikey)
- 📝 Sign in with your Google account
- ➕ Click "Create API Key" or "Get API Key"
- 📋 Copy the generated API key (starts with `AIzaSy...`)

### Where to Run Commands

All commands in this guide should be run in a **Terminal** or **Command Prompt**:

**Windows:**
- **Option 1**: Press `Win + R`, type `cmd`, press Enter (Command Prompt)
- **Option 2**: Press `Win + X`, select "Windows PowerShell" or "Terminal"
- **Option 3**: Right-click in the project folder → "Open in Terminal" or "Open PowerShell window here"

**Mac:**
- Press `Cmd + Space`, type "Terminal", press Enter
- Or go to Applications → Utilities → Terminal

**Linux:**
- Press `Ctrl + Alt + T` (most distributions)
- Or search for "Terminal" in applications

**💡 Tip**: Navigate to the project folder first:
```bash
cd "C:\Users\kavay\OneDrive\Desktop\APP 2\sehat-nabha-–-rural-telemedicine-access"
```
(Replace with your actual project path)

## Installation & Setup

> **📍 Where to run commands**: Open Terminal/Command Prompt (see Prerequisites section above) and navigate to the project folder.

### Step 1: Navigate to the Project Directory

Open your terminal/command prompt and navigate to the project folder:

**Windows:**
```bash
cd "C:\Users\kavay\OneDrive\Desktop\APP 2\sehat-nabha-–-rural-telemedicine-access"
```

**Mac/Linux:**
```bash
cd /path/to/sehat-nabha-–-rural-telemedicine-access
```

**💡 Quick way**: 
- **Windows**: Right-click in the project folder → "Open in Terminal" or "Open PowerShell window here"
- **Mac**: Right-click folder → "Services" → "New Terminal at Folder"

### Step 2: Install Dependencies

In your terminal/command prompt (make sure you're in the project folder), run:

```bash
npm install
```

**What this does:**
- Downloads and installs all required packages (React, TypeScript, Vite, etc.)
- Creates a `node_modules` folder
- Takes 1-3 minutes depending on your internet speed

**Expected output:**
```
added 150 packages, and audited 151 packages in 2m
```

This will install:
- React 19.2.0
- TypeScript
- Vite (build tool)
- @google/genai (Google Gemini AI SDK)
- Tailwind CSS (via CDN)

### Step 3: Configure API Key

**Option A: Create file using Terminal/Command Prompt**

In your terminal/command prompt (in the project folder), run:

**Windows (PowerShell):**
```powershell
New-Item -Path .env.local -ItemType File
```

**Windows (Command Prompt) or Mac/Linux:**
```bash
touch .env.local
```

**Option B: Create file manually**
1. In your project folder, create a new file
2. Name it exactly: `.env.local` (with the dot at the beginning)
3. Make sure it's in the same folder as `package.json`

**Add your API key:**
1. Open `.env.local` in any text editor (Notepad, VS Code, etc.)
2. Add this line (replace with your actual API key from [Google AI Studio](https://makersuite.google.com/app/apikey)):
```
GEMINI_API_KEY=your_api_key_here
```

**Example:**
```
GEMINI_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
```

**⚠️ Important:**
- No quotes around the API key
- No spaces around the `=` sign
- Save the file after adding the key
- Replace `your_api_key_here` with your actual Gemini API key
- Never commit `.env.local` to version control (it should be in `.gitignore`)
- Keep your API key secure and private

### Step 4: Run the Development Server

In your terminal/command prompt (in the project folder), run:
```bash
npm run dev
```

**Expected output:**
```
  VITE v6.2.0  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.100:3000/
  ➜  press h + enter to show help
```

**Open the app:**
1. Open your web browser (Chrome, Firefox, Edge, Safari)
2. Navigate to: **http://localhost:3000**
3. You should see the Sehat Nabha dashboard! 🎉

**To stop the server:**
- Press `Ctrl + C` in the terminal/command prompt

**Note:** Keep the terminal/command prompt open while using the app. Closing it will stop the server.

## How to Use the App

### Dashboard
When you first open the app, you'll see the main dashboard with four feature cards:
1. **AI Health Assistant (Voice & Text)** - Conversational health support
2. **Symptom Analyzer** - Diagnostic suggestions
3. **Find Care** - Location-based search
4. **Analyze Report** - Medical report analysis

### 1. AI Health Assistant (Voice & Text)

**Voice mode:**
1. Click on "AI Health Assistant" from the dashboard
2. Press the microphone button to start a voice session
3. Grant microphone permissions when prompted
4. Speak naturally; the AI transcribes your question and responds with synthesized audio
5. Press the red stop button to end the voice session

**Text mode:**
1. Type your health-related question in the input field
2. Press Enter or click the send button
3. Click the volume icon on any response to hear it via text-to-speech

**Features:**
- Multilingual support (change language using the dropdown in header)
- Real-time transcription and AI-generated speech playback
- Seamless switching between voice and text in a single view

### 2. Symptom Analyzer

**How to use:**
1. Click on "Symptom Analyzer" from the dashboard
2. Enter patient symptoms in detail (e.g., "45-year-old male with persistent cough, fever, and shortness of breath for 3 days")
3. Click "Analyze Symptoms"
4. Review the potential diagnoses with likelihood ratings (High/Medium/Low)

**Note:** This feature is designed for medical professionals and provides diagnostic suggestions only. It is not a substitute for professional medical judgment.

### 3. Find Care

**How to use:**
1. Click on "Find Care" from the dashboard
2. Allow location access when prompted
3. Enter a search query (e.g., "nearby hospitals", "pharmacies", "cardiology clinics")
4. Click the search button
5. Review the AI-generated response and click on relevant place links to open in Google Maps

**Features:**
- Uses your current location for nearby searches
- Integrates with Google Maps for directions
- Provides detailed information about healthcare facilities

### 4. Analyze Report

**How to use:**
1. Click on "Analyze Report" from the dashboard
2. Click the upload area or drag and drop a medical report image
3. Supported formats: JPG, PNG, PDF (as image)
4. Click "Analyze" button
5. Review the AI-generated analysis of your medical report

**Features:**
- Image-based medical report analysis
- Simple explanations of medical values
- Key findings summary

### 3. Symptom Analyzer

**How to use:**
1. Click on "Symptom Analyzer" from the dashboard
2. Enter patient symptoms in detail (e.g., "45-year-old male with persistent cough, fever, and shortness of breath for 3 days")
3. Click "Analyze Symptoms"
4. Review the potential diagnoses with likelihood ratings (High/Medium/Low)

**Note:** This feature is designed for medical professionals and provides diagnostic suggestions only. It is not a substitute for professional medical judgment.

### 4. Find Care

**How to use:**
1. Click on "Find Care" from the dashboard
2. Allow location access when prompted
3. Enter a search query (e.g., "nearby hospitals", "pharmacies", "cardiology clinics")
4. Click the search button
5. Review the AI-generated response and click on relevant place links to open in Google Maps

**Features:**
- Uses your current location for nearby searches
- Integrates with Google Maps for directions
- Provides detailed information about healthcare facilities

### 5. Analyze Report

**How to use:**
1. Click on "Analyze Report" from the dashboard
2. Click the upload area or drag and drop a medical report image
3. Supported formats: JPG, PNG, PDF (as image)
4. Click "Analyze" button
5. Review the AI-generated analysis of your medical report

**Features:**
- Image-based medical report analysis
- Simple explanations of medical values
- Key findings summary

### Language Selection

Click the language dropdown in the top-right corner to switch between:
- English
- हिन्दी (Hindi)
- ਪੰਜਾਬੀ (Punjabi)

All interface text and AI responses will change to the selected language.

## Building for Production

To create a production build:

```bash
npm run build
```

The optimized files will be in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
sehat-nabha-–-rural-telemedicine-access/
├── App.tsx                 # Main application component
├── index.tsx               # Application entry point
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
├── constants.tsx           # App constants, texts, and icons
├── types.ts                # TypeScript type definitions
├── components/             # React components
│   ├── FeatureCard.tsx
│   ├── LanguageSelector.tsx
│   └── Loader.tsx
└── .env.local              # Environment variables (create this)
```

## Troubleshooting

### Node.js/npm Not Recognized

**Error:** `'npm' is not recognized` or `'node' is not recognized`

**This means Node.js is not installed or not in your PATH.**

**Solution:**
1. **Install Node.js:**
   - Download from: https://nodejs.org/
   - Choose the LTS version
   - Run the installer and follow the setup wizard
   - ✅ Make sure to check "Add to PATH" during installation

2. **Restart Terminal:**
   - Close ALL terminal/command prompt windows
   - Open a NEW terminal window
   - This is required for PATH changes to take effect

3. **Verify Installation:**
   ```bash
   node --version
   npm --version
   ```
   Both commands should show version numbers (not errors)

4. **If still not working:**
   - Restart your computer
   - Reinstall Node.js and make sure to check "Add to PATH"
   - Check if Node.js is installed: Go to Control Panel → Programs → Look for "Node.js"

### API Key Issues
- **Error: "API key not found"**
  - Ensure `.env.local` exists in the root directory
  - Verify the file contains `GEMINI_API_KEY=your_key_here` (no quotes, no spaces around `=`)
  - Restart the development server after creating/modifying `.env.local`

### Microphone Permissions
- **Voice mode in AI Health Assistant not working**
  - Ensure you've granted microphone permissions in your browser
  - Check browser settings if permissions were denied
  - Use HTTPS or localhost (some browsers require secure contexts for microphone access)

### Location Services
- **Find Care feature not working**
  - Allow location access when prompted
  - Check browser location permissions
  - Ensure you're using HTTPS or localhost

### Port Already in Use
- **Error: "Port 3000 is already in use"**
  - Change the port in `vite.config.ts` (modify the `port` value in server config)
  - Or stop the process using port 3000

### Build Errors
- **TypeScript errors**
  - Run `npm install` to ensure all dependencies are installed
  - Check that Node.js version is 16 or higher

## Technologies Used

- **React 19.2.0** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Google Gemini AI** - AI capabilities
- **Tailwind CSS** - Styling (via CDN)

## License

This project appears to be a demo/educational application. Please check with the original repository for licensing information.

## Support

For issues related to:
- **Google Gemini API**: Check [Google AI Studio Documentation](https://ai.google.dev/docs)
- **Project Setup**: Review this README and ensure all prerequisites are met
- **Browser Compatibility**: Use modern browsers (Chrome, Firefox, Edge, Safari)

---

**Note**: This application is for informational purposes and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical concerns.
