# Step 2: UI Components

## Goal
Build the visual components (floating button and log panel) and inject them into the DOM.

## Tasks
1. **Create HTML/CSS Structure**:
   - Define structure in JS (template literals) or `createElement` calls
   - Add scoped CSS classes (e.g., `aac-log-viewer`) to prevent conflicts
   
2. **Implement `ui/viewer.js`**:
   - Class `LogViewer` that manages the DOM elements
   - `init()`: Injects HTML into `document.body`
   - `renderLog(log)`: Appends a single log entry to the list
   - `toggle()`: helper to show/hide the panel

3. **Update `manifest.json`**:
   - Inject `ui/viewer.js` after `utils/logger.js` and before `content.js` (or trigger it from content.js)

## UI Mockup
- **Floating Button**: Bottom right fixed position. Icon changes (Bug/List icon).
- **Panel**: Slide-up or fade-in from bottom right.
  - Header: Title + Close Button + Clear Button.
  - Body: Scrollable list of logs.
  - Footer: "Auto-scroll" toggle.

## Deliverables
- `ui/viewer.js`
- Basic styling (in JS or separate CSS file if configured)
