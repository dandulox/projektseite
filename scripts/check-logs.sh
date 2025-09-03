#!/bin/bash

# ===== PROJEKTSEITE LOG CHECK SCRIPT =====
# Überprüft Container-Logs und zeigt Probleme an
# Erstellt: $(date)

set -e

echo "🔍 Überprüfe Container-Logs für Projektseite..."

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

# Prüfe Docker-Status
log_info "Prüfe Docker-Status..."
if ! docker info > /dev/null 2>&1; then
    log_error "Docker läuft nicht!"
    exit 1
fi

# Prüfe Container-Status
log_info "Container-Status:"
docker-compose -f docker/docker-compose.yml ps

echo ""

# Backend-Logs
log_info "=== Backend Logs (letzte 20 Zeilen) ==="
docker-compose -f docker/docker-compose.yml logs --tail=20 backend

echo ""

# Frontend-Logs
log_info "=== Frontend Logs (letzte 20 Zeilen) ==="
docker-compose -f docker/docker-compose.yml logs --tail=20 frontend

echo ""

# PostgreSQL-Logs
log_info "=== PostgreSQL Logs (letzte 20 Zeilen) ==="
docker-compose -f docker/docker-compose.yml logs --tail=20 postgres

echo ""

# Grafana-Logs
log_info "=== Grafana Logs (letzte 20 Zeilen) ==="
docker-compose -f docker/docker-compose.yml logs --tail=20 grafana

echo ""

# Prüfe Container-Gesundheit
log_info "=== Container-Gesundheit ==="
for service in postgres backend frontend grafana; do
    if docker-compose -f docker/docker-compose.yml ps $service | grep -q "Up"; then
        log_success "$service läuft"
    else
        log_error "$service läuft nicht oder hat Probleme"
    fi
done

echo ""

# Prüfe Ports
log_info "=== Port-Überprüfung ==="
netstat -tlnp | grep -E ':(3000|3001|3002|5432|9100)' || log_warning "Keine der erwarteten Ports gefunden"

echo ""

log_info "Log-Überprüfung abgeschlossen!"
