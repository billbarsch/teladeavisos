const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const fs = require('fs');

const PLAYLIST_URL = 'https://www.youtube.com/embed/OlHbxpG_vh0?list=PL2iT-_cw7fDVHb7RoI35TSvQSdIexOa9g&autoplay=1&loop=1&controls=0';
const CONFIG_FILE = path.join(app.getPath('userData'), 'config.json');

let mainWindow = null;
let isOnline = true;

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

    // Encontra o monitor que contém o centro da janela
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

function createWindow() {
    const displays = screen.getAllDisplays();
    const config = loadConfig();

    // Verifica se o índice do monitor salvo ainda é válido
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
        }
    });

    // Salva o monitor atual quando a janela é criada
    const currentDisplay = getCurrentDisplay();
    saveConfig({ lastDisplay: currentDisplay });

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
        e.preventDefault();
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
        setTimeout(loadContent, 5000); // Tenta recarregar após 5 segundos
    });
}

// Função para carregar/recarregar o conteúdo
function loadContent() {
    if (mainWindow) {
        mainWindow.loadURL(PLAYLIST_URL).catch(error => {
            console.log('Erro ao carregar:', error);
            setTimeout(loadContent, 5000); // Tenta novamente após 5 segundos
        });
    }
}

// Monitor de conectividade
function setupConnectivityMonitoring() {
    // Verifica a conexão a cada 5 segundos
    setInterval(() => {
        require('dns').lookup('www.youtube.com', (err) => {
            const wasOnline = isOnline;
            isOnline = !err;

            // Se voltou a ficar online
            if (!wasOnline && isOnline) {
                console.log('Conexão restaurada, recarregando...');
                loadContent();
            }
            // Se ficou offline
            else if (wasOnline && !isOnline) {
                console.log('Conexão perdida, aguardando...');
            }
        });
    }, 5000);
}

app.whenReady().then(() => {
    createWindow();
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