// js/tts.js


        // Dynamic Premium Voice Fetcher
        async function loadPremiumVoices() {
            const apiKey = getActualApiKey();
            if (!apiKey) {
                inputs.premiumVoice.innerHTML = `<option value="">${getText('voice_enter_api_key')}</option>`;
                return;
            }
            
            inputs.premiumVoice.innerHTML = `<option value="">${getText('voice_loading')}</option>`;

            try {
                const locale = ttsLocales[currentLang] || 'en-US';
                const response = await fetch(`https://texttospeech.googleapis.com/v1/voices?key=${apiKey}&languageCode=${locale}`);
                if (!response.ok) throw new Error('API Error');
                const data = await response.json();
                
                const voices = data.voices || [];
                // Sort: Neural2 > Wavenet > Standard
                voices.sort((a, b) => {
                    const getScore = (v) => v.name.includes('Neural2') ? 3 : (v.name.includes('Wavenet') ? 2 : 1);
                    return getScore(b) - getScore(a);
                });

                inputs.premiumVoice.innerHTML = '';
                if(voices.length === 0) {
                    inputs.premiumVoice.innerHTML = `<option value="">${getText('voice_no_voices')}</option>`;
                    return;
                }

                voices.forEach(v => {
                    const opt = document.createElement('option');
                    opt.value = v.name;
                    let typeName = v.name.includes('Neural2') ? '🌟 Neural2' : (v.name.includes('Wavenet') ? '⭐ Wavenet' : 'Standard');
                    let gender = v.ssmlGender === 'FEMALE' ? getText('voice_gender_female') : (v.ssmlGender === 'MALE' ? getText('voice_gender_male') : getText('voice_gender_other'));
                    opt.textContent = `${typeName} - ${gender} (${v.name})`;
                    inputs.premiumVoice.appendChild(opt);
                });

                const savedVoice = localStorage.getItem(`premiumVoice_${currentLang}`);
                if (savedVoice && voices.some(v => v.name === savedVoice)) {
                    inputs.premiumVoice.value = savedVoice;
                } else {
                    inputs.premiumVoice.value = voices[0].name;
                    localStorage.setItem(`premiumVoice_${currentLang}`, voices[0].name);
                }
            } catch(e) {
                inputs.premiumVoice.innerHTML = `<option value="">${getText('voice_error')}</option>`;
            }
        }

        
        inputs.apiKey.addEventListener('change', (e) => {
            if(!isApiLocked) {
                localStorage.setItem('readingToolApiKey', e.target.value.trim());
                updateUsageUI();
                loadPremiumVoices();
            }
        });

        inputs.premiumVoice.addEventListener('change', (e) => {
            localStorage.setItem(`premiumVoice_${currentLang}`, e.target.value);
            checkVoiceWarning();
        });

        document.getElementById('btn-load-premium-voices').addEventListener('click', loadPremiumVoices);

        const btnToggleKey = document.getElementById('btn-toggle-key-view');
        btnToggleKey.addEventListener('click', () => {
            if(isApiLocked) return;
            if (inputs.apiKey.type === "password") {
                inputs.apiKey.type = "text";
                btnToggleKey.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
            } else {
                inputs.apiKey.type = "password";
                btnToggleKey.innerHTML = '<i class="fa-solid fa-eye"></i>';
            }
        });

        // --- Voices ---
        let populateVoicesRetryCount = 0;
        function populateVoices() {
            if (typeof speechSynthesis === 'undefined') return;
            const voices = speechSynthesis.getVoices();
            if (voices.length === 0) {
                if (populateVoicesRetryCount < 10) {
                    populateVoicesRetryCount++;
                    setTimeout(populateVoices, 150);
                }
                return;
            }
            populateVoicesRetryCount = 0;

            inputs.voice.innerHTML = '';

            const langCode = currentLang || 'el';
            const targetLocale = ttsLocales[langCode] || 'el-GR';
            const langPrefix = targetLocale.split('-')[0].toLowerCase();

            const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langPrefix));
            const otherVoices = voices.filter(v => !v.lang.toLowerCase().startsWith(langPrefix));

            const googleLangVoices = langVoices.filter(v => v.name.includes('Google'));
            const localLangVoices = langVoices.filter(v => !v.name.includes('Google'));

            const allVoicesSorted = [...googleLangVoices, ...localLangVoices, ...otherVoices];

            allVoicesSorted.forEach(voice => {
                const option = document.createElement('option');
                option.textContent = `${voice.name} (${voice.lang})`;
                option.value = voice.name;
                inputs.voice.appendChild(option);
            });

            const warningEl = document.getElementById('voice-warning');
            if (warningEl) {
                warningEl.style.display = googleLangVoices.length === 0 ? 'block' : 'none';
            }

            const googleDefault = googleLangVoices[0];
            const localDefault = localLangVoices[0];
            if (googleDefault) inputs.voice.value = googleDefault.name;
            else if (localDefault) inputs.voice.value = localDefault.name;
            else if (voices.length > 0) inputs.voice.value = voices[0].name;
        }

        populateVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = populateVoices;
        }

        // ========================================================================
        // DUAL PIPELINE TTS HACK 
        // ========================================================================
        
        function applyTTSPipeline(cleanText, voiceName, isContinuous, lang = null) {
            const currentL = lang || (typeof currentLang !== 'undefined' ? currentLang : 'el');
            // Remove syllable pipe delimiters from spoken text
            const textWithoutPipes = cleanText.replace(/\|/g, "");
            
            // Greek-specific vowel/diphthong adjustments ONLY apply for Greek
            const safeVoiceName = voiceName ? voiceName.toLowerCase() : '';
            const isGreekVoice = safeVoiceName.startsWith('el') || currentL === 'el';
            
            if (isGreekVoice) {
                // Καθαρίζουμε τα σύμβολα και μετατρέπουμε σε ΜΙΚΡΑ (για να αποφύγουμε προβλήματα με το 'ΗΗ' κλπ)
                const pureText = textWithoutPipes.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase();
                
                // Καθαρίζουμε τους τόνους (NFD normalization) για να μην διαβάζει "γιώτα με τόνο" κλπ.
                const unaccented = pureText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                if (unaccented.length === 1 || unaccented.length === 2) {
                    const greekVowels = ['α', 'ε', 'η', 'ι', 'ϊ', 'ο', 'υ', 'ϋ', 'ω'];
                    const greekDiphthongs = ['αι', 'ει', 'οι', 'ου', 'υι'];
                    
                    if ((unaccented.length === 1 && greekVowels.includes(unaccented)) ||
                        (unaccented.length === 2 && greekDiphthongs.includes(unaccented))) {
                        
                        const isLocalVoice = !safeVoiceName.includes('wavenet') && !safeVoiceName.includes('standard') && !safeVoiceName.includes('neural') && !safeVoiceName.includes('chirp');

                        if (isContinuous || isLocalVoice) {
                            // Σε Συνεχή Ροή Ή σε Τοπικές Φωνές (OS): Προσθέτουμε τελεία για να μην διαβάζει "όμικρον", "ήτα"
                            if (unaccented === 'α') return 'α.';
                            if (unaccented === 'ε' || unaccented === 'αι') return 'αι.';
                            if (['ι', 'η', 'υ', 'ει', 'οι', 'υι', 'ϊ', 'ϋ'].includes(unaccented)) return 'η.';
                            if (unaccented === 'ο' || unaccented === 'ω') return 'ο.';
                            if (unaccented === 'ου') return 'ου.';
                        } else {
                            // Στο Βήμα-Βήμα με Google API (Wavenet/Chirp): Εφαρμόζουμε τον Διπλασιασμό
                            if (unaccented === 'α') return 'αα';
                            if (unaccented === 'ε' || unaccented === 'αι') return 'εε';
                            if (['ι', 'η', 'υ', 'ει', 'οι', 'υι', 'ϊ', 'ϋ'].includes(unaccented)) return 'ιι';
                            if (unaccented === 'ο' || unaccented === 'ω') return 'οο';
                            if (unaccented === 'ου') return 'ουου';
                        }
                    }
                }
            }
            return textWithoutPipes;
        }

        function fixPremiumPronunciation(text, voiceName, isContinuous = false, lang = null) {
            let clean = text.trim();
            let safeText = clean.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            
            // Εφαρμογή του Pipeline 
            let processed = applyTTSPipeline(safeText, voiceName, isContinuous, lang);
            return processed;
        }

        // AUDIO ENGINE
        let sharedAudioCtx = null;
        function getSharedAudioContext() {
            if (!sharedAudioCtx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    sharedAudioCtx = new AudioContextClass({ latencyHint: 'interactive' });
                }
            }
            if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
                sharedAudioCtx.resume().catch(() => {});
            }
            return sharedAudioCtx;
        }
        let currentPremiumAudio = null;

        function base64ToArrayBuffer(base64) {
            const binaryString = window.atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        }

        function stopSpeech() {
            window.speechSynthesis.cancel();
            if (currentPremiumAudio) {
                currentPremiumAudio.pause();
                currentPremiumAudio.onended = null;
                currentPremiumAudio.onerror = null;
                currentPremiumAudio.ontimeupdate = null;
                currentPremiumAudio = null;
            }
            if (state.mathSyncInterval) {
                clearInterval(state.mathSyncInterval);
                state.mathSyncInterval = null;
            }
            document.querySelectorAll('.spoken-highlight').forEach(el => el.classList.remove('spoken-highlight'));
        }

        // Function for Step-by-Step (awaits complete playback before firing callback)
        async function speakStep(text, onEndCallback = null) {
            stopSpeech();
            const cleanText = text ? text.replace(/\|/g, "").trim() : "";
            if (!cleanText) { if (onEndCallback) onEndCallback(); return; }

            let rate = parseFloat(inputs.rate.value) * 0.7;
            if (state.mode === 'syllable' && cleanText.length < 15) {
                rate = Math.max(0.25, rate - 0.2); 
            }

            const apiKey = getActualApiKey();
            let voiceObj = null;
            if (apiKey) {
                try {
                    const locale = ttsLocales[currentLang] || 'en-US';
                    voiceObj = { languageCode: locale };
                    const selectedPremiumVoice = inputs.premiumVoice.value;
                    if (selectedPremiumVoice) {
                        voiceObj.name = selectedPremiumVoice;
                        const match = selectedPremiumVoice.match(/^([a-z]{2,3}-[A-Z]{2})/);
                        if (match) voiceObj.languageCode = match[1];
                    } else {
                        voiceObj.name = (currentLang === 'el') ? 'el-GR-Wavenet-A' : (locale + '-Neural2-F');
                    }

                    const isGenerative = voiceObj.name && !voiceObj.name.includes('Wavenet') && !voiceObj.name.includes('Standard');
                    
                    // Κλείδωμα ταχύτητας για Chirp/Neural2
                    if (isGenerative) {
                        rate = Math.max(0.6, rate); 
                    }

                    // Εφαρμογή της συνάρτησης DUAL PIPELINE
                    const processedText = fixPremiumPronunciation(cleanText, voiceObj.name, false, currentLang);
                    let ssmlText = "";

                    // ΛΥΣΗ ΓΙΑ ΚΑΤΑΠΟΣΗ ΣΥΛΛΑΒΩΝ
                    if (isGenerative) {
                        ssmlText = `<speak><break time="400ms"/>${processedText}<break time="400ms"/></speak>`;
                    } else {
                        ssmlText = `<speak>${processedText}<break time="200ms"/></speak>`;
                    }

                    const payload = {
                        input: { ssml: ssmlText },
                        voice: voiceObj,
                        audioConfig: { audioEncoding: "MP3", speakingRate: rate }
                    };
                    
                    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                    });
                    
                    if (!response.ok) throw new Error('Premium TTS API Error: ' + response.status);
                    const data = await response.json();
                    
                    if (typeof addTTSUsage === 'function') {
                        addTTSUsage(cleanText.length);
                    } else {
                        let currentCount = parseInt(localStorage.getItem('readingToolTTSUsage') || '0');
                        localStorage.setItem('readingToolTTSUsage', currentCount + cleanText.length);
                        updateUsageUI(); 
                    }

                    currentPremiumAudio = new Audio("data:audio/mp3;base64," + data.audioContent);
                    
                    await new Promise((resolve) => {
                        currentPremiumAudio.onended = resolve;
                        currentPremiumAudio.onerror = resolve;
                        currentPremiumAudio.play().catch(e => { console.error(e); resolve(); });
                    });
                    
                    if (onEndCallback) onEndCallback();
                    return; 
                } catch(e) {
                    console.error("Premium TTS failed, falling back to local voice:", e);
                }
            }

            // Local Fallback Fix
            const targetLocale = (voiceObj && voiceObj.languageCode) ? voiceObj.languageCode : (ttsLocales[currentLang] || 'en-US');
            const langPrefix = targetLocale.split('-')[0].toLowerCase();
            let localText = applyTTSPipeline(cleanText, inputs.voice.value, false, currentLang);
            
            const utterance = new SpeechSynthesisUtterance(localText);
            utterance.rate = rate;
            utterance.lang = targetLocale;
            
            const selectedVoiceName = inputs.voice.value;
            const voices = speechSynthesis.getVoices();
            let voice = voices.find(v => v.name === selectedVoiceName && v.lang.toLowerCase().startsWith(langPrefix));
            if (!voice) {
                voice = voices.find(v => v.lang.toLowerCase() === targetLocale.toLowerCase()) ||
                        voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
            }
            if (voice) utterance.voice = voice;
            
            await new Promise((resolve) => {
                utterance.onend = resolve;
                utterance.onerror = resolve;
                window.speechSynthesis.speak(utterance);
            });
            
            if (onEndCallback) onEndCallback();
        }

        // WEIGHTED MATH SYNC FOR CONTINUOUS READING
        function calculateWeightedLengths(elementsArray, rate) {
            let totalWeight = 0;
            let timeline = []; 
            
            const longPauseWeight = 12 * (1 / rate); 
            const shortPauseWeight = 6 * (1 / rate);

            elementsArray.forEach((el) => {
                const text = el.textContent;
                let elementWeight = 0;

                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    if (char === '.' || char === ';' || char === '!' || char === '?') {
                        elementWeight += longPauseWeight; 
                    } else if (char === ',') {
                        elementWeight += shortPauseWeight;  
                    } else {
                        elementWeight += 1;  
                    }
                }
                
                elementWeight += 1;

                timeline.push({
                    element: el,
                    startWeight: totalWeight,
                    endWeight: totalWeight + elementWeight
                });

                totalWeight += elementWeight;
            });

            return { totalWeight, timeline };
        }

        async function speakContinuousFlow(elementsArray, onEndCallback = null) {
            stopSpeech();
            if(!elementsArray || elementsArray.length === 0) { if(onEndCallback) onEndCallback(); return; }

            let rate = parseFloat(inputs.rate.value) * 0.7;
            const apiKey = getActualApiKey();
            
            // Clean pipe symbols so speech doesn't pronounce them
            let fullText = elementsArray.map(el => el.textContent.replace(/\|/g, "").trim()).filter(t => t.length > 0).join(" ");
            const { totalWeight, timeline } = calculateWeightedLengths(elementsArray, rate);

            const audioCtx = getSharedAudioContext();
            let voiceObj = null;

            if (apiKey) {
                 try {
                     const locale = ttsLocales[currentLang] || 'en-US';
                     voiceObj = { languageCode: locale };
                     const selectedPremiumVoice = inputs.premiumVoice.value;
                     if (selectedPremiumVoice) {
                         voiceObj.name = selectedPremiumVoice;
                         const match = selectedPremiumVoice.match(/^([a-z]{2,3}-[A-Z]{2})/);
                         if (match) voiceObj.languageCode = match[1];
                     } else {
                         voiceObj.name = (currentLang === 'el') ? 'el-GR-Wavenet-A' : (locale + '-Neural2-F');
                     }

                     let ssmlText = "<speak>";
                     elementsArray.forEach((el) => {
                         ssmlText += `${fixPremiumPronunciation(el.textContent, voiceObj.name, true, currentLang)} `;
                     });
                     ssmlText += "</speak>";

                     const payload = {
                         input: { ssml: ssmlText },
                         voice: voiceObj,
                         audioConfig: { audioEncoding: "MP3", speakingRate: rate }
                     };

                     const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
                         method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                     });

                     if (!response.ok) throw new Error('Premium TTS API Error: ' + response.status);
                     const data = await response.json();

                     const arrayBuffer = base64ToArrayBuffer(data.audioContent);
                     const audioBuffer = audioCtx ? await audioCtx.decodeAudioData(arrayBuffer) : { duration: fullText.length * 0.1 };
                     const exactDuration = audioBuffer.duration;

                     let textLength = fullText.length;
                     if (typeof addTTSUsage === 'function') {
                         addTTSUsage(textLength);
                     } else {
                         let currentCount = parseInt(localStorage.getItem('readingToolTTSUsage') || '0');
                         localStorage.setItem('readingToolTTSUsage', currentCount + textLength);
                         updateUsageUI();
                     }

                     currentPremiumAudio = new Audio();
                     currentPremiumAudio.src = "data:audio/mp3;base64," + data.audioContent;
                     currentPremiumAudio.load(); 
                     
                     const isModernVoice = voiceObj.name && (!voiceObj.name.includes('Wavenet') && !voiceObj.name.includes('Standard'));
                     const startSilence = isModernVoice ? 0.35 : 0.05; 
                     const endSilence = isModernVoice ? 0.20 : 0.05;

                     currentPremiumAudio.play().catch(e => { console.error(e); if(onEndCallback) onEndCallback(); });
                     
                     if (state.mathSyncInterval) clearInterval(state.mathSyncInterval);
                     state.mathSyncInterval = setInterval(() => {
                         if (!currentPremiumAudio) return; 
                         
                         const duration = exactDuration;
                         if (!duration || isNaN(duration)) return;
                         
                         const currentTime = currentPremiumAudio.currentTime;
                         
                         let activeDuration = duration - startSilence - endSilence;
                         if (activeDuration <= 0) activeDuration = duration;
                         
                         let adjustedTime = Math.max(0, currentTime - startSilence);
                         let progress = Math.min(1, adjustedTime / activeDuration);
                         
                         const currentWeightPos = progress * totalWeight;

                         const activeItem = timeline.find(item => currentWeightPos >= item.startWeight && currentWeightPos < item.endWeight);

                         if (activeItem) {
                             if (!activeItem.element.classList.contains('spoken-highlight')) {
                                document.querySelectorAll('.spoken-highlight').forEach(el => el.classList.remove('spoken-highlight'));
                                activeItem.element.classList.add('spoken-highlight');
                                scrollIfNeeded(activeItem.element);
                             }
                         }
                     }, 40);

                     currentPremiumAudio.onended = () => {
                         if (state.mathSyncInterval) clearInterval(state.mathSyncInterval);
                         document.querySelectorAll('.spoken-highlight').forEach(el => el.classList.remove('spoken-highlight'));
                         if(onEndCallback) onEndCallback();
                     };
                     return;
                 } catch(e) {
                     console.error("Continuous Premium failed, falling back local.", e);
                 }
            } 
            
            // LOCAL FALLBACK
            const targetLocale = (voiceObj && voiceObj.languageCode) ? voiceObj.languageCode : (ttsLocales[currentLang] || 'en-US');
            const langPrefix = targetLocale.split('-')[0].toLowerCase();
            
            const shadowUtterance = new SpeechSynthesisUtterance(fullText);
            shadowUtterance.rate = rate;
            shadowUtterance.lang = targetLocale;
            
            const selectedVoiceName = inputs.voice.value;
            const voices = speechSynthesis.getVoices();
            let localVoice = voices.find(v => v.name === selectedVoiceName && v.lang.toLowerCase().startsWith(langPrefix));
            if (!localVoice) {
                localVoice = voices.find(v => v.lang.toLowerCase() === targetLocale.toLowerCase()) ||
                             voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
            }
            if (localVoice) shadowUtterance.voice = localVoice;
            
            let charMap = [];
            let tempLength = 0;
            elementsArray.forEach((el, i) => {
                 const text = el.textContent;
                 charMap.push({ start: tempLength, end: tempLength + text.length - 1, idx: i });
                 tempLength += text.length + 1; 
            });

            shadowUtterance.onboundary = (e) => {
                if(e.name === 'word' || e.name === 'sentence') {
                    const match = charMap.find(m => e.charIndex >= m.start && e.charIndex <= m.end);
                    if(match) {
                         document.querySelectorAll('.spoken-highlight').forEach(el => el.classList.remove('spoken-highlight'));
                         const target = elementsArray[match.idx];
                         if(target) {
                             target.classList.add('spoken-highlight');
                             scrollIfNeeded(target);
                         }
                    }
                }
            };

            shadowUtterance.onend = () => {
                document.querySelectorAll('.spoken-highlight').forEach(el => el.classList.remove('spoken-highlight'));
                if(onEndCallback) onEndCallback(); 
            };

            window.speechSynthesis.speak(shadowUtterance);
        }

// ========================================================================
// SPEECH RECOGNITION (LISTENING TUTOR) ENGINE
// ========================================================================

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;
let currentListenTarget = "";

function isSpeechRecognitionSupported() {
    const hasSttKey = typeof getActualSttApiKey === 'function' && !!getActualSttApiKey();

    // With Google Cloud STT key: supported in ALL modern browsers (Firefox, Chrome, Safari, Edge)
    if (hasSttKey && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return true;
    }

    // Without API key: only supported if browser has native Web Speech API (Chrome / Edge)
    if (SpeechRecognition) {
        const ua = navigator.userAgent;
        // Block Opera, Firefox, and non-Chrome Safari when no key is set
        if (ua.indexOf('OPR') > -1 || ua.indexOf('Opera') > -1) return false;
        if (ua.indexOf('Firefox') > -1) return false;
        if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) return false;
        return true;
    }

    return false;
}

const feedbackPhrases = {
    'el': {
        success: [
            "Μπράβο, τα κατάφερες πολύ καλά!!!",
            "Τα κατάφερες πάρα πολύ ωραία! Μπράβο σου!",
            "Γιούπι! Τα κατάφερες πάρα πολύ ωραία!",
            "Απίθανα, φανταστική…Μπράβο σου!!!",
            "Θαυμάσια….το βρήκες!!!",
            "Αυτό είναι!!! Μπράβο σου!!!",
            "Μπράβο…Μπράβο…Μπράβο!!! Τα κατάφερες!!!",
            "Μπράβο σου!!!….Το βρήκες!!!"
        ],
        retry: [
            "Μου φαίνεται ότι έκανες λάθος! Δοκίμασε ξανά!",
            "Χμ!…μάλλον όχι, δοκίμασε ξανά!!",
            "Δεν είναι σωστό!!! Δοκίμασε ξανά!",
            "Μου φαίνεται πως έκανες λάθος. Προσπάθησε πάλι!!!",
            "Ο-ο!! … Μάλλον όχι! Δοκίμασε ξανά!!"
        ]
    },
    'en': {
        success: ["Congratulations, you read perfectly!", "Well done, you read beautifully!", "Fantastic work, bravo!", "Excellent reading, keep it up!", "Great job! You did wonderfully!", "Awesome! You read it very clearly!"],
        retryIntro: ["Very good effort!", "Almost got it!", "Really well done!", "Keep trying!", "You are so close!", "Great job trying!"],
        correctWords: "You read these words correctly: {words}.",
        retryOutro: ["Would you like to try again?", "Let's try one more time!", "Do you want to try once more?", "Give it another go!", "Shall we try again?", "Let's try again!"]
    },
    'fr': {
        success: ["Félicitations, tu as lu parfaitement !", "Bravo, tu lis magnifiquement !", "Travail fantastique, bravo !", "Excellente lecture, continue comme ça !", "Bravo ! Tu as fait un excellent travail !", "Génial ! Tu as lu très clairement !"],
        retryIntro: ["Très bon effort !", "Tu y es presque !", "Vraiment bien !", "Continue d'essayer !", "Tu es tout près !", "Bravo pour l'effort !"],
        correctWords: "Tu as lu correctement les mots : {words}.",
        retryOutro: ["Veux-tu essayer à nouveau ?", "Essayons encore une fois !", "Veux-tu réessayer ?", "Essaie encore !", "On réessaye ?", "Essayons à nouveau !"]
    },
    'de': {
        success: ["Herzlichen Glückwunsch, perfekt gelesen!", "Bravo, du liest wunderbar!", "Fantastische Arbeit, bravo!", "Hervorragend gelesen, weiter so!", "Bravo! Das hast du toll gemacht!", "Klasse! Du hast sehr deutlich gelesen!"],
        retryIntro: ["Gute Leistung!", "Fast geschafft!", "Wirklich gut!", "Probier es weiter!", "Du bist ganz nah dran!", "Klasse Versuch!"],
        correctWords: "Du hast diese Wörter richtig gelesen: {words}.",
        retryOutro: ["Möchtest du es noch einmal versuchen?", "Lass es uns noch einmal versuchen!", "Willst du es noch mal probieren?", "Probier es noch mal!", "Wollen wir es noch mal versuchen?", "Versuchen wir es noch mal!"]
    },
    'es': {
        success: ["¡Felicitaciones, leíste perfectamente!", "¡Bravo, lees de maravilla!", "¡Trabajo fantástico, bravo!", "¡Excelente lectura, sigue así!", "¡Bravo! ¡Lo hiciste genial!", "¡Genial! ¡Leíste con mucha claridad!"],
        retryIntro: ["¡Muy buen esfuerzo!", "¡Casi lo logras!", "¡Realmente bien hecho!", "¡Sigue intentándolo!", "¡Estás muy cerca!", "¡Bravo por el intento!"],
        correctWords: "Leíste correctamente las palabras: {words}.",
        retryOutro: ["¿Quieres intentarlo de nuevo?", "¡Intentémoslo una vez más!", "¿Quieres probar otra vez?", "¡Inténtalo de nuevo!", "¿Volvemos a intentarlo?", "¡Probemos otra vez!"]
    },
    'it': {
        success: ["Congratulazioni, hai letto perfettamente!", "Bravo, leggi meravigliosamente!", "Lavoro fantastico, bravo!", "Lettura eccellente, continua così!", "Bravo! Hai fatto un ottimo lavoro!", "Grande! Hai letto molto chiaramente!"],
        retryIntro: ["Ottimo sforzo!", "Quasi fatto!", "Davvero ben fatto!", "Continua a provare!", "Sei vicinissimo!", "Bravo per l'impegno!"],
        correctWords: "Hai letto correttamente le parole: {words}.",
        retryOutro: ["Vuoi riprovare?", "Proviamo ancora una volta!", "Vuoi provare di nuovo?", "Riprova!", "Proviamo di nuovo?", "Proviamo ancora!"]
    },
    'pt': {
        success: ["Parabéns, leste perfeitamente!", "Bravo, lês maravilhosamente!", "Trabalho fantastico, bravo!", "Excelente leitura, continua assim!", "Bravo! Estiveste muito bem!", "Incrível! Leste com muita clareza!"],
        retryIntro: ["Muito bom esforço!", "Quase conseguiste!", "Muito bem feito!", "Continua a tentar!", "Estás quase lá!", "Parabéns pela tentativa!"],
        correctWords: "Leste corretamente as palavras: {words}.",
        retryOutro: ["Queres tentar novamente?", "Vamos tentar mais uma vez!", "Queres tentar outra vez?", "Tenta de novo!", "Vamos tentar de novo?", "Tenta mais uma vez!"]
    },
    'nl': {
        success: ["Gefeliciteerd, je hebt perfect gelezen!", "Bravo, je leest prachtig!", "Fantastisch werk, bravo!", "Uitstekend gelezen, ga zo door!", "Bravo! Je hebt het geweldig gedaan!", "Super! Je hebt heel duidelijk gelezen!"],
        retryIntro: ["Zeer goede inzet!", "Bijna goed!", "Echt goed gedaan!", "Blijf proberen!", "Je bent er heel dichtbij!", "Goed geprobeerd!"],
        correctWords: "Je hebt deze woorden correct gelezen: {words}.",
        retryOutro: ["Wil je het nog eens proberen?", "Laten we het nog een keer proberen!", "Wil je nog een keer proberen?", "Probeer het nog eens!", "Zullen we het nog eens proberen?", "Laten we het opnieuw proberen!"]
    },
    'pl': {
        success: ["Gratulacje, przeczytałeś idealnie!", "Brawo, czytasz wspaniale!", "Fantastyczna robota, brawo!", "Doskonałe czytanie, tak trzymaj!", "Brawo! Poradziłeś sobie świetnie!", "Świetnie! Przeczytałeś bardzo wyraźnie!"],
        retryIntro: ["Bardzo dobra próba!", "Prawie się udało!", "Naprawdę dobra robota!", "Próbuj dalej!", "Jesteś bardzo blisko!", "Brawo za chęci!"],
        correctWords: "Przeczytałeś poprawnie słowa: {words}.",
        retryOutro: ["Czy chcesz spróbować ponownie?", "Spróbujmy jeszcze raz!", "Chcesz spróbować jeszcze raz?", "Spróbuj ponownie!", "Spróbujemy jeszcze raz?", "Spróbuj jeszcze raz!"]
    },
    'ro': {
        success: ["Felicitări, ai citit perfect!", "Bravo, citești minunat!", "Muncă fantastică, bravo!", "Lectură excelentă, continuă tot așa!", "Bravo! Te-ai descurcat de minune!", "Grozav! Ai citit foarte clar!"],
        retryIntro: ["Un efort foarte bun!", "Aproape ai reușit!", "Foarte bine făcut!", "Continuă să încerci!", "Ești foarte aproape!", "Bravo pentru încercare!"],
        correctWords: "Ai citit corect cuvintele: {words}.",
        retryOutro: ["Vrei să încerci din nou?", "Să mai încercăm o dată!", "Vrei să mai încerci o dată?", "Încearcă din nou!", "Mai încercăm o dată?", "Să încercăm din nou!"]
    },
    'sv': {
        success: ["Gratulerar, du läste perfekt!", "Bravo, du läser underbart!", "Fantastiskt jobbat, bravo!", "Utmärkt läsning, fortsätt så!", "Bravo! Du gjorde det jättebra!", "Härligt! Du läste väldigt tydligt!"],
        retryIntro: ["Mycket bra försök!", "Nästan rätt!", "Riktigt bra gjort!", "Fortsätt kämpa!", "Du är jättenära!", "Bra kämpat!"],
        correctWords: "Du läste dessa ord rätt: {words}.",
        retryOutro: ["Vill du försöka igen?", "Låt oss försöka en gång till!", "Vill du testa en gång till?", "Försök igen!", "Ska vi försöka igen?", "Låt oss prova igen!"]
    },
    'da': {
        success: ["Tillykke, du læste perfekt!", "Bravo, du læser vidunderligt!", "Fantastisk arbejde, bravo!", "Fremragende læsning, fortsæt sådan!", "Bravo! Du klarede det flot!", "Super! Du læste meget tydeligt!"],
        retryIntro: ["Meget flot indsats!", "Næsten i mål!", "Rigtig godt gået!", "Bliv ved med at prøve!", "Du er meget tæt på!", "Flot forsøg!"],
        correctWords: "Du læste disse ord korrekt: {words}.",
        retryOutro: ["Vil du prøve igen?", "Lad os prøve én gang til!", "Har du lyst til at prøve igen?", "Prøv igen!", "Skal vi prøve igen?", "Lad os prøve igen!"]
    },
    'fi': {
        success: ["Onnittelut, luit täydellisesti!", "Bravo, luet upeasti!", "Fantastista työtä, bravo!", "Erinomaista lukemista, jatka samaan malliin!", "Bravo! Selvisit hienosti!", "Hienoa! Luit erittäin selkeästi!"],
        retryIntro: ["Erittäin hyvä yritys!", "Melkein onnistui!", "Todella hyvin tehty!", "Jatka yrittämistä!", "Olet todella lähellä!", "Hienoa yrittämistä!"],
        correctWords: "Luit oikein sanat: {words}.",
        retryOutro: ["Haluatko yrittää uudelleen?", "Yritetäänpä vielä kerran!", "Haluatko kokeilla uudestaan?", "Yritä uudelleen!", "Yritetäänkö uudestaan?", "Kokeillaanpa uudestaan!"]
    },
    'cs': {
        success: ["Gratuluji, přečetl jsi to dokonale!", "Bravo, čteš nádherně!", "Fantastická práce, bravo!", "Skvělé čtení, jen tak dál!", "Bravo! Vedl sis skvěle!", "Super! Přečetl jsi to velmi srozumitelně!"],
        retryIntro: ["Velmi dobrá snaha!", "Skoro to máš!", "Opravdu skvělá práce!", "Zkoušej to dál!", "Jsi velmi blízko!", "Bravo za snahu!"],
        correctWords: "Správně jsi přečetl slova: {words}.",
        retryOutro: ["Chceš to zkusit znovu?", "Zkusme to ještě jednou!", "Chceš to zkusit ještě jednou?", "Zkus to znovu!", "Zkusíme to znova?", "Pojďme to zkusit znova!"]
    },
    'sk': {
        success: ["Gratulujem, prečítal si to dokonale!", "Bravo, čítaš nádherne!", "Fantastická práca, bravo!", "Skvelé čítanie, len tak ďalej!", "Bravo! Viedol si si skvele!", "Super! Prečítal si to veľmi zrozumiteľne!"],
        retryIntro: ["Veľmi dobrá snaha!", "Skoro to máš!", "Naozaj skvelá práca!", "Skúšaj to ďalej!", "Si veľmi blízko!", "Bravo za snahu!"],
        correctWords: "Správne si prečítal slová: {words}.",
        retryOutro: ["Chceš to skúsiť znova?", "Skúsme to ešte raz!", "Chceš to skúsiť ešte raz?", "Skús to znova!", "Skúsime to znova?", "Poďme to skúsiť znova!"]
    },
    'hu': {
        success: ["Gratulálok, tökéletesen olvastál!", "Bravo, csodásan olvasol!", "Fantasztikus munka, bravo!", "Kiváló olvasás, csak így tovább!", "Bravo! Szuperül csináltad!", "Nagyszerű! Nagyon tisztán olvastál!"],
        retryIntro: ["Nagyon szép próbálkozás!", "Majdnem sikerült!", "Igazán szép munka!", "Próbálkozz tovább!", "Nagyon közel vagy!", "Szép volt a próbálkozás!"],
        correctWords: "Helyesen olvastad a következő szavakat: {words}.",
        retryOutro: ["Szeretnéd megpróbálni újra?", "Próbáljuk meg még egyszer!", "Szeretnéd még egyszer megpróbálni?", "Próbáld újra!", "Megpróbáljuk újra?", "Próbáljuk meg újra!"]
    },
    'bg': {
        success: ["Поздравления, прочете го перфектно!", "Браво, четеш прекрасно!", "Фантастична работа, браво!", "Отлично четене, продължавай все така!", "Браво! Справи се чудесно!", "Страхотно! Прочете го много ясно!"],
        retryIntro: ["Много добър опит!", "Почти успя!", "Наистина добре направено!", "Продължавай да опитваш!", "Много си близо!", "Браво за старанието!"],
        correctWords: "Правилно прочете думите: {words}.",
        retryOutro: ["Искаш ли да опиташ отново?", "Нека опитаме още веднъж!", "Искаш ли да пробваш пак?", "Опитай отново!", "Ще опитаме ли пак?", "Нека пробваме отново!"]
    },
    'hr': {
        success: ["Čestitamo, pročitao si savršeno!", "Bravo, čitaš prekrasno!", "Fantastičan posao, bravo!", "Izvrsno čitanje, samo tako nastavi!", "Bravo! Odradio si to sjajno!", "Odlično! Pročitao si vrlo jasno!"],
        retryIntro: ["Vrlo dobar trud!", "Skoro si uspio!", "Zaista dobro obavljeno!", "Nastavi pokušavati!", "Vrlo si blizu!", "Bravo na trudu!"],
        correctWords: "Točno si prihvatio riječi: {words}.",
        retryOutro: ["Želiš li pokušati ponovno?", "Pokušajmo još jednom!", "Želiš li probati još jednom?", "Pokušaj ponovno!", "Hoćemo li pokušati ponovno?", "Pokušajmo ponovno!"]
    },
    'sl': {
        success: ["Čestitke, prebral si popolnoma prav!", "Bravo, čitaš čudovito!", "Fantastično delo, bravo!", "Odlično branje, le tako naprej!", "Bravo! Odlično ti je uspelo!", "Super! Prebral si zelo razločno!"],
        retryIntro: ["Zelo dober trud!", "Skoraj ti je uspelo!", "Res dobro opravljeno!", "Poskušaj še naprej!", "Zelo si blizu!", "Bravo za trud!"],
        correctWords: "Pravilno si prebral besede: {words}.",
        retryOutro: ["Želiš poskusiti znova?", "Poskusimo še enkrat!", "Želiš poskusiti še enkrat?", "Poskusi znova!", "Bomo poskusili znova?", "Poskusimo znova!"]
    },
    'et': {
        success: ["Palju õnne, sa lugesid suurepäraselt!", "Bravo, sa loed imeliselt!", "Fantastiline töö, bravo!", "Suurepärane lugemine, jätka samas vaimus!", "Bravo! Sa said suurepäraselt hakkama!", "Klass! Lugesid väga selgelt!"],
        retryIntro: ["Väga hea püüdlus!", "Peaaegu õnnestus!", "Tõesti hästi tehtud!", "Proovi veel!", "Oled väga lähedal!", "Tubli katse!"],
        correctWords: "Sa lugesid õigesti sõnad: {words}.",
        retryOutro: ["Kas soovid uuesti proovida?", "Proovime veel kord!", "Kas tahad veel kord proovida?", "Proovi uuesti!", "Kas proovime uuesti?", "Proovime uuesti!"]
    },
    'lv': {
        success: ["Apsveicu, tu izlasīji perfekti!", "Bravo, tu lasi brīnišķīgi!", "Fantastisks darbs, bravo!", "Izcila lasīšana, turpini tāpat!", "Bravo! Tev sanāca lieliski!", "Super! Tu izlasīji ļoti skaidri!"],
        retryIntro: ["Ļoti labs mēģinājums!", "Gandrīz izdevās!", "Patiešām labi padarīts!", "Turpini mēģināt!", "Tu esi pavisam tuvu!", "Malacis par centību!"],
        correctWords: "Tu pareizi izlasīji vārdus: {words}.",
        retryOutro: ["Vai vēlies mēģināt vēlreiz?", "Pamēģināsim vēlreiz!", "Vai vēlies pamēģināt vēlreiz?", "Mēģini vēlreiz!", "Vai mēģināsim vēlreiz?", "Pamēģināsim vēlreiz!"]
    },
    'lt': {
        success: ["Sveikiname, perskaitei tobulai!", "Bravo, skaitai nuostabiai!", "Fantastiškas darbas, bravo!", "Puikus skaitymas, taip i toliau!", "Bravo! Tau puikiai pavyko!", "Puiku! Perskaitei labai aiškiai!"],
        retryIntro: ["Labai geras bandymas!", "Beveik pavyko!", "Tikrai gerai padaryta!", "Bandyk toliau!", "Esi labai arti!", "Bravo už pastangas!"],
        correctWords: "Teisingai perskaitei žodžius: {words}.",
        retryOutro: ["Ar nori pabandyti dar kartą?", "Pabandykime dar kartą!", "Ar nori pamėginti dar kartą?", "Bandyk dar kartą!", "Ar bandysime dar kartą?", "Pabandykime dar kartą!"]
    },
    'mt': {
        success: ["Prosit, qrajt perfettament!", "Bravo, qed taqra tal-ġenn!", "Xogħol fantastiku, bravo!", "Qari eċċellenti, ibqa' sejjer hekk!", "Bravo! Qrajt tajjeb ħafna!", "Kbir! Qrajt b'mod ċar ħafna!"],
        retryIntro: ["Sforz tajjeb ħafna!", "Kważi lestejt!", "Magħmul tajjeb ħafna!", "Ibqa' pprova!", "Qiegħed viċin ħafna!", "Prosit talli pprovajt!"],
        correctWords: "Qrajt b'mod korrett il-kliem: {words}.",
        retryOutro: ["Trid tipprova mill-ġdid?", "Ejja nippruvaw għal darba oħra!", "Trid tipprova darb'oħra?", "Pprova mill-ġdid!", "Se nippruvaw mill-ġdid?", "Ejja nippruvaw mill-ġdid!"]
    },
    'ga': {
        success: ["Comhghairdeas, léigh tú go foirfe!", "Maith thú, léann tú go hálainn!", "Obair iontach, maith thú!", "Léamh den scoth, coinnigh ort!", "Maith thú! D'éirigh go hiontach leat!", "Go hiontach! Léigh tú go han-soiléir!"],
        retryIntro: ["Iarracht an-mhaith!", "Beagnach faighte agat!", "Rinne tú an-mhaith ar fad!", "Coinnigh ag triail!", "Tá tú an-ghar dó!", "Maith thú as triail a bhaint as!"],
        correctWords: "Léigh tú na focail seo i gceart: {words}.",
        retryOutro: ["Ar mhaith leat triail a bhaint as arís?", "Bainimis triail as arís!", "Ar mhaith leat triail a bhaint as uair eile?", "Bain triail as arís!", "An ndéanfaimid iarracht eile?", "Bainimis triail as arís!"]
    }
};

function normalizeTextForComparison(text, lang) {
    if (!text) return "";
    let clean = text.toLowerCase();
    
    // Replace punctuation with spaces
    clean = clean.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?¿¡"“’|]/g, " ");
    
    // Normalize multi-spaces
    clean = clean.replace(/\s+/g, " ").trim();
    
    // Decompose accents/diacritics and strip them
    clean = clean.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    return clean;
}

let mediaStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let recordStartTime = 0;
let isCloudSttActive = false;
let recognitionTimeout = null;

async function blobTo16kHzWavBase64(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioCtxClass();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const targetSampleRate = 16000;
    const numFrames = Math.max(1, Math.ceil(audioBuffer.duration * targetSampleRate));
    const offlineCtx = new OfflineAudioContext(1, numFrames, targetSampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);
    const renderedBuffer = await offlineCtx.startRendering();

    const channelData = renderedBuffer.getChannelData(0);
    const wavBuffer = new ArrayBuffer(44 + channelData.length * 2);
    const view = new DataView(wavBuffer);

    function writeStr(offset, str) {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    }
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + channelData.length * 2, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, targetSampleRate, true);
    view.setUint32(28, targetSampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, channelData.length * 2, true);

    let offset = 44;
    for (let i = 0; i < channelData.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, channelData[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    let binary = '';
    const bytes = new Uint8Array(wavBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function initSpeechRecognition() {
    if (!SpeechRecognition) return;

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        isListening = true;
        const btnListen = document.getElementById('btn-listen');
        if (btnListen) {
            btnListen.classList.remove('processing');
            btnListen.classList.add('listening');
            btnListen.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        }
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Speech transcript (Web Speech):", transcript);
        handleSpeechResult(transcript, currentListenTarget);
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        stopListening();
    };

    recognition.onend = () => {
        stopListening();
    };
}

async function startListening(targetText) {
    stopSpeech();
    stopAutoRead();
    if (recognitionTimeout) {
        clearTimeout(recognitionTimeout);
        recognitionTimeout = null;
    }

    currentListenTarget = targetText;
    const sttKey = (typeof getActualSttApiKey === 'function') ? getActualSttApiKey() : '';

    if (sttKey) {
        // USE GOOGLE CLOUD SPEECH-TO-TEXT
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error("Microphone access not supported in this browser.");
            return;
        }

        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(mediaStream);
            recordedChunks = [];
            recordStartTime = Date.now();
            isListening = true;
            isCloudSttActive = true;

            const btnListen = document.getElementById('btn-listen');
            if (btnListen) {
                btnListen.classList.remove('processing');
                btnListen.classList.add('listening');
                btnListen.innerHTML = '<i class="fa-solid fa-microphone"></i>';
            }

            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    recordedChunks.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const elapsedSec = Math.max(1, Math.ceil((Date.now() - recordStartTime) / 1000));
                if (typeof addSTTUsage === 'function') {
                    addSTTUsage(elapsedSec);
                }

                if (mediaStream) {
                    mediaStream.getTracks().forEach(track => track.stop());
                    mediaStream = null;
                }

                const btn = document.getElementById('btn-listen');
                if (btn) {
                    btn.classList.remove('listening');
                    btn.classList.add('processing');
                    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                }

                try {
                    const audioBlob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
                    const base64Audio = await blobTo16kHzWavBase64(audioBlob);
                    const locale = (typeof ttsLocales !== 'undefined' && ttsLocales[currentLang]) ? ttsLocales[currentLang] : 'el-GR';

                    const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${sttKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            config: {
                                encoding: 'LINEAR16',
                                sampleRateHertz: 16000,
                                languageCode: locale,
                                enableAutomaticPunctuation: false
                            },
                            audio: {
                                content: base64Audio
                            }
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`Cloud STT API error: ${response.status}`);
                    }

                    const data = await response.json();
                    let transcript = "";
                    if (data.results && data.results.length > 0 && data.results[0].alternatives && data.results[0].alternatives.length > 0) {
                        transcript = data.results[0].alternatives[0].transcript || "";
                    }
                    console.log("Speech transcript (Cloud STT):", transcript);

                    if (btn) {
                        btn.classList.remove('processing');
                        btn.innerHTML = '<i class="fa-solid fa-ear-listen"></i>';
                    }
                    isListening = false;
                    isCloudSttActive = false;

                    handleSpeechResult(transcript, currentListenTarget);
                } catch (err) {
                    console.error("Cloud STT error:", err);
                    if (btn) {
                        btn.classList.remove('processing');
                        btn.innerHTML = '<i class="fa-solid fa-ear-listen"></i>';
                    }
                    isListening = false;
                    isCloudSttActive = false;
                    handleSpeechResult("", currentListenTarget);
                }
            };

            mediaRecorder.start();

            // Safety timeout: 6 seconds auto-stop
            recognitionTimeout = setTimeout(() => {
                if (isListening && isCloudSttActive) {
                    stopListening();
                }
            }, 6000);

        } catch (err) {
            console.error("Microphone access error for Cloud STT:", err);
            isListening = false;
            isCloudSttActive = false;
            const btnListen = document.getElementById('btn-listen');
            if (btnListen) {
                btnListen.classList.remove('listening', 'processing');
                btnListen.innerHTML = '<i class="fa-solid fa-ear-listen"></i>';
            }
        }
    } else {
        // Fallback: Web Speech API (Chrome/Edge)
        if (!SpeechRecognition) {
            if (typeof modals !== 'undefined' && modals.stt) {
                modals.stt.style.display = 'flex';
                const t = (typeof i18n !== 'undefined' && (i18n[currentLang] || i18n['en'] || i18n['el'])) || {};
                alert(t['stt_firefox_notice'] || 'Για ακρόαση στον Firefox, παρακαλούμε ορίστε ένα Google Cloud API Key στις ρυθμίσεις ακρόασης (🎙️).');
            }
            return;
        }

        if (!recognition) initSpeechRecognition();
        if (!recognition) return;

        const locale = (typeof ttsLocales !== 'undefined' && ttsLocales[currentLang]) ? ttsLocales[currentLang] : 'el-GR';
        recognition.lang = locale;

        try {
            recognition.start();
            recognitionTimeout = setTimeout(() => {
                if (isListening) {
                    console.log("Speech recognition safety timeout reached, stopping.");
                    stopListening();
                }
            }, 7000);
        } catch (e) {
            console.error("Error starting Web Speech recognition:", e);
            stopListening();
        }
    }
}

function stopListening() {
    if (recognitionTimeout) {
        clearTimeout(recognitionTimeout);
        recognitionTimeout = null;
    }

    if (isCloudSttActive && mediaRecorder && mediaRecorder.state === 'recording') {
        try {
            mediaRecorder.stop();
        } catch(e) {}
        return;
    }

    isListening = false;
    isCloudSttActive = false;
    const btnListen = document.getElementById('btn-listen');
    if (btnListen) {
        btnListen.classList.remove('listening', 'processing');
        btnListen.innerHTML = '<i class="fa-solid fa-ear-listen"></i>';
    }
    if (recognition) {
        try {
            recognition.stop();
        } catch(e) {}
    }
}

let successPool = [];
let failurePool = [];

function getGreekPhrase(pool, basePhrases) {
    if (pool.length === 0) {
        pool.push(...basePhrases);
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
    }
    return pool.pop();
}

function handleSpeechResult(transcript, targetText) {
    const lang = currentLang;
    const normTarget = normalizeTextForComparison(targetText, lang);
    const normTranscript = normalizeTextForComparison(transcript, lang);

    const targetWords = normTarget.split(" ").filter(Boolean);
    const transcriptWords = normTranscript.split(" ").filter(Boolean);

    // Sequential order-based word matching
    let correctIndices = [];
    let tIndex = 0;
    for (let i = 0; i < targetWords.length; i++) {
        const word = targetWords[i];
        const foundIndex = transcriptWords.indexOf(word, tIndex);
        if (foundIndex !== -1) {
            correctIndices.push(i);
            tIndex = foundIndex + 1;
        }
    }

    const successRatio = correctIndices.length / targetWords.length;
    // Threshold: 100% for short targets (<= 2 words), 80% for longer targets
    const threshold = targetWords.length <= 2 ? 1.0 : 0.8;
    const isSuccess = successRatio >= threshold;

    if (isSuccess) {
        state.failedCurrentTarget = false;

        // Calculate points (1 point per correct letter in matched words)
        let lettersRead = 0;
        correctIndices.forEach(idx => {
            const w = targetWords[idx] || "";
            const cleanWord = w.replace(/[^a-zA-Z\u0370-\u03FF\u1F00-\u1FFF]/g, '');
            lettersRead += cleanWord.length;
        });

        if (lettersRead > 0 && typeof addStudentPoints === 'function' && state.rewardsEnabled) {
            addStudentPoints(lettersRead);
            showFlyingPoints(lettersRead);
        }

        // Success: Play success arcade sound
        const snd = getNextSuccessSound();
        playSuccessArcadeSound(snd);

        // Hide restore prompt, clear errors, trigger emoji animation
        hideRestorePrompt();
        clearWordColoring();
        playSuccessAnimation();
        
        // Auto advance after 1.2s delay
        setTimeout(() => {
            if (state.readFlow === 'step') {
                if (state.currentIndex >= state.flatElements.length - 1) {
                    // When all words completed, automatically return to start
                    state.currentIndex = 0;
                    if (typeof updateHighlight === 'function') updateHighlight();
                } else if (typeof goNext === 'function') {
                    goNext();
                }
            }
        }, 1200);
    } else {
        state.failedCurrentTarget = true;
        // Failure: Play failure arcade sound
        const snd = getNextFailureSound();
        playFailureArcadeSound(snd);

        // Color matched words green and missed words red, show restore prompt
        colorActiveWords(correctIndices, false);
        showRestorePrompt();
    }
}

// Visual flying points feedback on STT correct reading
function showFlyingPoints(points) {
    try {
        const btn = document.getElementById('btn-listen');
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const tag = document.createElement('div');
        tag.className = 'flying-point-tag';
        tag.textContent = `+${points} ⭐`;
        tag.style.left = `${Math.max(10, rect.left + rect.width / 2 - 30)}px`;
        tag.style.top = `${Math.max(10, rect.top - 25)}px`;
        document.body.appendChild(tag);
        setTimeout(() => {
            if (tag.parentNode) tag.parentNode.removeChild(tag);
        }, 1200);
    } catch (e) {
        console.warn("Could not display flying points:", e);
    }
}

// Visual Feedback Coloring
function colorActiveWords(correctIndices, isSuccess) {
    clearWordColoring();
    if (state.currentIndex < 0 || state.currentIndex >= state.flatElements.length) return;
    const activeElement = state.flatElements[state.currentIndex];
    
    let targetSegment = activeElement;
    if (state.readFlow === 'continuous' || state.mode === 'sentence') {
        targetSegment = activeElement.closest('.sentence');
    }
    
    if (!targetSegment) return;
    
    const wordNodes = targetSegment.querySelectorAll('.word');
    if (wordNodes.length > 0) {
        wordNodes.forEach((node, idx) => {
            if (correctIndices.includes(idx)) {
                node.classList.add('word-correct');
            } else {
                node.classList.add('word-incorrect');
            }
        });
    } else if (targetSegment.classList.contains('word')) {
        if (isSuccess) {
            targetSegment.classList.add('word-correct');
        } else {
            targetSegment.classList.add('word-incorrect');
        }
    }
}

function clearWordColoring() {
    document.querySelectorAll('.word-correct, .word-incorrect').forEach(el => {
        el.classList.remove('word-correct', 'word-incorrect');
    });
}

function showRestorePrompt() {
    const prompt = document.getElementById('restore-hand-prompt');
    if (prompt) {
        prompt.style.display = 'block';
    }
}

function hideRestorePrompt() {
    const prompt = document.getElementById('restore-hand-prompt');
    if (prompt) {
        prompt.style.display = 'none';
    }
}

// Success Emoji Animations
const successEmojis = {
    1: ['🎉', '🎊'], 
    2: ['🤩', '⭐', '🌟'], 
    3: ['👍'], 
    4: ['👏'], 
    5: ['🚀', '✨'], 
    6: ['✨', '💖', '🌟'], 
    7: ['🎈', '🌈'], 
    8: ['🏆', '✨'], 
    9: ['🦄', '🌈'], 
    10: ['🔥', '💥'], 
    11: ['🥰', '❤️', '💕'], 
    12: ['🏅', '🥇'] 
};

let emojiPool = [];
function playSuccessAnimation() {
    if (emojiPool.length === 0) {
        emojiPool.push(...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
        // Shuffle
        for (let i = emojiPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [emojiPool[i], emojiPool[j]] = [emojiPool[j], emojiPool[i]];
        }
    }
    const animId = emojiPool.pop();
    triggerEmojiAnimation(animId);
}

function triggerEmojiAnimation(id) {
    const container = document.getElementById('emoji-animation-container');
    if (!container) return;
    container.innerHTML = '';
    container.style.display = 'block';

    const selectedEmojis = successEmojis[id] || ['🎉'];
    
    if (id === 1) { // Confetti explosion
        for (let i = 0; i < 30; i++) {
            const el = document.createElement('div');
            el.className = 'emoji-particle confetti-explosion';
            el.textContent = selectedEmojis[Math.floor(Math.random() * selectedEmojis.length)];
            el.style.left = '50%';
            el.style.top = '50%';
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 150 + Math.random() * 300;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            el.style.setProperty('--tx', `${tx}px`);
            el.style.setProperty('--ty', `${ty}px`);
            el.style.animationDelay = `${Math.random() * 0.2}s`;
            
            container.appendChild(el);
        }
    } else if (id === 2) { // Star shower
        for (let i = 0; i < 25; i++) {
            const el = document.createElement('div');
            el.className = 'emoji-particle star-shower';
            el.textContent = selectedEmojis[Math.floor(Math.random() * selectedEmojis.length)];
            el.style.left = `${Math.random() * 100}vw`;
            el.style.top = `-50px`;
            el.style.animationDuration = `${1.5 + Math.random() * 1.5}s`;
            el.style.animationDelay = `${Math.random() * 0.5}s`;
            container.appendChild(el);
        }
    } else if (id === 3) { // Giant thumb
        const el = document.createElement('div');
        el.className = 'emoji-particle giant-thumb';
        el.textContent = '👍';
        el.style.left = '50%';
        el.style.top = '50%';
        container.appendChild(el);
    } else if (id === 4) { // Clapping cascade
        for (let i = 0; i < 20; i++) {
            const el = document.createElement('div');
            el.className = 'emoji-particle clap-cascade';
            el.textContent = '👏';
            el.style.left = `${10 + Math.random() * 80}vw`;
            el.style.bottom = `-50px`;
            el.style.animationDuration = `${2 + Math.random() * 1.5}s`;
            el.style.animationDelay = `${Math.random() * 0.6}s`;
            container.appendChild(el);
        }
    } else if (id === 5) { // Rocket launch
        for (let i = 0; i < 8; i++) {
            const el = document.createElement('div');
            el.className = 'emoji-particle rocket-launch';
            el.textContent = selectedEmojis[i % selectedEmojis.length];
            el.style.left = `${10 + Math.random() * 30}vw`;
            el.style.bottom = `-100px`;
            el.style.animationDuration = `${1.5 + Math.random() * 1.0}s`;
            el.style.animationDelay = `${i * 0.3}s`;
            container.appendChild(el);
        }
    } else if (id === 6) { // Sparkle burst
        for (let i = 0; i < 40; i++) {
            const el = document.createElement('div');
            el.className = 'emoji-particle sparkle-burst';
            el.textContent = selectedEmojis[Math.floor(Math.random() * selectedEmojis.length)];
            el.style.left = `${10 + Math.random() * 80}vw`;
            el.style.top = `${10 + Math.random() * 80}vh`;
            el.style.animationDuration = `${0.8 + Math.random() * 0.8}s`;
            el.style.animationDelay = `${Math.random() * 0.8}s`;
            container.appendChild(el);
        }
    } else if (id === 7) { // Rising balloons
        for (let i = 0; i < 15; i++) {
            const el = document.createElement('div');
            el.className = 'emoji-particle rising-balloon';
            el.textContent = selectedEmojis[Math.floor(Math.random() * selectedEmojis.length)];
            el.style.left = `${10 + Math.random() * 80}vw`;
            el.style.bottom = `-100px`;
            el.style.animationDuration = `${3.0 + Math.random() * 2.0}s`;
            el.style.animationDelay = `${Math.random() * 1.0}s`;
            container.appendChild(el);
        }
    } else if (id === 8) { // Trophy spin
        const el = document.createElement('div');
        el.className = 'emoji-particle trophy-spin';
        el.textContent = '🏆';
        el.style.left = '50%';
        el.style.top = '50%';
        container.appendChild(el);
        for (let i = 0; i < 10; i++) {
            const star = document.createElement('div');
            star.className = 'emoji-particle trophy-star';
            star.textContent = '✨';
            star.style.left = '50%';
            star.style.top = '50%';
            const angle = (i / 10) * Math.PI * 2;
            star.style.setProperty('--tx', `${Math.cos(angle) * 120}px`);
            star.style.setProperty('--ty', `${Math.sin(angle) * 120}px`);
            star.style.animationDelay = `${0.3 + Math.random() * 0.3}s`;
            container.appendChild(star);
        }
    } else if (id === 9) { // Rainbow dash
        for (let i = 0; i < 5; i++) {
            const el = document.createElement('div');
            el.className = 'emoji-particle rainbow-dash';
            el.textContent = selectedEmojis[i % selectedEmojis.length];
            el.style.left = `-100px`;
            el.style.top = `${20 + Math.random() * 50}vh`;
            el.style.animationDuration = `${2.0 + Math.random() * 1.0}s`;
            el.style.animationDelay = `${i * 0.4}s`;
            container.appendChild(el);
        }
    } else if (id === 10) { // Fireworks
        const centers = [
            {x: '30vw', y: '30vh'},
            {x: '70vw', y: '40vh'},
            {x: '50vw', y: '60vh'}
        ];
        centers.forEach((center, cIdx) => {
            for (let i = 0; i < 12; i++) {
                const el = document.createElement('div');
                el.className = 'emoji-particle firework-spark';
                el.textContent = selectedEmojis[Math.floor(Math.random() * selectedEmojis.length)];
                el.style.left = center.x;
                el.style.top = center.y;
                const angle = (i / 12) * Math.PI * 2;
                const dist = 80 + Math.random() * 80;
                el.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
                el.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
                el.style.animationDelay = `${cIdx * 0.4}s`;
                container.appendChild(el);
            }
        });
    } else if (id === 11) { // Heart shower
        for (let i = 0; i < 20; i++) {
            const el = document.createElement('div');
            el.className = 'emoji-particle heart-shower';
            el.textContent = selectedEmojis[Math.floor(Math.random() * selectedEmojis.length)];
            el.style.left = `${Math.random() * 100}vw`;
            el.style.top = `-50px`;
            el.style.animationDuration = `${2.0 + Math.random() * 1.5}s`;
            el.style.animationDelay = `${Math.random() * 0.5}s`;
            container.appendChild(el);
        }
    } else if (id === 12) { // Medal drop
        const el = document.createElement('div');
        el.className = 'emoji-particle medal-drop';
        el.textContent = '🏅';
        el.style.left = '50%';
        el.style.top = '-100px';
        container.appendChild(el);
    }
    
    setTimeout(() => {
        container.style.display = 'none';
        container.innerHTML = '';
    }, 4500);
}

// Call browser compatibility check immediately on load
if (typeof document !== 'undefined') {
    if (!isSpeechRecognitionSupported()) {
        const btnListen = document.getElementById('btn-listen');
        if (btnListen) {
            btnListen.style.display = 'none';
        }
    }
}

// ============================================================================
// RETRO ARCADE SOUND SYNTHESIZER (WEB AUDIO API)
// ============================================================================
let audioCtx = null;
let successSoundOrder = [];
let failureSoundOrder = [];
let successSoundIndex = 0;
let failureSoundIndex = 0;
let lastSuccessSound = -1;
let lastFailureSound = -1;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// Unlock audio context on first click
if (typeof document !== 'undefined') {
    document.addEventListener('click', () => {
        try {
            getAudioContext();
        } catch(e) {}
    }, { once: true });
}

function getNextSuccessSound() {
    if (successSoundOrder.length === 0 || successSoundIndex >= successSoundOrder.length) {
        successSoundOrder = Array.from({length: 10}, (_, i) => i);
        // Shuffle
        for (let i = 9; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [successSoundOrder[i], successSoundOrder[j]] = [successSoundOrder[j], successSoundOrder[i]];
        }
        // Avoid repeat
        if (lastSuccessSound !== -1 && successSoundOrder[0] === lastSuccessSound) {
            const swap = 1 + Math.floor(Math.random() * 9);
            [successSoundOrder[0], successSoundOrder[swap]] = [successSoundOrder[swap], successSoundOrder[0]];
        }
        successSoundIndex = 0;
    }
    const snd = successSoundOrder[successSoundIndex++];
    lastSuccessSound = snd;
    return snd;
}

function getNextFailureSound() {
    if (failureSoundOrder.length === 0 || failureSoundIndex >= failureSoundOrder.length) {
        failureSoundOrder = Array.from({length: 10}, (_, i) => i);
        // Shuffle
        for (let i = 9; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [failureSoundOrder[i], failureSoundOrder[j]] = [failureSoundOrder[j], failureSoundOrder[i]];
        }
        // Avoid repeat
        if (lastFailureSound !== -1 && failureSoundOrder[0] === lastFailureSound) {
            const swap = 1 + Math.floor(Math.random() * 9);
            [failureSoundOrder[0], failureSoundOrder[swap]] = [failureSoundOrder[swap], failureSoundOrder[0]];
        }
        failureSoundIndex = 0;
    }
    const snd = failureSoundOrder[failureSoundIndex++];
    lastFailureSound = snd;
    return snd;
}

// playSuccessArcadeSound (10 unique sounds)
function playSuccessArcadeSound(soundIndex) {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        
        switch (soundIndex) {
            case 0: // Coin Collect
                playTone(987.77, 0.08, 'sine', now);
                playTone(1318.51, 0.25, 'sine', now + 0.08);
                break;
            case 1: // Power-up Arpeggio
                playTone(523.25, 0.07, 'triangle', now);
                playTone(659.25, 0.07, 'triangle', now + 0.07);
                playTone(783.99, 0.07, 'triangle', now + 0.14);
                playTone(1046.50, 0.2, 'triangle', now + 0.21);
                break;
            case 2: // High-pitch Chirp
                playSweep(800, 1600, 0.15, 'sine', now);
                break;
            case 3: // Laser Zap Success
                playSweep(1500, 800, 0.1, 'sawtooth', now);
                playSweep(1800, 1000, 0.1, 'sawtooth', now + 0.08);
                break;
            case 4: // Double Tone
                playTone(880, 0.06, 'sine', now);
                playTone(880, 0.06, 'sine', now + 0.1);
                break;
            case 5: // Level Up
                playTone(261.63, 0.08, 'square', now);
                playTone(329.63, 0.08, 'square', now + 0.08);
                playTone(392.00, 0.08, 'square', now + 0.16);
                playTone(523.25, 0.25, 'square', now + 0.24);
                break;
            case 6: // Rising Bubble
                playSweep(400, 1200, 0.25, 'triangle', now);
                break;
            case 7: // Sparkle Chime
                playTone(2000, 0.05, 'sine', now);
                playTone(2500, 0.05, 'sine', now + 0.04);
                playTone(3000, 0.05, 'sine', now + 0.08);
                playTone(3500, 0.1, 'sine', now + 0.12);
                break;
            case 8: // Victory Fanfare
                playTone(587.33, 0.1, 'sine', now);
                playTone(587.33, 0.05, 'sine', now + 0.1);
                playTone(587.33, 0.05, 'sine', now + 0.15);
                playTone(783.99, 0.3, 'sine', now + 0.2);
                break;
            case 9: // Short Bouncing Tones
                playTone(600, 0.05, 'triangle', now);
                playTone(800, 0.05, 'triangle', now + 0.06);
                playTone(1000, 0.05, 'triangle', now + 0.12);
                break;
        }
    } catch(e) {
        console.error("Audio playback error:", e);
    }
}

// playFailureArcadeSound (10 unique sounds)
function playFailureArcadeSound(soundIndex) {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        
        switch (soundIndex) {
            case 0: // Down Sweep / Hurt
                playSweep(300, 80, 0.3, 'triangle', now);
                break;
            case 1: // Retro Explosion
                playNoiseExplosion(now);
                break;
            case 2: // Harsh Buzzer
                playHarshBuzzer(130, 0.3, now);
                break;
            case 3: // Sad Trombone Arpeggio
                playTone(220.00, 0.15, 'sawtooth', now);
                playTone(207.65, 0.15, 'sawtooth', now + 0.15);
                playTone(196.00, 0.3, 'sawtooth', now + 0.3);
                break;
            case 4: // Descending Laser
                playSweep(800, 200, 0.25, 'sawtooth', now);
                break;
            case 5: // Dull Blip
                playTone(150, 0.2, 'triangle', now);
                break;
            case 6: // Dissonant Alarm
                playTone(220, 0.1, 'square', now);
                playTone(200, 0.1, 'square', now + 0.1);
                break;
            case 7: // Warning Pulse
                playTone(180, 0.08, 'sawtooth', now);
                playTone(180, 0.08, 'sawtooth', now + 0.12);
                break;
            case 8: // Decaying Oscillator
                playSweep(400, 50, 0.4, 'sawtooth', now);
                break;
            case 9: // Dissonant Buzz
                playDissonantBuzz(150, 165, 0.3, now);
                break;
        }
    } catch(e) {
        console.error("Audio playback error:", e);
    }
}

// Audio helpers
function playTone(freq, duration, type, startTime) {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    gainNode.gain.setValueAtTime(0.12, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
}

function playSweep(startFreq, endFreq, duration, type, startTime) {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);
    
    gainNode.gain.setValueAtTime(0.12, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
}

function playNoiseExplosion(startTime) {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * 0.3; // 300ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, startTime);
    filter.frequency.exponentialRampToValueAtTime(100, startTime + 0.3);
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.15, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
    
    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseNode.start(startTime);
    noiseNode.stop(startTime + 0.3);
}

function playHarshBuzzer(freq, duration, startTime) {
    const ctx = getAudioContext();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(freq, startTime);
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq * 1.02, startTime);
    
    gainNode.gain.setValueAtTime(0.08, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
}

function playDissonantBuzz(freq1, freq2, duration, startTime) {
    const ctx = getAudioContext();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq1, startTime);
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq2, startTime);
    
    gainNode.gain.setValueAtTime(0.08, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
}

// Play a pleasant ascending two-tone chime when reset-to-beginning is triggered (>1.5s long-press)
function playResetChime() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        
        // Note 1: C5 (523.25 Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now);
        gain1.gain.setValueAtTime(0.14, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.18);

        // Note 2: G5 (783.99 Hz)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(783.99, now + 0.11);
        gain2.gain.setValueAtTime(0.16, now + 0.11);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.11);
        osc2.stop(now + 0.32);
    } catch (e) {
        console.warn('Audio reset chime failed:', e);
    }
}