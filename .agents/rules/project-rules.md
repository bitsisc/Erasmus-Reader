---
trigger: always_on
---

# Project Rules: Kidmedia Reader (Erasmus+ Profile)

## Profile
- **Type**: Profile A - Erasmus+ Co-funded
- **Header Logo**: `images/Sesat-kidmedia-net.png` with link to `https://kidmedia.net/` (`target="_blank" rel="noopener noreferrer"`).
- **Footer**: Dynamic EU Co-funded emblem in active EU language + mandatory disclaimer text in active language (both web app and A4 printouts).

## Architecture & Code Standards
- **Stack**: Pure Vanilla HTML5 / CSS3 / ES6 Modules (zero-build).
- **Stateless Links**: Semicolon-delimited URL hash (`;`) with 16 positional parameters.
- **Audio Engine**: Procedural Web Audio API sound synthesis (arcade sfx) + Dual TTS (system voices + Google Cloud Neural2/WaveNet).
- **PWA**: 1-Click Progressive Web App (`manifest.webmanifest`, `sw.js`).
- **Sync & Handoff**: Update `HANDOFF.md` at end of session. Pre-close prompt: `'Ενημέρωση Git;'`.
