#!/bin/bash

# ===== PROJEKTSEITE MAIN CONTROL SCRIPT =====
# Hauptscript zur Steuerung aller anderen Scripts
# Unterstützt Einzelausführung und Warteschlangen
# Erstellt: $(date)

set -e

echo "🎮 Projektseite Main Control Script"
echo "=================================="

# Farben für Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

log_queue() {
    echo -e "${PURPLE}[QUEUE]${NC} $1"
}

log_running() {
    echo -e "${CYAN}[RUNNING]${NC} $1"
}

# Konfiguration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="/opt/projektseite"
QUEUE_FILE="/tmp/projektseite-queue.txt"
LOG_FILE="/var/log/projektseite/main-control.log"

# Erstelle Log-Verzeichnis falls nicht vorhanden
mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true

# Logging-Funktion
log_to_file() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Verfügbare Scripts definieren
declare -A SCRIPTS=(
    ["setup"]="setup-server.sh|Server-Setup (komplette Installation)"
    ["start"]="start-docker.sh|Docker-Container starten"
    ["stop"]="stop-docker.sh|Docker-Container stoppen"
    ["restart"]="restart-docker.sh|Docker-Container neu starten"
    ["update"]="update-system.sh|System-Updates anwenden"
    ["backup"]="backup-system.sh|System-Backup erstellen"
    ["restore"]="restore-system.sh|System-Backup wiederherstellen"
    ["patch"]="db-patch.sh|Datenbank-Patches anwenden"
    ["clean"]="clean-system.sh|Sanfte Systembereinigung"
    ["wipe"]="wipe-system.sh|Kompletter System-Wipe"
    ["selective"]="selective-clean.sh|Selektive Bereinigung"
    ["logs"]="check-logs.sh|Log-Dateien überprüfen"
    ["test"]="test-connection.sh|Verbindungen testen"
    ["debug"]="debug-build.sh|Debug-Build durchführen"
    ["fix"]="fix-systemd.sh|Systemd-Probleme beheben"
    ["admin"]="create-admin-user.sh|Admin-Benutzer erstellen"
)

# Script-Status prüfen
check_script_exists() {
    local script_name="$1"
    local script_file="${SCRIPTS[$script_name]%%|*}"
    
    if [ -f "$SCRIPT_DIR/$script_file" ]; then
        return 0
    else
        return 1
    fi
}

# Script ausführen
execute_script() {
    local script_name="$1"
    local script_file="${SCRIPTS[$script_name]%%|*}"
    local script_description="${SCRIPTS[$script_name]##*|}"
    
    if ! check_script_exists "$script_name"; then
        log_error "Script '$script_name' nicht gefunden: $script_file"
        return 1
    fi
    
    log_running "Führe aus: $script_description"
    log_to_file "Starting: $script_name ($script_file)"
    
    # Script ausführbar machen
    chmod +x "$SCRIPT_DIR/$script_file" 2>/dev/null || true
    
    # Script ausführen
    if "$SCRIPT_DIR/$script_file"; then
        log_success "Script '$script_name' erfolgreich ausgeführt"
        log_to_file "Completed: $script_name - SUCCESS"
        return 0
    else
        log_error "Script '$script_name' fehlgeschlagen"
        log_to_file "Failed: $script_name - ERROR"
        return 1
    fi
}

# Warteschlange verwalten
add_to_queue() {
    local script_name="$1"
    echo "$script_name" >> "$QUEUE_FILE"
    log_queue "Script '$script_name' zur Warteschlange hinzugefügt"
}

# Warteschlange anzeigen
show_queue() {
    if [ -f "$QUEUE_FILE" ] && [ -s "$QUEUE_FILE" ]; then
        echo ""
        log_info "Aktuelle Warteschlange:"
        local counter=1
        while IFS= read -r script; do
            local description="${SCRIPTS[$script]##*|}"
            echo "  $counter) $script - $description"
            ((counter++))
        done < "$QUEUE_FILE"
        echo ""
    else
        log_info "Warteschlange ist leer"
    fi
}

# Warteschlange abarbeiten
process_queue() {
    if [ ! -f "$QUEUE_FILE" ] || [ ! -s "$QUEUE_FILE" ]; then
        log_warning "Warteschlange ist leer"
        return 0
    fi
    
    echo ""
    log_info "Beginne Warteschlangen-Abarbeitung..."
    echo ""
    
    local total_scripts=$(wc -l < "$QUEUE_FILE")
    local current_script=0
    local success_count=0
    local error_count=0
    
    while IFS= read -r script_name; do
        ((current_script++))
        echo "=========================================="
        log_queue "Script $current_script von $total_scripts: $script_name"
        echo "=========================================="
        
        if execute_script "$script_name"; then
            ((success_count++))
        else
            ((error_count++))
            
            # Bei Fehler: Benutzer fragen, ob fortgefahren werden soll
            echo ""
            read -p "Script fehlgeschlagen. Warteschlange fortsetzen? (j/N): " continue_choice
            if [[ ! $continue_choice =~ ^[Jj]$ ]]; then
                log_warning "Warteschlange abgebrochen"
                break
            fi
        fi
        
        echo ""
        read -p "Drücken Sie Enter für das nächste Script..."
        echo ""
    done < "$QUEUE_FILE"
    
    # Warteschlange leeren
    > "$QUEUE_FILE"
    
    echo "=========================================="
    log_success "Warteschlangen-Abarbeitung abgeschlossen!"
    log_info "Erfolgreich: $success_count"
    log_info "Fehlgeschlagen: $error_count"
    echo "=========================================="
}

# Warteschlange leeren
clear_queue() {
    > "$QUEUE_FILE"
    log_success "Warteschlange geleert"
}

# Verfügbare Scripts anzeigen
show_available_scripts() {
    echo ""
    log_info "Verfügbare Scripts:"
    echo ""
    for key in "${!SCRIPTS[@]}"; do
        local script_file="${SCRIPTS[$key]%%|*}"
        local description="${SCRIPTS[$key]##*|}"
        local status=""
        
        if check_script_exists "$key"; then
            status="✅"
        else
            status="❌"
        fi
        
        printf "  %-12s %s %s\n" "$key" "$status" "$description"
    done
    echo ""
}

# Hauptmenü
show_main_menu() {
    echo ""
    echo "🎮 PROJEKTSEITE MAIN CONTROL"
    echo "============================"
    echo ""
    echo "1) Script einzeln ausführen"
    echo "2) Script zur Warteschlange hinzufügen"
    echo "3) Warteschlange anzeigen"
    echo "4) Warteschlange abarbeiten"
    echo "5) Warteschlange leeren"
    echo "6) Verfügbare Scripts anzeigen"
    echo "7) System-Status anzeigen"
    echo "8) Log-Datei anzeigen"
    echo "9) Schnellstart-Optionen"
    echo "0) Beenden"
    echo ""
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
    [ -d "$PROJECT_DIR" ] && log_success "Projektverzeichnis: $PROJECT_DIR" || log_warning "Projektverzeichnis nicht gefunden"
    [ -d "/opt/backups/projektseite" ] && log_success "Backup-Verzeichnis vorhanden" || log_warning "Backup-Verzeichnis nicht gefunden"
    [ -d "/var/log/projektseite" ] && log_success "Log-Verzeichnis vorhanden" || log_warning "Log-Verzeichnis nicht gefunden"
    
    echo ""
    echo "💾 Speicherplatz:"
    df -h /opt 2>/dev/null | tail -1 | awk '{print "Verfügbar: " $4 " von " $2 " (" $5 " belegt)"}'
}

# Log-Datei anzeigen
show_log_file() {
    echo ""
    log_info "Log-Datei: $LOG_FILE"
    echo ""
    
    if [ -f "$LOG_FILE" ]; then
        echo "Letzte 20 Einträge:"
        echo "==================="
        tail -20 "$LOG_FILE"
    else
        log_warning "Log-Datei nicht gefunden"
    fi
}

# Schnellstart-Optionen
show_quickstart_menu() {
    echo ""
    echo "🚀 SCHNELLSTART-OPTIONEN"
    echo "========================"
    echo ""
    echo "1) Komplette Installation (Setup + Start)"
    echo "2) System-Update (Stop + Update + Start)"
    echo "3) System-Backup erstellen"
    echo "4) System-Wipe (komplett löschen)"
    echo "5) Sanfte Bereinigung + Neustart"
    echo "0) Zurück zum Hauptmenü"
    echo ""
}

# Schnellstart ausführen
execute_quickstart() {
    local choice="$1"
    
    case $choice in
        1)
            log_info "Komplette Installation..."
            execute_script "setup"
            execute_script "start"
            ;;
        2)
            log_info "System-Update..."
            execute_script "stop"
            execute_script "update"
            execute_script "start"
            ;;
        3)
            log_info "System-Backup..."
            execute_script "backup"
            ;;
        4)
            log_info "System-Wipe..."
            execute_script "wipe"
            ;;
        5)
            log_info "Sanfte Bereinigung + Neustart..."
            execute_script "clean"
            execute_script "restart"
            ;;
    esac
}

# Script-Auswahl
select_script() {
    echo ""
    log_info "Verfügbare Scripts:"
    echo ""
    
    local options=()
    local counter=1
    
    for key in "${!SCRIPTS[@]}"; do
        local script_file="${SCRIPTS[$key]%%|*}"
        local description="${SCRIPTS[$key]##*|}"
        
        if check_script_exists "$key"; then
            echo "$counter) $key - $description"
            options+=("$key")
            ((counter++))
        fi
    done
    
    echo ""
    read -p "Wählen Sie ein Script (Nummer): " script_choice
    
    if [[ "$script_choice" =~ ^[0-9]+$ ]] && [ "$script_choice" -ge 1 ] && [ "$script_choice" -le "${#options[@]}" ]; then
        local selected_script="${options[$((script_choice-1))]}"
        echo "$selected_script"
    else
        log_error "Ungültige Auswahl"
        return 1
    fi
}

# Hauptschleife
main() {
    # Prüfe ob als Root ausgeführt
    if [[ $EUID -eq 0 ]]; then
        log_info "Script wird als Root ausgeführt"
    else
        log_warning "Script wird nicht als Root ausgeführt - einige Operationen könnten fehlschlagen"
    fi
    
    # Initialisierung
    log_to_file "Main Control Script gestartet"
    
    while true; do
        show_main_menu
        read -p "Wählen Sie eine Option (0-9): " choice
        
        case $choice in
            1)
                selected_script=$(select_script)
                if [ $? -eq 0 ] && [ -n "$selected_script" ]; then
                    execute_script "$selected_script"
                fi
                ;;
            2)
                selected_script=$(select_script)
                if [ $? -eq 0 ] && [ -n "$selected_script" ]; then
                    add_to_queue "$selected_script"
                fi
                ;;
            3)
                show_queue
                ;;
            4)
                process_queue
                ;;
            5)
                clear_queue
                ;;
            6)
                show_available_scripts
                ;;
            7)
                show_system_status
                ;;
            8)
                show_log_file
                ;;
            9)
                while true; do
                    show_quickstart_menu
                    read -p "Wählen Sie eine Schnellstart-Option (0-5): " quickstart_choice
                    
                    case $quickstart_choice in
                        1|2|3|4|5)
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
            0)
                log_info "Main Control Script beendet"
                log_to_file "Main Control Script beendet"
                break
                ;;
            *)
                log_warning "Ungültige Option. Bitte wählen Sie 0-9."
                ;;
        esac
        
        echo ""
        read -p "Drücken Sie Enter, um fortzufahren..."
    done
}

# Script starten
main "$@"
