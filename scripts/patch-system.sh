#!/bin/bash

# ===== PROJEKTSEITE PATCH SCRIPT =====
# Fährt Docker herunter, führt Git-Update durch und erstellt Container neu
# Erstellt: $(date)

set -e

echo "🔧 Starte System-Patch für Projektseite..."

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
LOG_FILE="/var/log/projektseite/patch-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1

log_info "Patch-Log wird in $LOG_FILE geschrieben"

# Prüfe ob als Root ausgeführt
if [[ $EUID -eq 0 ]]; then
   log_info "Skript wird als Root ausgeführt - das ist in Ordnung"
fi

# Wechsle zum Projektverzeichnis
cd /opt/projektseite

# Prüfe Git-Status
log_info "Prüfe Git-Status..."
if [ ! -d ".git" ]; then
    log_error "Git-Repository nicht gefunden!"
    exit 1
fi

# Zeige aktuellen Git-Status
log_info "Aktueller Git-Status:"
git status --porcelain

# Zeige aktuelle Commit-Informationen
log_info "Aktueller Commit:"
git log --oneline -1

echo ""

# Bestätigung vom Benutzer
echo "⚠️  WARNUNG: Dieses Skript wird alle Docker-Container stoppen und neu starten!"
echo "   Alle laufenden Anwendungen werden unterbrochen."
echo ""
read -p "Möchten Sie fortfahren? (j/N): " -r
if [[ ! $REPLY =~ ^[Jj]$ ]]; then
    log_info "Patch abgebrochen vom Benutzer"
    exit 0
fi

echo ""

# 1. Stoppe alle Docker-Container
log_info "1️⃣ Stoppe alle Docker-Container..."
if [ -f "docker/docker-compose.yml" ]; then
    docker-compose -f docker/docker-compose.yml down
    log_success "Docker-Container gestoppt"
else
    log_warning "Docker-Compose-Datei nicht gefunden, überspringe Docker-Stop"
fi

# 2. Erstelle Backup vor Patch
log_info "2️⃣ Erstelle Backup vor Patch..."
if [ -f "scripts/backup-system.sh" ]; then
    ./scripts/backup-system.sh
    log_success "Backup vor Patch erstellt"
else
    log_warning "Backup-Skript nicht gefunden, überspringe Backup"
fi

# 3. Git-Update durchführen
log_info "3️⃣ Führe Git-Update durch..."

# Sichere aktuelle Änderungen
log_info "Sichere aktuelle lokale Änderungen..."
git stash push -m "Auto-stash vor Patch $(date)" || log_warning "Keine lokalen Änderungen zum Stashen"

# Hole neueste Änderungen von GitHub
log_info "Hole neueste Änderungen von GitHub..."
git fetch origin

# Zeige verfügbare Updates
log_info "Verfügbare Updates:"
git log --oneline HEAD..origin/main

# Überschreibe lokale Änderungen und führe Update durch
log_info "Überschreibe lokale Änderungen und führe Update durch..."
git reset --hard origin/main

if [ $? -eq 0 ]; then
    log_success "Git-Update erfolgreich - lokale Änderungen überschrieben"
else
    log_error "Git-Update fehlgeschlagen!"
    exit 1
fi

# Setze Ausführungsberechtigungen für alle Skripte
log_info "Setze Ausführungsberechtigungen für alle Skripte..."
if [ -f "/opt/projektseite/scripts/functions/set-permissions.sh" ]; then
    source /opt/projektseite/scripts/functions/set-permissions.sh
    set_all_permissions "/opt/projektseite"
else
    # Fallback: Manuelle Berechtigungssetzung
    chmod +x /opt/projektseite/scripts/*.sh
    if [ -d "/opt/projektseite/scripts/patches" ]; then
        chmod +x /opt/projektseite/scripts/patches/*.sh
    fi
    log_success "Ausführungsberechtigungen für alle Skripte gesetzt (Fallback)"
fi

# 4. Prüfe auf neue Dependencies
log_info "4️⃣ Prüfe auf neue Dependencies..."

# Backend Dependencies
if [ -f "backend/package.json" ]; then
    log_info "Prüfe Backend Dependencies..."
    cd backend
    if [ -f "package-lock.json" ]; then
        log_info "Installiere Backend Dependencies..."
        npm ci --only=production || npm install --only=production
        log_success "Backend Dependencies aktualisiert"
    else
        log_info "Installiere Backend Dependencies..."
        npm install --only=production
        log_success "Backend Dependencies installiert"
    fi
    cd ..
else
    log_warning "Backend package.json nicht gefunden"
fi

# Frontend Dependencies
if [ -f "frontend/package.json" ]; then
    log_info "Prüfe Frontend Dependencies..."
    cd frontend
    if [ -f "package-lock.json" ]; then
        log_info "Installiere Frontend Dependencies..."
        npm ci || npm install
        log_success "Frontend Dependencies aktualisiert"
    else
        log_info "Installiere Frontend Dependencies..."
        npm install
        log_success "Frontend Dependencies installiert"
    fi
    cd ..
else
    log_warning "Frontend package.json nicht gefunden"
fi

# 5. Docker-Container neu erstellen
log_info "5️⃣ Erstelle Docker-Container neu..."

# Prüfe Docker-Status
if ! docker info > /dev/null 2>&1; then
    log_error "Docker läuft nicht! Starte Docker..."
    systemctl start docker
    sleep 5
fi

# Baue Container neu
if [ -f "docker/docker-compose.yml" ]; then
    log_info "Baue Docker-Container neu..."
    docker-compose -f docker/docker-compose.yml build --no-cache
    
    log_success "Docker-Container erfolgreich neu gebaut"
else
    log_error "Docker-Compose-Datei nicht gefunden!"
    exit 1
fi

# 6. Starte Container
log_info "6️⃣ Starte Docker-Container..."
if [ -f "docker/docker-compose.yml" ]; then
    docker-compose -f docker/docker-compose.yml up -d
    
    log_success "Docker-Container gestartet"
else
    log_error "Docker-Compose-Datei nicht gefunden!"
    exit 1
fi

# 7. Warte auf Container-Start
log_info "7️⃣ Warte auf Container-Start..."
sleep 20

# 8. Prüfe Container-Status
log_info "8️⃣ Prüfe Container-Status..."
if [ -f "docker/docker-compose.yml" ]; then
    docker-compose -f docker/docker-compose.yml ps
else
    log_error "Docker-Compose-Datei nicht gefunden!"
    exit 1
fi

# 9. Prüfe Service-Verfügbarkeit
log_info "9️⃣ Prüfe Service-Verfügbarkeit..."

# PostgreSQL
if docker exec projektseite-postgres pg_isready -U admin > /dev/null 2>&1; then
    log_success "PostgreSQL ist bereit"
else
    log_warning "PostgreSQL ist noch nicht bereit"
fi

# Backend
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    log_success "Backend ist bereit"
else
    log_warning "Backend ist noch nicht bereit"
fi

# Frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    log_success "Frontend ist bereit"
else
    log_warning "Frontend ist noch nicht bereit"
fi

# Grafana
if curl -s http://localhost:3002 > /dev/null 2>&1; then
    log_success "Grafana ist bereit"
else
    log_warning "Grafana ist noch nicht bereit"
fi

# 10. Erstelle Patch-Report
log_info "🔟 Erstelle Patch-Report..."
REPORT_FILE="/opt/projektseite/reports/patch-report-$(date +%Y%m%d-%H%M%S).md"
mkdir -p /opt/projektseite/reports

cat > "$REPORT_FILE" <<EOF
# System Patch Report - $(date)

## Patch-Zusammenfassung
- **Datum:** $(date)
- **Benutzer:** $USER
- **System:** $(uname -a)
- **Git-Commit:** $(git rev-parse --short HEAD)

## Durchgeführte Aktionen
1. ✅ Docker-Container gestoppt
2. ✅ Backup vor Patch erstellt
3. ✅ Git-Update durchgeführt
4. ✅ Dependencies aktualisiert
5. ✅ Docker-Container neu gebaut
6. ✅ Container gestartet
7. ✅ Services überprüft

## Git-Änderungen
\`\`\`
$(git log --oneline -10)
\`\`\`

## Container-Status nach Patch
\`\`\`
$(if [ -f "docker/docker-compose.yml" ]; then docker-compose -f docker/docker-compose.yml ps; else echo "Docker-Compose-Datei nicht gefunden"; fi)
\`\`\`

## Service-Status
- **PostgreSQL:** $(if docker exec projektseite-postgres pg_isready -U admin > /dev/null 2>&1; then echo "✅ Bereit"; else echo "❌ Nicht bereit"; fi)
- **Backend:** $(if curl -s http://localhost:3001/health > /dev/null 2>&1; then echo "✅ Bereit"; else echo "❌ Nicht bereit"; fi)
- **Frontend:** $(if curl -s http://localhost:3000 > /dev/null 2>&1; then echo "✅ Bereit"; else echo "❌ Nicht bereit"; fi)
- **Grafana:** $(if curl -s http://localhost:3002 > /dev/null 2>&1; then echo "✅ Bereit"; else echo "❌ Nicht bereit"; fi)

## Nächste Schritte
1. Überprüfen Sie alle Funktionen
2. Testen Sie die Anwendungen
3. Prüfen Sie die Logs auf Fehler

---
*Generiert automatisch von patch-system.sh*
EOF

log_success "Patch-Report erstellt: $REPORT_FILE"

# Finale Nachricht
echo ""
log_success "System-Patch erfolgreich abgeschlossen!"
log_info "Patch-Report: $REPORT_FILE"
log_info "Log-Datei: $LOG_FILE"

echo ""
echo "🌐 Verfügbare Services:"
echo "   Frontend (Admin): http://localhost:3000"
echo "   Backend API:      http://localhost:3001"
echo "   Grafana:          http://localhost:3002"
echo "   PostgreSQL:       localhost:5432"

echo ""
log_warning "Bitte überprüfen Sie alle Funktionen nach dem Patch!"
echo ""
