# Atomagachi (Super Chat Cat)

Welcome to the Atomagachi repository! Atomagachi is a fully autonomous, offline desktop digital pet that acts as a highly intelligent local AI sidebar for hackers and developers.

## ⚠️ CRITICAL PRECAUTIONS: LOCAL AI BRAIN ⚠️
* **MASSIVE FILE SIZE:** The Local AI engine (Ollama) requires a massive amount of hard drive space. By default, Atomagachi is wired to automatically pull the **12.8 GB Gemma 2** model. Do not run the Local Brain mode if you are extremely low on disk storage!
* **HARDWARE REQUIREMENTS:** Because Atomagachi loads an entire 12-to-15 Gigabyte neural net into memory, you **MUST** have a dedicated, high-end Graphics Card (GPU) with at least 12GB+ of VRAM (e.g., RTX 4070 Ti SUPER or equivalent). Running this on a standard laptop will likely crash your system.
* **IDENTITY BLEED (ChatGPT Hallucination):** Atomagachi is powered by Google DeepMind's Gemma 2 open-source model. However, because it was trained on vast amounts of internet text, it may occasionally suffer from "Identity Bleed" and falsely claim that it is ChatGPT created by OpenAI. This is a common open-weight hallucination.

## Features
1. **Local Offline Intelligence:** Uses `gemma2` via Ollama. It doesn't need Wi-Fi or a cloud connection; everything processes seamlessly and privately right on your local desktop.
2. **Long-Term Memory:** Automatically ingests and learns from any `.md` file stored within your `Downloads/Atomagachi_Brain/` folder. It will use these memories in live conversations!
3. **Instant Art Module:** In addition to its text brain, you can command Atomagachi to draw art by simply typing `"draw a..."` in the massive retro chat interface.
4. **Hacker Ascii Interface:** Includes desktop widget widgets for system monitoring, live global market prices, and weather uplinks.

## Technical Setup
If you are cloning this repository:
1. Ensure Node.js and Electron are installed on your machine.
2. Run `npm install` in this root directory.
3. Download the official [Ollama Windows Installer](https://ollama.com/) and run `ollama pull gemma2` via your terminal.
4. Run `npm start` to execute the source code version of the app. Ensure you close any previously packed `.exe` instances first (Single-Instance Lock prevents duplicates).

Enjoy your personal, offline desktop sidekick!
