const { app, BrowserWindow, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

const PLAYLIST_URL = 'https://www.youtube.com/embed/OlHbxpG_vh0?list=PL2iT-_cw7fDVHb7RoI35TSvQSdIexOa9g&autoplay=1&loop=1&controls=0';
const CONFIG_FILE = path.join(app.getPath('userData'), 'config.json');

let mainWindow = null;
let isOnline = true;
let tray = null;

// Define o nome do aplicativo
app.setName('Tela de Avisos');

// Função para criar o ícone da janela
function createWindowIcon() {
    const iconData = `
        <svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="24" y="44" width="208" height="168" rx="8" stroke="black" stroke-width="16"/>
            <line x1="24" y1="84" x2="232" y2="84" stroke="black" stroke-width="16"/>
            <circle cx="52" cy="64" r="8" fill="black"/>
            <circle cx="84" cy="64" r="8" fill="black"/>
            <circle cx="116" cy="64" r="8" fill="black"/>
        </svg>
    `;

    // Converte o SVG para PNG usando canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = `data:image/svg+xml;base64,${Buffer.from(iconData).toString('base64')}`;

    return nativeImage.createFromDataURL(img.src);
}

// Função para carregar a configuração
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
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
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config));
    } catch (error) {
        console.log('Erro ao salvar configuração:', error);
    }
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
    const icon = createWindowIcon();
    tray = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Fechar Tela de Avisos',
            click: () => {
                if (mainWindow) {
                    const currentDisplay = getCurrentDisplay();
                    saveConfig({ lastDisplay: currentDisplay });
                }
                app.exit(0);
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

    const icon = createWindowIcon();

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
        title: 'Tela de Avisos',
        icon: icon
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
        const currentDisplay = getCurrentDisplay();
        saveConfig({ lastDisplay: currentDisplay });
        if (!app.isQuitting) {
            e.preventDefault();
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

app.whenReady().then(() => {
    createWindow();
    createTray();
    setupConnectivityMonitoring();
});

app.on('before-quit', () => {
    app.isQuitting = true;
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