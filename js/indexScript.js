/**
 * MOTOR VETORIAL LIQUID GLASS COM CONTROLOS GLOBAIS E ÍMAN SUAVE (LERP)
 * Atualizado: Efeito de Luz de Proximidade Dinâmica nas Bordas
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. SISTEMA DE ALTERNÂNCIA DE TEMA
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn?.querySelector('.material-symbols-rounded');
    const bodyElement = document.body;

    const savedTheme = localStorage.getItem('evolution-theme');
    if (savedTheme === 'light') {
        bodyElement.classList.add('light-theme');
        if (themeIcon) themeIcon.textContent = 'dark_mode';
    } else {
        bodyElement.classList.remove('light-theme');
        if (themeIcon) themeIcon.textContent = 'light_mode';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isLightTheme = bodyElement.classList.toggle('light-theme');
            if (themeIcon) {
                themeIcon.style.transform = 'rotate(360deg)';
                themeIcon.textContent = isLightTheme ? 'dark_mode' : 'light_mode';
            }
            localStorage.setItem('evolution-theme', isLightTheme ? 'light' : 'dark');
        });
    }

    // ==========================================
    // 2. SISTEMA DE DESATIVAÇÃO DE BLUR
    // ==========================================
    const blurToggleBtn = document.getElementById('blur-toggle');
    const blurIcon = blurToggleBtn?.querySelector('.material-symbols-rounded');
    const container = document.querySelector('.blob-container');

    const savedBlur = localStorage.getItem('evolution-blur');
    if (savedBlur === 'disabled') {
        container.classList.add('no-blur');
        if (blurIcon) {
            blurIcon.textContent = 'blur_on';
            blurIcon.classList.add('active-off');
        }
    }

    if (blurToggleBtn) {
        blurToggleBtn.addEventListener('click', () => {
            const isBlurDisabled = container.classList.toggle('no-blur');
            if (blurIcon) {
                if (isBlurDisabled) {
                    blurIcon.textContent = 'blur_on';
                    blurIcon.classList.add('active-off');
                    localStorage.setItem('evolution-blur', 'disabled');
                } else {
                    blurIcon.textContent = 'blur_off';
                    blurIcon.classList.remove('active-off');
                    localStorage.setItem('evolution-blur', 'enabled');
                }
            }
        });
    }

    // ==========================================
    // 3. SISTEMA DE VISIBILIDADE DAS BOLAS DE FUNDO
    // ==========================================
    const visibilityToggleBtn = document.getElementById('visibility-toggle');
    const visibilityIcon = visibilityToggleBtn?.querySelector('.material-symbols-rounded');

    const savedVisibility = localStorage.getItem('evolution-visibility');
    if (savedVisibility === 'hidden') {
        container.classList.add('hide-blobs');
        if (visibilityIcon) {
            visibilityIcon.textContent = 'visibility_off';
            visibilityIcon.classList.add('active-off');
        }
    }

    if (visibilityToggleBtn) {
        visibilityToggleBtn.addEventListener('click', () => {
            const areBlobsHidden = container.classList.toggle('hide-blobs');
            if (visibilityIcon) {
                if (areBlobsHidden) {
                    visibilityIcon.textContent = 'visibility_off';
                    visibilityIcon.classList.add('active-off');
                    localStorage.setItem('evolution-visibility', 'hidden');
                } else {
                    visibilityIcon.textContent = 'visibility';
                    visibilityIcon.classList.remove('active-off');
                    localStorage.setItem('evolution-visibility', 'visible');
                }
            }
        });
    }

    // ==========================================
    // 4. MOTOR VETORIAL DE MOVIMENTO CONTÍNUO (BLOBS)
    // ==========================================
    const blobElements = document.querySelectorAll('.fluid-blob');
    const blobs = [];

    blobElements.forEach((el, index) => {
        const size = window.innerHeight * 0.55; 
        const radius = size / 2;

        let x = radius;
        let y = radius;
        if (index === 1) x = window.innerWidth - radius;
        if (index === 2) y = window.innerHeight - radius;
        if (index === 3) { x = window.innerWidth - radius; y = window.innerHeight - radius; }

        const speed = 1.5; 
        const angle = Math.random() * Math.PI * 2;

        blobs.push({
            element: el,
            radius: radius,
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed
        });
    });

    window.addEventListener('resize', () => {
        const size = window.innerHeight * 0.55;
        blobs.forEach(blob => {
            blob.radius = size / 2;
        });
    });

    // ==========================================
    // 5. MOTOR DO CURSOR COM SUAVIZAÇÃO MATEMÁTICA (LERP)
    // ==========================================
    const blobCursor = document.querySelector('.blob-cursor');
    const magneticElements = document.querySelectorAll('.sub-box, #theme-toggle, #blur-toggle, #visibility-toggle');

    let realMouseX = 0;
    let realMouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let cursorX = 0;
    let cursorY = 0;

    let targetWidth = 0;
    let targetHeight = 0;
    let currentWidth = 0;
    let currentHeight = 0;

    let isHovering = false;
    const easeFactor = 0.12; 

    function updateBaseTargetDimensions() {
        const baseSize = window.innerHeight * 0.25;
        if (currentWidth === 0) {
            currentWidth = baseSize;
            currentHeight = baseSize;
        }
        if (!isHovering) {
            targetWidth = baseSize;
            targetHeight = baseSize;
        }
    }
    updateBaseTargetDimensions();
    window.addEventListener('resize', updateBaseTargetDimensions);

    window.addEventListener('mousemove', (e) => {
        realMouseX = e.clientX;
        realMouseY = e.clientY;
        
        if (!isHovering) {
            targetX = realMouseX - targetWidth / 2;
            targetY = realMouseY - targetHeight / 2;
        }
    });

    magneticElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            isHovering = true;
            if (blobCursor) blobCursor.classList.add('hovering');
            
            const rect = element.getBoundingClientRect();
            targetWidth = rect.width;
            targetHeight = rect.height;
            targetX = rect.left;
            targetY = rect.top;
        });

        element.addEventListener('mousemove', (e) => {
            if (!isHovering || !blobCursor) return;
            const rect = element.getBoundingClientRect();
            
            targetX = rect.left;
            targetY = rect.top;

            // 1. Injeta variáveis relativas (%) para o Cursor Elástico
            const localX = ((e.clientX - rect.left) / rect.width) * 100;
            const localY = ((e.clientY - rect.top) / rect.height) * 100;
            blobCursor.style.setProperty('--mouse-x', `${localX}%`);
            blobCursor.style.setProperty('--mouse-y', `${localY}%`);

            // 2. 🌟 Injeta variáveis absolutas (px) no próprio botão para a Borda Dinâmica
            const pixelX = e.clientX - rect.left;
            const pixelY = e.clientY - rect.top;
            element.style.setProperty('--mouse-x', `${pixelX}px`);
            element.style.setProperty('--mouse-y', `${pixelY}px`);
        });

        element.addEventListener('mouseleave', () => {
            isHovering = false;
            if (blobCursor) {
                blobCursor.classList.remove('hovering');
                blobCursor.style.removeProperty('--mouse-x');
                blobCursor.style.removeProperty('--mouse-y');
            }
            
            // 🌟 Limpa as variáveis do próprio botão ao sair
            element.style.removeProperty('--mouse-x');
            element.style.removeProperty('--mouse-y');
            
            const baseSize = window.innerHeight * 0.25;
            targetWidth = baseSize;
            targetHeight = baseSize;
            
            targetX = realMouseX - baseSize / 2;
            targetY = realMouseY - baseSize / 2;
        });
    });

    // ==========================================
    // 6. LOOP ÚNICO DE RENDERIZAÇÃO (PIPELINE GRÁFICO)
    // ==========================================
    function updateCorePipeline() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        blobs.forEach(blob => {
            blob.x += blob.vx;
            blob.y += blob.vy;

            if (blob.x - blob.radius < 0) {
                blob.x = blob.radius;
                blob.vx *= -1;
            } else if (blob.x + blob.radius > width) {
                blob.x = width - blob.radius;
                blob.vx *= -1;
            }

            if (blob.y - blob.radius < 0) {
                blob.y = blob.radius;
                blob.vy *= -1;
            } else if (blob.y + blob.radius > height) {
                blob.y = height - blob.radius;
                blob.vy *= -1;
            }

            blob.element.style.transform = `translate3d(${blob.x - blob.radius}px, ${blob.y - blob.radius}px, 0)`;
        });

        if (blobCursor) {
            cursorX += (targetX - cursorX) * easeFactor;
            cursorY += (targetY - cursorY) * easeFactor;
            
            currentWidth += (targetWidth - currentWidth) * easeFactor;
            currentHeight += (targetHeight - currentHeight) * easeFactor;

            blobCursor.style.width = `${currentWidth}px`;
            blobCursor.style.height = `${currentHeight}px`;
            blobCursor.style.marginTop = '0px';
            blobCursor.style.marginLeft = '0px';
            
            blobCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
        }

        requestAnimationFrame(updateCorePipeline);
    }

    requestAnimationFrame(updateCorePipeline);
});