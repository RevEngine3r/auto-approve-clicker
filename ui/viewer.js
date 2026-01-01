/**
 * Auto-Approve Clicker - Log Viewer UI
 * Creates a floating button and collapsible log panel
 */
class LogViewer {
    constructor() {
        this.isOpen = false;
        this.autoScroll = true;
        this.container = null;
        this.logList = null;
        this.toggleButton = null;
        this.panel = null;
        this.initialized = false;
        this.isVisible = false;
    }

    /**
     * Initialize and inject the UI into the page
     */
    init() {
        if (this.initialized) {
            console.log('[LogViewer] Already initialized, skipping');
            return;
        }

        // Ensure document.body exists
        if (!document.body) {
            console.log('[LogViewer] document.body not ready, waiting...');
            setTimeout(() => this.init(), 100);
            return;
        }

        console.log('[LogViewer] Initializing...');

        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'aac-log-viewer';
        this.container.innerHTML = this._getTemplate();

        // Inject styles
        this._injectStyles();

        // Append to body
        document.body.appendChild(this.container);
        console.log('[LogViewer] UI elements appended to body');

        // Get element references
        this.toggleButton = document.getElementById('aac-toggle-btn');
        this.panel = document.getElementById('aac-log-panel');
        this.logList = document.getElementById('aac-log-list');

        if (!this.toggleButton || !this.panel || !this.logList) {
            console.error('[LogViewer] Failed to get element references!');
            return;
        }

        // Start hidden
        this.hide();

        // Set up event listeners
        this._setupEventListeners();

        // Load existing logs
        this._loadExistingLogs();

        // Listen for new logs
        window.addEventListener('aac-log-entry', (e) => {
            this.renderLog(e.detail);
        });

        // Listen for log clear events
        window.addEventListener('aac-logs-cleared', () => {
            this.clearUI();
        });

        // Listen for extension enabled/disabled events
        window.addEventListener('aac-extension-enabled', () => {
            console.log('[LogViewer] Extension enabled, showing viewer');
            this.show();
        });

        window.addEventListener('aac-extension-disabled', () => {
            console.log('[LogViewer] Extension disabled, hiding viewer');
            this.hide();
        });

        this.initialized = true;
        console.log('[LogViewer] Initialization complete!');
    }

    /**
     * Show the viewer button
     */
    show() {
        if (this.container) {
            this.container.style.display = '';
            this.isVisible = true;
            console.log('[LogViewer] Viewer shown');
        }
    }

    /**
     * Hide the viewer button and panel
     */
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
            this.isVisible = false;
            console.log('[LogViewer] Viewer hidden');
        }
    }

    /**
     * Get HTML template for the viewer
     */
    _getTemplate() {
        return `
            <!-- Floating Toggle Button -->
            <button id="aac-toggle-btn" class="aac-btn" title="Toggle Auto-Approve Logs" aria-label="Toggle logs">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span class="aac-badge" id="aac-log-count">0</span>
            </button>

            <!-- Log Panel -->
            <div id="aac-log-panel" class="aac-panel aac-hidden">
                <div class="aac-panel-header">
                    <h3 class="aac-panel-title">Auto-Approve Logs</h3>
                    <div class="aac-panel-controls">
                        <button id="aac-copy-btn" class="aac-control-btn" title="Copy logs to clipboard">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>
                        <button id="aac-clear-btn" class="aac-control-btn" title="Clear logs">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                        <button id="aac-close-btn" class="aac-control-btn" title="Close panel">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="aac-panel-body">
                    <div id="aac-log-list" class="aac-log-list"></div>
                </div>
                <div class="aac-panel-footer">
                    <label class="aac-checkbox-label">
                        <input type="checkbox" id="aac-auto-scroll" checked>
                        <span>Auto-scroll</span>
                    </label>
                </div>
            </div>
        `;
    }

    /**
     * Set up event listeners
     */
    _setupEventListeners() {
        // Toggle button
        this.toggleButton.addEventListener('click', () => this.toggle());

        // Close button
        document.getElementById('aac-close-btn').addEventListener('click', () => this.close());

        // Copy button
        document.getElementById('aac-copy-btn').addEventListener('click', () => this.copyLogs());

        // Clear button
        document.getElementById('aac-clear-btn').addEventListener('click', () => this.clearLogs());

        // Auto-scroll checkbox
        document.getElementById('aac-auto-scroll').addEventListener('change', (e) => {
            this.autoScroll = e.target.checked;
        });
    }

    /**
     * Load existing logs from Logger
     */
    _loadExistingLogs() {
        if (window.AutoApproveLogger && window.AutoApproveLogger.logs) {
            const logs = window.AutoApproveLogger.logs;
            console.log(`[LogViewer] Loading ${logs.length} existing logs`);
            logs.forEach(log => this.renderLog(log));
        }
    }

    /**
     * Render a single log entry
     */
    renderLog(log) {
        if (!this.logList) {
            console.warn('[LogViewer] Cannot render log, logList not initialized');
            return;
        }

        const logEntry = document.createElement('div');
        logEntry.className = `aac-log-entry aac-log-${log.level}`;
        logEntry.dataset.logId = log.id;

        const icon = this._getIconForLevel(log.level);

        logEntry.innerHTML = `
            <div class="aac-log-icon">${icon}</div>
            <div class="aac-log-content">
                <div class="aac-log-time">${log.timestamp}</div>
                <div class="aac-log-message">${this._escapeHtml(log.message)}</div>
                ${log.data ? `<pre class="aac-log-data">${this._escapeHtml(JSON.stringify(log.data, null, 2))}</pre>` : ''}
            </div>
        `;

        this.logList.appendChild(logEntry);
        this._updateLogCount();

        // Auto-scroll to bottom if enabled
        if (this.autoScroll) {
            this._scrollToBottom();
        }
    }

    /**
     * Scroll the log list to the bottom safely
     */
    _scrollToBottom() {
        if (this.logList) {
            // Use requestAnimationFrame to ensure DOM update is processed
            requestAnimationFrame(() => {
                this.logList.scrollTop = this.logList.scrollHeight;
            });
        }
    }

    /**
     * Get icon SVG for log level
     */
    _getIconForLevel(level) {
        const icons = {
            info: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
            success: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
            warn: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            error: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
        };
        return icons[level] || icons.info;
    }

    /**
     * Escape HTML to prevent XSS
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Update log count badge
     */
    _updateLogCount() {
        const count = this.logList.children.length;
        const badge = document.getElementById('aac-log-count');
        if (badge) {
            badge.textContent = count;
        }
    }

    /**
     * Toggle panel open/close
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Open the panel
     */
    open() {
        this.panel.classList.remove('aac-hidden');
        this.isOpen = true;
        if (this.autoScroll) {
            this._scrollToBottom();
        }
    }

    /**
     * Close the panel
     */
    close() {
        this.panel.classList.add('aac-hidden');
        this.isOpen = false;
    }

    /**
     * Clear all logs
     */
    clearLogs() {
        if (window.AutoApproveLogger) {
            window.AutoApproveLogger.clear();
        }
        this.clearUI();
    }

    /**
     * Clear UI only
     */
    clearUI() {
        if (this.logList) {
            this.logList.innerHTML = '';
            this._updateLogCount();
        }
    }

    /**
     * Copy logs to clipboard
     */
    async copyLogs() {
        if (!window.AutoApproveLogger) return;

        const logs = window.AutoApproveLogger.logs;
        const text = logs.map(log => {
            const data = log.data ? ` | ${JSON.stringify(log.data)}` : '';
            return `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}${data}`;
        }).join('\n');

        try {
            await navigator.clipboard.writeText(text);
            // Show brief confirmation
            const btn = document.getElementById('aac-copy-btn');
            const originalTitle = btn.title;
            btn.title = 'Copied!';
            setTimeout(() => {
                btn.title = originalTitle;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy logs:', err);
        }
    }

    /**
     * Inject CSS styles
     */
    _injectStyles() {
        if (document.getElementById('aac-viewer-styles')) return;

        const style = document.createElement('style');
        style.id = 'aac-viewer-styles';
        style.textContent = `
            /* Reset and base styles */
            #aac-log-viewer * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            
            /* Container - ensure it doesn't block interaction with the page */
            #aac-log-viewer {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 0 !important;
                height: 0 !important;
                overflow: visible !important;
                z-index: 2147483647 !important;
                pointer-events: none !important;
            }

            /* Floating toggle button */
            .aac-btn {
                position: fixed !important;
                bottom: 20px !important;
                right: 20px !important;
                width: 56px !important;
                height: 56px !important;
                border-radius: 50% !important;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                border: none !important;
                color: white !important;
                cursor: pointer !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 999998 !important;
                transition: transform 0.2s, box-shadow 0.2s !important;
                pointer-events: auto !important;
            }

            .aac-btn:hover {
                transform: scale(1.05) !important;
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
            }

            .aac-btn:active {
                transform: scale(0.95) !important;
            }

            .aac-badge {
                position: absolute !important;
                top: -4px !important;
                right: -4px !important;
                background: #ef4444 !important;
                color: white !important;
                font-size: 11px !important;
                font-weight: 600 !important;
                padding: 2px 6px !important;
                border-radius: 10px !important;
                min-width: 20px !important;
                text-align: center !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
            }

            /* Log panel - starts with pointer-events none, only enabled when visible */
            .aac-panel {
                position: fixed !important;
                bottom: 90px !important;
                right: 20px !important;
                width: 420px !important;
                max-width: calc(100vw - 40px) !important;
                max-height: 600px !important;
                background: #1a1a1a !important;
                border-radius: 12px !important;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
                display: flex !important;
                flex-direction: column !important;
                z-index: 999999 !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
                transition: opacity 0.3s, transform 0.3s !important;
                pointer-events: none !important;
            }

            /* When panel is visible (not hidden), enable pointer events */
            .aac-panel:not(.aac-hidden) {
                pointer-events: auto !important;
            }

            .aac-panel.aac-hidden {
                opacity: 0 !important;
                transform: translateY(20px) !important;
                pointer-events: none !important;
            }

            /* Panel header */
            .aac-panel-header {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                padding: 16px !important;
                border-bottom: 1px solid #2a2a2a !important;
                flex-shrink: 0 !important;
            }

            .aac-panel-title {
                font-size: 16px !important;
                font-weight: 600 !important;
                color: #ffffff !important;
            }

            .aac-panel-controls {
                display: flex !important;
                gap: 8px !important;
            }

            .aac-control-btn {
                background: transparent !important;
                border: none !important;
                color: #9ca3af !important;
                cursor: pointer !important;
                padding: 6px !important;
                border-radius: 6px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                transition: background 0.2s, color 0.2s !important;
            }

            .aac-control-btn:hover {
                background: #2a2a2a !important;
                color: #ffffff !important;
            }

            /* Panel body */
            .aac-panel-body {
                flex: 1 1 auto !important;
                overflow: hidden !important;
                padding: 12px !important;
                display: flex !important;
                flex-direction: column !important;
                min-height: 0 !important;
                position: relative !important;
            }

            .aac-log-list {
                flex: 1 1 auto !important;
                overflow-y: auto !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 8px !important;
                height: auto !important;
                max-height: 100% !important;
                scroll-behavior: smooth !important;
            }

            .aac-log-list::-webkit-scrollbar {
                width: 8px !important;
            }

            .aac-log-list::-webkit-scrollbar-track {
                background: #0a0a0a !important;
                border-radius: 4px !important;
            }

            .aac-log-list::-webkit-scrollbar-thumb {
                background: #3a3a3a !important;
                border-radius: 4px !important;
            }

            .aac-log-list::-webkit-scrollbar-thumb:hover {
                background: #4a4a4a !important;
            }

            /* Log entries */
            .aac-log-entry {
                display: flex !important;
                gap: 10px !important;
                padding: 10px !important;
                background: #0f0f0f !important;
                border-radius: 8px !important;
                border-left: 3px solid !important;
                animation: aac-fade-in 0.3s !important;
                flex-shrink: 0 !important;
            }

            @keyframes aac-fade-in {
                from {
                    opacity: 0;
                    transform: translateY(-5px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .aac-log-info { border-color: #3b82f6 !important; }
            .aac-log-success { border-color: #10b981 !important; }
            .aac-log-warn { border-color: #f59e0b !important; }
            .aac-log-error { border-color: #ef4444 !important; }

            .aac-log-icon {
                flex-shrink: 0 !important;
                width: 20px !important;
                height: 20px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }

            .aac-log-info .aac-log-icon { color: #3b82f6 !important; }
            .aac-log-success .aac-log-icon { color: #10b981 !important; }
            .aac-log-warn .aac-log-icon { color: #f59e0b !important; }
            .aac-log-error .aac-log-icon { color: #ef4444 !important; }

            .aac-log-content {
                flex: 1 !important;
                min-width: 0 !important;
            }

            .aac-log-time {
                font-size: 11px !important;
                color: #6b7280 !important;
                margin-bottom: 4px !important;
                font-family: 'SF Mono', 'Monaco', 'Courier New', monospace !important;
            }

            .aac-log-message {
                font-size: 13px !important;
                color: #e5e7eb !important;
                line-height: 1.5 !important;
                word-break: break-word !important;
            }

            .aac-log-data {
                margin-top: 6px !important;
                padding: 8px !important;
                background: #000000 !important;
                border-radius: 4px !important;
                font-size: 11px !important;
                color: #9ca3af !important;
                font-family: 'SF Mono', 'Monaco', 'Courier New', monospace !important;
                overflow-x: auto !important;
                white-space: pre-wrap !important;
            }

            /* Panel footer */
            .aac-panel-footer {
                padding: 12px 16px !important;
                border-top: 1px solid #2a2a2a !important;
                flex-shrink: 0 !important;
            }

            .aac-checkbox-label {
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                cursor: pointer !important;
                color: #9ca3af !important;
                font-size: 13px !important;
                user-select: none !important;
            }

            .aac-checkbox-label input[type="checkbox"] {
                cursor: pointer !important;
                width: 16px !important;
                height: 16px !important;
            }

            .aac-checkbox-label:hover {
                color: #ffffff !important;
            }

            /* Responsive */
            @media (max-width: 640px) {
                .aac-panel {
                    width: calc(100vw - 40px) !important;
                    max-height: 400px !important;
                }
            }
        `;
        document.head.appendChild(style);
        console.log('[LogViewer] Styles injected');
    }
}

// Initialize the viewer - wait for both DOM and a slight delay
console.log('[LogViewer] Script loaded, document.readyState:', document.readyState);

function initializeViewer() {
    console.log('[LogViewer] Attempting to initialize viewer...');
    // Wait a bit more to ensure content.js has run
    setTimeout(() => {
        const viewer = new LogViewer();
        viewer.init();
        // Expose globally for debugging
        window.AutoApproveLogViewer = viewer;
    }, 500);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeViewer);
} else {
    initializeViewer();
}
