import {
  app,
  Menu,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu(): Menu {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: 'Velbo Automobili',
      submenu: [
        {
          label: 'O Aplikaciji',
          selector: 'orderFrontStandardAboutPanel:',
        },
        { type: 'separator' },
        {
          label: 'Podesi Folder za Podatke',
          accelerator: 'Command+Shift+F',
          click: () => {
            this.mainWindow.webContents.send('open-folder-selector');
          },
        },
        { type: 'separator' },
        {
          label: 'Sakrij',
          accelerator: 'Command+H',
          selector: 'hide:',
        },
        {
          label: 'Sakrij Ostalo',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:',
        },
        { label: 'Prikaži Sve', selector: 'unhideAllApplications:' },
        { type: 'separator' },
        {
          label: 'Izađi',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    };
    
    const subMenuEdit: DarwinMenuItemConstructorOptions = {
      label: 'Izmeni',
      submenu: [
        { label: 'Poništi', accelerator: 'Command+Z', selector: 'undo:' },
        { label: 'Ponovi', accelerator: 'Shift+Command+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Iseci', accelerator: 'Command+X', selector: 'cut:' },
        { label: 'Kopiraj', accelerator: 'Command+C', selector: 'copy:' },
        { label: 'Nalepi', accelerator: 'Command+V', selector: 'paste:' },
        {
          label: 'Selektuj Sve',
          accelerator: 'Command+A',
          selector: 'selectAll:',
        },
      ],
    };
    
    const subMenuViewDev: MenuItemConstructorOptions = {
      label: 'Prikaz',
      submenu: [
        {
          label: 'Osvezi',
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: 'Ceo Ekran',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: 'Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    };
    
    const subMenuViewProd: MenuItemConstructorOptions = {
      label: 'Prikaz',
      submenu: [
        {
          label: 'Ceo Ekran',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
      ],
    };
    
    const subMenuWindow: DarwinMenuItemConstructorOptions = {
      label: 'Prozor',
      submenu: [
        {
          label: 'Minimizuj',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:',
        },
        { label: 'Zatvori', accelerator: 'Command+W', selector: 'performClose:' },
        { type: 'separator' },
        { label: 'Prikaži Sve', selector: 'arrangeInFront:' },
      ],
    };

    const subMenuView =
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
        ? subMenuViewDev
        : subMenuViewProd;

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow];
  }

  buildDefaultTemplate(): MenuItemConstructorOptions[] {
    const templateDefault: MenuItemConstructorOptions[] = [
      {
        label: '&Fajl',
        submenu: [
          {
            label: 'Podesi &Folder za Podatke',
            accelerator: 'Ctrl+Shift+F',
            click: () => {
              this.mainWindow.webContents.send('open-folder-selector');
            },
          },
          { type: 'separator' },
          {
            label: '&Zatvori',
            accelerator: 'Ctrl+W',
            click: () => {
              this.mainWindow.close();
            },
          },
        ],
      },
      {
        label: '&Prikaz',
        submenu:
          process.env.NODE_ENV === 'development' ||
          process.env.DEBUG_PROD === 'true'
            ? [
                {
                  label: '&Osvezi',
                  accelerator: 'Ctrl+R',
                  click: () => {
                    this.mainWindow.webContents.reload();
                  },
                },
                {
                  label: 'Ceo &Ekran',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen(),
                    );
                  },
                },
              ]
            : [
                {
                  label: 'Ceo &Ekran',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen(),
                    );
                  },
                },
              ],
      },
    ];

    return templateDefault;
  }
}