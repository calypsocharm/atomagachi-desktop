# Atomagachi: Project Creation & Architecture Log

## Overview
**Atomagachi** was conceived as a highly customized, fully autonomous desktop companion (a transparent overlay pet). Unlike traditional desktop pets that just wander around, Atomagachi functions as a localized AI command center—capable of reading system metrics, autonomously browsing the web, and holding context-aware conversations. 

The core of the project relies on **Electron** to create a borderless, transparent window that sits directly on top of the Windows desktop, acting as both an interactive pet and a "Rainmeter"-style HUD.

---

## 🏗️ Core Architecture & Toolkit
*   **Engine Framework:** Electron JS (v29.x)
*   **Compilation:** `electron-builder` to bundle the app into a sleek, portable standard `.exe`.
*   **Interface Layer:** Pure HTML/CSS/Vanilla JS with custom UI rendering, drag-and-drop layout editing, and completely dynamic theme skins (Terminal, Matrix, Vaporwave).

---

## 🧠 The AI Pipeline: How Ollama was Integrated
The beating heart of Atomagachi is its Dual-Brain Engine. The system defaults to a **"Local Brain"** via **Ollama**.

1.  **Model Selection:** The application was hard-coded to tap into `gemma4` run by an active local Ollama instance. 
2.  **API Hooking:** A pure JavaScript `fetch` call is made directly to `http://localhost:11434/api/chat`. 
3.  **Active Memory Context:** When a user chats, Atomagachi explicitly reads the 3 most recently created markdown files from its `Atomagachi_Brain` folder. It passes the raw text of these memories alongside the user’s prompt as "System Context" into the Ollama payload.
4.  **Short-term Buffer:** We maintain an array of the last 20 messages in memory so Ollama remembers the direct conversational flow.
5.  **Cloud Fallback:** If Ollama is offline or the user switches engines, it elegantly falls back to the Google Gemini API (if a key is provided) to keep the companion alive.

---

## 🌐 Autonomous Web Research (Tavily)
Atomagachi acts independently of the user to learn. 
1.  **The Loop:** Every 10 minutes, Atomagachi runs a background cycle. 
2.  **The Query:** It chooses a random topic (or a user-supplied "directive") and queries the **Tavily API** for highly specific, factual data.
3.  **Assimilation (The Brain Drive):** It writes the response as a markdown `.md` file to the local Windows file system under `Downloads/Atomagachi_Brain`. 
4.  **Leveling Up:** As these files accumulate total size, Atomagachi physically "levels up" (up to 99), increasing its neural density and altering its visual ASCI appearance. Upon hitting 1GB of text data, it automatically GZIP compresses older folders!

---

## ⚙️ Advanced Desktop Integration
To make the pet feel "alive" within the Windows ecosystem, we used several low-level integrations:
*   **File Digesting:** The app uses HTML5 Drag-and-Drop. You can drag a `.txt` or `.js` file directly onto the cat. It will use `fs.readFileSync` to read the script, output a funny message, and store the context in an Eliza-rule pattern buffer.
*   **Window Awareness:** A lightweight PowerShell script runs hidden in the background, utilizing `user32.dll` to constantly report what window the user has actively focused. If the user tabs into VS Code, the cat automatically equips "programmer glasses".
*   **System Tracking:** Standard `os` and `child_process` modules watch CPU usage, RAM levels, and run `netstat -e` on loop to render a real-time, precision-mapped Unicode block graph of Network Uplink activity.

---

## 🎨 Render Engine
Instead of pixel sprites, Atomagachi is fully generated from thousands of ASCII characters. 
*   **Procedural Genetics:** A `currentSeed` string runs through a `murmur32` hashing function to procedurally select a combination of heads, bodies, footprint patterns, and colors. If the pet’s data seed is overwritten, its entire physical makeup is redrawn.
*   **Behavior Loop:** A custom 30ms JavaScript ticker loop manages gravity drops, walking velocities, climbing mechanics, and "chase" mechanics (when the Yarn ball toy is activated).

## 🚀 Creating & Packing the EXE
To wrap the whole process up seamlessly:
1. We define configurations in `package.json` for `win: { target: "portable" }`.
2. When running `npm run build`, `electron-builder` packs `main.js`, `index.html`, and native Node modules into an `.asar` archive inside the `dist/` directory.
3. A PowerShell shortcut (`Atomagachi.lnk`) guarantees that this newly minted `.exe` is hooked perfectly into the user's Windows Startup directory so the pet is active on boot. 
