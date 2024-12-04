const { app, BrowserWindow, screen, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let PLAYLIST_URL = 'https://www.youtube.com/embed/OlHbxpG_vh0?list=PL2iT-_cw7fDVHb7RoI35TSvQSdIexOa9g&autoplay=1&loop=1&controls=0';
const CONFIG_FILE = path.join(app.getPath('userData'), 'config.json');

let mainWindow = null;
let configWindow = null;
let isOnline = true;
let tray = null;

// Define o nome do aplicativo
app.setName('Tela de Avisos');

// Função para carregar a configuração
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
            if (config.playlistUrl) {
                PLAYLIST_URL = config.playlistUrl;
            }
            return config;
        }
    } catch (error) {
        console.log('Erro ao carregar configuração:', error);
    }
    return { lastDisplay: 0 }; // Configuração padrão
}

// Função para salvar a configuração
function saveConfig(config) {
    try {
        const currentConfig = loadConfig();
        const newConfig = { ...currentConfig, ...config };
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig));
    } catch (error) {
        console.log('Erro ao salvar configuração:', error);
    }
}

// Função para criar a janela de configurações
function createConfigWindow() {
    if (configWindow) {
        configWindow.focus();
        return;
    }

    configWindow = new BrowserWindow({
        width: 600,
        height: 400,
        title: 'Configurações - Tela de Avisos',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'icon.png'),
        resizable: false,
        minimizable: false,
        maximizable: false,
        autoHideMenuBar: true,
        frame: false
    });

    configWindow.loadFile('config.html');

    configWindow.on('closed', () => {
        configWindow = null;
    });
}

// Função para identificar o monitor atual
function getCurrentDisplay() {
    if (!mainWindow) return 0;

    const windowBounds = mainWindow.getBounds();
    const displays = screen.getAllDisplays();

    const centerX = windowBounds.x + windowBounds.width / 2;
    const centerY = windowBounds.y + windowBounds.height / 2;

    const currentDisplay = displays.findIndex(display => {
        const bounds = display.bounds;
        return centerX >= bounds.x &&
            centerX <= bounds.x + bounds.width &&
            centerY >= bounds.y &&
            centerY <= bounds.y + bounds.height;
    });

    return currentDisplay !== -1 ? currentDisplay : 0;
}

// Função para criar o ícone na bandeja
function createTray() {
    tray = new Tray(path.join(__dirname, 'icon.png'));

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Configurações',
            click: () => {
                createConfigWindow();
            }
        },
        { type: 'separator' },
        {
            label: 'Fechar Tela de Avisos',
            click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);

    // Configura o menu de contexto
    tray.setContextMenu(contextMenu);
    tray.setToolTip('Tela de Avisos');

    // Adiciona clique esquerdo para abrir o menu
    tray.on('click', () => {
        tray.popUpContextMenu();
    });
}

function createWindow() {
    const displays = screen.getAllDisplays();
    const config = loadConfig();

    const targetDisplayIndex = config.lastDisplay < displays.length ? config.lastDisplay : 0;
    const targetDisplay = displays[targetDisplayIndex];

    mainWindow = new BrowserWindow({
        x: targetDisplay.bounds.x,
        y: targetDisplay.bounds.y,
        width: targetDisplay.bounds.width,
        height: targetDisplay.bounds.height,
        frame: false,
        fullscreen: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        title: 'Tela de Avisos'
    });

    // Define o título da janela
    mainWindow.setTitle('Tela de Avisos');

    // Monitora mudanças de posição e tamanho
    mainWindow.on('moved', () => {
        const currentDisplay = getCurrentDisplay();
        saveConfig({ lastDisplay: currentDisplay });
    });

    mainWindow.on('resize', () => {
        const currentDisplay = getCurrentDisplay();
        saveConfig({ lastDisplay: currentDisplay });
    });

    // Salva a configuração antes de fechar
    mainWindow.on('close', (e) => {
        if (!app.isQuitting) {
            e.preventDefault();
            const currentDisplay = getCurrentDisplay();
            saveConfig({ lastDisplay: currentDisplay });
        }
    });

    // Carrega a URL usando o modo de incorporação do YouTube
    loadContent();

    // Injeta CSS quando a página carregar
    mainWindow.webContents.on('did-finish-load', () => {
        const css = `
            body {
                margin: 0;
                padding: 0;
                overflow: hidden;
                background: black;
            }
            
            /* Força o iframe a ocupar toda a tela */
            iframe {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                border: none !important;
            }

            /* Camada de proteção contra cliques */
            body::after {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 999999;
                pointer-events: all;
                cursor: none;
            }
        `;
        mainWindow.webContents.insertCSS(css);
    });

    // Desabilita o menu
    mainWindow.setMenu(null);

    // Mantém a janela sempre no topo
    mainWindow.setAlwaysOnTop(true, 'screen-saver');

    // Esconde o cursor do mouse
    mainWindow.webContents.on('dom-ready', () => {
        mainWindow.webContents.insertCSS('* { cursor: none !important; }');
    });

    // Monitor de falhas de carregamento
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.log('Falha ao carregar:', errorDescription);
        setTimeout(loadContent, 5000);
    });
}

// Função para carregar/recarregar o conteúdo
function loadContent() {
    if (mainWindow) {
        mainWindow.loadURL(PLAYLIST_URL).catch(error => {
            console.log('Erro ao carregar:', error);
            setTimeout(loadContent, 5000);
        });
    }
}

// Monitor de conectividade
function setupConnectivityMonitoring() {
    setInterval(() => {
        require('dns').lookup('www.youtube.com', (err) => {
            const wasOnline = isOnline;
            isOnline = !err;

            if (!wasOnline && isOnline) {
                console.log('Conexão restaurada, recarregando...');
                loadContent();
            } else if (wasOnline && !isOnline) {
                console.log('Conexão perdida, aguardando...');
            }
        });
    }, 5000);
}

// Adiciona flag para controlar o fechamento do app
app.isQuitting = false;

// Configura os eventos IPC para comunicação com a janela de configurações
ipcMain.on('save-config', (event, config) => {
    if (config.playlistUrl) {
        PLAYLIST_URL = config.playlistUrl;
        saveConfig({ playlistUrl: config.playlistUrl });
        loadContent(); // Recarrega o conteúdo com a nova URL
        if (configWindow) {
            configWindow.close();
        }
    }
});

ipcMain.on('get-config', (event) => {
    event.reply('config-data', { playlistUrl: PLAYLIST_URL });
});

app.whenReady().then(() => {
    createWindow();
    createTray();
    setupConnectivityMonitoring();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
}); 