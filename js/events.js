// js/events.js

        // --- Events ---
        function updateSpeechRecognitionButtonVisibility() {
            const btnListen = document.getElementById('btn-listen');
            if (!btnListen) return;
            
            if (typeof isSpeechRecognitionSupported === 'function' && isSpeechRecognitionSupported()) {
                if (state.mode === 'syllable') {
                    btnListen.style.display = 'none';
                } else {
                    btnListen.style.display = 'inline-flex';
                }
            } else {
                btnListen.style.display = 'none';
            }
        }
        inputs.fontUploadBtn.addEventListener('click', () => inputs.fontUploadInput.click());
        inputs.fontUploadInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            inputs.fontStatus.textContent = "...";
            try {
                const fontName = 'CustomFont_' + Date.now();
                const fontUrl = URL.createObjectURL(file);
                const fontFace = new FontFace(fontName, `url(${fontUrl})`);
                const loadedFace = await fontFace.load();
                document.fonts.add(loadedFace);
                const option = document.createElement('option');
                option.text = "📂 " + file.name;
                option.value = `'${fontName}', sans-serif`;
                inputs.font.add(option, inputs.font.options[1]);
                inputs.font.value = option.value;
                inputs.fontStatus.textContent = "✓";
                applySettings();
            } catch (err) {
                console.error(err);
                inputs.fontStatus.textContent = "X";
            }
        });

        const btnOpenGoogleSheet = document.getElementById('btn-open-google-sheet');
        if (btnOpenGoogleSheet) {
            btnOpenGoogleSheet.addEventListener('click', () => {
                const url = currentSheetUrl;
                if (!url) return;
                let editUrl = url;
                if (url.includes('/d/e/2PACX-')) {
                    editUrl = url.replace(/\/pub\?.*/, '/pubhtml');
                } else {
                    const match = url.match(/\/d\/(e\/)?([a-zA-Z0-9-_]+)/);
                    if (match) {
                        editUrl = `https://docs.google.com/spreadsheets/d/${match[2]}/edit`;
                    }
                }
                window.open(editUrl, '_blank');
            });
        }

        document.getElementById('btn-load-txt').addEventListener('click', () => inputs.fileLoad.click());
        inputs.fileLoad.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                inputs.textarea.value = processText(e.target.result, currentLang);
                inputs.fileLoad.value = '';
            };
            reader.readAsText(file);
        });

        inputs.textarea.addEventListener('paste', (e) => {
            setTimeout(() => {
                inputs.textarea.value = processText(inputs.textarea.value, currentLang);
            }, 0);
        });

        inputs.textarea.addEventListener('input', () => {
            if (inputs.storyNumber) {
                inputs.storyNumber.value = "";
            }
        });

        document.getElementById('btn-save-txt').addEventListener('click', () => {
            if (!inputs.textarea.value.trim()) return;
            modals.filename.style.display = 'flex';
            inputs.filename.focus();
        });

        document.getElementById('btn-confirm-save').addEventListener('click', () => {
            const text = inputs.textarea.value;
            let name = inputs.filename.value.trim() || "dyslexia-exercise";
            if (!name.endsWith('.txt')) name += '.txt';
            const blob = new Blob([text], { type: "text/plain" });
            const anchor = document.createElement("a");
            anchor.href = URL.createObjectURL(blob);
            anchor.download = name;
            anchor.click();
            URL.revokeObjectURL(anchor.href);
            modals.filename.style.display = 'none';
            inputs.filename.value = '';
        });

        document.getElementById('btn-cancel-save').addEventListener('click', () => modals.filename.style.display = 'none');

        // Help Modal Event Listeners
        document.getElementById('btn-help').addEventListener('click', () => {
            modals.help.style.display = 'flex';
        });
        document.getElementById('btn-close-help').addEventListener('click', () => {
            modals.help.style.display = 'none';
        });
        document.getElementById('btn-close-help-corner').addEventListener('click', () => {
            modals.help.style.display = 'none';
        });

        // API Info Modal Event Listeners
        const btnApiInfo = document.getElementById('btn-api-info');
        if (btnApiInfo) {
            btnApiInfo.addEventListener('click', () => {
                if (modals.apiInfo) modals.apiInfo.style.display = 'flex';
            });
        }
        const btnCloseApiInfo = document.getElementById('btn-close-api-info');
        if (btnCloseApiInfo) {
            btnCloseApiInfo.addEventListener('click', () => {
                if (modals.apiInfo) modals.apiInfo.style.display = 'none';
            });
        }
        const btnCloseApiInfoCorner = document.getElementById('btn-close-api-info-corner');
        if (btnCloseApiInfoCorner) {
            btnCloseApiInfoCorner.addEventListener('click', () => {
                if (modals.apiInfo) modals.apiInfo.style.display = 'none';
            });
        }
        // Close any modal when clicking on the backdrop overlay
        document.querySelectorAll('.modal-overlay').forEach(modalEl => {
            modalEl.addEventListener('click', (e) => {
                if (e.target === modalEl) {
                    modalEl.style.display = 'none';
                }
            });
        });

        // Unified Fullscreen Toggle Handler
        document.querySelectorAll('.btn-fullscreen-trigger, #btn-fullscreen-toggle, #btn-fullscreen-student').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => console.error(err));
                    document.querySelectorAll('.btn-fullscreen-trigger, #btn-fullscreen-toggle, #btn-fullscreen-student').forEach(b => {
                        b.innerHTML = '<i class="fa-solid fa-compress"></i>';
                    });
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                        document.querySelectorAll('.btn-fullscreen-trigger, #btn-fullscreen-toggle, #btn-fullscreen-student').forEach(b => {
                            b.innerHTML = '<i class="fa-solid fa-expand"></i>';
                        });
                    }
                }
            });
        });

        // Print Button Event Listener (Opens Print Options Modal)
        const btnPrint = document.getElementById('btn-print');
        const printModal = document.getElementById('print-modal');
        if (btnPrint && printModal) {
            btnPrint.addEventListener('click', () => {
                const rawText = state.rawText || (inputs.textarea && inputs.textarea.value) || "";
                if (!rawText.trim()) {
                    alert(getText('print_alert_no_text'));
                    return;
                }
                printModal.style.display = 'flex';
            });
        }

        const btnCancelPrint = document.getElementById('btn-cancel-print');
        if (btnCancelPrint && printModal) {
            btnCancelPrint.addEventListener('click', () => {
                printModal.style.display = 'none';
            });
        }

        const btnConfirmPrint = document.getElementById('btn-confirm-print');
        if (btnConfirmPrint && printModal) {
            btnConfirmPrint.addEventListener('click', () => {
                printModal.style.display = 'none';
                if (typeof printWorksheet === 'function') {
                    const printOptions = {
                        showText: document.getElementById('print-opt-text') ? document.getElementById('print-opt-text').checked : true,
                        level1: document.getElementById('print-opt-level1') ? document.getElementById('print-opt-level1').checked : true,
                        level2: document.getElementById('print-opt-level2') ? document.getElementById('print-opt-level2').checked : true,
                        level2Lines: parseInt(document.getElementById('print-lines-level2') ? document.getElementById('print-lines-level2').value : 1) || 1
                    };
                    printWorksheet(printOptions);
                } else {
                    console.error("printWorksheet is not loaded");
                }
            });
        }

        document.getElementById('btn-start').addEventListener('click', () => {
            if (!inputs.textarea.value.trim()) return;
            const processedText = processText(inputs.textarea.value, currentLang);
            inputs.textarea.value = processedText;
            state.rawText = processedText;
            state.parsedData = parseInput(state.rawText);
            applySettings();
            screens.teacher.style.display = 'none';
            screens.student.style.display = 'flex';
            const topRight = document.getElementById('top-right-actions');
            if (topRight) topRight.style.display = 'none';
            else document.getElementById('btn-lang-selector').style.display = 'none'; 
            state.currentIndex = -1;
            
            const btnMode = document.getElementById('btn-mode-toggle');
            btnMode.disabled = false;
            btnMode.style.opacity = '1';
            btnMode.style.cursor = 'pointer';
            
            const getText = (key) => (i18n[currentLang] && i18n[currentLang][key]) ? i18n[currentLang][key] : (i18n['en'][key] || i18n['el'][key]);
            if (state.mode === 'syllable') {
                btnMode.textContent = getText('mode_syllable');
                btnMode.className = 'student-btn student-btn-wide mode-syllable';
            } else if (state.mode === 'word') {
                btnMode.textContent = getText('mode_word');
                btnMode.className = 'student-btn student-btn-wide mode-word';
            } else {
                btnMode.textContent = getText('mode_sentence');
                btnMode.className = 'student-btn student-btn-wide mode-sentence';
            }
            
            if (state.isStudentMode) {
                document.getElementById('btn-back').style.display = 'none';
            } else {
                document.getElementById('btn-back').style.display = 'inline-flex';
            }

            syncFlowUI();
            renderText();
            checkVoiceWarning(); 
            updateSpeechRecognitionButtonVisibility();

            if (state.scanOn) {
                startScanningLoop();
            }
        });

        document.getElementById('btn-back').addEventListener('click', () => {
            stopAutoRead();
            stopScanningLoop();
            screens.student.style.display = 'none';
            screens.teacher.style.display = 'flex';
            const topRight = document.getElementById('top-right-actions');
            if (topRight) topRight.style.display = 'flex';
            else document.getElementById('btn-lang-selector').style.display = 'flex'; 
            stopSpeech();
            document.body.classList.remove('veil-active');
            display.root.style.setProperty('--veil-opacity', 0); 
            // Restore back button display if hidden
            document.getElementById('btn-back').style.display = 'inline-flex';
        });

        function goNext() { 
            stopAutoRead();
            state.failedCurrentTarget = false;
            if (typeof hideRestorePrompt === 'function') hideRestorePrompt();
            if (typeof clearWordColoring === 'function') clearWordColoring();
            if (state.currentIndex < state.flatElements.length - 1) { 
                state.currentIndex++; 
                updateHighlight(); 
            } 
        }
        function goPrev() { 
            stopAutoRead();
            state.failedCurrentTarget = false;
            if (typeof hideRestorePrompt === 'function') hideRestorePrompt();
            if (typeof clearWordColoring === 'function') clearWordColoring();
            if (state.currentIndex > 0) { 
                state.currentIndex--; 
                updateHighlight(); 
            } 
            else if (state.currentIndex === -1) { 
                state.currentIndex = 0; 
                updateHighlight(); 
            }
        }

        document.getElementById('btn-next').addEventListener('click', goNext);
        document.getElementById('btn-prev').addEventListener('click', goPrev);

        document.addEventListener('keydown', (e) => {
            if (screens.student.style.display === 'flex') {
                if (e.key === 'ArrowRight') goNext();
                if (e.key === 'ArrowLeft') goPrev();
                if (e.key === ' ') { e.preventDefault(); goNext(); }
                if (e.key === 'Escape') { 
                    e.preventDefault(); 
                    const btnBack = document.getElementById('btn-back');
                    if (state.isStudentMode && btnBack.style.display === 'none') {
                        btnBack.style.display = 'inline-flex';
                    } else {
                        btnBack.click();
                    }
                }
            }
        });

        // Touch/Mouse Hold to reveal settings button
        let studentHoldTimeout = null;
        function startStudentHold(e) {
            if (screens.student.style.display === 'flex') {
                const btnBack = document.getElementById('btn-back');
                if (btnBack && btnBack.style.display === 'none') {
                    if (e.type === 'mousedown' && e.button !== 0) return;
                    studentHoldTimeout = setTimeout(() => {
                        btnBack.style.display = 'inline-flex';
                    }, 4000);
                }
            }
        }
        function cancelStudentHold() {
            if (studentHoldTimeout) {
                clearTimeout(studentHoldTimeout);
                studentHoldTimeout = null;
            }
        }
        document.addEventListener('mousedown', startStudentHold);
        document.addEventListener('mouseup', cancelStudentHold);
        document.addEventListener('mouseleave', cancelStudentHold);
        document.addEventListener('touchstart', startStudentHold, { passive: true });
        document.addEventListener('touchend', cancelStudentHold);
        document.addEventListener('touchcancel', cancelStudentHold);

        document.getElementById('btn-flow-toggle').addEventListener('click', function() {
            stopAutoRead();
            state.readFlow = state.readFlow === 'step' ? 'continuous' : 'step';
            syncFlowUI();
            renderText();
            checkVoiceWarning(); 
            updateSpeechRecognitionButtonVisibility();
        });

        document.getElementById('btn-mode-toggle').addEventListener('click', function() {
            stopAutoRead();
            const getText = (key) => (i18n[currentLang] && i18n[currentLang][key]) ? i18n[currentLang][key] : (i18n['en'][key] || i18n['el'][key]);
            
            if (state.mode === 'syllable') {
                state.mode = 'word';
                this.textContent = getText('mode_word');
                this.className = 'student-btn student-btn-wide mode-word';
            } else if (state.mode === 'word') {
                state.mode = 'sentence';
                this.textContent = getText('mode_sentence');
                this.className = 'student-btn student-btn-wide mode-sentence';
            } else {
                state.mode = 'syllable';
                this.textContent = getText('mode_syllable');
                this.className = 'student-btn student-btn-wide mode-syllable';
            }
            renderText();
            checkVoiceWarning(); 
            updateSpeechRecognitionButtonVisibility();
        });

        document.getElementById('btn-toggle-veil').addEventListener('click', () => {
            state.veilActive = !state.veilActive;
            updateVeilUI();
        });
        inputs.veilOpacitySlider.addEventListener('input', (e) => {
            state.veilOpacity = parseFloat(e.target.value);
            if (inputs.setVeilOpacity) {
                inputs.setVeilOpacity.value = state.veilOpacity;
            }
            updateVeilUI();
            updateSliderValDisplays();
        });

        if (inputs.setVeilOpacity) {
            inputs.setVeilOpacity.addEventListener('input', (e) => {
                state.veilOpacity = parseFloat(e.target.value);
                inputs.veilOpacitySlider.value = state.veilOpacity;
                updateVeilUI();
                updateSliderValDisplays();
            });
        }

        document.getElementById('btn-speak-current').addEventListener('click', () => {
            stopAutoRead();
            if (state.currentIndex === -1 && state.flatElements.length > 0) {
                state.currentIndex = 0;
                updateHighlight();
            }
            if (state.currentIndex >= 0 && state.currentIndex < state.flatElements.length) {
                const target = state.flatElements[state.currentIndex];
                let textToSpeak = target.textContent;
                if (state.mode === 'sentence') {
                    textToSpeak = Array.from(target.querySelectorAll('.word')).map(w => w.textContent.trim()).join(' ');
                }
                speakStep(textToSpeak);
            }
        });

        const btnReset = document.getElementById('btn-reset');
        let resetHoldTimer = null;
        let isResetLongPressTriggered = false;

        function executeResetToStart() {
            stopAutoRead();
            state.currentIndex = 0;
            state.failedCurrentTarget = false;
            
            if (typeof clearWordColoring === 'function') clearWordColoring();
            if (typeof hideRestorePrompt === 'function') hideRestorePrompt();
            
            if (state.readFlow === 'continuous') {
                state.veilActive = false;
            } else {
                state.veilActive = true;
            }
            updateVeilUI();
            updateHighlight();
        }

        function executeStepBack() {
            stopAutoRead();
            
            if (state.readFlow === 'continuous') {
                // In continuous flow: reset to the beginning
                executeResetToStart();
                return;
            } else {
                if (state.failedCurrentTarget) {
                    // 1st click on failure: stay on current word, giving the opportunity to re-read it
                    state.failedCurrentTarget = false;
                    if (state.currentIndex < 0) state.currentIndex = 0;
                } else {
                    // 2nd and subsequent clicks: step backward to previous word
                    if (state.currentIndex > 0) {
                        state.currentIndex--;
                    } else {
                        state.currentIndex = 0;
                    }
                }
            }
            
            if (typeof clearWordColoring === 'function') clearWordColoring();
            if (typeof hideRestorePrompt === 'function') hideRestorePrompt();
            
            state.veilActive = true;
            updateVeilUI();
            updateHighlight();
        }

        function startResetHold() {
            isResetLongPressTriggered = false;
            if (resetHoldTimer) clearTimeout(resetHoldTimer);
            if (btnReset) btnReset.classList.add('holding');

            resetHoldTimer = setTimeout(() => {
                isResetLongPressTriggered = true;
                if (btnReset) {
                    btnReset.classList.remove('holding');
                    btnReset.classList.add('reset-complete');
                    setTimeout(() => btnReset.classList.remove('reset-complete'), 600);
                }
                
                if (typeof playResetChime === 'function') {
                    playResetChime();
                }
                if (navigator.vibrate) {
                    try { navigator.vibrate(50); } catch (e) {}
                }
                executeResetToStart();
            }, 1500);
        }

        function cancelResetHold() {
            if (btnReset) btnReset.classList.remove('holding');
            if (resetHoldTimer) {
                clearTimeout(resetHoldTimer);
                resetHoldTimer = null;
            }
        }

        if (btnReset) {
            btnReset.addEventListener('pointerdown', (e) => {
                if (e.button !== undefined && e.button !== 0) return;
                startResetHold();
            });

            btnReset.addEventListener('pointerup', () => {
                cancelResetHold();
            });

            btnReset.addEventListener('pointercancel', () => {
                cancelResetHold();
            });

            btnReset.addEventListener('pointerleave', () => {
                cancelResetHold();
            });

            btnReset.addEventListener('click', () => {
                if (isResetLongPressTriggered) {
                    isResetLongPressTriggered = false;
                    return;
                }
                cancelResetHold();
                executeStepBack();
            });
        }

        const btnReadAll = document.getElementById('btn-read-all');
        btnReadAll.addEventListener('click', () => {
            if (state.isAutoReading) {
                stopAutoRead();
            } else {
                startAutoRead();
            }
        });

        // ========================================================================
        // SHARING MODAL & URL SERIALIZATION
        // ========================================================================

        function base64EncodeUnicode(str) {
            return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
                return String.fromCharCode(parseInt(p1, 16));
            }));
        }

        function base64DecodeUnicode(str) {
            return decodeURIComponent(atob(str).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        }

        function getSheetIdFromUrl(url) {
            const match = url.match(/\/d\/(e\/)?([a-zA-Z0-9-_]+)/);
            return match ? match[2] : '';
        }

        function generateCleanURL() {
            const version = "1";
            const lang = currentLang;
            const font = inputs.font.selectedIndex >= 0 ? inputs.font.selectedIndex : 0;
            const size = parseFloat(inputs.size.value);
            const bold = inputs.bold.checked ? 1 : 0;
            const color = inputs.color.value.replace("#", "");
            const veil = state.veilActive ? 1 : 0;
            const veilColor = inputs.veilColor.value.replace("#", "");
            const veilOpacity = parseFloat(inputs.veilOpacitySlider.value);
            const rate = parseFloat(inputs.rate.value);
            
            const mode = state.mode;
            const flow = state.readFlow;
            
            const scanOn = inputs.scanOn.checked ? 1 : 0;
            const scanSpeed = state.scanSpeed;
            
            let textSource = "custom";
            let textData = "";
            
            const storyNumVal = parseInt(inputs.storyNumber.value, 10);
            if (!inputs.storyNumber.disabled && storyNumVal > 0 && storyDatabase[storyNumVal]) {
                textSource = "sheet";
                const sheetId = getSheetIdFromUrl(currentSheetUrl);
                textData = `${sheetId}_${storyNumVal}`;
            } else {
                textSource = "custom";
                textData = base64EncodeUnicode(inputs.textarea.value);
            }
            
            const textBgColor = (inputs.textBgColor ? inputs.textBgColor.value : '#FDF9E3').replace('#', '');
            const appBgColor = (inputs.appBgColor ? inputs.appBgColor.value : '#E8ECEF').replace('#', '');

            const getPrintOpt = (id, isNum) => {
                const el = document.getElementById(id);
                if (!el) return isNum ? '5' : '1';
                return isNum ? el.value : (el.checked ? '1' : '0');
            };
            const printOpts = `ex1:${getPrintOpt('print-opt-ex1')},ex2:${getPrintOpt('print-opt-ex2')},ex3:${getPrintOpt('print-opt-ex3')},ex4:${getPrintOpt('print-opt-ex4')},ex4Count:${getPrintOpt('print-count-ex4', true)},ex5:${getPrintOpt('print-opt-ex5')},ex5Count:${getPrintOpt('print-count-ex5', true)},ex6:${getPrintOpt('print-opt-ex6')},ex6Count:${getPrintOpt('print-count-ex6', true)},ex7:${getPrintOpt('print-opt-ex7')},ex8:${getPrintOpt('print-opt-ex8')},ex9:${getPrintOpt('print-opt-ex9')}`;

            const selectedImageRadio = document.querySelector('input[name="image-mode"]:checked');
            const imageMode = selectedImageRadio ? parseInt(selectedImageRadio.value, 10) : (state.imageMode || 0);
            const imageSize = inputs.imageSize ? parseInt(inputs.imageSize.value, 10) : 50;

            const customWordsParam = customWordsSheetUrl ? encodeURIComponent(customWordsSheetUrl) : '';
            const params = [
                version, lang, font, size, bold, color, veil, veilColor, veilOpacity,
                rate, mode, flow, scanOn, scanSpeed, textSource, textData, textBgColor, appBgColor, printOpts, imageMode, imageSize, customWordsParam
            ];
            
            let baseUrl = window.location.origin + window.location.pathname;
            if (customWordsSheetUrl) {
                baseUrl += `?wordsSheet=${encodeURIComponent(customWordsSheetUrl)}`;
            }
            return baseUrl + "#" + params.join(";");
        }

        document.getElementById('btn-share').addEventListener('click', () => {
            const url = generateCleanURL();
            inputs.shareUrlInput.value = url;
            modals.share.style.display = 'flex';
        });

        document.getElementById('btn-close-share').addEventListener('click', () => {
            modals.share.style.display = 'none';
        });

        document.getElementById('btn-copy-link').addEventListener('click', () => {
            inputs.shareUrlInput.select();
            inputs.shareUrlInput.setSelectionRange(0, 99999);
            navigator.clipboard.writeText(inputs.shareUrlInput.value).then(() => {
                const copyBtn = document.getElementById('btn-copy-link');
                const originalText = copyBtn.textContent;
                copyBtn.textContent = getText('msg_copied');
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            }).catch(err => {
                console.error("Clipboard copy failed: ", err);
            });
        });

        document.getElementById('btn-send-email').addEventListener('click', async () => {
            const link = inputs.shareUrlInput.value;
            const subject = getText('share_mail_subject') || "Reading Exercise";
            const shareText = getText('share_mail_body') || "Hello! Check out this reading exercise in Reader:\n\n";

            const triggerMailto = () => {
                const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText + link)}`;
                const tempLink = document.createElement('a');
                tempLink.href = mailtoUrl;
                tempLink.click();
            };

            // Detect Mobile / Tablet (Android, iOS, iPadOS)
            const isMobileOrTablet = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || 
                (navigator.maxTouchPoints > 2 && /Macintosh/.test(navigator.userAgent));

            if (isMobileOrTablet && navigator.share) {
                try {
                    await navigator.share({
                        title: subject,
                        text: shareText,
                        url: link
                    });
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        console.warn("Web Share API error, fallback to mailto:", err);
                        triggerMailto();
                    }
                }
            } else {
                // Desktop directly to default mail client
                triggerMailto();
            }
        });

        // ========================================================================
        // AUTO-SCANNING (ACCESSIBILITY SWITCH ACCESS)
        // ========================================================================

        let scanIntervalId = null;
        let scanIndex = -1;
        let scanElements = [];
        let scanPauseTimer = null;
        let isScanPaused = false;
        let lastMouseX = null;
        let lastMouseY = null;

        function getScanElements() {
            if (state.readFlow === 'continuous') {
                return [
                    document.getElementById('btn-read-all'),
                    document.getElementById('btn-listen'),
                    document.getElementById('btn-reset')
                ].filter(el => el && el.style.display !== 'none' && !el.disabled);
            }
            return [
                document.getElementById('btn-speak-current'),
                document.getElementById('btn-next'),
                document.getElementById('btn-listen'),
                document.getElementById('btn-reset'),
                document.getElementById('btn-prev')
            ].filter(el => el && el.style.display !== 'none' && !el.disabled);
        }

        function handleScanSelect() {
            if (!state.scanOn || isScanPaused || scanIndex < 0 || scanIndex >= scanElements.length) return;
            const target = scanElements[scanIndex];
            if (target) {
                target.click();
            }
        }

        function handleAdultTakeover() {
            if (!state.scanOn || screens.student.style.display !== 'flex') return;
            isScanPaused = true;
            
            const overlay = document.getElementById('scan-overlay');
            if (overlay) overlay.style.display = 'none';
            document.querySelectorAll('.scan-focus').forEach(el => el.classList.remove('scan-focus'));
            
            if (scanPauseTimer) clearTimeout(scanPauseTimer);
            scanPauseTimer = setTimeout(() => {
                isScanPaused = false;
                if (state.scanOn && screens.student.style.display === 'flex') {
                    if (overlay) overlay.style.display = 'block';
                    if (scanIndex >= 0 && scanIndex < scanElements.length && scanElements[scanIndex]) {
                        scanElements[scanIndex].classList.add('scan-focus');
                    }
                }
            }, 3500);
        }

        // Mouse Movement Delta & Touch Drag Detection for Adult Takeover
        window.addEventListener('mousemove', (e) => {
            if (!state.scanOn || screens.student.style.display !== 'flex') return;
            if (lastMouseX !== null && lastMouseY !== null) {
                const dx = e.clientX - lastMouseX;
                const dy = e.clientY - lastMouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 8) {
                    handleAdultTakeover();
                }
            }
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        });

        window.addEventListener('touchmove', () => {
            handleAdultTakeover();
        }, { passive: true });

        // Scan Overlay Click = Single Switch Access Trigger (Disabled User)
        const scanOverlayEl = document.getElementById('scan-overlay');
        if (scanOverlayEl) {
            scanOverlayEl.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (state.scanOn && !isScanPaused) {
                    handleScanSelect();
                }
            });
        }

        function startScanningLoop() {
            stopScanningLoop();
            if (!state.scanOn) return;

            const overlay = document.getElementById('scan-overlay');
            if (overlay) overlay.style.display = 'block';

            scanElements = getScanElements();
            scanIndex = 0;
            isScanPaused = false;

            if (scanElements.length > 0) {
                scanElements[scanIndex].classList.add('scan-focus');
            }

            const intervalTime = state.scanSpeed * 1000;
            scanIntervalId = setInterval(() => {
                if (!state.scanOn || isScanPaused || scanElements.length === 0) return;

                if (scanIndex >= 0 && scanIndex < scanElements.length) {
                    scanElements[scanIndex].classList.remove('scan-focus');
                }

                scanIndex = (scanIndex + 1) % scanElements.length;

                const target = scanElements[scanIndex];
                if (target && !isScanPaused) {
                    target.classList.add('scan-focus');
                }
            }, intervalTime);
        }

        function stopScanningLoop() {
            if (scanIntervalId) {
                clearInterval(scanIntervalId);
                scanIntervalId = null;
            }

            const overlay = document.getElementById('scan-overlay');
            if (overlay) overlay.style.display = 'none';

            document.querySelectorAll('.scan-focus').forEach(el => el.classList.remove('scan-focus'));
            scanIndex = -1;
            scanElements = [];
        }

        // Accessibility Switch Key Trigger (Space / Enter / External Switch)
        window.addEventListener('keydown', (e) => {
            if (state.scanOn && screens.student.style.display === 'flex' && !isScanPaused) {
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();
                    handleScanSelect();
                }
            }
        });

        // ========================================================================
        // SCANNING & SPEECH RECOGNITION TRIGGERS
        // ========================================================================

        inputs.scanOn.addEventListener('change', (e) => {
            state.scanOn = e.target.checked;
            localStorage.setItem('readingToolScanOn', state.scanOn ? '1' : '0');
        });

        inputs.scanSpeed.addEventListener('input', (e) => {
            const sliderVal = parseFloat(e.target.value);
            state.scanSpeed = 6.0 - sliderVal;
            localStorage.setItem('readingToolScanSpeed', state.scanSpeed);
            updateSliderValDisplays();
        });

        // Real-Time Live Preview Event Listeners on Settings Screen
        const liveSettingsKeys = ['font', 'size', 'bold', 'color', 'textBgColor', 'appBgColor', 'veilColor'];
        liveSettingsKeys.forEach(key => {
            if (inputs[key]) {
                const evtType = (inputs[key].tagName === 'SELECT' || inputs[key].type === 'checkbox') ? 'change' : 'input';
                inputs[key].addEventListener(evtType, () => {
                    applySettings();
                });
            }
        });

        document.querySelectorAll('input[name="image-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                state.imageMode = parseInt(e.target.value, 10) || 0;
                applySettings();
            });
        });

        inputs.size.addEventListener('input', () => {
            updateSliderValDisplays();
        });

        if (inputs.imageSize) {
            inputs.imageSize.addEventListener('input', () => {
                applySettings();
                updateSliderValDisplays();
            });
        }
        
        inputs.rate.addEventListener('input', () => {
            updateSliderValDisplays();
        });

        function updateSliderValDisplays() {
            // 1. Font size
            const sizeVal = parseFloat(inputs.size.value).toFixed(1);
            const sizeDisplay = document.getElementById('size-val');
            if (sizeDisplay) sizeDisplay.textContent = sizeVal;
            
            // 2. Veil opacity
            if (inputs.setVeilOpacity) {
                const opacityVal = Math.round(parseFloat(inputs.setVeilOpacity.value) * 100);
                const opacityDisplay = document.getElementById('veil-opacity-val');
                if (opacityDisplay) opacityDisplay.textContent = opacityVal + '%';
            }
            
            // 3. Scanning speed (seconds)
            const speedVal = (6.0 - parseFloat(inputs.scanSpeed.value)).toFixed(1);
            const speedDisplay = document.getElementById('scan-speed-val');
            if (speedDisplay) speedDisplay.textContent = speedVal + ' ' + (getText('unit_seconds_short') || 'sec');
            
            // 4. Speech rate
            const rateVal = parseFloat(inputs.rate.value).toFixed(1);
            const rateDisplay = document.getElementById('rate-val');
            if (rateDisplay) rateDisplay.textContent = rateVal;

            // 5. Image size
            if (inputs.imageSize) {
                const imageSizeDisplay = document.getElementById('image-size-val');
                if (imageSizeDisplay) imageSizeDisplay.textContent = inputs.imageSize.value + 'px';
            }
        }

        // Restore settings from local storage if available
        const savedScanOn = localStorage.getItem('readingToolScanOn');
        if (savedScanOn !== null) {
            state.scanOn = savedScanOn === '1';
            inputs.scanOn.checked = state.scanOn;
        }

        const savedScanSpeed = localStorage.getItem('readingToolScanSpeed');
        if (savedScanSpeed !== null) {
            state.scanSpeed = parseFloat(savedScanSpeed);
            inputs.scanSpeed.value = 6.0 - state.scanSpeed;
        }

        // SPEECH RECOGNITION TRIGGERS
        document.getElementById('btn-listen').addEventListener('click', () => {
            if (isListening) {
                stopListening();
            } else {
                // Automatically switch to step flow if in continuous flow
                if (state.readFlow === 'continuous') {
                    state.readFlow = 'step';
                    const flowBtn = document.getElementById('btn-flow-toggle');
                    if (flowBtn) {
                        const getText = (key) => (i18n[currentLang] && i18n[currentLang][key]) ? i18n[currentLang][key] : (i18n['en'][key] || i18n['el'][key]);
                        flowBtn.textContent = getText('flow_step');
                        flowBtn.className = 'student-btn student-btn-wide flow-step';
                    }
                    renderText();
                    checkVoiceWarning(); 
                    updateSpeechRecognitionButtonVisibility();
                    if (state.currentIndex === -1) {
                        state.currentIndex = 0;
                        updateHighlight();
                    }
                }

                let targetText = "";
                if (state.currentIndex >= 0 && state.currentIndex < state.flatElements.length) {
                    const el = state.flatElements[state.currentIndex];
                    if (state.mode === 'syllable') {
                        targetText = el.parentElement.textContent.replace(/\|/g, "").trim();
                    } else if (state.mode === 'sentence') {
                        targetText = Array.from(el.querySelectorAll('.word')).map(w => w.textContent.trim()).join(' ');
                    } else {
                        targetText = el.textContent.trim();
                    }
                } else {
                    state.currentIndex = 0;
                    updateHighlight();
                    const el = state.flatElements[0];
                    if (state.mode === 'syllable') {
                        targetText = el.parentElement.textContent.replace(/\|/g, "").trim();
                    } else if (state.mode === 'sentence') {
                        targetText = Array.from(el.querySelectorAll('.word')).map(w => w.textContent.trim()).join(' ');
                    } else {
                        targetText = el.textContent.trim();
                    }
                }
                if (targetText) {
                    startListening(targetText);
                }
            }
        });

        // ==========================================
        // IMAGE DICTIONARY MANAGER MODAL LOGIC
        // ==========================================
        let dictEditingData = {};

        function renderDictGrid(filterText = '') {
            const container = document.getElementById('dict-grid-container');
            const countBadge = document.getElementById('dict-count-badge');
            if (!container) return;

            container.innerHTML = '';
            const total = totalDetectedImages || 310;
            const search = (filterText || '').trim().toLowerCase();
            let matches = 0;

            const wordPh = getText('dict_word_ph') || 'Word...';
            const unitLabel = getText('dict_images_unit') || 'images';

            const frag = document.createDocumentFragment();

            for (let i = 1; i <= total; i++) {
                const item = dictEditingData[i] || { word: '', category: '' };
                const word = item.word || '';
                const cat = item.category || '';
                const idStr = i.toString();

                if (search) {
                    const matchId = idStr.includes(search);
                    const matchWord = word.toLowerCase().includes(search);
                    const matchCat = cat.toLowerCase().includes(search);
                    if (!matchId && !matchWord && !matchCat) continue;
                }

                matches++;

                const card = document.createElement('div');
                card.className = 'dict-card';

                const header = document.createElement('div');
                header.className = 'dict-card-header';
                header.innerHTML = `<span class="dict-card-id">#${i}</span>${cat ? `<span class="dict-card-cat" title="${cat}">${cat}</span>` : ''}`;

                const imgWrap = document.createElement('div');
                imgWrap.className = 'dict-card-img-wrap';
                const img = document.createElement('img');
                img.className = 'dict-card-img';
                img.src = `./images/words/Images/${i}.png`;
                img.alt = word || `Image ${i}`;
                img.loading = 'lazy';
                img.onerror = () => { img.style.opacity = '0.3'; };
                imgWrap.appendChild(img);

                const wordInput = document.createElement('input');
                wordInput.type = 'text';
                wordInput.className = 'dict-word-input';
                wordInput.placeholder = wordPh;
                wordInput.value = word;
                wordInput.dataset.id = idStr;

                card.appendChild(header);
                card.appendChild(imgWrap);
                card.appendChild(wordInput);

                frag.appendChild(card);
            }

            container.appendChild(frag);
            if (countBadge) {
                countBadge.textContent = `${matches} / ${total} ${unitLabel}`;
            }
        }

        async function openImageDictModal() {
            const statusEl = document.getElementById('custom-words-status');
            if (statusEl) statusEl.style.display = 'none';

            if (inputs.customWordsUrlInput) {
                inputs.customWordsUrlInput.value = customWordsSheetUrl || '';
            }

            // Ensure guide accordion is closed by default
            const guideBody = document.getElementById('dict-guide-body');
            const chevron = document.getElementById('dict-guide-chevron');
            if (guideBody) guideBody.style.display = 'none';
            if (chevron) chevron.className = 'fa-solid fa-chevron-down';

            // Quick auto-probe for total images
            await detectTotalImages();

            // Prepare working data from current loaded dictionary
            dictEditingData = {};
            const total = totalDetectedImages || 310;
            for (let i = 1; i <= total; i++) {
                const existing = imageToWordMap[i.toString()];
                dictEditingData[i] = existing ? { word: existing.word || '', category: existing.category || '' } : { word: '', category: '' };
            }

            const searchInput = document.getElementById('dict-search-input');
            if (searchInput) searchInput.value = '';

            renderDictGrid('');
            
            const container = document.getElementById('dict-grid-container');
            if (container) {
                container.scrollTop = 0;
            }

            if (modals.imageDict) {
                modals.imageDict.style.display = 'flex';
            }
        }

        function toggleDictGuide() {
            const guideBody = document.getElementById('dict-guide-body');
            const chevron = document.getElementById('dict-guide-chevron');
            if (!guideBody) return;
            const isHidden = guideBody.style.display === 'none' || !guideBody.style.display;
            guideBody.style.display = isHidden ? 'block' : 'none';
            if (chevron) {
                chevron.className = isHidden ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
            }
        }

        const dictGuideHeader = document.getElementById('dict-guide-header');
        if (dictGuideHeader) {
            dictGuideHeader.addEventListener('click', toggleDictGuide);
        }
        const btnToggleDictGuide = document.getElementById('btn-toggle-dict-guide');
        if (btnToggleDictGuide) {
            btnToggleDictGuide.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleDictGuide();
            });
        }

        const btnOpenImageDict = document.getElementById('btn-open-image-dict');
        if (btnOpenImageDict) {
            btnOpenImageDict.addEventListener('click', openImageDictModal);
        }

        const btnCloseDict = document.getElementById('btn-close-image-dict');
        if (btnCloseDict) {
            btnCloseDict.addEventListener('click', () => {
                if (modals.imageDict) modals.imageDict.style.display = 'none';
            });
        }

        const btnCloseDictCorner = document.getElementById('btn-close-image-dict-corner');
        if (btnCloseDictCorner) {
            btnCloseDictCorner.addEventListener('click', () => {
                if (modals.imageDict) modals.imageDict.style.display = 'none';
            });
        }

        const dictSearchInput = document.getElementById('dict-search-input');
        if (dictSearchInput) {
            dictSearchInput.addEventListener('input', (e) => {
                renderDictGrid(e.target.value);
            });
        }

        const dictGridContainer = document.getElementById('dict-grid-container');
        if (dictGridContainer) {
            dictGridContainer.addEventListener('input', (e) => {
                const target = e.target;
                const id = target.dataset.id;
                if (!id) return;
                const numId = parseInt(id, 10);
                if (!dictEditingData[numId]) {
                    dictEditingData[numId] = { word: '', category: '' };
                }
                if (target.classList.contains('dict-word-input')) {
                    dictEditingData[numId].word = target.value.trim();
                }
            });
        }

        const btnApplyCustomWords = document.getElementById('btn-apply-custom-words');
        if (btnApplyCustomWords) {
            btnApplyCustomWords.addEventListener('click', async () => {
                const statusEl = document.getElementById('custom-words-status');
                const rawUrl = inputs.customWordsUrlInput ? inputs.customWordsUrlInput.value.trim() : '';
                if (!rawUrl) {
                    if (statusEl) {
                        statusEl.style.display = 'block';
                        statusEl.style.color = '#dc2626';
                        statusEl.textContent = getText('dict_status_enter_url');
                    }
                    return;
                }

                const normUrl = normalizeGoogleSheetCsvUrl(rawUrl);
                if (statusEl) {
                    statusEl.style.display = 'block';
                    statusEl.style.color = '#2563eb';
                    statusEl.textContent = getText('dict_status_checking');
                }

                try {
                    const resp = await fetch(normUrl);
                    if (!resp.ok) throw new Error("HTTP " + resp.status);
                    const csvText = await resp.text();
                    parseCsvIntoDictionary(csvText);

                    customWordsSheetUrl = normUrl;
                    localStorage.setItem('customWordsSheet', customWordsSheetUrl);

                    // Sync dictEditingData with new loaded dictionary
                    const total = totalDetectedImages || 310;
                    for (let i = 1; i <= total; i++) {
                        const existing = imageToWordMap[i.toString()];
                        dictEditingData[i] = existing ? { word: existing.word || '', category: existing.category || '' } : { word: '', category: '' };
                    }
                    renderDictGrid(dictSearchInput ? dictSearchInput.value : '');

                    if (typeof renderText === 'function') renderText();

                    if (statusEl) {
                        statusEl.style.color = '#16a34a';
                        statusEl.textContent = getText('dict_status_success');
                    }
                } catch (err) {
                    console.error("Error applying custom words sheet:", err);
                    if (statusEl) {
                        statusEl.style.color = '#dc2626';
                        statusEl.textContent = getText('dict_status_error');
                    }
                }
            });
        }

        const btnResetCustomWords = document.getElementById('btn-reset-custom-words');
        if (btnResetCustomWords) {
            btnResetCustomWords.addEventListener('click', async () => {
                const statusEl = document.getElementById('custom-words-status');
                customWordsSheetUrl = null;
                localStorage.removeItem('customWordsSheet');
                if (inputs.customWordsUrlInput) inputs.customWordsUrlInput.value = '';

                if (statusEl) {
                    statusEl.style.display = 'block';
                    statusEl.style.color = '#2563eb';
                    statusEl.textContent = getText('dict_status_resetting');
                }

                await loadWordDictionary(currentLang);

                const total = totalDetectedImages || 310;
                for (let i = 1; i <= total; i++) {
                    const existing = imageToWordMap[i.toString()];
                    dictEditingData[i] = existing ? { word: existing.word || '', category: existing.category || '' } : { word: '', category: '' };
                }
                renderDictGrid(dictSearchInput ? dictSearchInput.value : '');

                if (typeof renderText === 'function') renderText();

                if (statusEl) {
                    statusEl.style.color = '#16a34a';
                    statusEl.textContent = getText('dict_status_reset_done');
                }
            });
        }

        const btnExportWordsCsv = document.getElementById('btn-export-words-csv');
        if (btnExportWordsCsv) {
            btnExportWordsCsv.addEventListener('click', () => {
                exportWordsCsv(dictEditingData);
            });
        }

        const btnCopyWordsClipboard = document.getElementById('btn-copy-words-clipboard');
        if (btnCopyWordsClipboard) {
            btnCopyWordsClipboard.addEventListener('click', () => {
                copyWordsToClipboard(dictEditingData).then(() => {
                    const originalText = btnCopyWordsClipboard.innerHTML;
                    btnCopyWordsClipboard.innerHTML = '<i class="fa-solid fa-check"></i> ' + getText('msg_copied');
                    setTimeout(() => {
                        btnCopyWordsClipboard.innerHTML = originalText;
                    }, 2000);
                }).catch(err => {
                    console.error("Failed to copy words to clipboard:", err);
                });
            });
        }

        // ==========================================
        // SPEECH-TO-TEXT (STT) SETTINGS MODAL LOGIC
        // ==========================================
        const btnSttSettings = document.getElementById('btn-stt-settings');
        if (btnSttSettings) {
            btnSttSettings.addEventListener('click', () => {
                if (modals.stt) {
                    if (typeof updateLockUI === 'function') updateLockUI();
                    if (typeof updateSttUsageUI === 'function') updateSttUsageUI();
                    modals.stt.style.display = 'flex';
                }
            });
        }

        const btnCloseStt = document.getElementById('btn-close-stt');
        if (btnCloseStt) {
            btnCloseStt.addEventListener('click', () => {
                if (modals.stt) modals.stt.style.display = 'none';
            });
        }

        const btnCloseSttCorner = document.getElementById('btn-close-stt-corner');
        if (btnCloseSttCorner) {
            btnCloseSttCorner.addEventListener('click', () => {
                if (modals.stt) modals.stt.style.display = 'none';
            });
        }

        const btnToggleSttKeyView = document.getElementById('btn-toggle-stt-key-view');
        if (btnToggleSttKeyView && inputs.sttApiKey) {
            btnToggleSttKeyView.addEventListener('click', () => {
                if (inputs.sttApiKey.type === 'password') {
                    inputs.sttApiKey.type = 'text';
                    btnToggleSttKeyView.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
                } else {
                    inputs.sttApiKey.type = 'password';
                    btnToggleSttKeyView.innerHTML = '<i class="fa-solid fa-eye"></i>';
                }
            });
        }

        if (inputs.syncSttWithTtsKey) {
            inputs.syncSttWithTtsKey.addEventListener('change', () => {
                const isSync = inputs.syncSttWithTtsKey.checked;
                const container = document.getElementById('stt-key-input-container');
                const btnView = document.getElementById('btn-toggle-stt-key-view');
                if (isSync) {
                    if (inputs.sttApiKey) {
                        inputs.sttApiKey.type = 'password';
                        inputs.sttApiKey.value = (typeof getActualApiKey === 'function') ? getActualApiKey() : '';
                        inputs.sttApiKey.disabled = true;
                    }
                    if (btnView) {
                        btnView.style.display = 'inline-flex';
                        btnView.innerHTML = '<i class="fa-solid fa-eye"></i>';
                    }
                    if (container) container.style.opacity = '0.75';
                } else {
                    if (inputs.sttApiKey) {
                        inputs.sttApiKey.disabled = false;
                        inputs.sttApiKey.value = localStorage.getItem('readingToolSTTApiKey') || '';
                    }
                    if (btnView) {
                        btnView.style.display = 'inline-flex';
                        btnView.innerHTML = '<i class="fa-solid fa-eye"></i>';
                    }
                    if (container) container.style.opacity = '1';
                }
            });
        }

        let sttSaveToastTimer = null;
        const btnSaveSttSettings = document.getElementById('btn-save-stt-settings');
        if (btnSaveSttSettings) {
            btnSaveSttSettings.addEventListener('click', () => {
                if (!isApiLocked) {
                    const isSync = inputs.syncSttWithTtsKey ? inputs.syncSttWithTtsKey.checked : false;
                    localStorage.setItem('readingToolSyncSttWithTts', isSync ? 'true' : 'false');
                    if (!isSync && inputs.sttApiKey) {
                        localStorage.setItem('readingToolSTTApiKey', inputs.sttApiKey.value.trim());
                    }
                }
                if (typeof updateLockUI === 'function') updateLockUI();
                if (typeof updateSpeechRecognitionButtonVisibility === 'function') updateSpeechRecognitionButtonVisibility();

                // Display confirmation toast for exactly 3 seconds
                const toast = document.getElementById('stt-save-toast');
                if (toast) {
                    toast.style.display = 'flex';
                    if (sttSaveToastTimer) clearTimeout(sttSaveToastTimer);
                    sttSaveToastTimer = setTimeout(() => {
                        toast.style.display = 'none';
                    }, 1500);
                }
            });
        }

        /* ==========================================================================
           EXTERNAL REFERRER EXIT BUTTON ('X') LOGIC
           ========================================================================== */
        function returnToHub() {
            const urlParams = new URLSearchParams(window.location.search);
            const exitUrl = urlParams.get('exit') || urlParams.get('hub') || urlParams.get('ref');
            
            if (window.history.length > 1) {
                window.history.back();
            } else if (exitUrl && exitUrl.startsWith('http')) {
                window.location.href = exitUrl;
            } else if (document.referrer && !document.referrer.includes(window.location.hostname)) {
                window.location.href = document.referrer;
            } else {
                try { window.close(); } catch (e) {}
                setTimeout(() => { window.location.href = 'https://kidmedia.net/'; }, 300);
            }
        }

        function checkExternalReferrer() {
            const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                          window.navigator.standalone === true ||
                          (document.referrer && document.referrer.includes('android-app://'));
            if (isPWA) return; // NEVER show in PWA

            const urlParams = new URLSearchParams(window.location.search);
            const hasRefParam = urlParams.has('ref') || urlParams.has('hub') || urlParams.has('from') || urlParams.has('exit');
            const hasExternalReferrer = document.referrer && !document.referrer.includes(window.location.hostname);

            if (hasRefParam || hasExternalReferrer) {
                const btn = document.getElementById('btn-return-hub');
                const teacherScreen = document.getElementById('screen-teacher');
                if (btn) btn.style.display = 'inline-flex';
                if (teacherScreen) teacherScreen.classList.add('has-return-hub');
            }
        }

        const btnReturnHub = document.getElementById('btn-return-hub');
        if (btnReturnHub) {
            btnReturnHub.addEventListener('click', returnToHub);
        }

        /* ==========================================================================
           REWARDS & STUDENT PROFILES EVENT LISTENERS
           ========================================================================== */
        const chkRewards = document.getElementById('set-rewards-enabled');
        if (chkRewards) {
            chkRewards.addEventListener('change', () => {
                state.rewardsEnabled = chkRewards.checked;
                saveRewardsData();
                updateRewardsUI();
            });
        }

        const btnAddStudent = document.getElementById('btn-add-student');
        const inputNewStudent = document.getElementById('new-student-name-input');
        if (btnAddStudent && inputNewStudent) {
            const handleAdd = () => {
                const val = inputNewStudent.value.trim();
                if (val) {
                    addNewStudent(val);
                    inputNewStudent.value = '';
                }
            };
            btnAddStudent.addEventListener('click', handleAdd);
            inputNewStudent.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd();
                }
            });
        }

        // Screen 2 Student Pill & Quick-Switch Popover
        const btnStudentPill = document.getElementById('btn-student-pill');
        const popover = document.getElementById('student-quick-popover');
        const btnClosePopover = document.getElementById('btn-close-popover');

        if (btnStudentPill && popover) {
            btnStudentPill.addEventListener('click', (e) => {
                e.stopPropagation();
                popover.style.display = popover.style.display === 'none' ? 'block' : 'none';
            });
        }

        if (btnClosePopover && popover) {
            btnClosePopover.addEventListener('click', (e) => {
                e.stopPropagation();
                popover.style.display = 'none';
            });
        }

        document.addEventListener('click', (e) => {
            if (popover && popover.style.display !== 'none') {
                if (!popover.contains(e.target) && e.target !== btnStudentPill && !btnStudentPill.contains(e.target)) {
                    popover.style.display = 'none';
                }
            }
        });

        const popoverAddBtn = document.getElementById('btn-popover-add-student');
        const popoverAddInput = document.getElementById('popover-new-student-input');
        if (popoverAddBtn && popoverAddInput) {
            const handlePopoverAdd = () => {
                const val = popoverAddInput.value.trim();
                if (val) {
                    addNewStudent(val);
                    popoverAddInput.value = '';
                    if (popover) popover.style.display = 'none';
                }
            };
            popoverAddBtn.addEventListener('click', handlePopoverAdd);
            popoverAddInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handlePopoverAdd();
                }
            });
        }

        /* ==========================================================================
           STICKER GENERATOR, CANVAS & CAMERA LOGIC
           ========================================================================== */
        let cameraStream = null;
        let capturedPhotoCanvas = null;

        function renderStickerCanvas() {
            const canvas = document.getElementById('sticker-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;
            const center = width / 2;

            ctx.clearRect(0, 0, width, height);

            // 1. Outer Starburst / Scalloped Badge Background
            ctx.save();
            ctx.beginPath();
            ctx.arc(center, center, center - 10, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            // Outer thick decorative gradient border
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#3b82f6');
            gradient.addColorStop(0.5, '#f59e0b');
            gradient.addColorStop(1, '#ec4899');
            ctx.lineWidth = 14;
            ctx.strokeStyle = gradient;
            ctx.stroke();

            // Inner dotted gold circle
            ctx.beginPath();
            ctx.arc(center, center, center - 24, 0, Math.PI * 2);
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 8]);
            ctx.strokeStyle = '#f59e0b';
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();

            // 2. Soft pastel background fill
            ctx.save();
            ctx.beginPath();
            ctx.arc(center, center, center - 30, 0, Math.PI * 2);
            const bgGrad = ctx.createRadialGradient(center, center, 40, center, center, center - 30);
            bgGrad.addColorStop(0, '#fef9c3');
            bgGrad.addColorStop(1, '#dbeafe');
            ctx.fillStyle = bgGrad;
            ctx.fill();
            ctx.restore();

            // 3. Header text: Student Name & Title
            ctx.save();
            ctx.textAlign = 'center';
            ctx.fillStyle = '#1e3a8a';
            ctx.font = 'bold 28px "Comic Neue", "Kids", "Open Sans", sans-serif';
            const studentDefault = typeof getText === 'function' ? getText('default_student_name') : 'ΜΑΘΗΤΗΣ';
            const studentTitle = (state.currentStudent || studentDefault).toUpperCase();
            const bravoText = typeof getText === 'function' ? getText('sticker_bravo') : 'ΜΠΡΑΒΟ';
            ctx.fillText(`${bravoText} ${studentTitle}!`, center, 95);

            ctx.font = 'bold 18px "Comic Neue", "Kids", "Open Sans", sans-serif';
            ctx.fillStyle = '#d97706';
            const superReaderText = typeof getText === 'function' ? getText('sticker_super_reader') : '🌟 SUPER ΑΝΑΓΝΩΣΤΗΣ 🌟';
            ctx.fillText(superReaderText, center, 125);
            ctx.restore();

            // 4. Center Avatar: Photo if captured, otherwise large Emoji
            if (capturedPhotoCanvas) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(center, center + 15, 90, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(capturedPhotoCanvas, center - 90, center + 15 - 90, 180, 180);
                ctx.restore();

                // Photo border
                ctx.save();
                ctx.beginPath();
                ctx.arc(center, center + 15, 90, 0, Math.PI * 2);
                ctx.lineWidth = 6;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#f59e0b';
                ctx.stroke();
                ctx.restore();
            } else {
                ctx.save();
                ctx.font = '110px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(state.activeStickerEmoji || '🏆', center, center + 20);
                ctx.restore();
            }

            // 5. Footer: Date & Kidmedia micro-emblem
            ctx.save();
            ctx.textAlign = 'center';
            ctx.fillStyle = '#64748b';
            ctx.font = '14px "Open Sans", sans-serif';
            const localeStr = currentLang === 'el' ? 'el-GR' : (currentLang || 'en-US');
            const today = new Date().toLocaleDateString(localeStr);
            ctx.fillText(`Kidmedia Sesat • ${today}`, center, height - 60);
            ctx.restore();
        }

        async function startCamera() {
            const video = document.getElementById('camera-stream-video');
            const container = document.getElementById('camera-preview-container');
            const cameraBtnText = document.getElementById('camera-btn-text');
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                const notSuppMsg = typeof getText === 'function' ? getText('camera_not_supported') : "Η κάμερα δεν υποστηρίζεται σε αυτή τη συσκευή / πρόγραμμα περιήγησης.";
                alert(notSuppMsg);
                return;
            }
            try {
                cameraStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 400 }, height: { ideal: 400 } }
                });
                if (video) {
                    video.srcObject = cameraStream;
                    video.play();
                }
                if (container) container.style.display = 'flex';
                if (cameraBtnText) cameraBtnText.textContent = typeof getText === 'function' ? getText('camera_close') : 'Κλείσιμο Κάμερας';
            } catch (e) {
                console.warn("Camera error:", e);
                const accessErrMsg = typeof getText === 'function' ? getText('camera_access_error') : "Δεν ήταν δυνατή η πρόσβαση στην κάμερα.";
                alert(accessErrMsg);
            }
        }

        function stopCamera() {
            if (cameraStream) {
                cameraStream.getTracks().forEach(t => t.stop());
                cameraStream = null;
            }
            const container = document.getElementById('camera-preview-container');
            if (container) container.style.display = 'none';
            const cameraBtnText = document.getElementById('camera-btn-text');
            if (cameraBtnText) cameraBtnText.textContent = typeof getText === 'function' ? getText('btn_take_selfie') : 'Φωτογραφία με Κάμερα';
        }

        function capturePhoto() {
            const video = document.getElementById('camera-stream-video');
            if (!video) return;
            const offCanvas = document.createElement('canvas');
            const size = Math.min(video.videoWidth || 300, video.videoHeight || 300);
            offCanvas.width = size;
            offCanvas.height = size;
            const ctx = offCanvas.getContext('2d');
            
            const sx = (video.videoWidth - size) / 2;
            const sy = (video.videoHeight - size) / 2;
            ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

            capturedPhotoCanvas = offCanvas;
            stopCamera();

            const btnRemove = document.getElementById('btn-remove-photo');
            if (btnRemove) btnRemove.style.display = 'inline-flex';

            renderStickerCanvas();
        }

        function removePhoto() {
            capturedPhotoCanvas = null;
            const btnRemove = document.getElementById('btn-remove-photo');
            if (btnRemove) btnRemove.style.display = 'none';
            renderStickerCanvas();
        }

        function printSticker() {
            const canvas = document.getElementById('sticker-canvas');
            if (!canvas) return;
            const dataUrl = canvas.toDataURL('image/png');
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                document.body.classList.add('printing-sticker');
                window.print();
                document.body.classList.remove('printing-sticker');
                return;
            }
            const stickerWord = typeof getText === 'function' ? getText('modal_sticker_title') : 'Αυτοκόλλητο';
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${stickerWord} - ${escapeHtml(state.currentStudent)}</title>
                    <style>
                        @page { size: auto; margin: 10mm; }
                        body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
                        img { width: 100mm; height: 100mm; object-fit: contain; }
                        p { margin-top: 10px; color: #666; font-size: 13px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <img src="${dataUrl}" onload="window.print();window.close();">
                    <p>Kidmedia Reader • Erasmus+</p>
                </body>
                </html>
            `);
            printWindow.document.close();
        }

        function downloadSticker() {
            const canvas = document.getElementById('sticker-canvas');
            if (!canvas) return;
            const dataUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `Sticker_${state.currentStudent || 'Student'}_100pts.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        function redeemStickerPoints() {
            if (typeof deductStudentPoints === 'function') {
                deductStudentPoints(100);
            }
            if (typeof playSuccessArcadeSound === 'function') {
                playSuccessArcadeSound(1);
            }
            closeStickerModal();
            let successMsg = typeof getText === 'function' ? getText('sticker_redeem_success') : '🎉 Συγχαρητήρια {name}! Εξαργύρωσες 100 πόντους και πήρες το αυτοκόλλητό σου!';
            successMsg = successMsg.replace('{name}', state.currentStudent || '');
            alert(successMsg);
        }

        function openStickerModal() {
            const modal = document.getElementById('sticker-modal');
            if (modal) {
                modal.style.display = 'flex';
                renderStickerCanvas();
            }
        }

        function closeStickerModal() {
            stopCamera();
            const modal = document.getElementById('sticker-modal');
            if (modal) modal.style.display = 'none';
        }

        // Sticker Modal Buttons
        const btnClaimSticker = document.getElementById('btn-claim-sticker');
        if (btnClaimSticker) btnClaimSticker.addEventListener('click', openStickerModal);

        const btnCloseStickerCorner = document.getElementById('btn-close-sticker-corner');
        if (btnCloseStickerCorner) btnCloseStickerCorner.addEventListener('click', closeStickerModal);

        const btnPrintSticker = document.getElementById('btn-print-sticker');
        if (btnPrintSticker) btnPrintSticker.addEventListener('click', printSticker);

        const btnDownloadSticker = document.getElementById('btn-download-sticker');
        if (btnDownloadSticker) btnDownloadSticker.addEventListener('click', downloadSticker);

        const btnRedeemSticker = document.getElementById('btn-redeem-sticker');
        if (btnRedeemSticker) btnRedeemSticker.addEventListener('click', redeemStickerPoints);

        const btnToggleCamera = document.getElementById('btn-toggle-camera');
        if (btnToggleCamera) {
            btnToggleCamera.addEventListener('click', () => {
                if (cameraStream) stopCamera();
                else startCamera();
            });
        }

        const btnCapturePhoto = document.getElementById('btn-capture-photo');
        if (btnCapturePhoto) btnCapturePhoto.addEventListener('click', capturePhoto);

        const btnRemovePhoto = document.getElementById('btn-remove-photo');
        if (btnRemovePhoto) btnRemovePhoto.addEventListener('click', removePhoto);

        // Emoji buttons
        const emojiBtns = document.querySelectorAll('.sticker-emoji-btn:not(.dice-btn)');
        emojiBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                emojiBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.activeStickerEmoji = btn.getAttribute('data-emoji') || '🏆';
                capturedPhotoCanvas = null; // switch to emoji
                const btnRemove = document.getElementById('btn-remove-photo');
                if (btnRemove) btnRemove.style.display = 'none';
                renderStickerCanvas();
            });
        });

        const btnDice = document.getElementById('btn-random-sticker-emoji');
        if (btnDice) {
            btnDice.addEventListener('click', () => {
                const emojis = ['🏆', '🚀', '🦁', '🦄', '🌟', '👑', '🎨', '🐬', '🦖', '🦉', '🍦', '🎈', '🐼', '🎸', '🥇', '🎯', '🌈'];
                const rand = emojis[Math.floor(Math.random() * emojis.length)];
                state.activeStickerEmoji = rand;
                emojiBtns.forEach(b => {
                    if (b.getAttribute('data-emoji') === rand) b.classList.add('active');
                    else b.classList.remove('active');
                });
                capturedPhotoCanvas = null;
                const btnRemove = document.getElementById('btn-remove-photo');
                if (btnRemove) btnRemove.style.display = 'none';
                renderStickerCanvas();
            });
        }
