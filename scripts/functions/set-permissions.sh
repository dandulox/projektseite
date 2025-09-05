#!/bin/bash

# ===== SET PERMISSIONS FUNCTION =====
# Hilfsfunktion zum Setzen von Ausführungsberechtigungen für alle Scripts
# Kann in anderen Scripts eingebunden werden

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

# Hauptfunktion: Setze Berechtigungen für alle Scripts
set_all_permissions() {
    local project_root="${1:-/opt/projektseite}"
    
    log_info "Setze Ausführungsberechtigungen für alle Scripts..."
    
    # Hauptscripts
    if [ -d "$project_root/scripts" ]; then
        chmod +x "$project_root/scripts"/*.sh 2>/dev/null || log_warning "Keine .sh Dateien in scripts/ gefunden"
        log_success "Ausführungsberechtigungen für Hauptscripts gesetzt"
    else
        log_warning "Scripts-Verzeichnis nicht gefunden: $project_root/scripts"
    fi
    
    # Patch-Scripts
    if [ -d "$project_root/scripts/patches" ]; then
        chmod +x "$project_root/scripts/patches"/*.sh 2>/dev/null || log_warning "Keine .sh Dateien in scripts/patches/ gefunden"
        log_success "Ausführungsberechtigungen für Patch-Scripts gesetzt"
    else
        log_warning "Patches-Verzeichnis nicht gefunden: $project_root/scripts/patches"
    fi
    
    # Batch-Scripts (falls vorhanden)
    if [ -d "$project_root/scripts/batches" ]; then
        chmod +x "$project_root/scripts/batches"/*.sh 2>/dev/null || log_warning "Keine .sh Dateien in scripts/batches/ gefunden"
        log_success "Ausführungsberechtigungen für Batch-Scripts gesetzt"
    fi
    
    # Weitere Unterverzeichnisse (falls vorhanden)
    for subdir in "$project_root/scripts"/*/; do
        if [ -d "$subdir" ] && [[ "$subdir" != *"/patches/" ]] && [[ "$subdir" != *"/batches/" ]]; then
            local dirname=$(basename "$subdir")
            chmod +x "$subdir"/*.sh 2>/dev/null && log_success "Ausführungsberechtigungen für $dirname-Scripts gesetzt"
        fi
    done
    
    log_success "Alle Script-Berechtigungen erfolgreich gesetzt"
}

# Funktion: Prüfe und repariere Berechtigungen
check_and_fix_permissions() {
    local project_root="${1:-/opt/projektseite}"
    local fixed_count=0
    
    log_info "Prüfe Script-Berechtigungen..."
    
    # Finde alle .sh Dateien und prüfe Berechtigungen
    while IFS= read -r -d '' file; do
        if [ ! -x "$file" ]; then
            chmod +x "$file"
            log_info "Berechtigung gesetzt: $file"
            ((fixed_count++))
        fi
    done < <(find "$project_root/scripts" -name "*.sh" -type f -print0 2>/dev/null)
    
    if [ $fixed_count -gt 0 ]; then
        log_success "$fixed_count Script-Berechtigungen repariert"
    else
        log_success "Alle Scripts haben bereits die korrekten Berechtigungen"
    fi
}

# Funktion: Zeige Script-Status
show_script_status() {
    local project_root="${1:-/opt/projektseite}"
    
    log_info "Script-Status-Übersicht:"
    echo "=========================="
    
    # Hauptscripts
    if [ -d "$project_root/scripts" ]; then
        echo -e "\n${BLUE}Hauptscripts:${NC}"
        for script in "$project_root/scripts"/*.sh; do
            if [ -f "$script" ]; then
                local name=$(basename "$script")
                if [ -x "$script" ]; then
                    echo -e "  ✅ $name"
                else
                    echo -e "  ❌ $name (nicht ausführbar)"
                fi
            fi
        done
    fi
    
    # Patch-Scripts
    if [ -d "$project_root/scripts/patches" ]; then
        echo -e "\n${BLUE}Patch-Scripts:${NC}"
        for script in "$project_root/scripts/patches"/*.sh; do
            if [ -f "$script" ]; then
                local name=$(basename "$script")
                if [ -x "$script" ]; then
                    echo -e "  ✅ $name"
                else
                    echo -e "  ❌ $name (nicht ausführbar)"
                fi
            fi
        done
    fi
    
    # Batch-Scripts
    if [ -d "$project_root/scripts/batches" ]; then
        echo -e "\n${BLUE}Batch-Scripts:${NC}"
        for script in "$project_root/scripts/batches"/*.sh; do
            if [ -f "$script" ]; then
                local name=$(basename "$script")
                if [ -x "$script" ]; then
                    echo -e "  ✅ $name"
                else
                    echo -e "  ❌ $name (nicht ausführbar)"
                fi
            fi
        done
    fi
}

# Hauptfunktion basierend auf Argumenten
main() {
    local command="${1:-set}"
    local project_root="${2:-/opt/projektseite}"
    
    case "$command" in
        "set")
            set_all_permissions "$project_root"
            ;;
        "check")
            check_and_fix_permissions "$project_root"
            ;;
        "status")
            show_script_status "$project_root"
            ;;
        "help"|"--help"|"-h")
            echo "Script-Berechtigungs-Manager"
            echo "============================"
            echo ""
            echo "Verwendung:"
            echo "  $0 [BEFEHL] [PROJEKT-PFAD]"
            echo ""
            echo "Befehle:"
            echo "  set     - Setze Berechtigungen für alle Scripts (Standard)"
            echo "  check   - Prüfe und repariere Berechtigungen"
            echo "  status  - Zeige Status aller Scripts"
            echo "  help    - Zeige diese Hilfe"
            echo ""
            echo "Beispiele:"
            echo "  $0 set /opt/projektseite    # Setze Berechtigungen"
            echo "  $0 check                   # Prüfe und repariere"
            echo "  $0 status                  # Zeige Status"
            ;;
        *)
            log_error "Unbekannter Befehl: $command"
            echo "Verwenden Sie '$0 help' für Hilfe"
            exit 1
            ;;
    esac
}

# Wenn Script direkt ausgeführt wird
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
