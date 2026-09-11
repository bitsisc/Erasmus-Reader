// js/pwa.js - Kidmedia 1-Click PWA Manager

let deferredPrompt = null;

function isPwaStandalone() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
           (window.navigator.standalone === true) ||
           (document.referrer && document.referrer.includes('android-app://'));
}

function isIosDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 1 && window.innerWidth <= 1024);
}

function showPwaButtons() {
    if (isPwaStandalone()) {
        hidePwaButtons();
        return;
    }
    document.querySelectorAll('.pwa-btn').forEach(btn => {
        btn.style.display = 'inline-flex';
    });
}

function hidePwaButtons() {
    document.querySelectorAll('.pwa-btn').forEach(btn => {
        btn.style.display = 'none';
    });
}

function openPwaModal() {
    const modal = document.getElementById('pwa-modal');
    if (!modal) return;
    
    const iosGuide = document.getElementById('pwa-guide-ios');
    const androidGuide = document.getElementById('pwa-guide-android');
    const btnDirectInstall = document.getElementById('btn-pwa-modal-install');

    if (isIosDevice()) {
        if (iosGuide) iosGuide.style.display = 'block';
        if (androidGuide) androidGuide.style.display = 'none';
        if (btnDirectInstall) btnDirectInstall.style.display = 'none';
    } else {
        if (iosGuide) iosGuide.style.display = 'none';
        if (androidGuide) androidGuide.style.display = 'block';
        if (btnDirectInstall) {
            btnDirectInstall.style.display = deferredPrompt ? 'inline-block' : 'none';
        }
    }

    modal.style.display = 'flex';
}

function closePwaModal() {
    const modal = document.getElementById('pwa-modal');
    if (modal) modal.style.display = 'none';
}

async function triggerPwaInstall() {
    if (deferredPrompt) {
        try {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('[PWA] User accepted installation prompt');
                hidePwaButtons();
                closePwaModal();
            }
        } catch (err) {
            console.warn('[PWA] Error triggering prompt:', err);
            openPwaModal();
        }
        deferredPrompt = null;
    } else {
        openPwaModal();
    }
}

function initPwa() {
    // 1. Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => {
                    console.log('[PWA] Service Worker registered. Scope:', reg.scope);
                })
                .catch(err => {
                    console.warn('[PWA] Service Worker registration failed:', err);
                });
        });
    }

    // 2. Capture install prompt (Chrome / Android / Edge)
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showPwaButtons();
    });

    // 3. Handlers for UI buttons
    document.querySelectorAll('.pwa-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            triggerPwaInstall();
        });
    });

    const btnDirectInstall = document.getElementById('btn-pwa-modal-install');
    if (btnDirectInstall) {
        btnDirectInstall.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            triggerPwaInstall();
        });
    }

    const btnClosePwa = document.getElementById('btn-close-pwa');
    if (btnClosePwa) {
        btnClosePwa.addEventListener('click', closePwaModal);
    }
    const btnClosePwaCorner = document.getElementById('btn-close-pwa-corner');
    if (btnClosePwaCorner) {
        btnClosePwaCorner.addEventListener('click', closePwaModal);
    }

    // 4. Listen for appinstalled
    window.addEventListener('appinstalled', () => {
        console.log('[PWA] Application installed successfully');
        hidePwaButtons();
        closePwaModal();
        deferredPrompt = null;
    });

    // 5. Display check:
    // If standalone -> always hide
    // If mobile device -> show button so user can install (either direct or via guide)
    // If desktop -> only show if beforeinstallprompt fired (handled in listener)
    if (isPwaStandalone()) {
        hidePwaButtons();
    } else if (isMobileDevice()) {
        showPwaButtons();
    } else {
        hidePwaButtons();
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPwa);
} else {
    initPwa();
}
