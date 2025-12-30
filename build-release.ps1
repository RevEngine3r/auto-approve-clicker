<#
.SYNOPSIS
    Build Chrome extension release package with automatic datetime-based versioning.

.DESCRIPTION
    This script automates the Chrome extension release process:
    - Generates version from current datetime (YYYY.MM.DD.HHmm)
    - Updates manifest.json with new version
    - Creates ZIP package excluding development files
    - Outputs to releases/ directory

.PARAMETER CustomVersion
    Optional custom version string (must match Chrome version format: up to 4 dot-separated integers)

.PARAMETER Verbose
    Enable verbose output for debugging

.EXAMPLE
    ./build-release.ps1
    Builds release with automatic datetime version

.EXAMPLE
    ./build-release.ps1 -CustomVersion "2.0.1.0"
    Builds release with custom version

.NOTES
    Requires: PowerShell 7+
    Author: RevEngine3r
    Extension: Auto-Approve Clicker
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$CustomVersion = "",
    
    [Parameter(Mandatory = $false)]
    [switch]$VerboseOutput
)

# Script configuration
$ErrorActionPreference = "Stop"
$Script:ExtensionName = "auto-approve-clicker"
$Script:ManifestPath = "manifest.json"
$Script:ReleasesDir = "releases"

# Default exclusions (always excluded)
$Script:DefaultExclusions = @(
    ".git",
    ".github",
    "ROAD_MAP",
    "releases",
    "PROGRESS.md",
    "PROJECT_MAP.md",
    ".gitignore",
    ".buildignore",
    "*.ps1",
	"*.bat"
)

#region Helper Functions

function Write-Step {
    param([string]$Message)
    Write-Host "`n[STEP] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✓ $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "  → $Message" -ForegroundColor Gray
}

function Write-Warning {
    param([string]$Message)
    Write-Host "  ! $Message" -ForegroundColor Yellow
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "  ✗ $Message" -ForegroundColor Red
}

function Get-DateTimeVersion {
    <#
    .SYNOPSIS
        Generate version string from current datetime
    .DESCRIPTION
        Format: YYYY.MM.DD.HHmm (e.g., 2025.12.30.1745)
    #>
    $now = Get-Date
    $year = $now.Year
    $month = $now.Month
    $day = $now.Day
    $hour = $now.Hour
    $minute = $now.Minute
    
    return "$year.$month.$day.$($hour)$($minute.ToString('00'))"
}

function Test-ChromeVersion {
    <#
    .SYNOPSIS
        Validate Chrome extension version format
    .DESCRIPTION
        Chrome versions must be 1-4 dot-separated integers (0-65535)
    #>
    param([string]$Version)
    
    if ($Version -match '^\d+(\.\d+){0,3}$') {
        $parts = $Version -split '\.'
        if ($parts.Count -le 4) {
            foreach ($part in $parts) {
                $num = [int]$part
                if ($num -lt 0 -or $num -gt 65535) {
                    return $false
                }
            }
            return $true
        }
    }
    return $false
}

function Backup-Manifest {
    <#
    .SYNOPSIS
        Create backup of manifest.json
    #>
    $backupPath = "$Script:ManifestPath.backup"
    Copy-Item -Path $Script:ManifestPath -Destination $backupPath -Force
    Write-Info "Backup created: $backupPath"
    return $backupPath
}

function Restore-Manifest {
    <#
    .SYNOPSIS
        Restore manifest.json from backup
    #>
    param([string]$BackupPath)
    
    if (Test-Path $BackupPath) {
        Copy-Item -Path $BackupPath -Destination $Script:ManifestPath -Force
        Remove-Item -Path $BackupPath -Force
        Write-Info "Manifest restored from backup"
    }
}

function Update-ManifestVersion {
    <#
    .SYNOPSIS
        Update version in manifest.json
    #>
    param([string]$NewVersion)
    
    try {
        # Read manifest
        $manifestContent = Get-Content -Path $Script:ManifestPath -Raw
        $manifest = $manifestContent | ConvertFrom-Json
        
        # Store old version
        $oldVersion = $manifest.version
        
        # Update version
        $manifest.version = $NewVersion
        
        # Write back to file (pretty-printed)
        $manifestJson = $manifest | ConvertTo-Json -Depth 10
        $manifestJson | Set-Content -Path $Script:ManifestPath -Encoding UTF8 -NoNewline
        
        Write-Success "Version updated: $oldVersion → $NewVersion"
        return $true
    }
    catch {
        Write-ErrorMsg "Failed to update manifest: $_"
        return $false
    }
}

function Get-BuildIgnorePatterns {
    <#
    .SYNOPSIS
        Read .buildignore file and return patterns
    #>
    $patterns = @()
    $buildIgnorePath = ".buildignore"
    
    if (Test-Path $buildIgnorePath) {
        $lines = Get-Content -Path $buildIgnorePath
        foreach ($line in $lines) {
            $trimmed = $line.Trim()
            # Skip empty lines and comments
            if ($trimmed -and -not $trimmed.StartsWith('#')) {
                $patterns += $trimmed
            }
        }
        Write-Info "Loaded $($patterns.Count) patterns from .buildignore"
    }
    
    return $patterns
}

function Test-ShouldExclude {
    <#
    .SYNOPSIS
        Check if file/folder should be excluded from build
    #>
    param(
        [string]$Path,
        [string[]]$Patterns
    )
    
    $relativePath = $Path.TrimStart('.\').TrimStart('.\\')
    
    # Check default exclusions
    foreach ($exclusion in $Script:DefaultExclusions) {
        if ($exclusion.EndsWith('*')) {
            # Wildcard pattern
            $pattern = $exclusion.TrimEnd('*')
            if ($relativePath -like "*$pattern*") {
                return $true
            }
        }
        elseif ($relativePath -eq $exclusion -or $relativePath.StartsWith("$exclusion\\")) {
            return $true
        }
    }
    
    # Check .buildignore patterns
    foreach ($pattern in $Patterns) {
        if ($pattern.Contains('*')) {
            # Wildcard pattern
            if ($relativePath -like $pattern) {
                return $true
            }
        }
        elseif ($relativePath -eq $pattern -or $relativePath.StartsWith("$pattern\\")) {
            return $true
        }
    }
    
    return $false
}

function New-ReleasePackage {
    <#
    .SYNOPSIS
        Create ZIP package of extension files
    #>
    param(
        [string]$Version,
        [string[]]$CustomExclusions
    )
    
    try {
        # Create releases directory
        if (-not (Test-Path $Script:ReleasesDir)) {
            New-Item -ItemType Directory -Path $Script:ReleasesDir -Force | Out-Null
            Write-Success "Created releases directory"
        }
        
        # Generate output filename
        $zipFileName = "$Script:ExtensionName-$Version.zip"
        $zipPath = Join-Path $Script:ReleasesDir $zipFileName
        
        # Remove existing ZIP if present
        if (Test-Path $zipPath) {
            Remove-Item -Path $zipPath -Force
            Write-Info "Removed existing: $zipFileName"
        }
        
        # Get all files/folders in current directory
        $allItems = Get-ChildItem -Path . -Recurse -Force
        $includedFiles = @()
        
        Write-Info "Scanning files for packaging..."
        
        foreach ($item in $allItems) {
            $relativePath = $item.FullName.Substring((Get-Location).Path.Length + 1)
            
            # Skip if excluded
            if (Test-ShouldExclude -Path $relativePath -Patterns $CustomExclusions) {
                if ($VerboseOutput) {
                    Write-Verbose "Excluded: $relativePath"
                }
                continue
            }
            
            # Include only files (not directories)
            if (-not $item.PSIsContainer) {
                $includedFiles += $item.FullName
                if ($VerboseOutput) {
                    Write-Verbose "Included: $relativePath"
                }
            }
        }
        
        Write-Info "Packaging $($includedFiles.Count) files..."
        
        # Create ZIP using .NET compression
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        
        $zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
        
        try {
            foreach ($file in $includedFiles) {
                $relativePath = $file.Substring((Get-Location).Path.Length + 1)
                # Normalize path separators for ZIP
                $entryName = $relativePath.Replace('\', '/')
                [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file, $entryName) | Out-Null
            }
        }
        finally {
            $zip.Dispose()
        }
        
        # Get file size
        $zipInfo = Get-Item $zipPath
        $sizeKB = [math]::Round($zipInfo.Length / 1KB, 2)
        
        Write-Success "Release package created: $zipFileName ($sizeKB KB)"
        Write-Info "Location: $($zipInfo.FullName)"
        
        return $zipPath
    }
    catch {
        Write-ErrorMsg "Failed to create package: $_"
        throw
    }
}

#endregion

#region Main Script

function Main {
    Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
    Write-Host "  Auto-Approve Clicker - Release Builder" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Cyan
    
    $backupPath = $null
    
    try {
        # Step 1: Validate environment
        Write-Step "Validating environment"
        
        if (-not (Test-Path $Script:ManifestPath)) {
            throw "manifest.json not found in current directory"
        }
        Write-Success "Found manifest.json"
        
        # Check PowerShell version
        if ($PSVersionTable.PSVersion.Major -lt 7) {
            Write-Warning "PowerShell 7+ recommended (current: $($PSVersionTable.PSVersion))"
        }
        else {
            Write-Success "PowerShell version: $($PSVersionTable.PSVersion)"
        }
        
        # Step 2: Determine version
        Write-Step "Determining version"
        
        if ($CustomVersion) {
            if (-not (Test-ChromeVersion -Version $CustomVersion)) {
                throw "Invalid version format: $CustomVersion (must be 1-4 dot-separated integers)"
            }
            $version = $CustomVersion
            Write-Info "Using custom version: $version"
        }
        else {
            $version = Get-DateTimeVersion
            Write-Info "Generated datetime version: $version"
        }
        
        # Step 3: Backup manifest
        Write-Step "Creating manifest backup"
        $backupPath = Backup-Manifest
        
        # Step 4: Update manifest version
        Write-Step "Updating manifest.json"
        if (-not (Update-ManifestVersion -NewVersion $version)) {
            throw "Failed to update manifest version"
        }
        
        # Step 5: Load exclusion patterns
        Write-Step "Loading build configuration"
        $customExclusions = Get-BuildIgnorePatterns
        Write-Info "Total exclusion patterns: $($Script:DefaultExclusions.Count + $customExclusions.Count)"
        
        # Step 6: Create release package
        Write-Step "Building release package"
        $zipPath = New-ReleasePackage -Version $version -CustomExclusions $customExclusions
        
        # Step 7: Cleanup backup
        if ($backupPath -and (Test-Path $backupPath)) {
            Remove-Item -Path $backupPath -Force
            Write-Info "Cleaned up backup file"
        }
        
        # Success summary
        Write-Host "`n" + "=" * 60 -ForegroundColor Green
        Write-Host "  BUILD SUCCESSFUL" -ForegroundColor Green
        Write-Host "=" * 60 -ForegroundColor Green
        Write-Host ""
        Write-Host "  Version:  $version" -ForegroundColor White
        Write-Host "  Package:  $zipPath" -ForegroundColor White
        Write-Host ""
        Write-Host "  Next steps:" -ForegroundColor Yellow
        Write-Host "    1. Test the extension by loading the extracted ZIP" -ForegroundColor Gray
        Write-Host "    2. Submit to Chrome Web Store (if desired)" -ForegroundColor Gray
        Write-Host "    3. Commit manifest.json with updated version" -ForegroundColor Gray
        Write-Host ""
        
        return 0
    }
    catch {
        Write-Host ""
        Write-Host "=" * 60 -ForegroundColor Red
        Write-Host "  BUILD FAILED" -ForegroundColor Red
        Write-Host "=" * 60 -ForegroundColor Red
        Write-ErrorMsg $_.Exception.Message
        
        # Restore manifest if backup exists
        if ($backupPath) {
            Write-Host ""
            Write-Step "Restoring manifest.json"
            Restore-Manifest -BackupPath $backupPath
        }
        
        Write-Host ""
        return 1
    }
}

# Execute main function
exit (Main)

#endregion
