#!/bin/bash

# Projektseite v3.0 - Environment Fix Script (Linux/macOS)
# Korrigiert die .env-Dateien mit den richtigen Ports

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

# Fix server .env
fix_server_env() {
    print_step "Fixing server .env file..."
    
    if [ -d "server" ]; then
        cd server
        
        cat > .env << EOF
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://dev:dev_password@localhost:5433/projektseite_dev"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"
FRONTEND_URL="http://localhost:3000"
LOG_LEVEL="info"
EOF
        
        print_success "Server .env file created with correct database URL (Port 5433)"
        
        cd ..
    else
        print_error "Server directory not found"
    fi
}

# Fix client .env
fix_client_env() {
    print_step "Fixing client .env file..."
    
    if [ -d "client" ]; then
        cd client
        
        cat > .env << EOF
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
EOF
        
        print_success "Client .env file created"
        
        cd ..
    else
        print_error "Client directory not found"
    fi
}

# Main function
main() {
    print_header "Projektseite v3.0 - Environment Fix"
    
    print_info "This script fixes .env files with correct database configuration"
    echo ""
    
    # Fix environment files
    fix_server_env
    fix_client_env
    
    print_header "Fix Complete!"
    
    print_success "Environment files fixed!"
    echo ""
    print_info "You can now run the installation scripts again:"
    echo -e "  ${WHITE}• ./scripts/install-v3.sh${NC}"
    echo -e "  ${WHITE}• ./scripts/quick-start.sh${NC}"
}

# Run main function
main
