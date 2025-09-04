#!/bin/bash

# ===== PROJEKTSEITE SYSTEM UPDATE SCRIPT =====
# Regelmäßige System-Updates und Wartung
# Erstellt: $(date)

set -e

echo "🔄 Starte System-Update für Projektseite..."

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

# Log-Datei
LOG_FILE="/var/log/projektseite/update-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1

log_info "Update-Log wird in $LOG_FILE geschrieben"

# Prüfe ob als Root ausgeführt
if [[ $EUID -eq 0 ]]; then
   log_info "Skript wird als Root ausgeführt - das ist in Ordnung"
fi

# Erstelle Backup vor Update
log_info "Erstelle Backup vor Update..."
./scripts/backup-system.sh

# Git-Update
log_info "Aktualisiere Projekt von GitHub..."
cd /opt/projektseite

# Sichere lokale Änderungen (falls vorhanden)
log_info "Sichere lokale Änderungen..."
git stash push -m "Auto-stash vor Update $(date)" || log_warning "Keine lokalen Änderungen zum Stashen"

# Hole neueste Änderungen
log_info "Hole neueste Änderungen von GitHub..."
git fetch origin

# Zeige verfügbare Updates
log_info "Verfügbare Updates:"
git log --oneline HEAD..origin/main

# Überschreibe lokale Änderungen und führe Pull durch
log_info "Überschreibe lokale Änderungen und führe Pull durch..."
git reset --hard origin/main

log_success "Git-Update erfolgreich - lokale Änderungen überschrieben"

# Setze Ausführungsberechtigungen für alle Skripte
log_info "Setze Ausführungsberechtigungen für alle Skripte..."
chmod +x /opt/projektseite/scripts/*.sh
log_success "Ausführungsberechtigungen für alle Skripte gesetzt"

# Stoppe Docker-Container
log_info "Stoppe Docker-Container..."
cd /opt/projektseite
if [ -f "docker/docker-compose.yml" ]; then
    docker-compose -f docker/docker-compose.yml down
else
    log_warning "Docker-Compose-Datei nicht gefunden, überspringe Docker-Operationen"
fi

# System-Updates
log_info "Führe System-Updates durch..."
apt update
apt upgrade -y
apt autoremove -y
apt autoclean

# Docker-Updates
log_info "Aktualisiere Docker-Images..."
docker system prune -f
docker image prune -f

# Prüfe auf neue Docker-Images
log_info "Prüfe auf neue Docker-Images..."
if [ -f "docker/docker-compose.yml" ]; then
    docker-compose -f docker/docker-compose.yml pull
else
    log_warning "Docker-Compose-Datei nicht gefunden, überspringe Docker-Operationen"
fi

# Starte Docker-Container neu
log_info "Starte Docker-Container neu..."
if [ -f "docker/docker-compose.yml" ]; then
    docker-compose -f docker/docker-compose.yml up -d
else
    log_warning "Docker-Compose-Datei nicht gefunden, überspringe Docker-Operationen"
fi

# Prüfe Container-Status
log_info "Prüfe Container-Status..."
if [ -f "docker/docker-compose.yml" ]; then
    sleep 10
    docker-compose -f docker/docker-compose.yml ps
else
    log_warning "Docker-Compose-Datei nicht gefunden, überspringe Container-Status-Prüfung"
fi

# Node.js Updates
log_info "Prüfe Node.js Updates..."
NODE_CURRENT=$(node --version)
NODE_LATEST=$(curl -s https://nodejs.org/dist/index.json | grep -o '"version":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ "$NODE_CURRENT" != "v$NODE_LATEST" ]; then
    log_warning "Node.js Update verfügbar: $NODE_CURRENT -> v$NODE_LATEST"
    log_info "Führe Node.js Update durch..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
else
    log_success "Node.js ist aktuell: $NODE_CURRENT"
fi

# NPM Updates
log_info "Aktualisiere globale NPM-Pakete..."
npm update -g

# Log-Rotation
log_info "Führe Log-Rotation durch..."
logrotate /etc/logrotate.d/projektseite

# Prüfe Festplattenspeicher
log_info "Prüfe Festplattenspeicher..."
df -h

# Prüfe Docker-Speicher
log_info "Prüfe Docker-Speicher..."
docker system df

# Prüfe System-Services
log_info "Prüfe System-Services..."
systemctl status projektseite.service --no-pager
systemctl status node_exporter.service --no-pager

# Erstelle Update-Report
REPORT_FILE="/opt/projektseite/reports/update-report-$(date +%Y%m%d).md"
mkdir -p /opt/projektseite/reports

cat > "$REPORT_FILE" <<EOF
# System Update Report - $(date)

## Update-Zusammenfassung
- **Datum:** $(date)
- **Benutzer:** $USER
- **System:** $(uname -a)

## Durchgeführte Updates
- System-Pakete aktualisiert
- Projekt von GitHub aktualisiert
- Docker-Images aktualisiert
- Node.js geprüft und aktualisiert
- NPM-Pakete aktualisiert
- Log-Rotation durchgeführt

## Container-Status
\`\`\`
$(if [ -f "docker/docker-compose.yml" ]; then docker-compose -f docker/docker-compose.yml ps; else echo "Docker-Compose-Datei nicht gefunden"; fi)
\`\`\`

## System-Informationen
- **Festplattenspeicher:** $(df -h / | tail -1 | awk '{print $5}')
- **Docker-Speicher:** $(docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}")

## Nächste geplante Updates
- Automatische Updates: Sonntags um 3:00 Uhr
- Manuelle Updates: Bei Bedarf

---
*Generiert automatisch von update-system.sh*
EOF

log_success "Update abgeschlossen!"
log_info "Update-Report erstellt: $REPORT_FILE"
log_info "Log-Datei: $LOG_FILE"

# Sende Benachrichtigung (falls konfiguriert)
if command -v mail &> /dev/null; then
    echo "System-Update erfolgreich abgeschlossen am $(date)" | mail -s "Projektseite Update Report" root
fi

echo ""
log_success "System-Update erfolgreich abgeschlossen!"
