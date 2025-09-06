#!/bin/bash

# Projektseite v3.0 - Dependency Fix Script (Linux/macOS)
# Behebt fehlende devDependencies

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
}

print_step() {
    echo -e "${YELLOW}🔧 $1${NC}"
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

# Fix shared module
fix_shared_module() {
    print_step "Fixing shared module dependencies..."
    
    if [ -d "shared" ]; then
        cd shared
        
        print_info "Installing devDependencies for shared module..."
        npm install --include=dev
        
        print_info "Building shared module..."
        npm run build
        
        print_success "Shared module fixed"
        cd ..
    else
        print_error "Shared directory not found"
    fi
}

# Fix server module
fix_server_module() {
    print_step "Fixing server module dependencies..."
    
    if [ -d "server" ]; then
        cd server
        
        print_info "Installing devDependencies for server module..."
        npm install --include=dev
        
        print_success "Server module fixed"
        cd ..
    else
        print_error "Server directory not found"
    fi
}

# Fix client module
fix_client_module() {
    print_step "Fixing client module dependencies..."
    
    if [ -d "client" ]; then
        cd client
        
        print_info "Installing devDependencies for client module..."
        npm install --include=dev
        
        print_success "Client module fixed"
        cd ..
    else
        print_error "Client directory not found"
    fi
}

# Main function
main() {
    print_header "Projektseite v3.0 - Dependency Fix"
    
    print_info "This script fixes missing devDependencies that cause build failures"
    echo ""
    
    # Fix all modules
    fix_shared_module
    fix_server_module
    fix_client_module
    
    print_header "Fix Complete!"
    
    print_success "All dependencies have been fixed!"
    echo ""
    print_info "You can now run the installation scripts again:"
    echo -e "  ${WHITE}• ./scripts/install-v3.sh${NC}"
    echo -e "  ${WHITE}• ./scripts/quick-start.sh${NC}"
}

# Run main function
main
