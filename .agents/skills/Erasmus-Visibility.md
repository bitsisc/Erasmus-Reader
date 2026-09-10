# Skill: Erasmus+ Visibility, Multi-Language Disclaimer & Print Branding

## Objective
Automatically apply the required Erasmus+ co-funding visibility graphics and official disclaimer text, dynamically adapting to the selected language out of the 24 official EU languages. Additionally, enforce a distinct, three-column footer layout exclusively for print outputs that incorporates the partner logos (Kidmedia and Sesat).

## Language Synchronization
*   **Dynamic Localization:** The system must actively detect the currently selected UI language of the application (covering all 24 official EU languages).
*   **Asset Routing:** Based on the active language code, the system must fetch the correspondingly localized assets:
    *   The correctly localized EU flag image from the `all-co-funded/` directory.
    *   The correctly localized disclaimer text from the `disclaimer-text.odt` file.

## Implementation Rules

### 1. Application UI (Initial Configuration Screen ONLY)
Whenever the teacher/parent parameterization screen is rendered, a persistent footer area must be injected at the bottom of the viewport adhering to these layout rules:
*   **Bottom-Left Alignment:** Render the dynamically localized EU co-funding image.
*   **Bottom-Right Alignment:** Render the dynamically localized disclaimer text, strictly right-aligned.
*   **UI Constraints:** Ensure this footer is responsive and does not overlap or obstruct any interactive form elements or game settings.

### 2. Print Layout Configuration (Print Media ONLY)
For all print functionalities or document generation processes, a standardized, 3-part layout must be injected into the bottom margin of **every printed page**. Implement the following via `@media print` CSS rules or the respective document generation logic:
*   **Left Section:** Render the localized EU co-funding image.
*   **Center Section:** Render the localized official disclaimer text.
*   **Right Section:** Render the Kidmedia and Sesat corporate logos.
*   **Print Constraints:** This three-part footer must be anchored to the bottom of the printed page (`@page` bottom margin) and must not overlap with the main printable content of the learning activity.