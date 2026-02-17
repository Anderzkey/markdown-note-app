const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const os = require('os');

let mainWindow;

// App configuration file location
const APP_CONFIG_PATH = path.join(os.homedir(), '.appconfig-markdown');

// Create main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the app
  const indexPath = path.join(__dirname, '..', 'index.html');
  mainWindow.loadFile(indexPath);

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize app
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// ========== IPC Handlers for File System API ==========

// Read file from disk
ipcMain.handle('electronAPI:readFile', async (event, filePath) => {
  try {
    // Sanitize path to prevent directory traversal
    const resolvedPath = path.resolve(filePath);
    const content = await fs.readFile(resolvedPath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Write file to disk
ipcMain.handle('electronAPI:writeFile', async (event, filePath, content) => {
  try {
    // Sanitize path to prevent directory traversal
    const resolvedPath = path.resolve(filePath);
    await fs.writeFile(resolvedPath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Open native folder picker dialog
ipcMain.handle('electronAPI:selectFolder', async (event) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select a folder with markdown files',
    });

    if (result.canceled) {
      return { success: true, cancelled: true };
    }

    if (result.filePaths.length > 0) {
      return { success: true, path: result.filePaths[0] };
    }

    return { success: true, cancelled: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Scan folder for markdown files recursively
ipcMain.handle('electronAPI:scanFolder', async (event, folderPath) => {
  try {
    const files = [];

    async function scanDir(dir, relativePath = '') {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        // Skip hidden files and common ignored directories
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }

        const fullPath = path.join(dir, entry.name);
        const relPath = relativePath ? path.join(relativePath, entry.name) : entry.name;

        if (entry.isDirectory()) {
          files.push({
            name: entry.name,
            path: fullPath,
            isDirectory: true,
            relativePath: relPath,
          });
          // Recursively scan subdirectories
          await scanDir(fullPath, relPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push({
            name: entry.name,
            path: fullPath,
            isDirectory: false,
            relativePath: relPath,
          });
        }
      }
    }

    const resolvedPath = path.resolve(folderPath);

    // Check if folder exists
    if (!fsSync.existsSync(resolvedPath)) {
      return { success: false, error: 'Folder not found' };
    }

    await scanDir(resolvedPath);
    return { success: true, files };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ========== App Configuration Management ==========

// Read app configuration
ipcMain.handle('electronAPI:readConfig', async (event) => {
  try {
    if (fsSync.existsSync(APP_CONFIG_PATH)) {
      const data = await fs.readFile(APP_CONFIG_PATH, 'utf-8');
      return { success: true, config: JSON.parse(data) };
    }
    return { success: true, config: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Write app configuration
ipcMain.handle('electronAPI:writeConfig', async (event, config) => {
  try {
    await fs.writeFile(APP_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ========== Keyboard Shortcuts ==========

const { Menu } = require('electron');

app.whenReady().then(() => {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Folder',
          accelerator: 'Cmd+O',
          click: () => {
            mainWindow.webContents.send('menu:openFolder');
          },
        },
        {
          label: 'Save',
          accelerator: 'Cmd+S',
          click: () => {
            mainWindow.webContents.send('menu:save');
          },
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'Cmd+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});
