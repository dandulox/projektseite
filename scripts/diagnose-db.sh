#!/bin/bash

# Projektseite v3.0 - Database Diagnosis Script
# Diagnostiziert Datenbankverbindungsprobleme

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

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Test database connection with different methods
test_database_connection() {
    local host=${1:-"localhost"}
    local port=${2:-5432}
    
    print_step "Testing database connection to $host:$port"
    
    # Test 1: netcat
    print_info "Test 1: Using netcat (nc)"
    if command -v nc &> /dev/null; then
        if timeout 5 nc -z "$host" "$port" 2>/dev/null; then
            print_success "netcat: Connection successful"
            return 0
        else
            print_warning "netcat: Connection failed"
        fi
    else
        print_warning "netcat not installed"
    fi
    
    # Test 2: telnet
    print_info "Test 2: Using telnet"
    if command -v telnet &> /dev/null; then
        if timeout 5 bash -c "echo > /dev/tcp/$host/$port" 2>/dev/null; then
            print_success "telnet: Connection successful"
            return 0
        else
            print_warning "telnet: Connection failed"
        fi
    else
        print_warning "telnet not available"
    fi
    
    # Test 3: psql
    print_info "Test 3: Using psql"
    if command -v psql &> /dev/null; then
        if timeout 5 psql -h "$host" -p "$port" -U admin -d projektseite -c "SELECT 1;" &>/dev/null; then
            print_success "psql: Connection successful"
            return 0
        else
            print_warning "psql: Connection failed"
        fi
    else
        print_warning "psql not installed"
    fi
    
    # Test 4: Python
    print_info "Test 4: Using Python socket"
    if command -v python3 &> /dev/null; then
        if python3 -c "
import socket
import sys
try:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(5)
    result = sock.connect_ex(('$host', $port))
    sock.close()
    sys.exit(0 if result == 0 else 1)
except:
    sys.exit(1)
" 2>/dev/null; then
            print_success "Python socket: Connection successful"
            return 0
        else
            print_warning "Python socket: Connection failed"
        fi
    else
        print_warning "Python3 not available"
    fi
    
    print_error "All connection tests failed"
    return 1
}

# Check Docker containers
check_docker_containers() {
    print_step "Checking Docker containers"
    
    print_info "Running containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    print_info "PostgreSQL container logs (last 20 lines):"
    docker logs --tail 20 projektseite-postgres-dev 2>/dev/null || print_warning "Container not found or no logs"
}

# Check network connectivity
check_network() {
    print_step "Checking network connectivity"
    
    print_info "Testing localhost connectivity:"
    if ping -c 1 localhost &>/dev/null; then
        print_success "localhost ping successful"
    else
        print_error "localhost ping failed"
    fi
    
    print_info "Testing port 5432 availability:"
    if ss -tuln | grep -q ":5432 "; then
        print_success "Port 5432 is listening"
    else
        print_warning "Port 5432 is not listening"
    fi
}

# Fix connection issues
fix_connection_issues() {
    print_step "Attempting to fix connection issues"
    
    # Restart PostgreSQL container
    print_info "Restarting PostgreSQL container..."
    cd docker
    docker-compose -f docker-compose.dev.yml restart postgres-dev
    cd ..
    
    # Wait a bit
    print_info "Waiting 10 seconds for container to restart..."
    sleep 10
    
    # Test again
    if test_database_connection; then
        print_success "Connection fixed!"
        return 0
    else
        print_error "Connection still failing"
        return 1
    fi
}

# Main function
main() {
    print_header "Projektseite v3.0 - Database Diagnosis"
    
    print_info "This script diagnoses database connection issues"
    echo ""
    
    # Check Docker containers
    check_docker_containers
    echo ""
    
    # Check network
    check_network
    echo ""
    
    # Test database connection
    if test_database_connection; then
        print_success "Database connection is working!"
        echo ""
        print_info "You can now run migrations:"
        echo -e "  ${WHITE}cd server${NC}"
        echo -e "  ${WHITE}npm run db:migrate${NC}"
    else
        print_error "Database connection is not working"
        echo ""
        print_info "Attempting to fix connection issues..."
        if fix_connection_issues; then
            print_success "Connection issues resolved!"
        else
            print_error "Could not resolve connection issues"
            echo ""
            print_info "Manual troubleshooting steps:"
            echo -e "  ${WHITE}• Check Docker: docker ps${NC}"
            echo -e "  ${WHITE}• Check logs: docker logs projektseite-postgres-dev${NC}"
            echo -e "  ${WHITE}• Restart container: docker restart projektseite-postgres-dev${NC}"
            echo -e "  ${WHITE}• Check firewall: sudo ufw status${NC}"
        fi
    fi
}

# Run main function
main
