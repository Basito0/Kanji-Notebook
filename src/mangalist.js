const saveButton = document.getElementById('btn-save');
const mangaSection = document.getElementById('images-mangas');
const toggleButton = document.getElementById('btn-toggle-form');
const mangaForm = document.getElementById('manga-form');
const mangaName = document.getElementById('frm-new-manga');

const fetchMangaData = async () => {
  const result = await window.myStorageAPI.loadData();
  if (result) {
    console.log("Data obtained");
    return result;
  } else {
    console.log("Couldn't obtain manga info");
    return null;
  }
};

const fetchMangaPages = async () => {
  const result = await window.myStorageAPI.loadMangaPage();
  if (result) {
    console.log("Data obtained");
    return result;
  } else {
    console.log("Couldn't obtain manga info");
    return null;
  }
};

const init = async () => {
  const userDataPath = await window.myStorageAPI.getUserDataPath();
  console.log("The user data folder is located at:", userDataPath);

  const pages = await fetchMangaPages();
  const mangaSection = document.getElementById('images-mangas');

  if (pages && pages.savedMangas) {
    
    Object.entries(pages.savedMangas).forEach(([mangaTitle, htmlFilename]) => {
      
      const a = document.createElement('a');
      a.className = 'mangas';

      const img = document.createElement('input');
      img.type = 'image';
      img.src = 'assets/glt.jpg';
      img.alt = `${mangaTitle} cover image`;

      img.addEventListener('click', async (e) => {
        await window.myStorageAPI.openManga(mangaTitle);
      });

      a.appendChild(img);
      mangaSection.appendChild(a);
    });
    
  } else {
    console.log("No saved mangas found to render.");
  }
};

init();

toggleButton.addEventListener('click', () => {
  mangaForm.classList.toggle('hidden');
  
  if (mangaForm.classList.contains('hidden')) {
    toggleButton.textContent = 'Add New Manga';
  } else {
    toggleButton.textContent = 'Hide Form';
  }
});

saveButton.addEventListener('click', async (e) => {
  mangaForm.classList.toggle('hidden');
  if (mangaForm.classList.contains('hidden')) {
    toggleButton.textContent = 'Add New Manga';
  } else {
    toggleButton.textContent = 'Hide Form';
  }

  console.log("cosas escondidas");

  const data = await window.myStorageAPI.loadData();

  console.log("data cargada");

  var dataToSave = " ";
  if (data && data.savedMangas){
    console.log("Loaded mangas successfully:", data.favoriteMangas);
    const newData = data.savedMangas;
    newData.push(mangaName.value);
    dataToSave = {
      savedMangas: newData
    };
  }
  else {
    console.log("Path or savedMangas not found");
    dataToSave = {
      savedMangas: [mangaName.value]
    }
  }

  await window.myStorageAPI.createPage(mangaName.value, mangaName.value);
  
  console.log("Sending data to the backend...");
  const result = await window.myStorageAPI.saveData(dataToSave);


  if (result.success) {
    alert('Data saved perfectly to your local JSON file!');
  } else {
    alert('Failed to save data: ' + result.error);
  }
});