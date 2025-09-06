# Projektseite v3.0 - Dependency Fix Script
# Behebt fehlende devDependencies

# Set execution policy for this session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

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
    Write-Host "🔧 $Text" -ForegroundColor $Yellow
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

# Fix shared module
function Fix-SharedModule {
    Write-Step "Fixing shared module dependencies..."
    
    if (Test-Path "shared") {
        Set-Location shared
        
        Write-Info "Installing devDependencies for shared module..."
        npm install --include=dev
        
        Write-Info "Building shared module..."
        npm run build
        
        Write-Success "Shared module fixed"
        Set-Location ..
    } else {
        Write-Error "Shared directory not found"
    }
}

# Fix server module
function Fix-ServerModule {
    Write-Step "Fixing server module dependencies..."
    
    if (Test-Path "server") {
        Set-Location server
        
        Write-Info "Installing devDependencies for server module..."
        npm install --include=dev
        
        Write-Success "Server module fixed"
        Set-Location ..
    } else {
        Write-Error "Server directory not found"
    }
}

# Fix client module
function Fix-ClientModule {
    Write-Step "Fixing client module dependencies..."
    
    if (Test-Path "client") {
        Set-Location client
        
        Write-Info "Installing devDependencies for client module..."
        npm install --include=dev
        
        Write-Success "Client module fixed"
        Set-Location ..
    } else {
        Write-Error "Client directory not found"
    }
}

# Main function
function Main {
    Write-Header "Projektseite v3.0 - Dependency Fix"
    
    Write-Info "This script fixes missing devDependencies that cause build failures"
    Write-Host ""
    
    # Fix all modules
    Fix-SharedModule
    Fix-ServerModule
    Fix-ClientModule
    
    Write-Header "Fix Complete!"
    
    Write-Success "All dependencies have been fixed!"
    Write-Host ""
    Write-Info "You can now run the installation scripts again:"
    Write-Host "  • .\scripts\install-v3.ps1" -ForegroundColor White
    Write-Host "  • .\scripts\quick-start.ps1" -ForegroundColor White
}

# Run main function
Main
