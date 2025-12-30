# Auto-Approve Clicker - Project Map

## Purpose
Chrome extension that automatically clicks "Approve" buttons every 1 second on manually enabled URLs.

## Tech Stack
- **Extension Standard**: Manifest V3
- **Language**: Vanilla JavaScript
- **UI**: HTML5, CSS3
- **APIs**: Chrome Storage API, Chrome Scripting API, Chrome Tabs API
- **Build System**: PowerShell 7

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
├── build-release.ps1          # Automated release build script
├── .buildignore               # Build exclusion patterns
├── releases/                  # Generated release packages (auto-created)
│   └── auto-approve-clicker-YYYY.MM.DD.HHmm.zip
├── PROJECT_MAP.md            # This file
├── PROGRESS.md               # Task tracking and session continuity
└── README.md                 # User documentation
```

## Key Files

### Extension Core
- **manifest.json**: Defines extension permissions, content scripts, background service worker
- **content.js**: Searches for button with class="bg-inverse text-inverse" containing "Approve" text, clicks every 1s
- **background.js**: Manages enabled URLs list in chrome.storage.sync
- **options.html/js**: Interface to add/remove URLs from enabled list
- **popup.html/js**: Quick enable/disable for current tab URL

### Build System
- **build-release.ps1**: PowerShell 7 script for automated release building
  - Auto-generates datetime-based version (YYYY.MM.DD.HHmm)
  - Updates manifest.json version automatically
  - Creates ZIP package excluding dev files
  - Outputs to releases/ directory
- **.buildignore**: User-customizable exclusion patterns for builds
  - Supports wildcards (*)
  - Comment support (#)
  - Extends default exclusions

## Build System

### Version Strategy
**Datetime-Based Auto-Versioning**
- Format: `YYYY.MM.DD.HHmm`
- Example: `2025.12.30.1852` (December 30, 2025 at 6:52 PM)
- Compatible with Chrome extension version requirements (1-4 dot-separated integers)
- Ensures unique versions for each build
- Optional custom version override via `-CustomVersion` parameter

### Build Process
1. **Validate**: Check environment and manifest.json
2. **Version**: Generate datetime version or use custom
3. **Backup**: Create manifest.json backup
4. **Update**: Set new version in manifest.json
5. **Package**: Create ZIP excluding dev files
6. **Output**: Save to `releases/auto-approve-clicker-{version}.zip`
7. **Cleanup**: Remove backup on success

### Default Build Exclusions
These files/folders are always excluded from release packages:
- `.git/`, `.github/` - Git metadata
- `ROAD_MAP/` - Development roadmap
- `releases/` - Previous builds
- `PROGRESS.md`, `PROJECT_MAP.md` - Development docs
- `.gitignore`, `.buildignore` - Config files
- `*.ps1` - Build scripts

### Custom Exclusions
Add patterns to `.buildignore` for additional exclusions:
```
# Example .buildignore
test/
*.log
temp*.txt
notes.md
```

### Usage
```powershell
# Auto datetime version
./build-release.ps1

# Custom version
./build-release.ps1 -CustomVersion "2.0.0.0"

# Verbose output
./build-release.ps1 -VerboseOutput
```

## Target Button Selector
```html
<button type="button" class="bg-inverse text-inverse hover:opacity-80 ... ">
  <div class="flex items-center min-w-0 gap-two justify-center">
    <div class="relative truncate text-center px-1 leading-loose -mb-px">Approve</div>
  </div>
</button>
```

**Selector Strategy**: `button.bg-inverse.text-inverse` containing text "Approve"

## Development Workflow

### Standard Development
1. Make code changes
2. Test extension in Chrome Developer Mode
3. Commit changes to Git

### Creating Release
1. Run `./build-release.ps1`
2. Script updates manifest.json version
3. ZIP package created in `releases/`
4. Commit updated manifest.json
5. Optional: Create GitHub release
6. Optional: Submit to Chrome Web Store

## Requirements
- **Runtime**: Chrome/Chromium browser with Manifest V3 support
- **Development**: Any text editor
- **Build**: PowerShell 7+ (for release builds)
