# Complete Setup Guide for Sehat Nabha

This guide will walk you through setting up the Sehat Nabha telemedicine application from scratch.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js** installed (version 16 or higher)
  - Check version: `node --version`
  - Download: https://nodejs.org/
- [ ] **npm** installed (comes with Node.js)
  - Check version: `npm --version`
- [ ] **Google Account** (for API key)
- [ ] **Modern Web Browser** (Chrome, Firefox, Edge, or Safari)
- [ ] **Text Editor** (VS Code, Notepad++, or any code editor)

## Step-by-Step Setup

### Step 1: Verify Node.js Installation

Open your terminal/command prompt and run:

```bash
node --version
npm --version
```

You should see version numbers. If not, install Node.js from https://nodejs.org/

### Step 2: Navigate to Project Directory

Open terminal/command prompt in the project folder:

**Windows:**
```powershell
cd "C:\Users\kavay\OneDrive\Desktop\APP 2\sehat-nabha-–-rural-telemedicine-access"
```

**Mac/Linux:**
```bash
cd /path/to/sehat-nabha-–-rural-telemedicine-access
```

### Step 3: Install Dependencies

Run the following command to install all required packages:

```bash
npm install
```

**What this does:**
- Downloads and installs React, TypeScript, Vite, and Google Gemini AI SDK
- Creates a `node_modules` folder with all dependencies
- Takes 1-3 minutes depending on your internet speed

**Expected output:**
```
added 150 packages, and audited 151 packages in 2m
```

### Step 4: Get Google Gemini API Key

1. **Visit**: https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click** "Create API Key" or "Get API Key"
4. **Copy** the generated API key (it looks like: `AIzaSy...`)

**Important:**
- Keep your API key secret and private
- Don't share it publicly or commit it to version control
- You may have usage limits depending on your Google account

### Step 5: Create Environment File

Create a file named `.env.local` in the project root directory:

**Windows PowerShell:**
```powershell
New-Item -Path .env.local -ItemType File
```

**Windows Command Prompt:**
```cmd
type nul > .env.local
```

**Mac/Linux:**
```bash
touch .env.local
```

**Or manually:**
1. Create a new file in the project root
2. Name it exactly: `.env.local` (with the dot at the beginning)
3. Make sure it's in the same folder as `package.json`

### Step 6: Add API Key to Environment File

Open `.env.local` in a text editor and add:

```
GEMINI_API_KEY=your_actual_api_key_here
```

**Replace `your_actual_api_key_here` with your actual API key from Step 4.**

**Example:**
```
GEMINI_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
```

**Important:**
- No quotes around the API key
- No spaces around the `=` sign
- Save the file after adding the key

### Step 7: Verify File Structure

Your project should now have these files:

```
sehat-nabha-–-rural-telemedicine-access/
├── .env.local              ← Your API key (NEW)
├── .gitignore
├── App.tsx
├── components/
├── constants.tsx
├── index.css               ← Styling (NEW)
├── index.html
├── index.tsx
├── metadata.json
├── node_modules/           ← Dependencies (NEW)
├── package.json
├── package-lock.json       ← Auto-generated
├── README.md
├── SETUP.md                ← This file (NEW)
├── tsconfig.json
├── types.ts
├── vite.config.ts
└── WHAT_IS_THIS.md        ← Explanation (NEW)
```

### Step 8: Start the Development Server

Run the following command:

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

### Step 9: Open the Application

1. Open your web browser
2. Navigate to: **http://localhost:3000**
3. You should see the Sehat Nabha dashboard!

## Verification Checklist

After setup, verify everything works:

- [ ] Development server starts without errors
- [ ] App loads in browser at http://localhost:3000
- [ ] Dashboard shows 5 feature cards
- [ ] Language selector works (top-right corner)
- [ ] Can navigate between features
- [ ] API key is configured (no API errors in console)

## Testing Each Feature

### Test 1: AI Health Assistant (Voice & Text)
- **Text mode**
  1. Click "AI Health Assistant"
  2. Type: "What are the symptoms of a cold?"
  3. Press Enter
  4. You should receive an AI response
- **Voice mode**
  1. Click the microphone button
  2. Allow microphone permission when prompted
  3. Ask a question out loud
  4. The transcript should appear alongside an audio response
  5. Click the red stop button to end the session

### Test 2: Language Selection
1. Click language buttons in top-right
2. Interface should change language
3. Try all three languages (English, Hindi, Punjabi)

### Test 3: Find Care
1. Click "Find Care"
2. Allow location access when prompted
3. Type: "nearby hospitals"
4. Click search
5. Should show results with map links

### Test 4: Analyze Report
1. Click "Analyze Report"
2. Upload an image (any image for testing)
3. Click "Analyze"
4. Should receive analysis (may take a moment)

## Troubleshooting

### Problem: "npm install" fails

**Solution:**
- Check Node.js version: `node --version` (should be 16+)
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again

### Problem: "API key not found" error

**Solution:**
- Verify `.env.local` exists in project root
- Check file contains: `GEMINI_API_KEY=your_key` (no quotes, no spaces)
- Restart development server after creating/modifying `.env.local`
- Check file is named exactly `.env.local` (with dot at start)

### Problem: Port 3000 already in use

**Solution:**
- Stop other applications using port 3000
- Or change port in `vite.config.ts`:
  ```typescript
  server: {
    port: 3001,  // Change to different port
  }
  ```

### Problem: App doesn't load in browser

**Solution:**
- Check terminal for errors
- Verify `npm run dev` is running
- Try different browser
- Clear browser cache
- Check firewall isn't blocking port 3000

### Problem: Microphone not working (AI Health Assistant voice mode)

**Solution:**
- Grant microphone permissions in browser
- Check browser settings for microphone access
- Use HTTPS or localhost (required for microphone)
- Try different browser

### Problem: Location not working (Find Care)

**Solution:**
- Allow location access when prompted
- Check browser location permissions
- Ensure you're using HTTPS or localhost
- Check device location services are enabled

### Problem: API errors in console

**Solution:**
- Verify API key is correct in `.env.local`
- Check API key hasn't expired
- Verify you have API quota/credits
- Check Google Cloud Console for API status

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for outdated packages
npm outdated

# Update packages (be careful!)
npm update
```

## Next Steps

After setup is complete:

1. **Read** `WHAT_IS_THIS.md` to understand the app architecture
2. **Read** `README.md` for detailed usage instructions
3. **Explore** the code in `App.tsx` to understand how it works
4. **Customize** the app for your needs
5. **Deploy** to production when ready

## Production Deployment

When ready to deploy:

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Test production build:**
   ```bash
   npm run preview
   ```

3. **Deploy `dist/` folder** to:
   - Vercel
   - Netlify
   - GitHub Pages
   - Any static hosting service

4. **Set environment variables** in your hosting platform:
   - `GEMINI_API_KEY=your_key`

## Support

If you encounter issues:

1. Check this SETUP.md guide
2. Review README.md troubleshooting section
3. Check browser console for errors
4. Verify all prerequisites are met
5. Ensure API key is valid and has quota

## Security Notes

- **Never commit `.env.local`** to version control
- **Don't share your API key** publicly
- **Keep API key secure** and rotate if compromised
- **Use environment variables** in production deployments
- **Monitor API usage** to avoid unexpected charges

---

**You're all set!** The app should now be running at http://localhost:3000

