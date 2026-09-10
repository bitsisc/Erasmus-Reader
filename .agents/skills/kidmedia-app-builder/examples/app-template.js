// Example Boilerplate: Kidmedia ES Module Structure

// ==========================================
// 1. js/state.js
// ==========================================
export const state = {
    currentLang: 'el',
    mode: 'setup',           // 'setup' | 'play' | 'score'
    scanOn: false,
    scanSpeed: 2.5,          // seconds
    scanLevel: 1,
    scanCurrentIndex: -1,
    teacherEmail: '',
    // App-specific properties
};

// ==========================================
// 2. js/i18n.js
// ==========================================
import { state } from './state.js';

export let i18n = {};

export async function loadTranslations() {
    const res = await fetch('i18n/translations.json');
    i18n = await res.json();
}

export function applyLanguage(lang) {
    if (!i18n[lang]) return;
    state.currentLang = lang;
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key]) {
            el.textContent = i18n[lang][key];
        }
    });
}

// ==========================================
// 3. js/events.js
// ==========================================
import { state } from './state.js';
import { applyLanguage } from './i18n.js';

export function initEvents() {
    // Scanning, keyboard controls, setup inputs
}

// ==========================================
// 4. js/main.js
// ==========================================
import { state } from './state.js';
import { loadTranslations, applyLanguage } from './i18n.js';
import { initEvents } from './events.js';

async function initApp() {
    await loadTranslations();
    applyLanguage(state.currentLang);
    initEvents();
    
    // Hash routing / Student bootstrapping
    const hash = window.location.hash.substring(1);
    if (hash) {
        const params = hash.split(';');
        if (params.length > 0) {
            // deserialize settings and bypass setup screen
        }
    }
}

window.addEventListener('DOMContentLoaded', initApp);
