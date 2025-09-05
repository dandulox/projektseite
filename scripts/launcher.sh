#!/bin/bash

# ===== PROJEKTSEITE LAUNCHER SCRIPT =====
# Einfacher Launcher für das Main Control System
# Erstellt: $(date)

set -e

echo "🚀 Projektseite Launcher"
echo "======================="

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
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Prüfe ob als Root ausgeführt
if [[ $EUID -eq 0 ]]; then
    log_info "Script wird als Root ausgeführt"
else
    log_warning "Script wird nicht als Root ausgeführt - einige Operationen könnten fehlschlagen"
fi

# Verfügbare Launcher-Optionen
show_launcher_menu() {
    echo ""
    echo "🚀 PROJEKTSEITE LAUNCHER"
    echo "========================"
    echo ""
    echo "1) Main Control (Interaktive Steuerung)"
    echo "2) Batch Runner (Batch-Ausführung)"
    echo "3) Batch Creator (Batch-Erstellung)"
    echo "4) Schnellstart-Optionen"
    echo "5) System-Status"
    echo "6) Hilfe anzeigen"
    echo "0) Beenden"
    echo ""
}

# Schnellstart-Optionen
show_quickstart_menu() {
    echo ""
    echo "⚡ SCHNELLSTART-OPTIONEN"
    echo "======================="
    echo ""
    echo "1) Komplette Installation"
    echo "2) System-Update"
    echo "3) System-Backup"
    echo "4) System-Wartung"
    echo "5) FastPatch (Patch-Manager)"
    echo "6) FastUpdate (App-Update)"
    echo "7) System-Wipe"
    echo "0) Zurück"
    echo ""
}

# Schnellstart ausführen
execute_quickstart() {
    local choice="$1"
    
    case $choice in
        1)
            log_info "Starte komplette Installation..."
            "$SCRIPT_DIR/batch-runner.sh" -p install
            ;;
        2)
            log_info "Starte System-Update..."
            "$SCRIPT_DIR/batch-runner.sh" -p update
            ;;
        3)
            log_info "Starte System-Backup..."
            "$SCRIPT_DIR/batch-runner.sh" -p backup
            ;;
        4)
            log_info "Starte System-Wartung..."
            "$SCRIPT_DIR/batch-runner.sh" -p maintenance
            ;;
        5)
            log_info "Starte FastPatch (Patch-Manager)..."
            if [ -f "$SCRIPT_DIR/patches/patch-manager.sh" ]; then
                "$SCRIPT_DIR/patches/patch-manager.sh"
            else
                log_error "Patch-Manager nicht gefunden: $SCRIPT_DIR/patches/patch-manager.sh"
                echo "Verfügbare Patches:"
                ls -la "$SCRIPT_DIR/patches/"*.sh 2>/dev/null || echo "Keine Patch-Scripts gefunden"
            fi
            ;;
        6)
            log_info "Starte FastUpdate (App-Update)..."
            if [ -f "$SCRIPT_DIR/update-app.sh" ]; then
                "$SCRIPT_DIR/update-app.sh"
            else
                log_error "Update-App Script nicht gefunden: $SCRIPT_DIR/update-app.sh"
                echo "Verfügbare Update-Scripts:"
                ls -la "$SCRIPT_DIR/"*update*.sh 2>/dev/null || echo "Keine Update-Scripts gefunden"
            fi
            ;;
        7)
            log_info "Starte System-Wipe..."
            "$SCRIPT_DIR/batch-runner.sh" -p wipe
            ;;
    esac
}

# System-Status anzeigen
show_system_status() {
    echo ""
    log_info "System-Status:"
    echo ""
    
    # Docker-Status
    echo "🐳 Docker-Container:"
    if command -v docker >/dev/null 2>&1; then
        docker ps -a --filter "name=projektseite" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || log_warning "Docker nicht verfügbar"
    else
        log_warning "Docker nicht installiert"
    fi
    
    echo ""
    echo "🔧 Systemd-Service:"
    systemctl is-active projektseite.service 2>/dev/null && log_success "Service aktiv" || log_warning "Service inaktiv"
    
    echo ""
    echo "📁 Verzeichnisse:"
    [ -d "/opt/projektseite" ] && log_success "Projektverzeichnis: /opt/projektseite" || log_warning "Projektverzeichnis nicht gefunden"
    [ -d "/opt/backups/projektseite" ] && log_success "Backup-Verzeichnis vorhanden" || log_warning "Backup-Verzeichnis nicht gefunden"
    [ -d "/var/log/projektseite" ] && log_success "Log-Verzeichnis vorhanden" || log_warning "Log-Verzeichnis nicht gefunden"
    
    echo ""
    echo "💾 Speicherplatz:"
    df -h /opt 2>/dev/null | tail -1 | awk '{print "Verfügbar: " $4 " von " $2 " (" $5 " belegt)"}'
}

# Hilfe anzeigen
show_help() {
    echo ""
    echo "🚀 PROJEKTSEITE LAUNCHER"
    echo "========================"
    echo ""
    echo "Dieser Launcher bietet einfachen Zugang zu allen Projektseite-Scripts:"
    echo ""
    echo "📋 Verfügbare Optionen:"
    echo "  1) Main Control    - Interaktive Steuerung aller Scripts"
    echo "  2) Batch Runner    - Batch-Ausführung von Scripts"
    echo "  3) Batch Creator   - Batch-Dateien erstellen und verwalten"
    echo "  4) Schnellstart    - Vordefinierte Operationssequenzen"
    echo "     - FastPatch     - Patch-Manager für Systemupdates"
    echo "     - FastUpdate    - Schnelles App-Update"
    echo "  5) System-Status   - Aktueller Systemzustand"
    echo "  6) Hilfe           - Diese Hilfe anzeigen"
    echo ""
    echo "🔧 Verwendung:"
    echo "  sudo ./scripts/launcher.sh"
    echo ""
    echo "📚 Weitere Informationen:"
    echo "  - README-MAIN-CONTROL.md - Vollständige Dokumentation"
    echo "  - README-WIPE.md - Wipe-Scripts Dokumentation"
    echo ""
    echo "⚠️  Wichtige Hinweise:"
    echo "  - Scripts benötigen Root-Rechte"
    echo "  - Alle Aktionen werden protokolliert"
    echo "  - Bei kritischen Operationen wird nach Bestätigung gefragt"
    echo ""
}

# Hauptschleife
main() {
    while true; do
        show_launcher_menu
        read -p "Wählen Sie eine Option (0-6): " choice
        
        case $choice in
            1)
                log_info "Starte Main Control..."
                "$SCRIPT_DIR/main-control.sh"
                ;;
            2)
                log_info "Starte Batch Runner..."
                "$SCRIPT_DIR/batch-runner.sh" -h
                echo ""
                read -p "Drücken Sie Enter, um fortzufahren..."
                ;;
            3)
                log_info "Starte Batch Creator..."
                "$SCRIPT_DIR/create-batch.sh"
                ;;
            4)
                while true; do
                    show_quickstart_menu
                    read -p "Wählen Sie eine Schnellstart-Option (0-7): " quickstart_choice
                    
                    case $quickstart_choice in
                        1|2|3|4|5|6|7)
                            execute_quickstart "$quickstart_choice"
                            break
                            ;;
                        0)
                            break
                            ;;
                        *)
                            log_warning "Ungültige Auswahl"
                            ;;
                    esac
                done
                ;;
            5)
                show_system_status
                echo ""
                read -p "Drücken Sie Enter, um fortzufahren..."
                ;;
            6)
                show_help
                echo ""
                read -p "Drücken Sie Enter, um fortzufahren..."
                ;;
            0)
                log_info "Launcher beendet"
                break
                ;;
            *)
                log_warning "Ungültige Option. Bitte wählen Sie 0-6."
                ;;
        esac
        
        echo ""
    done
}

# Script starten
main "$@"
