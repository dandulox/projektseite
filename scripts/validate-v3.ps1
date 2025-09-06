# Projektseite v3.0 - Architektur Validierungsscript
# Testet alle Komponenten der neuen Architektur

# Set execution policy for this session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

param(
    [switch]$Quick = $false,
    [switch]$Verbose = $false,
    [switch]$Update = $false
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
    Write-Host "🔍 $Text" -ForegroundColor $Yellow
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

# Update repository
function Update-Repository {
    if ($Update) {
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
}

# Test results tracking
$TestResults = @{
    Passed = 0
    Failed = 0
    Warnings = 0
}

function Add-TestResult {
    param([string]$Test, [string]$Status, [string]$Message = "")
    
    switch ($Status) {
        "PASS" { 
            $TestResults.Passed++
            Write-Success "$Test - $Message"
        }
        "FAIL" { 
            $TestResults.Failed++
            Write-Error "$Test - $Message"
        }
        "WARN" { 
            $TestResults.Warnings++
            Write-Warning "$Test - $Message"
        }
    }
}

# Validate project structure
function Test-ProjectStructure {
    Write-Step "Validating project structure..."
    
    $structure = @{
        "shared/" = @("package.json", "tsconfig.json", "index.ts")
        "server/" = @("package.json", "tsconfig.json", "Dockerfile", "prisma/schema.prisma")
        "client/" = @("package.json", "vite.config.ts", "tailwind.config.js")
        "docker/" = @("docker-compose.yml", "docker-compose.dev.yml", "nginx/nginx.conf")
        "docs/" = @("API.md", "DEPLOYMENT.md", "ADRs/")
        "scripts/" = @("install-v3.ps1", "validate-v3.ps1")
    }
    
    foreach ($dir in $structure.GetEnumerator()) {
        if (Test-Path $dir.Key) {
            Add-TestResult "Directory $($dir.Key)" "PASS" "Exists"
            
            foreach ($file in $dir.Value) {
                $filePath = Join-Path $dir.Key $file
                if (Test-Path $filePath) {
                    Add-TestResult "File $filePath" "PASS" "Exists"
                } else {
                    Add-TestResult "File $filePath" "FAIL" "Missing"
                }
            }
        } else {
            Add-TestResult "Directory $($dir.Key)" "FAIL" "Missing"
        }
    }
}

# Validate package.json files
function Test-PackageJson {
    Write-Step "Validating package.json files..."
    
    $packages = @("shared", "server", "client")
    
    foreach ($pkg in $packages) {
        $packagePath = Join-Path $pkg "package.json"
        
        if (Test-Path $packagePath) {
            try {
                $package = Get-Content $packagePath | ConvertFrom-Json
                
                # Check required fields
                $requiredFields = @("name", "version", "scripts")
                foreach ($field in $requiredFields) {
                    if ($package.PSObject.Properties.Name -contains $field) {
                        Add-TestResult "Package $pkg.$field" "PASS" "Present"
                    } else {
                        Add-TestResult "Package $pkg.$field" "FAIL" "Missing"
                    }
                }
                
                # Check scripts
                if ($package.scripts) {
                    $requiredScripts = @("build", "test")
                    foreach ($script in $requiredScripts) {
                        if ($package.scripts.PSObject.Properties.Name -contains $script) {
                            Add-TestResult "Package $pkg.scripts.$script" "PASS" "Present"
                        } else {
                            Add-TestResult "Package $pkg.scripts.$script" "WARN" "Missing"
                        }
                    }
                }
                
            } catch {
                Add-TestResult "Package $pkg" "FAIL" "Invalid JSON: $_"
            }
        } else {
            Add-TestResult "Package $pkg" "FAIL" "package.json not found"
        }
    }
}

# Validate TypeScript configuration
function Test-TypeScriptConfig {
    Write-Step "Validating TypeScript configuration..."
    
    $tsconfigs = @("shared/tsconfig.json", "server/tsconfig.json", "client/tsconfig.json")
    
    foreach ($tsconfig in $tsconfigs) {
        if (Test-Path $tsconfig) {
            try {
                $config = Get-Content $tsconfig | ConvertFrom-Json
                
                # Check required compiler options
                $requiredOptions = @("target", "module", "strict")
                foreach ($option in $requiredOptions) {
                    if ($config.compilerOptions.PSObject.Properties.Name -contains $option) {
                        Add-TestResult "TSConfig $tsconfig.$option" "PASS" "Present"
                    } else {
                        Add-TestResult "TSConfig $tsconfig.$option" "WARN" "Missing"
                    }
                }
                
            } catch {
                Add-TestResult "TSConfig $tsconfig" "FAIL" "Invalid JSON: $_"
            }
        } else {
            Add-TestResult "TSConfig $tsconfig" "FAIL" "Not found"
        }
    }
}

# Validate Docker configuration
function Test-DockerConfig {
    Write-Step "Validating Docker configuration..."
    
    $dockerFiles = @(
        "docker/docker-compose.yml",
        "docker/docker-compose.dev.yml",
        "server/Dockerfile",
        "server/Dockerfile.dev"
    )
    
    foreach ($file in $dockerFiles) {
        if (Test-Path $file) {
            Add-TestResult "Docker $file" "PASS" "Exists"
            
            # Check for required services in compose files
            if ($file -like "*.yml") {
                $content = Get-Content $file -Raw
                if ($content -match "services:") {
                    Add-TestResult "Docker $file services" "PASS" "Has services section"
                } else {
                    Add-TestResult "Docker $file services" "FAIL" "Missing services section"
                }
            }
        } else {
            Add-TestResult "Docker $file" "FAIL" "Not found"
        }
    }
}

# Validate Prisma schema
function Test-PrismaSchema {
    Write-Step "Validating Prisma schema..."
    
    $schemaPath = "server/prisma/schema.prisma"
    
    if (Test-Path $schemaPath) {
        Add-TestResult "Prisma schema" "PASS" "Exists"
        
        $content = Get-Content $schemaPath -Raw
        
        # Check for required models
        $requiredModels = @("User", "Project", "Task", "Team", "Module")
        foreach ($model in $requiredModels) {
            if ($content -match "model $model") {
                Add-TestResult "Prisma model $model" "PASS" "Defined"
            } else {
                Add-TestResult "Prisma model $model" "FAIL" "Missing"
            }
        }
        
        # Check for database provider
        if ($content -match 'provider = "postgresql"') {
            Add-TestResult "Prisma provider" "PASS" "PostgreSQL configured"
        } else {
            Add-TestResult "Prisma provider" "FAIL" "PostgreSQL not configured"
        }
        
    } else {
        Add-TestResult "Prisma schema" "FAIL" "Not found"
    }
}

# Validate API structure
function Test-APIStructure {
    Write-Step "Validating API structure..."
    
    $apiStructure = @{
        "server/src/controllers/" = @("auth.controller.ts", "task.controller.ts", "project.controller.ts", "admin.controller.ts")
        "server/src/services/" = @("auth.service.ts", "task.service.ts", "project.service.ts", "admin.service.ts")
        "server/src/repositories/" = @("base.repository.ts", "user.repository.ts", "task.repository.ts", "project.repository.ts")
        "server/src/routes/" = @("auth.routes.ts", "task.routes.ts", "project.routes.ts", "admin.routes.ts")
        "server/src/middleware/" = @("auth.ts", "errorHandler.ts", "validation.ts")
    }
    
    foreach ($dir in $apiStructure.GetEnumerator()) {
        if (Test-Path $dir.Key) {
            Add-TestResult "API Directory $($dir.Key)" "PASS" "Exists"
            
            foreach ($file in $dir.Value) {
                $filePath = Join-Path $dir.Key $file
                if (Test-Path $filePath) {
                    Add-TestResult "API File $file" "PASS" "Exists"
                } else {
                    Add-TestResult "API File $file" "FAIL" "Missing"
                }
            }
        } else {
            Add-TestResult "API Directory $($dir.Key)" "FAIL" "Missing"
        }
    }
}

# Validate shared contracts
function Test-SharedContracts {
    Write-Step "Validating shared contracts..."
    
    $contracts = @(
        "shared/contracts/error.ts",
        "shared/contracts/validation.ts",
        "shared/types/index.ts",
        "shared/utils/index.ts"
    )
    
    foreach ($contract in $contracts) {
        if (Test-Path $contract) {
            Add-TestResult "Contract $contract" "PASS" "Exists"
            
            # Check for exports
            $content = Get-Content $contract -Raw
            if ($content -match "export") {
                Add-TestResult "Contract $contract exports" "PASS" "Has exports"
            } else {
                Add-TestResult "Contract $contract exports" "WARN" "No exports found"
            }
        } else {
            Add-TestResult "Contract $contract" "FAIL" "Not found"
        }
    }
}

# Validate documentation
function Test-Documentation {
    Write-Step "Validating documentation..."
    
    $docs = @(
        "README.md",
        "docs/API.md",
        "docs/DEPLOYMENT.md",
        "docs/ADRs/ADR-001-error-contract.md",
        "docs/ADRs/ADR-002-prisma-orm.md",
        "docs/ADRs/ADR-003-no-seeds-policy.md"
    )
    
    foreach ($doc in $docs) {
        if (Test-Path $doc) {
            Add-TestResult "Documentation $doc" "PASS" "Exists"
            
            # Check file size (should not be empty)
            $fileSize = (Get-Item $doc).Length
            if ($fileSize -gt 100) {
                Add-TestResult "Documentation $doc content" "PASS" "Has content ($fileSize bytes)"
            } else {
                Add-TestResult "Documentation $doc content" "WARN" "Very small file ($fileSize bytes)"
            }
        } else {
            Add-TestResult "Documentation $doc" "FAIL" "Not found"
        }
    }
}

# Test build process
function Test-BuildProcess {
    if ($Quick) {
        Write-Info "Skipping build tests (Quick mode)"
        return
    }
    
    Write-Step "Testing build process..."
    
    # Test shared module build
    try {
        Set-Location shared
        npm run build 2>$null
        if ($LASTEXITCODE -eq 0) {
            Add-TestResult "Shared build" "PASS" "Successful"
        } else {
            Add-TestResult "Shared build" "FAIL" "Failed with exit code $LASTEXITCODE"
        }
        Set-Location ..
    } catch {
        Add-TestResult "Shared build" "FAIL" "Exception: $_"
        Set-Location ..
    }
    
    # Test server build
    try {
        Set-Location server
        npm run build 2>$null
        if ($LASTEXITCODE -eq 0) {
            Add-TestResult "Server build" "PASS" "Successful"
        } else {
            Add-TestResult "Server build" "FAIL" "Failed with exit code $LASTEXITCODE"
        }
        Set-Location ..
    } catch {
        Add-TestResult "Server build" "FAIL" "Exception: $_"
        Set-Location ..
    }
}

# Test database schema
function Test-DatabaseSchema {
    Write-Step "Testing database schema..."
    
    $migrationPath = "server/prisma/migrations"
    if (Test-Path $migrationPath) {
        $migrations = Get-ChildItem $migrationPath -Directory
        if ($migrations.Count -gt 0) {
            Add-TestResult "Database migrations" "PASS" "$($migrations.Count) migrations found"
        } else {
            Add-TestResult "Database migrations" "WARN" "No migrations found"
        }
    } else {
        Add-TestResult "Database migrations" "FAIL" "Migrations directory not found"
    }
    
    $seedPath = "server/prisma/seed.ts"
    if (Test-Path $seedPath) {
        Add-TestResult "Database seed" "PASS" "Seed file exists"
    } else {
        Add-TestResult "Database seed" "WARN" "Seed file not found"
    }
}

# Generate validation report
function Show-ValidationReport {
    Write-Header "Validation Report"
    
    $total = $TestResults.Passed + $TestResults.Failed + $TestResults.Warnings
    
    Write-Host "Total Tests: $total" -ForegroundColor $White
    Write-Host "Passed: $($TestResults.Passed)" -ForegroundColor $Green
    Write-Host "Failed: $($TestResults.Failed)" -ForegroundColor $Red
    Write-Host "Warnings: $($TestResults.Warnings)" -ForegroundColor $Yellow
    Write-Host ""
    
    $successRate = [math]::Round(($TestResults.Passed / $total) * 100, 2)
    Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { $Green } elseif ($successRate -ge 70) { $Yellow } else { $Red })
    
    if ($TestResults.Failed -eq 0) {
        Write-Success "All critical tests passed! Architecture is valid."
    } elseif ($TestResults.Failed -le 3) {
        Write-Warning "Some tests failed, but architecture is mostly valid."
    } else {
        Write-Error "Multiple critical tests failed. Architecture needs attention."
    }
    
    Write-Host ""
    Write-Info "For detailed information, run with -Verbose flag"
}

# Main validation function
function Main {
    Write-Header "Projektseite v3.0 - Architecture Validation"
    
    Write-Info "Quick Mode: $Quick"
    Write-Info "Verbose Mode: $Verbose"
    Write-Info "Update Repository: $Update"
    Write-Host ""
    
    # Update repository
    Update-Repository
    
    # Run all validation tests
    Test-ProjectStructure
    Test-PackageJson
    Test-TypeScriptConfig
    Test-DockerConfig
    Test-PrismaSchema
    Test-APIStructure
    Test-SharedContracts
    Test-Documentation
    Test-BuildProcess
    Test-DatabaseSchema
    
    # Show final report
    Show-ValidationReport
}

# Run main function
Main
