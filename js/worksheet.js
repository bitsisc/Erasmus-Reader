// js/worksheet.js

/**
 * Splits text into sentences or pedagogical lines for handwriting practice
 */
function getSentencesForHandwriting(text) {
    if (!text) return [];
    // First split by explicit paragraph/line breaks
    const rawLines = text.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
    const sentences = [];
    rawLines.forEach(line => {
        // Split by sentence ending punctuation (. ! ? ; :) followed by space or end
        const parts = line.split(/(?<=[.!?;:])\s+/).map(s => s.trim()).filter(s => s.length > 0);
        if (parts.length > 0) {
            sentences.push(...parts);
        } else {
            sentences.push(line);
        }
    });
    return sentences.length > 0 ? sentences : [text.trim()];
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/**
 * Generates illustrated HTML for the main story text on the worksheet
 */
function generateIllustratedStoryHtml(rawText, mode, unknownWordsSet, wordMap) {
    if (!rawText) return "";
    if (mode !== 1 && mode !== 2) {
        return escapeHtml(rawText.replace(/\|/g, "")).replace(/\n/g, "<br>");
    }

    const paragraphs = rawText.split(/\n+/);
    return paragraphs.map(para => {
        const words = para.trim().split(/\s+/);
        const renderedWords = words.map(w => {
            const cleanWord = w.replace(/\|/g, '');
            const safeWord = escapeHtml(cleanWord);
            const lookup = cleanWord.replace(/[\p{P}\p{S}]/gu, '').trim();
            const lowerLookup = lookup.toLowerCase();

            let shouldShow = false;
            if (mode === 1) {
                shouldShow = true;
            } else if (mode === 2) {
                if (unknownWordsSet && (unknownWordsSet.has(lowerLookup) || unknownWordsSet.has(lookup))) {
                    shouldShow = true;
                }
            }

            let imageId = null;
            if (shouldShow && wordMap) {
                imageId = wordMap[lowerLookup] || wordMap[lookup] || null;
            }

            if (imageId) {
                return `<span class="print-word-image-wrapper"><img src="./images/words/Images/${imageId}.png" class="print-word-image" alt="${lookup}"><span class="print-word-text">${safeWord}</span></span>`;
            } else {
                return `<span class="print-word-text">${safeWord}</span>`;
            }
        });
        return `<div class="print-para">${renderedWords.join(' ')}</div>`;
    }).join('');
}

/**
 * Main print worksheet function:
 * Output contains ONLY:
 * 1. Reading Story Text (optional / default true)
 * 2. Level 1: Tracing with faint letters on handwriting guidelines (optional / default true)
 * 3. Level 2: Copying with reference sentences + blank handwriting lines (optional / default true)
 */
function printWorksheet(customOptions) {
    const opts = Object.assign({
        showText: true,
        level1: true,
        level2: true,
        level2Lines: 1
    }, customOptions || {});

    // 1. Get raw text
    let rawText = state.rawText || (inputs.textarea && inputs.textarea.value) || "";
    const cleanText = rawText.replace(/\|/g, "").trim();
    if (!cleanText) {
        alert(getText('print_alert_no_text') || "Παρακαλώ εισάγετε κάποιο κείμενο πρώτα!");
        return;
    }

    // 2. Fetch translations & disclaimers
    const t = i18n[currentLang] || i18n['en'] || {};
    const langKey = currentLang || 'el';
    const disclaimerText = (typeof euDisclaimers !== 'undefined' && (euDisclaimers[langKey] || euDisclaimers['el'])) || "";
    const euFlagImg = (typeof euFlagImgs !== 'undefined' && (euFlagImgs[langKey] || euFlagImgs['el'])) || "EL_Co-fundedbytheEU_RGB_POS.png";

    // 3. Inherit styling from Teacher screen
    const userFont = (inputs.font && inputs.font.value) || state.fontFamily || "'OpenDyslexic', sans-serif";
    const userColor = (inputs.color && inputs.color.value) || state.textColor || "#1a2b4c";
    const userBold = (inputs.bold && inputs.bold.checked) ? "bold" : "normal";

    // 4. Split sentences for handwriting
    const sentences = getSentencesForHandwriting(cleanText);

    // 5. Generate story HTML if enabled
    const storyHtml = opts.showText ? generateIllustratedStoryHtml(rawText, state.imageMode, state.sheetUnknownWords, wordToImageMap) : "";

    // Open print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert(getText('print_alert_allow_popups') || "Παρακαλώ επιτρέψτε τα αναδυόμενα παράθυρα (popups) για αυτή την ιστοσελίδα.");
        return;
    }

    const linesCount = Math.max(1, Math.min(4, parseInt(opts.level2Lines) || 1));

    let html = `<!DOCTYPE html>
<html lang="${langKey}">
<head>
    <meta charset="utf-8">
    <title>${getText('print_title') || "Φύλλο Εργασίας Ανάγνωσης & Αντιγραφής"}</title>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&family=Comic+Neue:wght@400;700&family=Playpen+Sans:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/styles.css">
    <style>
        @page {
            size: A4 portrait;
            margin: 14mm 15mm 18mm 15mm;
        }
        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        body {
            font-family: ${userFont};
            color: #1a2b4c;
            line-height: 1.6;
            padding: 0;
            margin: 0;
            background: #fff;
        }

        /* Top Header: SESAT & Kidmedia Unified Partner Logo + Student Name & Date */
        .print-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #cbd5e1;
            padding-bottom: 12px;
            margin-bottom: 22px;
            gap: 20px;
        }
        .print-partner-logo {
            max-height: 44px;
            width: auto;
            object-fit: contain;
            display: block;
        }
        .print-student-info {
            display: flex;
            align-items: center;
            gap: 24px;
            flex-shrink: 0;
        }
        .info-field {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .info-label {
            font-size: 0.95rem;
            font-weight: 700;
            color: #334155;
        }
        .info-line {
            width: 140px;
            border-bottom: 2px solid #64748b;
            display: inline-block;
            height: 1.1em;
        }

        /* Reading Story Box */
        .story-section {
            margin-bottom: 26px;
            page-break-inside: avoid;
        }
        .story-box {
            font-family: ${userFont};
            color: ${userColor};
            font-weight: ${userBold};
            background: #f8fafc;
            border: 1.5px solid #e2e8f0;
            border-left: 5px solid #0284c7;
            padding: 16px 20px;
            border-radius: 8px;
            font-size: 1.25rem;
            line-height: 2;
            word-spacing: 0.15em;
        }

        /* Section Headings */
        .exercise-section {
            margin-bottom: 28px;
            page-break-inside: auto;
        }
        .exercise-header {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 14px;
            page-break-inside: avoid;
        }
        .exercise-title {
            font-size: 1.15rem;
            font-weight: 700;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .exercise-prompt {
            font-size: 0.92rem;
            color: #475569;
            margin-top: 3px;
        }

        /* Level 1: Tracing (Ιχνηλάτηση) */
        .trace-card {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        .trace-ruled-row {
            position: relative;
            padding: 8px 12px 14px 12px;
            border-bottom: 2.5px solid #475569; /* Solid baseline */
            background: #fafbfc;
            border-radius: 4px 4px 0 0;
        }
        .trace-midline {
            position: absolute;
            left: 0;
            right: 0;
            top: 50%;
            border-bottom: 1.5px dashed #94a3b8; /* Dashed midline */
            pointer-events: none;
        }
        .trace-text {
            position: relative;
            z-index: 2;
            font-family: ${userFont};
            font-size: 1.65rem;
            font-weight: 500;
            color: #94a3b8; /* Faint gray for child tracing */
            letter-spacing: 0.08em;
            line-height: 1.8;
            white-space: pre-wrap;
            word-break: break-word;
        }

        /* Level 2: Copying (Αντιγραφή σε κενές γραμμές) */
        .copy-card {
            margin-bottom: 24px;
            page-break-inside: avoid;
        }
        .copy-model {
            font-family: ${userFont};
            font-size: 1.3rem;
            font-weight: 600;
            color: #0f172a;
            padding: 6px 10px;
            background: #f1f5f9;
            border-radius: 6px;
            margin-bottom: 12px;
            border-left: 4px solid #0d9488;
            line-height: 1.6;
        }
        .blank-writing-line {
            position: relative;
            height: 42px;
            border-bottom: 2.5px solid #475569; /* Solid baseline */
            margin-bottom: 14px;
        }
        .blank-writing-line .blank-midline {
            position: absolute;
            left: 0;
            right: 0;
            top: 50%;
            border-bottom: 1.5px dashed #94a3b8; /* Dashed midline */
        }

        /* Pictograms in Reading Box */
        .print-para {
            display: flex;
            flex-wrap: wrap;
            align-items: flex-end;
            margin-bottom: 10px;
            line-height: 1.2;
        }
        .print-para:last-child {
            margin-bottom: 0;
        }
        .print-word-image-wrapper {
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            margin: 0 0.25em;
            line-height: 1.2;
            padding: 2px 4px;
            page-break-inside: avoid;
        }
        .print-word-image {
            max-height: 38px;
            width: auto;
            object-fit: contain;
            margin-bottom: 2px;
            display: block;
        }
        .print-word-text {
            display: inline-flex;
            align-items: flex-end;
            padding: 2px 4px;
            margin: 0 0.25em;
            line-height: 1.2;
        }

        /* Erasmus+ Official Footer */
        .print-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1.5px solid #cbd5e1;
            padding-top: 10px;
            margin-top: 35px;
            font-size: 0.72rem;
            color: #475569;
            page-break-inside: avoid;
        }
        .print-footer-left img {
            height: 38px;
            object-fit: contain;
        }
        .print-footer-center {
            flex-grow: 1;
            margin-left: 20px;
            text-align: justify;
            font-size: 0.65rem;
            line-height: 1.25;
            color: #64748b;
        }

        @media print {
            body {
                padding: 0;
                font-size: 11pt;
            }
            .story-box {
                background: #f8fafc !important;
            }
            .trace-ruled-row {
                background: #fafbfc !important;
            }
            .copy-model {
                background: #f1f5f9 !important;
            }
            .print-footer {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: #fff;
                margin-top: 0;
            }
        }
    </style>
</head>
<body>
    <!-- Top Header: SESAT Ltd & KIDMEDIA.NET Logo + Student Fields -->
    <div class="print-header">
        <img src="images/Sesat-kidmedia-net.png" alt="SESAT Ltd & KIDMEDIA.NET" class="print-partner-logo">
        <div class="print-student-info">
            <div class="info-field">
                <i class="fa-solid fa-user" style="color: #0284c7; font-size: 1rem;"></i>
                <span class="info-label">${t.print_name_label || "Όνομα:"}</span>
                <span class="info-line"></span>
            </div>
            <div class="info-field">
                <i class="fa-solid fa-calendar-days" style="color: #0284c7; font-size: 1rem;"></i>
                <span class="info-label">${t.print_date_label || "Ημερομηνία:"}</span>
                <span class="info-line"></span>
            </div>
        </div>
    </div>

    ${opts.showText && storyHtml ? `
    <!-- 1. READING TEXT SECTION -->
    <div class="story-section">
        <div class="story-box">${storyHtml}</div>
    </div>` : ''}

    ${opts.level1 ? `
    <!-- 2. LEVEL 1: TRACING (ΙΧΝΗΛΑΤΗΣΗ / ΠΑΤΗΜΑ) -->
    <div class="exercise-section">
        <div class="exercise-header">
            <div class="exercise-title">
                <i class="fa-solid fa-pen-nib" style="color: #16a34a;"></i>
                <span>${t.print_level1_title || "Επίπεδο 1: Ιχνηλάτηση (Αχνά γράμματα)"}</span>
            </div>
            <div class="exercise-prompt">${t.print_level1_prompt || "Πάτησε επάνω στα αχνά γράμματα για να γράψεις το κείμενο:"}</div>
        </div>
        <div class="exercise-body">
            ${sentences.map(sentence => `
                <div class="trace-card">
                    <div class="trace-ruled-row">
                        <div class="trace-midline"></div>
                        <div class="trace-text">${escapeHtml(sentence)}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>` : ''}

    ${opts.level2 ? `
    <!-- 3. LEVEL 2: COPYING (ΑΝΤΙΓΡΑΦΗ ΣΕ ΚΕΝΕΣ ΓΡΑΜΜΕΣ) -->
    <div class="exercise-section">
        <div class="exercise-header">
            <div class="exercise-title">
                <i class="fa-solid fa-pencil" style="color: #ea580c;"></i>
                <span>${t.print_level2_title || "Επίπεδο 2: Αντιγραφή (Κενές γραμμές)"}</span>
            </div>
            <div class="exercise-prompt">${t.print_level2_prompt || "Αντίγραψε το κείμενο στις κενές γραμμές:"}</div>
        </div>
        <div class="exercise-body">
            ${sentences.map(sentence => `
                <div class="copy-card">
                    <div class="copy-model">${escapeHtml(sentence)}</div>
                    <div class="copy-lines-container">
                        ${Array.from({ length: linesCount }, () => `
                            <div class="blank-writing-line">
                                <div class="blank-midline"></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>` : ''}

    <!-- ERASMUS+ OFFICIAL FOOTER -->
    <div class="print-footer">
        <div class="print-footer-left">
            <img src="images/${euFlagImg}" alt="Co-funded by the EU">
        </div>
        <div class="print-footer-center">
            ${disclaimerText}
        </div>
    </div>

    <script>
        window.addEventListener('load', () => {
            setTimeout(() => {
                window.print();
            }, 500);
        });
    </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
}
