#!/bin/bash

# Projektseite v3.0 - Database Wait Script (Linux/macOS)
# Wartet bis die PostgreSQL-Datenbank bereit ist

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

# Wait for database
wait_for_database() {
    local host=${1:-"localhost"}
    local port=${2:-5432}
    local max_attempts=${3:-30}
    local delay_seconds=${4:-2}
    
    print_step "Waiting for PostgreSQL database to be ready..."
    print_info "Host: $host, Port: $port"
    print_info "Max attempts: $max_attempts, Delay: $delay_seconds seconds"
    
    for ((i=1; i<=max_attempts; i++)); do
        print_info "Attempt $i/$max_attempts - Testing database connection..."
        
        if nc -z "$host" "$port" 2>/dev/null; then
            print_success "Database is ready and accepting connections!"
            return 0
        else
            print_info "Database not ready yet, waiting $delay_seconds seconds..."
            sleep "$delay_seconds"
        fi
    done
    
    print_error "Database did not become ready within the timeout period"
    return 1
}

# Check if netcat is available
check_netcat() {
    if ! command -v nc &> /dev/null; then
        print_error "netcat (nc) is not installed. Please install it:"
        echo -e "  ${WHITE}• Ubuntu/Debian: sudo apt-get install netcat${NC}"
        echo -e "  ${WHITE}• CentOS/RHEL: sudo yum install nc${NC}"
        echo -e "  ${WHITE}• macOS: brew install netcat${NC}"
        return 1
    fi
    return 0
}

# Main function
main() {
    print_header "Projektseite v3.0 - Database Wait"
    
    print_info "This script waits for the PostgreSQL database to be ready"
    echo ""
    
    # Check netcat
    if ! check_netcat; then
        exit 1
    fi
    
    # Wait for database
    if wait_for_database; then
        print_success "Database is ready! You can now run migrations."
        echo ""
        print_info "Next steps:"
        echo -e "  ${WHITE}• cd server${NC}"
        echo -e "  ${WHITE}• npm run db:migrate${NC}"
        echo -e "  ${WHITE}• npm run db:seed${NC}"
    else
        print_error "Database is not ready. Please check Docker containers:"
        echo -e "  ${WHITE}• docker ps${NC}"
        echo -e "  ${WHITE}• docker logs projektseite-postgres-dev${NC}"
    fi
}

# Run main function
main
