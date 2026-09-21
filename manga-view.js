const addKanjiBtn = document.getElementById('btn-add-kanji');
const addKanjiDiv = document.getElementById('div-add-kanji');
const saveKanjiButton = document.getElementById('btn-save-kanji');
const saveKanjiForm = document.getElementById('frm-new-kanji');
const kanjiForm = document.getElementById('kanji-form');
const kanjiList = document.getElementById('list-kanji');

addKanjiBtn.addEventListener('click', () => {
    console.log("Add Kanji button was clicked!");
    addKanjiDiv.classList.toggle('hidden');

    if (addKanjiDiv.classList.contains('hidden')) {
        addKanjiBtn.textContent = 'Add New Kanji';
    } else {
        addKanjiBtn.textContent = 'Hide Form';
    }
});

kanjiForm.addEventListener('submit', async () => {
    console.log("Save Kanji button was clicked!");
    addKanjiDiv.classList.toggle('hidden');

    const title = await window.myStorageAPI.getActiveManga();
    const mangaInfo = await window.myStorageAPI.getMangaInfo(title);
  
    const kanjiDict = mangaInfo.kanjisUsed || {};
    const userKanji = saveKanjiForm.value.trim();

    if (userKanji && !(userKanji in kanjiDict)) {
        kanjiDict[userKanji] = [];
        mangaInfo.kanjisUsed = kanjiDict;
        console.log(mangaInfo)

        const result = await window.myStorageAPI.saveMangaInfo(title, mangaInfo);
        
        saveKanjiForm.value = ''; 
    }
    else{
        alert("This kanji was already added.");
    }

    if (addKanjiDiv.classList.contains('hidden')) {
        saveKanjiButton.textContent = 'Add New Kanji';
    } else {
        saveKanjiButton.textContent = 'Hide Form';
    }
})

//refresh notas para kanji
async function refreshNotesForKanji(title, key, notesContainer) {
    notesContainer.innerHTML = '';

    const mangaInfo = await window.myStorageAPI.getMangaInfo(title);
    const notesArray = mangaInfo.kanjisUsed[key] || [];

    notesArray.forEach((element, i) => {
        const note = document.createElement('p');
        note.className = "editable-note";
        note.contentEditable = "true";
        note.textContent = element;
        notesContainer.appendChild(note);

        note.addEventListener('blur', async () => {
            const updatedText = note.innerText.trim();
            const currentMangaInfo = await window.myStorageAPI.getMangaInfo(title);
            const currentArray = currentMangaInfo.kanjisUsed[key];

            if (currentArray) {
                if (updatedText === "") {
                    currentArray.splice(i, 1);
                } else {
                    currentArray[i] = updatedText;
                }
                await window.myStorageAPI.saveMangaInfo(title, currentMangaInfo);
                
                refreshNotesForKanji(title, key, notesContainer);
            }
        });
    });
}

async function renderPage() {  
    const title = await window.myStorageAPI.getActiveManga();
    const mangaInfo = await window.myStorageAPI.getMangaInfo(title);
    kanjiList.innerHTML = '';

    if (mangaInfo){
        document.getElementById('manga-title').innerText = mangaInfo.mangaName;
        document.getElementById('date-added').innerText = "Added in " + mangaInfo.dateAdded
        document.title = mangaInfo.mangaName;
    

        Object.entries(mangaInfo.kanjisUsed).forEach(([key, value]) => {

            //div that holds everything
            const rootDiv = document.createElement('div');

            const deleteButton = document.createElement('button');
            deleteButton.textContent = "X";

            //row to contain kanji and show more button
            const rowKanji = document.createElement('div');
            const rowNotes = document.createElement('div');
            rowKanji.className = 'row';
            rowNotes.className = 'row';
            rowKanji.appendChild(deleteButton);


            //column to contain the rows
            const columnKanji = document.createElement('div');
            columnKanji.className = 'column'

            //kanji first shown
            const kanji = document.createElement('p');
            kanji.textContent = key;
            rowKanji.appendChild(kanji)

            //dropdown button
            const dropdownButton = document.createElement('button');
            dropdownButton.textContent = "Show more";
            rowKanji.appendChild(dropdownButton);

            //notes and add button div
            const dropdownContent = document.createElement('div');
            dropdownContent.className = 'dropdown-content';
            rowNotes.appendChild(dropdownContent);
            columnKanji.appendChild(rowKanji);
            columnKanji.appendChild(rowNotes);

            //container para el refresh
            const notesContainer = document.createElement('div');
            notesContainer.id = `notes-list-${key}`;
            dropdownContent.appendChild(notesContainer);
            refreshNotesForKanji(title, key, notesContainer);

            //add form
            const input = document.createElement('input');
            dropdownContent.appendChild(input);

            //add button
            const addButton = document.createElement('button');
            addButton.textContent = "Add note";
            dropdownContent.appendChild(addButton);
            addButton.addEventListener('click', async () => {
                const mangaInfo = await window.myStorageAPI.getMangaInfo(title);
                const array = mangaInfo.kanjisUsed[key] || [];
                const userNoteText = input.value.trim();

                if (userNoteText) {
                    array.push(userNoteText);
                    mangaInfo.kanjisUsed[key] = array;
                    
                    await window.myStorageAPI.saveMangaInfo(title, mangaInfo);
                    input.value = "";
                    refreshNotesForKanji(title, key, notesContainer);
                }

            });

            //erase button
            deleteButton.addEventListener('click', async () => {
                const mangaInfo = await window.myStorageAPI.getMangaInfo(title);
                delete mangaInfo.kanjisUsed[key];
                await window.myStorageAPI.saveMangaInfo(title, mangaInfo);
                renderPage();
            })

            //show more button
            dropdownButton.addEventListener('click', () => {
                console.log(key);
                dropdownContent.classList.toggle('show');

                if (dropdownContent.classList.contains('show')) {
                    dropdownButton.textContent = 'Show less';
                } else {
                    dropdownButton.textContent = 'Show more';
                }
            });

            rootDiv.appendChild(columnKanji);

            const hLine = document.createElement('hr');
            rootDiv.appendChild(hLine);

            kanjiList.appendChild(rootDiv);
        });
    }
}

renderPage();
