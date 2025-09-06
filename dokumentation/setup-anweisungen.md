# Setup-Anweisungen - Projektseite v3.0

## Voraussetzungen
- Ubuntu 24.04 LTS Server oder macOS/Linux
- Mindestens 2GB RAM
- 20GB freier Festplattenspeicher
- Root-Zugriff oder sudo-Berechtigungen
- Node.js 18.x (wird automatisch installiert)
- Docker & Docker Compose (wird automatisch installiert)

## 1. Projekt-Setup
```bash
# Projektdateien herunterladen
git clone https://github.com/dandulox/projektseite.git
cd projektseite

# Vollständige Installation (empfohlen)
chmod +x scripts/install-v3.sh
./scripts/install-v3.sh

# Oder mit Optionen
./scripts/install-v3.sh --environment production --skip-tests
```

## 2. Standard-Logindaten nach der Installation

Nach erfolgreicher Installation sind folgende Standard-Zugangsdaten verfügbar:

### 🌐 Frontend (Client)
- **URL:** http://localhost:3000
- **Login:** http://localhost:3000/login
- **Status:** Wird nach dem Build verfügbar sein
- **Authentifizierung:** Vollständig implementiert mit JWT

### 🔧 Backend API (Server)
- **URL:** http://localhost:3001
- **API Info:** http://localhost:3001/api
- **Health Check:** http://localhost:3001/api/admin/health
- **Auth API:** http://localhost:3001/api/auth
- **Admin API:** http://localhost:3001/api/admin
- **Status:** Läuft nach dem Build
- **Authentifizierung:** JWT-basiert mit bcrypt-Passwort-Hashing

### 🗄️ PostgreSQL Datenbank
- **Host:** localhost
- **Port:** 5432
- **Datenbank:** projektseite
- **Benutzer:** admin
- **Passwort:** secure_password_123
- **Status:** Läuft sofort nach dem Setup
- **Prisma ORM:** Vollständig konfiguriert

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
- Prisma ORM und Dependencies
- TypeScript und Build-Tools

## 3. Alternative Setup-Methoden

### Quick Start (für Entwicklung)
```bash
# Schnellstart für lokale Entwicklung
chmod +x scripts/quick-start.sh
./scripts/quick-start.sh
```

### Update-System
```bash
# System aktualisieren
chmod +x scripts/update-v3.sh
./scripts/update-v3.sh
```

### Validierung
```bash
# System validieren
chmod +x scripts/validate-v3.sh
./scripts/validate-v3.sh
```

## 🚀 System-Verwaltung

### Launcher (Empfohlen für Wartung)
```bash
# Benutzerfreundliche System-Verwaltung
sudo ./scripts/launcher.sh

# Verfügbare Optionen:
# 1) Main Control - Interaktive Steuerung aller Scripts
# 2) Batch Runner - Batch-Ausführung von Scripts
# 3) Batch Creator - Batch-Dateien erstellen und verwalten
# 4) Schnellstart-Optionen - Vordefinierte Operationssequenzen
#    - FastPatch (Patch-Manager) - Patch-Management für Systemupdates
#    - FastUpdate (App-Update) - Schnelles App-Update mit Git-Pull
# 5) System-Status - Aktueller Systemzustand
# 6) Hilfe - Integrierte Dokumentation
```

### Main Control System
```bash
# Erweiterte System-Verwaltung
sudo ./scripts/main-control.sh

# Funktionen:
# - Scripts einzeln ausführen
# - Warteschlangen verwalten
# - Batch-Operationen
# - System-Status überwachen
# - Logs anzeigen
```

## 🌐 Verfügbare Services

Nach dem erfolgreichen Start sind folgende Services verfügbar:

| Service | URL | Port | Beschreibung |
|---------|-----|-------|--------------|
| **Frontend (Client)** | http://localhost:3000 | 3000 | React Client-Interface |
| **Backend API (Server)** | http://localhost:3001 | 3001 | Node.js/Express API mit TypeScript |
| **Grafana** | http://localhost:3002 | 3002 | Monitoring Dashboard |
| **PostgreSQL** | localhost:5432 | 5432 | Datenbank mit Prisma ORM |
