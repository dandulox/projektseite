# Projektseite v3.0 - Dockerfiles Fix Script
# Erstellt fehlende Dockerfiles für Development

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

# Create server Dockerfile.dev
function Create-ServerDockerfile {
    Write-Step "Creating server Dockerfile.dev..."
    
    if (Test-Path "server") {
        $dockerfileContent = @"
# Development Dockerfile for Backend
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --include=dev

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start development server
CMD ["npm", "run", "dev"]
"@
        
        $dockerfileContent | Out-File -FilePath "server\Dockerfile.dev" -Encoding UTF8
        Write-Success "Server Dockerfile.dev created"
    } else {
        Write-Error "Server directory not found"
    }
}

# Create client Dockerfile.dev
function Create-ClientDockerfile {
    Write-Step "Creating client Dockerfile.dev..."
    
    if (Test-Path "client") {
        $dockerfileContent = @"
# Development Dockerfile for Frontend
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --include=dev

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
"@
        
        $dockerfileContent | Out-File -FilePath "client\Dockerfile.dev" -Encoding UTF8
        Write-Success "Client Dockerfile.dev created"
    } else {
        Write-Error "Client directory not found"
    }
}

# Main function
function Main {
    Write-Header "Projektseite v3.0 - Dockerfiles Fix"
    
    Write-Info "This script creates missing Dockerfiles for development"
    Write-Host ""
    
    # Create Dockerfiles
    Create-ServerDockerfile
    Create-ClientDockerfile
    
    Write-Header "Fix Complete!"
    
    Write-Success "Dockerfiles created!"
    Write-Host ""
    Write-Info "You can now run the installation scripts again:"
    Write-Host "  • .\scripts\install-v3.ps1" -ForegroundColor White
    Write-Host "  • .\scripts\quick-start.ps1" -ForegroundColor White
}

# Run main function
Main
