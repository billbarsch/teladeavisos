window.addEventListener('DOMContentLoaded', () => {
    // Previne qualquer interação com o mouse
    document.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, true);

    // Previne interações com o teclado
    document.addEventListener('keydown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, true);
}); 