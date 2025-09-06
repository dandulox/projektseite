# Projektseite v3.0 - Vollständiges Installations- und Validierungsscript
# Automatisiertes Setup, Build und Test der neuen Architektur

# Set execution policy for this session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

param(
    [string]$Environment = "development",
    [switch]$SkipTests = $false,
    [switch]$SkipDocker = $false,
    [switch]$Force = $false
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

# Update repository
function Update-Repository {
    Write-Step "Updating repository..."
    
    if (Test-Path ".git") {
        Write-Info "Pulling latest changes..."
        git pull origin main
        
        Write-Info "Checking for submodules..."
        if (Test-Path ".gitmodules") {
            git submodule update --init --recursive
        }
        
        Write-Success "Repository updated"
    } else {
        Write-Warning "Not a git repository, skipping update"
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

# Check prerequisites
function Test-Prerequisites {
    Write-Step "Checking prerequisites..."
    
    $prerequisites = @{
        "Node.js" = @{ Command = "node"; MinVersion = 18 }
        "npm" = @{ Command = "npm"; MinVersion = 8 }
        "Docker" = @{ Command = "docker"; MinVersion = 20 }
        "Docker Compose" = @{ Command = "docker-compose"; MinVersion = 2 }
    }
    
    $allGood = $true
    
    foreach ($prereq in $prerequisites.GetEnumerator()) {
        if (Test-Command $prereq.Value.Command) {
            Write-Success "$($prereq.Key) is installed"
        } else {
            Write-Error "$($prereq.Key) is not installed"
            $allGood = $false
        }
    }
    
    if (-not $allGood) {
        Write-Error "Missing prerequisites. Please install required tools first."
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

# Validate project structure
function Test-ProjectStructure {
    Write-Step "Validating project structure..."
    
    $requiredDirs = @("shared", "server", "client", "docker", "docs", "scripts")
    $requiredFiles = @(
        "shared/package.json",
        "server/package.json", 
        "client/package.json",
        "docker/docker-compose.yml",
        "README.md"
    )
    
    $allGood = $true
    
    foreach ($dir in $requiredDirs) {
        if (Test-Path $dir) {
            Write-Success "Directory '$dir' exists"
        } else {
            Write-Error "Directory '$dir' is missing"
            $allGood = $false
        }
    }
    
    foreach ($file in $requiredFiles) {
        if (Test-Path $file) {
            Write-Success "File '$file' exists"
        } else {
            Write-Error "File '$file' is missing"
            $allGood = $false
        }
    }
    
    if (-not $allGood) {
        Write-Error "Project structure validation failed"
        exit 1
    }
    
    Write-Success "Project structure is valid"
}

# Setup shared module
function Install-Shared {
    Write-Step "Setting up shared module..."
    
    Set-Location shared
    
    try {
        Write-Info "Installing dependencies..."
        npm install --include=dev
        
        Write-Info "Building shared module..."
        npm run build
        
        Write-Success "Shared module setup complete"
    }
    catch {
        Write-Error "Shared module setup failed: $_"
        Set-Location ..
        exit 1
    }
    
    Set-Location ..
}

# Setup backend
function Install-Backend {
    Write-Step "Setting up backend..."
    
    Set-Location server
    
    try {
        Write-Info "Installing dependencies..."
        npm install --include=dev
        
        Write-Info "Setting up environment..."
        if (-not (Test-Path ".env")) {
            if (Test-Path "env.example") {
                Copy-Item "env.example" ".env"
                Write-Info "Created .env file from env.example"
            } else {
                Write-Warning "No env.example found, creating basic .env"
                @"
NODE_ENV=$Environment
PORT=3001
DATABASE_URL="postgresql://dev:dev_password@localhost:5433/projektseite_dev"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"
FRONTEND_URL="http://localhost:3000"
LOG_LEVEL="info"
"@ | Out-File -FilePath ".env" -Encoding UTF8
            }
        }
        
        Write-Info "Generating Prisma client..."
        npm run db:generate
        
        Write-Success "Backend setup complete"
    }
    catch {
        Write-Error "Backend setup failed: $_"
        Set-Location ..
        exit 1
    }
    
    Set-Location ..
}

# Setup frontend
function Install-Frontend {
    Write-Step "Setting up frontend..."
    
    Set-Location client
    
    try {
        Write-Info "Installing dependencies..."
        npm install --include=dev
        
        Write-Info "Setting up environment..."
        if (-not (Test-Path ".env")) {
            if (Test-Path ".env.example") {
                Copy-Item ".env.example" ".env"
                Write-Info "Created .env file from .env.example"
            } else {
                Write-Warning "No .env.example found, creating basic .env"
                @"
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=$Environment
"@ | Out-File -FilePath ".env" -Encoding UTF8
            }
        }
        
        Write-Success "Frontend setup complete"
    }
    catch {
        Write-Error "Frontend setup failed: $_"
        Set-Location ..
        exit 1
    }
    
    Set-Location ..
}

# Setup database
function Setup-Database {
    Write-Step "Setting up database..."
    
    if (-not $SkipDocker) {
        Write-Info "Starting PostgreSQL with Docker..."
        Set-Location docker
        docker-compose -f docker-compose.dev.yml up -d postgres-dev
        Set-Location ..
    }
    
    Set-Location server
    
    # Wait for database to be ready
    Write-Info "Waiting for database to be ready..."
    $maxAttempts = 30
    $delay = 2
    $attempt = 1
    
    while ($attempt -le $maxAttempts) {
        Write-Info "Attempt $attempt/$maxAttempts - Testing database connection..."
        
        try {
            $result = Test-NetConnection -ComputerName "localhost" -Port 5433 -InformationLevel Quiet
            if ($result) {
                Write-Success "Database is ready!"
                break
            }
        } catch {
            # Connection failed, continue waiting
        }
        
        Write-Info "Database not ready yet, waiting $delay seconds..."
        Start-Sleep -Seconds $delay
        $attempt++
    }
    
    if ($attempt -gt $maxAttempts) {
        Write-Error "Database did not become ready within timeout"
        Write-Info "Please check Docker containers:"
        Write-Host "  • docker ps" -ForegroundColor White
        Write-Host "  • docker logs projektseite-postgres-dev" -ForegroundColor White
        Set-Location ..
        exit 1
    }
    
    try {
        Write-Info "Running database migrations..."
        npm run db:migrate
        
        if ($Environment -ne "production") {
            Write-Info "Seeding database with test data..."
            npm run db:seed
        }
        
        Write-Success "Database setup complete"
    }
    catch {
        Write-Error "Database setup failed: $_"
        Set-Location ..
        exit 1
    }
    
    Set-Location ..
}

# Build applications
function Build-Applications {
    Write-Step "Building applications..."
    
    try {
        Write-Info "Building shared module..."
        Set-Location shared
        npm run build
        Set-Location ..
        
        Write-Info "Building backend..."
        Set-Location server
        npm run build
        Set-Location ..
        
        Write-Info "Building frontend..."
        Set-Location client
        npm run build
        Set-Location ..
        
        Write-Success "All applications built successfully"
    }
    catch {
        Write-Error "Build failed: $_"
        exit 1
    }
}

# Run tests
function Invoke-Tests {
    if ($SkipTests) {
        Write-Warning "Skipping tests as requested"
        return
    }
    
    Write-Step "Running tests..."
    
    try {
        Write-Info "Running backend tests..."
        Set-Location server
        npm run test:ci
        Set-Location ..
        
        Write-Info "Running frontend tests..."
        Set-Location client
        npm run test
        Set-Location ..
        
        Write-Success "All tests passed"
    }
    catch {
        Write-Error "Tests failed: $_"
        if (-not $Force) {
            exit 1
        } else {
            Write-Warning "Continuing despite test failures (--Force flag)"
        }
    }
}

# Validate installation
function Test-Installation {
    Write-Step "Validating installation..."
    
    try {
        Write-Info "Testing shared module..."
        Set-Location shared
        node -e "console.log('Shared module:', require('./dist/index.js'))"
        Set-Location ..
        
        Write-Info "Testing backend build..."
        Set-Location server
        if (Test-Path "dist/server.js") {
            Write-Success "Backend build exists"
        } else {
            throw "Backend build not found"
        }
        Set-Location ..
        
        Write-Info "Testing frontend build..."
        Set-Location client
        if (Test-Path "dist") {
            Write-Success "Frontend build exists"
        } else {
            throw "Frontend build not found"
        }
        Set-Location ..
        
        Write-Success "Installation validation complete"
    }
    catch {
        Write-Error "Installation validation failed: $_"
        exit 1
    }
}

# Start development environment
function Start-Development {
    if ($Environment -eq "production") {
        Write-Info "Production environment - skipping development startup"
        return
    }
    
    Write-Step "Starting development environment..."
    
    try {
        if (-not $SkipDocker) {
            Write-Info "Starting Docker services..."
            Set-Location docker
            docker-compose -f docker-compose.dev.yml up -d
            Set-Location ..
        }
        
        Write-Success "Development environment started"
        Write-Info "Services available at:"
        Write-Host "  Frontend: http://localhost:3000" -ForegroundColor $White
        Write-Host "  Backend:  http://localhost:3001/api" -ForegroundColor $White
        Write-Host "  Health:   http://localhost:3001/health" -ForegroundColor $White
        Write-Host "  pgAdmin:  http://localhost:5050" -ForegroundColor $White
        Write-Host "  Redis:    http://localhost:8081" -ForegroundColor $White
        Write-Host "  Mailhog:  http://localhost:8025" -ForegroundColor $White
    }
    catch {
        Write-Error "Failed to start development environment: $_"
    }
}

# Main installation function
function Main {
    Write-Header "Projektseite v3.0 - Complete Installation & Validation"
    
    Write-Info "Environment: $Environment"
    Write-Info "Skip Tests: $SkipTests"
    Write-Info "Skip Docker: $SkipDocker"
    Write-Info "Force Mode: $Force"
    Write-Host ""
    
    # Step 1: Update repository
    Update-Repository
    
    # Step 2: Set script permissions
    Set-ScriptPermissions
    
    # Step 3: Check prerequisites
    Test-Prerequisites
    
    # Step 4: Validate project structure
    Test-ProjectStructure
    
    # Step 5: Install shared module
    Install-Shared
    
    # Step 6: Install backend
    Install-Backend
    
    # Step 7: Install frontend
    Install-Frontend
    
    # Step 8: Setup database
    Setup-Database
    
    # Step 9: Build applications
    Build-Applications
    
    # Step 10: Run tests
    Invoke-Tests
    
    # Step 11: Validate installation
    Test-Installation
    
    # Step 12: Start development environment
    Start-Development
    
    Write-Header "Installation Complete!"
    
    Write-Success "Projektseite v3.0 has been successfully installed and validated!"
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
    Write-Host ""
    Write-Info "For production deployment, see docs/DEPLOYMENT.md"
}

# Run main function
Main
