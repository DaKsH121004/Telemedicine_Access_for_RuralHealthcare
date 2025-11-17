# How to Install Node.js on Windows

## Quick Installation Guide

### Step 1: Download Node.js

1. **Open your web browser** (Chrome, Edge, Firefox, etc.)
2. **Go to:** https://nodejs.org/
3. **You'll see two download buttons:**
   - **LTS** (Long Term Support) - **Choose this one!** ✅
   - Current (latest features)
4. **Click the LTS button** - it will download a file like `node-v20.x.x-x64.msi`

### Step 2: Install Node.js

1. **Find the downloaded file** (usually in your Downloads folder)
   - File name will be something like: `node-v20.11.0-x64.msi`
2. **Double-click the file** to start installation
3. **Follow the installation wizard:**
   - Click "Next" on the welcome screen
   - Accept the license agreement → Click "Next"
   - Choose installation location (default is fine) → Click "Next"
   - **IMPORTANT:** Make sure "Automatically install the necessary tools" is checked ✅
   - Click "Next"
   - Click "Install" (you may need to enter your Windows password)
   - Wait for installation to complete (takes 1-2 minutes)
   - Click "Finish"

### Step 3: Restart Your Terminal

**CRITICAL STEP - Don't skip this!**

1. **Close ALL terminal/command prompt windows** you have open
2. **Close PowerShell windows** if any are open
3. **Open a NEW terminal:**
   - Press `Win + X`
   - Select "Windows PowerShell" or "Terminal"
   - OR press `Win + R`, type `cmd`, press Enter

### Step 4: Verify Installation

In your NEW terminal window, type these commands one by one:

```bash
node --version
```

**Expected output:** `v20.x.x` or similar (like `v20.11.0`)

Then type:
```bash
npm --version
```

**Expected output:** `10.x.x` or similar (like `10.2.4`)

**✅ If both commands show version numbers, Node.js is installed correctly!**

**❌ If you still get "not recognized" errors:**
- Make sure you closed ALL old terminal windows
- Try restarting your computer
- Reinstall Node.js and make sure "Add to PATH" is checked

### Step 5: Navigate to Your Project

After Node.js is installed and verified, navigate to your project folder:

```bash
cd "C:\Users\kavay\OneDrive\Desktop\APP 2\sehat-nabha-–-rural-telemedicine-access"
```

### Step 6: Install Project Dependencies

Now you can run:
```bash
npm install
```

This should work now! 🎉

## Troubleshooting

### Still Getting "node is not recognized"?

1. **Check if Node.js is installed:**
   - Press `Win + R`
   - Type: `appwiz.cpl` and press Enter
   - Look for "Node.js" in the list of programs
   - If you see it, it's installed but PATH might be wrong

2. **Restart your computer:**
   - Sometimes Windows needs a full restart to update PATH

3. **Reinstall Node.js:**
   - Uninstall Node.js from Control Panel
   - Download fresh installer from nodejs.org
   - During installation, make sure "Add to PATH" option is checked

4. **Manual PATH check (Advanced):**
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Click "Advanced" tab → "Environment Variables"
   - Under "System variables", find "Path"
   - Check if it contains: `C:\Program Files\nodejs\`
   - If not, add it manually

## Need Help?

- **Node.js Website:** https://nodejs.org/
- **Node.js Documentation:** https://nodejs.org/docs/
- **Common Issues:** https://nodejs.org/en/docs/guides/getting-started-guide/

---

**Once Node.js is installed, come back to README.md and continue with the setup!**

