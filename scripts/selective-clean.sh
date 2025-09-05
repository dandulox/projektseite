#!/bin/bash

# ===== PROJEKTSEITE SELECTIVE CLEAN SCRIPT =====
# Selektive Bereinigung mit Benutzerauswahl
# Erstellt: $(date)

set -e

echo "🎯 Starte selektive Bereinigung für Projektseite..."

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
log_info "=== PROJEKTSEITE SELECTIVE CLEAN ==="
echo ""

# Menü-Funktion
show_menu() {
    echo "Wählen Sie die Bereinigungsoptionen:"
    echo ""
    echo "1) Docker-Container stoppen und entfernen"
    echo "2) Docker-Images entfernen"
    echo "3) Docker-Volumes entfernen"
    echo "4) Docker-Netzwerke entfernen"
    echo "5) Log-Dateien bereinigen"
    echo "6) Temporäre Dateien bereinigen"
    echo "7) Node.js Cache bereinigen"
    echo "8) Alte Backups entfernen"
    echo "9) Systemd-Service stoppen"
    echo "10) Alle Docker-Ressourcen entfernen"
    echo "11) Komplette Bereinigung (außer Daten)"
    echo "0) Beenden"
    echo ""
}

# Docker-Container stoppen und entfernen
clean_containers() {
    log_info "Stoppe und entferne Docker-Container..."
    cd "$PROJECT_DIR" 2>/dev/null || log_warning "Projektverzeichnis nicht gefunden"
    
    if [ -f "docker/docker-compose.yml" ]; then
        docker-compose -f docker/docker-compose.yml down --remove-orphans 2>/dev/null || log_warning "Docker-Compose nicht verfügbar"
    fi
    
    docker ps -a --filter "name=projektseite" --format "table {{.Names}}" | grep -v "NAMES" | xargs -r docker rm -f 2>/dev/null || log_warning "Keine Container gefunden"
    log_success "Docker-Container entfernt"
}

# Docker-Images entfernen
clean_images() {
    log_info "Entferne Docker-Images..."
    docker images --filter "reference=*projektseite*" --format "table {{.Repository}}:{{.Tag}}" | grep -v "REPOSITORY" | xargs -r docker rmi -f 2>/dev/null || log_warning "Keine Images gefunden"
    log_success "Docker-Images entfernt"
}

# Docker-Volumes entfernen
clean_volumes() {
    log_info "Entferne Docker-Volumes..."
    docker volume ls --filter "name=projektseite" --format "table {{.Name}}" | grep -v "DRIVER" | xargs -r docker volume rm -f 2>/dev/null || log_warning "Keine Volumes gefunden"
    log_success "Docker-Volumes entfernt"
}

# Docker-Netzwerke entfernen
clean_networks() {
    log_info "Entferne Docker-Netzwerke..."
    docker network ls --filter "name=projektseite" --format "table {{.Name}}" | grep -v "NETWORK" | xargs -r docker network rm -f 2>/dev/null || log_warning "Keine Netzwerke gefunden"
    log_success "Docker-Netzwerke entfernt"
}

# Log-Dateien bereinigen
clean_logs() {
    log_info "Bereinige Log-Dateien..."
    LOG_DIR="/var/log/projektseite"
    if [ -d "$LOG_DIR" ]; then
        find "$LOG_DIR" -name "*.log" -type f -mtime +7 -delete 2>/dev/null || log_warning "Log-Bereinigung fehlgeschlagen"
        log_success "Log-Dateien bereinigt"
    else
        log_warning "Log-Verzeichnis nicht gefunden"
    fi
}

# Temporäre Dateien bereinigen
clean_temp() {
    log_info "Bereinige temporäre Dateien..."
    rm -rf /tmp/projektseite-* 2>/dev/null || true
    rm -rf "$PROJECT_DIR/tmp" 2>/dev/null || true
    log_success "Temporäre Dateien bereinigt"
}

# Node.js Cache bereinigen
clean_node_cache() {
    log_info "Bereinige Node.js Cache..."
    if [ -d "$PROJECT_DIR/backend" ]; then
        cd "$PROJECT_DIR/backend"
        npm cache clean --force 2>/dev/null || log_warning "Backend Cache-Bereinigung fehlgeschlagen"
    fi
    
    if [ -d "$PROJECT_DIR/frontend" ]; then
        cd "$PROJECT_DIR/frontend"
        npm cache clean --force 2>/dev/null || log_warning "Frontend Cache-Bereinigung fehlgeschlagen"
    fi
    log_success "Node.js Cache bereinigt"
}

# Alte Backups entfernen
clean_backups() {
    log_info "Entferne alte Backups..."
    BACKUP_DIR="/opt/backups/projektseite"
    if [ -d "$BACKUP_DIR" ]; then
        find "$BACKUP_DIR" -name "*.sql" -type f -mtime +30 -delete 2>/dev/null || log_warning "Backup-Bereinigung fehlgeschlagen"
        log_success "Alte Backups entfernt"
    else
        log_warning "Backup-Verzeichnis nicht gefunden"
    fi
}

# Systemd-Service stoppen
stop_service() {
    log_info "Stoppe Systemd-Service..."
    systemctl stop projektseite.service 2>/dev/null || log_warning "Service bereits gestoppt oder nicht vorhanden"
    log_success "Systemd-Service gestoppt"
}

# Alle Docker-Ressourcen entfernen
clean_all_docker() {
    log_info "Entferne alle Docker-Ressourcen..."
    clean_containers
    clean_images
    clean_volumes
    clean_networks
    docker system prune -f 2>/dev/null || log_warning "Docker-System-Bereinigung fehlgeschlagen"
    log_success "Alle Docker-Ressourcen entfernt"
}

# Komplette Bereinigung
clean_complete() {
    log_info "Führe komplette Bereinigung durch..."
    clean_all_docker
    clean_logs
    clean_temp
    clean_node_cache
    clean_backups
    stop_service
    pkill -f "projektseite" 2>/dev/null || log_warning "Keine Prozesse gefunden"
    log_success "Komplette Bereinigung abgeschlossen"
}

# Hauptschleife
while true; do
    show_menu
    read -p "Wählen Sie eine Option (0-11): " choice
    
    case $choice in
        1)
            clean_containers
            ;;
        2)
            clean_images
            ;;
        3)
            clean_volumes
            ;;
        4)
            clean_networks
            ;;
        5)
            clean_logs
            ;;
        6)
            clean_temp
            ;;
        7)
            clean_node_cache
            ;;
        8)
            clean_backups
            ;;
        9)
            stop_service
            ;;
        10)
            clean_all_docker
            ;;
        11)
            clean_complete
            ;;
        0)
            log_info "Bereinigung beendet"
            break
            ;;
        *)
            log_warning "Ungültige Option. Bitte wählen Sie 0-11."
            ;;
    esac
    
    echo ""
    read -p "Drücken Sie Enter, um fortzufahren..."
    echo ""
done

echo ""
log_success "Selektive Bereinigung abgeschlossen! 🎯✨"
