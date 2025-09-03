#!/bin/bash

# ===== PROJEKTSEITE DOCKER START SCRIPT =====
# Startet alle Docker-Container
# Erstellt: $(date)

set -e

echo "🐳 Starte Docker-Container für Projektseite..."

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

# Prüfe ob als Root ausgeführt
if [[ $EUID -eq 0 ]]; then
   log_info "Skript wird als Root ausgeführt - das ist in Ordnung"
fi

# Wechsle zum Projektverzeichnis
log_info "Aktuelles Verzeichnis: $(pwd)"
if [ ! -f "docker-compose.yml" ]; then
    log_info "Docker-Compose-Datei nicht gefunden, wechsle zum Projektverzeichnis..."
    cd /opt/projektseite
    log_info "Neues Verzeichnis: $(pwd)"
    if [ ! -f "docker-compose.yml" ]; then
        log_error "Docker-Compose-Datei nicht gefunden in /opt/projektseite!"
        log_info "Verfügbare Dateien:"
        ls -la
        log_error "Bitte führe zuerst setup-server.sh aus, um das Projekt zu klonen."
        exit 1
    fi
else
    log_info "Docker-Compose-Datei gefunden im aktuellen Verzeichnis"
fi

# Prüfe ob Docker läuft
log_info "Prüfe Docker-Status..."
if ! docker info > /dev/null 2>&1; then
    log_error "Docker läuft nicht! Starte Docker..."
    systemctl start docker
    sleep 5
fi

# Prüfe ob Docker Compose verfügbar ist
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose ist nicht verfügbar!"
    exit 1
fi

# Stoppe laufende Container
log_info "Stoppe laufende Container..."
if [ -f "docker-compose.yml" ]; then
    docker-compose down
else
    log_error "Docker-Compose-Datei nicht gefunden im aktuellen Verzeichnis!"
    log_info "Aktuelles Verzeichnis: $(pwd)"
    log_info "Verfügbare Dateien:"
    ls -la
    exit 1
fi

# Prüfe verfügbaren Speicherplatz
log_info "Prüfe verfügbaren Speicherplatz..."
AVAILABLE_SPACE=$(df . | awk 'NR==2 {print $4}')
REQUIRED_SPACE=2000000  # 2GB in KB

if [ "$AVAILABLE_SPACE" -lt "$REQUIRED_SPACE" ]; then
    log_warning "Wenig Speicherplatz verfügbar: ${AVAILABLE_SPACE}KB"
    log_info "Bereinige Docker-System..."
    docker system prune -f
fi

# Starte Container
log_info "Starte Docker-Container..."
if [ -f "docker-compose.yml" ]; then
    docker-compose up -d
else
    log_error "Docker-Compose-Datei nicht gefunden!"
    exit 1
fi

# Warte auf Container-Start
log_info "Warte auf Container-Start..."
sleep 15

# Prüfe Container-Status
log_info "Prüfe Container-Status..."
if [ -f "docker-compose.yml" ]; then
    docker-compose ps
else
    log_error "Docker-Compose-Datei nicht gefunden!"
    exit 1
fi

# Prüfe Container-Logs
log_info "Prüfe Container-Logs..."
if [ -f "docker-compose.yml" ]; then
    echo "=== PostgreSQL Logs ==="
    docker-compose logs postgres --tail=10

    echo "=== Backend Logs ==="
    docker-compose logs backend --tail=10

    echo "=== Frontend Logs ==="
    docker-compose logs frontend --tail=10

    echo "=== Grafana Logs ==="
    docker-compose logs grafana --tail=10
else
    log_error "Docker-Compose-Datei nicht gefunden!"
    exit 1
fi

# Prüfe Verbindungen
log_info "Prüfe Verbindungen..."

# PostgreSQL
if docker exec projektseite-postgres pg_isready -U admin; then
    log_success "PostgreSQL ist bereit"
else
    log_error "PostgreSQL ist nicht bereit!"
fi

# Backend
if curl -s http://localhost:3001/health > /dev/null; then
    log_success "Backend ist bereit"
else
    log_warning "Backend ist noch nicht bereit, warte..."
    sleep 10
    if curl -s http://localhost:3001/health > /dev/null; then
        log_success "Backend ist jetzt bereit"
    else
        log_error "Backend ist nicht erreichbar!"
    fi
fi

# Frontend
if curl -s http://localhost:3000 > /dev/null; then
    log_success "Frontend ist bereit"
else
    log_warning "Frontend ist noch nicht bereit, warte..."
    sleep 10
    if curl -s http://localhost:3000 > /dev/null; then
        log_success "Frontend ist jetzt bereit"
    else
        log_error "Frontend ist nicht erreichbar!"
    fi
fi

# Grafana
if curl -s http://localhost:3002 > /dev/null; then
    log_success "Grafana ist bereit"
else
    log_warning "Grafana ist noch nicht bereit, warte..."
    sleep 10
    if curl -s http://localhost:3002 > /dev/null; then
        log_success "Grafana ist jetzt bereit"
    else
        log_error "Grafana ist nicht erreichbar!"
    fi
fi

# Zeige Ports und URLs
echo ""
log_success "Docker-Container erfolgreich gestartet!"
echo ""
echo "🌐 Verfügbare Services:"
echo "   Frontend (Admin): http://localhost:3000"
echo "   Backend API:      http://localhost:3001"
echo "   Grafana:          http://localhost:3002"
echo "   PostgreSQL:       localhost:5432"
echo ""
echo "📊 Container-Status:"
if [ -f "docker-compose.yml" ]; then
    docker-compose ps
else
    log_error "Docker-Compose-Datei nicht gefunden!"
    exit 1
fi
echo ""
echo "📝 Nützliche Befehle:"
echo "   Container stoppen:  docker-compose down"
echo "   Logs anzeigen:      docker-compose logs -f [service]"
echo "   Container neu starten: docker-compose restart [service]"
echo ""

# Erstelle Status-Datei
STATUS_FILE="/opt/projektseite/status.txt"
cat > "$STATUS_FILE" <<EOF
# Projektseite Status
# Erstellt: $(date)

## Container-Status
$(if [ -f "docker-compose.yml" ]; then docker-compose ps; else echo "Docker-Compose nicht verfügbar"; fi)

## Service-URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Grafana: http://localhost:3002
- PostgreSQL: localhost:5432

## System-Informationen
- Docker Version: $(docker --version)
- Docker Compose Version: $(docker-compose --version)
- Verfügbarer Speicherplatz: $(df -h . | awk 'NR==2 {print $4}')
EOF

log_info "Status-Datei erstellt: $STATUS_FILE"
