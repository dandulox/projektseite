#!/bin/bash

# ===== PROJEKTSEITE SYSTEM CLEAN SCRIPT =====
# Sanfte Bereinigung des Systems (behält Daten)
# Für Updates und Wartung ohne Datenverlust
# Erstellt: $(date)

set -e

echo "🧽 Starte System-Clean für Projektseite..."

# Farben für Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
PROJECT_DIR="/opt/projektseite"

# Prüfe ob als Root ausgeführt
if [[ $EUID -eq 0 ]]; then
   log_info "Skript wird als Root ausgeführt - das ist in Ordnung"
else
   log_warning "Skript wird nicht als Root ausgeführt - einige Operationen könnten fehlschlagen"
fi

echo ""
log_info "=== PROJEKTSEITE SYSTEM CLEAN ==="

# 1. Docker-Container stoppen (ohne zu entfernen)
log_info "Stoppe Docker-Container..."
cd "$PROJECT_DIR" 2>/dev/null || log_warning "Projektverzeichnis nicht gefunden"

if [ -f "docker/docker-compose.yml" ]; then
    docker-compose -f docker/docker-compose.yml down 2>/dev/null || log_warning "Docker-Compose nicht verfügbar oder Container bereits gestoppt"
    log_success "Docker-Container gestoppt"
else
    log_warning "Docker-Compose-Datei nicht gefunden"
fi

# 2. Systemd-Service stoppen
log_info "Stoppe Systemd-Service..."
systemctl stop projektseite.service 2>/dev/null || log_warning "Service bereits gestoppt oder nicht vorhanden"
log_success "Systemd-Service gestoppt"

# 3. Logs bereinigen
log_info "Bereinige Log-Dateien..."
LOG_DIR="/var/log/projektseite"
if [ -d "$LOG_DIR" ]; then
    find "$LOG_DIR" -name "*.log" -type f -mtime +7 -delete 2>/dev/null || log_warning "Log-Bereinigung fehlgeschlagen"
    log_success "Alte Log-Dateien bereinigt"
else
    log_warning "Log-Verzeichnis nicht gefunden"
fi

# 4. Docker-System bereinigen
log_info "Bereinige Docker-System..."
docker system prune -f 2>/dev/null || log_warning "Docker-System-Bereinigung fehlgeschlagen"
log_success "Docker-System bereinigt"

# 5. Temporäre Dateien bereinigen
log_info "Bereinige temporäre Dateien..."
rm -rf /tmp/projektseite-* 2>/dev/null || true
rm -rf "$PROJECT_DIR/tmp" 2>/dev/null || true
log_success "Temporäre Dateien bereinigt"

# 6. Node.js Cache bereinigen (falls vorhanden)
log_info "Bereinige Node.js Cache..."
if [ -d "$PROJECT_DIR/backend/node_modules" ]; then
    cd "$PROJECT_DIR/backend"
    npm cache clean --force 2>/dev/null || log_warning "NPM Cache-Bereinigung fehlgeschlagen"
    log_success "Node.js Cache bereinigt"
fi

if [ -d "$PROJECT_DIR/frontend/node_modules" ]; then
    cd "$PROJECT_DIR/frontend"
    npm cache clean --force 2>/dev/null || log_warning "NPM Cache-Bereinigung fehlgeschlagen"
    log_success "Frontend Cache bereinigt"
fi

# 7. Alte Backups bereinigen (älter als 30 Tage)
log_info "Bereinige alte Backups..."
BACKUP_DIR="/opt/backups/projektseite"
if [ -d "$BACKUP_DIR" ]; then
    find "$BACKUP_DIR" -name "*.sql" -type f -mtime +30 -delete 2>/dev/null || log_warning "Backup-Bereinigung fehlgeschlagen"
    log_success "Alte Backups bereinigt"
else
    log_warning "Backup-Verzeichnis nicht gefunden"
fi

# 8. Verbleibende Prozesse beenden
log_info "Beende verbleibende Projektseite-Prozesse..."
pkill -f "projektseite" 2>/dev/null || log_warning "Keine Projektseite-Prozesse gefunden"
log_success "Verbleibende Prozesse beendet"

# 9. System-Status anzeigen
log_info "System-Status nach Bereinigung:"
echo ""
log_info "Docker-Container:"
docker ps -a --filter "name=projektseite" 2>/dev/null || log_warning "Docker nicht verfügbar"

echo ""
log_info "Docker-Volumes:"
docker volume ls --filter "name=projektseite" 2>/dev/null || log_warning "Docker nicht verfügbar"

echo ""
log_info "Systemd-Service:"
systemctl is-active projektseite.service 2>/dev/null || log_warning "Service nicht aktiv"

# 10. Zusammenfassung
echo ""
log_success "=== SYSTEM CLEAN ABGESCHLOSSEN ==="
echo ""
log_info "Bereinigt:"
log_info "  ✅ Docker-Container gestoppt"
log_info "  ✅ Systemd-Service gestoppt"
log_info "  ✅ Alte Log-Dateien entfernt"
log_info "  ✅ Docker-System bereinigt"
log_info "  ✅ Temporäre Dateien entfernt"
log_info "  ✅ Node.js Cache bereinigt"
log_info "  ✅ Alte Backups entfernt"
log_info "  ✅ Verbleibende Prozesse beendet"
echo ""
log_info "Erhalten:"
log_info "  📁 Alle Projektdateien"
log_info "  📁 Datenbank-Daten"
log_info "  📁 Konfigurationen"
log_info "  📁 Aktuelle Backups"
echo ""
log_success "Das System ist bereinigt und bereit für einen Neustart!"
echo ""
log_info "Nächste Schritte:"
log_info "1. Starte das System: ./scripts/start-docker.sh"
log_info "2. Oder führe Updates aus: ./scripts/update-system.sh"
echo ""

log_success "System-Clean erfolgreich abgeschlossen! 🧽✨"
