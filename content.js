// Auto-Approve Clicker - Content Script
// Runs on all pages, but only activates if current URL is in enabled list

let clickInterval = null;
let isEnabled = false;
let checkCount = 0; // Track number of checks performed

// Use the injected Logger class or fallback to console if something went wrong
const Log = window.AutoApproveLogger || {
  log: console.log,
  success: console.log,
  info: console.log,
  warn: console.warn,
  error: console.error
};

/**
 * Notify viewer about extension state
 */
function notifyViewerState(enabled) {
  const eventName = enabled ? 'aac-extension-enabled' : 'aac-extension-disabled';
  window.dispatchEvent(new CustomEvent(eventName));
  Log.info(`📢 Dispatched ${eventName} event`);
}

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
    Log.info(`🔍 Checking for buttons... (Check #${checkCount})`);
  }
  
  for (const button of buttons) {
    // Check if button or its children contain "Approve" text (case-insensitive)
    // Use innerText instead of textContent for better text extraction
    const buttonText = button.innerText || button.textContent || '';
    const normalizedText = buttonText.trim().toLowerCase();
    
    if (normalizedText.includes('approve')) {
      // Button found - click it
      Log.success('✅ Found button with text:', buttonText);
      button.click();
      Log.success('👆 Clicked Approve button');
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
    Log.warn('⚠️ Already running, skipping start');
    return; // Already running
  }
  
  Log.success('▶️ ENABLED - Starting auto-click');
  Log.info('🎯 Target URL:', window.location.href);
  Log.info('⏱️ Checking every 500ms (0.5 seconds)');
  
  checkCount = 0; // Reset counter
  
  // Check immediately on start
  Log.info('🔍 Performing initial check...');
  const foundInitially = findAndClickApproveButton();
  if (!foundInitially) {
    Log.info('🔍 No Approve button found on initial check, will keep checking...');
  }
  
  // Then check every 500ms (faster response)
  clickInterval = setInterval(() => {
    findAndClickApproveButton();
  }, 500);
  
  isEnabled = true;
  notifyViewerState(true);
  Log.success('✅ Interval started successfully');
}

/**
 * Stops the auto-click interval
 */
function stopAutoClick() {
  if (clickInterval) {
    clearInterval(clickInterval);
    clickInterval = null;
    isEnabled = false;
    notifyViewerState(false);
    Log.warn('⏹️ DISABLED - Stopped auto-click');
    Log.info(`📊 Total checks performed: ${checkCount}`);
  } else {
    Log.info('🚫 Not running, nothing to stop');
    notifyViewerState(false);
  }
}

/**
 * Checks if current URL matches any enabled URL pattern
 */
function checkUrlEnabled() {
  const currentUrl = window.location.href;
  
  Log.info('🔍 Checking if URL is enabled...');
  
  chrome.storage.sync.get(['enabledUrls'], (result) => {
    const enabledUrls = result.enabledUrls || [];
    
    // Check if current URL is in enabled list
    const shouldEnable = enabledUrls.some(url => currentUrl.includes(url));
    
    Log.info('📋 URL Check Results:', {
      currentUrl: currentUrl,
      shouldEnable: shouldEnable ? '✅ YES' : '❌ NO',
      currentStatus: isEnabled ? 'Running' : 'Stopped'
    });
    
    if (shouldEnable && !isEnabled) {
      Log.success('✅ URL is enabled, starting auto-click...');
      startAutoClick();
    } else if (!shouldEnable && isEnabled) {
      Log.warn('❌ URL not enabled, stopping auto-click...');
      stopAutoClick();
    } else if (shouldEnable && isEnabled) {
      Log.info('✅ Already running for this URL');
    } else {
      Log.info('⏸️ Extension inactive for this URL');
      notifyViewerState(false);
    }
  });
}

// Initial check on page load
Log.success('🚀 Content script loaded');
Log.info('🌍 Page:', window.location.href);
Log.info('⏳ Waiting 1 second for page to fully load...');

setTimeout(() => {
  Log.info('✅ Page loaded, checking URL status...');
  checkUrlEnabled();
}, 1000); // Wait 1 second for page to fully load

// Listen for URL changes (SPA navigation)
let lastUrl = window.location.href;
const urlObserver = new MutationObserver(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    Log.info('🔄 URL changed detected');
    Log.info('Old URL:', lastUrl);
    Log.info('New URL:', currentUrl);
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
    Log.info('📦 Storage changed - enabled URLs updated');
    checkUrlEnabled();
  }
});

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  Log.info('📨 Received message:', message);
  
  if (message.action === 'checkStatus') {
    Log.info('📊 Status check requested, current status:', isEnabled ? 'Enabled' : 'Disabled');
    sendResponse({ isEnabled: isEnabled });
  } else if (message.action === 'toggle') {
    Log.info('🔄 Toggle requested');
    if (isEnabled) {
      Log.info('Currently enabled, stopping...');
      stopAutoClick();
    } else {
      Log.info('Currently disabled, starting...');
      startAutoClick();
    }
    sendResponse({ isEnabled: isEnabled });
  }
  return true;
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  Log.info('👋 Page unloading, cleaning up...');
  stopAutoClick();
});

Log.success('✅ All event listeners registered');
