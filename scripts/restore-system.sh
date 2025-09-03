#!/bin/bash

# ===== PROJEKTSEITE SYSTEM RESTORE SCRIPT =====
# Wiederherstellung von System-Backups
# Erstellt: $(date)

set -e

echo "🔄 Starte System-Restore für Projektseite..."

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
BACKUP_DIR="/opt/backups/projektseite"
PROJECT_DIR="/opt/projektseite"
RESTORE_DIR="/tmp/projektseite-restore"

# Prüfe ob als Root ausgeführt
if [[ $EUID -eq 0 ]]; then
   log_error "Dieses Skript sollte nicht als Root ausgeführt werden!"
   exit 1
fi

# Zeige verfügbare Backups
log_info "Verfügbare Backups:"
if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR"/*.tar.gz 2>/dev/null)" ]; then
    log_error "Keine Backups in $BACKUP_DIR gefunden!"
    exit 1
fi

echo ""
ls -lh "$BACKUP_DIR"/*.tar.gz
echo ""

# Wähle Backup aus
read -p "Geben Sie den Namen der Backup-Datei ein (z.B. projektseite-backup-20240101-120000.tar.gz): " BACKUP_FILE

if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    log_error "Backup-Datei $BACKUP_FILE nicht gefunden!"
    exit 1
fi

# Bestätigung
echo ""
log_warning "ACHTUNG: Dieser Vorgang überschreibt alle aktuellen Daten!"
log_warning "Backup: $BACKUP_FILE"
log_warning "Ziel: $PROJECT_DIR"
echo ""
read -p "Sind Sie sicher, dass Sie fortfahren möchten? (j/N): " CONFIRM

if [[ ! $CONFIRM =~ ^[Jj]$ ]]; then
    log_info "Restore abgebrochen."
    exit 0
fi

# Erstelle Backup vor Restore
log_info "Erstelle Backup vor Restore..."
./scripts/backup-system.sh

# Stoppe Docker-Container
log_info "Stoppe Docker-Container..."
cd "$PROJECT_DIR"
docker-compose down

# Erstelle Restore-Verzeichnis
log_info "Erstelle Restore-Verzeichnis..."
rm -rf "$RESTORE_DIR"
mkdir -p "$RESTORE_DIR"

# Extrahiere Backup
log_info "Extrahiere Backup..."
cd "$RESTORE_DIR"
tar -xzf "$BACKUP_DIR/$BACKUP_FILE"

# Prüfe Backup-Inhalt
log_info "Prüfe Backup-Inhalt..."
if [ ! -d "$RESTORE_DIR/projektseite-backup-"* ]; then
    log_error "Ungültiges Backup-Format!"
    exit 1
fi

RESTORE_CONTENT="$RESTORE_DIR/projektseite-backup-"*
log_info "Backup-Inhalt: $RESTORE_CONTENT"

# Sichere aktuelle Daten
log_info "Sichere aktuelle Daten..."
CURRENT_BACKUP="$PROJECT_DIR/current-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$CURRENT_BACKUP"
cp -r "$PROJECT_DIR"/* "$CURRENT_BACKUP/" 2>/dev/null || true

# Lösche aktuelle Projektdateien
log_info "Lösche aktuelle Projektdateien..."
rm -rf "$PROJECT_DIR"/*

# Stelle Projektdateien wieder her
log_info "Stelle Projektdateien wieder her..."
cp -r "$RESTORE_CONTENT"/* "$PROJECT_DIR/"

# Stelle Git-Informationen wieder her
log_info "Stelle Git-Informationen wieder her..."
if [ -d "$RESTORE_CONTENT/.git" ]; then
    cp -r "$RESTORE_CONTENT/.git" "$PROJECT_DIR/"
    log_info "Git-Repository wiederhergestellt"
else
    log_info "Git-Repository nicht gefunden, klone von GitHub..."
    cd "$PROJECT_DIR"
    git clone https://github.com/dandulox/projektseite.git .
fi

# Stelle Datenbank wieder her
log_info "Stelle Datenbank wieder her..."
if [ -f "$PROJECT_DIR/database-backup.sql" ]; then
    log_info "Datenbank-Backup gefunden, starte PostgreSQL..."
    cd "$PROJECT_DIR"
    docker-compose up -d postgres
    
    # Warte auf PostgreSQL-Start
    log_info "Warte auf PostgreSQL-Start..."
    sleep 15
    
    # Prüfe PostgreSQL-Verbindung
    if docker exec projektseite-postgres pg_isready -U admin; then
        log_info "Stelle Datenbank wieder her..."
        docker exec projektseite-postgres psql -U admin -d projektseite -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
        docker exec -i projektseite-postgres psql -U admin -d projektseite < "$PROJECT_DIR/database-backup.sql"
        log_success "Datenbank erfolgreich wiederhergestellt"
    else
        log_error "PostgreSQL ist nicht bereit!"
    fi
    
    # Entferne temporäre Datenbank-Datei
    rm -f "$PROJECT_DIR/database-backup.sql"
else
    log_warning "Kein Datenbank-Backup gefunden, überspringe Datenbank-Restore"
fi

# Stelle System-Konfiguration wieder her
log_info "Stelle System-Konfiguration wieder her..."
if [ -d "$PROJECT_DIR/system" ]; then
    sudo cp "$PROJECT_DIR/system/projektseite.service" /etc/systemd/system/ 2>/dev/null || true
    sudo cp "$PROJECT_DIR/system/projektseite" /etc/logrotate.d/ 2>/dev/null || true
    sudo cp "$PROJECT_DIR/system/projektseite.conf" /etc/environment.d/ 2>/dev/null || true
    
    # Lade Systemd neu
    sudo systemctl daemon-reload
    
    # Entferne temporäre System-Dateien
    rm -rf "$PROJECT_DIR/system"
fi

# Stelle Logs wieder her
log_info "Stelle Logs wieder her..."
if [ -d "$PROJECT_DIR/logs" ]; then
    sudo cp -r "$PROJECT_DIR/logs"/* /var/log/projektseite/ 2>/dev/null || true
    sudo chown -R $USER:$USER /var/log/projektseite
    
    # Entferne temporäre Log-Dateien
    rm -rf "$PROJECT_DIR/logs"
fi

# Setze Berechtigungen
log_info "Setze Berechtigungen..."
chmod +x "$PROJECT_DIR/scripts"/*.sh

# Starte Docker-Container
log_info "Starte Docker-Container..."
docker-compose up -d

# Warte auf Container-Start
log_info "Warte auf Container-Start..."
sleep 20

# Prüfe Container-Status
log_info "Prüfe Container-Status..."
docker-compose ps

# Prüfe Verbindungen
log_info "Prüfe Verbindungen..."

# Backend
if curl -s http://localhost:3001/health > /dev/null; then
    log_success "Backend ist bereit"
else
    log_warning "Backend ist noch nicht bereit"
fi

# Frontend
if curl -s http://localhost:3000 > /dev/null; then
    log_success "Frontend ist bereit"
else
    log_warning "Frontend ist noch nicht bereit"
fi

# Bereinige temporäre Dateien
log_info "Bereinige temporäre Dateien..."
rm -rf "$RESTORE_DIR"

# Erstelle Restore-Report
REPORT_FILE="$PROJECT_DIR/restore-report-$(date +%Y%m%d-%H%M%S).md"
cat > "$REPORT_FILE" <<EOF
# System Restore Report - $(date)

## Restore-Zusammenfassung
- **Backup-Datei:** $BACKUP_FILE
- **Datum:** $(date)
- **Benutzer:** $USER
- **Status:** Abgeschlossen

## Wiederhergestellte Daten
- Projektdateien (inkl. Git-Historie)
- Datenbank (falls verfügbar)
- System-Konfiguration
- Logs

## Container-Status nach Restore
\`\`\`
$(docker-compose ps)
\`\`\`

## Sicherungs-Backup
- **Verzeichnis:** $CURRENT_BACKUP
- **Enthält:** Alle Daten vor dem Restore

## Nächste Schritte
1. Überprüfen Sie alle Funktionen
2. Testen Sie die Datenbank-Verbindungen
3. Prüfen Sie die Logs auf Fehler

---
*Generiert automatisch von restore-system.sh*
EOF

# Finale Nachricht
echo ""
log_success "System-Restore erfolgreich abgeschlossen!"
log_info "Restore-Report: $REPORT_FILE"
log_info "Sicherungs-Backup: $CURRENT_BACKUP"
echo ""
log_warning "Bitte überprüfen Sie alle Funktionen nach dem Restore!"
echo ""

# Zeige aktuelle URLs
echo "🌐 Verfügbare Services:"
echo "   Frontend (Admin): http://localhost:3000"
echo "   Backend API:      http://localhost:3001"
echo "   Grafana:          http://localhost:3002"
echo "   PostgreSQL:       localhost:5432"
