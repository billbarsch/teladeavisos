const { contextBridge, ipcRenderer } = require('electron');

// Log para verificar se o preload está sendo executado
console.log('Preload script iniciado');

// Expõe uma API limitada para o processo de renderização
contextBridge.exposeInMainWorld('electronAPI', {
    moveWindow: (direction) => {
        console.log(`Preload: moveWindow chamado com direção ${direction}`);
        ipcRenderer.send('move-window', direction);
    }
});

console.log('API exposta com sucesso:', 'moveWindow');

// Adiciona eventos assim que o DOM estiver pronto
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, configurando eventos básicos');

    // Monitorar clicks para permitir apenas nos botões de navegação quando o bloqueio estiver ativo
    document.addEventListener('click', (e) => {
        // Verificar se o elemento clicado é um dos botões de navegação
        const isNavigationButton = e.target.id === 'nav-btn-left' ||
            e.target.id === 'nav-btn-right' ||
            e.target.closest('#nav-btn-left') ||
            e.target.closest('#nav-btn-right');

        // Verificar se o bloqueador tem a classe de bloqueio
        const blocker = document.getElementById('click-blocker');
        const isBlockingEnabled = blocker && blocker.classList.contains('block-clicks');

        if (isBlockingEnabled && !isNavigationButton) {
            // Bloquear cliques fora dos botões de navegação quando o bloqueio está ativo
            console.log('Bloqueando clique:', e.target);
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, true);
}); 