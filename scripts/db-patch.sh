#!/bin/bash

# ===== PROJEKTSEITE DATENBANK PATCH SCRIPT =====
# Prüft und aktualisiert Datenbankstrukturen
# Erstellt: $(date)

set -e

echo "🗄️ Starte Datenbank-Patch für Projektseite..."

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

# Konfiguration
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="projektseite"
DB_USER="admin"
DB_PASSWORD="secure_password_123"
PROJECT_DIR="/opt/projektseite"
BACKUP_DIR="/opt/backups/projektseite"

# Prüfe ob als Root ausgeführt
if [[ $EUID -eq 0 ]]; then
   log_info "Skript wird als Root ausgeführt - das ist in Ordnung"
fi

# Wechsle zum Projektverzeichnis
cd "$PROJECT_DIR"

# Funktion: Datenbankverbindung testen
test_db_connection() {
    log_info "Teste Datenbankverbindung..."
    
    if docker exec projektseite-postgres pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
        log_success "Datenbankverbindung erfolgreich"
        return 0
    else
        log_error "Datenbankverbindung fehlgeschlagen"
        return 1
    fi
}

# Funktion: Backup erstellen
create_backup() {
    log_info "Erstelle Datenbank-Backup..."
    
    # Erstelle Backup-Verzeichnis falls nicht vorhanden
    mkdir -p "$BACKUP_DIR"
    
    # Erstelle Backup mit Zeitstempel
    BACKUP_FILE="$BACKUP_DIR/db-backup-$(date +%Y%m%d-%H%M%S).sql"
    
    if docker exec projektseite-postgres pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"; then
        log_success "Backup erstellt: $BACKUP_FILE"
        return 0
    else
        log_error "Backup-Erstellung fehlgeschlagen"
        return 1
    fi
}

# Funktion: Tabelle existiert prüfen
table_exists() {
    local table_name="$1"
    
    local result=$(docker exec projektseite-postgres psql -U "$DB_USER" -d "$DB_NAME" -t -c "
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '$table_name'
        );
    " 2>/dev/null | tr -d ' \n')
    
    if [ "$result" = "t" ]; then
        return 0  # Tabelle existiert
    else
        return 1  # Tabelle existiert nicht
    fi
}

# Funktion: Spalte existiert prüfen
column_exists() {
    local table_name="$1"
    local column_name="$2"
    
    local result=$(docker exec projektseite-postgres psql -U "$DB_USER" -d "$DB_NAME" -t -c "
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = '$table_name' 
            AND column_name = '$column_name'
        );
    " 2>/dev/null | tr -d ' \n')
    
    if [ "$result" = "t" ]; then
        return 0  # Spalte existiert
    else
        return 1  # Spalte existiert nicht
    fi
}

# Funktion: Schema aus Datei laden
load_schema() {
    local schema_file="$1"
    
    log_info "Lade Schema aus: $schema_file"
    
    if [ ! -f "$schema_file" ]; then
        log_error "Schema-Datei nicht gefunden: $schema_file"
        return 1
    fi
    
    if docker exec -i projektseite-postgres psql -U "$DB_USER" -d "$DB_NAME" < "$schema_file"; then
        log_success "Schema erfolgreich geladen"
        return 0
    else
        log_error "Schema-Laden fehlgeschlagen"
        return 1
    fi
}

# Funktion: Patch ausführen
apply_patch() {
    local patch_file="$1"
    
    log_info "Führe Patch aus: $patch_file"
    
    if [ ! -f "$patch_file" ]; then
        log_error "Patch-Datei nicht gefunden: $patch_file"
        return 1
    fi
    
    if docker exec -i projektseite-postgres psql -U "$DB_USER" -d "$DB_NAME" < "$patch_file"; then
        log_success "Patch erfolgreich angewendet"
        return 0
    else
        log_error "Patch-Anwendung fehlgeschlagen"
        return 1
    fi
}

# Funktion: Alle Tabellen anzeigen
show_tables() {
    log_info "Aktuelle Tabellen in der Datenbank:"
    
    docker exec projektseite-postgres psql -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT table_name, 
               CASE WHEN table_name IN ('users', 'projects', 'project_modules', 'design_settings', 'greetings', 'project_logs') 
                    THEN '✅' 
                    ELSE '❓' 
               END as status
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
    "
}

# Funktion: Datenbank-Status prüfen
check_database_status() {
    log_info "Prüfe Datenbank-Status..."
    
    local missing_tables=()
    local required_tables=("users" "projects" "project_modules" "design_settings" "greetings" "project_logs")
    
    for table in "${required_tables[@]}"; do
        if table_exists "$table"; then
            log_success "Tabelle '$table' existiert"
        else
            log_warning "Tabelle '$table' fehlt"
            missing_tables+=("$table")
        fi
    done
    
    if [ ${#missing_tables[@]} -eq 0 ]; then
        log_success "Alle erforderlichen Tabellen sind vorhanden"
        return 0
    else
        log_warning "Fehlende Tabellen: ${missing_tables[*]}"
        return 1
    fi
}

# Hauptfunktion: Datenbank reparieren
repair_database() {
    log_info "Repariere Datenbank..."
    
    # 1. Backup erstellen
    if ! create_backup; then
        log_error "Backup-Erstellung fehlgeschlagen - Patch abgebrochen"
        return 1
    fi
    
    # 2. Vollständiges Schema laden
    if ! load_schema "database/init/01_schema.sql"; then
        log_error "Schema-Laden fehlgeschlagen"
        return 1
    fi
    
    # 3. Verfügbare Patches anwenden
    if [ -d "database/patches" ]; then
        log_info "Wende verfügbare Patches an..."
        
        for patch_file in database/patches/*.sql; do
            if [ -f "$patch_file" ]; then
                apply_patch "$patch_file"
            fi
        done
    fi
    
    # 4. Status erneut prüfen
    if check_database_status; then
        log_success "Datenbank erfolgreich repariert"
        return 0
    else
        log_error "Datenbank-Reparatur fehlgeschlagen"
        return 1
    fi
}

# Hauptfunktion: Patch-System
main() {
    log_info "=== PROJEKTSEITE DATENBANK PATCH SYSTEM ==="
    
    # 1. Datenbankverbindung testen
    if ! test_db_connection; then
        log_error "Datenbank nicht erreichbar - Patch abgebrochen"
        exit 1
    fi
    
    # 2. Aktuellen Status anzeigen
    show_tables
    
    # 3. Datenbank-Status prüfen
    if check_database_status; then
        log_success "Datenbank ist in Ordnung - keine Reparatur erforderlich"
        
        # Trotzdem verfügbare Patches prüfen
        if [ -d "database/patches" ] && [ "$(ls -A database/patches/*.sql 2>/dev/null)" ]; then
            log_info "Wende verfügbare Patches an..."
            
            for patch_file in database/patches/*.sql; do
                if [ -f "$patch_file" ]; then
                    apply_patch "$patch_file"
                fi
            done
        fi
    else
        log_warning "Datenbank-Reparatur erforderlich"
        
        # Bestätigung einholen
        echo ""
        read -p "Möchten Sie die Datenbank reparieren? (j/N): " CONFIRM
        
        if [[ $CONFIRM =~ ^[Jj]$ ]]; then
            repair_database
        else
            log_info "Patch abgebrochen"
            exit 0
        fi
    fi
    
    # 4. Backend-Container neu starten
    log_info "Starte Backend-Container neu..."
    docker-compose -f docker/docker-compose.yml restart backend
    
    # 5. Finaler Status
    log_info "Finaler Datenbank-Status:"
    show_tables
    
    log_success "Datenbank-Patch abgeschlossen!"
}

# Skript ausführen
main "$@"
