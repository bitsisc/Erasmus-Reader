---
name: kidmedia-app-builder
description: Comprehensive standards, architecture patterns, i18n rules, accessibility scanning mode, screen lifecycle, 1-Click PWA, and stateless link security for building Kidmedia Special Education Web Apps (Erasmus+ and Kidmedia.eu profiles).
---

# Kidmedia App Builder Master Skill

This skill defines the mandatory architectural standards, accessibility guidelines, screen lifecycles, PWA offline capabilities, and security protocols for developing educational single-page web applications (SPAs) within the **Kidmedia Educational Web Ecosystem**.

The architectural source of truth and gold standard reference implementation is `C:\Christos\Antigravity\_Final-Reader-for-Erasmus`.

---

## 1. Initial AI Prompting & Profile Selection

Before creating or refactoring any application, the agent MUST establish the project profile:

1. **Profile Selection**:
   * **Profile A: Erasmus+ Co-funded** (`_Final-Reader-for-Erasmus`, `Erasmus-reader`, `Co-funded`)
     * Header Logo: `Sesat-kidmedia-net.png` linking to `https://kidmedia.net/` (`target="_blank" rel="noopener noreferrer"`).
     * Header/Subtitle: *"Co-funded by the Erasmus+ Programme of the European Union"*.
     * Footer & Printouts: Dynamic EU Co-funded emblem in active EU language + mandatory disclaimer text in active language.
   * **Profile B: Kidmedia.eu Standalone** (All other educational apps)
     * Header Logo: ONLY `Kidmedia-logo.png` linking to `https://kidmedia.eu/`.
     * Footer: Clean Kidmedia copyright and portal link. NO EU emblem, NO disclaimer.

2. **Compliance & Evolution Engine (New Ideas)**:
   * When inspecting or creating any HTML5 project, verify compliance with:
     * **1-Click PWA** (`manifest.webmanifest`, `sw.js`, install button).
     * **Stateless Link Protocol** using semicolon delimiter (`;`).
     * **Zero-asset Web Audio API** procedural arcade sounds.
     * **Dual-PC Handoff Protocol** (`HANDOFF.md`).
   * Proactively suggest or add missing architectural features.

---

## 2. Core Architectural Principles

* **Zero-Build Vanilla Tech Stack**: Pure HTML5, CSS3, ES6 JavaScript Modules. No Node build steps, bundlers, Webpack, Vite, or external compilation. Must run instantly in browser or static host (Cloudflare Pages, GitHub Pages).
* **Stateless Parameter Architecture**: Applications persist state via URL hash parameters separated by semicolons (`;`). The URL *is* the database for student exercise distribution.
* **Dual-Layer Access Control**: Teacher Setup & Secret Override vs. Locked Student Play Mode.
* **Universal Switch Accessibility**: Built-in 1-switch / 2-switch cyclical auto-scanning engine with high-contrast indicator (`.scan-focus`) and teacher escape mechanisms.
* **Pedagogical Typography**: Built-in support for `OpenDyslexic`, `Kidmedia Kids`, and high-contrast dyslexia-friendly themes.
* **Full 24 EU Language i18n**: Pure client-side dictionary translation via `translations.json`.

---

## 3. Modular Specifications Sitemap (`references/`)

Developers and agents MUST consult the specialized reference standards in the `references/` directory:

1. **Tech Stack & Layout**: [`01_Tech-Stack-And-Directory-Structure.md`](./references/01_Tech-Stack-And-Directory-Structure.md)
   * Folder layouts, CSS standards, vanilla script separation, responsive design tokens.
2. **Internationalization (i18n)**: [`02_i18n-And-24-EU-Languages.md`](./references/02_i18n-And-24-EU-Languages.md)
   * 24 EU languages, dictionary keys, flag selector UI, RTL/LTR layout handling.
3. **Accessibility & Switch Scanning**: [`03_Accessibility-And-Scanning-Mode.md`](./references/03_Accessibility-And-Scanning-Mode.md)
   * Scanning cycles, speed controls, audio-cue scanning, visual spotlights.
4. **App Screens Architecture**: [`04_App-Screens-Architecture.md`](./references/04_App-Screens-Architecture.md)
   * Screen lifecycle (Setup -> Play -> Score), teacher toolbar, escape sequence.
5. **Stateless Link Architecture**: [`05_Link-Architecture-Security-And-Teacher-Email.md`](./references/05_Link-Architecture-Security-And-Teacher-Email.md)
   * Positional schema with semicolon delimiter (`;`), Google Sheets TSV/CSV integration.
6. **1-Click PWA & Offline Standard**: [`06_PWA-And-Offline-Standard.md`](./references/06_PWA-And-Offline-Standard.md)
   * `manifest.webmanifest`, `sw.js` service worker, cache-first strategy, install prompt UI.
7. **Two Distinct Profiles**: [`07_Two-Profiles-Erasmus-Vs-Kidmedia.md`](./references/07_Two-Profiles-Erasmus-Vs-Kidmedia.md)
   * Erasmus+ vs Kidmedia.eu branding, logos, links, and footer disclaimers.
8. **Dual-PC Handoff Protocol**: [`08_Two-PC-Sync-And-Handoff-Protocol.md`](./references/08_Two-PC-Sync-And-Handoff-Protocol.md)
   * `HANDOFF.md` schema, session end git prompt, session start continuity.
9. **Procedural Web Audio & Worksheets**: [`09_Procedural-Audio-And-Worksheets.md`](./references/09_Procedural-Audio-And-Worksheets.md)
   * Oscillator arcade sound synthesis without external audio files, 9-exercise A4 printable engine.

---

## 4. Master Repository Layout Quick Reference

```text
project-root/
├── .agents/
│   ├── rules/
│   │   └── project-rules.md
│   └── skills/
│       └── kidmedia-app-builder/
│           ├── SKILL.md
│           └── references/
├── css/
│   └── styles.css
├── fonts/               # OpenDyslexic, Kidmedia fonts
├── i18n/
│   └── translations.json # 24 EU languages
├── images/              # Icons, badges, logos
├── js/
│   ├── main.js          # App bootstrap, hash router, PWA registration
│   ├── state.js         # Reactive state & semicolon serialization
│   ├── events.js        # Event listeners, switch scanning loop
│   ├── render.js        # DOM rendering & dyslexia veil
│   ├── i18n.js          # Translation loader & UI switcher
│   ├── tts.js           # Procedural Web Audio API synth & speech
│   └── worksheet.js     # A4 printable worksheet generator (if applicable)
├── all-co-funded/       # (Erasmus Profile only) 24 EU logos & disclaimers
├── manifest.webmanifest # 1-Click PWA Manifest
├── sw.js                # Zero-config Offline Service Worker
├── HANDOFF.md           # Dual-PC Session Tracking Log
├── index.html           # Main SPA entrypoint
├── README.md            # App overview & documentation
└── wrangler.jsonc       # (Optional) Cloudflare Pages deployment
```

---

## 5. Version Control & Git Update Prompt

Per mandatory user rule:
When changes are made to any project tracked on GitHub, ask:
> **'Ενημέρωση Git;'**
Do not commit or push automatically. Wait for user confirmation.
