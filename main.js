const { app, BrowserWindow, screen, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let PLAYLIST_URL = 'https://www.youtube.com/embed/OlHbxpG_vh0?list=PL2iT-_cw7fDVHb7RoI35TSvQSdIexOa9g&autoplay=1&loop=1&controls=0';
let BLOCK_CLICKS = true; // Por padrão, bloqueia cliques
let AUTO_RELOAD_ENABLED = true; // Por padrão, ativa o reload automático
let AUTO_RELOAD_HOURS = 8; // Por padrão, recarrega a cada 8 horas
const CONFIG_FILE = path.join(app.getPath('userData'), 'config.json');

let mainWindow = null;
let configWindow = null;
let isOnline = true;
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
                    if (config.playlistUrl) {
                        PLAYLIST_URL = config.playlistUrl;
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

                    console.log('Configuração carregada:', config);
                    return config;
                } catch (parseError) {
                    console.log('Erro ao analisar arquivo de configuração:', parseError);
                }
            } else {
                console.log('Arquivo de configuração está vazio');
            }
        } else {
            console.log('Arquivo de configuração não encontrado, usando padrões');
        }
    } catch (error) {
        console.log('Erro ao carregar configuração:', error);
    }

    // Configuração padrão se não conseguimos carregar do arquivo
    return {
        lastDisplay: 0,
        blockClicks: true,
        autoReloadEnabled: true,
        autoReloadHours: 8
    };
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
                console.log('Erro ao analisar o arquivo de configuração existente:', parseError);
                // Em caso de erro de parsing, usamos um objeto vazio
                currentConfig = {};
            }
        }

        // Mesclamos a configuração atual com a nova
        const newConfig = { ...currentConfig, ...config };

        // Salvamos no arquivo
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig));

        console.log('Configuração salva:', newConfig);
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

    // Desabilita o menu
    mainWindow.setMenu(null);

    // Mantém a janela sempre no topo
    mainWindow.setAlwaysOnTop(true, 'screen-saver');

    // Monitor de falhas de carregamento
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.log('Falha ao carregar:', errorDescription);
        setTimeout(loadContent, 5000);
    });
}

// Função para carregar/recarregar o conteúdo
function loadContent() {
    if (mainWindow) {
        // Carrega a página HTML base
        mainWindow.loadFile(path.join(__dirname, 'player.html')).catch(error => {
            console.log('Erro ao carregar página base:', error);
            setTimeout(loadContent, 5000);
        });

        // Após carregar a página base, configuramos o iframe e eventos
        mainWindow.webContents.once('did-finish-load', () => {
            console.log('Página base carregada, configurando iframe e eventos...');

            // Inserir o iframe diretamente
            mainWindow.webContents.executeJavaScript(`
                // Substituir o placeholder pelo iframe
                document.getElementById('video-container').innerHTML = '<iframe src="${PLAYLIST_URL}" frameborder="0" allowfullscreen allow="autoplay"></iframe>';
                console.log('Iframe inserido com sucesso');
            `).catch(err => console.error('Erro ao inserir iframe:', err));

            // Configurar os botões de navegação
            mainWindow.webContents.executeJavaScript(`
                // Configurar eventos para os botões de navegação
                document.getElementById('nav-btn-left').addEventListener('click', () => {
                    console.log('Botão esquerdo clicado');
                    window.electronAPI.moveWindow('left');
                });
                
                document.getElementById('nav-btn-right').addEventListener('click', () => {
                    console.log('Botão direito clicado');
                    window.electronAPI.moveWindow('right');
                });
                
                console.log('Eventos dos botões configurados');
            `).catch(err => console.error('Erro ao configurar eventos dos botões:', err));

            // Configurar o bloqueador de cliques baseado na configuração
            const configScript = BLOCK_CLICKS ?
                `
                // Aplicar classe de bloqueio
                const blocker = document.getElementById('click-blocker');
                if (blocker) {
                    blocker.classList.add('block-clicks');
                    console.log('Bloqueio de cliques ATIVADO');
                }
                ` :
                `
                // Remover classe de bloqueio
                const blocker = document.getElementById('click-blocker');
                if (blocker) {
                    blocker.classList.remove('block-clicks');
                    console.log('Bloqueio de cliques DESATIVADO');
                }
                `;

            mainWindow.webContents.executeJavaScript(configScript)
                .catch(err => console.error('Erro ao configurar bloqueador de cliques:', err));
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
    console.log('Recebendo novas configurações:', config);

    // Atualiza as variáveis globais
    if (config.playlistUrl) {
        PLAYLIST_URL = config.playlistUrl;
    }

    // Atualiza a configuração de bloqueio de cliques
    if (config.blockClicks !== undefined) {
        BLOCK_CLICKS = config.blockClicks;
        // Aplicar imediatamente ao mainWindow se existir
        if (mainWindow) {
            console.log('Atualizando configuração de bloqueio de cliques em tempo real:', BLOCK_CLICKS);
            const script = BLOCK_CLICKS ?
                `
                const blocker = document.getElementById('click-blocker');
                if (blocker) {
                    blocker.classList.add('block-clicks');
                    console.log('Bloqueio de cliques ATIVADO');
                }
                ` :
                `
                const blocker = document.getElementById('click-blocker');
                if (blocker) {
                    blocker.classList.remove('block-clicks');
                    console.log('Bloqueio de cliques DESATIVADO');
                }
                `;

            mainWindow.webContents.executeJavaScript(script)
                .catch(err => console.error('Erro ao atualizar bloqueio de cliques:', err));
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
        playlistUrl: PLAYLIST_URL,
        blockClicks: BLOCK_CLICKS,
        autoReloadEnabled: AUTO_RELOAD_ENABLED,
        autoReloadHours: AUTO_RELOAD_HOURS
    });

    console.log('Aplicando configurações: URL =', PLAYLIST_URL, 'Bloquear Cliques =', BLOCK_CLICKS,
        'Reload Automático =', AUTO_RELOAD_ENABLED, 'Intervalo (horas) =', AUTO_RELOAD_HOURS);

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
        playlistUrl: PLAYLIST_URL,
        blockClicks: BLOCK_CLICKS,
        autoReloadEnabled: AUTO_RELOAD_ENABLED,
        autoReloadHours: AUTO_RELOAD_HOURS
    });
});

// Manipulador para mover a janela entre monitores
ipcMain.on('move-window', (event, direction) => {
    if (!mainWindow) return;

    console.log(`Movendo janela para: ${direction}`);

    const displays = screen.getAllDisplays();
    if (displays.length <= 1) {
        console.log('Apenas um monitor detectado, não é possível mover.');
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

    console.log(`Janela movida para o monitor ${targetDisplayIndex}`);
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
        console.log('Reload automático desativado');
        return;
    }

    // Converte horas para milissegundos
    const intervalMs = AUTO_RELOAD_HOURS * 60 * 60 * 1000;

    console.log(`Configurando reload automático a cada ${AUTO_RELOAD_HOURS} hora(s) (${intervalMs}ms)`);

    // Configura novo timer
    autoReloadTimer = setInterval(() => {
        console.log(`Executando reload automático programado (intervalo: ${AUTO_RELOAD_HOURS} hora(s))`);
        if (mainWindow) {
            loadContent();
        }
    }, intervalMs);
}

app.on('ready', () => {
    // Inicializa a janela principal
    createWindow();
    // Configura o tray icon
    createTray();
    // Inicia o monitoramento de conectividade
    setupConnectivityMonitoring();
    // Inicia o sistema de auto-reload se estiver ativado
    if (AUTO_RELOAD_ENABLED) {
        setupAutoReload();
    }
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