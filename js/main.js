// js/main.js

async function initApp() {
    initLanguageUI();
    await loadTranslations();

    // Check URL hash for direct student link bootstrapping & pre-parse sheet ID
    const hash = window.location.hash.substring(1);
    let bootLang = currentLang;
    let bootSheetUrl = currentSheetUrl;
    let hasHash = false;
    let hashParams = null;

    if (hash) {
        try {
            const parts = hash.split(';');
            if (parts.length >= 16) {
                hasHash = true;
                hashParams = parts;
                bootLang = parts[1];

                const textSource = parts[14];
                const textData = parts[15];
                if (textSource === 'sheet') {
                    const underscoreIndex = textData.indexOf('_');
                    if (underscoreIndex !== -1) {
                        const sheetId = textData.substring(0, underscoreIndex);
                        if (sheetId.startsWith('2PACX-')) {
                            bootSheetUrl = `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv`;
                        } else {
                            bootSheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv`;
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Failed to pre-parse hash:", e);
        }
    }

    // Check query params for custom words sheet (?wordsSheet=...)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const queryWordsSheet = urlParams.get('wordsSheet');
        if (queryWordsSheet) {
            customWordsSheetUrl = normalizeGoogleSheetCsvUrl(decodeURIComponent(queryWordsSheet));
            localStorage.setItem('customWordsSheet', customWordsSheetUrl);
        }
    } catch (qe) {
        console.error("Failed to parse query params:", qe);
    }

    // Check hash params for custom words sheet if present
    if (hashParams && hashParams.length >= 22 && hashParams[21]) {
        try {
            const rawHashWords = decodeURIComponent(hashParams[21]);
            if (rawHashWords) {
                customWordsSheetUrl = normalizeGoogleSheetCsvUrl(rawHashWords);
                localStorage.setItem('customWordsSheet', customWordsSheetUrl);
            }
        } catch (he) {
            console.error("Failed to parse wordsSheet from hash:", he);
        }
    }

    currentLang = bootLang;
    currentSheetUrl = bootSheetUrl;
    localStorage.setItem('customReadingSheet', currentSheetUrl);
    state.isStudentMode = hasHash;

    await loadWordDictionary(currentLang);
    applyLanguage(currentLang);
    updateLockUI();

    if (getActualApiKey() !== '') {
        loadPremiumVoices();
    }

    await loadStoriesFromCloud();
    applySettings();

    if (hasHash && hashParams) {
        try {
            const version = hashParams[0];
            const fontIndex = parseInt(hashParams[2], 10);
            const size = parseFloat(hashParams[3]);
            const bold = parseInt(hashParams[4], 10) === 1;
            const color = "#" + hashParams[5];
            const veil = parseInt(hashParams[6], 10) === 1;
            const veilColor = "#" + hashParams[7];
            const veilOpacity = parseFloat(hashParams[8]);
            const rate = parseFloat(hashParams[9]);
            const mode = hashParams[10];
            const flow = hashParams[11];
            const scanOn = parseInt(hashParams[12], 10) === 1;
            const scanSpeed = parseFloat(hashParams[13]);
            const textSource = hashParams[14];
            const textData = hashParams[15];

            if (inputs.font.options[fontIndex]) {
                inputs.font.selectedIndex = fontIndex;
            }
            inputs.size.value = size;
            inputs.bold.checked = bold;
            inputs.color.value = color;

            if (hashParams.length >= 18) {
                if (inputs.textBgColor) inputs.textBgColor.value = "#" + hashParams[16];
                if (inputs.appBgColor) inputs.appBgColor.value = "#" + hashParams[17];
            }

            if (hashParams.length >= 19 && hashParams[18]) {
                try {
                    const printStr = hashParams[18];
                    const pPairs = printStr.split(',');
                    pPairs.forEach(pair => {
                        const [k, v] = pair.split(':');
                        const el = document.getElementById('print-opt-' + k) || document.getElementById('print-count-' + k);
                        if (el) {
                            if (el.type === 'checkbox') el.checked = (v === '1');
                            else if (el.type === 'number') el.value = v;
                        }
                    });
                } catch(pe) {
                    console.error("Failed to parse printOpts from hash:", pe);
                }
            }

            if (hashParams.length >= 20) {
                const imageModeVal = parseInt(hashParams[19], 10);
                if (!isNaN(imageModeVal) && [0, 1, 2].includes(imageModeVal)) {
                    state.imageMode = imageModeVal;
                    const rad = document.querySelector(`input[name="image-mode"][value="${imageModeVal}"]`);
                    if (rad) rad.checked = true;
                }
            }

            if (hashParams.length >= 21) {
                const imgSize = parseInt(hashParams[20], 10);
                if (!isNaN(imgSize) && inputs.imageSize) {
                    inputs.imageSize.value = imgSize;
                    state.imageSize = imgSize + 'px';
                }
            }

            state.veilActive = veil;
            inputs.veilColor.value = veilColor;

            state.veilOpacity = veilOpacity;
            inputs.veilOpacitySlider.value = veilOpacity;
            if (inputs.setVeilOpacity) {
                inputs.setVeilOpacity.value = veilOpacity;
            }

            inputs.rate.value = rate;

            state.mode = mode;
            const btnMode = document.getElementById('btn-mode-toggle');
            const getText = (key) => (i18n[currentLang] && i18n[currentLang][key]) ? i18n[currentLang][key] : (i18n['en'][key] || i18n['el'][key]);
            if (btnMode) {
                btnMode.textContent = mode === 'word' ? getText('mode_word') : (mode === 'syllable' ? getText('mode_syllable') : getText('mode_sentence'));
                btnMode.className = mode === 'word' ? 'student-btn student-btn-wide mode-word' : (mode === 'syllable' ? 'student-btn student-btn-wide mode-syllable' : 'student-btn student-btn-wide mode-sentence');
            }

            state.readFlow = flow;
            const btnFlow = document.getElementById('btn-flow-toggle');
            if (btnFlow) {
                btnFlow.textContent = flow === 'step' ? getText('flow_step') : getText('flow_continuous');
                btnFlow.className = flow === 'step' ? 'student-btn student-btn-wide flow-step' : 'student-btn student-btn-wide flow-continuous';
            }

            state.scanOn = scanOn;
            inputs.scanOn.checked = scanOn;
            state.scanSpeed = scanSpeed;
            inputs.scanSpeed.value = 6.0 - scanSpeed;

            // Re-apply settings to ensure theme and fonts reflect URL params
            applySettings();

            if (textSource === 'sheet') {
                const underscoreIndex = textData.indexOf('_');
                const storyId = parseInt(textData.substring(underscoreIndex + 1), 10);
                inputs.storyNumber.value = storyId;

                const unknownWordsList = storyWordsDatabase[storyId] || [];
                state.sheetUnknownWords = new Set(unknownWordsList.map(w => w.toLowerCase()));
                unknownWordsList.forEach(w => state.sheetUnknownWords.add(w));

                if (storyDatabase[storyId]) {
                    inputs.textarea.value = processText(storyDatabase[storyId], currentLang);
                    document.getElementById('btn-start').click();
                }
            } else {
                const decodedText = base64DecodeUnicode(textData);
                inputs.textarea.value = decodedText;
                document.getElementById('btn-start').click();
            }
        } catch (err) {
            console.error("Failed to restore settings from hash:", err);
        }
    }

    if (typeof updateSliderValDisplays === 'function') {
        updateSliderValDisplays();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    initApp();
});
