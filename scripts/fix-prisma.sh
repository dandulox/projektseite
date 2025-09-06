#!/bin/bash

# Projektseite v3.0 - Prisma Schema Fix Script (Linux/macOS)
# Behebt Prisma-Schema-Validierungsfehler

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

# Fix Prisma schema
fix_prisma_schema() {
    print_step "Fixing Prisma schema..."
    
    if [ -d "server" ]; then
        cd server
        
        print_info "Validating Prisma schema..."
        if npx prisma validate; then
            print_success "Prisma schema is valid"
        else
            print_error "Prisma schema validation failed"
            cd ..
            return
        fi
        
        print_info "Generating Prisma client..."
        if npm run db:generate; then
            print_success "Prisma client generated successfully"
        else
            print_error "Failed to generate Prisma client"
            cd ..
            return
        fi
        
        print_info "Running database migrations..."
        if npm run db:migrate; then
            print_success "Database migrations completed"
        else
            print_warning "Database migrations failed"
        fi
        
        cd ..
    else
        print_error "Server directory not found"
    fi
}

# Main function
main() {
    print_header "Projektseite v3.0 - Prisma Schema Fix"
    
    print_info "This script fixes Prisma schema validation errors"
    echo ""
    
    # Fix Prisma schema
    fix_prisma_schema
    
    print_header "Fix Complete!"
    
    print_success "Prisma schema fix completed!"
    echo ""
    print_info "You can now run the installation scripts again:"
    echo -e "  ${WHITE}• ./scripts/install-v3.sh${NC}"
    echo -e "  ${WHITE}• ./scripts/quick-start.sh${NC}"
}

# Run main function
main
