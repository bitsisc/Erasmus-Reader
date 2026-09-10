// js/storage.js

function getActualApiKey() {
    return localStorage.getItem('readingToolApiKey') || '';
}

function getActualSttApiKey() {
    const syncWithTts = localStorage.getItem('readingToolSyncSttWithTts') === 'true';
    if (syncWithTts) {
        return getActualApiKey();
    }
    return localStorage.getItem('readingToolSTTApiKey') || '';
}

function getCurrentMonthString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function checkMonthlyReset() {
    const currentMonth = getCurrentMonthString();
    const storedMonth = localStorage.getItem('readingToolUsageMonth');
    if (storedMonth !== currentMonth) {
        localStorage.setItem('readingToolUsageMonth', currentMonth);
        localStorage.setItem('readingToolTTSUsage', '0');
        localStorage.setItem('readingToolSTTUsage', '0');
    }
}

function addTTSUsage(charCount) {
    checkMonthlyReset();
    const currentCount = parseInt(localStorage.getItem('readingToolTTSUsage') || '0', 10);
    localStorage.setItem('readingToolTTSUsage', String(currentCount + charCount));
    updateUsageUI();
}

function addSTTUsage(seconds) {
    checkMonthlyReset();
    const currentSec = parseInt(localStorage.getItem('readingToolSTTUsage') || '0', 10);
    localStorage.setItem('readingToolSTTUsage', String(currentSec + seconds));
    updateSttUsageUI();
}

function updateUsageUI() {
    checkMonthlyReset();
    const apiKey = getActualApiKey();
    const tracker = document.getElementById('tts-usage-tracker');
    const premiumContainer = document.getElementById('premium-voice-container');
    const localVoiceSettings = document.getElementById('local-voice-settings');
    const alertEl = document.getElementById('tts-billing-alert');
    const t = (typeof i18n !== 'undefined' && (i18n[currentLang] || i18n['en'] || i18n['el'])) || {};

    if (apiKey !== '') {
        tracker.style.display = 'flex';
        premiumContainer.style.display = 'flex';
        localVoiceSettings.style.display = 'none';
        const currentCount = parseInt(localStorage.getItem('readingToolTTSUsage') || '0', 10);
        const countEl = document.getElementById('tts-char-count');
        if (countEl) {
            countEl.textContent = currentCount.toLocaleString(currentLang || 'el-GR');
        }

        const barEl = document.getElementById('tts-usage-bar');
        if (barEl) {
            const maxChars = 1000000;
            const pct = Math.min(100, Math.round((currentCount / maxChars) * 100));
            barEl.style.width = `${pct}%`;
            if (currentCount >= 1000000) {
                barEl.style.backgroundColor = '#ef4444';
            } else if (currentCount >= 800000) {
                barEl.style.backgroundColor = '#f59e0b';
            } else {
                barEl.style.backgroundColor = '#10b981';
            }
        }

        if (alertEl) {
            if (currentCount >= 1000000) {
                alertEl.style.display = 'block';
                alertEl.style.backgroundColor = '#ffebee';
                alertEl.style.color = '#c62828';
                alertEl.style.border = '1px solid #ef9a9a';
                alertEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${t['tts_billing_alert_exceeded'] || '⚠️ Έχετε υπερβεί το δωρεάν όριο του 1.000.000 χαρακτήρων για αυτόν τον μήνα! Από εδώ και πέρα υπάρχει χρέωση στο Google Cloud.'}`;
            } else if (currentCount >= 800000) {
                alertEl.style.display = 'block';
                alertEl.style.backgroundColor = '#fff8e1';
                alertEl.style.color = '#f57f17';
                alertEl.style.border = '1px solid #ffe082';
                alertEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${t['tts_billing_alert_warning'] || '⚠️ Πλησιάζετε το δωρεάν όριο του 1.000.000 χαρακτήρων για αυτόν τον μήνα.'}`;
            } else {
                alertEl.style.display = 'none';
            }
        }
    } else {
        tracker.style.display = 'none';
        premiumContainer.style.display = 'none';
        localVoiceSettings.style.display = 'block'; 
        if (alertEl) alertEl.style.display = 'none';
    }
}

function updateSttUsageUI() {
    checkMonthlyReset();
    const currentSec = parseInt(localStorage.getItem('readingToolSTTUsage') || '0', 10);
    const countEl = document.getElementById('stt-time-count');
    const barEl = document.getElementById('stt-usage-bar');
    const alertEl = document.getElementById('stt-billing-alert');
    const t = (typeof i18n !== 'undefined' && (i18n[currentLang] || i18n['en'] || i18n['el'])) || {};

    const minutes = Math.floor(currentSec / 60);
    const seconds = currentSec % 60;
    const minUnit = (typeof getText === 'function' && getText('unit_minutes_short')) ? getText('unit_minutes_short') : 'm.';
    const secUnit = (typeof getText === 'function' && getText('unit_seconds_short')) ? getText('unit_seconds_short') : 's.';
    if (countEl) {
        countEl.textContent = `${minutes}${minUnit} ${seconds}${secUnit}`;
    }

    const maxSeconds = 3600; // 60 minutes
    const pct = Math.min(100, Math.round((currentSec / maxSeconds) * 100));
    if (barEl) {
        barEl.style.width = `${pct}%`;
        if (currentSec >= 3600) {
            barEl.style.backgroundColor = '#ef4444';
        } else if (currentSec >= 3000) {
            barEl.style.backgroundColor = '#f59e0b';
        } else {
            barEl.style.backgroundColor = '#10b981';
        }
    }

    if (alertEl) {
        if (currentSec >= 3600) {
            alertEl.style.display = 'block';
            alertEl.style.backgroundColor = '#ffebee';
            alertEl.style.color = '#c62828';
            alertEl.style.border = '1px solid #ef9a9a';
            alertEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${t['stt_billing_alert_exceeded'] || '⚠️ Έχετε υπερβεί τα 60 δωρεάν λεπτά για αυτόν τον μήνα! Από εδώ και πέρα υπάρχει χρέωση στο Google Cloud (~$0.016/λεπτό).'}`;
        } else if (currentSec >= 3000) {
            alertEl.style.display = 'block';
            alertEl.style.backgroundColor = '#fff8e1';
            alertEl.style.color = '#f57f17';
            alertEl.style.border = '1px solid #ffe082';
            alertEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${t['stt_billing_alert_warning'] || '⚠️ Πλησιάζετε το δωρεάν όριο των 60 λεπτών για αυτόν τον μήνα.'}`;
        } else {
            alertEl.style.display = 'none';
        }
    }
}

function updateLockUI() {
    const btnView = document.getElementById('btn-toggle-key-view');
    const btnLock = document.getElementById('btn-pin-lock');
    const btnLockStt = document.getElementById('btn-pin-lock-stt');
    const btnViewStt = document.getElementById('btn-toggle-stt-key-view');
    const syncCheckbox = document.getElementById('sync-stt-with-tts-key');
    const sttKeyContainer = document.getElementById('stt-key-input-container');

    const syncWithTts = localStorage.getItem('readingToolSyncSttWithTts') === 'true';
    if (syncCheckbox) {
        syncCheckbox.checked = syncWithTts;
    }

    if (isApiLocked) {
        // TTS Input
        inputs.apiKey.type = 'password';
        inputs.apiKey.value = '****************';
        inputs.apiKey.disabled = true;
        if (btnView) btnView.style.display = 'none';
        if (btnLock) btnLock.innerHTML = '<i class="fa-solid fa-lock" style="color:#d32f2f;"></i>';

        // STT Input
        if (inputs.sttApiKey) {
            inputs.sttApiKey.type = 'password';
            inputs.sttApiKey.value = '****************';
            inputs.sttApiKey.disabled = true;
        }
        if (btnViewStt) btnViewStt.style.display = 'none';
        if (syncCheckbox) syncCheckbox.disabled = true;
        if (btnLockStt) btnLockStt.innerHTML = '<i class="fa-solid fa-lock" style="color:#d32f2f;"></i>';
    } else {
        // TTS Input
        inputs.apiKey.disabled = false;
        inputs.apiKey.value = getActualApiKey();
        if (btnView) btnView.style.display = 'inline-flex';
        if (btnLock) btnLock.innerHTML = '<i class="fa-solid fa-lock-open" style="color:#388e3c;"></i>';

        // STT Input
        if (syncCheckbox) syncCheckbox.disabled = false;
        if (btnLockStt) btnLockStt.innerHTML = '<i class="fa-solid fa-lock-open" style="color:#388e3c;"></i>';

        if (syncWithTts) {
            if (inputs.sttApiKey) {
                inputs.sttApiKey.type = 'password';
                inputs.sttApiKey.value = getActualApiKey();
                inputs.sttApiKey.disabled = true;
            }
            if (btnViewStt) btnViewStt.style.display = 'inline-flex';
            if (sttKeyContainer) sttKeyContainer.style.opacity = '0.75';
        } else {
            if (inputs.sttApiKey) {
                inputs.sttApiKey.disabled = false;
                inputs.sttApiKey.value = localStorage.getItem('readingToolSTTApiKey') || '';
            }
            if (btnViewStt) btnViewStt.style.display = 'inline-flex';
            if (sttKeyContainer) sttKeyContainer.style.opacity = '1';
        }
    }

    // Update STT Active/Inactive Status Badge
    const sttBadge = document.getElementById('stt-status-badge');
    const sttBadgeText = document.getElementById('stt-status-badge-text');
    if (sttBadge && sttBadgeText) {
        const t = (typeof i18n !== 'undefined' && (i18n[currentLang] || i18n['en'] || i18n['el'])) || {};
        const activeKey = getActualSttApiKey();
        if (activeKey && activeKey.trim() !== '') {
            if (syncWithTts) {
                sttBadge.className = 'stt-status-badge synced';
                sttBadge.innerHTML = `<i class="fa-solid fa-link"></i> <span id="stt-status-badge-text">${t['stt_status_active_synced'] || 'Ενεργό (TTS)'}</span>`;
            } else {
                sttBadge.className = 'stt-status-badge active';
                sttBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span id="stt-status-badge-text">${t['stt_status_active'] || 'Ενεργό'}</span>`;
            }
        } else {
            sttBadge.className = 'stt-status-badge inactive';
            sttBadge.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> <span id="stt-status-badge-text">${t['stt_status_inactive'] || 'Ανενεργό'}</span>`;
        }
    }

    updateUsageUI();
    updateSttUsageUI();
    if (typeof updateSpeechRecognitionButtonVisibility === 'function') {
        updateSpeechRecognitionButtonVisibility();
    }
}

function openPinModal() {
    const t = (typeof i18n !== 'undefined' && (i18n[currentLang] || i18n['en'] || i18n['el'])) || {};
    if (isApiLocked) {
        document.getElementById('pin-modal-desc').textContent = t['pin_modal_desc_unlock'] || "Enter PIN to unlock:";
        inputs.pin.type = "password";
        pendingPinAction = 'unlock';
    } else {
        document.getElementById('pin-modal-desc').textContent = t['pin_modal_desc_lock'] || "Set 4-digit lock PIN (blank to remove):";
        inputs.pin.type = "text";
        pendingPinAction = 'lock';
    }
    inputs.pin.value = "";
    modals.pin.style.display = 'flex';
    inputs.pin.focus();
}

let pendingPinAction = null;
const btnPinLock = document.getElementById('btn-pin-lock');
if (btnPinLock) {
    btnPinLock.addEventListener('click', openPinModal);
}

const btnPinLockStt = document.getElementById('btn-pin-lock-stt');
if (btnPinLockStt) {
    btnPinLockStt.addEventListener('click', openPinModal);
}

const btnCancelPin = document.getElementById('btn-cancel-pin');
if (btnCancelPin) {
    btnCancelPin.addEventListener('click', () => {
        modals.pin.style.display = 'none';
    });
}

const btnConfirmPin = document.getElementById('btn-confirm-pin');
if (btnConfirmPin) {
    btnConfirmPin.addEventListener('click', () => {
        const pinVal = inputs.pin.value;
        if (pendingPinAction === 'unlock') {
            if (pinVal === localStorage.getItem('readingToolPin')) {
                isApiLocked = false;
                updateLockUI();
                modals.pin.style.display = 'none';
            } else {
                inputs.pin.value = "";
                inputs.pin.style.border = "2px solid red";
                setTimeout(() => inputs.pin.style.border = "2px solid #eee", 1000);
            }
        } else if (pendingPinAction === 'lock') {
            if (pinVal && pinVal.length === 4) {
                localStorage.setItem('readingToolPin', pinVal);
                isApiLocked = true;
                updateLockUI();
                modals.pin.style.display = 'none';
            } else if (pinVal === "") {
                localStorage.removeItem('readingToolPin');
                isApiLocked = false;
                updateLockUI();
                modals.pin.style.display = 'none';
            } else {
                inputs.pin.style.border = "2px solid red";
                setTimeout(() => inputs.pin.style.border = "2px solid #eee", 1000);
            }
        }
    });
}
