# Step 1: Create build-release.ps1 Script

## Goal
Create comprehensive PowerShell 7 script for automated Chrome extension release building.

## Version Format
`YYYY.MM.DD.HHmm` - e.g., `2025.12.30.1745` for Dec 30, 2025 at 5:45 PM

## Script Features
1. **Auto-versioning**: Generate version from current datetime
2. **Manifest update**: Automatically update version in manifest.json
3. **Smart packaging**: Create ZIP with only necessary files
4. **File exclusion**: Respect .buildignore for excluded files/folders
5. **Release folder**: Create releases/ directory with timestamped builds
6. **Validation**: Verify manifest.json validity before building
7. **Logging**: Clear console output showing progress
8. **Error handling**: Graceful failures with informative messages

## Files to Exclude (defaults)
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

## Output Structure
```
releases/
  └── auto-approve-clicker-YYYY.MM.DD.HHmm.zip
```

## Tasks
1. Create build-release.ps1 with all features
2. Include parameter support for custom version (optional)
3. Add verbose output mode
4. Implement manifest.json backup/restore on error
5. Add success summary with file size and path
