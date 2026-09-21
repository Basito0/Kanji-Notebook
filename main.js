const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')
const fs = require('node:fs')
const url = require('node:url')

const userDataPath = app.getPath('userData')
const mangaFilePath = path.join(userDataPath, 'manga-list.json')
const connectionMangaPage = path.join(userDataPath, 'manga-page.json')
const mangaInfoPath = path.join(userDataPath, 'manga')
let activeMangaTitle = "";

let win = null;

const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  const sourceHtmlPath = path.join(__dirname, 'mangalist.html'); 

  win.loadFile(sourceHtmlPath)
}

app.whenReady().then(() => {

    ipcMain.handle('save-manga-info', (event, mangaName, dataToSave) => {
      try {
        const mangaPath = path.join(mangaInfoPath, mangaName + ".json");
        console.log("guardando a ")
        fs.writeFileSync(mangaPath, JSON.stringify(dataToSave, null, 2), 'utf-8')
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('get-active-manga', () => {
      return activeMangaTitle;
    });

    ipcMain.handle('get-manga-info', (e, mangaName) => {
      const thisMangaInfo = path.join(mangaInfoPath, mangaName + '.json')
      try {
        if (fs.existsSync(thisMangaInfo)) {
          const fileData = fs.readFileSync(thisMangaInfo, 'utf-8')
          return JSON.parse(fileData) // Send it back as a clean JS Object
        }
        return {} // Return empty object if file doesn't exist yet
      } catch (error) {
        return { error: error.message }
      }
    })

    ipcMain.on('open-manga-section', (event, title) => {
      activeMangaTitle = title; 
      if (win) {
        win.loadFile(path.join(__dirname, 'manga-template.html')); 
      }
    });

    ipcMain.on('navigate-home', () => {
      win.loadFile(path.join(__dirname, 'mangalist.html')); // Clean, safe, and unblocked
    });

    ipcMain.handle('get-user-data-path', () => {
      return app.getPath('userData');
    });

    ipcMain.handle('save-user-data', (event, dataObject) => {
      try {
        fs.writeFileSync(mangaFilePath, JSON.stringify(dataObject, null, 2), 'utf-8')
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('load-user-data', () => {
      try {
        if (fs.existsSync(mangaFilePath)) {
          const fileData = fs.readFileSync(mangaFilePath, 'utf-8')
          return JSON.parse(fileData) // Send it back as a clean JS Object
        }
        return {} // Return empty object if file doesn't exist yet
      } catch (error) {
        return { error: error.message }
      }
    })
    
    ipcMain.handle('load-manga-page', () => {
      try {
        if (fs.existsSync(connectionMangaPage)) {
          const fileData = fs.readFileSync(connectionMangaPage, 'utf-8')
          return JSON.parse(fileData) // Send it back as a clean JS Object
        }
        return {} // Return empty object if file doesn't exist yet
      } catch (error) {
        return { error: error.message }
      }
    })

    // TO DO: HACER QUE APAREZCA UN JSON PARA METER INFO DEL MANGA (PALABRAS, FRASES) Y QUIZÁS MODIFICAR UN HTML (PROBABLEMENTE NO)
    ipcMain.handle('create-html-page', (event, { mangaTitle, filename }) => {      
      const myFolderPath = app.getPath('userData') + "/manga";
      if (!fs.existsSync(myFolderPath)){
        fs.mkdirSync(myFolderPath, { recursive: true });
        console.log('Folder did not exist, so it was created successfully!');
      }

      const filePath = path.join(app.getPath('userData'), "manga/" + filename + ".json");
      
      try {
        var data = null;
        if (fs.existsSync(connectionMangaPage)) {
          const fileData = fs.readFileSync(connectionMangaPage, 'utf-8')
          data = JSON.parse(fileData)
        }

        if (!data || typeof data !== 'object') {
          console.log("Initializing a fresh connection file structure.");
          data = {
            savedMangas: {} // Initialize as an empty object map
          };
        }

        data.savedMangas[mangaTitle] = filename + ".json";

        const today = new Date();
        const mangaData = {
          mangaName: mangaTitle,
          dateAdded: today.toISOString().split('T')[0],
          kanjisUsed: {},
        };
        
        fs.writeFileSync(filePath, JSON.stringify(mangaData, null, 2), 'utf-8');
        fs.writeFileSync(connectionMangaPage, JSON.stringify(data, null, 2), 'utf-8')

        return { success: true, path: filePath };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });

    createWindow()

    app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})