#!/bin/bash

# Aktivitätslog-System Installation
# Dieses Script installiert das erweiterte Aktivitätslog-System für Projekte und Module

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

# Prüfe ob wir im richtigen Verzeichnis sind
if [ ! -f "database/patches/002_activity_log_enhancement.sql" ]; then
    error "Aktivitätslog-Patch-Datei nicht gefunden!"
    error "Bitte führen Sie dieses Script aus dem Projektverzeichnis aus."
    exit 1
fi

log "🚀 Starte Installation des Aktivitätslog-Systems..."

# Prüfe Datenbankverbindung
log "📊 Prüfe Datenbankverbindung..."
if ! command -v psql &> /dev/null; then
    error "PostgreSQL Client (psql) nicht gefunden!"
    error "Bitte installieren Sie PostgreSQL Client Tools."
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

# Datenbankverbindung testen
log "🔍 Teste Datenbankverbindung..."
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    error "Datenbankverbindung fehlgeschlagen!"
    error "Bitte prüfen Sie Ihre Datenbankkonfiguration."
    exit 1
fi
success "Datenbankverbindung erfolgreich"

# Backup erstellen
log "💾 Erstelle Datenbank-Backup..."
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
if PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "database/backups/$BACKUP_FILE" 2>/dev/null; then
    success "Backup erstellt: database/backups/$BACKUP_FILE"
else
    warning "Backup konnte nicht erstellt werden, fahre trotzdem fort..."
fi

# Prüfe ob Aktivitätslog-Tabellen bereits existieren
log "🔍 Prüfe bestehende Aktivitätslog-Tabellen..."
EXISTING_TABLES=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('project_activity_logs', 'module_activity_logs');
" 2>/dev/null | tr -d ' ')

if [ "$EXISTING_TABLES" = "2" ]; then
    warning "Aktivitätslog-Tabellen existieren bereits!"
    read -p "Möchten Sie sie neu erstellen? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "🗑️ Lösche bestehende Aktivitätslog-Tabellen..."
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
            DROP TABLE IF EXISTS project_activity_logs CASCADE;
            DROP TABLE IF EXISTS module_activity_logs CASCADE;
            DROP FUNCTION IF EXISTS log_project_activity CASCADE;
            DROP FUNCTION IF EXISTS log_module_activity CASCADE;
            DROP FUNCTION IF EXISTS notify_project_activity CASCADE;
            DROP FUNCTION IF EXISTS notify_module_activity CASCADE;
            DROP TRIGGER IF EXISTS trigger_project_activity_log_trigger ON projects CASCADE;
            DROP TRIGGER IF EXISTS trigger_project_module_activity_log_trigger ON project_modules CASCADE;
            DROP TRIGGER IF EXISTS trigger_standalone_module_activity_log_trigger ON standalone_modules CASCADE;
        " > /dev/null 2>&1
        success "Bestehende Tabellen gelöscht"
    else
        log "Installation abgebrochen"
        exit 0
    fi
fi

# Installiere Aktivitätslog-Patch
log "📦 Installiere Aktivitätslog-Patch..."
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "database/patches/002_activity_log_enhancement.sql" > /dev/null 2>&1; then
    success "Aktivitätslog-Patch erfolgreich installiert"
else
    error "Fehler beim Installieren des Aktivitätslog-Patches!"
    error "Bitte prüfen Sie die Logs und versuchen Sie es erneut."
    exit 1
fi

# Prüfe Installation
log "✅ Prüfe Installation..."
TABLES_CREATED=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('project_activity_logs', 'module_activity_logs');
" 2>/dev/null | tr -d ' ')

FUNCTIONS_CREATED=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('log_project_activity', 'log_module_activity', 'notify_project_activity', 'notify_module_activity');
" 2>/dev/null | tr -d ' ')

TRIGGERS_CREATED=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) FROM information_schema.triggers 
    WHERE trigger_schema = 'public' 
    AND trigger_name IN ('trigger_project_activity_log_trigger', 'trigger_project_module_activity_log_trigger', 'trigger_standalone_module_activity_log_trigger');
" 2>/dev/null | tr -d ' ')

if [ "$TABLES_CREATED" = "2" ] && [ "$FUNCTIONS_CREATED" = "4" ] && [ "$TRIGGERS_CREATED" = "3" ]; then
    success "Alle Aktivitätslog-Komponenten erfolgreich installiert!"
else
    error "Installation unvollständig!"
    error "Tabellen: $TABLES_CREATED/2, Funktionen: $FUNCTIONS_CREATED/4, Trigger: $TRIGGERS_CREATED/3"
    exit 1
fi

# Teste Aktivitätslog-Funktionalität
log "🧪 Teste Aktivitätslog-Funktionalität..."
TEST_RESULT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    -- Teste ob wir ein Test-Projekt haben
    SELECT COUNT(*) FROM projects LIMIT 1;
" 2>/dev/null | tr -d ' ')

if [ "$TEST_RESULT" -gt 0 ]; then
    log "📝 Erstelle Test-Aktivitätslog-Eintrag..."
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
        -- Erstelle einen Test-Aktivitätslog-Eintrag
        DO \$\$
        DECLARE
            test_project_id INTEGER;
            test_user_id INTEGER;
        BEGIN
            -- Hole erste Projekt- und Benutzer-ID
            SELECT id INTO test_project_id FROM projects LIMIT 1;
            SELECT id INTO test_user_id FROM users LIMIT 1;
            
            IF test_project_id IS NOT NULL AND test_user_id IS NOT NULL THEN
                PERFORM log_project_activity(
                    test_project_id,
                    test_user_id,
                    'created',
                    '{\"test\": true, \"message\": \"Test-Aktivitätslog-Eintrag\"}',
                    NULL,
                    '{\"test\": true}',
                    NULL
                );
                RAISE NOTICE 'Test-Aktivitätslog-Eintrag erfolgreich erstellt';
            ELSE
                RAISE NOTICE 'Keine Test-Daten verfügbar';
            END IF;
        END
        \$\$;
    " > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        success "Test-Aktivitätslog-Eintrag erfolgreich erstellt"
    else
        warning "Test-Aktivitätslog-Eintrag konnte nicht erstellt werden"
    fi
else
    warning "Keine Test-Projekte verfügbar, überspringe Test"
fi

# Zeige Installationszusammenfassung
log "📋 Installationszusammenfassung:"
echo "  ✅ Aktivitätslog-Tabellen erstellt"
echo "  ✅ Aktivitätslog-Funktionen installiert"
echo "  ✅ Automatische Trigger aktiviert"
echo "  ✅ Benachrichtigungssystem erweitert"
echo "  ✅ Views für einfache Abfragen erstellt"

# Zeige nächste Schritte
log "🎯 Nächste Schritte:"
echo "  1. Starten Sie den Backend-Server neu"
echo "  2. Das Frontend wird automatisch die neuen Aktivitätslog-Komponenten laden"
echo "  3. Alle neuen Projekt- und Modul-Änderungen werden automatisch protokolliert"
echo "  4. Benachrichtigungen werden an betroffene Benutzer gesendet"

# Zeige verfügbare API-Endpunkte
log "🔗 Verfügbare API-Endpunkte:"
echo "  GET  /api/activity-logs/projects/:id     - Projekt-Aktivitätslogs"
echo "  GET  /api/activity-logs/modules/:id      - Modul-Aktivitätslogs"
echo "  GET  /api/activity-logs/user/:id         - Benutzer-Aktivitätslogs"
echo "  GET  /api/activity-logs/team/:id         - Team-Aktivitätslogs"
echo "  GET  /api/activity-logs/stats/:type/:id  - Aktivitätslog-Statistiken"
echo "  POST /api/activity-logs/log              - Manueller Aktivitätslog-Eintrag"

success "🎉 Aktivitätslog-System erfolgreich installiert!"
log "Das System ist jetzt bereit für die Verwendung."

exit 0
