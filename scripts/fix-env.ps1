# Projektseite v3.0 - Environment Fix Script
# Korrigiert die .env-Dateien mit den richtigen Ports

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

# Fix server .env
function Fix-ServerEnv {
    Write-Step "Fixing server .env file..."
    
    if (Test-Path "server") {
        Set-Location server
        
        $envContent = @"
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://dev:dev_password@localhost:5433/projektseite_dev"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"
FRONTEND_URL="http://localhost:3000"
LOG_LEVEL="info"
"@
        
        $envContent | Out-File -FilePath ".env" -Encoding UTF8 -Force
        Write-Success "Server .env file created with correct database URL (Port 5433)"
        
        Set-Location ..
    } else {
        Write-Error "Server directory not found"
    }
}

# Fix client .env
function Fix-ClientEnv {
    Write-Step "Fixing client .env file..."
    
    if (Test-Path "client") {
        Set-Location client
        
        $envContent = @"
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
"@
        
        $envContent | Out-File -FilePath ".env" -Encoding UTF8 -Force
        Write-Success "Client .env file created"
        
        Set-Location ..
    } else {
        Write-Error "Client directory not found"
    }
}

# Main function
function Main {
    Write-Header "Projektseite v3.0 - Environment Fix"
    
    Write-Info "This script fixes .env files with correct database configuration"
    Write-Host ""
    
    # Fix environment files
    Fix-ServerEnv
    Fix-ClientEnv
    
    Write-Header "Fix Complete!"
    
    Write-Success "Environment files fixed!"
    Write-Host ""
    Write-Info "You can now run the installation scripts again:"
    Write-Host "  • .\scripts\install-v3.ps1" -ForegroundColor White
    Write-Host "  • .\scripts\quick-start.ps1" -ForegroundColor White
}

# Run main function
Main
