#!/bin/bash

# Projektseite v3.0 - Architektur Validierungsscript (Linux/macOS)
# Testet alle Komponenten der neuen Architektur

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Parse command line arguments
QUICK=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --quick)
            QUICK=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        *)
            echo "Unknown option $1"
            exit 1
            ;;
    esac
done

# Functions
print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
}

print_step() {
    echo -e "${YELLOW}🔍 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Update repository with conflict resolution
update_repository() {
    print_step "Updating repository..."
    
    if [ -d ".git" ]; then
        print_info "Pulling latest changes..."
        
        # Try normal pull first
        if git pull origin main; then
            print_success "Repository updated"
        else
            print_warning "Git pull failed, attempting conflict resolution..."
            
            # Check if there are local changes
            if ! git diff --quiet || ! git diff --cached --quiet; then
                print_info "Local changes detected, resolving conflicts..."
                
                # Option 1: Try to stash changes
                if git stash push -m "Auto-stash before pull $(date)"; then
                    print_info "Changes stashed, pulling..."
                    if git pull origin main; then
                        print_success "Repository updated after stash"
                        print_info "Restoring stashed changes..."
                        if git stash pop; then
                            print_success "Stashed changes restored"
                        else
                            print_warning "Could not restore stashed changes, but repository is updated"
                        fi
                    else
                        print_error "Pull failed even after stash"
                        return 1
                    fi
                else
                    # Option 2: Force reset to remote
                    print_info "Stash failed, using force reset to remote..."
                    git fetch origin main
                    git reset --hard origin/main
                    print_success "Repository force-updated to remote version"
                fi
            else
                # No local changes, just fetch and reset
                print_info "No local changes, force updating to remote..."
                git fetch origin main
                git reset --hard origin/main
                print_success "Repository force-updated to remote version"
            fi
        fi
        
        print_info "Checking for submodules..."
        if [ -f ".gitmodules" ]; then
            git submodule update --init --recursive
        fi
        
        print_success "Repository updated"
    else
        print_warning "Not a git repository, skipping update"
    fi
}

# Set script permissions
set_script_permissions() {
    print_step "Setting script permissions..."
    
    print_info "Making shell scripts executable..."
    chmod +x scripts/*.sh 2>/dev/null || true
    
    print_success "Script permissions set"
}

# Test results tracking
PASSED=0
FAILED=0
WARNINGS=0

add_test_result() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    
    case $status in
        "PASS")
            ((PASSED++))
            print_success "$test_name - $message"
            ;;
        "FAIL")
            ((FAILED++))
            print_error "$test_name - $message"
            ;;
        "WARN")
            ((WARNINGS++))
            print_warning "$test_name - $message"
            ;;
    esac
}

# Validate project structure
test_project_structure() {
    print_step "Validating project structure..."
    
    declare -A structure=(
        ["shared/"]="package.json tsconfig.json index.ts"
        ["server/"]="package.json tsconfig.json Dockerfile prisma/schema.prisma"
        ["client/"]="package.json vite.config.ts tailwind.config.js"
        ["docker/"]="docker-compose.yml docker-compose.dev.yml nginx/nginx.conf"
        ["docs/"]="API.md DEPLOYMENT.md ADRs/"
        ["scripts/"]="install-v3.sh validate-v3.sh"
    )
    
    for dir in "${!structure[@]}"; do
        if [ -d "$dir" ]; then
            add_test_result "Directory $dir" "PASS" "Exists"
            
            IFS=' ' read -ra files <<< "${structure[$dir]}"
            for file in "${files[@]}"; do
                file_path="${dir}${file}"
                if [ -f "$file_path" ] || [ -d "$file_path" ]; then
                    add_test_result "File $file_path" "PASS" "Exists"
                else
                    add_test_result "File $file_path" "FAIL" "Missing"
                fi
            done
        else
            add_test_result "Directory $dir" "FAIL" "Missing"
        fi
    done
}

# Validate package.json files
test_package_json() {
    print_step "Validating package.json files..."
    
    packages=("shared" "server" "client")
    
    for pkg in "${packages[@]}"; do
        package_path="${pkg}/package.json"
        
        if [ -f "$package_path" ]; then
            # Check if jq is available for JSON parsing
            if command -v jq >/dev/null 2>&1; then
                # Check required fields
                required_fields=("name" "version" "scripts")
                for field in "${required_fields[@]}"; do
                    if jq -e ".${field}" "$package_path" >/dev/null 2>&1; then
                        add_test_result "Package $pkg.$field" "PASS" "Present"
                    else
                        add_test_result "Package $pkg.$field" "FAIL" "Missing"
                    fi
                done
                
                # Check scripts
                required_scripts=("build" "test")
                for script in "${required_scripts[@]}"; do
                    if jq -e ".scripts.${script}" "$package_path" >/dev/null 2>&1; then
                        add_test_result "Package $pkg.scripts.$script" "PASS" "Present"
                    else
                        add_test_result "Package $pkg.scripts.$script" "WARN" "Missing"
                    fi
                done
            else
                # Fallback: basic file existence check
                add_test_result "Package $pkg" "PASS" "Exists (jq not available for detailed validation)"
            fi
        else
            add_test_result "Package $pkg" "FAIL" "package.json not found"
        fi
    done
}

# Validate TypeScript configuration
test_typescript_config() {
    print_step "Validating TypeScript configuration..."
    
    tsconfigs=("shared/tsconfig.json" "server/tsconfig.json" "client/tsconfig.json")
    
    for tsconfig in "${tsconfigs[@]}"; do
        if [ -f "$tsconfig" ]; then
            if command -v jq >/dev/null 2>&1; then
                # Check required compiler options
                required_options=("target" "module" "strict")
                for option in "${required_options[@]}"; do
                    if jq -e ".compilerOptions.${option}" "$tsconfig" >/dev/null 2>&1; then
                        add_test_result "TSConfig $tsconfig.$option" "PASS" "Present"
                    else
                        add_test_result "TSConfig $tsconfig.$option" "WARN" "Missing"
                    fi
                done
            else
                add_test_result "TSConfig $tsconfig" "PASS" "Exists (jq not available for detailed validation)"
            fi
        else
            add_test_result "TSConfig $tsconfig" "FAIL" "Not found"
        fi
    done
}

# Validate Docker configuration
test_docker_config() {
    print_step "Validating Docker configuration..."
    
    docker_files=(
        "docker/docker-compose.yml"
        "docker/docker-compose.dev.yml"
        "server/Dockerfile"
        "server/Dockerfile.dev"
    )
    
    for file in "${docker_files[@]}"; do
        if [ -f "$file" ]; then
            add_test_result "Docker $file" "PASS" "Exists"
            
            # Check for required services in compose files
            if [[ "$file" == *.yml ]]; then
                if grep -q "services:" "$file"; then
                    add_test_result "Docker $file services" "PASS" "Has services section"
                else
                    add_test_result "Docker $file services" "FAIL" "Missing services section"
                fi
            fi
        else
            add_test_result "Docker $file" "FAIL" "Not found"
        fi
    done
}

# Validate Prisma schema
test_prisma_schema() {
    print_step "Validating Prisma schema..."
    
    schema_path="server/prisma/schema.prisma"
    
    if [ -f "$schema_path" ]; then
        add_test_result "Prisma schema" "PASS" "Exists"
        
        content=$(cat "$schema_path")
        
        # Check for required models
        required_models=("User" "Project" "Task" "Team" "Module")
        for model in "${required_models[@]}"; do
            if echo "$content" | grep -q "model $model"; then
                add_test_result "Prisma model $model" "PASS" "Defined"
            else
                add_test_result "Prisma model $model" "FAIL" "Missing"
            fi
        done
        
        # Check for database provider
        if echo "$content" | grep -q 'provider = "postgresql"'; then
            add_test_result "Prisma provider" "PASS" "PostgreSQL configured"
        else
            add_test_result "Prisma provider" "FAIL" "PostgreSQL not configured"
        fi
    else
        add_test_result "Prisma schema" "FAIL" "Not found"
    fi
}

# Validate API structure
test_api_structure() {
    print_step "Validating API structure..."
    
    declare -A api_structure=(
        ["server/src/controllers/"]="auth.controller.ts task.controller.ts project.controller.ts admin.controller.ts"
        ["server/src/services/"]="auth.service.ts task.service.ts project.service.ts admin.service.ts"
        ["server/src/repositories/"]="base.repository.ts user.repository.ts task.repository.ts project.repository.ts"
        ["server/src/routes/"]="auth.routes.ts task.routes.ts project.routes.ts admin.routes.ts"
        ["server/src/middleware/"]="auth.ts errorHandler.ts validation.ts"
    )
    
    for dir in "${!api_structure[@]}"; do
        if [ -d "$dir" ]; then
            add_test_result "API Directory $dir" "PASS" "Exists"
            
            IFS=' ' read -ra files <<< "${api_structure[$dir]}"
            for file in "${files[@]}"; do
                file_path="${dir}${file}"
                if [ -f "$file_path" ]; then
                    add_test_result "API File $file" "PASS" "Exists"
                else
                    add_test_result "API File $file" "FAIL" "Missing"
                fi
            done
        else
            add_test_result "API Directory $dir" "FAIL" "Missing"
        fi
    done
}

# Validate shared contracts
test_shared_contracts() {
    print_step "Validating shared contracts..."
    
    contracts=(
        "shared/contracts/error.ts"
        "shared/contracts/validation.ts"
        "shared/types/index.ts"
        "shared/utils/index.ts"
    )
    
    for contract in "${contracts[@]}"; do
        if [ -f "$contract" ]; then
            add_test_result "Contract $contract" "PASS" "Exists"
            
            # Check for exports
            if grep -q "export" "$contract"; then
                add_test_result "Contract $contract exports" "PASS" "Has exports"
            else
                add_test_result "Contract $contract exports" "WARN" "No exports found"
            fi
        else
            add_test_result "Contract $contract" "FAIL" "Not found"
        fi
    done
}

# Validate documentation
test_documentation() {
    print_step "Validating documentation..."
    
    docs=(
        "README.md"
        "docs/API.md"
        "docs/DEPLOYMENT.md"
        "docs/ADRs/ADR-001-error-contract.md"
        "docs/ADRs/ADR-002-prisma-orm.md"
        "docs/ADRs/ADR-003-no-seeds-policy.md"
    )
    
    for doc in "${docs[@]}"; do
        if [ -f "$doc" ]; then
            add_test_result "Documentation $doc" "PASS" "Exists"
            
            # Check file size (should not be empty)
            file_size=$(stat -f%z "$doc" 2>/dev/null || stat -c%s "$doc" 2>/dev/null || echo "0")
            if [ "$file_size" -gt 100 ]; then
                add_test_result "Documentation $doc content" "PASS" "Has content ($file_size bytes)"
            else
                add_test_result "Documentation $doc content" "WARN" "Very small file ($file_size bytes)"
            fi
        else
            add_test_result "Documentation $doc" "FAIL" "Not found"
        fi
    done
}

# Test build process
test_build_process() {
    if [ "$QUICK" = true ]; then
        print_info "Skipping build tests (Quick mode)"
        return
    fi
    
    print_step "Testing build process..."
    
    # Test shared module build
    if [ -d "shared" ]; then
        cd shared
        if npm run build >/dev/null 2>&1; then
            add_test_result "Shared build" "PASS" "Successful"
        else
            add_test_result "Shared build" "FAIL" "Failed"
        fi
        cd ..
    fi
    
    # Test server build
    if [ -d "server" ]; then
        cd server
        if npm run build >/dev/null 2>&1; then
            add_test_result "Server build" "PASS" "Successful"
        else
            add_test_result "Server build" "FAIL" "Failed"
        fi
        cd ..
    fi
}

# Test database schema
test_database_schema() {
    print_step "Testing database schema..."
    
    migration_path="server/prisma/migrations"
    if [ -d "$migration_path" ]; then
        migration_count=$(find "$migration_path" -type d -name "*" | wc -l)
        if [ "$migration_count" -gt 1 ]; then  # -1 for the directory itself
            add_test_result "Database migrations" "PASS" "$((migration_count-1)) migrations found"
        else
            add_test_result "Database migrations" "WARN" "No migrations found"
        fi
    else
        add_test_result "Database migrations" "FAIL" "Migrations directory not found"
    fi
    
    seed_path="server/prisma/seed.ts"
    if [ -f "$seed_path" ]; then
        add_test_result "Database seed" "PASS" "Seed file exists"
    else
        add_test_result "Database seed" "WARN" "Seed file not found"
    fi
}

# Generate validation report
show_validation_report() {
    print_header "Validation Report"
    
    total=$((PASSED + FAILED + WARNINGS))
    
    echo -e "Total Tests: ${WHITE}$total${NC}"
    echo -e "Passed: ${GREEN}$PASSED${NC}"
    echo -e "Failed: ${RED}$FAILED${NC}"
    echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
    echo ""
    
    if [ "$total" -gt 0 ]; then
        success_rate=$(echo "scale=2; $PASSED * 100 / $total" | bc -l 2>/dev/null || echo "0")
        echo -e "Success Rate: ${WHITE}$success_rate%${NC}"
        
        if [ "$FAILED" -eq 0 ]; then
            print_success "All critical tests passed! Architecture is valid."
        elif [ "$FAILED" -le 3 ]; then
            print_warning "Some tests failed, but architecture is mostly valid."
        else
            print_error "Multiple critical tests failed. Architecture needs attention."
        fi
    else
        print_warning "No tests were executed."
    fi
    
    echo ""
    print_info "For detailed information, run with --verbose flag"
}

# Main validation function
main() {
    print_header "Projektseite v3.0 - Architecture Validation"
    
    print_info "Quick Mode: $QUICK"
    print_info "Verbose Mode: $VERBOSE"
    echo ""
    
    # Step 1: Update repository
    update_repository
    
    # Step 2: Set script permissions
    set_script_permissions
    
    # Step 3: Run all validation tests
    test_project_structure
    test_package_json
    test_typescript_config
    test_docker_config
    test_prisma_schema
    test_api_structure
    test_shared_contracts
    test_documentation
    test_build_process
    test_database_schema
    
    # Show final report
    show_validation_report
}

# Run main function
main
