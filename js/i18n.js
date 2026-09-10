// js/i18n.js

let i18n = {};

function getText(key) {
    const lang = (typeof currentLang !== 'undefined' && currentLang) ? currentLang : 'el';
    if (i18n && i18n[lang] && i18n[lang][key]) return i18n[lang][key];
    if (i18n && i18n['en'] && i18n['en'][key]) return i18n['en'][key];
    if (i18n && i18n['el'] && i18n['el'][key]) return i18n['el'][key];
    return key;
}
window.getText = getText;

async function loadTranslations() {
    try {
        const response = await fetch('i18n/translations.json');
        i18n = await response.json();
    } catch(e) {
        console.error("Failed to load translations:", e);
    }
}

function applyLanguage(lang) {
    if (!i18n[lang]) return;
    const t = i18n[lang];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = t[key];
            } else if (key === 'instructions_html' || key === 'warning_chirp_desc' || key === 'help_modal_content_html' || key === 'dict_guide_html' || key === 'modal_api_info_html') {
                el.innerHTML = t[key];
            } else {
                el.textContent = t[key];
            }
        }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (t[key]) {
            el.title = t[key];
        }
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (t[key]) {
            el.placeholder = t[key];
        }
    });

    localStorage.setItem('readingToolLang', lang);
    if (typeof setCookie === 'function') {
        setCookie('readingToolLang', lang);
    }
    currentLang = lang;
    
    // Update top-right language button flag dynamically
    const langObj = europeanLanguages.find(l => l.code === lang);
    if (langObj) {
        const flagSpan = document.getElementById('current-lang-flag');
        if (flagSpan) {
            flagSpan.className = `fi fi-${langObj.iso}`;
        }
    }
    
    // Update active flag UI
    document.querySelectorAll('.lang-flag').forEach(img => {
        img.classList.remove('active');
        if(img.getAttribute('data-lang') === lang) {
            img.classList.add('active');
        }
    });
    
    // Update persistent footer EU flag & disclaimer on Screen 1
    const uiEuFlag = document.getElementById('ui-eu-flag');
    const uiEuDisclaimer = document.getElementById('ui-eu-disclaimer');
    if (typeof euFlagImgs !== 'undefined' && typeof euDisclaimers !== 'undefined') {
        if (uiEuFlag) uiEuFlag.src = `images/${euFlagImgs[lang] || euFlagImgs['el']}`;
        if (uiEuDisclaimer) uiEuDisclaimer.textContent = euDisclaimers[lang] || euDisclaimers['el'];
    }

    const scanSpeedEl = document.getElementById('scan-speed-val');
    if (scanSpeedEl && typeof state !== 'undefined' && state.scanSpeed) {
        scanSpeedEl.textContent = state.scanSpeed + ' ' + (t['unit_seconds_short'] || 'sec');
    }

    const dictBadge = document.getElementById('dict-count-badge');
    if (dictBadge && typeof totalDetectedImages !== 'undefined') {
        dictBadge.textContent = `${totalDetectedImages} ${t['dict_count_badge_unit'] || 'images'}`;
    }

    if (typeof loadWordDictionary === 'function') {
        loadWordDictionary(lang);
    }
    populateVoices();
    if (typeof loadPremiumVoices === 'function' && getActualApiKey() !== '') {
        loadPremiumVoices();
    }
    if (typeof updateLockUI === 'function') updateLockUI();
    if (typeof updateUsageUI === 'function') updateUsageUI();
    if (typeof updateSttUsageUI === 'function') updateSttUsageUI();
    updateFontSelectForLanguage(lang);
}

function updateFontSelectForLanguage(lang) {
    const fontSelect = document.getElementById('set-font');
    if (!fontSelect) return;

    const previousVal = fontSelect.value;

    const commonFonts = [
        { label: 'Open Sans', value: "'Open Sans', sans-serif" },
        { label: 'Google Sans / Roboto', value: "'Roboto', sans-serif" },
        { label: 'Vollkorn', value: "'Vollkorn', serif" },
        { label: 'Playpen Sans', value: "'Playpen Sans', cursive" },
        { label: 'Libertinus Sans', value: "'Libertinus Sans', sans-serif" },
        { label: 'Libertinus Serif', value: "'Libertinus Serif', serif" },
        { label: 'CMU Sans Serif', value: "'CMU Sans Serif', sans-serif" },
        { label: 'Noto Sans', value: "'Noto Sans', sans-serif" },
        { label: 'Verdana', value: "'Verdana', sans-serif" },
        { label: 'Arial', value: "'Arial', sans-serif" },
        { label: 'Tahoma', value: "'Tahoma', sans-serif" },
        { label: 'Century Gothic', value: "'Century Gothic', sans-serif" }
    ];

    let options = [];

    if (lang === 'el') {
        // Greek: Kids.ttf and OpenDyslexic (Kidmedia) ONLY in Greek + Comic Neue + app fonts
        options = [
            { label: 'OpenDyslexic (Kidmedia)', value: "'OpenDyslexic', 'OpenDyslexicRegular', sans-serif" },
            { label: 'Kidmedia (Kids)', value: "'Kids', cursive" },
            { label: 'Comic Sans / Neue', value: "'Comic Neue', 'Comic Sans MS', cursive" },
            ...commonFonts
        ];
    } else if (lang === 'bg') {
        // Cyrillic: Official OpenDyslexic + Adys and PT Sans + common fonts
        options = [
            { label: 'OpenDyslexic', value: "'OpenDyslexicOfficial', 'OpenDyslexic', sans-serif" },
            { label: 'Adys (Dyslexia BG)', value: "'Adys', sans-serif" },
            { label: 'PT Sans', value: "'PT Sans', sans-serif" },
            { label: 'Fira Sans', value: "'Fira Sans', sans-serif" },
            ...commonFonts
        ];
    } else {
        // Latin: Official OpenDyslexic + Lexend + Comic Neue + common fonts
        options = [
            { label: 'OpenDyslexic', value: "'OpenDyslexicOfficial', 'OpenDyslexic', sans-serif" },
            { label: 'Lexend', value: "'Lexend', sans-serif" },
            { label: 'Comic Sans / Neue', value: "'Comic Neue', 'Comic Sans MS', cursive" },
            { label: 'Fira Sans', value: "'Fira Sans', sans-serif" },
            ...commonFonts
        ];
    }

    const customOption = Array.from(fontSelect.options).find(opt => opt.getAttribute('data-custom') === 'true');

    fontSelect.innerHTML = '';
    if (customOption) fontSelect.appendChild(customOption);

    options.forEach(opt => {
        const el = document.createElement('option');
        el.value = opt.value;
        el.textContent = opt.label;
        fontSelect.appendChild(el);
    });

    let selectedOption = Array.from(fontSelect.options).find(opt => opt.value === previousVal);
    if (!selectedOption && previousVal && previousVal.includes('OpenDyslexic')) {
        selectedOption = Array.from(fontSelect.options).find(opt => opt.value.includes('OpenDyslexic'));
    }
    if (selectedOption) {
        fontSelect.value = selectedOption.value;
    } else {
        fontSelect.selectedIndex = 0;
    }

    if (typeof state !== 'undefined' && state) {
        state.fontFamily = fontSelect.value;
        const displayRoot = document.getElementById('screen-reading') || document.documentElement;
        if (displayRoot) {
            displayRoot.style.setProperty('--dynamic-font-family', state.fontFamily);
        }
    }
}

function initLanguageUI() {
    const selector = document.getElementById('flag-container');
    selector.innerHTML = '';
    europeanLanguages.forEach(l => {
        const img = document.createElement('img');
        img.src = `https://flagcdn.com/w80/${l.iso}.png`;
        img.className = 'lang-flag';
        img.title = l.name;
        img.setAttribute('data-lang', l.code);
        if(l.code === currentLang) img.classList.add('active');
        img.onclick = () => {
            applyLanguage(l.code);
            modals.lang.style.display = 'none';
        };
        selector.appendChild(img);
    });

    document.getElementById('btn-lang-selector').addEventListener('click', () => {
        modals.lang.style.display = 'flex';
    });
    document.getElementById('btn-close-lang').addEventListener('click', () => {
        modals.lang.style.display = 'none';
    });
}
