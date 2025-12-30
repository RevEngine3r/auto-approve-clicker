// Auto-Approve Clicker - Options Page Script

const urlInput = document.getElementById('urlInput');
const addBtn = document.getElementById('addBtn');
const urlList = document.getElementById('urlList');
const clearBtn = document.getElementById('clearBtn');
const clearSection = document.getElementById('clearSection');
const messageDiv = document.getElementById('message');
const urlCountSpan = document.getElementById('urlCount');

let enabledUrls = [];

/**
 * Show message to user
 */
function showMessage(text, type = 'success') {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type} show`;
  
  setTimeout(() => {
    messageDiv.classList.remove('show');
  }, 3000);
}

/**
 * Update URL count badge
 */
function updateUrlCount() {
  urlCountSpan.textContent = enabledUrls.length;
  clearSection.style.display = enabledUrls.length > 0 ? 'block' : 'none';
}

/**
 * Render the list of enabled URLs
 */
function renderUrlList() {
  if (enabledUrls.length === 0) {
    urlList.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <p>No URLs enabled yet</p>
        <p style="font-size: 12px; margin-top: 8px;">Add a URL above to get started</p>
      </div>
    `;
  } else {
    urlList.innerHTML = enabledUrls.map((url, index) => `
      <li class="url-item">
        <span class="url-text">${escapeHtml(url)}</span>
        <button class="remove-btn" data-url="${escapeHtml(url)}">Remove</button>
      </li>
    `).join('');
    
    // Attach remove handlers
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => removeUrl(btn.dataset.url));
    });
  }
  
  updateUrlCount();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Load enabled URLs from storage
 */
function loadUrls() {
  chrome.runtime.sendMessage({ action: 'getEnabledUrls' }, (response) => {
    if (response && response.enabledUrls) {
      enabledUrls = response.enabledUrls;
      renderUrlList();
    }
  });
}

/**
 * Add new URL to enabled list
 */
function addUrl() {
  const url = urlInput.value.trim();
  
  if (!url) {
    showMessage('Please enter a URL', 'error');
    return;
  }
  
  // Basic validation
  if (url.length < 3) {
    showMessage('URL is too short', 'error');
    return;
  }
  
  chrome.runtime.sendMessage({ action: 'addUrl', url }, (response) => {
    if (response && response.success) {
      enabledUrls = response.enabledUrls;
      renderUrlList();
      urlInput.value = '';
      showMessage(`Added: ${url}`, 'success');
    } else {
      showMessage(response.error || 'Failed to add URL', 'error');
    }
  });
}

/**
 * Remove URL from enabled list
 */
function removeUrl(url) {
  chrome.runtime.sendMessage({ action: 'removeUrl', url }, (response) => {
    if (response && response.success) {
      enabledUrls = response.enabledUrls;
      renderUrlList();
      showMessage(`Removed: ${url}`, 'success');
    } else {
      showMessage(response.error || 'Failed to remove URL', 'error');
    }
  });
}

/**
 * Clear all URLs
 */
function clearAllUrls() {
  if (!confirm(`Are you sure you want to remove all ${enabledUrls.length} URLs?`)) {
    return;
  }
  
  chrome.runtime.sendMessage({ action: 'clearAllUrls' }, (response) => {
    if (response && response.success) {
      enabledUrls = [];
      renderUrlList();
      showMessage('All URLs cleared', 'success');
    } else {
      showMessage('Failed to clear URLs', 'error');
    }
  });
}

// Event listeners
addBtn.addEventListener('click', addUrl);
urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addUrl();
  }
});
clearBtn.addEventListener('click', clearAllUrls);

// Listen for storage changes from other parts of extension
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.enabledUrls) {
    enabledUrls = changes.enabledUrls.newValue || [];
    renderUrlList();
  }
});

// Load URLs on page load
loadUrls();
