# Projektseite v3.0 - Quick Start Script
# Schneller Start für Development

param(
    [switch]$SkipValidation = $false,
    [switch]$SkipDocker = $false
)

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
    Write-Host ""
    Write-Host "================================================" -ForegroundColor $Blue
    Write-Host "  $Text" -ForegroundColor $Blue
    Write-Host "================================================" -ForegroundColor $Blue
    Write-Host ""
}

function Write-Step {
    param([string]$Text)
    Write-Host "🚀 $Text" -ForegroundColor $Yellow
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

# Quick validation
function Test-QuickValidation {
    Write-Step "Quick validation..."
    
    $required = @("shared", "server", "client", "docker")
    $allGood = $true
    
    foreach ($dir in $required) {
        if (Test-Path $dir) {
            Write-Success "Directory '$dir' exists"
        } else {
            Write-Error "Directory '$dir' missing"
            $allGood = $false
        }
    }
    
    if (-not $allGood) {
        Write-Error "Project structure incomplete. Run install-v3.ps1 first."
        exit 1
    }
}

# Install dependencies
function Install-Dependencies {
    Write-Step "Installing dependencies..."
    
    # Shared
    Write-Info "Installing shared dependencies..."
    Set-Location shared
    npm install --silent
    Set-Location ..
    
    # Server
    Write-Info "Installing server dependencies..."
    Set-Location server
    npm install --silent
    Set-Location ..
    
    # Client
    Write-Info "Installing client dependencies..."
    Set-Location client
    npm install --silent
    Set-Location ..
    
    Write-Success "Dependencies installed"
}

# Setup environment
function Setup-Environment {
    Write-Step "Setting up environment..."
    
    # Server environment
    if (-not (Test-Path "server/.env")) {
        Write-Info "Creating server .env file..."
        @"
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://admin:secure_password_123@localhost:5432/projektseite"
JWT_SECRET="dev-jwt-secret-key"
JWT_EXPIRES_IN="24h"
FRONTEND_URL="http://localhost:3000"
LOG_LEVEL="info"
"@ | Out-File -FilePath "server/.env" -Encoding UTF8
    }
    
    # Client environment
    if (-not (Test-Path "client/.env")) {
        Write-Info "Creating client .env file..."
        @"
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
"@ | Out-File -FilePath "client/.env" -Encoding UTF8
    }
    
    Write-Success "Environment configured"
}

# Start Docker services
function Start-DockerServices {
    if ($SkipDocker) {
        Write-Info "Skipping Docker services"
        return
    }
    
    Write-Step "Starting Docker services..."
    
    Set-Location docker
    docker-compose -f docker-compose.dev.yml up -d postgres-dev redis-dev
    Set-Location ..
    
    Write-Info "Waiting for services to start..."
    Start-Sleep -Seconds 5
    
    Write-Success "Docker services started"
}

# Setup database
function Setup-Database {
    Write-Step "Setting up database..."
    
    Set-Location server
    
    try {
        Write-Info "Generating Prisma client..."
        npm run db:generate --silent
        
        Write-Info "Running migrations..."
        npm run db:migrate --silent
        
        Write-Info "Seeding database..."
        npm run db:seed --silent
        
        Write-Success "Database ready"
    }
    catch {
        Write-Error "Database setup failed: $_"
        Set-Location ..
        exit 1
    }
    
    Set-Location ..
}

# Build shared module
function Build-Shared {
    Write-Step "Building shared module..."
    
    Set-Location shared
    npm run build --silent
    Set-Location ..
    
    Write-Success "Shared module built"
}

# Start development servers
function Start-DevelopmentServers {
    Write-Step "Starting development servers..."
    
    Write-Info "Starting backend server..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm run dev" -WindowStyle Normal
    
    Start-Sleep -Seconds 2
    
    Write-Info "Starting frontend server..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm run dev" -WindowStyle Normal
    
    Write-Success "Development servers started"
}

# Show access information
function Show-AccessInfo {
    Write-Header "Quick Start Complete!"
    
    Write-Success "Projektseite v3.0 is now running!"
    Write-Host ""
    Write-Info "Access URLs:"
    Write-Host "  🌐 Frontend: http://localhost:3000" -ForegroundColor $White
    Write-Host "  🔧 Backend:  http://localhost:3001/api" -ForegroundColor $White
    Write-Host "  ❤️  Health:   http://localhost:3001/health" -ForegroundColor $White
    Write-Host ""
    Write-Info "Admin Tools:"
    Write-Host "  🗄️  pgAdmin:  http://localhost:5050" -ForegroundColor $White
    Write-Host "  🔴 Redis:    http://localhost:8081" -ForegroundColor $White
    Write-Host "  📧 Mailhog:  http://localhost:8025" -ForegroundColor $White
    Write-Host ""
    Write-Info "Login Credentials:"
    Write-Host "  👤 Admin: admin@projektseite.de / admin123" -ForegroundColor $White
    Write-Host "  👤 User:  user@projektseite.de / user123" -ForegroundColor $White
    Write-Host ""
    Write-Info "Development servers are running in separate windows."
    Write-Info "Press Ctrl+C in those windows to stop the servers."
    Write-Host ""
    Write-Warning "To stop all services:"
    Write-Host "  docker-compose -f docker/docker-compose.dev.yml down" -ForegroundColor $White
}

# Main function
function Main {
    Write-Header "Projektseite v3.0 - Quick Start"
    
    Write-Info "Skip Validation: $SkipValidation"
    Write-Info "Skip Docker: $SkipDocker"
    Write-Host ""
    
    # Quick validation
    if (-not $SkipValidation) {
        Test-QuickValidation
    }
    
    # Install dependencies
    Install-Dependencies
    
    # Setup environment
    Setup-Environment
    
    # Start Docker services
    Start-DockerServices
    
    # Setup database
    Setup-Database
    
    # Build shared module
    Build-Shared
    
    # Start development servers
    Start-DevelopmentServers
    
    # Show access information
    Show-AccessInfo
}

# Run main function
Main
