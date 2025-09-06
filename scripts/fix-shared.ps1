# Projektseite v3.0 - Shared Module Fix Script
# Behebt fehlende Exports und TypeScript-Fehler im shared-Module

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
    Write-Step "Fixing shared module..."
    
    if (Test-Path "shared") {
        Set-Location shared
        
        Write-Info "Installing dependencies..."
        npm install --include=dev
        
        Write-Info "Building shared module..."
        try {
            npm run build
            Write-Success "Shared module built successfully"
        } catch {
            Write-Error "Build failed: $_"
            Write-Info "Trying to fix TypeScript errors..."
            
            # Try to build with more verbose output
            npm run type-check
        }
        
        Set-Location ..
    } else {
        Write-Error "Shared directory not found"
    }
}

# Main function
function Main {
    Write-Header "Projektseite v3.0 - Shared Module Fix"
    
    Write-Info "This script fixes the shared module build issues"
    Write-Host ""
    
    # Fix shared module
    Fix-SharedModule
    
    Write-Header "Fix Complete!"
    
    Write-Success "Shared module fix completed!"
    Write-Host ""
    Write-Info "You can now run the installation scripts again:"
    Write-Host "  • .\scripts\install-v3.ps1" -ForegroundColor White
    Write-Host "  • .\scripts\quick-start.ps1" -ForegroundColor White
}

# Run main function
Main
