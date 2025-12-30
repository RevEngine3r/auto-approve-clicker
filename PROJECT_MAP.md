# Auto-Approve Clicker - Project Map

## Purpose
Chrome extension that automatically clicks "Approve" buttons every 1 second on manually enabled URLs.

## Tech Stack
- **Extension Standard**: Manifest V3
- **Language**: Vanilla JavaScript
- **UI**: HTML5, CSS3
- **APIs**: Chrome Storage API, Chrome Scripting API, Chrome Tabs API

## Project Structure

```
auto-approve-clicker/
├── manifest.json              # Extension configuration (Manifest V3)
├── background.js              # Service worker for URL permission management
├── content.js                 # Script that finds and clicks Approve button
├── options/
│   ├── options.html          # Settings page for managing enabled URLs
│   └── options.js            # Logic for settings page
├── popup/
│   ├── popup.html            # Quick toggle UI for current tab
│   └── popup.js              # Popup logic
├── icons/
│   ├── icon16.png            # 16x16 icon
│   ├── icon48.png            # 48x48 icon
│   └── icon128.png           # 128x128 icon
├── PROJECT_MAP.md            # This file
├── PROGRESS.md               # Task tracking and session continuity
└── README.md                 # User documentation
```

## Key Files
- **manifest.json**: Defines extension permissions, content scripts, background service worker
- **content.js**: Searches for button with class="bg-inverse text-inverse" containing "Approve" text, clicks every 1s
- **background.js**: Manages enabled URLs list in chrome.storage.sync
- **options.html/js**: Interface to add/remove URLs from enabled list
- **popup.html/js**: Quick enable/disable for current tab URL

## Target Button Selector
```html
<button type="button" class="bg-inverse text-inverse hover:opacity-80 ... "><div class="flex items-center min-w-0 gap-two justify-center"><div class="relative truncate text-center px-1 leading-loose -mb-px">Approve</div></div></button>
```

**Selector Strategy**: `button.bg-inverse.text-inverse` containing text "Approve"
