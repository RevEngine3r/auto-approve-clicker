// Auto-Approve Clicker - Background Service Worker
// Manages extension lifecycle, storage initialization, and coordination

/**
 * Initialize storage with default values on installation
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // First installation - initialize with empty enabled URLs list
    chrome.storage.sync.set({
      enabledUrls: []
    }, () => {
      console.log('[Auto-Approve] Extension installed - storage initialized');
    });
  } else if (details.reason === 'update') {
    // Extension updated - preserve existing data
    console.log('[Auto-Approve] Extension updated to version', chrome.runtime.getManifest().version);
  }
});

/**
 * Handle messages from content scripts, popup, and options page
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getEnabledUrls') {
    // Retrieve enabled URLs list
    chrome.storage.sync.get(['enabledUrls'], (result) => {
      sendResponse({ enabledUrls: result.enabledUrls || [] });
    });
    return true; // Keep channel open for async response
    
  } else if (message.action === 'addUrl') {
    // Add URL to enabled list
    const urlToAdd = message.url;
    
    chrome.storage.sync.get(['enabledUrls'], (result) => {
      const enabledUrls = result.enabledUrls || [];
      
      // Check if URL already exists
      if (!enabledUrls.includes(urlToAdd)) {
        enabledUrls.push(urlToAdd);
        
        chrome.storage.sync.set({ enabledUrls }, () => {
          console.log('[Auto-Approve] Added URL:', urlToAdd);
          sendResponse({ success: true, enabledUrls });
        });
      } else {
        sendResponse({ success: false, error: 'URL already enabled', enabledUrls });
      }
    });
    return true;
    
  } else if (message.action === 'removeUrl') {
    // Remove URL from enabled list
    const urlToRemove = message.url;
    
    chrome.storage.sync.get(['enabledUrls'], (result) => {
      let enabledUrls = result.enabledUrls || [];
      
      // Filter out the URL
      const originalLength = enabledUrls.length;
      enabledUrls = enabledUrls.filter(url => url !== urlToRemove);
      
      if (enabledUrls.length < originalLength) {
        chrome.storage.sync.set({ enabledUrls }, () => {
          console.log('[Auto-Approve] Removed URL:', urlToRemove);
          sendResponse({ success: true, enabledUrls });
        });
      } else {
        sendResponse({ success: false, error: 'URL not found', enabledUrls });
      }
    });
    return true;
    
  } else if (message.action === 'clearAllUrls') {
    // Clear all enabled URLs
    chrome.storage.sync.set({ enabledUrls: [] }, () => {
      console.log('[Auto-Approve] Cleared all URLs');
      sendResponse({ success: true, enabledUrls: [] });
    });
    return true;
    
  } else if (message.action === 'isUrlEnabled') {
    // Check if specific URL is enabled
    const urlToCheck = message.url;
    
    chrome.storage.sync.get(['enabledUrls'], (result) => {
      const enabledUrls = result.enabledUrls || [];
      const isEnabled = enabledUrls.some(url => urlToCheck.includes(url));
      sendResponse({ isEnabled });
    });
    return true;
  }
});

/**
 * Log storage changes for debugging
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.enabledUrls) {
    console.log('[Auto-Approve] Enabled URLs updated:', changes.enabledUrls.newValue);
  }
});

console.log('[Auto-Approve] Background service worker initialized');
