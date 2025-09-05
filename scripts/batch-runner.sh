#!/bin/bash

# ===== PROJEKTSEITE BATCH RUNNER SCRIPT =====
# Führt Scripts in Batch-Modi aus (z.B. aus Datei oder Kommandozeile)
# Erstellt: $(date)

set -e

echo "📦 Projektseite Batch Runner Script"
echo "=================================="

# Farben für Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

log_batch() {
    echo -e "${PURPLE}[BATCH]${NC} $1"
}

# Konfiguration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/var/log/projektseite/batch-runner.log"

# Erstelle Log-Verzeichnis falls nicht vorhanden
mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true

# Logging-Funktion
log_to_file() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Verfügbare Scripts (gleiche wie in main-control.sh)
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

# Script ausführen
execute_script() {
    local script_name="$1"
    local script_file="${SCRIPTS[$script_name]%%|*}"
    local script_description="${SCRIPTS[$script_name]##*|}"
    
    if [ ! -f "$SCRIPT_DIR/$script_file" ]; then
        log_error "Script '$script_name' nicht gefunden: $script_file"
        return 1
    fi
    
    log_batch "Führe aus: $script_description"
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

# Batch aus Datei ausführen
run_batch_from_file() {
    local batch_file="$1"
    local stop_on_error="${2:-true}"
    
    if [ ! -f "$batch_file" ]; then
        log_error "Batch-Datei nicht gefunden: $batch_file"
        return 1
    fi
    
    log_info "Lade Batch aus Datei: $batch_file"
    log_to_file "Starting batch from file: $batch_file"
    
    local total_scripts=0
    local success_count=0
    local error_count=0
    
    # Zähle Scripts
    while IFS= read -r script_name; do
        # Ignoriere Kommentare und leere Zeilen
        if [[ ! "$script_name" =~ ^[[:space:]]*# ]] && [[ -n "$script_name" ]]; then
            ((total_scripts++))
        fi
    done < "$batch_file"
    
    log_info "Batch enthält $total_scripts Scripts"
    
    # Führe Scripts aus
    local current_script=0
    while IFS= read -r script_name; do
        # Ignoriere Kommentare und leere Zeilen
        if [[ "$script_name" =~ ^[[:space:]]*# ]] || [[ -z "$script_name" ]]; then
            continue
        fi
        
        ((current_script++))
        echo "=========================================="
        log_batch "Script $current_script von $total_scripts: $script_name"
        echo "=========================================="
        
        if execute_script "$script_name"; then
            ((success_count++))
        else
            ((error_count++))
            
            if [ "$stop_on_error" = "true" ]; then
                log_error "Batch abgebrochen wegen Fehler"
                break
            else
                log_warning "Script fehlgeschlagen, setze fort..."
            fi
        fi
        
        echo ""
    done < "$batch_file"
    
    echo "=========================================="
    log_success "Batch abgeschlossen!"
    log_info "Erfolgreich: $success_count"
    log_info "Fehlgeschlagen: $error_count"
    echo "=========================================="
    
    log_to_file "Batch completed: $success_count success, $error_count errors"
}

# Batch aus Kommandozeile ausführen
run_batch_from_args() {
    local scripts=("$@")
    local stop_on_error="${STOP_ON_ERROR:-true}"
    
    if [ ${#scripts[@]} -eq 0 ]; then
        log_error "Keine Scripts angegeben"
        return 1
    fi
    
    log_info "Führe Batch aus Kommandozeile aus: ${scripts[*]}"
    log_to_file "Starting batch from command line: ${scripts[*]}"
    
    local total_scripts=${#scripts[@]}
    local success_count=0
    local error_count=0
    
    for i in "${!scripts[@]}"; do
        local script_name="${scripts[$i]}"
        local current_script=$((i + 1))
        
        echo "=========================================="
        log_batch "Script $current_script von $total_scripts: $script_name"
        echo "=========================================="
        
        if execute_script "$script_name"; then
            ((success_count++))
        else
            ((error_count++))
            
            if [ "$stop_on_error" = "true" ]; then
                log_error "Batch abgebrochen wegen Fehler"
                break
            else
                log_warning "Script fehlgeschlagen, setze fort..."
            fi
        fi
        
        echo ""
    done
    
    echo "=========================================="
    log_success "Batch abgeschlossen!"
    log_info "Erfolgreich: $success_count"
    log_info "Fehlgeschlagen: $error_count"
    echo "=========================================="
    
    log_to_file "Batch completed: $success_count success, $error_count errors"
}

# Vordefinierte Batch-Profile
run_preset_batch() {
    local preset="$1"
    
    case $preset in
        "install")
            log_info "Führe Installations-Batch aus..."
            run_batch_from_args "setup" "start" "test"
            ;;
        "update")
            log_info "Führe Update-Batch aus..."
            run_batch_from_args "stop" "update" "patch" "start" "test"
            ;;
        "backup")
            log_info "Führe Backup-Batch aus..."
            run_batch_from_args "backup" "logs"
            ;;
        "maintenance")
            log_info "Führe Wartungs-Batch aus..."
            run_batch_from_args "stop" "clean" "patch" "start" "test"
            ;;
        "wipe")
            log_info "Führe Wipe-Batch aus..."
            run_batch_from_args "stop" "wipe"
            ;;
        "restore")
            log_info "Führe Restore-Batch aus..."
            run_batch_from_args "stop" "restore" "start" "test"
            ;;
        *)
            log_error "Unbekanntes Preset: $preset"
            log_info "Verfügbare Presets: install, update, backup, maintenance, wipe, restore"
            return 1
            ;;
    esac
}

# Hilfe anzeigen
show_help() {
    echo ""
    echo "📦 PROJEKTSEITE BATCH RUNNER"
    echo "============================"
    echo ""
    echo "Verwendung:"
    echo "  $0 [OPTIONEN] [SCRIPT1] [SCRIPT2] ..."
    echo ""
    echo "Optionen:"
    echo "  -f, --file FILE        Batch aus Datei ausführen"
    echo "  -p, --preset PRESET    Vordefiniertes Batch ausführen"
    echo "  -c, --continue         Bei Fehler fortfahren (Standard: stoppen)"
    echo "  -l, --list             Verfügbare Scripts anzeigen"
    echo "  -h, --help             Diese Hilfe anzeigen"
    echo ""
    echo "Vordefinierte Presets:"
    echo "  install                Komplette Installation (setup + start + test)"
    echo "  update                 System-Update (stop + update + patch + start + test)"
    echo "  backup                 Backup erstellen (backup + logs)"
    echo "  maintenance            Wartung (stop + clean + patch + start + test)"
    echo "  wipe                   System-Wipe (stop + wipe)"
    echo "  restore                Restore (stop + restore + start + test)"
    echo ""
    echo "Verfügbare Scripts:"
    for key in "${!SCRIPTS[@]}"; do
        local description="${SCRIPTS[$key]##*|}"
        echo "  $key - $description"
    done
    echo ""
    echo "Beispiele:"
    echo "  $0 -p install                    # Installations-Batch"
    echo "  $0 -f my-batch.txt               # Batch aus Datei"
    echo "  $0 -c start stop restart         # Scripts mit Fortsetzung bei Fehler"
    echo "  $0 start backup test             # Scripts direkt ausführen"
    echo ""
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
        
        if [ -f "$SCRIPT_DIR/$script_file" ]; then
            status="✅"
        else
            status="❌"
        fi
        
        printf "  %-12s %s %s\n" "$key" "$status" "$description"
    done
    echo ""
}

# Hauptfunktion
main() {
    local batch_file=""
    local preset=""
    local stop_on_error="true"
    local scripts=()
    
    # Argumente parsen
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--file)
                batch_file="$2"
                shift 2
                ;;
            -p|--preset)
                preset="$2"
                shift 2
                ;;
            -c|--continue)
                stop_on_error="false"
                shift
                ;;
            -l|--list)
                show_available_scripts
                exit 0
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            -*)
                log_error "Unbekannte Option: $1"
                show_help
                exit 1
                ;;
            *)
                scripts+=("$1")
                shift
                ;;
        esac
    done
    
    # Logging starten
    log_to_file "Batch Runner gestartet"
    
    # Prüfe ob als Root ausgeführt
    if [[ $EUID -eq 0 ]]; then
        log_info "Script wird als Root ausgeführt"
    else
        log_warning "Script wird nicht als Root ausgeführt - einige Operationen könnten fehlschlagen"
    fi
    
    # STOP_ON_ERROR setzen
    export STOP_ON_ERROR="$stop_on_error"
    
    # Batch ausführen
    if [ -n "$preset" ]; then
        run_preset_batch "$preset"
    elif [ -n "$batch_file" ]; then
        run_batch_from_file "$batch_file" "$stop_on_error"
    elif [ ${#scripts[@]} -gt 0 ]; then
        run_batch_from_args "${scripts[@]}"
    else
        log_error "Keine Scripts oder Optionen angegeben"
        show_help
        exit 1
    fi
    
    log_to_file "Batch Runner beendet"
}

# Script starten
main "$@"
