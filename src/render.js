const { dialog } = require('electron').remote;
const path = require('path');
const fs = require('fs');

let id = 'viewer';
let instance = null;

const viewerElement = document.getElementById(id);

const openFileBtn = document.getElementById('open');
const saveFileBtn = document.getElementById('save');
const closeFileBtn = document.getElementById('close');
const newViewerBtn = document.getElementById('new');

init(viewerElement);

newViewerBtn.onclick = () => {
  const viewerElement = document.getElementById(id);
  viewerElement.remove();
  const newViewer = document.createElement('div');
  id = 'viewer' + Math.random().toString();
  newViewer.id = id;
  newViewer.classList = ['webviewer'];
  document.getElementById('container').appendChild(newViewer);
  init(newViewer);
};

openFileBtn.onclick = async () => {
  const file = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Documents', extensions: ['pdf', 'docx', 'pptx', 'xlsx'] },
      { name: 'Images', extensions: ['png', 'jpg'] },
    ],
  });

  if (!file.canceled) {
    instance.loadDocument(file.filePaths[0]);
  }
};

saveFileBtn.onclick = async () => {
  const file = await dialog.showOpenDialog({
    title: 'Select where you want to save the PDF',
    buttonLabel: 'Save',
    filters: [
      {
        name: 'PDF',
        extensions: ['pdf'],
      },
    ],
    properties: ['openDirectory'],
  });

  if (!file.canceled) {
    console.time('saving');
    console.time('getDocument');
    const doc = instance.docViewer.getDocument();
    console.timeEnd('getDocument');

    console.time('exportAnnotations');
    const xfdfString = await instance.annotManager.exportAnnotations();
    console.timeEnd('exportAnnotations');

    console.time('getFileData');
    const data = await doc.getFileData({
      // saves the document with annotations in it
      xfdfString,
    });
    console.timeEnd('getFileData');

    console.time('Uint8Array');
    const arr = new Uint8Array(data);
    console.timeEnd('Uint8Array');

    console.time('writeFile');
    fs.writeFile(
      `${file.filePaths[0].toString()}/annotated.pdf`,
      arr,
      function (err) {
        if (err) throw err;
        console.timeEnd('writeFile');
        console.timeEnd('saving');
        console.log('Saved!');
      },
    );
  }
};

closeFileBtn.onclick = () => {
  instance.closeDocument().then(function () {
    console.log('Document is closed');
  });
};

async function init(viewerElement) {
  instance = await WebViewer(
    {
      path: '../public/lib',
      initialDoc: '../public/files/webviewer-demo-annotated.pdf',
    },
    viewerElement,
  );
  // Interact with APIs here.
  // See https://www.pdftron.com/documentation/web for more info
  instance.setTheme('dark');
  instance.disableElements(['downloadButton']);
}
