# Projektseite - Projektstatus-Tracker

Eine modulare Website zur Dokumentation und Verfolgung von Projektstatus mit Live-Edit-Funktionalität, Docker-Containerisierung und umfassendem Monitoring.

## 🚀 Features

### ✅ Implementiert
- **Modulares Backend-Design** mit Express.js und Live-Edit-Funktionalität
- **Zentrale CSS-Design-Datei** mit CSS-Variablen für konsistentes Styling
- **Einheitliches Basis-Layout** für alle Seiten
- **PostgreSQL-Datenbank** mit vollständigem Schema und Triggers
- **Docker-Container** mit Ubuntu 24.04 Server-Unterstützung
- **Admin-Oberfläche** mit React und modernem Design
- **Grafana-Monitoring** vorbereitet mit Prometheus-Integration
- **Umfassende Wartungsskripte** für Updates, Backups und Wiederherstellung

### 🔄 Zu implementieren
- Backend-Routen (auth, projects, modules, design, admin)
- Frontend-Komponenten (alle Seiten und Layout-Komponenten)
- Live-Edit-Funktionalität für Design-Einstellungen
- Authentifizierungssystem mit JWT
- Projektverwaltung mit CRUD-Operationen

## 📁 Projektstruktur

```
projektseite/
├── 📖 README.md                           # Diese Datei - Vollständige Dokumentation
├── 📋 PROJEKTSTRUKTUR.md                  # Detaillierte Projektübersicht
├── 🐳 docker/
│   └── docker-compose.yml                 # Docker-Container-Konfiguration
├── ⚙️ backend/
│   ├── package.json                       # Node.js-Abhängigkeiten
│   ├── server.js                          # Hauptserver mit modularem Design
│   ├── Dockerfile                         # Backend-Container
│   └── routes/                            # API-Routen (zu implementieren)
├── 🎨 frontend/
│   ├── package.json                       # React-Abhängigkeiten
│   ├── Dockerfile                         # Frontend-Container
│   └── src/
│       ├── App.jsx                        # Haupt-App-Komponente
│       ├── components/                    # React-Komponenten
│       ├── pages/                         # Seiten-Komponenten
│       └── contexts/                      # React Contexts
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
    ├── check-logs.sh                      # Container-Logs überprüfen
    ├── patch-system.sh                    # System-Patch (Git + Docker)
    ├── fix-systemd.sh                     # Systemd Service reparieren
    ├── update-system.sh                   # System-Updates
    ├── backup-system.sh                   # System-Backups
    └── restore-system.sh                  # System-Wiederherstellung
```

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

### Voraussetzungen
- Ubuntu 24.04 LTS Server
- Mindestens 2GB RAM
- 20GB freier Festplattenspeicher
- Root-Zugriff oder sudo-Berechtigungen

### 1. Server-Setup (Ubuntu 24.04)
```bash
# Projektdateien herunterladen
git clone https://github.com/dandulox/projektseite.git
cd projektseite

# Server-Setup ausführen
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh

# Server neu starten (wichtig!)
sudo reboot

### 2. Standard-Logindaten nach der Installation

Nach erfolgreicher Installation sind folgende Standard-Zugangsdaten verfügbar:

#### 🌐 Frontend (Admin-Interface)
- **URL:** http://localhost:3000
- **Status:** Wird nach dem ersten Build verfügbar sein
- **Hinweis:** Noch keine Authentifizierung implementiert

#### 🔧 Backend API
- **URL:** http://localhost:3001
- **Health Check:** http://localhost:3001/health
- **Status:** Läuft nach dem ersten Build
- **Hinweis:** API-Endpunkte müssen noch implementiert werden

#### 🗄️ PostgreSQL Datenbank
- **Host:** localhost
- **Port:** 5432
- **Datenbank:** projektseite
- **Benutzer:** admin
- **Passwort:** secure_password_123
- **Status:** Läuft sofort nach dem Setup

#### 📊 Grafana Monitoring
- **URL:** http://localhost:3002
- **Benutzer:** admin
- **Passwort:** admin123
- **Status:** Läuft sofort nach dem Setup
- **Dashboard:** Projektseite-Übersicht verfügbar

#### 🔍 Prometheus Node Exporter
- **URL:** http://localhost:9100/metrics
- **Status:** Läuft als System-Service
- **Metriken:** System-Performance-Daten verfügbar
```

**Was wird installiert:**
- Docker & Docker Compose
- Node.js 18.x
- PostgreSQL Client
- Nginx, UFW Firewall
- Fail2ban für Sicherheit
- Prometheus Node Exporter
- Git & automatische Cron-Jobs
- Automatisches Klonen von GitHub

### 3. Projekt wird automatisch geklont
```bash
# Nach dem Reboot wird das Projekt automatisch von GitHub geklont
# Keine manuellen Schritte erforderlich
cd /opt/projektseite
```

### 4. Docker-Container starten
```bash
# Berechtigungen setzen
chmod +x scripts/*.sh

# Docker-Container starten
./scripts/start-docker.sh
```

### 5. Datenbank initialisieren
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

## 🔧 Wartung & Verwaltung

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

# Docker-Status prüfen
docker-compose ps

# Container-Logs anzeigen
docker-compose logs -f [service]
```

### Container-Verwaltung
```bash
# Alle Container starten
docker-compose up -d

# Alle Container stoppen
docker-compose down

# Container neu starten
docker-compose restart [service]

# Container-Logs
docker-compose logs -f [service]
```

### Diagnose & Fehlerbehebung
```bash
# Container-Logs überprüfen
./scripts/check-logs.sh

# Spezifische Service-Logs
docker-compose -f docker/docker-compose.yml logs -f backend
docker-compose -f docker/docker-compose.yml logs -f frontend

# Container-Status prüfen
docker-compose -f docker/docker-compose.yml ps

# Container neu starten
docker-compose -f docker/docker-compose.yml restart backend
```

### System-Patch (Git + Docker)
```bash
# Vollständiger System-Patch
./scripts/patch-system.sh

# Das Skript führt folgende Schritte aus:
# 1. Stoppt alle Docker-Container
# 2. Erstellt Backup vor Patch
# 3. Führt Git-Update durch
# 4. Aktualisiert Dependencies
# 5. Baut Docker-Container neu
# 6. Startet alle Services
# 7. Überprüft Service-Verfügbarkeit
```

### Systemd Service reparieren
```bash
# Repariert den systemd Service mit korrektem Pfad
./scripts/fix-systemd.sh

# Das Skript behebt:
# - Falsche Pfade zur docker-compose.yml
# - Fehlgeschlagene systemd Services
# - Automatischen Start der Container
```

## 📊 Monitoring & Überwachung

### Grafana-Dashboards
- **System Overview**: CPU, Memory, Disk Usage
- **Container Status**: Docker-Container-Überwachung
- **Anwendungsmetriken**: Backend/Frontend-Status

### Prometheus-Metriken
- **System-Metriken**: CPU, Memory, Disk, Network
- **Container-Metriken**: Docker-Container-Performance
- **Anwendungsmetriken**: HTTP-Requests, Response Times

### Logs
- **Anwendungslogs**: `/var/log/projektseite/`
- **System-Logs**: `/var/log/syslog`
- **Docker-Logs**: `docker-compose logs`

## 🔒 Sicherheit

### Implementierte Sicherheitsmaßnahmen
- **Firewall (UFW)** mit restriktiven Regeln
- **Fail2ban** für Intrusion Prevention
- **Rate Limiting** in der API (100 Requests/15min)
- **Helmet.js** für HTTP-Sicherheitsheader
- **CORS-Konfiguration** mit Whitelist
- **Automatische Updates** für Sicherheitspatches

### Ports & Firewall
- **SSH**: 22 (nur für lokale Verbindungen)
- **HTTP**: 80
- **HTTPS**: 443
- **Frontend**: 3000
- **Backend**: 3001
- **Grafana**: 3002
- **PostgreSQL**: 5432 (nur lokal)

## 📈 Skalierbarkeit

### Horizontale Skalierung
- **Docker-Container** können einfach repliziert werden
- **Load Balancer** kann vor Frontend/Backend geschaltet werden
- **Datenbank-Clustering** mit PostgreSQL

### Vertikale Skalierung
- **Container-Ressourcen** können angepasst werden
- **Node.js-Clustering** für Backend-Performance
- **Datenbank-Optimierung** mit Indizes und Query-Optimierung

## 🚧 Entwicklung & Erweiterung

### Backend-Entwicklung
```bash
# Entwicklungsumgebung starten
cd backend
npm install
npm run dev
```

### Frontend-Entwicklung
```bash
# Entwicklungsumgebung starten
cd frontend
npm install
npm run dev
```

### Datenbank-Schema erweitern
```sql
-- Neue Tabelle hinzufügen
CREATE TABLE IF NOT EXISTS neue_tabelle (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📞 Support & Troubleshooting

### Häufige Probleme

#### Container startet nicht
```bash
# Logs prüfen
docker-compose logs [service]

# Container-Status
docker-compose ps

# Container neu starten
docker-compose restart [service]
```

#### Datenbank-Verbindung fehlschlägt
```bash
# PostgreSQL-Status prüfen
docker exec projektseite-postgres pg_isready -U admin

# Datenbank-Logs
docker-compose logs postgres
```

#### Speicherplatz wird knapp
```bash
# Docker-System bereinigen
docker system prune -f

# Alte Backups löschen
find /opt/backups/projektseite -name "*.tar.gz" -mtime +30 -delete
```

### Logs & Debugging
```bash
# Anwendungslogs
tail -f /var/log/projektseite/*.log

# System-Logs
journalctl -u projektseite.service -f

# Docker-Logs
docker-compose logs -f
```

### Support-Kontakt
1. **Logs prüfen**: `/var/log/projektseite/`
2. **Container-Status**: `docker-compose ps`
3. **System-Status**: `./scripts/status.sh` (zu implementieren)
4. **Backup/Restore**: Verwende die bereitgestellten Skripte

## 🔄 Updates & Wartung

### Regelmäßige Updates
```bash
# System-Updates (inkl. Git-Updates)
./scripts/update-system.sh

# Docker-Images aktualisieren
docker-compose pull
docker-compose up -d

# Manueller Git-Update
cd /opt/projektseite
git pull origin main
```

### Backup-Strategie
- **Tägliche Backups** um 2:00 Uhr
- **30 Tage Aufbewahrung**
- **Automatische Rotation**
- **Integritätsprüfung**
- **Git-Historie** wird mit gesichert

### Wiederherstellung
```bash
# Backup auflisten
ls -lh /opt/backups/projektseite/

# Backup wiederherstellen
./scripts/restore-system.sh
```

## 📚 Nächste Schritte

1. **Backend-Routen implementieren** (auth, projects, modules, design, admin)
2. **Frontend-Komponenten erstellen** (alle Seiten und Layout-Komponenten)
3. **Live-Edit-Funktionalität entwickeln** für Design-Einstellungen
4. **Authentifizierungssystem implementieren** mit JWT
5. **Projektverwaltung entwickeln** mit CRUD-Operationen
6. **Tests schreiben** für alle Komponenten
7. **CI/CD-Pipeline aufsetzen** für automatische Deployments
8. **Produktions-Deployment vorbereiten** mit SSL/TLS

## 📄 Lizenz

MIT License - Siehe LICENSE-Datei für Details.

## 🤝 Beitragen

1. Fork das Repository: https://github.com/dandulox/projektseite
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

### Git-Repository
- **URL**: https://github.com/dandulox/projektseite
- **Branch**: main
- **Automatische Updates**: Täglich über Cron-Job

---

**Hinweis**: Diese Dokumentation wird kontinuierlich aktualisiert. Bei Fragen oder Problemen verwende die bereitgestellten Support-Ressourcen.

