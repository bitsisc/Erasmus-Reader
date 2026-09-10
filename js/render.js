// js/render.js

        // --- Helpers ---
        function hexToRgb(hex) {
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function(m, r, g, b) { return r + r + g + g + b + b; });
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0,0,0';
        }

        // --- SMART SCROLLING ---
        function scrollIfNeeded(target) {
            const container = document.getElementById('reading-area');
            if (!container) return;
            const targetRect = target.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            if (targetRect.bottom > containerRect.bottom - (containerRect.height * 0.2) || 
                targetRect.top < containerRect.top + (containerRect.height * 0.1)) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        function applySettings() {
            state.fontFamily = inputs.font.value;
            state.fontSize = inputs.size.value + 'rem';
            
            // Handle Colors
            const hexColor = inputs.color.value;
            state.textColor = hexColor;
            
            // SMART HIGHLIGHT COLOR
            let r = parseInt(hexColor.slice(1, 3), 16);
            let g = parseInt(hexColor.slice(3, 5), 16);
            let b = parseInt(hexColor.slice(5, 7), 16);
            let isReddish = (r > 120 && (r - g) > 40 && (r - b) > 40);
            
            display.root.style.setProperty('--highlight-text-color', isReddish ? '#000000' : '#e53935');
            display.root.style.setProperty('--highlight-shadow', isReddish ? 'rgba(0,0,0,0.3)' : 'rgba(229, 57, 53, 0.3)');

            state.fontWeight = inputs.bold.checked ? 'bold' : 'normal';
            state.veilColorRGB = hexToRgb(inputs.veilColor.value);
            state.textBgColor = inputs.textBgColor ? inputs.textBgColor.value : '#FDF9E3';
            state.appBgColor = inputs.appBgColor ? inputs.appBgColor.value : '#E8ECEF';

            const selectedImageMode = document.querySelector('input[name="image-mode"]:checked');
            if (selectedImageMode) {
                state.imageMode = parseInt(selectedImageMode.value, 10) || 0;
            }

            state.imageSize = inputs.imageSize ? (inputs.imageSize.value + 'px') : '50px';

            display.root.style.setProperty('--dynamic-font-family', state.fontFamily);
            display.root.style.setProperty('--dynamic-font-size', state.fontSize);
            display.root.style.setProperty('--dynamic-text-color', state.textColor);
            display.root.style.setProperty('--dynamic-text-bg-color', state.textBgColor);
            display.root.style.setProperty('--dynamic-app-bg-color', state.appBgColor);
            display.root.style.setProperty('--dynamic-font-weight', state.fontWeight);
            display.root.style.setProperty('--veil-color-rgb', state.veilColorRGB);
            display.root.style.setProperty('--dynamic-image-size', state.imageSize);
        }

        function syncFlowUI() {
            const btnReadAll = document.getElementById('btn-read-all');
            const btnModeToggle = document.getElementById('btn-mode-toggle');
            const veilControls = document.querySelector('.veil-controls');
            const btnFlowToggle = document.getElementById('btn-flow-toggle');
            const btnPrev = document.getElementById('btn-prev');
            const btnSpeakCurrent = document.getElementById('btn-speak-current');
            const btnNext = document.getElementById('btn-next');
            const navSpacers = document.querySelectorAll('.nav-spacer');
            const getText = (key) => (i18n[currentLang] && i18n[currentLang][key]) ? i18n[currentLang][key] : (i18n['en'][key] || i18n['el'][key]);

            if (state.readFlow === 'continuous') {
                // Natural / Continuous flow
                if (btnReadAll) btnReadAll.style.display = 'inline-flex';
                if (btnModeToggle) btnModeToggle.style.display = 'none';
                if (veilControls) {
                    veilControls.style.visibility = 'hidden';
                    veilControls.style.pointerEvents = 'none';
                }
                if (btnPrev) btnPrev.style.display = 'none';
                if (btnSpeakCurrent) btnSpeakCurrent.style.display = 'none';
                if (btnNext) btnNext.style.display = 'none';
                navSpacers.forEach(s => s.style.display = 'none');

                state.veilActive = false;
                updateVeilUI();
                if (btnFlowToggle) {
                    btnFlowToggle.textContent = getText('flow_continuous');
                    btnFlowToggle.className = 'student-btn student-btn-wide flow-continuous';
                }
            } else {
                // Step-by-step flow
                if (btnReadAll) btnReadAll.style.display = 'none';
                if (btnModeToggle) btnModeToggle.style.display = 'inline-flex';
                if (veilControls) {
                    veilControls.style.visibility = 'visible';
                    veilControls.style.pointerEvents = 'auto';
                    veilControls.style.display = 'flex';
                }
                if (btnPrev) btnPrev.style.display = 'inline-flex';
                if (btnSpeakCurrent) btnSpeakCurrent.style.display = 'inline-flex';
                if (btnNext) btnNext.style.display = 'inline-flex';
                navSpacers.forEach(s => s.style.display = '');

                state.veilActive = true;
                updateVeilUI();
                if (btnFlowToggle) {
                    btnFlowToggle.textContent = getText('flow_step');
                    btnFlowToggle.className = 'student-btn student-btn-wide flow-step';
                }
            }
        }

        function renderText() {
            display.area.innerHTML = '';
            state.flatElements = [];
            
            state.parsedData.forEach((paragraphData) => {
                const paragraphDiv = document.createElement('div');
                paragraphDiv.className = 'paragraph-block';
                
                let currentSentenceSpan = document.createElement('span');
                currentSentenceSpan.className = 'sentence';
                paragraphDiv.appendChild(currentSentenceSpan);
                
                paragraphData.forEach((wordObj, wIndex) => {
                    const wordSpan = document.createElement('span');
                    wordSpan.className = 'word';
                    
                    if (state.readFlow === 'step' && state.mode === 'syllable') {
                        // Syllable mode in step-by-step
                        wordObj.syllables.forEach((syl) => {
                            const sSpan = document.createElement('span');
                            sSpan.className = 'syllable';
                            sSpan.textContent = syl;
                            wordSpan.appendChild(sSpan);
                            state.flatElements.push(sSpan);
                        });
                    } else if (state.readFlow === 'step' && state.mode === 'word') {
                        // Word mode in step-by-step
                        wordSpan.textContent = wordObj.fullWord;
                        state.flatElements.push(wordSpan);
                    } else if (state.readFlow === 'step' && state.mode === 'sentence') {
                        // Sentence mode in step-by-step
                        wordSpan.textContent = wordObj.fullWord;
                    } else {
                        // Continuous natural flow: entire words rendered and tracked for red karaoke highlight
                        wordSpan.textContent = wordObj.fullWord;
                        state.flatElements.push(wordSpan);
                    }
                    
                    // Image matching and injection
                    let imageId = null;
                    if (state.imageMode === 1 || state.imageMode === 2) {
                        const cleanWord = wordObj.fullWord.replace(/[\p{P}\p{S}]/gu, '').trim();
                        const lowerWord = cleanWord.toLowerCase();
                        
                        let shouldShowImage = false;
                        if (state.imageMode === 1) {
                            shouldShowImage = true;
                        } else if (state.imageMode === 2) {
                            if (state.sheetUnknownWords && (state.sheetUnknownWords.has(lowerWord) || state.sheetUnknownWords.has(cleanWord))) {
                                shouldShowImage = true;
                            }
                        }
                        
                        if (shouldShowImage && typeof wordToImageMap !== 'undefined') {
                            imageId = wordToImageMap[lowerWord] || wordToImageMap[cleanWord] || null;
                        }
                    }

                    if (imageId) {
                        const wrapper = document.createElement('span');
                        wrapper.className = 'word-image-wrapper';

                        const img = document.createElement('img');
                        img.src = `./images/words/Images/${imageId}.png`;
                        img.alt = wordObj.fullWord;
                        img.className = 'word-image';

                        wrapper.appendChild(img);
                        wrapper.appendChild(wordSpan);
                        currentSentenceSpan.appendChild(wrapper);
                    } else {
                        currentSentenceSpan.appendChild(wordSpan);
                    }
                    
                    // Check if this word ends the sentence
                    const cleanWordEnd = wordObj.fullWord.trim();
                    const isEnding = /[.!?;\u037E…][»"”')\]]?$/.test(cleanWordEnd);
                    if (isEnding && wIndex < paragraphData.length - 1) {
                        if (state.readFlow === 'step' && state.mode === 'sentence') {
                            state.flatElements.push(currentSentenceSpan);
                        }
                        currentSentenceSpan = document.createElement('span');
                        currentSentenceSpan.className = 'sentence';
                        paragraphDiv.appendChild(currentSentenceSpan);
                    }
                });
                
                // Push the last sentence of the paragraph for step sentence mode
                if (currentSentenceSpan.childNodes.length > 0) {
                    if (state.readFlow === 'step' && state.mode === 'sentence') {
                        state.flatElements.push(currentSentenceSpan);
                    }
                }
                
                display.area.appendChild(paragraphDiv);
            });
            
            state.currentIndex = -1;
            updateHighlight();
        }

        function updateHighlight() {
            document.querySelectorAll('.focus-highlight').forEach(el => el.classList.remove('focus-highlight'));
            if (state.readFlow === 'continuous') return; 

            if (state.currentIndex >= 0 && state.currentIndex < state.flatElements.length) {
                const target = state.flatElements[state.currentIndex];
                let highlightTarget = target;
                
                if (state.mode === 'syllable') {
                    // Highlight strictly the syllable element
                    highlightTarget = target;
                } else if (state.mode === 'word') {
                    if (target.parentElement && target.parentElement.classList.contains('word-image-wrapper')) {
                        highlightTarget = target.parentElement;
                    }
                } else if (state.mode === 'sentence') {
                    highlightTarget = target;
                }

                if (state.veilActive) {
                    highlightTarget.classList.add('focus-highlight');
                    scrollIfNeeded(highlightTarget); 
                } else {
                    scrollIfNeeded(highlightTarget);
                }
            }
        }

        function updateVeilUI() {
            const btn = document.getElementById('btn-toggle-veil');
            const icon = btn ? btn.querySelector('i') : null;
            
            display.root.style.setProperty('--veil-opacity', state.veilActive ? state.veilOpacity : 0);
            
            if (state.veilActive) {
                if (btn) btn.className = 'veil-on';
                if (icon) icon.className = 'fa-solid fa-check';
                document.body.classList.add('veil-active');
            } else {
                if (btn) btn.className = 'veil-off';
                if (icon) icon.className = 'fa-solid fa-xmark';
                document.body.classList.remove('veil-active');
            }
            updateHighlight();
        }
        
        let chirpWarningTimeout = null;
        function checkVoiceWarning() {
            const warningEl = document.getElementById('chirp-warning');
            if (!warningEl) return;
            
            const selectedPremiumVoice = inputs.premiumVoice.value || "";
            const isGenerative = selectedPremiumVoice.toLowerCase().includes('chirp') || selectedPremiumVoice.toLowerCase().includes('neural');
            
            if (chirpWarningTimeout) {
                clearTimeout(chirpWarningTimeout);
                chirpWarningTimeout = null;
            }

            if (state.readFlow === 'step' && state.mode === 'syllable' && isGenerative && getActualApiKey()) {
                warningEl.style.display = 'block';
                warningEl.style.opacity = '1';
                warningEl.style.transition = 'opacity 0.5s ease-out';

                chirpWarningTimeout = setTimeout(() => {
                    warningEl.style.opacity = '0';
                    setTimeout(() => {
                        if (warningEl.style.opacity === '0') {
                            warningEl.style.display = 'none';
                        }
                    }, 500);
                    chirpWarningTimeout = null;
                }, 3000);
            } else {
                warningEl.style.display = 'none';
            }
        }

        function stopAutoRead() {
            state.isAutoReading = false;
            stopSpeech();
            if (state.autoReadTimeout) {
                clearTimeout(state.autoReadTimeout);
                state.autoReadTimeout = null;
            }
            const btnReadAll = document.getElementById('btn-read-all');
            if (btnReadAll) {
                btnReadAll.classList.remove('reading');
                btnReadAll.innerHTML = '<i class="fa-solid fa-bullhorn"></i>';
            }
            display.area.style.outline = "none";
            display.area.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
            if (state.readFlow === 'step') {
                updateHighlight();
            } else {
                document.querySelectorAll('.spoken-highlight').forEach(el => el.classList.remove('spoken-highlight'));
            }
        }

        function startAutoRead() {
            // Natural / Continuous reading only
            if (state.readFlow !== 'continuous') return;
            state.isAutoReading = true;
            state.veilActive = false;
            updateVeilUI();

            const btnReadAll = document.getElementById('btn-read-all');
            if (btnReadAll) {
                btnReadAll.classList.add('reading');
                btnReadAll.innerHTML = '<i class="fa-solid fa-stop"></i>';
            }

            document.querySelectorAll('.focus-highlight').forEach(el => el.classList.remove('focus-highlight'));
            display.area.style.outline = "4px solid #4fc3f7";
            display.area.style.boxShadow = "0 0 20px rgba(79, 195, 247, 0.6)";
            display.area.style.borderRadius = "20px";
            
            speakContinuousFlow(state.flatElements, () => {
                stopAutoRead();
            });
        }
