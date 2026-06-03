export function initAccessibility() {
    const toggleBtn = document.getElementById('btn-ac-toggle');
    const panel = document.getElementById('ac-panel-menu');
    
    if (toggleBtn && panel) {
        toggleBtn.onclick = () => {
            panel.classList.toggle('active');
        };
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#ac-widget-container')) panel.classList.remove('active');
        });
    }

    const body = document.body;
    const btnContrast = document.getElementById('btn-contrast');
    const btnIncrease = document.getElementById('btn-increase');
    const btnDecrease = document.getElementById('btn-decrease');
    const btnOriginal = document.getElementById('btn-original');
    const btnTheme = document.getElementById('btn-theme');

    // 0. Tema Escuro
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        if (btnTheme) btnTheme.innerHTML = '<i class="fa-solid fa-sun" aria-hidden="true"></i>';
    }

    if (btnTheme) {
        btnTheme.onclick = () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            if (isDark) {
                localStorage.setItem('theme', 'dark');
                btnTheme.innerHTML = '<i class="fa-solid fa-sun" aria-hidden="true"></i>';
                btnTheme.setAttribute('aria-label', 'Modo Claro');
                btnTheme.setAttribute('title', 'Modo Claro');
            } else {
                localStorage.setItem('theme', 'light');
                btnTheme.innerHTML = '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
                btnTheme.setAttribute('aria-label', 'Modo Escuro');
                btnTheme.setAttribute('title', 'Modo Escuro');
            }
        };
    }

    // 1. Alto Contraste
    if (btnContrast) {
        btnContrast.onclick = () => {
            body.classList.toggle('high-contrast');
            if (body.classList.contains('high-contrast')) {
                localStorage.setItem('highContrast', 'true');
            } else {
                localStorage.removeItem('highContrast');
            }
        };
    }

    // 2. Tamanho da Fonte
    let currentFontSize = parseInt(localStorage.getItem('fontSize')) || 100;
    document.documentElement.style.fontSize = currentFontSize + '%';

    function updateFontSize(size) {
        document.documentElement.style.fontSize = size + '%';
        localStorage.setItem('fontSize', size);
    }

    if (btnIncrease) {
        btnIncrease.onclick = () => {
            if (currentFontSize < 150) {
                currentFontSize += 10;
                updateFontSize(currentFontSize);
            }
        };
    }
    if (btnDecrease) {
        btnDecrease.onclick = () => {
            if (currentFontSize > 70) {
                currentFontSize -= 10;
                updateFontSize(currentFontSize);
            }
        };
    }
    if (btnOriginal) {
        btnOriginal.onclick = () => {
            currentFontSize = 100;
            updateFontSize(currentFontSize);
            localStorage.removeItem('fontSize');
        };
    }
}
