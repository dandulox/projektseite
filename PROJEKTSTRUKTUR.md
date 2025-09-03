# Projektseite - Vollständige Projektstruktur

## 📁 Verzeichnisstruktur

```
projektseite/
├── 📖 README.md                           # Projektbeschreibung und Setup
├── 📋 PROJEKTSTRUKTUR.md                  # Diese Datei - Detaillierte Übersicht
├── 🐳 docker/
│   └── docker-compose.yml                 # Docker-Container-Konfiguration
├── ⚙️ backend/
│   ├── package.json                       # Node.js-Abhängigkeiten
│   ├── server.js                          # Hauptserver mit modularem Design
│   ├── Dockerfile                         # Backend-Container
│   └── routes/                            # API-Routen (zu implementieren)
│       ├── auth.js                        # Authentifizierung
│       ├── projects.js                    # Projektverwaltung
│       ├── modules.js                     # Modulverwaltung
│       ├── design.js                      # Design-Einstellungen
│       └── admin.js                       # Admin-Funktionen
├── 🎨 frontend/
│   ├── package.json                       # React-Abhängigkeiten
│   ├── Dockerfile                         # Frontend-Container
│   ├── src/
│   │   ├── App.jsx                        # Haupt-App-Komponente
│   │   ├── components/                    # React-Komponenten
│   │   │   └── layout/                    # Layout-Komponenten
│   │   │       ├── Sidebar.jsx            # Seitenleiste
│   │   │       └── Header.jsx             # Kopfzeile
│   │   ├── pages/                         # Seiten-Komponenten
│   │   │   ├── Dashboard.jsx              # Dashboard
│   │   │   ├── Projects.jsx               # Projektverwaltung
│   │   │   ├── Modules.jsx                # Modulverwaltung
│   │   │   ├── Design.jsx                 # Design-Einstellungen
│   │   │   ├── Admin.jsx                  # Admin-Bereich
│   │   │   └── Login.jsx                  # Login-Seite
│   │   └── contexts/                      # React Contexts
│   │       ├── AuthContext.jsx            # Authentifizierung
│   │       └── DesignContext.jsx          # Design-Einstellungen
│   └── public/                            # Statische Dateien
├── 🗄️ database/
│   └── init/
│       └── 01_schema.sql                  # PostgreSQL-Datenbankschema
├── 🎨 shared/
│   └── styles/
│       └── main.css                       # Zentrale CSS-Design-Datei
├── 📊 monitoring/
│   └── grafana/
│       └── dashboards/
│           └── projektseite-overview.json # Grafana-Dashboard
└── 🔧 scripts/
    ├── setup-server.sh                    # Server-Setup (Ubuntu 24.04)
    ├── start-docker.sh                    # Docker-Container starten
    ├── update-system.sh                   # System-Updates
    ├── backup-system.sh                   # System-Backups
    └── restore-system.sh                  # System-Wiederherstellung
```

## 🚀 Features

### ✅ Implementiert
- **Modulares Backend-Design** mit Express.js
- **Zentrale CSS-Design-Datei** mit CSS-Variablen
- **Docker-Container** für alle Services
- **PostgreSQL-Datenbank** mit vollständigem Schema
- **Ubuntu 24.04 Server-Setup** mit allen Paketen
- **Automatische Wartungsskripte** (Update, Backup, Restore)
- **Grafana-Monitoring** vorbereitet
- **React Admin-Frontend** mit modularem Design

### 🔄 Zu implementieren
- **Backend-Routen** (auth, projects, modules, design, admin)
- **Frontend-Komponenten** (alle Seiten und Layout-Komponenten)
- **Live-Edit-Funktionalität** für Design-Einstellungen
- **Authentifizierungssystem** mit JWT
- **Projektverwaltung** mit CRUD-Operationen
- **Modulverwaltung** für Projekte
- **Design-Einstellungen** mit Live-Vorschau

## 🛠️ Technologie-Stack

### Backend
- **Node.js 18.x** mit Express.js
- **PostgreSQL 15** als Datenbank
- **JWT** für Authentifizierung
- **Modulare Architektur** für einfache Erweiterung

### Frontend
- **React 18** mit modernen Hooks
- **React Router 6** für Navigation
- **React Query** für Server-State-Management
- **Zentrale CSS** mit CSS-Variablen
- **Responsive Design** mit Mobile-First-Ansatz

### Infrastructure
- **Docker & Docker Compose** für Containerisierung
- **Ubuntu 24.04 LTS** als Server-OS
- **Grafana** für Monitoring
- **Prometheus Node Exporter** für System-Metriken

## 📋 Setup-Anweisungen

### 1. Server-Setup
```bash
# Auf Ubuntu 24.04 Server ausführen
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh
sudo reboot
```

### 2. Projektdateien kopieren
```bash
# Nach dem Reboot
sudo cp -r . /opt/projektseite/
sudo chown -R $USER:$USER /opt/projektseite/
cd /opt/projektseite
```

### 3. Docker starten
```bash
chmod +x scripts/*.sh
./scripts/start-docker.sh
```

### 4. Datenbank initialisieren
```bash
./scripts/init-database.sh
```

## 🔧 Wartung

### Automatische Wartung
- **Backups**: Täglich um 2:00 Uhr
- **Updates**: Sonntags um 3:00 Uhr
- **Log-Rotation**: Automatisch

### Manuelle Wartung
```bash
# Backup erstellen
./scripts/backup-system.sh

# System aktualisieren
./scripts/update-system.sh

# Backup wiederherstellen
./scripts/restore-system.sh
```

## 🌐 Verfügbare Services

Nach dem Start sind folgende Services verfügbar:
- **Frontend (Admin)**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Grafana**: http://localhost:3002
- **PostgreSQL**: localhost:5432

## 📊 Monitoring

### Grafana-Dashboards
- **System Overview**: CPU, Memory, Disk Usage
- **Container Status**: Docker-Container-Überwachung
- **Anwendungsmetriken**: Backend/Frontend-Status

### Prometheus-Metriken
- **System-Metriken**: CPU, Memory, Disk, Network
- **Container-Metriken**: Docker-Container-Performance
- **Anwendungsmetriken**: HTTP-Requests, Response Times

## 🔒 Sicherheit

### Implementierte Sicherheitsmaßnahmen
- **Firewall (UFW)** mit restriktiven Regeln
- **Fail2ban** für Intrusion Prevention
- **Rate Limiting** in der API
- **Helmet.js** für HTTP-Sicherheitsheader
- **CORS-Konfiguration** mit Whitelist

### Empfohlene zusätzliche Maßnahmen
- **SSL/TLS-Zertifikate** mit Let's Encrypt
- **Regelmäßige Sicherheits-Updates**
- **Backup-Verschlüsselung**
- **Audit-Logging**

## 📈 Skalierbarkeit

### Horizontale Skalierung
- **Docker-Container** können einfach repliziert werden
- **Load Balancer** kann vor Frontend/Backend geschaltet werden
- **Datenbank-Clustering** mit PostgreSQL

### Vertikale Skalierung
- **Container-Ressourcen** können angepasst werden
- **Node.js-Clustering** für Backend-Performance
- **Datenbank-Optimierung** mit Indizes und Query-Optimierung

## 🚧 Nächste Schritte

1. **Backend-Routen implementieren**
2. **Frontend-Komponenten erstellen**
3. **Live-Edit-Funktionalität entwickeln**
4. **Authentifizierungssystem implementieren**
5. **Projektverwaltung entwickeln**
6. **Tests schreiben**
7. **CI/CD-Pipeline aufsetzen**
8. **Produktions-Deployment vorbereiten**

## 📞 Support

Bei Fragen oder Problemen:
1. **Logs prüfen**: `/var/log/projektseite/`
2. **Container-Status**: `docker-compose ps`
3. **System-Status**: `./scripts/status.sh` (zu implementieren)
4. **Backup/Restore**: Verwende die bereitgestellten Skripte

---

*Diese Struktur bietet eine solide Grundlage für eine skalierbare, wartbare und sichere Projektstatus-Website.*
