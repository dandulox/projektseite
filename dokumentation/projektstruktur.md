# Projektstruktur - Projektseite

## 📁 Verzeichnisstruktur

```
projektseite/
├── 📖 README.md                           # Projektbeschreibung und Setup
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
    ├── launcher.sh                        # 🚀 Hauptlauncher (Empfohlen)
    ├── main-control.sh                    # Erweiterte System-Verwaltung
    ├── batch-runner.sh                    # Batch-Ausführung von Scripts
    ├── create-batch.sh                    # Batch-Dateien erstellen
    ├── functions/                         # Hilfsfunktionen
    │   └── set-permissions.sh             # Berechtigungs-Management
    ├── patches/                           # Patch-Scripts für Systemupdates
    │   ├── patch-manager.sh               # Patch-Management-Tool
    │   ├── install-activity-log.sh        # Aktivitätslog-System Installation
    │   └── README.md                      # Patch-Dokumentation
    ├── batches/                           # Batch-Dateien für automatisierte Tasks
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

## Script-System

### 🚀 Launcher (Empfohlen)
- **Benutzerfreundliche Oberfläche** für alle Scripts
- **Schnellstart-Optionen** mit vordefinierten Operationssequenzen
- **FastPatch**: Direkter Zugriff auf Patch-Manager
- **FastUpdate**: Schnelles App-Update mit Git-Pull
- **Integrierte Hilfe** und Dokumentation

### 🔧 Main Control System
- **Interaktive Steuerung** aller Scripts
- **Warteschlangen-Management** für Script-Ausführung
- **Batch-Operationen** für automatisierte Tasks
- **System-Status-Überwachung** und Logging

### 📦 Patch-System
- **Zentralisierte Patch-Verwaltung** im `patches/` Verzeichnis
- **Patch-Manager** für einfache Installation und Verwaltung
- **Automatische Berechtigungssetzung** nach Git-Updates
- **Aktivitätslog-System** für erweiterte Protokollierung

### 🛠️ Hilfsfunktionen
- **Berechtigungs-Management** für alle Scripts
- **Automatische Wartung** nach Git-Updates
- **Fehlerbehandlung** mit Fallback-Mechanismen

## Backend-Struktur
- **Modulare Architektur** mit separaten Route-Dateien
- **Middleware** für Authentifizierung und Validierung
- **Datenbank-Integration** mit PostgreSQL
- **Error-Handling** mit zentraler Fehlerbehandlung
- **Logging** für Debugging und Monitoring

## Frontend-Struktur
- **React-Komponenten** mit modernen Hooks
- **Context-API** für State-Management
- **Responsive Design** mit Tailwind CSS
- **CSS-Variablen** für Theme-Management
- **Modulare Komponenten** für Wiederverwendbarkeit

## Datenbank-Struktur
- **PostgreSQL** als Hauptdatenbank
- **Patch-System** für Schema-Updates
- **Backup-Strategie** mit automatischen Backups
- **Migrations-System** für Datenbankänderungen

## Script-System
- **Wartungsskripte** für Updates und Backups
- **Setup-Skripte** für Server-Installation
- **Debug-Skripte** für Fehlerbehebung
- **Batch-System** für automatisierte Operationen
