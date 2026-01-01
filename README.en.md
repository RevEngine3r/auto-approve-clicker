# ⚡ Auto-Approve Clicker

> A Chrome/Firefox extension that automatically clicks "Approve" buttons on user-specified URLs every 1 second. **Specifically designed to automate annoying Approve requests in Perplexity's GitHub tool integration.**

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 💡 Primary Use Case

**Perplexity GitHub Tool Automation**  
This extension was created to solve a specific problem: When using Perplexity AI's GitHub tool integration, every action requires manual approval clicks. This extension automates those repetitive approvals, making your workflow seamless and efficient.

Perfect for:
- 🤖 Automating Perplexity's GitHub tool approval prompts
- ⚡ Streamlining repetitive approval workflows
- 🎯 Any website with recurring "Approve" button clicks

## 🌟 Features

- **Automatic Clicking**: Finds and clicks "Approve" buttons every 1 second on enabled URLs
- **Per-URL Control**: Manually enable/disable extension for each URL individually
- **Smart Detection**: Targets buttons with specific classes and "Approve" text (case-insensitive)
- **Modern UI**: Beautiful gradient design with intuitive settings page
- **Quick Toggle**: Popup interface for fast enable/disable on current tab
- **SPA Support**: Detects URL changes in single-page applications
- **Real-time Sync**: Changes sync instantly across all tabs and windows
- **No Background Drain**: Only runs on enabled URLs, minimal resource usage

## 🎯 Target Button

The extension looks for buttons with this structure (like Perplexity's approval buttons):

```html
<button class="bg-inverse text-inverse ...">
  <!-- ... -->
  <div>Approve</div>
  <!-- ... -->
</button>
```

**Selection Criteria**:
- Button element with classes `bg-inverse` AND `text-inverse`
- Contains text "Approve" (case-insensitive)
- Clicks once found, every 1 second

## 📦 Installation

### Install from Source (Developer Mode)

1. **Download the Extension**
   ```bash
   git clone https://github.com/RevEngine3r/auto-approve-clicker.git
   cd auto-approve-clicker
   ```

2. **Open Extensions Page**
   - **Chrome**: Navigate to `chrome://extensions/` or Menu → Extensions → Manage Extensions
   - **Firefox**: Navigate to `about:addons` or Menu → Add-ons and themes

3. **Enable Developer Mode**
   - **Chrome**: Toggle "Developer mode" switch in top-right corner
   - **Firefox**: Click gear icon → "Debug Add-ons" → "Load Temporary Add-on"

4. **Load the Extension**
   - **Chrome**: Click "Load unpacked" → Select the `auto-approve-clicker` folder
   - **Firefox**: Click "Load Temporary Add-on" → Select `manifest.json` file
   - Extension icon (⚡) should appear in toolbar

## 🚀 Usage

### Quick Start (Perplexity GitHub Tool)

1. **Navigate to Perplexity**
   - Go to perplexity.ai and start a conversation
   - Use any GitHub-related commands that trigger approval prompts

2. **Enable Auto-Clicking**
   - Click the extension icon (⚡) in toolbar
   - Click "▶️ Enable for This URL"
   - Status will show "✅ Enabled"

3. **Enjoy Automation**
   - All Perplexity GitHub approval prompts will be automatically approved
   - No more repetitive clicking required
   - Console logs clicks for debugging

### General Usage

1. **Navigate to Target Page**
   - Go to any webpage where you want auto-clicking enabled

2. **Enable Auto-Clicking**
   - Click the extension icon (⚡) in toolbar
   - Click "▶️ Enable for This URL"
   - Status will show "✅ Enabled"

3. **Extension is Active**
   - Every 1 second, the extension searches for Approve buttons
   - Automatically clicks when found
   - Console logs clicks for debugging

### Settings Page

Access full settings via:
- Right-click extension icon → "Options"
- Or click "⚙️ Manage All URLs" in popup

**Settings Features**:
- **Add URLs**: Enter full or partial URLs (e.g., `perplexity.ai`, `example.com`)
- **Remove URLs**: Click "Remove" next to any URL
- **Clear All**: Remove all enabled URLs at once
- **URL Counter**: See how many URLs are enabled

### URL Matching

**Flexible Matching** - URLs use substring matching:
- Enable `perplexity.ai` → Works on:
  - `https://perplexity.ai`
  - `https://www.perplexity.ai/search`
  - Any Perplexity page or subdomain

**Best Practices**:
- Use domain name only for entire site: `perplexity.ai`
- Use full path for specific pages: `example.com/specific-page`
- Add protocol to be more specific: `https://example.com`

## 🛠️ Technical Details

### Architecture

- **Manifest V3**: Latest Chrome/Firefox extension standard
- **Content Script** (`content.js`): Runs on all pages, activates when URL matches
- **Background Worker** (`background.js`): Manages storage and coordinates components
- **Options Page** (`options/`): Full URL management interface
- **Popup** (`popup/`): Quick toggle for current tab
- **Storage**: Chrome/Browser Sync Storage (cross-device sync)

### File Structure

```
auto-approve-clicker/
├── manifest.json          # Extension configuration
├── background.js          # Service worker
├── content.js             # Auto-click logic
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── options/               # Settings page
│   ├── options.html
│   └── options.js
├── popup/                 # Quick toggle popup
│   ├── popup.html
│   └── popup.js
├── build-release.ps1      # Automated build script
├── .buildignore           # Build exclusion config
├── releases/              # Generated packages
├── PROJECT_MAP.md         # Project structure docs
├── PROGRESS.md            # Development progress
├── README.md              # Persian documentation
└── README.en.md           # This file (English)
```

### Button Detection Algorithm

1. Query all buttons: `button.bg-inverse.text-inverse`
2. Filter by text content: contains "approve" (case-insensitive)
3. Click first matching button
4. Repeat every 1000ms (1 second)

### Permissions

- `storage`: Save enabled URLs list
- `activeTab`: Access current tab in popup
- `scripting`: Inject content script dynamically
- `host_permissions: <all_urls>`: Run on any website

## 🧪 Testing Checklist

- [ ] Extension loads without errors
- [ ] Popup opens and shows current URL
- [ ] Can enable URL from popup
- [ ] Can disable URL from popup
- [ ] Options page opens correctly
- [ ] Can add URLs in options page
- [ ] Can remove individual URLs
- [ ] Can clear all URLs with confirmation
- [ ] Content script activates on enabled URLs
- [ ] Button is detected and clicked (test with Perplexity GitHub approvals)
- [ ] Auto-click stops when URL disabled
- [ ] Works on SPA navigation (URL changes without reload)
- [ ] Changes sync across multiple tabs
- [ ] No errors in console

## 🐛 Troubleshooting

### Extension Not Working

**Problem**: No buttons are being clicked

**Solutions**:
1. Check if URL is enabled (popup should show "✅ Enabled")
2. Open DevTools Console (F12) - look for `[Auto-Approve]` logs
3. Verify button exists with correct classes: `bg-inverse text-inverse`
4. Check button contains "Approve" text
5. Try refreshing the page after enabling

### Button Not Detected

**Problem**: Logs show no button found

**Solutions**:
1. Inspect the button element (right-click → Inspect)
2. Verify classes are exactly `bg-inverse` and `text-inverse`
3. Check if button text contains "Approve"
4. Button might load dynamically - extension checks every second

### URL Not Enabling

**Problem**: Clicking "Enable" doesn't work

**Solutions**:
1. Check browser console for errors
2. Try adding URL from settings page instead
3. Verify you're not on restricted page (chrome://, about:, etc.)
4. Check extension has proper permissions

### Sync Issues

**Problem**: Changes don't appear in other tabs

**Solutions**:
1. Reload all tabs with the URL
2. Check Browser Sync is enabled in browser settings
3. Wait a few seconds for sync to propagate

## ⚙️ Customization

### Change Target Button

To target a different button, modify `content.js`:

```javascript
// Line 13-14: Change selector
const buttons = document.querySelectorAll('button.your-class-here');

// Line 17-18: Change text matching
if (buttonText.toLowerCase().includes('your-text-here')) {
```

### Change Click Interval

To adjust click frequency, modify `content.js`:

```javascript
// Line 42: Change interval (milliseconds)
clickInterval = setInterval(() => {
  findAndClickApproveButton();
}, 1000); // Change 1000 to your desired interval
```

## 🏗️ Building for Release

### Prerequisites

- **PowerShell 7+** required ([Download](https://github.com/PowerShell/PowerShell/releases))
- Works on Windows, macOS, Linux

### Quick Build

Create a production-ready release package:

```powershell
./build-release.ps1
```

**What This Does**:
1. ✅ Generates datetime-based version (e.g., `2025.12.30.1852`)
2. ✅ Updates `manifest.json` with new version
3. ✅ Creates ZIP package excluding dev files
4. ✅ Saves to `releases/auto-approve-clicker-{version}.zip`
5. ✅ Ready for Chrome Web Store / Firefox Add-ons submission

### Version Format

**Automatic Versioning** (default):
- Format: `YYYY.MM.DD.HHmm`
- Example: `2025.12.30.1852` = December 30, 2025 at 6:52 PM
- Each build gets unique version automatically
- Compatible with Chrome/Firefox extension requirements

**Custom Version** (optional):
```powershell
./build-release.ps1 -CustomVersion "2.0.1.0"
```
- Must be 1-4 dot-separated integers (0-65535)
- Example: `1.0.0`, `2.5.1.0`

### Advanced Options

**Verbose Output** (for debugging):
```powershell
./build-release.ps1 -VerboseOutput
```
Shows detailed file inclusion/exclusion information.

### Customizing Build Exclusions

Edit `.buildignore` to exclude additional files from builds:

```bash
# .buildignore example
test/
*.log
temp*.txt
notes.md
```

**Default Exclusions** (always excluded):
- `.git/`, `.github/` - Git metadata
- `ROAD_MAP/` - Development roadmap  
- `releases/` - Previous builds
- `PROGRESS.md`, `PROJECT_MAP.md` - Dev docs
- `.gitignore`, `.buildignore` - Config files
- `*.ps1` - Build scripts

### Build Output

Successful build creates:
```
releases/
└── auto-approve-clicker-2025.12.30.1852.zip
```

**Package Contents**:
- `manifest.json` (with updated version)
- `background.js`, `content.js`
- `popup/`, `options/`, `icons/`
- `README.md` (Persian), `README.en.md` (English)
- All other extension files

### After Building

1. **Test the Build**:
   - Extract ZIP to temporary folder
   - Load in Chrome/Firefox as unpacked extension
   - Verify all functionality works

2. **Commit Version Update**:
   ```bash
   git add manifest.json
   git commit -m "chore: Bump version to {version}"
   git push
   ```

3. **Optional - Chrome Web Store**:
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Upload the ZIP file
   - Fill in store listing details
   - Submit for review

4. **Optional - Firefox Add-ons**:
   - Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
   - Upload the ZIP file
   - Fill in listing details
   - Submit for review

5. **Optional - GitHub Release**:
   ```bash
   git tag v{version}
   git push --tags
   ```
   - Create release on GitHub
   - Attach ZIP file as asset

### Troubleshooting Builds

**Build Script Not Found**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**PowerShell Version Too Old**:
- Download PowerShell 7+ from [official releases](https://github.com/PowerShell/PowerShell/releases)
- Or use `pwsh` command if already installed

**Permission Errors**:
- Run PowerShell as Administrator
- Or change execution policy (see above)

**Manifest JSON Invalid**:
- Validate JSON syntax in `manifest.json`
- Script creates backup before modifying
- Backup restored automatically on error

### Manual Build (Alternative)

If PowerShell unavailable, create ZIP manually:

1. **Update Version**: Edit `manifest.json` → change `"version"` field
2. **Create ZIP**: Select all extension files (exclude dev files)
3. **Name ZIP**: `auto-approve-clicker-{version}.zip`
4. **Exclude**: `.git`, `ROAD_MAP`, `*.ps1`, dev docs, etc.

## 📝 Development

### Local Development

1. Make changes to source files
2. Reload extension:
   - **Chrome**: Go to `chrome://extensions/` → Click refresh icon
   - **Firefox**: Go to `about:debugging` → Click "Reload"
3. Test changes immediately

### Debugging

- **Content Script**: Open page DevTools (F12) → Console
- **Background Worker**: 
  - **Chrome**: Go to `chrome://extensions/` → Click "service worker"
  - **Firefox**: Go to `about:debugging` → "Inspect"
- **Popup**: Right-click extension icon → "Inspect popup"
- **Options Page**: Right-click page → "Inspect"

### Project Documentation

- `PROJECT_MAP.md`: Complete project structure and design
- `PROGRESS.md`: Development progress and decisions
- `README.md`: Persian user documentation
- `README.en.md`: English user documentation (this file)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both Chrome and Firefox
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

**RevEngine3r**
- GitHub: [@RevEngine3r](https://github.com/RevEngine3r)
- Website: [RevEngine3r.ir](https://wWw.RevEngine3r.iR)

## ⚠️ Disclaimer

This extension is for educational and automation purposes. Use responsibly and ensure you have permission to automate interactions on websites you visit. The author is not responsible for any misuse.

## 🙏 Acknowledgments

- Chrome Extensions Documentation
- Firefox WebExtensions Documentation
- Manifest V3 Migration Guide
- Perplexity AI for inspiring this automation solution
- Community feedback and contributions

---

**Made with ⚡ by RevEngine3r | Automate Your Perplexity GitHub Workflow**

---

📖 **[نسخه فارسی (Persian Version)](README.md)**