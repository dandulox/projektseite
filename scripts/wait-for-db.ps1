# Projektseite v3.0 - Database Wait Script
# Wartet bis die PostgreSQL-Datenbank bereit ist

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

# Wait for database
function Wait-ForDatabase {
    param(
        [string]$Host = "localhost",
        [int]$Port = 5433,
        [int]$MaxAttempts = 30,
        [int]$DelaySeconds = 2
    )
    
    Write-Step "Waiting for PostgreSQL database to be ready..."
    Write-Info "Host: $Host, Port: $Port"
    Write-Info "Max attempts: $MaxAttempts, Delay: $DelaySeconds seconds"
    
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        Write-Info "Attempt $i/$MaxAttempts - Testing database connection..."
        
        try {
            # Test connection using Test-NetConnection
            $result = Test-NetConnection -ComputerName $Host -Port $Port -InformationLevel Quiet
            
            if ($result) {
                Write-Success "Database is ready and accepting connections!"
                return $true
            } else {
                Write-Info "Database not ready yet, waiting $DelaySeconds seconds..."
                Start-Sleep -Seconds $DelaySeconds
            }
        } catch {
            Write-Info "Connection test failed, waiting $DelaySeconds seconds..."
            Start-Sleep -Seconds $DelaySeconds
        }
    }
    
    Write-Error "Database did not become ready within the timeout period"
    return $false
}

# Main function
function Main {
    Write-Header "Projektseite v3.0 - Database Wait"
    
    Write-Info "This script waits for the PostgreSQL database to be ready"
    Write-Host ""
    
    # Wait for database
    if (Wait-ForDatabase) {
        Write-Success "Database is ready! You can now run migrations."
        Write-Host ""
        Write-Info "Next steps:"
        Write-Host "  • cd server" -ForegroundColor White
        Write-Host "  • npm run db:migrate" -ForegroundColor White
        Write-Host "  • npm run db:seed" -ForegroundColor White
    } else {
        Write-Error "Database is not ready. Please check Docker containers:"
        Write-Host "  • docker ps" -ForegroundColor White
        Write-Host "  • docker logs projektseite-postgres-dev" -ForegroundColor White
    }
}

# Run main function
Main
