#!/bin/bash

# Projektseite v3.0 - Vollständiges Installations- und Validierungsscript (Linux/macOS)
# Automatisiertes Setup, Build und Test der neuen Architektur

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
ENVIRONMENT="development"
SKIP_TESTS=false
SKIP_DOCKER=false
FORCE=false
UPDATE_REPO=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-docker)
            SKIP_DOCKER=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --update)
            UPDATE_REPO=true
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

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Update repository
update_repository() {
    if [ "$UPDATE_REPO" = true ]; then
        print_step "Updating repository..."
        
        if [ -d ".git" ]; then
            print_info "Pulling latest changes..."
            git pull origin main
            
            print_info "Checking for submodules..."
            if [ -f ".gitmodules" ]; then
                git submodule update --init --recursive
            fi
            
            print_success "Repository updated"
        else
            print_warning "Not a git repository, skipping update"
        fi
    fi
}

# Check prerequisites
test_prerequisites() {
    print_step "Checking prerequisites..."
    
    prerequisites=("node" "npm" "docker" "docker-compose")
    
    for prereq in "${prerequisites[@]}"; do
        if command_exists "$prereq"; then
            print_success "$prereq is installed"
        else
            print_error "$prereq is not installed"
            exit 1
        fi
    done
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "All prerequisites are met"
}

# Validate project structure
test_project_structure() {
    print_step "Validating project structure..."
    
    required_dirs=("shared" "server" "client" "docker" "docs" "scripts")
    required_files=(
        "shared/package.json"
        "server/package.json" 
        "client/package.json"
        "docker/docker-compose.yml"
        "README.md"
    )
    
    all_good=true
    
    for dir in "${required_dirs[@]}"; do
        if [ -d "$dir" ]; then
            print_success "Directory '$dir' exists"
        else
            print_error "Directory '$dir' is missing"
            all_good=false
        fi
    done
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "File '$file' exists"
        else
            print_error "File '$file' is missing"
            all_good=false
        fi
    done
    
    if [ "$all_good" = false ]; then
        print_error "Project structure validation failed"
        exit 1
    fi
    
    print_success "Project structure is valid"
}

# Setup shared module
install_shared() {
    print_step "Setting up shared module..."
    
    cd shared
    
    print_info "Installing dependencies..."
    npm install
    
    print_info "Building shared module..."
    npm run build
    
    print_success "Shared module setup complete"
    cd ..
}

# Setup backend
install_backend() {
    print_step "Setting up backend..."
    
    cd server
    
    print_info "Installing dependencies..."
    npm install
    
    print_info "Setting up environment..."
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            cp env.example .env
            print_info "Created .env file from env.example"
        else
            print_warning "No env.example found, creating basic .env"
            cat > .env << EOF
NODE_ENV=$ENVIRONMENT
PORT=3001
DATABASE_URL="postgresql://admin:secure_password_123@localhost:5432/projektseite"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"
FRONTEND_URL="http://localhost:3000"
LOG_LEVEL="info"
EOF
        fi
    fi
    
    print_info "Generating Prisma client..."
    npm run db:generate
    
    print_success "Backend setup complete"
    cd ..
}

# Setup frontend
install_frontend() {
    print_step "Setting up frontend..."
    
    cd client
    
    print_info "Installing dependencies..."
    npm install
    
    print_info "Setting up environment..."
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_info "Created .env file from .env.example"
        else
            print_warning "No .env.example found, creating basic .env"
            cat > .env << EOF
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=$ENVIRONMENT
EOF
        fi
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
        if [ "$SKIP_DOCKER" = false ]; then
            print_info "Starting PostgreSQL database..."
            cd ../docker
            docker-compose -f docker-compose.dev.yml up -d postgres-dev
            sleep 10
            cd ../server
        fi
    fi
    
    print_info "Running database migrations..."
    npm run db:migrate
    
    if [ "$ENVIRONMENT" != "production" ]; then
        print_info "Seeding database with test data..."
        npm run db:seed
    fi
    
    print_success "Database setup complete"
    cd ..
}

# Setup Docker
setup_docker() {
    if [ "$SKIP_DOCKER" = true ]; then
        print_info "Skipping Docker setup"
        return
    fi
    
    print_step "Setting up Docker containers..."
    
    cd docker
    
    print_info "Building and starting development containers..."
    docker-compose -f docker-compose.dev.yml up -d --build
    
    print_success "Docker containers started"
    cd ..
}

# Build applications
build_applications() {
    print_step "Building applications..."
    
    print_info "Building shared module..."
    cd shared
    npm run build
    cd ..
    
    print_info "Building backend..."
    cd server
    npm run build
    cd ..
    
    print_info "Building frontend..."
    cd client
    npm run build
    cd ..
    
    print_success "All applications built successfully"
}

# Run tests
run_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        print_warning "Skipping tests as requested"
        return
    fi
    
    print_step "Running tests..."
    
    print_info "Running backend tests..."
    cd server
    npm run test:ci
    cd ..
    
    print_info "Running frontend tests..."
    cd client
    npm run test
    cd ..
    
    print_success "All tests passed"
}

# Validate installation
test_installation() {
    print_step "Validating installation..."
    
    print_info "Testing shared module..."
    cd shared
    node -e "console.log('Shared module:', require('./dist/index.js'))"
    cd ..
    
    print_info "Testing backend build..."
    cd server
    if [ -f "dist/server.js" ]; then
        print_success "Backend build exists"
    else
        print_error "Backend build not found"
        exit 1
    fi
    cd ..
    
    print_info "Testing frontend build..."
    cd client
    if [ -d "dist" ]; then
        print_success "Frontend build exists"
    else
        print_error "Frontend build not found"
        exit 1
    fi
    cd ..
    
    print_success "Installation validation complete"
}

# Start development environment
start_development() {
    if [ "$ENVIRONMENT" = "production" ]; then
        print_info "Production environment - skipping development startup"
        return
    fi
    
    print_step "Starting development environment..."
    
    if [ "$SKIP_DOCKER" = false ]; then
        print_info "Starting Docker services..."
        cd docker
        docker-compose -f docker-compose.dev.yml up -d
        cd ..
    fi
    
    print_success "Development environment started"
    print_info "Services available at:"
    echo -e "  ${WHITE}Frontend: http://localhost:3000${NC}"
    echo -e "  ${WHITE}Backend:  http://localhost:3001/api${NC}"
    echo -e "  ${WHITE}Health:   http://localhost:3001/health${NC}"
    echo -e "  ${WHITE}pgAdmin:  http://localhost:5050${NC}"
    echo -e "  ${WHITE}Redis:    http://localhost:8081${NC}"
    echo -e "  ${WHITE}Mailhog:  http://localhost:8025${NC}"
}

# Main installation function
main() {
    print_header "Projektseite v3.0 - Complete Installation & Validation"
    
    print_info "Environment: $ENVIRONMENT"
    print_info "Skip Tests: $SKIP_TESTS"
    print_info "Skip Docker: $SKIP_DOCKER"
    print_info "Force Mode: $FORCE"
    print_info "Update Repository: $UPDATE_REPO"
    echo ""
    
    # Step 1: Update repository
    update_repository
    
    # Step 2: Check prerequisites
    test_prerequisites
    
    # Step 3: Validate project structure
    test_project_structure
    
    # Step 4: Install shared module
    install_shared
    
    # Step 5: Install backend
    install_backend
    
    # Step 6: Install frontend
    install_frontend
    
    # Step 7: Setup database
    setup_database
    
    # Step 8: Setup Docker
    setup_docker
    
    # Step 9: Build applications
    build_applications
    
    # Step 10: Run tests
    run_tests
    
    # Step 11: Validate installation
    test_installation
    
    # Step 12: Start development environment
    start_development
    
    print_header "Installation Complete!"
    
    print_success "Projektseite v3.0 has been successfully installed and validated!"
    echo ""
    print_info "Next steps:"
    echo -e "  ${WHITE}1. Start development servers:${NC}"
    echo -e "     ${WHITE}Backend:  cd server && npm run dev${NC}"
    echo -e "     ${WHITE}Frontend: cd client && npm run dev${NC}"
    echo ""
    echo -e "  ${WHITE}2. Access the application:${NC}"
    echo -e "     ${WHITE}Frontend: http://localhost:3000${NC}"
    echo -e "     ${WHITE}Backend:  http://localhost:3001/api${NC}"
    echo -e "     ${WHITE}Health:   http://localhost:3001/health${NC}"
    echo ""
    echo -e "  ${WHITE}3. Admin credentials (development only):${NC}"
    echo -e "     ${WHITE}Email:    admin@projektseite.de${NC}"
    echo -e "     ${WHITE}Password: admin123${NC}"
    echo ""
    echo -e "  ${WHITE}4. Docker services:${NC}"
    echo -e "     ${WHITE}pgAdmin:  http://localhost:5050${NC}"
    echo -e "     ${WHITE}Redis:    http://localhost:8081${NC}"
    echo -e "     ${WHITE}Mailhog:  http://localhost:8025${NC}"
    echo ""
    print_info "For production deployment, see docs/DEPLOYMENT.md"
}

# Run main function
main
