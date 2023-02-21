const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  //emitters
  selectFolder: () => ipcRenderer.send('select-folder'),
  startDownload: (files, selectedFolder) => ipcRenderer.send('start-download', files, selectedFolder),

  //listenners
  onProgress: (callback) => {
    ipcRenderer.on('progress', callback);
  },
  onFinish: (callback) => {
    ipcRenderer.on('finish', callback);
  },
  onSelectFolder: (callback) => {
    ipcRenderer.on('selected-folder', callback);
  },
  log: (data) => {
    ipcRenderer.on('log', data);
  },
})