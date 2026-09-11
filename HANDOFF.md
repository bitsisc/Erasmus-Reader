# Session Handoff Log

## Current Status: SYNCED
- **Last Updated**: 2026-09-11 18:10:00 (Local Time)
- **Workstation**: Home PC
- **Active Branch**: main
- **GitHub Repo**: https://github.com/bitsisc/Erasmus-Reader

## What Was Completed in This Session
- **STT Toast Duration**: Reduced 'Αποθηκεύτηκε επιτυχώς!' duration from 3.0s to 1.5s in `js/events.js`.
- **Landscape Font-Size Fix**: Removed `5.5dvh` clamp (`min(..., 5.5dvh) !important`) from `css/styles.css` line 1143. Replaced with `font-size: var(--dynamic-font-size) !important;`. The font size selected by the user on Screen 1 is now fully respected on Screen 2 in landscape mode across all sizes.
- **CSV Parser Enhancements**: Added auto-detection of delimiters (comma `,`, tab `\t`, semicolon `;`) in `js/parser.js` (`parseCsvIntoDictionary`) to seamlessly support direct TSV clipboard pastes, Google Sheets CSV exports, and raw files with/without headers and quotes.
- **Usage Tracker Clarity**: Renamed "Μηνιαία Κατανάλωση" to **"Χρήση συσκευής"** (Device Usage) in `index.html` and `i18n/translations.json` (EL/EN), with explicit caption clarifying that the meter tracks locally on that specific device and resets on the 1st of each month.
- **Google Cloud Quota & Zero-Billing Protection Guide**: Added detailed Step 5 in the API modal (`modal_api_info_html` in `i18n/translations.json` in EL & EN) explaining how multi-device classrooms accumulate usage in Google Cloud and providing step-by-step instructions for setting an API Quota Cap (33,000 chars/day) and 0€ Budget Alert to guarantee 100% zero billing.
- **Service Worker**: Bumped cache version to `erasmus-reader-v5` (`sw.js`).

## Key Architectural Decisions Made
- Dynamic delimiter detection in CSV parser ensures full compatibility across formats (comma, tab TSV, semicolon).

## Next Immediate Steps
- Await user feedback on CSV formats & fullscreen button preference.
- Await user approval on git push ('Ενημέρωση Git;').

## Known Issues / Blockers
- None.

