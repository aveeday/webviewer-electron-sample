const { ipcRenderer } = require("electron")
const { dialog } = require("electron").remote;
const path = require("path");
const fs = require("fs");

const viewerElement = document.getElementById("viewer");

const openFileBtn = document.getElementById("open");
const saveFileBtn = document.getElementById("save");

const filePathPromise = ipcRenderer.invoke('getInitialFilePath')

Promise.resolve().then(async() => {
  const workerHandlers = {};
  const licenseKey = ''
  const pdfType = await Core.getDefaultBackendType();

  Core.setWorkerPath('../public/lib/core');
  await Core.PDFNet.initialize(licenseKey);

  return {
    pdf: Core.initPDFWorkerTransports(
      pdfType,
      workerHandlers,
      licenseKey,
    ),
  }
}).then(workerTransportPromise => {
  return WebViewer(
    {
      path: "../public/lib",
      fullAPI: true,
      workerTransportPromise,
    },
    viewerElement
  )
}).then(async (instance) => {
  instance.Core.syncNamespaces({ PDFNet: Core.PDFNet });
  const initialDoc = "../../../public/files/webviewer-demo-annotated.pdf";
  const filePath = await filePathPromise.then(r => r !== '.' ? r : null) || initialDoc;
  instance.loadDocument(filePath)
  // Interact with APIs here.
  // See https://www.pdftron.com/documentation/web for more info
  instance.setTheme("dark");
  instance.disableElements(['downloadButton']);

  const { documentViewer, annotationManager } = instance.Core;

  openFileBtn.onclick = async () => {
    const file = await dialog.showOpenDialog({
      properties: ["openFile", "multiSelections"],
      filters: [
        { name: "Documents", extensions: ["pdf", "docx", "pptx", "xlsx"] },
        { name: "Images", extensions: ["png", "jpg"] },
      ],
    });

    if (!file.canceled) {
      instance.loadDocument(file.filePaths[0]);
    }
  };

  saveFileBtn.onclick = async () => {
    const file = await dialog.showOpenDialog({
      title: "Select where you want to save the PDF",
      buttonLabel: "Save",
      filters: [
        {
          name: "PDF",
          extensions: ["pdf"],
        },
      ],
      properties: ["openDirectory"],
    });

    if (!file.canceled) {
      const doc = documentViewer.getDocument();
      const xfdfString = await annotationManager.exportAnnotations();
      const data = await doc.getFileData({
        // saves the document with annotations in it
        xfdfString,
      });
      const arr = new Uint8Array(data);
      
      fs.writeFile(
        `${file.filePaths[0].toString()}/annotated.pdf`,
        arr,
        function (err) {
          if (err) throw err;
          console.log("Saved!");
        }
      );
    }
  };
});
