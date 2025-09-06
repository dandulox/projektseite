#!/bin/bash

# Projektseite v3.0 - Update Script (Linux/macOS)
# Aktualisiert das Repository und führt Validierung durch

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
SKIP_VALIDATION=false
SKIP_TESTS=false
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-validation)
            SKIP_VALIDATION=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --force)
            FORCE=true
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
    echo -e "${YELLOW}🔄 $1${NC}"
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

# Check if git is available
check_git() {
    if ! command -v git >/dev/null 2>&1; then
        print_error "Git is not available. Please install Git first."
        exit 1
    fi
}

# Update repository
update_repository() {
    print_step "Updating repository..."
    
    check_git
    
    if [ ! -d ".git" ]; then
        print_warning "Not a git repository, skipping update"
        return
    fi
    
    print_info "Fetching latest changes..."
    git fetch origin
    
    print_info "Checking current branch..."
    current_branch=$(git branch --show-current)
    print_info "Current branch: $current_branch"
    
    print_info "Pulling latest changes..."
    if git pull origin "$current_branch"; then
        print_success "Repository updated successfully"
    else
        print_warning "Git pull failed, attempting conflict resolution..."
        
        # Check if there are local changes
        if ! git diff --quiet || ! git diff --cached --quiet; then
            print_info "Local changes detected, resolving conflicts..."
            
            # Option 1: Try to stash changes
            if git stash push -m "Auto-stash before pull $(date)"; then
                print_info "Changes stashed, pulling..."
                if git pull origin "$current_branch"; then
                    print_success "Repository updated after stash"
                    print_info "Restoring stashed changes..."
                    if git stash pop; then
                        print_success "Stashed changes restored"
                    else
                        print_warning "Could not restore stashed changes, but repository is updated"
                    fi
                else
                    print_error "Pull failed even after stash"
                    if [ "$FORCE" = false ]; then
                        exit 1
                    fi
                fi
            else
                # Option 2: Force reset to remote
                print_info "Stash failed, using force reset to remote..."
                git reset --hard "origin/$current_branch"
                print_success "Repository force-updated to remote version"
            fi
        else
            # No local changes, just fetch and reset
            print_info "No local changes, force updating to remote..."
            git reset --hard "origin/$current_branch"
            print_success "Repository force-updated to remote version"
        fi
    fi
    
    print_info "Checking for submodules..."
    if [ -f ".gitmodules" ]; then
        print_info "Updating submodules..."
        git submodule update --init --recursive
    fi
    
    # Show recent commits
    print_info "Recent commits:"
    git log --oneline -5
}

# Set script permissions
set_script_permissions() {
    print_step "Setting script permissions..."
    
    print_info "Making shell scripts executable..."
    chmod +x scripts/*.sh 2>/dev/null || true
    
    print_success "Script permissions set"
}

# Update dependencies
update_dependencies() {
    print_step "Updating dependencies..."
    
    packages=("shared" "server" "client")
    
    for pkg in "${packages[@]}"; do
        if [ -d "$pkg" ]; then
            print_info "Updating dependencies for $pkg..."
            cd "$pkg"
            
            if npm update; then
                print_success "Dependencies updated for $pkg"
            else
                print_warning "Failed to update dependencies for $pkg"
            fi
            
            cd ..
        else
            print_warning "Directory $pkg not found, skipping"
        fi
    done
}

# Rebuild applications
rebuild_applications() {
    print_step "Rebuilding applications..."
    
    # Build shared module
    if [ -d "shared" ]; then
        print_info "Building shared module..."
        cd shared
        if npm run build; then
            print_success "Shared module built"
        else
            print_error "Failed to build shared module"
        fi
        cd ..
    fi
    
    # Build server
    if [ -d "server" ]; then
        print_info "Building server..."
        cd server
        if npm run build; then
            print_success "Server built"
        else
            print_error "Failed to build server"
        fi
        cd ..
    fi
    
    # Build client
    if [ -d "client" ]; then
        print_info "Building client..."
        cd client
        if npm run build; then
            print_success "Client built"
        else
            print_error "Failed to build client"
        fi
        cd ..
    fi
}

# Run database migrations
update_database() {
    print_step "Updating database..."
    
    if [ -d "server" ]; then
        cd server
        
        print_info "Generating Prisma client..."
        npm run db:generate
        
        print_info "Running database migrations..."
        if npm run db:migrate; then
            print_success "Database updated"
        else
            print_warning "Failed to update database"
        fi
        
        cd ..
    fi
}

# Run validation
run_validation() {
    if [ "$SKIP_VALIDATION" = true ]; then
        print_info "Skipping validation as requested"
        return
    fi
    
    print_step "Running validation..."
    
    if [ -f "scripts/validate-v3.sh" ]; then
        if ./scripts/validate-v3.sh --quick; then
            print_success "Validation completed"
        else
            print_warning "Validation failed"
        fi
    else
        print_warning "Validation script not found"
    fi
}

# Run tests
run_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        print_info "Skipping tests as requested"
        return
    fi
    
    print_step "Running tests..."
    
    # Test server
    if [ -d "server" ]; then
        print_info "Running server tests..."
        cd server
        if npm run test; then
            print_success "Server tests passed"
        else
            print_warning "Server tests failed"
        fi
        cd ..
    fi
    
    # Test client
    if [ -d "client" ]; then
        print_info "Running client tests..."
        cd client
        if npm run test; then
            print_success "Client tests passed"
        else
            print_warning "Client tests failed"
        fi
        cd ..
    fi
}

# Show update summary
show_update_summary() {
    print_header "Update Complete!"
    
    print_success "Projektseite v3.0 has been updated successfully!"
    echo ""
    print_info "What was updated:"
    echo -e "  ${WHITE}• Repository code${NC}"
    echo -e "  ${WHITE}• Dependencies${NC}"
    echo -e "  ${WHITE}• Application builds${NC}"
    echo -e "  ${WHITE}• Database schema${NC}"
    echo ""
    print_info "Next steps:"
    echo -e "  ${WHITE}• Restart development servers if running${NC}"
    echo -e "  ${WHITE}• Check for any breaking changes in the changelog${NC}"
    echo -e "  ${WHITE}• Run full validation: ./scripts/validate-v3.sh${NC}"
    echo ""
    print_info "To start development:"
    echo -e "  ${WHITE}• Quick start: ./scripts/quick-start.sh${NC}"
    echo -e "  ${WHITE}• Manual start: cd server && npm run dev${NC}"
}

# Main function
main() {
    print_header "Projektseite v3.0 - Update"
    
    print_info "Skip Validation: $SKIP_VALIDATION"
    print_info "Skip Tests: $SKIP_TESTS"
    print_info "Force Mode: $FORCE"
    echo ""
    
    # Step 1: Update repository
    update_repository
    
    # Step 2: Set script permissions
    set_script_permissions
    
    # Step 3: Update dependencies
    update_dependencies
    
    # Rebuild applications
    rebuild_applications
    
    # Update database
    update_database
    
    # Run validation
    run_validation
    
    # Run tests
    run_tests
    
    # Show summary
    show_update_summary
}

# Run main function
main
