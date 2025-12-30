// Auto-Approve Clicker - Content Script
// Runs on all pages, but only activates if current URL is in enabled list

let clickInterval = null;
let isEnabled = false;
let checkCount = 0; // Track number of checks performed

/**
 * Finds and clicks the Approve button if present
 * Target: button with classes 'bg-inverse' and 'text-inverse' containing 'Approve' text
 */
function findAndClickApproveButton() {
  checkCount++;
  
  // Find all buttons with target classes
  const buttons = document.querySelectorAll('button.bg-inverse.text-inverse');
  
  // Log every 10 checks to show it's working without spamming console
  if (checkCount % 10 === 0) {
    console.log(`[Auto-Approve] 🔍 Checking for buttons... (Check #${checkCount})`);
  }
  
  for (const button of buttons) {
    // Check if button or its children contain "Approve" text (case-insensitive)
    // Use innerText instead of textContent for better text extraction
    const buttonText = button.innerText || button.textContent || '';
    const normalizedText = buttonText.trim().toLowerCase();
    
    if (normalizedText.includes('approve')) {
      // Button found - click it
      console.log('[Auto-Approve] ✅ Found button with text:', buttonText);
      button.click();
      console.log('[Auto-Approve] 👆 Clicked Approve button at:', new Date().toLocaleTimeString());
      return true;
    }
  }
  
  return false;
}

/**
 * Starts the auto-click interval (500ms for faster detection)
 */
function startAutoClick() {
  if (clickInterval) {
    console.log('[Auto-Approve] ⚠️ Already running, skipping start');
    return; // Already running
  }
  
  console.log('%c[Auto-Approve] ▶️ ENABLED - Starting auto-click', 'color: #00ff00; font-weight: bold; font-size: 14px');
  console.log('[Auto-Approve] 🎯 Target URL:', window.location.href);
  console.log('[Auto-Approve] ⏱️ Checking every 500ms (0.5 seconds)');
  
  checkCount = 0; // Reset counter
  
  // Check immediately on start
  console.log('[Auto-Approve] 🔍 Performing initial check...');
  const foundInitially = findAndClickApproveButton();
  if (!foundInitially) {
    console.log('[Auto-Approve] 🔍 No Approve button found on initial check, will keep checking...');
  }
  
  // Then check every 500ms (faster response)
  clickInterval = setInterval(() => {
    findAndClickApproveButton();
  }, 500);
  
  isEnabled = true;
  console.log('[Auto-Approve] ✅ Interval started successfully');
}

/**
 * Stops the auto-click interval
 */
function stopAutoClick() {
  if (clickInterval) {
    clearInterval(clickInterval);
    clickInterval = null;
    isEnabled = false;
    console.log('%c[Auto-Approve] ⏹️ DISABLED - Stopped auto-click', 'color: #ff0000; font-weight: bold; font-size: 14px');
    console.log(`[Auto-Approve] 📊 Total checks performed: ${checkCount}`);
  } else {
    console.log('[Auto-Approve] 🚫 Not running, nothing to stop');
  }
}

/**
 * Checks if current URL matches any enabled URL pattern
 */
function checkUrlEnabled() {
  const currentUrl = window.location.href;
  
  console.log('[Auto-Approve] 🔍 Checking if URL is enabled...');
  
  chrome.storage.sync.get(['enabledUrls'], (result) => {
    const enabledUrls = result.enabledUrls || [];
    
    // Check if current URL is in enabled list
    const shouldEnable = enabledUrls.some(url => currentUrl.includes(url));
    
    console.log('[Auto-Approve] 📋 URL Check Results:', {
      currentUrl: currentUrl,
      enabledUrls: enabledUrls,
      shouldEnable: shouldEnable ? '✅ YES' : '❌ NO',
      currentStatus: isEnabled ? 'Running' : 'Stopped'
    });
    
    if (shouldEnable && !isEnabled) {
      console.log('[Auto-Approve] ✅ URL is enabled, starting auto-click...');
      startAutoClick();
    } else if (!shouldEnable && isEnabled) {
      console.log('[Auto-Approve] ❌ URL not enabled, stopping auto-click...');
      stopAutoClick();
    } else if (shouldEnable && isEnabled) {
      console.log('[Auto-Approve] ✅ Already running for this URL');
    } else {
      console.log('[Auto-Approve] ⏸️ Extension inactive for this URL');
    }
  });
}

// Initial check on page load
console.log('%c[Auto-Approve] 🚀 Content script loaded', 'color: #00aaff; font-weight: bold; font-size: 14px');
console.log('[Auto-Approve] 🌍 Page:', window.location.href);
console.log('[Auto-Approve] ⏳ Waiting 1 second for page to fully load...');

setTimeout(() => {
  console.log('[Auto-Approve] ✅ Page loaded, checking URL status...');
  checkUrlEnabled();
}, 1000); // Wait 1 second for page to fully load

// Listen for URL changes (SPA navigation)
let lastUrl = window.location.href;
const urlObserver = new MutationObserver(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    console.log('[Auto-Approve] 🔄 URL changed detected');
    console.log('[Auto-Approve] Old URL:', lastUrl);
    console.log('[Auto-Approve] New URL:', currentUrl);
    lastUrl = currentUrl;
    stopAutoClick();
    checkUrlEnabled();
  }
});

// Observe URL changes via DOM changes
urlObserver.observe(document.body, {
  childList: true,
  subtree: true
});

// Listen for storage changes (when user enables/disables URLs)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.enabledUrls) {
    console.log('[Auto-Approve] 📦 Storage changed - enabled URLs updated');
    console.log('[Auto-Approve] Old value:', changes.enabledUrls.oldValue);
    console.log('[Auto-Approve] New value:', changes.enabledUrls.newValue);
    checkUrlEnabled();
  }
});

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Auto-Approve] 📨 Received message:', message);
  
  if (message.action === 'checkStatus') {
    console.log('[Auto-Approve] 📊 Status check requested, current status:', isEnabled ? 'Enabled' : 'Disabled');
    sendResponse({ isEnabled: isEnabled });
  } else if (message.action === 'toggle') {
    console.log('[Auto-Approve] 🔄 Toggle requested');
    if (isEnabled) {
      console.log('[Auto-Approve] Currently enabled, stopping...');
      stopAutoClick();
    } else {
      console.log('[Auto-Approve] Currently disabled, starting...');
      startAutoClick();
    }
    sendResponse({ isEnabled: isEnabled });
  }
  return true;
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  console.log('[Auto-Approve] 👋 Page unloading, cleaning up...');
  stopAutoClick();
});

console.log('[Auto-Approve] ✅ All event listeners registered');
