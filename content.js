// Auto-Approve Clicker - Content Script
// Runs on all pages, but only activates if current URL is in enabled list

let clickInterval = null;
let isEnabled = false;

/**
 * Finds and clicks the Approve button if present
 * Target: button with classes 'bg-inverse' and 'text-inverse' containing 'Approve' text
 */
function findAndClickApproveButton() {
  // Find all buttons with target classes
  const buttons = document.querySelectorAll('button.bg-inverse.text-inverse');
  
  for (const button of buttons) {
    // Check if button or its children contain "Approve" text (case-insensitive)
    // Use innerText instead of textContent for better text extraction
    const buttonText = button.innerText || button.textContent || '';
    const normalizedText = buttonText.trim().toLowerCase();
    
    if (normalizedText.includes('approve')) {
      // Button found - click it
      console.log('[Auto-Approve] Found button with text:', buttonText);
      button.click();
      console.log('[Auto-Approve] Clicked Approve button');
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
    return; // Already running
  }
  
  console.log('[Auto-Approve] Starting auto-click for:', window.location.href);
  
  // Check immediately on start
  findAndClickApproveButton();
  
  // Then check every 500ms (faster response)
  clickInterval = setInterval(() => {
    const clicked = findAndClickApproveButton();
    if (clicked) {
      console.log('[Auto-Approve] Button clicked at:', new Date().toISOString());
    }
  }, 500);
  
  isEnabled = true;
}

/**
 * Stops the auto-click interval
 */
function stopAutoClick() {
  if (clickInterval) {
    clearInterval(clickInterval);
    clickInterval = null;
    isEnabled = false;
    console.log('[Auto-Approve] Stopped auto-click');
  }
}

/**
 * Checks if current URL matches any enabled URL pattern
 */
function checkUrlEnabled() {
  const currentUrl = window.location.href;
  
  chrome.storage.sync.get(['enabledUrls'], (result) => {
    const enabledUrls = result.enabledUrls || [];
    
    // Check if current URL is in enabled list
    const shouldEnable = enabledUrls.some(url => currentUrl.includes(url));
    
    console.log('[Auto-Approve] URL check:', {
      currentUrl,
      enabledUrls,
      shouldEnable
    });
    
    if (shouldEnable && !isEnabled) {
      startAutoClick();
    } else if (!shouldEnable && isEnabled) {
      stopAutoClick();
    }
  });
}

// Initial check on page load
console.log('[Auto-Approve] Content script loaded');
setTimeout(() => {
  checkUrlEnabled();
}, 1000); // Wait 1 second for page to fully load

// Listen for URL changes (SPA navigation)
let lastUrl = window.location.href;
const urlObserver = new MutationObserver(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
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
    console.log('[Auto-Approve] Storage changed:', changes.enabledUrls);
    checkUrlEnabled();
  }
});

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Auto-Approve] Received message:', message);
  
  if (message.action === 'checkStatus') {
    sendResponse({ isEnabled: isEnabled });
  } else if (message.action === 'toggle') {
    if (isEnabled) {
      stopAutoClick();
    } else {
      startAutoClick();
    }
    sendResponse({ isEnabled: isEnabled });
  }
  return true;
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  stopAutoClick();
});
