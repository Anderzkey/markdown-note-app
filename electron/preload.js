const { contextBridge, ipcRenderer } = require('electron');

// Expose safe API to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  readFile: (filePath) => ipcRenderer.invoke('electronAPI:readFile', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('electronAPI:writeFile', filePath, content),
  selectFolder: () => ipcRenderer.invoke('electronAPI:selectFolder'),
  scanFolder: (folderPath) => ipcRenderer.invoke('electronAPI:scanFolder', folderPath),

  // App configuration
  readConfig: () => ipcRenderer.invoke('electronAPI:readConfig'),
  writeConfig: (config) => ipcRenderer.invoke('electronAPI:writeConfig', config),

  // Listen for menu events
  onOpenFolder: (callback) => ipcRenderer.on('menu:openFolder', callback),
  onSave: (callback) => ipcRenderer.on('menu:save', callback),

  // Remove listeners (cleanup)
  removeListeners: () => {
    ipcRenderer.removeAllListeners('menu:openFolder');
    ipcRenderer.removeAllListeners('menu:save');
  },
});
