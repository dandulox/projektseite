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
   log_error "Dieses Skript sollte nicht als Root ausgeführt werden!"
   exit 1
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
sudo usermod -aG docker $USER

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
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR

# Klone das Projekt von GitHub
log_info "Klone Projekt von GitHub..."
cd $PROJECT_DIR
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
sudo mkdir -p /opt/backups/projektseite
sudo chown $USER:$USER /opt/backups/projektseite

# Erstelle Log-Verzeichnis
log_info "Erstelle Log-Verzeichnis..."
sudo mkdir -p /var/log/projektseite
sudo chown $USER:$USER /var/log/projektseite

# Konfiguriere Log-Rotation
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

# Erstelle Monitoring-Verzeichnis
log_info "Erstelle Monitoring-Verzeichnis..."
sudo mkdir -p /opt/monitoring
sudo chown $USER:$USER /opt/monitoring

# Installiere Prometheus Node Exporter für System-Monitoring
log_info "Installiere Prometheus Node Exporter..."
wget https://github.com/prometheus/node_exporter/releases/latest/download/node_exporter-1.6.1.linux-amd64.tar.gz
tar xvfz node_exporter-1.6.1.linux-amd64.tar.gz
sudo mv node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/
rm -rf node_exporter-1.6.1.linux-amd64*

# Erstelle Node Exporter Service
sudo tee /etc/systemd/system/node_exporter.service > /dev/null <<EOF
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
sudo useradd --no-create-home --shell /bin/false prometheus
sudo chown prometheus:prometheus /usr/local/bin/node_exporter

# Aktiviere Node Exporter
sudo systemctl enable node_exporter
sudo systemctl start node_exporter

# Erstelle Cron-Jobs für Wartung
log_info "Erstelle Cron-Jobs..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/projektseite/scripts/backup-system.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 3 * * 0 /opt/projektseite/scripts/update-system.sh") | crontab -

# Erstelle Umgebungsvariablen-Datei
log_info "Erstelle Umgebungsvariablen..."
sudo tee /etc/environment.d/projektseite.conf > /dev/null <<EOF
PROJEKTSEITE_HOME=$PROJECT_DIR
NODE_ENV=production
EOF

# Setze Berechtigungen
log_info "Setze Berechtigungen..."
sudo chmod +x /opt/projektseite/scripts/*.sh

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
