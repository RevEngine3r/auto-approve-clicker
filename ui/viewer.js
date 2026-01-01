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
    }

    /**
     * Initialize and inject the UI into the page
     */
    init() {
        if (this.container) return; // Already initialized

        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'aac-log-viewer';
        this.container.innerHTML = this._getTemplate();

        // Inject styles
        this._injectStyles();

        // Append to body
        document.body.appendChild(this.container);

        // Get element references
        this.toggleButton = document.getElementById('aac-toggle-btn');
        this.panel = document.getElementById('aac-log-panel');
        this.logList = document.getElementById('aac-log-list');

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
            logs.forEach(log => this.renderLog(log));
        }
    }

    /**
     * Render a single log entry
     */
    renderLog(log) {
        const logEntry = document.createElement('div');
        logEntry.className = `aac-log-entry aac-log-${log.level}`;
        logEntry.dataset.logId = log.id;

        const icon = this._getIconForLevel(log.level);
        const dataStr = log.data ? `\n${JSON.stringify(log.data, null, 2)}` : '';

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
            this.logList.scrollTop = this.logList.scrollHeight;
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
        document.getElementById('aac-log-count').textContent = count;
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
            this.logList.scrollTop = this.logList.scrollHeight;
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
        this.logList.innerHTML = '';
        this._updateLogCount();
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

            /* Floating toggle button */
            .aac-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                color: white;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999998;
                transition: transform 0.2s, box-shadow 0.2s;
            }

            .aac-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
            }

            .aac-btn:active {
                transform: scale(0.95);
            }

            .aac-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                background: #ef4444;
                color: white;
                font-size: 11px;
                font-weight: 600;
                padding: 2px 6px;
                border-radius: 10px;
                min-width: 20px;
                text-align: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }

            /* Log panel */
            .aac-panel {
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 420px;
                max-width: calc(100vw - 40px);
                max-height: 600px;
                background: #1a1a1a;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                display: flex;
                flex-direction: column;
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                transition: opacity 0.3s, transform 0.3s;
            }

            .aac-panel.aac-hidden {
                opacity: 0;
                transform: translateY(20px);
                pointer-events: none;
            }

            /* Panel header */
            .aac-panel-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px;
                border-bottom: 1px solid #2a2a2a;
            }

            .aac-panel-title {
                font-size: 16px;
                font-weight: 600;
                color: #ffffff;
            }

            .aac-panel-controls {
                display: flex;
                gap: 8px;
            }

            .aac-control-btn {
                background: transparent;
                border: none;
                color: #9ca3af;
                cursor: pointer;
                padding: 6px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s, color 0.2s;
            }

            .aac-control-btn:hover {
                background: #2a2a2a;
                color: #ffffff;
            }

            /* Panel body */
            .aac-panel-body {
                flex: 1;
                overflow: hidden;
                padding: 12px;
            }

            .aac-log-list {
                height: 100%;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .aac-log-list::-webkit-scrollbar {
                width: 8px;
            }

            .aac-log-list::-webkit-scrollbar-track {
                background: #0a0a0a;
                border-radius: 4px;
            }

            .aac-log-list::-webkit-scrollbar-thumb {
                background: #3a3a3a;
                border-radius: 4px;
            }

            .aac-log-list::-webkit-scrollbar-thumb:hover {
                background: #4a4a4a;
            }

            /* Log entries */
            .aac-log-entry {
                display: flex;
                gap: 10px;
                padding: 10px;
                background: #0f0f0f;
                border-radius: 8px;
                border-left: 3px solid;
                animation: aac-fade-in 0.3s;
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

            .aac-log-info { border-color: #3b82f6; }
            .aac-log-success { border-color: #10b981; }
            .aac-log-warn { border-color: #f59e0b; }
            .aac-log-error { border-color: #ef4444; }

            .aac-log-icon {
                flex-shrink: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .aac-log-info .aac-log-icon { color: #3b82f6; }
            .aac-log-success .aac-log-icon { color: #10b981; }
            .aac-log-warn .aac-log-icon { color: #f59e0b; }
            .aac-log-error .aac-log-icon { color: #ef4444; }

            .aac-log-content {
                flex: 1;
                min-width: 0;
            }

            .aac-log-time {
                font-size: 11px;
                color: #6b7280;
                margin-bottom: 4px;
                font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
            }

            .aac-log-message {
                font-size: 13px;
                color: #e5e7eb;
                line-height: 1.5;
                word-break: break-word;
            }

            .aac-log-data {
                margin-top: 6px;
                padding: 8px;
                background: #000000;
                border-radius: 4px;
                font-size: 11px;
                color: #9ca3af;
                font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
                overflow-x: auto;
                white-space: pre-wrap;
            }

            /* Panel footer */
            .aac-panel-footer {
                padding: 12px 16px;
                border-top: 1px solid #2a2a2a;
            }

            .aac-checkbox-label {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                color: #9ca3af;
                font-size: 13px;
                user-select: none;
            }

            .aac-checkbox-label input[type="checkbox"] {
                cursor: pointer;
                width: 16px;
                height: 16px;
            }

            .aac-checkbox-label:hover {
                color: #ffffff;
            }

            /* Responsive */
            @media (max-width: 640px) {
                .aac-panel {
                    width: calc(100vw - 40px);
                    max-height: 400px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize the viewer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const viewer = new LogViewer();
        viewer.init();
    });
} else {
    const viewer = new LogViewer();
    viewer.init();
}
