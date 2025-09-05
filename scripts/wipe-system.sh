#!/bin/bash

# ===== PROJEKTSEITE SYSTEM WIPE SCRIPT =====
# Löscht das gesamte Projekt sauber vom Server (außer Scripts-Ordner)
# Für eine komplett frische Installation
# Erstellt: $(date)

set -e

echo "🧹 Starte System-Wipe für Projektseite..."

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
BACKUP_DIR="/opt/backups/projektseite"
LOG_DIR="/var/log/projektseite"
MONITORING_DIR="/opt/monitoring"

# Prüfe ob als Root ausgeführt
if [[ $EUID -eq 0 ]]; then
   log_info "Skript wird als Root ausgeführt - das ist in Ordnung"
else
   log_warning "Skript wird nicht als Root ausgeführt - einige Operationen könnten fehlschlagen"
fi

# Bestätigung einholen
echo ""
log_warning "⚠️  WARNUNG: Dieses Skript wird das gesamte Projektseite-System löschen!"
log_warning "⚠️  Alle Daten, Konfigurationen und Container werden entfernt!"
log_warning "⚠️  Nur der Scripts-Ordner bleibt erhalten."
echo ""
read -p "Sind Sie sicher, dass Sie fortfahren möchten? (Geben Sie 'WIPE' ein): " CONFIRM

if [ "$CONFIRM" != "WIPE" ]; then
    log_info "Wipe abgebrochen"
    exit 0
fi

echo ""
log_info "=== PROJEKTSEITE SYSTEM WIPE ==="

# 1. Docker-Container stoppen und entfernen
log_info "Stoppe und entferne Docker-Container..."
cd "$PROJECT_DIR" 2>/dev/null || log_warning "Projektverzeichnis nicht gefunden"

if [ -f "docker/docker-compose.yml" ]; then
    # Container stoppen
    docker-compose -f docker/docker-compose.yml down --volumes --remove-orphans 2>/dev/null || log_warning "Docker-Compose nicht verfügbar oder Container bereits gestoppt"
    
    # Alle Projektseite-Container entfernen
    docker ps -a --filter "name=projektseite" --format "table {{.Names}}" | grep -v "NAMES" | xargs -r docker rm -f 2>/dev/null || log_warning "Keine Projektseite-Container gefunden"
    
    # Alle Projektseite-Images entfernen
    docker images --filter "reference=*projektseite*" --format "table {{.Repository}}:{{.Tag}}" | grep -v "REPOSITORY" | xargs -r docker rmi -f 2>/dev/null || log_warning "Keine Projektseite-Images gefunden"
    
    # Alle Projektseite-Volumes entfernen
    docker volume ls --filter "name=projektseite" --format "table {{.Name}}" | grep -v "DRIVER" | xargs -r docker volume rm -f 2>/dev/null || log_warning "Keine Projektseite-Volumes gefunden"
    
    # Alle Projektseite-Netzwerke entfernen
    docker network ls --filter "name=projektseite" --format "table {{.Name}}" | grep -v "NETWORK" | xargs -r docker network rm -f 2>/dev/null || log_warning "Keine Projektseite-Netzwerke gefunden"
    
    log_success "Docker-Container, Images, Volumes und Netzwerke entfernt"
else
    log_warning "Docker-Compose-Datei nicht gefunden"
fi

# 2. Systemd-Service stoppen und deaktivieren
log_info "Stoppe und deaktiviere Systemd-Service..."
systemctl stop projektseite.service 2>/dev/null || log_warning "Service bereits gestoppt oder nicht vorhanden"
systemctl disable projektseite.service 2>/dev/null || log_warning "Service bereits deaktiviert oder nicht vorhanden"
log_success "Systemd-Service gestoppt und deaktiviert"

# 3. Projektverzeichnis-Inhalt löschen (außer Scripts)
log_info "Lösche Projektverzeichnis-Inhalt (außer Scripts)..."
if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
    
    # Erstelle temporären Scripts-Backup
    if [ -d "scripts" ]; then
        log_info "Erstelle temporären Scripts-Backup..."
        cp -r scripts /tmp/projektseite-scripts-backup
        log_success "Scripts-Backup erstellt"
    fi
    
    # Lösche alles außer Scripts
    find . -maxdepth 1 -not -name "scripts" -not -name "." -exec rm -rf {} + 2>/dev/null || log_warning "Einige Dateien konnten nicht gelöscht werden"
    
    # Stelle Scripts wieder her
    if [ -d "/tmp/projektseite-scripts-backup" ]; then
        mv /tmp/projektseite-scripts-backup scripts
        log_success "Scripts wiederhergestellt"
    fi
    
    log_success "Projektverzeichnis-Inhalt gelöscht (Scripts erhalten)"
else
    log_warning "Projektverzeichnis nicht gefunden: $PROJECT_DIR"
fi

# 4. Backup-Verzeichnis löschen
log_info "Lösche Backup-Verzeichnis..."
if [ -d "$BACKUP_DIR" ]; then
    rm -rf "$BACKUP_DIR"
    log_success "Backup-Verzeichnis gelöscht"
else
    log_warning "Backup-Verzeichnis nicht gefunden: $BACKUP_DIR"
fi

# 5. Log-Verzeichnis löschen
log_info "Lösche Log-Verzeichnis..."
if [ -d "$LOG_DIR" ]; then
    rm -rf "$LOG_DIR"
    log_success "Log-Verzeichnis gelöscht"
else
    log_warning "Log-Verzeichnis nicht gefunden: $LOG_DIR"
fi

# 6. Monitoring-Verzeichnis löschen
log_info "Lösche Monitoring-Verzeichnis..."
if [ -d "$MONITORING_DIR" ]; then
    rm -rf "$MONITORING_DIR"
    log_success "Monitoring-Verzeichnis gelöscht"
else
    log_warning "Monitoring-Verzeichnis nicht gefunden: $MONITORING_DIR"
fi

# 7. Systemd-Service-Datei entfernen
log_info "Entferne Systemd-Service-Datei..."
if [ -f "/etc/systemd/system/projektseite.service" ]; then
    rm -f /etc/systemd/system/projektseite.service
    systemctl daemon-reload
    log_success "Systemd-Service-Datei entfernt"
else
    log_warning "Systemd-Service-Datei nicht gefunden"
fi

# 8. Log-Rotation-Konfiguration entfernen
log_info "Entferne Log-Rotation-Konfiguration..."
if [ -f "/etc/logrotate.d/projektseite" ]; then
    rm -f /etc/logrotate.d/projektseite
    log_success "Log-Rotation-Konfiguration entfernt"
else
    log_warning "Log-Rotation-Konfiguration nicht gefunden"
fi

# 9. Umgebungsvariablen-Datei entfernen
log_info "Entferne Umgebungsvariablen-Datei..."
if [ -f "/etc/environment.d/projektseite.conf" ]; then
    rm -f /etc/environment.d/projektseite.conf
    log_success "Umgebungsvariablen-Datei entfernt"
else
    log_warning "Umgebungsvariablen-Datei nicht gefunden"
fi

# 10. Cron-Jobs entfernen
log_info "Entferne Cron-Jobs..."
if [[ $EUID -eq 0 ]]; then
    ACTUAL_USER=${SUDO_USER:-$USER}
    if [ -n "$ACTUAL_USER" ]; then
        # Entferne Projektseite-Cron-Jobs
        crontab -u $ACTUAL_USER -l 2>/dev/null | grep -v "projektseite" | crontab -u $ACTUAL_USER - 2>/dev/null || log_warning "Keine Cron-Jobs für Benutzer $ACTUAL_USER gefunden"
        log_success "Cron-Jobs für Benutzer $ACTUAL_USER entfernt"
    fi
else
    # Entferne Projektseite-Cron-Jobs
    crontab -l 2>/dev/null | grep -v "projektseite" | crontab - 2>/dev/null || log_warning "Keine Cron-Jobs gefunden"
    log_success "Cron-Jobs entfernt"
fi

# 11. Docker-Images bereinigen (optional)
log_info "Bereinige Docker-System..."
docker system prune -f 2>/dev/null || log_warning "Docker-System-Bereinigung fehlgeschlagen"
log_success "Docker-System bereinigt"

# 12. Verbleibende Projektseite-Prozesse beenden
log_info "Beende verbleibende Projektseite-Prozesse..."
pkill -f "projektseite" 2>/dev/null || log_warning "Keine Projektseite-Prozesse gefunden"
log_success "Verbleibende Prozesse beendet"

# 13. Verzeichnisstruktur prüfen
log_info "Prüfe verbleibende Verzeichnisstruktur..."
if [ -d "$PROJECT_DIR" ]; then
    REMAINING_FILES=$(find "$PROJECT_DIR" -maxdepth 1 -not -name "scripts" -not -name "." | wc -l)
    if [ "$REMAINING_FILES" -eq 0 ]; then
        log_success "Projektverzeichnis ist sauber (nur Scripts-Ordner verbleibt)"
    else
        log_warning "Noch $REMAINING_FILES Dateien/Ordner im Projektverzeichnis"
        ls -la "$PROJECT_DIR"
    fi
else
    log_warning "Projektverzeichnis existiert nicht mehr"
fi

# 14. Finale Bereinigung
log_info "Führe finale Bereinigung durch..."
# Entferne temporäre Dateien
rm -rf /tmp/projektseite-* 2>/dev/null || true

# Bereinige Docker-Volumes (falls noch vorhanden)
docker volume prune -f 2>/dev/null || log_warning "Docker-Volume-Bereinigung fehlgeschlagen"

log_success "Finale Bereinigung abgeschlossen"

# 15. Zusammenfassung
echo ""
log_success "=== SYSTEM WIPE ABGESCHLOSSEN ==="
echo ""
log_info "Entfernt:"
log_info "  ✅ Docker-Container, Images, Volumes und Netzwerke"
log_info "  ✅ Systemd-Service und Konfiguration"
log_info "  ✅ Projektverzeichnis-Inhalt (außer Scripts)"
log_info "  ✅ Backup-, Log- und Monitoring-Verzeichnisse"
log_info "  ✅ Cron-Jobs und Umgebungsvariablen"
log_info "  ✅ Verbleibende Prozesse"
echo ""
log_info "Erhalten:"
log_info "  📁 Scripts-Ordner: $PROJECT_DIR/scripts"
log_info "  📁 Projektverzeichnis: $PROJECT_DIR (leer, außer Scripts)"
echo ""
log_success "Das System ist jetzt bereit für eine komplett frische Installation!"
echo ""
log_info "Nächste Schritte für frische Installation:"
log_info "1. Führe setup-server.sh aus: ./scripts/setup-server.sh"
log_info "2. Oder klone das Projekt neu: git clone <repository-url> ."
log_info "3. Starte das System: ./scripts/start-docker.sh"
echo ""

# 16. Optional: Verzeichnis komplett entfernen (mit Bestätigung)
echo ""
read -p "Möchten Sie auch das Projektverzeichnis komplett entfernen? (j/N): " REMOVE_DIR

if [[ $REMOVE_DIR =~ ^[Jj]$ ]]; then
    log_info "Entferne Projektverzeichnis komplett..."
    if [ -d "$PROJECT_DIR" ]; then
        rm -rf "$PROJECT_DIR"
        log_success "Projektverzeichnis komplett entfernt"
        echo ""
        log_info "Für eine neue Installation:"
        log_info "1. Erstelle neues Verzeichnis: mkdir -p $PROJECT_DIR"
        log_info "2. Klone das Projekt: git clone <repository-url> $PROJECT_DIR"
        log_info "3. Führe setup-server.sh aus"
    else
        log_warning "Projektverzeichnis existiert nicht mehr"
    fi
else
    log_info "Projektverzeichnis bleibt erhalten (nur Scripts-Ordner)"
fi

echo ""
log_success "System-Wipe erfolgreich abgeschlossen! 🧹✨"
