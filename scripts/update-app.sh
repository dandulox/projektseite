#!/bin/bash

# ===== PROJEKTSEITE APP UPDATE SCRIPT =====
# Fährt nur die App-Container herunter, führt Git-Update durch und startet neu
# Erstellt: $(date)

set -e

echo "🚀 Starte App-Update für Projektseite..."

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
LOG_FILE="/var/log/projektseite/app-update-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1

log_info "App-Update-Log wird in $LOG_FILE geschrieben"

# Prüfe ob als Root ausgeführt
if [[ $EUID -eq 0 ]]; then
   log_info "Skript wird als Root ausgeführt - das ist in Ordnung"
fi

# Wechsle zum Projektverzeichnis
cd /opt/projektseite

# Prüfe ob docker-compose.yml existiert
if [ ! -f "docker/docker-compose.yml" ]; then
    log_error "Docker-Compose-Datei nicht gefunden in docker/docker-compose.yml!"
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
echo "⚠️  WARNUNG: Dieses Skript wird die App-Container (Frontend, Backend, PostgreSQL, Grafana) stoppen und neu starten!"
echo "   Die Anwendung wird kurzzeitig nicht verfügbar sein."
echo ""
read -p "Möchten Sie fortfahren? (j/N): " -r
if [[ ! $REPLY =~ ^[Jj]$ ]]; then
    log_info "App-Update abgebrochen vom Benutzer"
    exit 0
fi

echo ""

# 1. Stoppe nur die App-Container (nicht alle Docker-Container)
log_info "1️⃣ Stoppe App-Container..."
docker-compose -f docker/docker-compose.yml down
log_success "App-Container gestoppt"

# 2. Erstelle schnelles Backup der aktuellen Version
log_info "2️⃣ Erstelle schnelles Backup der aktuellen Version..."
BACKUP_DIR="/opt/backups/projektseite/quick-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup der wichtigsten Dateien
cp -r frontend/src "$BACKUP_DIR/" 2>/dev/null || log_warning "Frontend src nicht gefunden"
cp -r backend "$BACKUP_DIR/" 2>/dev/null || log_warning "Backend nicht gefunden"
cp -r database "$BACKUP_DIR/" 2>/dev/null || log_warning "Database nicht gefunden"
cp docker/docker-compose.yml "$BACKUP_DIR/" 2>/dev/null || log_warning "Docker-Compose nicht gefunden"

log_success "Schnelles Backup erstellt: $BACKUP_DIR"

# 3. Git-Update durchführen
log_info "3️⃣ Führe Git-Update durch..."

# Sichere aktuelle lokale Änderungen
log_info "Sichere aktuelle lokale Änderungen..."
git stash push -m "Auto-stash vor App-Update $(date)" || log_warning "Keine lokalen Änderungen zum Stashen"

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
chmod +x /opt/projektseite/scripts/*.sh
log_success "Ausführungsberechtigungen für alle Skripte gesetzt"

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

# 5. Baue neue Docker-Images
log_info "5️⃣ Baue neue Docker-Images..."
if docker-compose -f docker/docker-compose.yml build --no-cache; then
    log_success "Docker-Images neu gebaut"
else
    log_error "Docker-Build fehlgeschlagen!"
    log_info "Versuche Build ohne Cache..."
    if docker-compose -f docker/docker-compose.yml build; then
        log_success "Docker-Images mit Cache gebaut"
    else
        log_error "Docker-Build auch mit Cache fehlgeschlagen!"
        log_info "Prüfe Docker-Logs für Details..."
        docker-compose -f docker/docker-compose.yml logs --tail=50
        exit 1
    fi
fi

# 6. Starte App-Container neu
log_info "6️⃣ Starte App-Container neu..."
docker-compose -f docker/docker-compose.yml up -d
log_success "App-Container gestartet"

# 7. Warte auf Container-Start
log_info "7️⃣ Warte auf Container-Start..."
sleep 15

# 8. Prüfe Container-Status
log_info "8️⃣ Prüfe Container-Status..."
docker-compose -f docker/docker-compose.yml ps

# 9. Prüfe Service-Verfügbarkeit
log_info "9️⃣ Prüfe Service-Verfügbarkeit..."

# PostgreSQL
log_info "Prüfe PostgreSQL..."
if docker exec projektseite-postgres pg_isready -U admin > /dev/null 2>&1; then
    log_success "PostgreSQL ist bereit"
else
    log_warning "PostgreSQL ist noch nicht bereit, warte..."
    sleep 10
    if docker exec projektseite-postgres pg_isready -U admin > /dev/null 2>&1; then
        log_success "PostgreSQL ist jetzt bereit"
    else
        log_error "PostgreSQL ist nicht erreichbar!"
    fi
fi

# Backend
log_info "Prüfe Backend..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    log_success "Backend ist bereit"
else
    log_warning "Backend ist noch nicht bereit, warte..."
    sleep 10
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        log_success "Backend ist jetzt bereit"
    else
        log_error "Backend ist nicht erreichbar!"
    fi
fi

# Frontend
log_info "Prüfe Frontend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    log_success "Frontend ist bereit"
else
    log_warning "Frontend ist noch nicht bereit, warte..."
    sleep 10
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        log_success "Frontend ist jetzt bereit"
    else
        log_error "Frontend ist nicht erreichbar!"
    fi
fi

# Grafana
log_info "Prüfe Grafana..."
if curl -s http://localhost:3002 > /dev/null 2>&1; then
    log_success "Grafana ist bereit"
else
    log_warning "Grafana ist noch nicht bereit, warte..."
    sleep 10
    if curl -s http://localhost:3002 > /dev/null 2>&1; then
        log_success "Grafana ist jetzt bereit"
    else
        log_error "Grafana ist nicht erreichbar!"
    fi
fi

# 10. Erstelle Update-Report
log_info "🔟 Erstelle Update-Report..."
REPORT_FILE="/opt/projektseite/reports/app-update-report-$(date +%Y%m%d-%H%M%S).md"
mkdir -p /opt/projektseite/reports

cat > "$REPORT_FILE" <<EOF
# App Update Report - $(date)

## Update-Zusammenfassung
- **Datum:** $(date)
- **Benutzer:** $USER
- **Update-Typ:** App-Update (nur Container)
- **Backup:** $BACKUP_DIR

## Durchgeführte Aktionen
- App-Container gestoppt
- Schnelles Backup erstellt
- Git-Update durchgeführt
- Dependencies aktualisiert
- Docker-Images neu gebaut
- App-Container neu gestartet

## Container-Status
\`\`\`
$(docker-compose -f docker/docker-compose.yml ps)
\`\`\`

## Service-URLs
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001
- **Grafana:** http://localhost:3002
- **PostgreSQL:** localhost:5432

## Git-Informationen
- **Aktueller Commit:** $(git log --oneline -1)
- **Branch:** $(git branch --show-current)
- **Remote:** $(git remote get-url origin)

## System-Informationen
- **Docker Version:** $(docker --version)
- **Docker Compose Version:** $(docker-compose --version)
- **Verfügbarer Speicherplatz:** $(df -h . | awk 'NR==2 {print $4}')

## Nächste Schritte
- Überprüfen Sie die Anwendung auf http://localhost:3000
- Überwachen Sie die Logs bei Bedarf
- Bei Problemen: Backup in $BACKUP_DIR verfügbar

---
*Generiert automatisch von update-app.sh*
EOF

log_success "Update-Report erstellt: $REPORT_FILE"

# Zeige Ports und URLs
echo ""
log_success "App-Update erfolgreich abgeschlossen!"
echo ""
echo "🌐 Verfügbare Services:"
echo "   Frontend (Admin): http://localhost:3000"
echo "   Backend API:      http://localhost:3001"
echo "   Grafana:          http://localhost:3002"
echo "   PostgreSQL:       localhost:5432"
echo ""
echo "📊 Container-Status:"
docker-compose -f docker/docker-compose.yml ps
echo ""
echo "📝 Nützliche Befehle:"
echo "   Logs anzeigen:      docker-compose -f docker/docker-compose.yml logs -f [service]"
echo "   Container neu starten: docker-compose -f docker/docker-compose.yml restart [service]"
echo "   Container stoppen:  docker-compose -f docker/docker-compose.yml down"
echo ""
echo "📋 Update-Informationen:"
echo "   Log-Datei: $LOG_FILE"
echo "   Report: $REPORT_FILE"
echo "   Backup: $BACKUP_DIR"
echo ""

# Sende Benachrichtigung (falls konfiguriert)
if command -v mail &> /dev/null; then
    echo "App-Update erfolgreich abgeschlossen am $(date)" | mail -s "Projektseite App Update Report" root
fi

log_success "App-Update erfolgreich abgeschlossen!"
