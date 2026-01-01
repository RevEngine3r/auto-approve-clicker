# Step 3: Styling & Animation

## Goal
Make the log viewer visually appealing, non-intrusive, and readable using CSS injection.

## Tasks
1. **Define Styles**:
   - Modern dark mode theme by default (high contrast for logs)
   - Color coding for log levels (Green=Success, Yellow=Warn, Red=Error, Blue=Info)
   - Monospace font for log content

2. **Animations**:
   - Button hover effects (scale/shadow)
   - Panel slide-in/slide-out transition (transform: translateY)
   - Log entry fade-in on append

3. **Responsiveness**:
   - Ensure it works on smaller screens (max-width/height limits)
   - Z-index management (ensure it stays on top of page content)

## Technical Details
- Use `shadcn/ui` inspired aesthetics (clean borders, subtle shadows)
- Inject CSS via `const style = document.createElement('style')` inside `ui/viewer.js` to keep it self-contained without needing extra manifest permissions for css files if possible, or use `content_scripts.css`.

## Deliverables
- CSS definitions integrated into `ui/viewer.js` or `ui/styles.css`
