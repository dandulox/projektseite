#!/bin/bash

# Setup Script für Projektseite v3.0
# Automatisiertes Setup für Development und Production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Projektseite v3.0 Setup${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_step() {
    echo -e "${YELLOW}➤ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "All prerequisites are met"
}

# Setup shared module
setup_shared() {
    print_step "Setting up shared module..."
    
    cd shared
    npm install
    npm run build
    
    print_success "Shared module setup complete"
    cd ..
}

# Setup backend
setup_backend() {
    print_step "Setting up backend..."
    
    cd server
    
    # Install dependencies
    npm install
    
    # Copy environment file
    if [ ! -f .env ]; then
        cp env.example .env
        print_info "Created .env file from env.example"
    fi
    
    # Generate Prisma client
    npm run db:generate
    
    print_success "Backend setup complete"
    cd ..
}

# Setup frontend
setup_frontend() {
    print_step "Setting up frontend..."
    
    cd client
    
    # Install dependencies
    npm install
    
    # Copy environment file
    if [ ! -f .env ]; then
        cp .env.example .env 2>/dev/null || echo "REACT_APP_API_URL=http://localhost:3001/api" > .env
        print_info "Created .env file"
    fi
    
    print_success "Frontend setup complete"
    cd ..
}

# Setup database
setup_database() {
    print_step "Setting up database..."
    
    cd server
    
    # Check if database is running
    if ! docker ps | grep -q postgres; then
        print_info "Starting PostgreSQL database..."
        docker-compose -f ../docker/docker-compose.dev.yml up -d postgres-dev
        sleep 10
    fi
    
    # Run migrations
    npm run db:migrate
    
    # Seed database (only in development)
    if [ "$NODE_ENV" != "production" ]; then
        print_info "Seeding database with test data..."
        npm run db:seed
    fi
    
    print_success "Database setup complete"
    cd ..
}

# Setup Docker
setup_docker() {
    print_step "Setting up Docker containers..."
    
    cd docker
    
    # Build and start development containers
    docker-compose -f docker-compose.dev.yml up -d --build
    
    print_success "Docker containers started"
    cd ..
}

# Run tests
run_tests() {
    print_step "Running tests..."
    
    cd server
    npm run test:ci
    cd ..
    
    print_success "All tests passed"
}

# Main setup function
main() {
    print_header
    
    # Parse command line arguments
    ENVIRONMENT=${1:-development}
    SKIP_TESTS=${2:-false}
    
    print_info "Setting up for environment: $ENVIRONMENT"
    
    # Check prerequisites
    check_prerequisites
    
    # Setup modules
    setup_shared
    setup_backend
    setup_frontend
    
    # Setup database
    setup_database
    
    # Setup Docker (optional)
    if [ "$ENVIRONMENT" = "development" ]; then
        setup_docker
    fi
    
    # Run tests
    if [ "$SKIP_TESTS" != "true" ]; then
        run_tests
    fi
    
    print_success "Setup completed successfully!"
    
    echo ""
    print_info "Next steps:"
    echo "  1. Start development servers:"
    echo "     Backend:  cd server && npm run dev"
    echo "     Frontend: cd client && npm run dev"
    echo ""
    echo "  2. Access the application:"
    echo "     Frontend: http://localhost:3000"
    echo "     Backend:  http://localhost:3001/api"
    echo "     Health:   http://localhost:3001/health"
    echo ""
    echo "  3. Admin credentials (development only):"
    echo "     Email:    admin@projektseite.de"
    echo "     Password: admin123"
    echo ""
    echo "  4. Docker services:"
    echo "     pgAdmin:  http://localhost:5050"
    echo "     Redis:    http://localhost:8081"
    echo "     Mailhog:  http://localhost:8025"
}

# Run main function
main "$@"
