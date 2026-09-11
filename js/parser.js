// js/parser.js

function normalizeGoogleSheetCsvUrl(url) {
    if (!url) return '';
    let trimmed = url.trim();
    const match = trimmed.match(/\/d\/(e\/)?([a-zA-Z0-9-_]+)/);
    if (match) {
        if (match[1] === 'e/' || match[2].startsWith('2PACX-')) {
            return `https://docs.google.com/spreadsheets/d/e/${match[2]}/pub?output=csv`;
        } else {
            return `https://docs.google.com/spreadsheets/d/${match[2]}/export?format=csv`;
        }
    }
    return trimmed;
}

function parseCsvIntoDictionary(csvText) {
    if (!csvText) return;
    const cleanText = csvText.replace(/^\uFEFF/, ''); // remove UTF-8 BOM
    const lines = cleanText.split(/\r?\n/);
    wordToImageMap = {};
    imageToWordMap = {};

    // Detect primary delimiter from first non-empty line (supports Comma, Tab TSV, Semicolon)
    let delimiter = ',';
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.includes('\t')) {
            delimiter = '\t';
        } else if (trimmed.includes(';') && !trimmed.includes(',')) {
            delimiter = ';';
        }
        break;
    }

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;
        
        // Flexible split supporting quoted items and detected delimiter
        let parts = [];
        let curr = '';
        let inQuotes = false;
        for (let i = 0; i < trimmed.length; i++) {
            const ch = trimmed[i];
            if (ch === '"') {
                inQuotes = !inQuotes;
            } else if (ch === delimiter && !inQuotes) {
                parts.push(curr.trim().replace(/^"|"$/g, ''));
                curr = '';
            } else {
                curr += ch;
            }
        }
        parts.push(curr.trim().replace(/^"|"$/g, ''));

        if (parts.length >= 2) {
            const idStr = parts[0].trim();
            const idNum = parseInt(idStr, 10);
            if (!isNaN(idNum) && idNum > 0) {
                const id = idNum.toString();
                const word = parts[1].trim();
                const category = (parts.length >= 3 && parts[2]) ? parts[2].trim() : '';

                if (word) {
                    wordToImageMap[word.toLowerCase()] = id;
                    wordToImageMap[word] = id;
                    imageToWordMap[id] = { word, category };
                }
            }
        }
    });
}

async function loadWordDictionary(lang) {
    try {
        let loaded = false;

        if (customWordsSheetUrl) {
            try {
                const normUrl = normalizeGoogleSheetCsvUrl(customWordsSheetUrl);
                const resp = await fetch(normUrl);
                if (resp.ok) {
                    const csvText = await resp.text();
                    parseCsvIntoDictionary(csvText);
                    loaded = true;
                }
            } catch (ce) {
                console.warn("Could not load custom words sheet, falling back:", ce);
            }
        }

        if (!loaded) {
            const langCode = lang || currentLang || 'el';
            let response = await fetch(`./images/words/csv/words-${langCode}.csv`);
            if (!response.ok) {
                response = await fetch(`./images/words/csv/words.csv`);
            }
            if (response.ok) {
                const csvText = await response.text();
                parseCsvIntoDictionary(csvText);
            }
        }
    } catch (e) {
        console.error("Failed to load word dictionary:", e);
    }
}

function checkImageExists(id) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = `./images/words/Images/${id}.png`;
    });
}

async function detectTotalImages() {
    try {
        // Quick probe: if totalDetectedImages + 1 does NOT exist, return totalDetectedImages directly
        const hasNext = await checkImageExists(totalDetectedImages + 1);
        if (!hasNext) {
            return totalDetectedImages;
        }

        // Expand upper bound
        let low = totalDetectedImages + 1;
        let high = totalDetectedImages + 100;
        while (await checkImageExists(high)) {
            low = high;
            high += 100;
        }

        // Binary search for exact max ID
        let ans = low;
        while (low <= high) {
            let mid = Math.floor((low + high) / 2);
            const exists = await checkImageExists(mid);
            if (exists) {
                ans = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        totalDetectedImages = ans;
        return ans;
    } catch (err) {
        console.warn("Failed to detect total images, using fallback:", err);
        return totalDetectedImages || 310;
    }
}

function exportWordsCsv(dictionaryData) {
    let csv = "\uFEFFID,Word,Category\r\n";
    const total = totalDetectedImages || 310;
    for (let i = 1; i <= total; i++) {
        const item = dictionaryData[i] || { word: "", category: "" };
        const safeWord = `"${(item.word || "").replace(/"/g, '""')}"`;
        const safeCat = `"${(item.category || "").replace(/"/g, '""')}"`;
        csv += `${i},${safeWord},${safeCat}\r\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `words.my-google-sheet.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function copyWordsToClipboard(dictionaryData) {
    // Format as Tab-Separated Values (TSV) for direct paste into Google Sheets A1
    let tsv = "ID\tWord\tCategory\r\n";
    const total = totalDetectedImages || 310;
    for (let i = 1; i <= total; i++) {
        const item = dictionaryData[i] || { word: "", category: "" };
        const w = (item.word || "").replace(/[\t\r\n]/g, ' ');
        const c = (item.category || "").replace(/[\t\r\n]/g, ' ');
        tsv += `${i}\t${w}\t${c}\r\n`;
    }
    return navigator.clipboard.writeText(tsv);
}

async function loadStoriesFromCloud() {
    try {
        inputs.storyNumber.disabled = true;
        inputs.storyMaxInfo.textContent = "...";
        storyDatabase = {};
        storyWordsDatabase = {};
        maxStoryId = 0;
        const response = await fetch(currentSheetUrl);
        const csvText = await response.text();
        
        let rows = [];
        let currentRow = [];
        let currentCell = '';
        let insideQuotes = false;

        for (let i = 0; i < csvText.length; i++) {
            const char = csvText[i];
            const nextChar = csvText[i + 1];

            if (char === '"' && insideQuotes && nextChar === '"') {
                currentCell += '"';
                i++; 
            } else if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                currentRow.push(currentCell);
                currentCell = '';
            } else if ((char === '\n' || char === '\r') && !insideQuotes) {
                if (char === '\r' && nextChar === '\n') i++; 
                currentRow.push(currentCell);
                rows.push(currentRow);
                currentRow = [];
                currentCell = '';
            } else {
                currentCell += char;
            }
        }
        if (currentCell || currentRow.length > 0) {
            currentRow.push(currentCell);
            rows.push(currentRow);
        }

        let isFirstRow = true;
        rows.forEach(row => {
            if (isFirstRow) { isFirstRow = false; return; } 
            if (row.length < 2) return;
            
            const idStr = row[0].trim();
            let content = row[1].trim();
            const id = parseInt(idStr, 10);
            
            // 3rd column: target unknown words separated by underscore (_)
            let rawWords = (row.length >= 3 && row[2]) ? row[2].trim() : '';
            let unknownWords = [];
            if (rawWords) {
                unknownWords = rawWords.split('_').map(w => w.trim()).filter(w => w.length > 0);
            }
            
            if (!isNaN(id)) {
                storyDatabase[id] = content;
                storyWordsDatabase[id] = unknownWords;
                if (id > maxStoryId) maxStoryId = id;
            }
        });

        if (maxStoryId > 0) {
            inputs.storyNumber.max = maxStoryId;
            inputs.storyNumber.placeholder = "1";
            inputs.storyNumber.disabled = false;
            inputs.storyMaxInfo.textContent = `/ ${maxStoryId}`;
        } else {
            const getText = (key) => (i18n[currentLang] && i18n[currentLang][key]) ? i18n[currentLang][key] : i18n['en'][key];
            inputs.storyMaxInfo.textContent = getText('info_err');
        }
    } catch (error) {
        const getText = (key) => (i18n[currentLang] && i18n[currentLang][key]) ? i18n[currentLang][key] : i18n['en'][key];
        inputs.storyMaxInfo.textContent = getText('info_off');
    }
}

document.getElementById('btn-open-sheet-modal').addEventListener('click', () => {
    document.getElementById('sheet-url-input').value = currentSheetUrl;
    modals.sheet.style.display = 'flex';
});

document.getElementById('btn-cancel-sheet').addEventListener('click', () => modals.sheet.style.display = 'none');

document.getElementById('btn-confirm-sheet').addEventListener('click', () => {
    let newUrl = document.getElementById('sheet-url-input').value.trim();
    if(newUrl) {
        const match = newUrl.match(/\/d\/(e\/)?([a-zA-Z0-9-_]+)/);
        if (match) {
            if (match[1] === 'e/' || match[2].startsWith('2PACX-')) {
                newUrl = `https://docs.google.com/spreadsheets/d/e/${match[2]}/pub?output=csv`;
            } else {
                newUrl = `https://docs.google.com/spreadsheets/d/${match[2]}/export?format=csv`;
            }
        }
        currentSheetUrl = newUrl;
        localStorage.setItem('customReadingSheet', currentSheetUrl);
        loadStoriesFromCloud();
    }
    modals.sheet.style.display = 'none';
});

inputs.storyNumber.addEventListener('input', function() {
    const id = parseInt(this.value, 10);
    if (storyDatabase[id]) {
        inputs.textarea.value = processText(storyDatabase[id], currentLang);
        const unknownWordsList = storyWordsDatabase[id] || [];
        state.sheetUnknownWords = new Set(unknownWordsList.map(w => w.toLowerCase()));
        unknownWordsList.forEach(w => state.sheetUnknownWords.add(w));
    }
});

function parseInput(text) {
    const paragraphs = text.split(/\n+/);
    return paragraphs.map(paraString => {
        const cleanPara = paraString.trim();
        if (!cleanPara) return null; 
        
        const rawWords = cleanPara.split(/\s+/);
        return rawWords.map(rawWord => {
            const syllables = rawWord.split('|').filter(s => s.length > 0);
            return { fullWord: syllables.join(''), syllables: syllables };
        });
    }).filter(para => para !== null);
}
