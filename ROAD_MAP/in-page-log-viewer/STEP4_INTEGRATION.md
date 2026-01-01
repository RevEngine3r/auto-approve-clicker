# Step 4: Integration & Polish

## Goal
Connect the Logger module to the UI and ensure smooth user experience with convenience features.

## Tasks
1. **Wire Events**:
   - Subscribe `LogViewer` to `Logger` events
   - Update UI immediately when new logs arrive

2. **Add Controls**:
   - **Clear**: Empty the internal log array and the UI list
   - **Copy**: Copy all logs to clipboard as text
   - **Auto-scroll**: Toggle checkbox to automatically scroll to new logs

3. **State Persistence**:
   - Remember if the panel was open/closed (optional, via session storage)
   - Remember auto-scroll preference

## Technical Details
- Use `CustomEvent` for decoupled communication
- `navigator.clipboard.writeText()` for copy function

## Deliverables
- Fully functional `LogViewer` connected to `Logger`
