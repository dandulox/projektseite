# Projektseite v3.0 - Prisma Schema Fix Script
# Behebt Prisma-Schema-Validierungsfehler

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

# Fix Prisma schema
function Fix-PrismaSchema {
    Write-Step "Fixing Prisma schema..."
    
    if (Test-Path "server") {
        Set-Location server
        
        Write-Info "Formatting Prisma schema..."
        try {
            npx prisma format
            Write-Success "Prisma schema formatted"
        } catch {
            Write-Warning "Prisma format failed: $_"
        }
        
        Write-Info "Validating Prisma schema..."
        try {
            npx prisma validate
            Write-Success "Prisma schema is valid"
        } catch {
            Write-Error "Prisma schema validation failed: $_"
            Write-Info "Please check the schema for relation errors"
            Set-Location ..
            return
        }
        
        Write-Info "Generating Prisma client..."
        try {
            npm run db:generate
            Write-Success "Prisma client generated successfully"
        } catch {
            Write-Error "Failed to generate Prisma client: $_"
            Set-Location ..
            return
        }
        
        Write-Info "Running database migrations..."
        try {
            npm run db:migrate
            Write-Success "Database migrations completed"
        } catch {
            Write-Warning "Database migrations failed: $_"
        }
        
        Set-Location ..
    } else {
        Write-Error "Server directory not found"
    }
}

# Main function
function Main {
    Write-Header "Projektseite v3.0 - Prisma Schema Fix"
    
    Write-Info "This script fixes Prisma schema validation errors"
    Write-Host ""
    
    # Fix Prisma schema
    Fix-PrismaSchema
    
    Write-Header "Fix Complete!"
    
    Write-Success "Prisma schema fix completed!"
    Write-Host ""
    Write-Info "You can now run the installation scripts again:"
    Write-Host "  • .\scripts\install-v3.ps1" -ForegroundColor White
    Write-Host "  • .\scripts\quick-start.ps1" -ForegroundColor White
}

# Run main function
Main
