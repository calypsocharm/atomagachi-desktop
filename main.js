const { app, BrowserWindow, screen, ipcMain, globalShortcut, Tray, Menu, nativeImage } = require('electron');
const http = require('http');
const { spawn } = require('child_process');

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  if (catWin) catWin.focus();
});

let catWin;
let widgetWin;
let tray = null;

function createWindow () {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  catWin = new BrowserWindow({
    width: width,
    height: height, 
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  catWin.setIgnoreMouseEvents(true, { forward: true });
  catWin.loadFile('index.html', { query: { mode: 'cat' } });

  widgetWin = new BrowserWindow({
    width: width,
    height: height, 
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: false,
    skipTaskbar: true,
    hasShadow: false,
    focusable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  widgetWin.setIgnoreMouseEvents(true, { forward: true });
  widgetWin.loadFile('index.html', { query: { mode: 'widgets' } });


  // Register a global shortcut
  globalShortcut.register('CommandOrControl+N', () => {
    if (catWin) {
      catWin.webContents.send('show-notification', "You have a new message from a friend! 💌");
    }
  });

  // ========== WATCHDOG HTTP SERVER ==========
  // Exposes a local webhook so external scripts can trigger his alerts
  try {
     const server = http.createServer((req, res) => {
       if (req.url.includes('/watchdog')) {
         if (catWin) {
             catWin.webContents.send('watchdog-alert');
             catWin.webContents.send('show-notification', '[CRITICAL EVENT]\nWATCHDOG FLAG TRIPPED!');
         }
         res.end('Watchdog alerted to pet.\n');
       } else {
         res.end('Atomagachi webhook server running.\nSend GET to http://localhost:3010/watchdog to trigger an alert.\n');
       }
     });
     server.on('error', (e) => { console.log("Watchdog port 3010 in use - ignoring duplicate bind."); });
     server.listen(3010);
  } catch(e) {}

  // ========== ACTIVE WINDOW AWARENESS ==========
  // Runs native C# to reliably grab active window text without breaking dependencies
  const psLoop = `
Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win32 { [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow(); [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder text, int count); }';
$b = New-Object System.Text.StringBuilder 256;
while ($true) {
  $null = [Win32]::GetWindowText([Win32]::GetForegroundWindow(), $b, 256);
  Write-Output $b.ToString();
  Start-Sleep -Seconds 3;
}
  `;

  const proc = spawn('powershell', ['-NoProfile', '-Command', psLoop]);
  let currentApp = "";
  let buffer = '';
  proc.stdout.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep partial string in buffer
      for (const line of lines) {
         const appStr = line.trim();
         if (appStr && appStr !== currentApp) {
             currentApp = appStr;
             if (catWin) catWin.webContents.send('app-changed', currentApp);
         }
      }
  });

  // START NETWORK UPLINK MONITOR
  let lastRx = 0, lastTx = 0;
  setInterval(() => {
    require('child_process').exec('netstat -e', (err, stdout) => {
        if (!err && (catWin || widgetWin)) {
            const match = stdout.match(/Bytes\s+(\d+)\s+(\d+)/);
            if (match) {
                let rx = parseInt(match[1]); let tx = parseInt(match[2]);
                if (lastRx !== 0) {
                    if (widgetWin) widgetWin.webContents.send('net-stats', { rx: (rx - lastRx) / 2, tx: (tx - lastTx) / 2 });
                }
                lastRx = rx; lastTx = tx;
            }
        }
    });
  }, 2000);

  app.on('will-quit', () => {
      if (proc) proc.kill();
  });
}

ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  const targetWin = BrowserWindow.fromWebContents(event.sender);
  if (targetWin) targetWin.setIgnoreMouseEvents(ignore, options);
});

ipcMain.on('broadcast-toggle-layout', () => {
  if (widgetWin) widgetWin.webContents.send('toggle-layout');
});

ipcMain.on('broadcast-theme-update', () => {
  if (widgetWin) widgetWin.webContents.send('theme-update');
});

ipcMain.on('console', (event, msg) => {
  console.log('[RENDERER] ' + msg);
});

ipcMain.on('set-always-on-top', (event, isAlwaysOnTop) => {
  if (catWin) {
    catWin.setAlwaysOnTop(isAlwaysOnTop);
  }
});

app.whenReady().then(() => {
  createWindow();
  
  screen.on('display-metrics-changed', () => {
     const { width, height } = screen.getPrimaryDisplay().workAreaSize;
     if (catWin) { catWin.setBounds({ x: 0, y: 0, width, height }); }
     if (widgetWin) { widgetWin.setBounds({ x: 0, y: 0, width, height }); }
  });
  
  const path = require('path');
  const iconPath = path.join(__dirname, 'icon.png');
  tray = new Tray(iconPath);
  tray.setToolTip('Atomagachi AI Core');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Restart Core', click: () => { 
        if (process.env.PORTABLE_EXECUTABLE_FILE) { app.relaunch({ execPath: process.env.PORTABLE_EXECUTABLE_FILE }); } 
        else { app.relaunch(); } 
        app.quit(); 
    } },
    { label: 'Reset Component Layout', click: () => { if (catWin) catWin.webContents.executeJavaScript('window.resetLayout()'); if (widgetWin) widgetWin.webContents.executeJavaScript('window.resetLayout()'); } },
    { type: 'separator' },
    { label: 'Shutdown OS', click: () => { app.quit(); } }
  ]));

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
