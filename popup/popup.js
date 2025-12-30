// Auto-Approve Clicker - Popup Script

const loading = document.getElementById('loading');
const main = document.getElementById('main');
const currentUrlDiv = document.getElementById('currentUrl');
const statusCard = document.getElementById('statusCard');
const statusIcon = document.getElementById('statusIcon');
const statusText = document.getElementById('statusText');
const statusDescription = document.getElementById('statusDescription');
const toggleBtn = document.getElementById('toggleBtn');
const settingsBtn = document.getElementById('settingsBtn');

let currentTabUrl = '';
let isEnabled = false;

/**
 * Get current tab URL
 */
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

/**
 * Update UI based on enabled status
 */
function updateUI(enabled) {
  isEnabled = enabled;
  
  if (enabled) {
    statusCard.className = 'status-card enabled';
    statusIcon.textContent = '✅';
    statusText.textContent = 'Enabled';
    statusDescription.textContent = 'Auto-clicking active on this page';
    toggleBtn.textContent = '🛑 Disable for This URL';
    toggleBtn.className = 'toggle-btn enabled';
  } else {
    statusCard.className = 'status-card disabled';
    statusIcon.textContent = '⭕';
    statusText.textContent = 'Disabled';
    statusDescription.textContent = 'Not active on this page';
    toggleBtn.textContent = '▶️ Enable for This URL';
    toggleBtn.className = 'toggle-btn';
  }
}

/**
 * Check if current URL is enabled
 */
function checkUrlStatus() {
  chrome.runtime.sendMessage(
    { action: 'isUrlEnabled', url: currentTabUrl },
    (response) => {
      if (response) {
        updateUI(response.isEnabled);
      }
    }
  );
}

/**
 * Toggle URL enabled status
 */
function toggleUrl() {
  toggleBtn.disabled = true;
  toggleBtn.style.opacity = '0.6';
  
  if (isEnabled) {
    // Disable: remove URL from list
    chrome.runtime.sendMessage(
      { action: 'removeUrl', url: currentTabUrl },
      (response) => {
        if (response && response.success) {
          updateUI(false);
        }
        toggleBtn.disabled = false;
        toggleBtn.style.opacity = '1';
      }
    );
  } else {
    // Enable: add URL to list
    chrome.runtime.sendMessage(
      { action: 'addUrl', url: currentTabUrl },
      (response) => {
        if (response && response.success) {
          updateUI(true);
        }
        toggleBtn.disabled = false;
        toggleBtn.style.opacity = '1';
      }
    );
  }
}

/**
 * Open settings page
 */
function openSettings() {
  chrome.runtime.openOptionsPage();
}

/**
 * Simplify URL for display (remove protocol, trailing slash)
 */
function simplifyUrl(url) {
  try {
    const urlObj = new URL(url);
    let simplified = urlObj.hostname + urlObj.pathname;
    if (simplified.endsWith('/')) {
      simplified = simplified.slice(0, -1);
    }
    if (urlObj.search) {
      simplified += urlObj.search;
    }
    return simplified || url;
  } catch (e) {
    return url;
  }
}

/**
 * Initialize popup
 */
async function init() {
  try {
    const tab = await getCurrentTab();
    
    if (!tab || !tab.url) {
      throw new Error('Cannot access current tab');
    }
    
    currentTabUrl = tab.url;
    
    // Display simplified URL
    currentUrlDiv.textContent = simplifyUrl(currentTabUrl);
    
    // Check status
    checkUrlStatus();
    
    // Show main UI
    loading.style.display = 'none';
    main.style.display = 'block';
    
  } catch (error) {
    console.error('Popup initialization error:', error);
    loading.innerHTML = `
      <div style="color: #f5576c; padding: 20px; text-align: center;">
        <p style="font-size: 32px; margin-bottom: 10px;">⚠️</p>
        <p style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">Cannot Access Page</p>
        <p style="font-size: 12px; color: #666;">Extension cannot run on this page (chrome://, extension pages, etc.)</p>
      </div>
    `;
  }
}

// Event listeners
toggleBtn.addEventListener('click', toggleUrl);
settingsBtn.addEventListener('click', openSettings);

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.enabledUrls && currentTabUrl) {
    checkUrlStatus();
  }
});

// Initialize
init();
