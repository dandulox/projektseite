#!/bin/bash

# Projektseite v3.0 - Dockerfiles Fix Script (Linux/macOS)
# Erstellt fehlende Dockerfiles für Development

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

# Create server Dockerfile.dev
create_server_dockerfile() {
    print_step "Creating server Dockerfile.dev..."
    
    if [ -d "server" ]; then
        cat > server/Dockerfile.dev << 'EOF'
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
EOF
        
        print_success "Server Dockerfile.dev created"
    else
        print_error "Server directory not found"
    fi
}

# Create client Dockerfile.dev
create_client_dockerfile() {
    print_step "Creating client Dockerfile.dev..."
    
    if [ -d "client" ]; then
        cat > client/Dockerfile.dev << 'EOF'
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
EOF
        
        print_success "Client Dockerfile.dev created"
    else
        print_error "Client directory not found"
    fi
}

# Main function
main() {
    print_header "Projektseite v3.0 - Dockerfiles Fix"
    
    print_info "This script creates missing Dockerfiles for development"
    echo ""
    
    # Create Dockerfiles
    create_server_dockerfile
    create_client_dockerfile
    
    print_header "Fix Complete!"
    
    print_success "Dockerfiles created!"
    echo ""
    print_info "You can now run the installation scripts again:"
    echo -e "  ${WHITE}• ./scripts/install-v3.sh${NC}"
    echo -e "  ${WHITE}• ./scripts/quick-start.sh${NC}"
}

# Run main function
main
