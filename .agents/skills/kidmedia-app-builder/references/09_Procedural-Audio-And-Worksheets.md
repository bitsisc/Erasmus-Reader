# Kidmedia Educational Web Apps — Procedural Web Audio & Worksheet Engine

> **Document Status**: Mandatory Architectural Reference  
> **Source of Truth**: `_Final-Reader-for-Erasmus` (`js/tts.js`, `js/worksheet.js`)  
> **Target Audience**: Developers, UI/UX Designers, Special Education Technologists

---

## 1. Zero-Asset Procedural Audio (Web Audio API)

Assistive web applications must never fail to play audio rewards or cues due to missing sound files, slow network connections, or blocked CDN requests. 

All interactive audio feedback (arcade success sounds, buzzers, error signals, level completion fanfare) MUST be generated procedurally via the browser's native **Web Audio API** (`AudioContext`) without external `.mp3` or `.wav` dependencies.

### Pattern (from `_Final-Reader-for-Erasmus/js/tts.js`):
```javascript
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play pure synthetic tones
function playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.2) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type; // 'sine', 'triangle', 'square', 'sawtooth'
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(gainVal, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

// Procedural arcade reward fanfare
function playSuccessArcadeSound() {
  const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
  notes.forEach((f, idx) => {
    setTimeout(() => playTone(f, 'triangle', 0.12, 0.25), idx * 80);
  });
}

// Procedural soft error buzzer
function playFailureArcadeSound() {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.25);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.25);
}
```

---

## 2. Dynamic Printable Worksheet Engine (A4 Layout)

Any educational reading/math app should have the capability to convert digital exercises into ready-to-print A4 worksheets.

### Supported Pedagogical Exercise Types (from `worksheet.js`):
1. **Missing Letters**: Blank slots for missing vowels/consonants.
2. **Missing Words**: Cloze-test style sentence completion.
3. **Word Outlines**: Word shape/bounding box recognition for visual learners.
4. **Crossword Puzzles**: Algorithmic grid generator matching vocabulary.
5. **Word Search Puzzles**: Matrix search with horizontal/vertical word placement.
6. **Syllable Train**: Syllable ordering within visual train carriages.
7. **Initial Letter Identification**: Phonological awareness grouping.
8. **Rhyme & Ending Suffix Matching**: Grouping words with identical phonological endings.
9. **Picture-to-Word Writing Cards**: Dual-column visual matching with handwriting guide lines.

### Printing Rules:
- Printouts MUST use pure CSS `@media print` rules.
- Paper size: standard A4 (`size: A4 portrait` or `landscape`).
- If Erasmus Profile: Include EU emblem + active language disclaimer in the printable footer.
- If Kidmedia.eu Profile: Include Kidmedia copyright header, omit EU emblems.
