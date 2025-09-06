#!/bin/bash

# Patch Manager - Verwaltung aller System-Patches
# Dieses Script ermöglicht die Verwaltung aller verfügbaren Patches

set -e

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging-Funktionen
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${PURPLE}[INFO]${NC} $1"
}

# Verfügbare Patches definieren
declare -A PATCHES=(
    ["activity-log"]="install-activity-log.sh:Aktivitätslog-System mit automatischen Benachrichtigungen"
    ["fix-db"]="fix-database-connection.sh:Datenbankverbindung reparieren"
    ["fix-tables"]="fix-activity-log-tables.sh:Aktivitätslog-Tabellen reparieren"
    # Weitere Patches können hier hinzugefügt werden
)

# Hilfsfunktion: Zeige verfügbare Patches
show_patches() {
    echo -e "${BLUE}Verfügbare Patches:${NC}"
    echo "=================="
    
    if [ ${#PATCHES[@]} -eq 0 ]; then
        warning "Keine Patches verfügbar"
        return
    fi
    
    for patch_key in "${!PATCHES[@]}"; do
        IFS=':' read -r script description <<< "${PATCHES[$patch_key]}"
        echo -e "${GREEN}$patch_key${NC}: $description"
        echo "  Script: $script"
        echo ""
    done
}

# Hilfsfunktion: Prüfe ob Patch-Script existiert
check_patch_script() {
    local patch_key="$1"
    local script_name="${PATCHES[$patch_key]%%:*}"
    
    if [ -z "$script_name" ]; then
        error "Unbekannter Patch: $patch_key"
        return 1
    fi
    
    if [ ! -f "$script_name" ]; then
        error "Patch-Script nicht gefunden: $script_name"
        return 1
    fi
    
    if [ ! -x "$script_name" ]; then
        warning "Patch-Script ist nicht ausführbar: $script_name"
        info "Versuche Berechtigungen zu setzen..."
        chmod +x "$script_name"
    fi
    
    return 0
}

# Hilfsfunktion: Führe Patch aus
execute_patch() {
    local patch_key="$1"
    local script_name="${PATCHES[$patch_key]%%:*}"
    
    log "Führe Patch aus: $patch_key"
    log "Script: $script_name"
    
    if ! check_patch_script "$patch_key"; then
        return 1
    fi
    
    # Führe das Patch-Script aus
    if ./"$script_name"; then
        success "Patch '$patch_key' erfolgreich ausgeführt"
        return 0
    else
        error "Patch '$patch_key' fehlgeschlagen"
        return 1
    fi
}

# Hilfsfunktion: Zeige Patch-Status
show_patch_status() {
    local patch_key="$1"
    
    if [ -z "$patch_key" ]; then
        info "Patch-Status für alle verfügbaren Patches:"
        echo ""
        
        for patch_key in "${!PATCHES[@]}"; do
            show_patch_status "$patch_key"
        done
        return
    fi
    
    local script_name="${PATCHES[$patch_key]%%:*}"
    local description="${PATCHES[$patch_key]#*:}"
    
    echo -e "${BLUE}Patch: $patch_key${NC}"
    echo "  Beschreibung: $description"
    echo "  Script: $script_name"
    
    if [ -f "$script_name" ]; then
        if [ -x "$script_name" ]; then
            echo -e "  Status: ${GREEN}Verfügbar und ausführbar${NC}"
        else
            echo -e "  Status: ${YELLOW}Verfügbar, aber nicht ausführbar${NC}"
        fi
    else
        echo -e "  Status: ${RED}Script nicht gefunden${NC}"
    fi
    echo ""
}

# Hilfsfunktion: Zeige Hilfe
show_help() {
    echo -e "${BLUE}Patch Manager - System-Patch-Verwaltung${NC}"
    echo "=============================================="
    echo ""
    echo "Verwendung:"
    echo "  $0 [BEFEHL] [PATCH-NAME]"
    echo ""
    echo "Befehle:"
    echo "  (ohne Parameter)        - Interaktives Menü starten"
    echo "  menu                    - Interaktives Menü starten"
    echo "  list                    - Zeige alle verfügbaren Patches"
    echo "  status [PATCH-NAME]     - Zeige Status eines Patches"
    echo "  install PATCH-NAME      - Installiere einen Patch"
    echo "  help                    - Zeige diese Hilfe"
    echo ""
    echo "Beispiele:"
    echo "  $0                                     # Interaktives Menü starten"
    echo "  $0 menu                               # Interaktives Menü starten"
    echo "  $0 list                              # Alle Patches anzeigen"
    echo "  $0 status activity-log               # Status des Aktivitätslog-Patches"
    echo "  $0 install activity-log              # Aktivitätslog-System installieren"
    echo ""
    echo "Verfügbare Patches:"
    show_patches
}

# Interaktives Menü anzeigen
show_interactive_menu() {
    echo ""
    echo -e "${BLUE}🔧 PROJEKTSEITE PATCH-MANAGER${NC}"
    echo "=================================="
    echo ""
    echo "Verfügbare Patches:"
    echo ""
    
    local i=1
    local patch_keys=()
    for patch_key in "${!PATCHES[@]}"; do
        IFS=':' read -r script description <<< "${PATCHES[$patch_key]}"
        echo -e "${GREEN}$i)${NC} $patch_key - $description"
        patch_keys+=("$patch_key")
        ((i++))
    done
    
    echo ""
    echo -e "${YELLOW}0)${NC} Beenden"
    echo ""
}

# Interaktives Menü verarbeiten
handle_interactive_menu() {
    while true; do
        show_interactive_menu
        read -p "Wählen Sie eine Option (0-${#PATCHES[@]}): " choice
        
        case $choice in
            0)
                log "Patch-Manager beendet"
                break
                ;;
            [1-9]*)
                if [ "$choice" -ge 1 ] && [ "$choice" -le "${#PATCHES[@]}" ]; then
                    local patch_index=$((choice - 1))
                    local selected_patch="${patch_keys[$patch_index]}"
                    
                    echo ""
                    log "Ausgewählter Patch: $selected_patch"
                    
                    # Zeige Patch-Status
                    show_patch_status "$selected_patch"
                    
                    echo ""
                    read -p "Möchten Sie diesen Patch installieren? (j/N): " -r
                    if [[ $REPLY =~ ^[Jj]$ ]]; then
                        execute_patch "$selected_patch"
                    else
                        log "Patch-Installation abgebrochen"
                    fi
                    
                    echo ""
                    read -p "Drücken Sie Enter, um fortzufahren..."
                else
                    error "Ungültige Auswahl: $choice"
                fi
                ;;
            *)
                error "Ungültige Eingabe: $choice"
                ;;
        esac
    done
}

# Hauptfunktion
main() {
    local command="$1"
    local patch_name="$2"
    
    # Prüfe ob wir im richtigen Verzeichnis sind
    if [ ! -f "README.md" ] || [ ! -d "../.." ]; then
        error "Bitte führen Sie dieses Script aus dem scripts/patches/ Verzeichnis aus"
        exit 1
    fi
    
    case "$command" in
        "list")
            show_patches
            ;;
        "status")
            show_patch_status "$patch_name"
            ;;
        "install")
            if [ -z "$patch_name" ]; then
                error "Patch-Name erforderlich für 'install' Befehl"
                echo "Verwenden Sie '$0 list' um verfügbare Patches anzuzeigen"
                exit 1
            fi
            
            if [ -z "${PATCHES[$patch_name]}" ]; then
                error "Unbekannter Patch: $patch_name"
                echo "Verwenden Sie '$0 list' um verfügbare Patches anzuzeigen"
                exit 1
            fi
            
            execute_patch "$patch_name"
            ;;
        "menu"|"interactive"|"")
            handle_interactive_menu
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            error "Unbekannter Befehl: $command"
            echo "Verwenden Sie '$0 help' für Hilfe"
            exit 1
            ;;
    esac
}

# Script ausführen
main "$@"
