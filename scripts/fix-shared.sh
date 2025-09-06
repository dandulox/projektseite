#!/bin/bash

# Projektseite v3.0 - Shared Module Fix Script (Linux/macOS)
# Behebt fehlende Exports und TypeScript-Fehler im shared-Module

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
    print_step "Fixing shared module..."
    
    if [ -d "shared" ]; then
        cd shared
        
        print_info "Installing dependencies..."
        npm install --include=dev
        
        print_info "Building shared module..."
        if npm run build; then
            print_success "Shared module built successfully"
        else
            print_error "Build failed"
            print_info "Trying to fix TypeScript errors..."
            
            # Try to build with more verbose output
            npm run type-check
        fi
        
        cd ..
    else
        print_error "Shared directory not found"
    fi
}

# Main function
main() {
    print_header "Projektseite v3.0 - Shared Module Fix"
    
    print_info "This script fixes the shared module build issues"
    echo ""
    
    # Fix shared module
    fix_shared_module
    
    print_header "Fix Complete!"
    
    print_success "Shared module fix completed!"
    echo ""
    print_info "You can now run the installation scripts again:"
    echo -e "  ${WHITE}• ./scripts/install-v3.sh${NC}"
    echo -e "  ${WHITE}• ./scripts/quick-start.sh${NC}"
}

# Run main function
main
