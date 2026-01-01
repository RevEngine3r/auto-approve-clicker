# Step 1: Log Manager Module

## Goal
Implement a robust logging system that captures logs for both the console and the internal storage, enabling the UI to subscribe to new log events.

## Tasks
1. **Create `utils/logger.js`**:
   - `Logger` class with static methods
   - Internal log storage (array with limit)
   - Event emission (`CustomEvent`) when logs are added
   - Support for log levels: `info`, `success`, `warn`, `error`
   - Format timestamps
   
2. **Update `manifest.json`**:
   - Inject `utils/logger.js` before `content.js`

3. **Refactor `content.js`**:
   - Replace `console.log` with `Logger.log` / `Logger.success` / etc.
   - Remove manual timestamp creation (Logger handles it)

## Technical Details

### Logger Interface
```javascript
class Logger {
  static get logs() { ... }
  static log(message, data = null) { ... }
  static success(message) { ... }
  static warn(message) { ... }
  static error(message) { ... }
  static onLog(callback) { ... } // Listener for UI
}
```

### Log Object Structure
```javascript
{
  id: "timestamp-random",
  timestamp: "12:00:00 PM",
  level: "info", // or success, warn, error
  message: "Found button...",
  data: object | null
}
```

## Deliverables
- `utils/logger.js`
- Updated `manifest.json`
- Refactored `content.js`
