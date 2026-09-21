const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
})

contextBridge.exposeInMainWorld('myStorageAPI', {
  saveData: (userData) => ipcRenderer.invoke('save-user-data', userData),
  loadData: () => ipcRenderer.invoke('load-user-data'),
  createPage: (mangaTitle, filename) => ipcRenderer.invoke('create-html-page', { mangaTitle, filename }),
  loadMangaPage: () => ipcRenderer.invoke('load-manga-page'),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  goHome: () => ipcRenderer.send('navigate-home'),
  openManga: (mangaTitle) => ipcRenderer.send('open-manga-section', mangaTitle),
  getMangaInfo: (mangaTitle) => ipcRenderer.invoke('get-manga-info', mangaTitle),
  getActiveManga: () => ipcRenderer.invoke('get-active-manga'),
  saveMangaInfo: (mangaName, dataToSave) => ipcRenderer.invoke('save-manga-info', mangaName, dataToSave),
})