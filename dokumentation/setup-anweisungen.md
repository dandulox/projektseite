# Setup-Anweisungen - Projektseite

## Voraussetzungen
- Ubuntu 24.04 LTS Server
- Mindestens 2GB RAM
- 20GB freier Festplattenspeicher
- Root-Zugriff oder sudo-Berechtigungen

## 1. Server-Setup (Ubuntu 24.04)
```bash
# Projektdateien herunterladen
git clone https://github.com/dandulox/projektseite.git
cd projektseite

# Server-Setup ausführen
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh

# Server neu starten (wichtig!)
sudo reboot
```

## 2. Standard-Logindaten nach der Installation

Nach erfolgreicher Installation sind folgende Standard-Zugangsdaten verfügbar:

### 🌐 Frontend (Admin-Interface)
- **URL:** http://localhost:3000
- **Login:** http://localhost:3000/login
- **Status:** Wird nach dem ersten Build verfügbar sein
- **Authentifizierung:** Vollständig implementiert mit JWT

### 🔧 Backend API
- **URL:** http://localhost:3001
- **Health Check:** http://localhost:3001/health
- **Auth API:** http://localhost:3001/api/auth
- **Admin API:** http://localhost:3001/api/admin
- **Status:** Läuft nach dem ersten Build
- **Authentifizierung:** JWT-basiert mit bcrypt-Passwort-Hashing

### 🗄️ PostgreSQL Datenbank
- **Host:** localhost
- **Port:** 5432
- **Datenbank:** projektseite
- **Benutzer:** admin
- **Passwort:** secure_password_123
- **Status:** Läuft sofort nach dem Setup

### 📊 Grafana Monitoring
- **URL:** http://localhost:3002
- **Benutzer:** admin
- **Passwort:** admin123
- **Status:** Läuft sofort nach dem Setup
- **Dashboard:** Projektseite-Übersicht verfügbar

### 🔍 Prometheus Node Exporter
- **URL:** http://localhost:9100/metrics
- **Status:** Läuft als System-Service
- **Metriken:** System-Performance-Daten verfügbar

### 🔐 Standard-Zugangsdaten
Nach der Installation sind folgende Benutzer automatisch verfügbar:

| Benutzername | Passwort | Rolle | Beschreibung |
|--------------|----------|-------|--------------|
| **admin** | **admin** | Administrator | Vollzugriff auf alle Funktionen |
| **user** | **user123** | Benutzer | Standard-Benutzerzugriff |

**Wichtiger Hinweis:** Ändern Sie diese Standard-Passwörter nach der ersten Anmeldung!

**Was wird installiert:**
- Docker & Docker Compose
- Node.js 18.x
- PostgreSQL Client
- Nginx, UFW Firewall
- Fail2ban für Sicherheit
- Prometheus Node Exporter
- Git & automatische Cron-Jobs
- Automatisches Klonen von GitHub

## 3. Projekt wird automatisch geklont
```bash
# Nach dem Reboot wird das Projekt automatisch von GitHub geklont
# Keine manuellen Schritte erforderlich
cd /opt/projektseite
```

## 4. Docker-Container starten
```bash
# Berechtigungen setzen
chmod +x scripts/*.sh

# Docker-Container starten
./scripts/start-docker.sh
```

## 5. Datenbank initialisieren
```bash
# Datenbank-Schema erstellen
./scripts/init-database.sh
```

## 🌐 Verfügbare Services

Nach dem erfolgreichen Start sind folgende Services verfügbar:

| Service | URL | Port | Beschreibung |
|---------|-----|-------|--------------|
| **Frontend (Admin)** | http://localhost:3000 | 3000 | React Admin-Interface |
| **Backend API** | http://localhost:3001 | 3001 | Node.js/Express API |
| **Grafana** | http://localhost:3002 | 3002 | Monitoring Dashboard |
| **PostgreSQL** | localhost:5432 | 5432 | Datenbank |
