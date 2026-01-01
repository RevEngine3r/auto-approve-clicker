/**
 * Auto-Approve Clicker - Logger Module
 * Handles log storage and event dispatching for the in-page UI
 */
class Logger {
    static MAX_LOGS = 1000;
    static _logs = [];
    
    /**
     * @typedef {Object} LogEntry
     * @property {string} id - Unique ID
     * @property {string} timestamp - Formatted time string
     * @property {string} level - 'info' | 'success' | 'warn' | 'error'
     * @property {string} message - Main log message
     * @property {any} [data] - Optional data object
     */

    /**
     * Get all stored logs
     * @returns {LogEntry[]}
     */
    static get logs() {
        return [...this._logs];
    }

    /**
     * Create a new log entry
     * @param {string} level 
     * @param {string} message 
     * @param {any} [data] 
     */
    static _add(level, message, data = null) {
        const entry = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            timestamp: new Date().toLocaleTimeString(),
            level,
            message,
            data
        };

        this._logs.push(entry);

        // Maintain max limit
        if (this._logs.length > this.MAX_LOGS) {
            this._logs.shift();
        }

        // Dispatch event for UI
        window.dispatchEvent(new CustomEvent('aac-log-entry', { 
            detail: entry 
        }));

        // Also log to browser console
        const consoleArgs = [`[Auto-Approve] ${message}`];
        if (data) consoleArgs.push(data);

        switch (level) {
            case 'success':
                console.log(`%c[Auto-Approve] ${message}`, 'color: #00ff00; font-weight: bold', data || '');
                break;
            case 'warn':
                console.warn(...consoleArgs);
                break;
            case 'error':
                console.error(...consoleArgs);
                break;
            default:
                console.log(...consoleArgs);
        }
    }

    static info(message, data = null) {
        this._add('info', message, data);
    }

    static success(message, data = null) {
        this._add('success', message, data);
    }

    static warn(message, data = null) {
        this._add('warn', message, data);
    }

    static error(message, data = null) {
        this._add('error', message, data);
    }

    static clear() {
        this._logs = [];
        window.dispatchEvent(new CustomEvent('aac-logs-cleared'));
        console.clear();
    }
}

// Expose to window for debugging if needed
window.AutoApproveLogger = Logger;
