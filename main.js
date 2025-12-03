const { app, BrowserWindow, screen, Tray, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let FOLDER_PATH = ''; // Caminho da pasta de vídeos
let BLOCK_CLICKS = true; // Por padrão, bloqueia cliques
let AUTO_RELOAD_ENABLED = true; // Por padrão, ativa o reload automático
let AUTO_RELOAD_HOURS = 8; // Por padrão, recarrega a cada 8 horas
const CONFIG_FILE = path.join(app.getPath('userData'), 'config.json');

// Variáveis para controle de vídeos locais
let videoFiles = []; // Lista de arquivos de vídeo
let currentVideoIndex = 0; // Índice do vídeo atual
let folderWatcher = null; // Watcher para monitorar mudanças na pasta

let mainWindow = null;
let configWindow = null;
let tray = null;
let autoReloadTimer = null; // Timer para controlar o reload automático

// Define o nome do aplicativo
app.setName('Tela de Avisos');

// Função para carregar a configuração
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const fileContent = fs.readFileSync(CONFIG_FILE, 'utf8');

            // Verifica se o arquivo não está vazio
            if (fileContent && fileContent.trim() !== '') {
                try {
                    const config = JSON.parse(fileContent);

                    // Atualiza as variáveis globais com as configurações carregadas
                    if (config.folderPath) {
                        FOLDER_PATH = config.folderPath;
                    }
                    if (config.blockClicks !== undefined) {
                        BLOCK_CLICKS = config.blockClicks;
                    }
                    if (config.autoReloadEnabled !== undefined) {
                        AUTO_RELOAD_ENABLED = config.autoReloadEnabled;
                    }
                    if (config.autoReloadHours !== undefined && config.autoReloadHours > 0) {
                        AUTO_RELOAD_HOURS = config.autoReloadHours;
                    }

                    return config;
                } catch (parseError) {
                    // Ignora erro de parsing
                }
            }
        }
    } catch (error) {
        // Ignora erro ao carregar configuração
    }

    // Configuração padrão se não conseguimos carregar do arquivo
    return {
        lastDisplay: 0,
        blockClicks: true,
        autoReloadEnabled: true,
        autoReloadHours: 8
    };
}

// Função para obter extensões de vídeo suportadas
function getVideoExtensions() {
    return ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.m4v', '.3gp', '.ogv'];
}

// Função para ler vídeos de uma pasta
function getVideoFilesFromFolder(folderPath) {
    try {
        if (!fs.existsSync(folderPath)) {
            return [];
        }

        const files = fs.readdirSync(folderPath);
        const videoExtensions = getVideoExtensions();

        const videoFiles = files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return videoExtensions.includes(ext);
            })
            .map(file => path.join(folderPath, file))
            .sort(); // Ordena alfabeticamente

        return videoFiles;
    } catch (error) {
        return [];
    }
}

// Função para monitorar mudanças na pasta
function watchFolder(folderPath) {
    // Remove watcher anterior se existir
    if (folderWatcher) {
        folderWatcher.close();
        folderWatcher = null;
    }

    if (!folderPath || !fs.existsSync(folderPath)) {
        return;
    }

    try {
        folderWatcher = fs.watch(folderPath, (eventType, filename) => {
            console.log(`Mudança detectada na pasta: ${eventType} - ${filename}`);
            // Aguarda um pouco antes de recarregar para garantir que o arquivo foi completamente escrito
            setTimeout(() => {
                // Recarrega a lista de vídeos quando há mudanças
                const oldCount = videoFiles.length;
                videoFiles = getVideoFilesFromFolder(folderPath);
                const newCount = videoFiles.length;

                console.log(`Lista de vídeos atualizada: ${oldCount} -> ${newCount} vídeos`);

                // Atualiza a lista de vídeos
                if (mainWindow) {
                    updateVideoList();
                }
            }, 500); // Aguarda 500ms antes de atualizar
        });
        console.log('Monitoramento da pasta ativado:', folderPath);
    } catch (error) {
        console.error('Erro ao monitorar pasta:', error);
    }
}

// Função para atualizar a lista de vídeos no player
function updateVideoList() {
    if (!mainWindow) return;

    // Envia a lista atualizada via IPC
    mainWindow.webContents.send('load-video-files', videoFiles);
}

// Função para salvar a configuração
function saveConfig(config) {
    try {
        let currentConfig = {};

        // Tenta ler a configuração atual, se existir
        if (fs.existsSync(CONFIG_FILE)) {
            try {
                currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
            } catch (parseError) {
                // Em caso de erro de parsing, usamos um objeto vazio
                currentConfig = {};
            }
        }

        // Mesclamos a configuração atual com a nova
        const newConfig = { ...currentConfig, ...config };

        // Salvamos no arquivo
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig));
    } catch (error) {
        // Ignora erro ao salvar configuração
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
        } else {
            // Fecha o watcher da pasta quando o app está fechando
            if (folderWatcher) {
                folderWatcher.close();
                folderWatcher = null;
            }
        }
    });

    // Carrega o conteúdo (vídeos da pasta)
    loadContent();

    // Desabilita o menu
    mainWindow.setMenu(null);

    // Mantém a janela sempre no topo
    mainWindow.setAlwaysOnTop(true, 'screen-saver');

    // Monitor de falhas de carregamento
    mainWindow.webContents.on('did-fail-load', () => {
        setTimeout(loadContent, 5000);
    });
}

// Função para carregar/recarregar o conteúdo
function loadContent() {
    if (mainWindow) {
        // Carrega a página HTML base
        mainWindow.loadFile(path.join(__dirname, 'player.html')).catch(error => {
            setTimeout(loadContent, 5000);
        });

        // Após carregar a página base, configuramos o conteúdo
        mainWindow.webContents.once('did-finish-load', () => {
            // Modo pasta do sistema
            videoFiles = getVideoFilesFromFolder(FOLDER_PATH);

            if (videoFiles.length === 0) {
                mainWindow.webContents.executeJavaScript(`
                    document.getElementById('video-container').innerHTML = 
                        '<div style="color: white; display: flex; align-items: center; justify-content: center; height: 100%; font-size: 24px;">Nenhum vídeo encontrado na pasta selecionada</div>';
                `).catch(() => { });
                return;
            }

            // Inicia o monitoramento da pasta
            watchFolder(FOLDER_PATH);

            // Envia a lista de vídeos via IPC (o player.html vai configurar o player)
            mainWindow.webContents.send('load-video-files', videoFiles);

            // Configurar os botões de navegação
            setTimeout(() => {
                mainWindow.webContents.executeJavaScript(`
                    if (window.electronAPI) {
                        document.getElementById('nav-btn-left').addEventListener('click', () => {
                            window.electronAPI.moveWindow('left');
                        });
                        
                        document.getElementById('nav-btn-right').addEventListener('click', () => {
                            window.electronAPI.moveWindow('right');
                        });
                    }
                `).catch(() => { });
            }, 1000);

            // Configurar o bloqueador de cliques baseado na configuração
            const configScript = BLOCK_CLICKS ?
                `
                const blocker = document.getElementById('click-blocker');
                if (blocker) {
                    blocker.classList.add('block-clicks');
                }
                ` :
                `
                const blocker = document.getElementById('click-blocker');
                if (blocker) {
                    blocker.classList.remove('block-clicks');
                }
                `;

            mainWindow.webContents.executeJavaScript(configScript)
                .catch(() => { });
        });
    }
}


// Adiciona flag para controlar o fechamento do app
app.isQuitting = false;

// Handler para seleção de pasta
ipcMain.on('select-folder', async (event) => {
    const result = await dialog.showOpenDialog(configWindow || null, {
        properties: ['openDirectory'],
        title: 'Selecione a pasta contendo os vídeos'
    });

    if (!result.canceled && result.filePaths.length > 0) {
        const selectedPath = result.filePaths[0];
        event.reply('folder-selected', selectedPath);
    }
});

// Configura os eventos IPC para comunicação com a janela de configurações
ipcMain.on('save-config', (event, config) => {
    // Atualiza as variáveis globais
    if (config.folderPath) {
        FOLDER_PATH = config.folderPath;
    }

    // Atualiza a configuração de bloqueio de cliques
    if (config.blockClicks !== undefined) {
        BLOCK_CLICKS = config.blockClicks;
        // Aplicar imediatamente ao mainWindow se existir
        if (mainWindow) {
            const script = BLOCK_CLICKS ?
                `
                const blocker = document.getElementById('click-blocker');
                if (blocker) {
                    blocker.classList.add('block-clicks');
                }
                ` :
                `
                const blocker = document.getElementById('click-blocker');
                if (blocker) {
                    blocker.classList.remove('block-clicks');
                }
                `;

            mainWindow.webContents.executeJavaScript(script)
                .catch(() => { });
        }
    }

    // Atualiza as configurações de reload automático
    if (config.autoReloadEnabled !== undefined) {
        AUTO_RELOAD_ENABLED = config.autoReloadEnabled;
    }

    if (config.autoReloadHours !== undefined && config.autoReloadHours > 0) {
        AUTO_RELOAD_HOURS = config.autoReloadHours;
    }

    // Salva as configurações atualizadas no arquivo
    saveConfig({
        folderPath: FOLDER_PATH,
        blockClicks: BLOCK_CLICKS,
        autoReloadEnabled: AUTO_RELOAD_ENABLED,
        autoReloadHours: AUTO_RELOAD_HOURS
    });

    // Reconfigura o timer de reload automático com as novas configurações
    setupAutoReload();

    // Recarrega o conteúdo para aplicar as novas configurações
    loadContent();

    // Fecha a janela de configurações
    if (configWindow) {
        configWindow.close();
    }
});

ipcMain.on('get-config', (event) => {
    event.reply('config-data', {
        folderPath: FOLDER_PATH,
        blockClicks: BLOCK_CLICKS,
        autoReloadEnabled: AUTO_RELOAD_ENABLED,
        autoReloadHours: AUTO_RELOAD_HOURS
    });
});

// Manipulador para mover a janela entre monitores
ipcMain.on('move-window', (event, direction) => {
    if (!mainWindow) return;

    const displays = screen.getAllDisplays();
    if (displays.length <= 1) {
        return;
    }

    const currentDisplay = getCurrentDisplay();
    let targetDisplayIndex;

    if (direction === 'left') {
        // Move para o monitor à esquerda (ou para o último se estiver no primeiro)
        targetDisplayIndex = currentDisplay > 0 ? currentDisplay - 1 : displays.length - 1;
    } else if (direction === 'right') {
        // Move para o monitor à direita (ou para o primeiro se estiver no último)
        targetDisplayIndex = currentDisplay < displays.length - 1 ? currentDisplay + 1 : 0;
    } else {
        return;
    }

    const targetDisplay = displays[targetDisplayIndex];

    // Move a janela para o monitor de destino
    mainWindow.setBounds({
        x: targetDisplay.bounds.x,
        y: targetDisplay.bounds.y,
        width: targetDisplay.bounds.width,
        height: targetDisplay.bounds.height
    });

    // Salva a nova posição nas configurações
    saveConfig({ lastDisplay: targetDisplayIndex });
});

// Função para configurar o timer de reload automático
function setupAutoReload() {
    // Limpa timer existente se houver
    if (autoReloadTimer) {
        clearInterval(autoReloadTimer);
        autoReloadTimer = null;
    }

    // Se o reload automático estiver desativado, retorna sem fazer nada
    if (!AUTO_RELOAD_ENABLED) {
        return;
    }

    // Converte horas para milissegundos
    const intervalMs = AUTO_RELOAD_HOURS * 60 * 60 * 1000;

    // Configura novo timer
    autoReloadTimer = setInterval(() => {
        if (mainWindow) {
            loadContent();
        }
    }, intervalMs);
}

app.on('ready', () => {
    // Carrega configurações antes de inicializar
    loadConfig();

    // Inicializa a janela principal
    createWindow();
    // Configura o tray icon
    createTray();
    // Inicia o sistema de auto-reload se estiver ativado
    if (AUTO_RELOAD_ENABLED) {
        setupAutoReload();
    }

    // Inicia o monitoramento da pasta se houver uma pasta configurada
    if (FOLDER_PATH) {
        watchFolder(FOLDER_PATH);
    }
});

app.on('window-all-closed', () => {
    // Fecha o watcher da pasta antes de fechar
    if (folderWatcher) {
        folderWatcher.close();
        folderWatcher = null;
    }

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
}); 