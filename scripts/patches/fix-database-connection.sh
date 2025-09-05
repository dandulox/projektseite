#!/bin/bash

# Datenbankverbindung reparieren
# Dieses Script hilft bei Problemen mit der Datenbankverbindung

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

log "🔧 Starte Datenbankverbindung-Reparatur..."

# Prüfe ob wir im richtigen Verzeichnis sind
if [ ! -f "docker/docker-compose.yml" ]; then
    error "Docker-Compose-Datei nicht gefunden!"
    error "Bitte führen Sie dieses Script aus dem Projektverzeichnis aus."
    exit 1
fi

# Prüfe Docker-Installation
if ! command -v docker &> /dev/null; then
    error "Docker ist nicht installiert!"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose ist nicht installiert!"
    exit 1
fi

# Prüfe PostgreSQL Client
if ! command -v psql &> /dev/null; then
    warning "PostgreSQL Client (psql) nicht gefunden!"
    log "Installiere PostgreSQL Client..."
    apt update && apt install -y postgresql-client
fi

# Lade Umgebungsvariablen
if [ -f ".env" ]; then
    source .env
    log "✅ Umgebungsvariablen geladen"
else
    warning "Keine .env-Datei gefunden, verwende Standardwerte"
    export DB_HOST=${DB_HOST:-localhost}
    export DB_PORT=${DB_PORT:-5432}
    export DB_NAME=${DB_NAME:-projektseite}
    export DB_USER=${DB_USER:-admin}
    export DB_PASSWORD=${DB_PASSWORD:-secure_password_123}
fi

log "Verbindungsparameter: Host=$DB_HOST, Port=$DB_PORT, DB=$DB_NAME, User=$DB_USER"

# Stoppe alle Container
log "🛑 Stoppe alle Container..."
docker-compose -f docker/docker-compose.yml down

# Starte PostgreSQL-Container
log "🚀 Starte PostgreSQL-Container..."
docker-compose -f docker/docker-compose.yml up -d postgres

# Warte auf Container-Start
log "⏳ Warte auf Container-Start..."
sleep 15

# Prüfe Container-Status
log "🔍 Prüfe Container-Status..."
if docker ps | grep -q "projektseite-postgres"; then
    success "PostgreSQL-Container läuft"
else
    error "PostgreSQL-Container läuft nicht!"
    log "Container-Logs:"
    docker-compose -f docker/docker-compose.yml logs postgres
    exit 1
fi

# Teste Datenbankverbindung
log "🔍 Teste Datenbankverbindung..."
for i in {1..5}; do
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
        success "Datenbankverbindung erfolgreich!"
        break
    else
        warning "Verbindungsversuch $i/5 fehlgeschlagen, warte 5 Sekunden..."
        sleep 5
    fi
done

# Finale Prüfung
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    error "Datenbankverbindung fehlgeschlagen!"
    log "🔍 Diagnose-Informationen:"
    log "Docker-Container-Status:"
    docker ps | grep postgres || log "Keine PostgreSQL-Container gefunden"
    log "Container-Logs:"
    docker-compose -f docker/docker-compose.yml logs postgres
    exit 1
fi

success "Datenbankverbindung erfolgreich repariert!"

# Starte alle Container
log "🚀 Starte alle Container..."
docker-compose -f docker/docker-compose.yml up -d

log "✅ Datenbankverbindung-Reparatur abgeschlossen!"
log "Sie können jetzt das Aktivitätslog-System installieren:"
log "./scripts/patches/install-activity-log.sh"
