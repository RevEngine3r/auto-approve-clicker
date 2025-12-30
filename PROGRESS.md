# Auto-Approve Clicker - Progress Tracker

## Current Feature: Release Build Script

### Overall Goal
Create PowerShell 7 script for automated Chrome extension release building with datetime-based versioning.

### Approved Roadmap
1. ⏳ **Step 1**: Create build-release.ps1 script - Core PowerShell script with datetime versioning
2. 📋 **Step 2**: Add .buildignore file - Specify files to exclude from release package
3. 📋 **Step 3**: Update PROJECT_MAP.md - Document new build system
4. 📋 **Step 4**: Create build documentation in README - Usage instructions for build script
5. 📋 **Step 5**: Test and finalize - Create PR with all changes

---

## Current Step: Step 1 - Create build-release.ps1 Script

### Status: ⏳ IN PROGRESS

### Goals
- Create comprehensive PowerShell 7 script for automated release building
- Implement datetime-based auto-versioning (format: YYYY.MM.DD.HHmm)
- Smart packaging with file exclusion support
- Manifest.json auto-update with version
- Error handling and validation

### Version Format
`YYYY.MM.DD.HHmm` - Example: `2025.12.30.1745` (Dec 30, 2025 at 5:45 PM)

### Script Features to Implement
1. **Auto-versioning**: Generate version from current datetime
2. **Manifest update**: Automatically update version in manifest.json
3. **Smart packaging**: Create ZIP with only necessary files
4. **File exclusion**: Respect .buildignore for excluded files/folders
5. **Release folder**: Create releases/ directory with timestamped builds
6. **Validation**: Verify manifest.json validity before building
7. **Logging**: Clear console output showing progress
8. **Error handling**: Graceful failures with informative messages

### Files to Exclude (defaults)
- .git/
- .github/
- ROAD_MAP/
- PROGRESS.md
- PROJECT_MAP.md
- releases/
- *.ps1 (build scripts)
- .buildignore
- .gitignore
- *.md (except README.md in root)

### Output Structure
```
releases/
  └── auto-approve-clicker-YYYY.MM.DD.HHmm.zip
```

### Tasks for This Step
- [ ] Create build-release.ps1 with all features
- [ ] Include parameter support for custom version (optional)
- [ ] Add verbose output mode
- [ ] Implement manifest.json backup/restore on error
- [ ] Add success summary with file size and path

### Detailed Plan Reference
See: `ROAD_MAP/STEP1_BUILD_SCRIPT.md`

---

## Next Steps
1. Step 2: Add .buildignore file - See `ROAD_MAP/STEP2_BUILDIGNORE.md`
2. Step 3: Update PROJECT_MAP.md - See `ROAD_MAP/STEP3_UPDATE_PROJECT_MAP.md`
3. Step 4: Create build documentation in README - See `ROAD_MAP/STEP4_README_DOCS.md`
4. Step 5: Test and finalize - See `ROAD_MAP/STEP5_TEST_FINALIZE.md`

---
