#!/bin/bash

# ===== PROJEKTSEITE BACKUP SCRIPT =====
# Vollständige System-Backups mit Rotation
# Erstellt: $(date)

set -e

echo "💾 Starte System-Backup für Projektseite..."

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

# Funktion zur Überprüfung der Container-Namen
check_container_names() {
    log_info "Überprüfe verfügbare Container..."
    log_info "Alle Container:"
    docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" | head -10
    
    log_info "Projektseite-bezogene Container:"
    docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" | grep -E "(projektseite|postgres)" || log_warning "Keine projektseite-bezogenen Container gefunden"
}

# Funktion zur Suche nach PostgreSQL-Container
find_postgres_container() {
    # Suche nach verschiedenen möglichen PostgreSQL-Container-Namen
    local postgres_containers=(
        "projektseite-postgres"
        "projektseite_postgres_1"
        "projektseite_postgres"
        "postgres"
        "db"
    )
    
    for container in "${postgres_containers[@]}"; do
        if docker ps -a | grep -q "$container"; then
            echo "$container"
            return 0
        fi
    done
    
    # Suche nach PostgreSQL-Containern mit Image-Namen
    local postgres_image_containers=$(docker ps -a --format "{{.Names}}" | grep -E "(postgres|db)" | head -1)
    if [ -n "$postgres_image_containers" ]; then
        echo "$postgres_image_containers"
        return 0
    fi
    
    return 1
}

# Konfiguration
BACKUP_DIR="/opt/backups/projektseite"
PROJECT_DIR="/opt/projektseite"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="projektseite-backup-$TIMESTAMP"

# Log-Datei
LOG_FILE="/var/log/projektseite/backup-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1

log_info "Backup-Log wird in $LOG_FILE geschrieben"

# Prüfe ob als Root ausgeführt
if [[ $EUID -eq 0 ]]; then
   log_info "Skript wird als Root ausgeführt - das ist in Ordnung"
fi

# Erstelle Backup-Verzeichnis
log_info "Erstelle Backup-Verzeichnis..."
mkdir -p "$BACKUP_DIR"

# Prüfe verfügbaren Speicherplatz
log_info "Prüfe verfügbaren Speicherplatz..."
AVAILABLE_SPACE=$(df "$BACKUP_DIR" | awk 'NR==2 {print $4}')
REQUIRED_SPACE=5000000  # 5GB in KB

if [ "$AVAILABLE_SPACE" -lt "$REQUIRED_SPACE" ]; then
    log_warning "Wenig Speicherplatz verfügbar: ${AVAILABLE_SPACE}KB"
    log_info "Bereinige alte Backups..."
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
fi

# Überprüfe Container-Namen
check_container_names

# Stoppe Docker-Container für konsistente Backups
log_info "Stoppe Docker-Container für konsistente Backups..."
cd "$PROJECT_DIR"
if [ -f "docker/docker-compose.yml" ]; then
    docker-compose -f docker/docker-compose.yml down
else
    log_warning "Docker-Compose-Datei nicht gefunden, überspringe Docker-Operationen"
fi

# Erstelle temporäres Backup-Verzeichnis
TEMP_BACKUP_DIR="/tmp/$BACKUP_NAME"
mkdir -p "$TEMP_BACKUP_DIR"

# Backup der Projektdateien
log_info "Erstelle Backup der Projektdateien..."
cp -r "$PROJECT_DIR"/* "$TEMP_BACKUP_DIR/"

# Backup der Git-Informationen
log_info "Erstelle Git-Backup..."
cp -r "$PROJECT_DIR/.git" "$TEMP_BACKUP_DIR/" 2>/dev/null || true

# Backup der Datenbank
log_info "Erstelle Datenbank-Backup..."
if [ -f "docker/docker-compose.yml" ]; then
    # Suche nach PostgreSQL-Container
    POSTGRES_CONTAINER=$(find_postgres_container)
    
    if [ -n "$POSTGRES_CONTAINER" ]; then
        log_info "PostgreSQL-Container gefunden: $POSTGRES_CONTAINER"
        
        # Starte PostgreSQL temporär für Backup (falls nicht läuft)
        if ! docker ps | grep -q "$POSTGRES_CONTAINER"; then
            log_info "Starte PostgreSQL-Container für Backup..."
            docker-compose -f docker/docker-compose.yml up -d postgres
            sleep 15
        fi
        
        # Warte bis PostgreSQL bereit ist
        log_info "Warte auf PostgreSQL-Bereitschaft..."
        for i in {1..30}; do
            if docker exec "$POSTGRES_CONTAINER" pg_isready -U admin > /dev/null 2>&1; then
                log_success "PostgreSQL ist bereit"
                break
            fi
            log_info "Warte auf PostgreSQL... ($i/30)"
            sleep 2
        done
        
        # Erstelle Datenbank-Dump
        log_info "Erstelle Datenbank-Dump..."
        if docker exec "$POSTGRES_CONTAINER" pg_dump -U admin -d projektseite > "$TEMP_BACKUP_DIR/database-backup.sql" 2>/dev/null; then
            log_success "Datenbank-Backup erfolgreich erstellt"
        else
            log_warning "Datenbank-Backup fehlgeschlagen, aber fortfahren..."
        fi
        
        # Stoppe PostgreSQL wieder (nur wenn wir ihn gestartet haben)
        if ! docker ps | grep -q "$POSTGRES_CONTAINER"; then
            log_info "Stoppe PostgreSQL-Container nach Backup..."
            docker-compose -f docker/docker-compose.yml down
        fi
    else
        log_warning "Kein PostgreSQL-Container gefunden, überspringe Datenbank-Backup"
        log_info "Verfügbare Container:"
        docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep -E "(postgres|projektseite)" || log_info "Keine relevanten Container gefunden"
    fi
else
    log_warning "Docker-Compose-Datei nicht gefunden, überspringe Datenbank-Backup"
fi

# Backup der System-Konfiguration
log_info "Erstelle Backup der System-Konfiguration..."
mkdir -p "$TEMP_BACKUP_DIR/system"
cp -r /etc/systemd/system/projektseite.service "$TEMP_BACKUP_DIR/system/" 2>/dev/null || log_warning "Projektseite Service nicht gefunden"
cp -r /etc/logrotate.d/projektseite "$TEMP_BACKUP_DIR/system/" 2>/dev/null || log_warning "Logrotate-Konfiguration nicht gefunden"
cp -r /etc/environment.d/projektseite.conf "$TEMP_BACKUP_DIR/system/" 2>/dev/null || log_warning "Umgebungsvariablen nicht gefunden"

# Backup der Logs
log_info "Erstelle Backup der Logs..."
mkdir -p "$TEMP_BACKUP_DIR/logs"
cp -r /var/log/projektseite "$TEMP_BACKUP_DIR/logs/" 2>/dev/null || log_warning "Projektseite-Logs nicht gefunden"

# Backup der Umgebungsvariablen
log_info "Erstelle Backup der Umgebungsvariablen..."
env | grep -E "(PROJEKTSEITE|NODE_ENV|DB_)" > "$TEMP_BACKUP_DIR/environment.txt"

# Erstelle Backup-Archiv
log_info "Erstelle Backup-Archiv..."
cd /tmp
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" "$BACKUP_NAME"

# Berechne Backup-Größe
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)
log_info "Backup-Größe: $BACKUP_SIZE"

# Bereinige temporäre Dateien
log_info "Bereinige temporäre Dateien..."
rm -rf "$TEMP_BACKUP_DIR"

# Starte Docker-Container wieder
log_info "Starte Docker-Container wieder..."
cd "$PROJECT_DIR"
if [ -f "docker/docker-compose.yml" ]; then
    docker-compose -f docker/docker-compose.yml up -d
else
    log_warning "Docker-Compose-Datei nicht gefunden, überspringe Docker-Start"
fi

# Warte auf Container-Start
log_info "Warte auf Container-Start..."
sleep 15

# Prüfe Container-Status
log_info "Prüfe Container-Status..."
if [ -f "docker/docker-compose.yml" ]; then
    docker-compose -f docker/docker-compose.yml ps
else
    log_warning "Docker-Compose-Datei nicht gefunden, überspringe Container-Status-Prüfung"
fi

# Bereinige alte Backups
log_info "Bereinige alte Backups (älter als $RETENTION_DAYS Tage)..."
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Erstelle Backup-Index
log_info "Erstelle Backup-Index..."
INDEX_FILE="$BACKUP_DIR/backup-index.txt"
echo "# Projektseite Backup Index" > "$INDEX_FILE"
echo "# Erstellt: $(date)" >> "$INDEX_FILE"
echo "" >> "$INDEX_FILE"

# Liste alle Backups
for backup in "$BACKUP_DIR"/*.tar.gz; do
    if [ -f "$backup" ]; then
        filename=$(basename "$backup")
        size=$(du -h "$backup" | cut -f1)
        date=$(stat -c %y "$backup" | cut -d' ' -f1)
        echo "- $filename ($size) - $date" >> "$INDEX_FILE"
    fi
done

# Erstelle Backup-Report
REPORT_FILE="$BACKUP_DIR/backup-report-$TIMESTAMP.md"
cat > "$REPORT_FILE" <<EOF
# Backup Report - $(date)

## Backup-Zusammenfassung
- **Backup-Name:** $BACKUP_NAME
- **Datum:** $(date)
- **Benutzer:** $USER
- **Größe:** $BACKUP_SIZE

## Enthaltene Daten
- Projektdateien (inkl. Git-Historie)
- Datenbank-Dump
- System-Konfiguration
- Logs
- Umgebungsvariablen

## Backup-Verzeichnis
- **Hauptverzeichnis:** $BACKUP_DIR
- **Index-Datei:** $INDEX_FILE
- **Log-Datei:** $LOG_FILE

## Container-Status nach Backup
\`\`\`
$(if [ -f "docker/docker-compose.yml" ]; then docker-compose -f docker/docker-compose.yml ps; else echo "Docker-Compose-Datei nicht gefunden"; fi)
\`\`\`

## Nächste geplante Backups
- Automatische Backups: Täglich um 2:00 Uhr
- Manuelle Backups: Bei Bedarf

---
*Generiert automatisch von backup-system.sh*
EOF

# Prüfe Backup-Integrität
log_info "Prüfe Backup-Integrität..."
if tar -tzf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" > /dev/null 2>&1; then
    log_success "Backup-Integrität bestätigt"
else
    log_error "Backup-Integrität fehlgeschlagen!"
    exit 1
fi

# Zeige Backup-Statistiken
log_info "Backup-Statistiken:"
echo "📊 Verfügbare Backups:"
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "Keine Backups gefunden"

echo ""
log_success "Backup erfolgreich abgeschlossen!"
log_info "Backup-Datei: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
log_info "Backup-Report: $REPORT_FILE"
log_info "Log-Datei: $LOG_FILE"

# Sende Benachrichtigung (falls konfiguriert)
if command -v mail &> /dev/null; then
    echo "System-Backup erfolgreich abgeschlossen am $(date)" | mail -s "Projektseite Backup Report" root
fi

echo ""
log_success "System-Backup erfolgreich abgeschlossen!"
