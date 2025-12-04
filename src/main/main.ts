/* MAIN PROCESS */

import { 
  app, 
  BrowserWindow, 
  ipcMain, 
  dialog, 
  shell 
} from 'electron';

import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import sharp from 'sharp';
import { SimpleGit, simpleGit } from 'simple-git';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

// -----------------------------
//  TYPES
// -----------------------------
interface Listing {
  id: string;
  marka: string;
  model: string;
  godina: number;
  gorivo: string;
  kilometraza: number;
  cena: number;
  cena_snizena?: number;
  cena_fiksna: boolean;
  karoserija: string;
  kubikaza: number;
  snaga: number;
  menjac: string;
  boja: string;
  broj_vrata: number;
  broj_sedista: number;
  emisiona_klasa: string;
  pogon: string;
  poreklo: string;
  prva_registracija: string;
  broj_vlasnika: number;
  oprema: string[];
  opis: string;
  slike: string[];
  status: string;
  istaknuto: boolean;
  datum_objave?: string;
}

interface SaveListingData {
  listing: Listing;
  images: { data: string; name: string }[];
  isEdit: boolean;
}

// -----------------------------
// APP UPDATER (boilerplate)
// -----------------------------
class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

// -----------------------------
let mainWindow: BrowserWindow | null = null;
let dataFolderPath = "";

// -----------------------------
// DEVELOPMENT / DEBUG
// -----------------------------

const isDebug =
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

// -----------------------------
// CREATE MAIN WINDOW
// -----------------------------
const createWindow = async () => {
  // Init folder PRE kreiranja prozora
  try {
    console.log("Data folder path initialized:", dataFolderPath);
  } catch (err) {
    console.error("Cannot init data folder:", err);
    app.quit();
    return;
  }

  mainWindow = new BrowserWindow({
    title: "Velbo Automobili CMS",
    width: 1400,
    height: 900,
    minWidth: 1400,
    minHeight: 900,
    icon: app.isPackaged
    ? path.join(process.resourcesPath, 'assets/icon.png')
    : path.join(__dirname, '../../assets/icon.png'),
    show: false,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, "preload.js")
        : path.join(__dirname, "../../.erb/dll/preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      // devTools: false
    },
  });

  if (isDebug) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadURL(resolveHtmlPath("index.html"));

  mainWindow.on("ready-to-show", () => {
    if (!mainWindow) return;
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  mainWindow.webContents.on('ipc-message', async (event, channel) => {
    if (channel === 'open-folder-selector') {
      const result = await dialog.showOpenDialog({
        properties: ["openDirectory", "createDirectory"],
        title: "Odaberi novi folder za podatke",
      });

      if (!result.canceled) {
        const selected = result.filePaths[0];
        const config = path.join(app.getPath("userData"), "config.json");
        
        await fs.writeFile(config, JSON.stringify({ dataFolder: selected }, null, 2));
        console.log("Saved new folder to config:", selected);

        // AŽURIRAJ dataFolderPath odmah
        dataFolderPath = selected;
        
        // Pošalji signal renderer procesu da učita ponovo oglase
        mainWindow!.webContents.send('folder-changed', selected);
        
        dialog.showMessageBox(mainWindow!, {
          type: 'info',
          title: 'Uspešno',
          message: `Folder podešen na:\n${selected}`,
          buttons: ['OK']
        });
      }
    }
  });

  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: "deny" };
  });

  new AppUpdater();
};

// -----------------------------
// APP EVENTS
// -----------------------------
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app
  .whenReady()
  .then(createWindow)
  .catch(console.log);

app.on("activate", () => {
  if (!BrowserWindow.getAllWindows().length) createWindow();
});

// -----------------------------
// IPC HANDLERS
// -----------------------------

// READ LISTINGS
ipcMain.handle("read-listings", async (event, folderPath: string): Promise<Listing[]> => {
  try {
    if (!folderPath) return [];
    
    const files = (await fs.readdir(folderPath)).filter((f) => f.endsWith(".json"));
    const results: Listing[] = [];

    for (const file of files) {
      try {
        const content = await fs.readFile(path.join(folderPath, file), "utf-8");
        const json = JSON.parse(content);
        results.push({ ...json, slug: file.replace(/\.json$/, "") });
      } catch (err) {
        console.error("Bad listing:", file, err);
      }
    }

    results.sort((a, b) => {
      const da = a.datum_objave ? new Date(a.datum_objave).getTime() : 0;
      const db = b.datum_objave ? new Date(b.datum_objave).getTime() : 0;
      return db - da;
    });

    return results;
  } catch (err) {
    console.error("read-listings error:", err);
    return [];
  }
});

// SAVE LISTING
ipcMain.handle(
  "save-listing",
  async (event, data: SaveListingData, folderPath: string, basePath: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { listing, images, isEdit } = data;

      const jsonPath = path.join(folderPath, `${listing.slug}.json`)
      const imageFolder = `${basePath}\\public\\vozila\\${listing.id}`;

      await fs.mkdir(imageFolder, { recursive: true });

      if (isEdit) {
        try {
          const oldImages = await fs.readdir(imageFolder);
          for (const img of oldImages) {
            await fs.unlink(path.join(imageFolder, img));
          }
        } catch {}
      }

      const imageNumbers: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const number = (i + 1).toString();
        const imagePath = path.join(imageFolder, `${number}.webp`);

        const base64 = images[i].data.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64, "base64");

        await sharp(buffer).webp({ quality: 85 }).toFile(imagePath);
        imageNumbers.push(number);
      }

      const updated: Listing = {
        ...listing,
        slike: imageNumbers.length ? imageNumbers : listing.slike,
      };

      console.log(jsonPath)

      await fs.writeFile(jsonPath, JSON.stringify(updated, null, 2), "utf-8");

      // GIT PUSH
      // const commitMessage = isEdit 
      //   ? `Ažuriran oglas: ${listing.marka} ${listing.model}` 
      //   : `Dodat oglas: ${listing.marka} ${listing.model}`;
      
      // await pushToGitHub(basePath, commitMessage);

      return { success: true };
    } catch (err: any) {
      console.error("save-listing error:", err);
      return { success: false, error: err.message };
    }
  }
);

// DELETE LISTING
ipcMain.handle("delete-listing", async (event, id: string, folderPath: string, basePath: string) => {
  try {
    console.log(folderPath)
    const jsonPath = path.join(folderPath, `${id}.json`);

    if (!fsSync.existsSync(jsonPath)) {
      return { success: false, error: "Listing not found" };
    }

    const raw = await fs.readFile(jsonPath, "utf-8");
    const listing = JSON.parse(raw);

    const carName = `${listing.marka} ${listing.model}`;

    listing.status = "prodato";

    await fs.writeFile(jsonPath, JSON.stringify(listing, null, 2), "utf-8");

    // GIT PUSH
    await pushToGitHub(basePath, `Obrisan oglas: ${carName}`);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

// GIT OPERATIONS
const pushToGitHub = async (basePath: string, message: string) => {
  try {
    const git: SimpleGit = simpleGit(basePath);
    
    // Proveri da li je git repo
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.log('Not a git repository:', basePath);
      return { success: false, error: 'Not a git repository' };
    }

    // Dodaj sve izmene
    await git.add('.');
    
    // Commit
    await git.commit(message);
    
    // Push na trenutni branch
    await git.push();
    
    console.log('Successfully pushed to GitHub:', message);
    return { success: true };
  } catch (err: any) {
    console.error('Git push error:', err);
    return { success: false, error: err.message };
  }
};

// SELECT FOLDER - JEDNOSTAVNO!
ipcMain.handle("select-data-folder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"],
    title: "Odaberi folder za podatke",
  });

  if (result.canceled) return null;

  return result.filePaths[0];
});