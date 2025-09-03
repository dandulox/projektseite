#!/bin/bash

# ===== PROJEKTSEITE SYSTEMD FIX SCRIPT =====
# Repariert den systemd Service mit korrektem Pfad zur docker-compose.yml
# Erstellt: $(date)

set -e

echo "🔧 Repariere systemd Service für Projektseite..."

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

# Prüfe ob als Root ausgeführt
if [[ $EUID -eq 0 ]]; then
   log_info "Skript wird als Root ausgeführt - das ist in Ordnung"
else
   log_error "Dieses Skript muss als Root ausgeführt werden!"
   exit 1
fi

# Wechsle zum Projektverzeichnis
cd /opt/projektseite

# Prüfe ob docker-compose.yml existiert
if [ ! -f "docker/docker-compose.yml" ]; then
    log_error "Docker-Compose-Datei nicht gefunden in docker/docker-compose.yml!"
    exit 1
fi

log_info "Docker-Compose-Datei gefunden: docker/docker-compose.yml"

# Stoppe den Service
log_info "Stoppe projektseite.service..."
systemctl stop projektseite.service || log_warning "Service war bereits gestoppt"

# Deaktiviere den Service
log_info "Deaktiviere projektseite.service..."
systemctl disable projektseite.service

# Erstelle den korrigierten Service
log_info "Erstelle korrigierten systemd Service..."
cat > /etc/systemd/system/projektseite.service <<EOF
[Unit]
Description=Projektseite Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/projektseite
ExecStart=/usr/local/bin/docker-compose -f docker/docker-compose.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker/docker-compose.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Lade systemd neu
log_info "Lade systemd neu..."
systemctl daemon-reload

# Aktiviere den Service
log_info "Aktiviere projektseite.service..."
systemctl enable projektseite.service

# Starte den Service
log_info "Starte projektseite.service..."
if systemctl start projektseite.service; then
    log_success "Service erfolgreich gestartet"
else
    log_error "Service konnte nicht gestartet werden"
    log_info "Prüfe die Logs mit: journalctl -u projektseite.service -f"
    exit 1
fi

# Warte kurz
sleep 5

# Prüfe Service-Status
log_info "Prüfe Service-Status..."
systemctl status projektseite.service --no-pager

# Prüfe Container-Status
log_info "Prüfe Container-Status..."
if [ -f "docker/docker-compose.yml" ]; then
    docker-compose -f docker/docker-compose.yml ps
else
    log_error "Docker-Compose-Datei nicht gefunden!"
    exit 1
fi

# Prüfe Service-Verfügbarkeit
log_info "Prüfe Service-Verfügbarkeit..."

# PostgreSQL
if docker exec projektseite-postgres pg_isready -U admin > /dev/null 2>&1; then
    log_success "PostgreSQL ist bereit"
else
    log_warning "PostgreSQL ist noch nicht bereit"
fi

# Backend
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    log_success "Backend ist bereit"
else
    log_warning "Backend ist noch nicht bereit"
fi

# Frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    log_success "Frontend ist bereit"
else
    log_warning "Frontend ist noch nicht bereit"
fi

# Grafana
if curl -s http://localhost:3002 > /dev/null 2>&1; then
    log_success "Grafana ist bereit"
else
    log_warning "Grafana ist noch nicht bereit"
fi

echo ""
log_success "Systemd Service erfolgreich repariert!"
log_info "Der Service startet jetzt automatisch mit dem korrekten Pfad"
log_info "Verwende 'systemctl status projektseite.service' um den Status zu prüfen"
echo ""
