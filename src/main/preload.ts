import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

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

interface ElectronAPI {
  readListings: (folderPath: string) => Promise<Listing[]>;
  saveListing: (data: SaveListingData, folderPath: string, basePath: string) => Promise<{ success: boolean; error?: string }>;
  deleteListing: (id: string, folderPath: string, basePath: string) => Promise<{ success: boolean; error?: string }>;
  selectDataFolder: () => Promise<string | null>;
  readImage: (imagePath: string) => Promise<string | null>;
}

const electronAPI: ElectronAPI = {
  readListings: (folderPath: string) => ipcRenderer.invoke('read-listings', folderPath),
  saveListing: (data, folderPath, basePath) => ipcRenderer.invoke('save-listing', data, folderPath, basePath),
  deleteListing: (id, folderPath, basePath) => ipcRenderer.invoke('delete-listing', id, folderPath, basePath),
  selectDataFolder: () => ipcRenderer.invoke('select-data-folder'),
  readImage: (imagePath: string) => ipcRenderer.invoke('read-image', imagePath),
};

const ipcRendererHandler = {
  sendMessage(channel: string, ...args: unknown[]) {
    ipcRenderer.send(channel, ...args);
  },
  on(channel: string, func: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => func(...args);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  },
  once(channel: string, func: (...args: unknown[]) => void) {
    ipcRenderer.once(channel, (_event, ...args) => func(...args));
  },
  receive(channel: string, func: (...args: unknown[]) => void) {
    ipcRenderer.on(channel, (_event, ...args) => func(...args));
  },
};

contextBridge.exposeInMainWorld('electron', {
  ...electronAPI,
  ipcRenderer: ipcRendererHandler,
});

// Type declaration
declare global {
  interface Window {
    electron: typeof electronAPI & { ipcRenderer: typeof ipcRendererHandler };
  }
}