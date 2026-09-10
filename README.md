# 📖 Kidmedia Reader

> **An accessible, multi-sensory reading web application designed for students with dyslexia, autism, and motor impairments.**  
> *Co-funded by the Erasmus+ Programme of the European Union.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#license)
[![Languages](https://img.shields.io/badge/Languages-24%20EU%20Official-success.svg)](i18n/translations.json)
[![Accessibility](https://img.shields.io/badge/Accessibility-Single--Switch%20Scanning-orange.svg)](#-accessibility--single-switch-access)
[![Kidmedia](https://img.shields.io/badge/Project-Kidmedia.eu-1976d2.svg)](https://kidmedia.eu/)

---

## 🌟 Overview

**Kidmedia Reader** is an open-source, browser-based assistive reading platform developed under the **Kidmedia** Erasmus+ partnership. It provides educators, therapists, and parents with powerful customization tools to support diverse learners through:

* Visual text segmentation (syllable, word, and sentence highlighting)
* Dyslexia-friendly typography and adjustable reading veils
* Symbol & pictogram association for unknown vocabulary
* Speech synthesis (Google Cloud TTS Neural2/WaveNet & local voices)
* Interactive voice recognition tutoring
* Single-switch scanning access for students with physical motor disabilities
* Instant printable worksheets generator with 9 educational exercise types
* Complete localization across all **24 official European Union languages**

---

## ✨ Key Features

### 1. 📥 Text Management & Syllabification
* **Direct Input & Syllable Segmentation:** Type or paste text directly. Use the `|` delimiter for automatic syllable breakdown (e.g., `Li|brary`).
* **Google Sheets Integration:** Connect external, publicly published Google Sheets (CSV) to load stories and custom vocabularies dynamically across multiple languages.
* **Local File Support:** Open and save exercises in standard `.txt` format.
* **🔗 1-Click Exercise Sharing:** Encodes all text and accessibility settings directly into a URL hash fragment for instant student launching without a backend database.

### 2. 🅰️ Dyslexia-Friendly Typography & Reading Veil
* **Specialized Fonts:** Includes `OpenDyslexic`, `Kidmedia Kids`, `Comic Sans`, `Roboto`, and support for custom font uploads (`.ttf`, `.otf`, `.woff`, `.woff2`).
* **High Contrast & Comfort:** Freely adjust font sizes, letter weights, foreground/background color themes, and letter spacing.
* **🌑 Spotlight Reading Veil:** Dims surrounding text to reduce visual crowding and spotlights the currently read word or syllable with customizable opacity and tints.

### 3. 🖼️ Pictograms & Custom Illustrated Vocabulary
* **Visual Modes:** Choose between *None*, *All* (displays pictograms above matching words), or *Unknown Only* (highlights specific target vocabulary from Column C of a connected Google Sheet).
* **Adjustable Icon Dimensions:** Scale pictograms from 40px to 100px.
* **🎨 Custom Dictionary Manager:** Copy vocabulary templates directly to Google Sheets, customize words in any language, and publish as CSV in 4 simple steps.

### 4. 🗣️ Speech Synthesis (TTS) & Interactive Voice Tutor
* **Dual TTS Engines:**
  * **System Voices:** Works offline using local browser voices.
  * **Google Cloud TTS Premium:** High-fidelity, human-like **Neural2** and **WaveNet** voices across 24 languages with a built-in character usage monitor (1,000,000 chars/month free tier).
* **PIN Protection:** Lock the API key settings with a 4-digit PIN to prevent accidental student alterations.
* **👂 Interactive Voice Tutor:** Students read aloud into their microphone. The app performs speech recognition, highlights correct (green) and mispronounced (red) words, rewards effort with arcade sound effects and celebratory emoji particles, and encourages repeated practice.

### 5. 👁️ Accessibility & Single-Switch Access
* **Cyclical Auto-Scanning:** Cyclically iterates through navigation buttons with a prominent, high-contrast focus border (`.scan-focus`) for learners with limited motor control.
* **Universal Switch Triggers:** Activate via screen tap/click, `Space`, `Enter`, or external USB/Bluetooth adaptive switches.
* **Teacher Escape Override:** Pause scanning and regain settings access at any time by moving the mouse, holding touch for 4 seconds, or pressing `Escape`.

### 6. 🖨️ Printable Worksheets Generator (9 Exercise Types)
Automatically transforms any reading story into ready-to-print educational worksheets containing student headers, illustrated text cards, and Erasmus+ co-funding disclaimers:
1. **Missing Letters:** Fill in missing characters.
2. **Missing Words:** Fill in missing words with exact character-length blank guides.
3. **Word Completion:** First letter given with blank lines for the remainder.
4. **Crossword Puzzles:** Auto-generated grid (3–8 target words).
5. **Word Search Puzzles:** Dynamic grid (3–10 target words, horizontal/vertical).
6. **Syllable Train:** Scrambled syllables placed inside train carriages.
7. **Initial Letter Identification:** Spot words sharing the most frequent initial phoneme.
8. **Rhyming / Matching Endings:** Group words sharing identical suffixes.
9. **Picture-to-Word Writing Cards:** Illustrated cards with blank handwriting guides.

### 7. 🌍 Full 24 EU Language Support
Seamlessly switch between all 24 official European Union languages via the top-right flag selector:

| | | | | | |
|---|---|---|---|---|---|
| 🇬🇷 Greek (`el`) | 🇬🇧 English (`en`) | 🇫🇷 French (`fr`) | 🇩🇪 German (`de`) | 🇪🇸 Spanish (`es`) | 🇮🇹 Italian (`it`) |
| 🇵🇹 Portuguese (`pt`) | 🇳🇱 Dutch (`nl`) | 🇵🇱 Polish (`pl`) | 🇷🇴 Romanian (`ro`) | 🇸🇪 Swedish (`sv`) | 🇩🇰 Danish (`da`) |
| 🇫🇮 Finnish (`fi`) | 🇨🇿 Czech (`cs`) | 🇭🇺 Hungarian (`hu`) | 🇸🇰 Slovak (`sk`) | 🇧🇬 Bulgarian (`bg`) | 🇭🇷 Croatian (`hr`) |
| 🇱🇹 Lithuanian (`lt`) | 🇱🇻 Latvian (`lv`) | 🇪🇪 Estonian (`et`) | 🇲🇹 Maltese (`mt`) | 🇮🇪 Irish (`ga`) | 🇸🇮 Slovenian (`sl`) |

---

## 🚀 Getting Started

The application is completely **client-side** and requires no server-side build steps, runtime installation, or databases.

### Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/bitsisc/Reader.git
   cd Reader
   ```
2. Open `index.html` directly in any modern browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari), or serve with any static web server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node (npx)
   npx serve .
   ```
3. Navigate to `http://localhost:8000` in your web browser.

---

## 🔑 Setting up Google Cloud TTS (Optional)

For the most natural, human-like voice synthesis:

1. Log in to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project via the [New Project Page](https://console.cloud.google.com/projectcreate).
3. Enable the [Cloud Text-to-Speech API](https://console.cloud.google.com/marketplace/product/google/texttospeech.googleapis.com).
4. Go to [Credentials](https://console.cloud.google.com/apis/credentials), click **+ Create Credentials** ➔ **API Key**.
5. In the Reader app under **Settings ➔ 🔑 Premium Voice**, paste your key.
6. The app will automatically fetch Neural2 and WaveNet voices. Click the **lock icon (🔓)** to protect it with a PIN.

> 💡 **Free Tier Note:** Google Cloud TTS provides **1,000,000 characters free every month**, which is more than enough for thousands of student reading sessions.

---

## 📂 Project Architecture

The codebase follows the **Kidmedia App Builder** standards:

```text
Reader/
├── index.html                  # Semantic single-page application structure
├── css/
│   └── styles.css              # Vanilla CSS layout, responsive design & scan styles
├── fonts/
│   ├── opendyslexic/           # Dyslexia-friendly typography
│   └── kidmedia/               # Specialized primary education fonts
├── i18n/
│   └── translations.json       # Master dictionary for all 24 EU languages
├── images/                     # EU logos, icons, and pictograms
├── all-co-funded/              # Co-funded EU flags and disclaimers in all 24 languages
└── js/                         # Vanilla ES Modules (type="module")
    ├── main.js                 # App initialization, routing & lifecycle
    ├── state.js                # Centralized state management
    ├── storage.js              # LocalStorage & cookie persistence
    ├── i18n.js                 # Dynamic DOM localization loader
    ├── parser.js               # CSV parser for Google Sheets & text splitter
    ├── render.js               # Text rendering, highlighting & veil controls
    ├── events.js               # UI interaction handlers & switch scanning loop
    ├── tts.js                  # Speech synthesis (Web Speech API + Google Cloud TTS)
    └── worksheet.js            # Printable worksheet exercise generator & print window
```

---

## 🤝 Erasmus+ Disclaimer

<p align="center">
  <img src="images/EL_Co-fundedbytheEU_RGB_POS.png" alt="Co-funded by the European Union" width="300">
</p>

*Co-funded by the Erasmus+ Programme of the European Union.*  
The European Commission's support for the production of this publication does not constitute an endorsement of the contents, which reflect the views only of the authors, and the Commission cannot be held responsible for any use which may be made of the information contained therein.

For more information, visit [Kidmedia.eu](https://kidmedia.eu/).

---

## 📄 License

This project is open-source and distributed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.
