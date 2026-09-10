# Kidmedia Educational Web Apps: Accessibility & Scanning Mode Standard

> Master Technical Reference for Switch Access, Multi-Level Auto-Scanning, Web Speech API Integration, and Accessible Typography in Kidmedia Special Education Web Applications.

---

## 1. Overview & Core Philosophy

Kidmedia educational web applications are designed for Differentiated Instruction (Διαφοροποιημένη Διδασκαλία) in Special Education. A primary requirement is providing full digital accessibility for students with severe motor, visual, or cognitive disabilities who cannot operate traditional input devices (mouse, touchscreens, standard keyboards).

To achieve full accessibility, all Kidmedia applications integrate a native **Switch Access Engine (Scanning Mode)**, high-contrast visual focus feedback, Web Speech API audio assistance, and accessible font options.

---

## 2. Mandatory AI Exception Question Rule

> [!CRITICAL]
> **MANDATORY RULE FOR ANTIGRAVITY AI**
> Before starting work on building or refactoring any Kidmedia educational application, the Antigravity AI assistant **MUST ALWAYS** explicitly ask the developer/user whether there are any application-specific scanning exceptions, unique UI flow overrides, or custom scan level requirements. No application build process may begin without soliciting this clarification.

---

## 3. Scanning Engine & Multi-Level Architecture

### 3.1 Single-Switch Interaction Model
Students with severe motor impairments use an external switch device (or a single full-screen tap) that sends a standard left-click or keypress command. Because the student can only trigger a single repeated action, the system handles all navigation by automatically cycling through interactive UI elements.

### 3.2 The Interceptor Overlay (`#scan-overlay`) & Supervisor Takeover
To isolate switch clicks from the real DOM while supporting supervisor intervention:
- A transparent `div` (`#scan-overlay`) is created with `position: fixed`, `width: 100vw`, `height: 100vh`, and `z-index: 40`.
- **When Scanning Mode is OFF**: The discrete gear icon (Font Awesome `fa-gear` / `fa-solid fa-gear`) or floating toolbar becomes visible and clickable for returning to the Setup Screen **ONLY** when the user performs a long press (> 1 second) or presses keyboard shortcuts `Esc` or `Shift`.
- **When Scanning Mode is ON**: `#scan-overlay` covers the entire screen and intercepts all clicks. The discrete gear icon / floating toolbar becomes visible and clickable for returning to the Setup Screen **ONLY** when a supervisor moves the mouse or drags a finger on touch (detecting cursor X/Y coordinate changes via `mousemove` / `pointermove`), which temporarily bypasses `#scan-overlay` (`pointer-events: none`).

### 3.3 Multi-Level Scanning Mechanics
To minimize cognitive load and waiting times across complex user interfaces, scanning operates on a hierarchical multi-level structure:

1. **Level 1 — Group / Row Selection**:
   - The scanning engine cycles through high-level UI targets, groups, or rows (e.g., exercise targets, toolbar groups, text control blocks).
   - **First Click**: The student clicks the switch when their desired target group is highlighted. The engine locks focus into Level 2 for that group.
2. **Level 2 — Item / Button Selection**:
   - Focus narrows exclusively to sub-items, buttons, or dynamic input elements (e.g., numbers on a Numpad, word/syllable tiles, control sub-buttons) located in another part of the UI.
   - **Second Click**: The student clicks the switch when the specific sub-item is highlighted to execute the input or action.
3. **Loop & State Reset**:
   - Upon answer submission or task completion, the system automatically resets to Level 1 or Level 2 based on task logic (e.g., returning to unsolved exercise targets upon correct answer).
   - If sub-menus or keyboards are open, a virtual "Back" / "Cancel" option allows manual return to Level 1.

---

## 4. Scanning Modes & Educator Configuration

### 4.1 Teacher Control & Speed Customization
Scanning speed must be adjustable to accommodate varying motor response latencies and cognitive processing speeds.
- Configured via the initial **Setup Screen (Teacher Screen)**.
- **Configurable Speed Range**: **0.5 seconds to 7.0 seconds** (500ms – 7000ms), selectable by the educator.
- Stored in state as `state.scanSpeed` and persisted across sessions via URL hash parameters.

### 4.2 Single-Switch Auto-Scanning Workflow
- The scanning engine runs on a `setInterval` loop set to `state.scanSpeed`.
- Automatically shifts focus sequentially across scannable elements in the active array (`(currentIndex + 1) % array.length`).
- 1st Switch Click selects Level 1 group; 2nd Switch Click selects Level 2 item/button.

### 4.3 Educator Escape Mechanism (Teacher Escape)
To allow educators to return to settings without interference:
- **Gear Icon & Floating Toolbar Visibility Rules**:
  - **Scanning Mode OFF**: The discrete gear icon (Font Awesome `fa-gear` / `fa-solid fa-gear`) or floating toolbar becomes visible and clickable **ONLY** when the user executes a long press (> 1 second) or presses keyboard shortcuts `Esc` / `Shift`.
  - **Scanning Mode ON**: `#scan-overlay` covers the screen (intercepting switch clicks). The gear icon / toolbar becomes visible and clickable **ONLY** when a supervising adult moves the mouse / drags on touch (detecting cursor X/Y movement), temporarily bypassing `#scan-overlay` (`pointer-events: none`).
- **Keyboard Shortcuts**: Pressing `Esc` or `Shift` instantly reveals the escape controls and returns to the Setup Screen.
- **Touch / Mouse Long Press**: Holding down on any neutral screen area for > 1 second reveals the discrete gear icon / floating Teacher Escape Bar with a "Return to Setup" button.

---

## 5. Visual Focus Highlights & Accessibility Styling

### 5.1 Focus Border Specifications
When Scanning Mode is active, focused elements receive prominent visual highlighting to assist students with low vision or spatial attention difficulties:
- **Outline**: `4px solid #FFD700 !important` (High-Contrast Yellow) or `4px solid #0066FF !important` (High-Contrast Blue).
- **Glow & Pop-out**: `box-shadow: 0 0 20px rgba(255, 215, 0, 0.8) !important` and `transform: scale(1.05)` to `scale(1.08)`.
- **Z-Index**: `z-index: 50` with `position: relative` to ensure the highlighted element stands out above surrounding UI.

```css
.scan-focus {
    outline: 4px solid #FFD700 !important; /* High-contrast Yellow */
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8) !important;
    transform: scale(1.08);
    transition: transform 0.15s ease-in-out, outline-color 0.15s ease-in-out;
    z-index: 50;
    position: relative;
}
```

---

## 6. Audio Assistance (Web Speech API Integration)

To support non-readers, visually impaired students, or learners requiring auditory reinforcement:
- **Speech Synthesis**: Integrated via native browser `window.speechSynthesis` (Web Speech API).
- **Auditory Cue on Focus Change**: Every time the scanning engine advances focus to a new element or group, the system automatically speaks its text content, `aria-label`, or audio cue.
- **Language Alignment**: Speech synthesis uses the voice matching the application's active language (`state.currentLang`).
- **Performance**: Speech calls are non-blocking (`speechSynthesis.cancel()` is invoked prior to speaking new items to prevent speech queue overlap during rapid scanning).

---

## 7. Typography & Accessible Fonts

### 7.1 Font Options
Accessible fonts apply **ONLY when the initial Setup Screen includes an explicit Font Selector**:
- **Lexend**: Optimized for visual reading proficiency and text comprehension.
- **OpenDyslexic**: Specifically styled to mitigate dyslexia-related character rotation and inversion.
- **Verdana**: Default standard UI font when no font selector is provided or selected.

### 7.2 Conditional Application Rule
- Accessible font options (Lexend / OpenDyslexic) are **available ONLY if the application features a Font Selector on the Setup Screen**.
- If no Font Selector is present on the Setup Screen, the application uses standard UI typography (Verdana).

---

## 8. State Management & Data Architecture

The scanning state is managed inside `state.js` and encoded into shareable URL parameters:

```javascript
// state.js — Scanning & Accessibility Module State
export const state = {
    // Accessibility & Scanning
    scanOn: false,
    scanSpeed: 2000,            // ms (configurable from 500ms to 7000ms)
    scanLevel: 1,               // Level 1: Group/Row, Level 2: Item/Button
    scanCurrentIndex: -1,
    scanTimer: null,
    scannableElements: [],
    
    // Audio & Fonts
    ttsEnabled: true,           // Web Speech API auto-read on focus
    selectedFont: 'Lexend',     // 'Lexend' | 'OpenDyslexic' | 'Verdana'
};
```

---

## 9. Developer Verification Checklist

Before releasing or completing any Kidmedia application:
- [ ] **AI Prompt Check**: Did the AI ask the developer about specific scanning exceptions before building?
- [ ] **Interceptor Overlay & Supervisor Takeover**: When Scanning is OFF, does gear icon/toolbar appear ONLY on long press (>1s) or Esc/Shift? When Scanning is ON, is `#scan-overlay` active and does gear icon/toolbar appear ONLY upon adult mouse movement (X/Y change)?
- [ ] **Multi-Level Flow**: Does Level 1 select groups/rows and Level 2 select items/buttons?
- [ ] **Speed Control**: Is `scanSpeed` adjustable from 0.5s to 7.0s on Setup Screen?
- [ ] **Teacher Escape**: Do `Esc` / `Shift` keys and long-press reliably return to Setup Screen?
- [ ] **4px High-Contrast Focus**: Does `.scan-focus` apply 4px yellow/blue outline + scale transform?
- [ ] **Web Speech API**: Does focus movement trigger correct spoken audio cues in active language?
- [ ] **Accessible Fonts**: Are Lexend / OpenDyslexic available ONLY when a font selector is present on the Setup Screen?
