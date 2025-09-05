#!/bin/bash

# Schnelle Lösung für Datenbankverbindungsprobleme
# Dieses Script startet die Container und installiert das Aktivitätslog-System

set -e

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging-Funktion
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log "🚀 Starte schnelle Reparatur..."

# Prüfe ob wir im richtigen Verzeichnis sind
if [ ! -f "docker/docker-compose.yml" ]; then
    error "Docker-Compose-Datei nicht gefunden!"
    error "Bitte führen Sie dieses Script aus dem Projektverzeichnis aus."
    exit 1
fi

# Starte alle Container
log "🚀 Starte alle Container..."
docker-compose -f docker/docker-compose.yml up -d

# Warte auf Container-Start
log "⏳ Warte auf Container-Start..."
sleep 20

# Prüfe Container-Status
log "🔍 Prüfe Container-Status..."
docker-compose -f docker/docker-compose.yml ps

# Teste Datenbankverbindung
log "🔍 Teste Datenbankverbindung..."
if PGPASSWORD="secure_password_123" psql -h localhost -p 5432 -U admin -d projektseite -c "SELECT 1;" > /dev/null 2>&1; then
    success "Datenbankverbindung erfolgreich!"
    
    # Installiere Aktivitätslog-System
    log "📦 Installiere Aktivitätslog-System..."
    ./scripts/patches/install-activity-log.sh
    
else
    error "Datenbankverbindung fehlgeschlagen!"
    log "🔍 Diagnose-Informationen:"
    log "Docker-Container-Status:"
    docker ps | grep postgres || log "Keine PostgreSQL-Container gefunden"
    log "Container-Logs:"
    docker-compose -f docker/docker-compose.yml logs postgres
    exit 1
fi

success "Schnelle Reparatur abgeschlossen!"
