#!/bin/bash

# Repariert die fehlenden Aktivitätslog-Tabellen
# Dieses Script erstellt die Tabellen, die beim ersten Patch fehlgeschlagen sind

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

log "🔧 Starte Reparatur der Aktivitätslog-Tabellen..."

# Prüfe ob wir im richtigen Verzeichnis sind
if [ ! -f "database/patches/002_activity_log_enhancement.sql" ]; then
    error "Aktivitätslog-Patch-Datei nicht gefunden!"
    error "Bitte führen Sie dieses Script aus dem Projektverzeichnis aus."
    exit 1
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

# Teste Datenbankverbindung
log "🔍 Teste Datenbankverbindung..."
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    error "Datenbankverbindung fehlgeschlagen!"
    exit 1
fi
success "Datenbankverbindung erfolgreich"

# Erstelle die fehlenden Tabellen direkt
log "📦 Erstelle Aktivitätslog-Tabellen..."

# SQL für project_activity_logs
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<EOF
-- Erstelle project_activity_logs Tabelle
CREATE TABLE IF NOT EXISTS project_activity_logs (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
        'created', 'updated', 'deleted', 'status_changed', 'priority_changed',
        'assigned', 'unassigned', 'permission_granted', 'permission_revoked',
        'module_added', 'module_removed', 'module_updated'
    )),
    action_details JSONB,
    old_values JSONB,
    new_values JSONB,
    affected_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Erstelle Indizes für project_activity_logs
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_project_id ON project_activity_logs (project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_user_id ON project_activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_action_type ON project_activity_logs (action_type);
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_created_at ON project_activity_logs (created_at);

-- Erstelle module_activity_logs Tabelle
CREATE TABLE IF NOT EXISTS module_activity_logs (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL,
    module_type VARCHAR(20) NOT NULL CHECK (module_type IN ('project', 'standalone')),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
        'created', 'updated', 'deleted', 'status_changed', 'priority_changed',
        'assigned', 'unassigned', 'permission_granted', 'permission_revoked',
        'progress_updated', 'due_date_changed', 'team_changed'
    )),
    action_details JSONB,
    old_values JSONB,
    new_values JSONB,
    affected_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Erstelle Indizes für module_activity_logs
CREATE INDEX IF NOT EXISTS idx_module_activity_logs_module_id ON module_activity_logs (module_id, module_type);
CREATE INDEX IF NOT EXISTS idx_module_activity_logs_user_id ON module_activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_module_activity_logs_action_type ON module_activity_logs (action_type);
CREATE INDEX IF NOT EXISTS idx_module_activity_logs_project_id ON module_activity_logs (project_id);
CREATE INDEX IF NOT EXISTS idx_module_activity_logs_created_at ON module_activity_logs (created_at);
EOF

if [ $? -eq 0 ]; then
    success "Aktivitätslog-Tabellen erfolgreich erstellt"
else
    error "Fehler beim Erstellen der Tabellen"
    exit 1
fi

# Prüfe die erstellten Tabellen
log "🔍 Prüfe erstellte Tabellen..."
TABLES=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_name IN ('project_activity_logs', 'module_activity_logs')
AND table_schema = 'public';
")

if [ "$TABLES" -eq 2 ]; then
    success "Beide Aktivitätslog-Tabellen sind vorhanden"
else
    error "Nicht alle Tabellen wurden erstellt. Gefunden: $TABLES/2"
    exit 1
fi

# Starte Backend-Container neu
log "🔄 Starte Backend-Container neu..."
docker-compose -f docker/docker-compose.yml restart backend

# Warte auf Container-Start
sleep 10

# Teste Backend-Verbindung
log "🔍 Teste Backend-Verbindung..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    success "Backend ist wieder verfügbar"
else
    warning "Backend ist noch nicht verfügbar, warte..."
    sleep 10
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        success "Backend ist jetzt verfügbar"
    else
        error "Backend ist nicht erreichbar"
    fi
fi

success "Aktivitätslog-Tabellen-Reparatur abgeschlossen!"
log "Das Aktivitätslog-System sollte jetzt funktionieren."
