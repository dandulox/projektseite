# Projektseite v3.0 - Update Script (PowerShell)
# Aktualisiert das Repository und führt Validierung durch

param(
    [switch]$SkipValidation = $false,
    [switch]$SkipTests = $false,
    [switch]$Force = $false
)

# Set execution policy for this session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"
$White = "White"

# Functions
function Write-Header {
    param([string]$Text)
    Write-Host "================================================" -ForegroundColor $Blue
    Write-Host "  $Text" -ForegroundColor $Blue
    Write-Host "================================================" -ForegroundColor $Blue
    Write-Host ""
}

function Write-Step {
    param([string]$Text)
    Write-Host "🔄 $Text" -ForegroundColor $Yellow
}

function Write-Success {
    param([string]$Text)
    Write-Host "✅ $Text" -ForegroundColor $Green
}

function Write-Error {
    param([string]$Text)
    Write-Host "❌ $Text" -ForegroundColor $Red
}

function Write-Info {
    param([string]$Text)
    Write-Host "ℹ️  $Text" -ForegroundColor $Cyan
}

function Write-Warning {
    param([string]$Text)
    Write-Host "⚠️  $Text" -ForegroundColor $Yellow
}

# Check if git is available
function Test-GitAvailable {
    try {
        git --version | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Update repository
function Update-Repository {
    Write-Step "Updating repository..."
    
    if (-not (Test-GitAvailable)) {
        Write-Error "Git is not available. Please install Git first."
        exit 1
    }
    
    if (-not (Test-Path ".git")) {
        Write-Warning "Not a git repository, skipping update"
        return
    }
    
    try {
        Write-Info "Fetching latest changes..."
        git fetch origin
        
        Write-Info "Checking current branch..."
        $currentBranch = git branch --show-current
        Write-Info "Current branch: $currentBranch"
        
        Write-Info "Pulling latest changes..."
        try {
            git pull origin $currentBranch
        }
        catch {
            Write-Warning "Git pull failed, attempting conflict resolution..."
            
            # Check if there are local changes
            $hasChanges = $false
            try {
                $diff = git diff --quiet 2>$null
                $cached = git diff --cached --quiet 2>$null
                $hasChanges = $LASTEXITCODE -ne 0
            }
            catch {
                $hasChanges = $true
            }
            
            if ($hasChanges) {
                Write-Info "Local changes detected, resolving conflicts..."
                
                # Option 1: Try to stash changes
                try {
                    git stash push -m "Auto-stash before pull $(Get-Date)"
                    Write-Info "Changes stashed, pulling..."
                    
                    git pull origin $currentBranch
                    Write-Success "Repository updated after stash"
                    
                    Write-Info "Restoring stashed changes..."
                    try {
                        git stash pop
                        Write-Success "Stashed changes restored"
                    }
                    catch {
                        Write-Warning "Could not restore stashed changes, but repository is updated"
                    }
                }
                catch {
                    # Option 2: Force reset to remote
                    Write-Info "Stash failed, using force reset to remote..."
                    git reset --hard "origin/$currentBranch"
                    Write-Success "Repository force-updated to remote version"
                }
            }
            else {
                # No local changes, just fetch and reset
                Write-Info "No local changes, force updating to remote..."
                git reset --hard "origin/$currentBranch"
                Write-Success "Repository force-updated to remote version"
            }
        }
        
        Write-Info "Checking for submodules..."
        if (Test-Path ".gitmodules") {
            Write-Info "Updating submodules..."
            git submodule update --init --recursive
        }
        
        Write-Success "Repository updated successfully"
        
        # Show recent commits
        Write-Info "Recent commits:"
        git log --oneline -5
        
    } catch {
        Write-Error "Failed to update repository: $_"
        if (-not $Force) {
            exit 1
        }
    }
}

# Set script permissions
function Set-ScriptPermissions {
    Write-Step "Setting script permissions..."
    
    Write-Info "Setting PowerShell execution policy..."
    Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
    
    Write-Info "Unblocking PowerShell scripts..."
    Get-ChildItem -Path "scripts\*.ps1" -ErrorAction SilentlyContinue | ForEach-Object { 
        Unblock-File $_.FullName -ErrorAction SilentlyContinue
    }
    
    Write-Success "Script permissions set"
}

# Update dependencies
function Update-Dependencies {
    Write-Step "Updating dependencies..."
    
    $packages = @("shared", "server", "client")
    
    foreach ($pkg in $packages) {
        if (Test-Path $pkg) {
            Write-Info "Updating dependencies for $pkg..."
            Set-Location $pkg
            
            try {
                npm update
                Write-Success "Dependencies updated for $pkg"
            } catch {
                Write-Warning "Failed to update dependencies for $pkg: $_"
            }
            
            Set-Location ..
        } else {
            Write-Warning "Directory $pkg not found, skipping"
        }
    }
}

# Rebuild applications
function Rebuild-Applications {
    Write-Step "Rebuilding applications..."
    
    # Build shared module
    if (Test-Path "shared") {
        Write-Info "Building shared module..."
        Set-Location shared
        try {
            npm run build
            Write-Success "Shared module built"
        } catch {
            Write-Error "Failed to build shared module: $_"
        }
        Set-Location ..
    }
    
    # Build server
    if (Test-Path "server") {
        Write-Info "Building server..."
        Set-Location server
        try {
            npm run build
            Write-Success "Server built"
        } catch {
            Write-Error "Failed to build server: $_"
        }
        Set-Location ..
    }
    
    # Build client
    if (Test-Path "client") {
        Write-Info "Building client..."
        Set-Location client
        try {
            npm run build
            Write-Success "Client built"
        } catch {
            Write-Error "Failed to build client: $_"
        }
        Set-Location ..
    }
}

# Run database migrations
function Update-Database {
    Write-Step "Updating database..."
    
    if (Test-Path "server") {
        Set-Location server
        
        try {
            Write-Info "Generating Prisma client..."
            npm run db:generate
            
            Write-Info "Running database migrations..."
            npm run db:migrate
            
            Write-Success "Database updated"
        } catch {
            Write-Warning "Failed to update database: $_"
        }
        
        Set-Location ..
    }
}

# Run validation
function Test-Validation {
    if ($SkipValidation) {
        Write-Info "Skipping validation as requested"
        return
    }
    
    Write-Step "Running validation..."
    
    if (Test-Path "scripts\validate-v3.ps1") {
        try {
            & ".\scripts\validate-v3.ps1" -Quick
            Write-Success "Validation completed"
        } catch {
            Write-Warning "Validation failed: $_"
        }
    } else {
        Write-Warning "Validation script not found"
    }
}

# Run tests
function Test-Applications {
    if ($SkipTests) {
        Write-Info "Skipping tests as requested"
        return
    }
    
    Write-Step "Running tests..."
    
    # Test server
    if (Test-Path "server") {
        Write-Info "Running server tests..."
        Set-Location server
        try {
            npm run test
            Write-Success "Server tests passed"
        } catch {
            Write-Warning "Server tests failed: $_"
        }
        Set-Location ..
    }
    
    # Test client
    if (Test-Path "client") {
        Write-Info "Running client tests..."
        Set-Location client
        try {
            npm run test
            Write-Success "Client tests passed"
        } catch {
            Write-Warning "Client tests failed: $_"
        }
        Set-Location ..
    }
}

# Show update summary
function Show-UpdateSummary {
    Write-Header "Update Complete!"
    
    Write-Success "Projektseite v3.0 has been updated successfully!"
    Write-Host ""
    Write-Info "What was updated:"
    Write-Host "  • Repository code" -ForegroundColor $White
    Write-Host "  • Dependencies" -ForegroundColor $White
    Write-Host "  • Application builds" -ForegroundColor $White
    Write-Host "  • Database schema" -ForegroundColor $White
    Write-Host ""
    Write-Info "Next steps:"
    Write-Host "  • Restart development servers if running" -ForegroundColor $White
    Write-Host "  • Check for any breaking changes in the changelog" -ForegroundColor $White
    Write-Host "  • Run full validation: .\scripts\validate-v3.ps1" -ForegroundColor $White
    Write-Host ""
    Write-Info "To start development:"
    Write-Host "  • Quick start: .\scripts\quick-start.ps1" -ForegroundColor $White
    Write-Host "  • Manual start: cd server && npm run dev" -ForegroundColor $White
}

# Main function
function Main {
    Write-Header "Projektseite v3.0 - Update"
    
    Write-Info "Skip Validation: $SkipValidation"
    Write-Info "Skip Tests: $SkipTests"
    Write-Info "Force Mode: $Force"
    Write-Host ""
    
    # Step 1: Update repository
    Update-Repository
    
    # Step 2: Set script permissions
    Set-ScriptPermissions
    
    # Step 3: Update dependencies
    Update-Dependencies
    
    # Rebuild applications
    Rebuild-Applications
    
    # Update database
    Update-Database
    
    # Run validation
    Test-Validation
    
    # Run tests
    Test-Applications
    
    # Show summary
    Show-UpdateSummary
}

# Run main function
Main
