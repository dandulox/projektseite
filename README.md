# Projektseite - Projektstatus-Tracker

Eine modulare Website zur Dokumentation und Verfolgung von Projektstatus mit Live-Edit-Funktionalität, Docker-Containerisierung und umfassendem Monitoring.

## 🚀 Features

### 🆕 Neue Features (Version 2.0)

#### 📁 Projektverwaltung
- **Vollständige CRUD-Operationen** für Projekte
- **Erweiterte Filterung** nach Team, Status und Sichtbarkeit
- **Fortschrittsverfolgung** mit visuellen Indikatoren
- **Team-Zuweisungen** und Berechtigungsmanagement
- **Projekt-Logs** für Aktivitätsverfolgung
- **Responsive Design** mit modernem UI

#### 🧩 Modulverwaltung
- **Projekt-Module** für strukturierte Projektaufteilung
- **Eigenständige Module** für unabhängige Aufgaben
- **Tag-System** für Kategorisierung
- **Abhängigkeitsmanagement** zwischen Modulen
- **Zeitaufwand-Tracking** (geschätzt vs. tatsächlich)
- **Zuweisungen** an Benutzer und Teams

#### 👥 Team-Management
- **Team-Erstellung** und -Verwaltung
- **Rollenbasierte Mitgliedschaft** (Leader, Member, Viewer)
- **Team-Projekte** und -Module
- **Benachrichtigungen** für Team-Aktivitäten
- **Mitgliederverwaltung** mit Einladungen

#### 🔔 Benachrichtigungssystem
- **Echtzeit-Benachrichtigungen** für wichtige Ereignisse
- **Team-Benachrichtigungen** für alle Mitglieder
- **Projekt-Updates** und Modul-Änderungen
- **Benachrichtigungs-Glocke** in der Navigation
- **Gelesen-Status** und Verwaltung

#### 🎨 Design-System
- **Theme-Management** (Light/Dark Mode)
- **CSS-Variablen** für konsistentes Design
- **Responsive Navigation** mit Mobile-Menu
- **Benutzer-Dropdown** mit Profil-Zugriff
- **Design-Einstellungen** (Schriftgröße, Kompakt-Modus)

### ✅ Implementiert
- **Modulares Backend-Design** mit Express.js
- **Tailwind CSS** mit CSS-Variablen für konsistentes Styling
- **Vite Build-System** für schnelle Entwicklung
- **PostgreSQL-Datenbank** mit vollständigem Schema
- **Docker-Container** mit Ubuntu 24.04 Server-Unterstützung
- **React Admin-Interface** mit modernem Design
- **Grafana-Monitoring** vorbereitet mit Prometheus-Integration
- **Umfassende Wartungsskripte** für Updates, Backups und Wiederherstellung
- **🔐 Vollständiges Authentifizierungssystem** mit JWT und bcrypt
- **👥 Benutzerverwaltung** mit Rollen (Admin, User, Viewer) und CRUD-Operationen
- **🛡️ Geschützte API-Routen** mit Token-Validierung
- **📱 Responsive Login/Registrierung** mit modernem Design
- **⚙️ Admin-API** mit Benutzerverwaltung und System-Statistiken
- **📁 Vollständige Projektverwaltung** mit CRUD-Operationen, Filterung und Berechtigungen
- **🧩 Modulverwaltung** für Projekte mit eigenständigen Modulen
- **👥 Team-Management** mit Rollen, Mitgliederverwaltung und Berechtigungen
- **🔔 Benachrichtigungssystem** mit Team- und Projekt-Benachrichtigungen
- **📊 Erweiterte Datenbank-Schemas** für Projekte, Module, Teams und Berechtigungen
- **🎨 Design-System** mit Theme-Management und CSS-Variablen
- **📱 Responsive Navigation** mit Mobile-Menu und Benutzer-Dropdown
- **🔍 Suchfunktionalität** und Filterung in allen Bereichen
- **📈 Fortschrittsverfolgung** mit visuellen Indikatoren
- **🏷️ Tag-System** und Abhängigkeitsmanagement für Module
- **👤 Benutzerprofile** mit Einstellungen und Design-Anpassungen

### 🔄 Zu implementieren
- Live-Edit-Funktionalität für Design-Einstellungen
- Erweiterte Dashboard-Widgets
- Kalender-Integration für Deadlines
- Datei-Upload für Projekte und Module
- Erweiterte Reporting-Funktionen

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
│   ├── routes/                            # API-Routen
│   │   ├── auth.js                        # Authentifizierung (implementiert)
│   │   ├── admin.js                       # Admin-Funktionen (implementiert)
│   │   ├── projects.js                    # Projektverwaltung (implementiert)
│   │   ├── modules.js                     # Modulverwaltung (implementiert)
│   │   ├── teams.js                       # Team-Management (implementiert)
│   │   ├── notifications.js               # Benachrichtigungssystem (implementiert)
│   │   └── greetings.js                   # Begrüßungssystem (implementiert)
│   └── scripts/                           # Backend-Skripte
│       ├── create-default-users.js        # Standard-Benutzer erstellen
│       ├── init-database.js               # Datenbank initialisieren
│       └── init-greetings.js              # Begrüßungen initialisieren
├── 🎨 frontend/
│   ├── package.json                       # React-Abhängigkeiten
│   ├── Dockerfile                         # Frontend-Container
│   ├── index.html                         # HTML-Template
│   ├── nginx.conf                         # Nginx-Konfiguration
│   ├── vite.config.js                     # Vite-Konfiguration
│   ├── tailwind.config.cjs                # Tailwind CSS-Konfiguration
│   ├── postcss.config.cjs                 # PostCSS-Konfiguration
│   ├── README.md                          # Frontend-Dokumentation
│   └── src/
│       ├── App.jsx                        # Haupt-App-Komponente
│       ├── main.jsx                       # React Entry Point
│       ├── index.css                      # Globale Styles mit CSS-Variablen
│       ├── components/                    # React-Komponenten
│       │   ├── LoginForm.jsx              # Login-Formular
│       │   ├── RegisterFormStartPage.jsx  # Registrierungs-Formular
│       │   ├── UserManagement.jsx         # Benutzerverwaltung
│       │   ├── UserSettings.jsx           # Benutzereinstellungen
│       │   ├── ProjectManagement.jsx      # Projektverwaltung
│       │   ├── ModuleForm.jsx             # Modul-Formular
│       │   ├── ModuleManagement.jsx       # Modulverwaltung
│       │   ├── TeamManagement.jsx         # Team-Management
│       │   ├── GreetingManagement.jsx     # Begrüßungsverwaltung
│       │   ├── DynamicGreeting.jsx        # Dynamische Begrüßungen
│       │   └── NotificationBell.jsx       # Benachrichtigungs-Glocke
│       ├── pages/                         # Seiten-Komponenten
│       │   └── AuthPage.jsx               # Authentifizierungs-Seite
│       └── contexts/                      # React Contexts
│           └── AuthContext.jsx            # Authentifizierungs-Context
├── 🗄️ database/
│   ├── init/
│   │   └── 01_schema.sql                  # PostgreSQL-Datenbankschema
│   └── patches/                           # Datenbank-Patches
│       ├── 001_ensure_greetings_table.sql # Begrüßungstabelle sicherstellen
│       ├── 002_example_patch_template.sql # Patch-Vorlage
│       ├── 003_new_humor_greetings.sql    # Neue humorvolle Begrüßungen
│       ├── 004_team_functionality.sql     # Team-Funktionalität
│       ├── 005_notifications_system.sql   # Benachrichtigungssystem
│       ├── 008_module_management_system.sql # Modulverwaltungs-System
│       └── README.md                      # Patch-Dokumentation
├── 🎨 shared/
│   └── styles/                            # Geteilte Styles (aktuell leer)
├── 📊 monitoring/
│   └── grafana/
│       └── dashboards/
│           └── projektseite-overview.json # Grafana-Dashboard
└── 🔧 scripts/
    ├── setup-server.sh                    # Server-Setup (Ubuntu 24.04)
    ├── start-docker.sh                    # Docker-Container starten
    ├── check-logs.sh                      # Container-Logs überprüfen
    ├── create-admin-user.sh               # Admin-Benutzer erstellen
    ├── debug-build.sh                     # Build-Probleme debuggen
    ├── patch-system.sh                    # System-Patch (Git + Docker)
    ├── fix-systemd.sh                     # Systemd Service reparieren
    ├── update-system.sh                   # System-Updates
    ├── update-app.sh                      # App-Update (nur Container)
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
- **Tailwind CSS** für Styling mit CSS-Variablen
- **Vite** als Build-Tool und Development Server
- **TypeScript** für Typsicherheit
- **CSS-Variablen** für Light/Dark Mode Support
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
- **Login:** http://localhost:3000/login
- **Status:** Wird nach dem ersten Build verfügbar sein
- **Authentifizierung:** Vollständig implementiert mit JWT

#### 🔧 Backend API
- **URL:** http://localhost:3001
- **Health Check:** http://localhost:3001/health
- **Auth API:** http://localhost:3001/api/auth
- **Admin API:** http://localhost:3001/api/admin
- **Status:** Läuft nach dem ersten Build
- **Authentifizierung:** JWT-basiert mit bcrypt-Passwort-Hashing

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

#### 🔐 Standard-Zugangsdaten
Nach der Installation sind folgende Benutzer automatisch verfügbar:

| Benutzername | Passwort | Rolle | Beschreibung |
|--------------|----------|-------|--------------|
| **admin** | **admin** | Administrator | Vollzugriff auf alle Funktionen |
| **user** | **user123** | Benutzer | Standard-Benutzerzugriff |

**Wichtiger Hinweis:** Ändern Sie diese Standard-Passwörter nach der ersten Anmeldung!
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
- **Updates**: Sonntags um 3:00 Uhr (überschreibt lokale Änderungen)
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

### Datenbank-Patch-System
```bash
# Datenbank-Strukturen prüfen und reparieren
./scripts/db-patch.sh

# Das Skript führt folgende Schritte aus:
# 1. Erstellt automatisches Backup der Datenbank
# 2. Prüft alle erforderlichen Tabellen
# 3. Wendet verfügbare Patches aus database/patches/ an
# 4. Repariert fehlende Strukturen
# 5. Startet Backend-Container neu
# 6. Zeigt finalen Datenbank-Status

# Verfügbare Patches:
# - 001_ensure_greetings_table.sql - Stellt sicher, dass die greetings-Tabelle existiert
# - 002_example_patch_template.sql - Vorlage für zukünftige Patches
# - 003_new_humor_greetings.sql - Neue humorvolle Begrüßungen
# - Weitere Patches werden automatisch erkannt
```

### App-Update (Nur Container)
```bash
# Schnelles App-Update (nur Container)
./scripts/update-app.sh

# Das Skript führt folgende Schritte aus:
# 1. Stoppt nur die App-Container (Frontend, Backend, PostgreSQL, Grafana)
# 2. Erstellt schnelles Backup
# 3. Führt Git-Update durch
# 4. Aktualisiert Dependencies
# 5. Baut Docker-Images neu
# 6. Startet App-Container neu
# 7. Überprüft Service-Verfügbarkeit

# Vorteile gegenüber patch-system.sh:
# - Schneller (nur App-Container)
# - Weniger Systemausfall
# - Fokussiert auf Anwendungsupdates
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

### Admin-Benutzer erstellen
```bash
# Erstellt einen neuen Admin-Benutzer
./scripts/create-admin-user.sh

# Das Skript ermöglicht:
# - Interaktive Erstellung von Admin-Benutzern
# - Sichere Passwort-Eingabe
# - Automatische Datenbank-Integration
```

### Build-Probleme debuggen
```bash
# Debuggt Build-Probleme und Container-Issues
./scripts/debug-build.sh

# Das Skript überprüft:
# - Docker-Container-Status
# - Build-Logs und Fehler
# - Abhängigkeiten und Konfiguration
# - Netzwerk-Verbindungen
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
- **🔐 JWT-basierte Authentifizierung** mit sicheren Tokens
- **🔒 bcrypt-Passwort-Hashing** mit Salt-Rounds (12)
- **👥 Rollenbasierte Zugriffskontrolle** (Admin, User, Viewer)
- **🛡️ Geschützte API-Endpunkte** mit Token-Validierung
- **⏰ Token-Ablaufzeit** (24 Stunden) für erhöhte Sicherheit

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

### CSS-Variablen und Design-System
Das Frontend verwendet ein zentrales Design-System mit CSS-Variablen in `frontend/src/index.css`:

```css
:root {
  /* Light Mode Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #0f172a;
  --accent-primary: #3b82f6;
  /* ... weitere Variablen */
}

[data-theme="dark"] {
  /* Dark Mode Colors */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f8fafc;
  /* ... weitere Variablen */
}
```

**Verfügbare Design-Tokens:**
- **Farben**: Primary, Secondary, Tertiary für Background und Text
- **Accent-Farben**: Primary und Secondary für Buttons und Links
- **Border-Farben**: Primary und Secondary für Rahmen
- **Schatten**: Primary und Secondary für verschiedene Tiefen
- **Glass-Effekte**: Für moderne UI-Elemente

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

## 👥 Benutzerverwaltung

### Verfügbare Rollen
- **👑 Administrator (admin)**: Vollzugriff auf alle Funktionen
  - Benutzerverwaltung (erstellen, bearbeiten, löschen)
  - System-Einstellungen
  - Alle Projekt- und Modulfunktionen
- **👤 Benutzer (user)**: Standard-Zugriff
  - Projektverwaltung
  - Modulverwaltung
  - Design-Einstellungen
- **👁️ Betrachter (viewer)**: Nur Lesezugriff
  - Projekte anzeigen
  - Module anzeigen
  - Keine Bearbeitungsrechte

### Benutzerverwaltung
- **Erstellen**: Neue Benutzer mit Rollen und Berechtigungen
- **Bearbeiten**: Benutzername, E-Mail, Rolle und Status ändern
- **Löschen**: Benutzer entfernen (außer eigenem Account)
- **Passwort zurücksetzen**: Neue Passwörter für Benutzer setzen
- **Status verwalten**: Benutzer aktivieren/deaktivieren

### API-Endpunkte

#### Authentifizierung (`/api/auth`)
- `POST /api/auth/login` - Benutzer anmelden
- `POST /api/auth/register` - Neuen Benutzer registrieren
- `GET /api/auth/profile` - Benutzerprofil abrufen
- `PUT /api/auth/change-password` - Passwort ändern
- `GET /api/auth/validate` - Token validieren
- `POST /api/auth/logout` - Benutzer abmelden

#### Admin-Funktionen (`/api/admin`)
- `GET /api/admin/users` - Alle Benutzer abrufen (mit Paginierung und Filter)
- `GET /api/admin/users/:id` - Einzelnen Benutzer abrufen
- `POST /api/admin/users` - Benutzer erstellen
- `PUT /api/admin/users/:id` - Benutzer bearbeiten
- `PUT /api/admin/users/:id/reset-password` - Benutzer-Passwort zurücksetzen
- `DELETE /api/admin/users/:id` - Benutzer löschen
- `GET /api/admin/stats` - System-Statistiken abrufen

#### Projektverwaltung (`/api/projects`)
- `GET /api/projects` - Alle Projekte abrufen (mit Filterung)
- `GET /api/projects/:id` - Einzelnes Projekt abrufen
- `POST /api/projects` - Neues Projekt erstellen
- `PUT /api/projects/:id` - Projekt aktualisieren
- `DELETE /api/projects/:id` - Projekt löschen
- `POST /api/projects/:id/permissions` - Projekt-Berechtigung vergeben
- `DELETE /api/projects/:id/permissions/:userId` - Projekt-Berechtigung entfernen

#### Modulverwaltung (`/api/modules`)
- `GET /api/modules` - Alle Module abrufen (mit Filterung)
- `GET /api/modules/:id` - Einzelnes Modul abrufen
- `POST /api/modules/project` - Neues Projekt-Modul erstellen
- `POST /api/modules/standalone` - Neues eigenständiges Modul erstellen
- `PUT /api/modules/:id` - Modul aktualisieren
- `DELETE /api/modules/:id` - Modul löschen
- `POST /api/modules/:id/permissions` - Modul-Berechtigung vergeben
- `DELETE /api/modules/:id/permissions/:userId` - Modul-Berechtigung entfernen
- `POST /api/modules/:id/dependencies` - Modul-Abhängigkeit erstellen
- `DELETE /api/modules/:id/dependencies/:connectionId` - Modul-Abhängigkeit entfernen

#### Team-Management (`/api/teams`)
- `GET /api/teams` - Alle Teams abrufen
- `GET /api/teams/:id` - Einzelnes Team abrufen
- `POST /api/teams` - Neues Team erstellen
- `PUT /api/teams/:id` - Team aktualisieren
- `DELETE /api/teams/:id` - Team löschen
- `POST /api/teams/:id/members` - Team-Mitglied hinzufügen
- `DELETE /api/teams/:id/members/:userId` - Team-Mitglied entfernen
- `DELETE /api/teams/:id/leave` - Team verlassen

#### Benachrichtigungen (`/api/notifications`)
- `GET /api/notifications` - Benachrichtigungen abrufen
- `PUT /api/notifications/:id/read` - Benachrichtigung als gelesen markieren
- `DELETE /api/notifications/:id` - Benachrichtigung löschen
- `PUT /api/notifications/mark-all-read` - Alle Benachrichtigungen als gelesen markieren

#### Begrüßungen (`/api/greetings`)
- `GET /api/greetings` - Alle Begrüßungen abrufen
- `GET /api/greetings/random` - Zufällige Begrüßung abrufen
- `POST /api/greetings` - Neue Begrüßung erstellen (Admin)
- `PUT /api/greetings/:id` - Begrüßung aktualisieren (Admin)
- `DELETE /api/greetings/:id` - Begrüßung löschen (Admin)

## 🗄️ Datenbank-Schema

### Haupttabellen

#### Benutzer (`users`)
- `id` - Primärschlüssel
- `username` - Eindeutiger Benutzername
- `email` - E-Mail-Adresse
- `password_hash` - Gehashtes Passwort
- `role` - Rolle (admin, user, viewer)
- `is_active` - Aktiv-Status
- `created_at`, `updated_at` - Zeitstempel

#### Teams (`teams`)
- `id` - Primärschlüssel
- `name` - Team-Name
- `description` - Team-Beschreibung
- `team_leader_id` - Team-Leader (Referenz auf users)
- `is_active` - Aktiv-Status
- `created_at`, `updated_at` - Zeitstempel

#### Team-Mitgliedschaften (`team_memberships`)
- `id` - Primärschlüssel
- `team_id` - Team-Referenz
- `user_id` - Benutzer-Referenz
- `role` - Rolle im Team (leader, member, viewer)
- `joined_at` - Beitrittsdatum

#### Projekte (`projects`)
- `id` - Primärschlüssel
- `name` - Projekt-Name
- `description` - Projekt-Beschreibung
- `status` - Status (planning, active, on_hold, completed, cancelled)
- `priority` - Priorität (low, medium, high, critical)
- `owner_id` - Eigentümer (Referenz auf users)
- `team_id` - Team-Referenz (optional)
- `visibility` - Sichtbarkeit (private, team, public)
- `completion_percentage` - Fortschritt in Prozent
- `start_date`, `target_date` - Zeiträume
- `created_at`, `updated_at` - Zeitstempel

#### Projekt-Module (`project_modules`)
- `id` - Primärschlüssel
- `project_id` - Projekt-Referenz
- `name` - Modul-Name
- `description` - Modul-Beschreibung
- `status` - Status (not_started, in_progress, testing, completed)
- `priority` - Priorität (low, medium, high, critical)
- `assigned_to` - Zugewiesener Benutzer
- `estimated_hours`, `actual_hours` - Zeitaufwand
- `due_date` - Fälligkeitsdatum
- `completion_percentage` - Fortschritt in Prozent
- `visibility` - Sichtbarkeit (private, team, public)
- `team_id` - Team-Referenz (optional)
- `tags` - Tags als Array
- `dependencies` - Abhängigkeiten als Array
- `created_at`, `updated_at` - Zeitstempel

#### Eigenständige Module (`standalone_modules`)
- `id` - Primärschlüssel
- `name` - Modul-Name
- `description` - Modul-Beschreibung
- `status` - Status (planning, active, on_hold, completed, cancelled)
- `priority` - Priorität (low, medium, high, critical)
- `owner_id` - Eigentümer (Referenz auf users)
- `team_id` - Team-Referenz (optional)
- `assigned_to` - Zugewiesener Benutzer
- `start_date`, `target_date` - Zeiträume
- `estimated_hours`, `actual_hours` - Zeitaufwand
- `completion_percentage` - Fortschritt in Prozent
- `visibility` - Sichtbarkeit (private, team, public)
- `tags` - Tags als Array
- `dependencies` - Abhängigkeiten als Array
- `created_at`, `updated_at` - Zeitstempel

#### Benachrichtigungen (`notifications`)
- `id` - Primärschlüssel
- `user_id` - Empfänger (Referenz auf users)
- `type` - Benachrichtigungstyp
- `title` - Titel
- `message` - Nachricht
- `is_read` - Gelesen-Status
- `from_user_id` - Absender (optional)
- `project_id` - Projekt-Referenz (optional)
- `team_id` - Team-Referenz (optional)
- `action_url` - Aktions-URL (optional)
- `created_at` - Erstellungsdatum

#### Begrüßungen (`greetings`)
- `id` - Primärschlüssel
- `text` - Begrüßungstext
- `category` - Kategorie (morning, afternoon, evening, general)
- `is_active` - Aktiv-Status
- `created_at`, `updated_at` - Zeitstempel

### Berechtigungstabellen

#### Projekt-Berechtigungen (`project_permissions`)
- `id` - Primärschlüssel
- `project_id` - Projekt-Referenz
- `user_id` - Benutzer-Referenz
- `permission_type` - Berechtigungstyp (view, edit, admin)
- `granted_by` - Gewährt von (Referenz auf users)
- `granted_at` - Gewährungsdatum

#### Modul-Berechtigungen (`module_permissions`)
- `id` - Primärschlüssel
- `module_id` - Modul-Referenz
- `module_type` - Modul-Typ (project, standalone)
- `user_id` - Benutzer-Referenz
- `permission_type` - Berechtigungstyp (view, edit, admin)
- `granted_by` - Gewährt von (Referenz auf users)
- `granted_at` - Gewährungsdatum

### Log-Tabellen

#### Projekt-Logs (`project_logs`)
- `id` - Primärschlüssel
- `project_id` - Projekt-Referenz
- `user_id` - Benutzer-Referenz
- `action` - Aktion
- `details` - Details
- `timestamp` - Zeitstempel

#### Modul-Logs (`module_logs`)
- `id` - Primärschlüssel
- `module_id` - Modul-Referenz
- `module_type` - Modul-Typ (project, standalone)
- `user_id` - Benutzer-Referenz
- `action` - Aktion
- `details` - Details
- `timestamp` - Zeitstempel

## 📚 Nächste Schritte

1. **Live-Edit-Funktionalität entwickeln** für Design-Einstellungen
2. **Erweiterte Dashboard-Widgets** implementieren
3. **Kalender-Integration** für Deadlines
4. **Datei-Upload** für Projekte und Module
5. **Erweiterte Reporting-Funktionen** entwickeln
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

