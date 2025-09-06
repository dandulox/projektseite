# Setup Script für Projektseite v3.0 (PowerShell)
# Automatisiertes Setup für Development und Production

param(
    [string]$Environment = "development",
    [switch]$SkipTests = $false
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$White = "White"

# Functions
function Write-Header {
    param([string]$Text)
    Write-Host "================================" -ForegroundColor $Blue
    Write-Host "  $Text" -ForegroundColor $Blue
    Write-Host "================================" -ForegroundColor $Blue
}

function Write-Step {
    param([string]$Text)
    Write-Host "➤ $Text" -ForegroundColor $Yellow
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
    Write-Host "ℹ️  $Text" -ForegroundColor $Blue
}

# Check if command exists
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Check prerequisites
function Test-Prerequisites {
    Write-Step "Checking prerequisites..."
    
    if (-not (Test-Command "node")) {
        Write-Error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    }
    
    if (-not (Test-Command "npm")) {
        Write-Error "npm is not installed. Please install npm first."
        exit 1
    }
    
    if (-not (Test-Command "docker")) {
        Write-Error "Docker is not installed. Please install Docker first."
        exit 1
    }
    
    if (-not (Test-Command "docker-compose")) {
        Write-Error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    }
    
    # Check Node.js version
    $NodeVersion = (node -v).Substring(1).Split('.')[0]
    if ([int]$NodeVersion -lt 18) {
        Write-Error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    }
    
    Write-Success "All prerequisites are met"
}

# Setup shared module
function Setup-Shared {
    Write-Step "Setting up shared module..."
    
    Set-Location shared
    npm install
    npm run build
    
    Write-Success "Shared module setup complete"
    Set-Location ..
}

# Setup backend
function Setup-Backend {
    Write-Step "Setting up backend..."
    
    Set-Location server
    
    # Install dependencies
    npm install
    
    # Copy environment file
    if (-not (Test-Path ".env")) {
        Copy-Item "env.example" ".env"
        Write-Info "Created .env file from env.example"
    }
    
    # Generate Prisma client
    npm run db:generate
    
    Write-Success "Backend setup complete"
    Set-Location ..
}

# Setup frontend
function Setup-Frontend {
    Write-Step "Setting up frontend..."
    
    Set-Location client
    
    # Install dependencies
    npm install
    
    # Copy environment file
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
        } else {
            "REACT_APP_API_URL=http://localhost:3001/api" | Out-File -FilePath ".env" -Encoding UTF8
        }
        Write-Info "Created .env file"
    }
    
    Write-Success "Frontend setup complete"
    Set-Location ..
}

# Setup database
function Setup-Database {
    Write-Step "Setting up database..."
    
    Set-Location server
    
    # Check if database is running
    $PostgresRunning = docker ps | Select-String "postgres"
    if (-not $PostgresRunning) {
        Write-Info "Starting PostgreSQL database..."
        Set-Location ..
        docker-compose -f docker/docker-compose.dev.yml up -d postgres-dev
        Start-Sleep -Seconds 10
        Set-Location server
    }
    
    # Run migrations
    npm run db:migrate
    
    # Seed database (only in development)
    if ($Environment -ne "production") {
        Write-Info "Seeding database with test data..."
        npm run db:seed
    }
    
    Write-Success "Database setup complete"
    Set-Location ..
}

# Setup Docker
function Setup-Docker {
    Write-Step "Setting up Docker containers..."
    
    Set-Location docker
    
    # Build and start development containers
    docker-compose -f docker-compose.dev.yml up -d --build
    
    Write-Success "Docker containers started"
    Set-Location ..
}

# Run tests
function Invoke-Tests {
    Write-Step "Running tests..."
    
    Set-Location server
    npm run test:ci
    Set-Location ..
    
    Write-Success "All tests passed"
}

# Main setup function
function Main {
    Write-Header "Projektseite v3.0 Setup"
    
    Write-Info "Setting up for environment: $Environment"
    
    # Check prerequisites
    Test-Prerequisites
    
    # Setup modules
    Setup-Shared
    Setup-Backend
    Setup-Frontend
    
    # Setup database
    Setup-Database
    
    # Setup Docker (optional)
    if ($Environment -eq "development") {
        Setup-Docker
    }
    
    # Run tests
    if (-not $SkipTests) {
        Invoke-Tests
    }
    
    Write-Success "Setup completed successfully!"
    
    Write-Host ""
    Write-Info "Next steps:"
    Write-Host "  1. Start development servers:" -ForegroundColor $White
    Write-Host "     Backend:  cd server && npm run dev" -ForegroundColor $White
    Write-Host "     Frontend: cd client && npm run dev" -ForegroundColor $White
    Write-Host ""
    Write-Host "  2. Access the application:" -ForegroundColor $White
    Write-Host "     Frontend: http://localhost:3000" -ForegroundColor $White
    Write-Host "     Backend:  http://localhost:3001/api" -ForegroundColor $White
    Write-Host "     Health:   http://localhost:3001/health" -ForegroundColor $White
    Write-Host ""
    Write-Host "  3. Admin credentials (development only):" -ForegroundColor $White
    Write-Host "     Email:    admin@projektseite.de" -ForegroundColor $White
    Write-Host "     Password: admin123" -ForegroundColor $White
    Write-Host ""
    Write-Host "  4. Docker services:" -ForegroundColor $White
    Write-Host "     pgAdmin:  http://localhost:5050" -ForegroundColor $White
    Write-Host "     Redis:    http://localhost:8081" -ForegroundColor $White
    Write-Host "     Mailhog:  http://localhost:8025" -ForegroundColor $White
}

# Run main function
Main
