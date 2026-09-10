# Kidmedia Educational Web Apps — Profiles Standard: Erasmus+ vs Kidmedia.eu

> **Document Status**: Mandatory Architectural Reference  
> **Target Audience**: Developers, Designers, Antigravity Agents  
> **Scope**: All Web Applications in `C:\Christos\Antigravity`

---

## 1. Overview of Two Distinct Project Profiles

Every educational application developed under the Kidmedia ecosystem belongs strictly to one of two profiles:
1. **Profile A: Erasmus+ Co-funded** (Public, EU funded assistive tools)
2. **Profile B: Kidmedia.eu Standalone** (Kidmedia organization tools & products)

The agent MUST verify and enforce the correct profile branding and footer compliance whenever inspecting, modifying, or creating projects.

---

## 2. Profile A: Erasmus+ Co-Funded

### Projects
- `_Final-Reader-for-Erasmus` (Master Reference)
- `Erasmus-reader`
- `Co-funded`
- *(Future projects explicitly designated by user)*

### Branding & Header
- **Logo**: `Sesat-kidmedia-net.png` (from `images/` or `all-co-funded/`).
- **Logo Link**: Must link to `https://kidmedia.net/` with `target="_blank" rel="noopener noreferrer"`.
- **Title / Subtitle**: Display official EU project reference: *"Co-funded by the Erasmus+ Programme of the European Union"*.

### Footer & Printout Compliance
- **Web App Footer**:
  - Displays the official EU Co-funded emblem in the currently selected language (from `all-co-funded/[LANG]_Co-fundedbytheEU_RGB_POS.png`).
  - Displays the mandatory official EU disclaimer text translated into the active language (from `translations.json` or `disclaimer-text.odt`):
    > *"Co-funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the European Education and Culture Executive Agency (EACEA). Neither the European Union nor EACEA can be held responsible for them."*
- **Printouts / Worksheets (A4)**:
  - Every printed worksheet MUST include the EU emblem and the localized disclaimer text in the footer.

---

## 3. Profile B: Kidmedia.eu Standalone

### Projects
- `Kidmedia.eu`
- `Multiplication`
- `Print`
- `Printouts`
- `Using-money`
- `Rapid Naming Activity`
- `Dyslexia-reader`
- `Split-Syllables`
- `Mathsteroids`
- `Geometry-dash-clone`
- `13-One-euro`
- *(All other general web apps)*

### Branding & Header
- **Logo**: ONLY `Kidmedia-logo.png`.
- **Logo Link**: Must link to `https://kidmedia.eu/`.
- **Title / Subtitle**: Kidmedia educational branding.

### Footer & Printout Compliance
- **NO EU emblem**.
- **NO Erasmus+ disclaimer text**.
- Clean footer with Kidmedia copyright and portal link.

---

## 4. Verification Checklist for Agents

When examining any project:
1. Identify if project is listed under Erasmus or Kidmedia.eu.
2. If **Erasmus**:
   - Check presence of `Sesat-kidmedia-net.png` and link to `https://kidmedia.net/`.
   - Check footer for dynamic EU emblem + disclaimer in active language.
3. If **Kidmedia.eu**:
   - Ensure NO Erasmus emblems or disclaimers are present.
   - Verify header has `Kidmedia-logo.png` linking to `https://kidmedia.eu/`.
