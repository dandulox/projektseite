#!/bin/bash

# ===== PROJEKTSEITE SERVER SETUP SCRIPT =====
# Ubuntu 24.04 LTS Server Setup
# Erstellt: $(date)

set -e  # Beende bei Fehlern

echo "🚀 Starte Server-Setup für Projektseite..."

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

# Prüfe ob als Root ausgeführt
if [[ $EUID -eq 0 ]]; then
   log_info "Skript wird als Root ausgeführt - das ist in Ordnung für Server-Setup"
fi

# Aktualisiere System
log_info "Aktualisiere System-Pakete..."
sudo apt update && sudo apt upgrade -y

# Installiere grundlegende Pakete
log_info "Installiere grundlegende Pakete..."
sudo apt install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    ufw \
    fail2ban \
    nginx \
    certbot \
    python3-certbot-nginx \
    unzip \
    zip \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Installiere Docker
log_info "Installiere Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Füge Benutzer zur Docker-Gruppe hinzu
if [[ $EUID -eq 0 ]]; then
    # Als Root: Benutzer aus Umgebungsvariable oder Standard
    ACTUAL_USER=${SUDO_USER:-$USER}
    if [ -n "$ACTUAL_USER" ]; then
        usermod -aG docker $ACTUAL_USER
        log_info "Benutzer $ACTUAL_USER zur Docker-Gruppe hinzugefügt"
    else
        log_warning "Konnte Benutzer nicht zur Docker-Gruppe hinzufügen"
    fi
else
    # Als normaler Benutzer: sudo verwenden
    sudo usermod -aG docker $USER
fi

# Installiere Docker Compose
log_info "Installiere Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Installiere Node.js 18.x
log_info "Installiere Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installiere PostgreSQL Client
log_info "Installiere PostgreSQL Client..."
sudo apt install -y postgresql-client

# Konfiguriere Firewall
log_info "Konfiguriere Firewall..."
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 3001/tcp  # Backend
sudo ufw allow 3002/tcp  # Grafana
sudo ufw allow 5432/tcp  # PostgreSQL (nur für lokale Verbindungen)

# Konfiguriere Fail2ban
log_info "Konfiguriere Fail2ban..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Erstelle Projektverzeichnis
log_info "Erstelle Projektverzeichnis..."
PROJECT_DIR="/opt/projektseite"
mkdir -p $PROJECT_DIR

# Bestimme den tatsächlichen Benutzer
if [[ $EUID -eq 0 ]]; then
    ACTUAL_USER=${SUDO_USER:-$USER}
    if [ -n "$ACTUAL_USER" ]; then
        chown $ACTUAL_USER:$ACTUAL_USER $PROJECT_DIR
        log_info "Projektverzeichnis für Benutzer $ACTUAL_USER erstellt"
    else
        log_warning "Konnte Besitzer nicht setzen"
    fi
else
    sudo mkdir -p $PROJECT_DIR
    sudo chown $USER:$USER $PROJECT_DIR
fi

# Klone das Projekt von GitHub
log_info "Klone Projekt von GitHub..."
cd $PROJECT_DIR

# Lösche vorhandene Dateien falls das Verzeichnis nicht leer ist
if [ "$(ls -A)" ]; then
    log_info "Verzeichnis ist nicht leer, lösche vorhandene Dateien..."
    rm -rf ./* ./.* 2>/dev/null || true
    log_info "Verzeichnis geleert"
fi

# Klone das Projekt
log_info "Klone Projekt von GitHub..."
git clone https://github.com/dandulox/projektseite.git .
git config --global user.name "Projektseite Server"
git config --global user.email "server@projektseite.local"

# Erstelle Systemd Service für automatischen Start
log_info "Erstelle Systemd Service..."
sudo tee /etc/systemd/system/projektseite.service > /dev/null <<EOF
[Unit]
Description=Projektseite Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Aktiviere Service
sudo systemctl enable projektseite.service

# Erstelle Backup-Verzeichnis
log_info "Erstelle Backup-Verzeichnis..."
mkdir -p /opt/backups/projektseite

if [[ $EUID -eq 0 ]]; then
    ACTUAL_USER=${SUDO_USER:-$USER}
    if [ -n "$ACTUAL_USER" ]; then
        chown $ACTUAL_USER:$ACTUAL_USER /opt/backups/projektseite
    fi
else
    sudo chown $USER:$USER /opt/backups/projektseite
fi

# Erstelle Log-Verzeichnis
log_info "Erstelle Log-Verzeichnis..."
mkdir -p /var/log/projektseite

if [[ $EUID -eq 0 ]]; then
    ACTUAL_USER=${SUDO_USER:-$USER}
    if [ -n "$ACTUAL_USER" ]; then
        chown $ACTUAL_USER:$ACTUAL_USER /var/log/projektseite
    fi
else
    sudo chown $USER:$USER /var/log/projektseite
fi

# Konfiguriere Log-Rotation
if [[ $EUID -eq 0 ]]; then
    ACTUAL_USER=${SUDO_USER:-$USER}
    if [ -n "$ACTUAL_USER" ]; then
        tee /etc/logrotate.d/projektseite > /dev/null <<EOF
/var/log/projektseite/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $ACTUAL_USER $ACTUAL_USER
}
EOF
    else
        log_warning "Konnte Log-Rotation nicht konfigurieren"
    fi
else
    sudo tee /etc/logrotate.d/projektseite > /dev/null <<EOF
/var/log/projektseite/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
EOF
fi

# Erstelle Monitoring-Verzeichnis
log_info "Erstelle Monitoring-Verzeichnis..."
mkdir -p /opt/monitoring

if [[ $EUID -eq 0 ]]; then
    ACTUAL_USER=${SUDO_USER:-$USER}
    if [ -n "$ACTUAL_USER" ]; then
        chown $ACTUAL_USER:$ACTUAL_USER /opt/monitoring
    fi
else
    sudo chown $USER:$USER /opt/monitoring
fi

# Installiere Prometheus Node Exporter für System-Monitoring
log_info "Installiere Prometheus Node Exporter..."
wget https://github.com/prometheus/node_exporter/releases/latest/download/node_exporter-1.6.1.linux-amd64.tar.gz
tar xvfz node_exporter-1.6.1.linux-amd64.tar.gz
sudo mv node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/
rm -rf node_exporter-1.6.1.linux-amd64*

# Erstelle Node Exporter Service
tee /etc/systemd/system/node_exporter.service > /dev/null <<EOF
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=prometheus
ExecStart=/usr/local/bin/node_exporter
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Erstelle Prometheus-Benutzer
useradd --no-create-home --shell /bin/false prometheus
chown prometheus:prometheus /usr/local/bin/node_exporter

# Aktiviere Node Exporter
systemctl enable node_exporter
systemctl start node_exporter

# Erstelle Cron-Jobs für Wartung
log_info "Erstelle Cron-Jobs..."
if [[ $EUID -eq 0 ]]; then
    ACTUAL_USER=${SUDO_USER:-$USER}
    if [ -n "$ACTUAL_USER" ]; then
        (crontab -u $ACTUAL_USER -l 2>/dev/null; echo "0 2 * * * /opt/projektseite/scripts/backup-system.sh") | crontab -u $ACTUAL_USER -
        (crontab -u $ACTUAL_USER -l 2>/dev/null; echo "0 3 * * 0 /opt/projektseite/scripts/update-system.sh") | crontab -u $ACTUAL_USER -
        log_info "Cron-Jobs für Benutzer $ACTUAL_USER erstellt"
    else
        log_warning "Konnte Cron-Jobs nicht erstellen"
    fi
else
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/projektseite/scripts/backup-system.sh") | crontab -
    (crontab -l 2>/dev/null; echo "0 3 * * 0 /opt/projektseite/scripts/update-system.sh") | crontab -
fi

# Erstelle Umgebungsvariablen-Datei
log_info "Erstelle Umgebungsvariablen..."
tee /etc/environment.d/projektseite.conf > /dev/null <<EOF
PROJEKTSEITE_HOME=$PROJECT_DIR
NODE_ENV=production
EOF

# Setze Berechtigungen
log_info "Setze Berechtigungen..."
chmod +x /opt/projektseite/scripts/*.sh

# Finale Nachricht
log_success "Server-Setup abgeschlossen!"
log_info "Nächste Schritte:"
log_info "1. Server neu starten: sudo reboot"
log_info "2. Projekt wird automatisch von GitHub geklont"
log_info "3. Docker starten: ./scripts/start-docker.sh"
log_info "4. Datenbank initialisieren: ./scripts/init-database.sh"

echo ""
log_warning "Bitte starte den Server neu, um alle Änderungen zu übernehmen!"
echo ""
