#!/bin/bash

# ===== PROJEKTSEITE BUILD DEBUG SCRIPT =====
# Diagnostiziert Build-Probleme
# Erstellt: $(date)

set -e

echo "🔍 Debug Build-Probleme für Projektseite..."

# Farben für Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Funktionen
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Wechsle zum Projektverzeichnis
cd /opt/projektseite

log_info "System-Informationen:"
echo "OS: $(uname -a)"
echo "Docker Version: $(docker --version)"
echo "Docker Compose Version: $(docker-compose --version)"
echo "Node Version: $(node --version 2>/dev/null || echo 'Nicht installiert')"
echo "NPM Version: $(npm --version 2>/dev/null || echo 'Nicht installiert')"
echo ""

log_info "Verfügbarer Speicherplatz:"
df -h
echo ""

log_info "Docker-Container-Status:"
docker ps -a
echo ""

log_info "Docker-Images:"
docker images | head -10
echo ""

log_info "Prüfe Frontend-Dateien:"
if [ -f "frontend/package.json" ]; then
    log_success "Frontend package.json gefunden"
    echo "Frontend Dependencies:"
    cat frontend/package.json | grep -A 20 '"dependencies"'
    echo ""
else
    log_error "Frontend package.json nicht gefunden!"
fi

if [ -f "frontend/tailwind.config.js" ]; then
    log_success "Tailwind-Konfiguration gefunden"
else
    log_error "Tailwind-Konfiguration nicht gefunden!"
fi

if [ -f "frontend/src/index.css" ]; then
    log_success "CSS-Datei gefunden"
else
    log_error "CSS-Datei nicht gefunden!"
fi

log_info "Prüfe Backend-Dateien:"
if [ -f "backend/package.json" ]; then
    log_success "Backend package.json gefunden"
else
    log_error "Backend package.json nicht gefunden!"
fi

log_info "Prüfe Docker-Compose-Datei:"
if [ -f "docker/docker-compose.yml" ]; then
    log_success "Docker-Compose-Datei gefunden"
    echo "Services:"
    grep -A 10 "services:" docker/docker-compose.yml
else
    log_error "Docker-Compose-Datei nicht gefunden!"
fi

log_info "Teste Frontend-Build lokal:"
cd frontend
if [ -f "package.json" ]; then
    log_info "Installiere Dependencies..."
    if npm install; then
        log_success "Dependencies installiert"
        
        log_info "Teste Build..."
        if npm run build; then
            log_success "Frontend-Build erfolgreich!"
        else
            log_error "Frontend-Build fehlgeschlagen!"
            log_info "NPM Build-Logs:"
            npm run build 2>&1 | tail -20
        fi
    else
        log_error "Dependency-Installation fehlgeschlagen!"
    fi
else
    log_error "Frontend package.json nicht gefunden!"
fi

cd ..

log_info "Teste Docker-Build:"
if [ -f "docker/docker-compose.yml" ]; then
    log_info "Baue nur Frontend-Container..."
    if docker-compose -f docker/docker-compose.yml build frontend; then
        log_success "Frontend-Container erfolgreich gebaut!"
    else
        log_error "Frontend-Container-Build fehlgeschlagen!"
        log_info "Docker-Build-Logs:"
        docker-compose -f docker/docker-compose.yml build frontend 2>&1 | tail -30
    fi
else
    log_error "Docker-Compose-Datei nicht gefunden!"
fi

log_info "Debug abgeschlossen!"
