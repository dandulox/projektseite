#!/bin/bash

# ===== PROJEKTSEITE BATCH CREATOR SCRIPT =====
# Erstellt Batch-Dateien für Script-Ausführung
# Erstellt: $(date)

set -e

echo "📝 Projektseite Batch Creator Script"
echo "==================================="

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

log_create() {
    echo -e "${PURPLE}[CREATE]${NC} $1"
}

# Konfiguration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BATCH_DIR="$SCRIPT_DIR/batches"

# Erstelle Batch-Verzeichnis
mkdir -p "$BATCH_DIR"

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

# Vordefinierte Batch-Profile
declare -A PRESET_BATCHES=(
    ["install"]="setup|start|test|# Komplette Installation"
    ["update"]="stop|update|patch|start|test|# System-Update"
    ["backup"]="backup|logs|# Backup erstellen"
    ["maintenance"]="stop|clean|patch|start|test|# Wartung"
    ["wipe"]="stop|wipe|# System-Wipe"
    ["restore"]="stop|restore|start|test|# Restore"
    ["development"]="stop|clean|patch|start|test|debug|# Development-Setup"
    ["production"]="stop|backup|update|patch|start|test|# Production-Update"
)

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

# Vordefinierte Batches anzeigen
show_preset_batches() {
    echo ""
    log_info "Vordefinierte Batch-Profile:"
    echo ""
    for key in "${!PRESET_BATCHES[@]}"; do
        local description="${PRESET_BATCHES[$key]##*|}"
        echo "  $key - $description"
    done
    echo ""
}

# Batch-Datei erstellen
create_batch_file() {
    local batch_name="$1"
    local batch_file="$BATCH_DIR/$batch_name.txt"
    local scripts=("${@:2}")
    
    if [ ${#scripts[@]} -eq 0 ]; then
        log_error "Keine Scripts angegeben"
        return 1
    fi
    
    log_create "Erstelle Batch-Datei: $batch_file"
    
    # Batch-Datei erstellen
    cat > "$batch_file" << EOF
# Projektseite Batch: $batch_name
# Erstellt: $(date)
# Beschreibung: Automatisch generierte Batch-Datei

EOF
    
    # Scripts hinzufügen
    for script in "${scripts[@]}"; do
        if [[ "$script" =~ ^# ]]; then
            # Kommentar
            echo "$script" >> "$batch_file"
        else
            # Script-Name
            echo "$script" >> "$batch_file"
        fi
    done
    
    # Leerzeile hinzufügen
    echo "" >> "$batch_file"
    
    log_success "Batch-Datei erstellt: $batch_file"
    
    # Inhalt anzeigen
    echo ""
    log_info "Batch-Inhalt:"
    echo "=============="
    cat "$batch_file"
    echo "=============="
}

# Interaktive Batch-Erstellung
create_interactive_batch() {
    echo ""
    log_info "Interaktive Batch-Erstellung"
    echo ""
    
    # Batch-Name eingeben
    read -p "Batch-Name (ohne .txt): " batch_name
    if [ -z "$batch_name" ]; then
        log_error "Batch-Name darf nicht leer sein"
        return 1
    fi
    
    local batch_file="$BATCH_DIR/$batch_name.txt"
    
    # Prüfe ob Datei bereits existiert
    if [ -f "$batch_file" ]; then
        read -p "Batch-Datei existiert bereits. Überschreiben? (j/N): " overwrite
        if [[ ! $overwrite =~ ^[Jj]$ ]]; then
            log_info "Batch-Erstellung abgebrochen"
            return 0
        fi
    fi
    
    echo ""
    log_info "Wählen Sie Scripts für den Batch:"
    echo ""
    
    local selected_scripts=()
    local options=()
    local counter=1
    
    # Verfügbare Scripts anzeigen
    for key in "${!SCRIPTS[@]}"; do
        local script_file="${SCRIPTS[$key]%%|*}"
        local description="${SCRIPTS[$key]##*|}"
        
        if [ -f "$SCRIPT_DIR/$script_file" ]; then
            echo "$counter) $key - $description"
            options+=("$key")
            ((counter++))
        fi
    done
    
    echo ""
    echo "Geben Sie die Nummern der gewünschten Scripts ein (durch Leerzeichen getrennt):"
    echo "Beispiel: 1 3 5 7"
    echo ""
    read -p "Scripts: " script_numbers
    
    # Scripts auswählen
    for num in $script_numbers; do
        if [[ "$num" =~ ^[0-9]+$ ]] && [ "$num" -ge 1 ] && [ "$num" -le "${#options[@]}" ]; then
            local selected_script="${options[$((num-1))]}"
            selected_scripts+=("$selected_script")
        else
            log_warning "Ungültige Nummer: $num"
        fi
    done
    
    if [ ${#selected_scripts[@]} -eq 0 ]; then
        log_error "Keine gültigen Scripts ausgewählt"
        return 1
    fi
    
    # Batch-Datei erstellen
    create_batch_file "$batch_name" "${selected_scripts[@]}"
}

# Preset-Batch erstellen
create_preset_batch() {
    local preset="$1"
    
    if [ -z "${PRESET_BATCHES[$preset]}" ]; then
        log_error "Unbekanntes Preset: $preset"
        log_info "Verfügbare Presets: ${!PRESET_BATCHES[*]}"
        return 1
    fi
    
    local preset_data="${PRESET_BATCHES[$preset]}"
    local scripts=()
    
    # Scripts aus Preset-Daten extrahieren
    IFS='|' read -ra ADDR <<< "$preset_data"
    for item in "${ADDR[@]}"; do
        if [[ ! "$item" =~ ^# ]]; then
            scripts+=("$item")
        fi
    done
    
    # Batch-Datei erstellen
    create_batch_file "$preset" "${scripts[@]}"
}

# Alle Preset-Batches erstellen
create_all_preset_batches() {
    log_info "Erstelle alle vordefinierten Batch-Profile..."
    
    for preset in "${!PRESET_BATCHES[@]}"; do
        create_preset_batch "$preset"
        echo ""
    done
    
    log_success "Alle Preset-Batches erstellt"
}

# Batch-Dateien anzeigen
show_batch_files() {
    echo ""
    log_info "Vorhandene Batch-Dateien:"
    echo ""
    
    if [ -d "$BATCH_DIR" ] && [ "$(ls -A "$BATCH_DIR" 2>/dev/null)" ]; then
        for batch_file in "$BATCH_DIR"/*.txt; do
            if [ -f "$batch_file" ]; then
                local batch_name=$(basename "$batch_file" .txt)
                local line_count=$(wc -l < "$batch_file")
                local script_count=$(grep -v "^#" "$batch_file" | grep -v "^$" | wc -l)
                
                echo "  📄 $batch_name ($script_count Scripts, $line_count Zeilen)"
            fi
        done
    else
        log_warning "Keine Batch-Dateien gefunden"
    fi
    echo ""
}

# Batch-Datei bearbeiten
edit_batch_file() {
    local batch_name="$1"
    local batch_file="$BATCH_DIR/$batch_name.txt"
    
    if [ ! -f "$batch_file" ]; then
        log_error "Batch-Datei nicht gefunden: $batch_file"
        return 1
    fi
    
    log_info "Öffne Batch-Datei zum Bearbeiten: $batch_file"
    
    # Prüfe verfügbare Editoren
    local editor=""
    for ed in nano vim vi; do
        if command -v "$ed" >/dev/null 2>&1; then
            editor="$ed"
            break
        fi
    done
    
    if [ -z "$editor" ]; then
        log_error "Kein Editor gefunden (nano, vim, vi)"
        return 1
    fi
    
    "$editor" "$batch_file"
}

# Batch-Datei ausführen
run_batch_file() {
    local batch_name="$1"
    local batch_file="$BATCH_DIR/$batch_name.txt"
    
    if [ ! -f "$batch_file" ]; then
        log_error "Batch-Datei nicht gefunden: $batch_file"
        return 1
    fi
    
    log_info "Führe Batch aus: $batch_name"
    
    # Batch-Runner verwenden
    if [ -f "$SCRIPT_DIR/batch-runner.sh" ]; then
        "$SCRIPT_DIR/batch-runner.sh" -f "$batch_file"
    else
        log_error "Batch-Runner nicht gefunden"
        return 1
    fi
}

# Hauptmenü
show_main_menu() {
    echo ""
    echo "📝 PROJEKTSEITE BATCH CREATOR"
    echo "============================="
    echo ""
    echo "1) Interaktive Batch-Erstellung"
    echo "2) Preset-Batch erstellen"
    echo "3) Alle Preset-Batches erstellen"
    echo "4) Batch-Dateien anzeigen"
    echo "5) Batch-Datei bearbeiten"
    echo "6) Batch-Datei ausführen"
    echo "7) Verfügbare Scripts anzeigen"
    echo "8) Vordefinierte Batches anzeigen"
    echo "0) Beenden"
    echo ""
}

# Hauptschleife
main() {
    # Prüfe ob als Root ausgeführt
    if [[ $EUID -eq 0 ]]; then
        log_info "Script wird als Root ausgeführt"
    else
        log_warning "Script wird nicht als Root ausgeführt - einige Operationen könnten fehlschlagen"
    fi
    
    while true; do
        show_main_menu
        read -p "Wählen Sie eine Option (0-8): " choice
        
        case $choice in
            1)
                create_interactive_batch
                ;;
            2)
                show_preset_batches
                read -p "Preset auswählen: " preset
                create_preset_batch "$preset"
                ;;
            3)
                create_all_preset_batches
                ;;
            4)
                show_batch_files
                ;;
            5)
                show_batch_files
                read -p "Batch-Name zum Bearbeiten: " batch_name
                edit_batch_file "$batch_name"
                ;;
            6)
                show_batch_files
                read -p "Batch-Name zum Ausführen: " batch_name
                run_batch_file "$batch_name"
                ;;
            7)
                show_available_scripts
                ;;
            8)
                show_preset_batches
                ;;
            0)
                log_info "Batch Creator beendet"
                break
                ;;
            *)
                log_warning "Ungültige Option. Bitte wählen Sie 0-8."
                ;;
        esac
        
        echo ""
        read -p "Drücken Sie Enter, um fortzufahren..."
    done
}

# Script starten
main "$@"
