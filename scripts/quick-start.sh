#!/bin/bash

# Projektseite v3.0 - Quick Start Script (Linux/macOS)
# Schneller Start für Development

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
SKIP_DOCKER=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-validation)
            SKIP_VALIDATION=true
            shift
            ;;
        --skip-docker)
            SKIP_DOCKER=true
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
    echo -e "${YELLOW}🚀 $1${NC}"
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
        
        # Always force reset to remote (overwrite local changes)
        print_info "Force updating to remote version (overwriting local changes)..."
        git fetch origin main
        git reset --hard origin/main
        print_success "Repository force-updated to remote version"
        
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

# Quick validation
test_quick_validation() {
    if [ "$SKIP_VALIDATION" = true ]; then
        print_info "Skipping validation as requested"
        return
    fi
    
    print_step "Quick validation..."
    
    required_dirs=("shared" "server" "client" "docker")
    all_good=true
    
    for dir in "${required_dirs[@]}"; do
        if [ -d "$dir" ]; then
            print_success "Directory '$dir' exists"
        else
            print_error "Directory '$dir' missing"
            all_good=false
        fi
    done
    
    if [ "$all_good" = false ]; then
        print_error "Project structure incomplete. Run install-v3.sh first."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    
    # Shared
    print_info "Installing shared dependencies..."
    cd shared
    npm install --include=dev --silent
    cd ..
    
    # Server
    print_info "Installing server dependencies..."
    cd server
    npm install --include=dev --silent
    cd ..
    
    # Client
    print_info "Installing client dependencies..."
    cd client
    npm install --include=dev --silent
    cd ..
    
    print_success "Dependencies installed"
}

# Setup environment
setup_environment() {
    print_step "Setting up environment..."
    
    # Server environment
    if [ ! -f "server/.env" ]; then
        print_info "Creating server .env file..."
        cat > server/.env << EOF
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://admin:secure_password_123@localhost:5432/projektseite"
JWT_SECRET="dev-jwt-secret-key"
JWT_EXPIRES_IN="24h"
FRONTEND_URL="http://localhost:3000"
LOG_LEVEL="info"
EOF
    fi
    
    # Client environment
    if [ ! -f "client/.env" ]; then
        print_info "Creating client .env file..."
        cat > client/.env << EOF
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
EOF
    fi
    
    print_success "Environment configured"
}

# Start Docker services
start_docker_services() {
    if [ "$SKIP_DOCKER" = true ]; then
        print_info "Skipping Docker services"
        return
    fi
    
    print_step "Starting Docker services..."
    
    cd docker
    docker-compose -f docker-compose.dev.yml up -d postgres-dev redis-dev
    cd ..
    
    print_info "Waiting for services to start..."
    sleep 5
    
    print_success "Docker services started"
}

# Setup database
setup_database() {
    print_step "Setting up database..."
    
    cd server
    
    print_info "Generating Prisma client..."
    npm run db:generate --silent
    
    print_info "Running migrations..."
    npm run db:migrate --silent
    
    print_info "Seeding database..."
    npm run db:seed --silent
    
    print_success "Database ready"
    cd ..
}

# Build shared module
build_shared() {
    print_step "Building shared module..."
    
    cd shared
    npm run build --silent
    cd ..
    
    print_success "Shared module built"
}

# Start development servers
start_development_servers() {
    print_step "Starting development servers..."
    
    print_info "Starting backend server..."
    gnome-terminal --tab --title="Backend" -- bash -c "cd server && npm run dev; exec bash" 2>/dev/null || \
    xterm -title "Backend" -e "cd server && npm run dev" 2>/dev/null || \
    osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/server && npm run dev"' 2>/dev/null || \
    {
        print_info "Could not open new terminal. Please run manually:"
        print_info "Terminal 1: cd server && npm run dev"
        print_info "Terminal 2: cd client && npm run dev"
        return
    }
    
    sleep 2
    
    print_info "Starting frontend server..."
    gnome-terminal --tab --title="Frontend" -- bash -c "cd client && npm run dev; exec bash" 2>/dev/null || \
    xterm -title "Frontend" -e "cd client && npm run dev" 2>/dev/null || \
    osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/client && npm run dev"' 2>/dev/null || \
    {
        print_info "Could not open new terminal. Please run manually:"
        print_info "Terminal 1: cd server && npm run dev"
        print_info "Terminal 2: cd client && npm run dev"
        return
    }
    
    print_success "Development servers started"
}

# Show access information
show_access_info() {
    print_header "Quick Start Complete!"
    
    print_success "Projektseite v3.0 is now running!"
    echo ""
    print_info "Access URLs:"
    echo -e "  ${WHITE}🌐 Frontend: http://localhost:3000${NC}"
    echo -e "  ${WHITE}🔧 Backend:  http://localhost:3001/api${NC}"
    echo -e "  ${WHITE}❤️  Health:   http://localhost:3001/health${NC}"
    echo ""
    print_info "Admin Tools:"
    echo -e "  ${WHITE}🗄️  pgAdmin:  http://localhost:5050${NC}"
    echo -e "  ${WHITE}🔴 Redis:    http://localhost:8081${NC}"
    echo -e "  ${WHITE}📧 Mailhog:  http://localhost:8025${NC}"
    echo ""
    print_info "Login Credentials:"
    echo -e "  ${WHITE}👤 Admin: admin@projektseite.de / admin123${NC}"
    echo -e "  ${WHITE}👤 User:  user@projektseite.de / user123${NC}"
    echo ""
    print_info "Development servers are running in separate terminals."
    print_info "Press Ctrl+C in those terminals to stop the servers."
    echo ""
    print_warning "To stop all services:"
    echo -e "  ${WHITE}docker-compose -f docker/docker-compose.dev.yml down${NC}"
}

# Main function
main() {
    print_header "Projektseite v3.0 - Quick Start"
    
    print_info "Skip Validation: $SKIP_VALIDATION"
    print_info "Skip Docker: $SKIP_DOCKER"
    echo ""
    
    # Step 1: Update repository
    update_repository
    
    # Step 2: Set script permissions
    set_script_permissions
    
    # Step 3: Quick validation
    test_quick_validation
    
    # Install dependencies
    install_dependencies
    
    # Setup environment
    setup_environment
    
    # Start Docker services
    start_docker_services
    
    # Setup database
    setup_database
    
    # Build shared module
    build_shared
    
    # Start development servers
    start_development_servers
    
    # Show access information
    show_access_info
}

# Run main function
main
