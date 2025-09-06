# Projektseite - Projektstatus-Tracker

Eine vollständige Projektmanagement-Anwendung mit Task-Management, Kanban-Boards, Deadlines und Team-Kollaboration. Entwickelt mit modernem Tech-Stack und funktioniert vollständig mit leerer Datenbank.

## ✨ Features

- ✅ **Projektverwaltung** mit Status-Tracking und Fortschrittsverfolgung
- ✅ **Task-Management** mit Prioritäten, Deadlines und Zuweisungen
- ✅ **Kanban-Boards** mit Drag & Drop-Funktionalität
- ✅ **Deadlines-Kalender** mit Erinnerungen und Statistiken
- ✅ **Team-Kollaboration** mit Rollen und Berechtigungen
- ✅ **Admin-Diagnose-Tools** für System-Monitoring
- ✅ **Responsive Design** mit Dark Mode
- ✅ **Einheitliche Error-Behandlung** und Validierung
- ✅ **Empty-States** - funktioniert ohne Demo-Daten

## 🚀 Quick Start

```bash
# 1. Repository klonen
git clone https://github.com/dandulox/projektseite.git
cd projektseite

# 2. Dependencies installieren
npm ci

# 3. Datenbank migrieren (nur Schema-Änderungen)
npm run migrate

# 4. Entwicklung starten
npm run dev

# 5. Anwendung öffnen
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# Grafana: http://localhost:3002 (admin/admin123)
```

## 📋 Standard-Zugangsdaten

- **Admin**: `admin` / `admin`
- **User**: `user` / `user123`

> **Hinweis**: Die App funktioniert vollständig mit einer leeren Datenbank. Alle Features zeigen freundliche Empty-States ohne Demo-Daten.

## 🛠️ Entwicklung

### Backend starten
```bash
cd backend
npm install
npm run dev
```

### Frontend starten
```bash
cd frontend
npm install
npm run dev
```

### Tests ausführen
```bash
# Backend Tests
cd backend
npm test

# Frontend Tests
cd frontend
npm test

# E2E Tests
npm run test:e2e
```

## 🔧 API-Endpoints

### Tasks
- `GET /api/tasks/my-tasks` - Meine Aufgaben abrufen
- `POST /api/tasks` - Task erstellen
- `PATCH /api/tasks/:id` - Task-Status aktualisieren
- `PUT /api/tasks/:id` - Task bearbeiten

### Deadlines
- `GET /api/deadlines` - Nächste Deadlines (7 Tage)
- `GET /api/deadlines/stats` - Deadline-Statistiken
- `GET /api/deadlines/calendar` - Kalender-Ansicht
- `GET /api/deadlines/reminders` - Erinnerungen

### Admin
- `GET /api/admin/health` - System-Health-Check
- `GET /api/admin/db/status` - Datenbank-Status
- `POST /api/admin/api-debug` - API-Debug-Tool

## 🏗️ Architektur

### Backend
- **Express.js** mit modularen Routen
- **PostgreSQL** mit umfassendem Schema
- **JWT-Authentifizierung** mit Rollen
- **Joi-Validierung** für alle Endpoints
- **Einheitlicher Error-Contract**
- **Rate-Limiting** und Security-Headers

### Frontend
- **React 18** mit Vite
- **TypeScript** für Type-Safety
- **Tailwind CSS** für Styling
- **React Query** für State-Management
- **React Router** für Navigation
- **Empty-State-Komponenten** für bessere UX

### Datenbank
- **PostgreSQL 15** mit umfassendem Schema
- **Automatische Triggers** für Fortschritts-Tracking
- **Activity-Logs** für Audit-Trail
- **Berechtigungs-System** mit Rollen
- **Non-Destructive Migrations**

## 🔒 Sicherheit

- **JWT-Token** mit Ablaufzeit
- **Rate-Limiting** (1000 req/15min)
- **CORS-Konfiguration**
- **Helmet** Security-Headers
- **Input-Validierung** mit Joi
- **SQL-Injection-Schutz** mit Parameterized Queries

## 📚 Dokumentation

Die vollständige Dokumentation ist in den folgenden Dateien aufgeteilt:

### 🚀 Grundlagen
- **[Features](dokumentation/features.md)** - Alle implementierten und geplanten Features
- **[Versionsverlauf](dokumentation/versionsverlauf.md)** - Changelog und Versionshistorie
- **[Technologie-Stack](dokumentation/technologie-stack.md)** - Verwendete Technologien und Frameworks
- **[Projektstruktur](dokumentation/projektstruktur.md)** - Detaillierte Verzeichnisstruktur

### 🛠️ Installation & Setup
- **[Setup-Anweisungen](dokumentation/setup-anweisungen.md)** - Komplette Installationsanleitung
- **[Feature Setup](FEATURE_SETUP.md)** - Task-Management Features einrichten
- **[Wartung & Verwaltung](dokumentation/wartung-verwaltung.md)** - Wartung, Updates und Backups
- **[Main Control System](dokumentation/main-control-system.md)** - Script-Verwaltung und Batch-Operationen

### 🔧 Technische Details
- **[API-Endpunkte](dokumentation/api-endpunkte.md)** - Vollständige API-Dokumentation
- **[API-Features](dokumentation/api-features.md)** - Task-Management API-Dokumentation
- **[Frontend-Komponenten](dokumentation/frontend-components.md)** - React-Komponenten-Dokumentation
- **[Datenbank-Schema](dokumentation/datenbank-schema.md)** - Datenbankstruktur und Tabellen
- **[Benutzerverwaltung](dokumentation/benutzerverwaltung.md)** - Rollen, Berechtigungen und Benutzer-API

### 🔒 Sicherheit & Monitoring
- **[Sicherheit](dokumentation/sicherheit.md)** - Sicherheitsmaßnahmen und Best Practices
- **[Monitoring & Überwachung](dokumentation/monitoring-ueberwachung.md)** - Grafana, Prometheus und Logs

### 🐛 Spezielle Systeme
- **[Kommentar-System](dokumentation/kommentar-system.md)** - Installation und Troubleshooting
- **[Entwicklung & Erweiterung](dokumentation/entwicklung-erweiterung.md)** - Entwicklungsumgebung und Erweiterungen
- **[Risiken & Follow-Ups](RISKS_AND_FOLLOWUP.md)** - Risikobewertung und zukünftige Verbesserungen

## 🚀 Schnellstart

### 1. Server-Setup
```bash
git clone https://github.com/dandulox/projektseite.git
cd projektseite
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh
sudo reboot
```

### 2. Container starten
```bash
cd /opt/projektseite
chmod +x scripts/*.sh
./scripts/start-docker.sh
```

### 3. Datenbank initialisieren
```bash
./scripts/init-database.sh
```

## 🌐 Verfügbare Services

| Service | URL | Port | Beschreibung |
|---------|-----|-------|--------------|
| **Frontend (Admin)** | http://localhost:3000 | 3000 | React Admin-Interface |
| **Backend API** | http://localhost:3001 | 3001 | Node.js/Express API |
| **Grafana** | http://localhost:3002 | 3002 | Monitoring Dashboard |
| **PostgreSQL** | localhost:5432 | 5432 | Datenbank |

## 🔐 Standard-Zugangsdaten

| Benutzername | Passwort | Rolle | Beschreibung |
|--------------|----------|-------|--------------|
| **admin** | **admin** | Administrator | Vollzugriff auf alle Funktionen |
| **user** | **user123** | Benutzer | Standard-Benutzerzugriff |

**Wichtiger Hinweis:** Ändern Sie diese Standard-Passwörter nach der ersten Anmeldung!

## 🎮 Main Control System

Für einfache Verwaltung verwenden Sie das Main Control System:

```bash
sudo ./scripts/main-control.sh
```

Dies bietet ein interaktives Menü für:
- Script-Ausführung
- Batch-Operationen
- System-Status
- Wartung und Updates

## 📊 Hauptfeatures

### 🔐 Authentifizierung & Benutzerverwaltung
- **Vollständiges Authentifizierungssystem** mit JWT und bcrypt
- **Benutzerverwaltung** mit Rollen (Admin, User, Viewer)
- **Team-Management** mit Rollen und Berechtigungen
- **Sichere API-Endpunkte** mit Rate-Limiting und Validierung

### 📁 Projekt- & Task-Management
- **Projektverwaltung** mit CRUD-Operationen und Filterung
- **Modulverwaltung** für Projekte mit eigenständigen Modulen
- **Task-Management** mit Status-Tracking und Deadlines
- **Kanban-Board** mit Drag & Drop-Funktionalität
- **Meine Aufgaben** - Personalisierte Task-Übersicht
- **Deadlines-Widget** - Übersicht kommender Fälligkeiten

### 🎨 Frontend & UX
- **Design-System** mit Theme-Management und konsistenten CSS-Klassen
- **Responsive Design** mit Mobile-First-Ansatz
- **Flexible API-Konfiguration** für verschiedene Deployment-Umgebungen
- **Datumsformatierung** - Automatische Konvertierung zwischen ISO und HTML-Formaten
- **Error-Handling** mit benutzerfreundlichen Fehlermeldungen

### 🔔 System-Features
- **Benachrichtigungssystem** mit Echtzeit-Updates
- **Fortschrittsverfolgung** mit visuellen Indikatoren
- **Live-Edit-Funktionalität** für Dokumentation
- **Monitoring & Logging** mit Grafana und Prometheus

## 📋 Aktuelle Version

**Version 2.1.0 "Stabilisator"** - Siehe [Versionsverlauf](dokumentation/versionsverlauf.md) für detaillierte Changelog-Informationen.

### 🆕 Neueste Updates (v2.1.0)
- **Task-Management-System** vollständig implementiert
- **Kanban-Board** mit Drag & Drop-Funktionalität
- **Meine Aufgaben** - Personalisierte Task-Übersicht
- **Deadlines-Widget** - Dashboard-Integration
- **API-Stabilität** - Rate-Limiting und Error-Handling verbessert
- **Datumsformatierung** - Automatische Konvertierung für Formulare
- **Enhanced Seed-Daten** - Realistische Test-Daten für alle Features

## 🛠️ Technologie-Stack

- **Backend**: Node.js 18.x, Express.js, PostgreSQL 15
- **Frontend**: React 18, Tailwind CSS, Vite
- **Infrastructure**: Docker, Ubuntu 24.04, Grafana, Prometheus
- **Sicherheit**: JWT, bcrypt, UFW Firewall, Fail2ban

## 📞 Support

Bei Problemen:
1. **Logs prüfen**: `/var/log/projektseite/`
2. **Container-Status**: `docker-compose ps`
3. **Main Control**: `./scripts/main-control.sh` → Option 7
4. **Dokumentation**: Siehe oben verlinkte Dokumentationsdateien

## 📄 Lizenz

MIT License - Siehe LICENSE-Datei für Details.

## 🤝 Beitragen

1. Fork das Repository: https://github.com/dandulox/projektseite
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

---

**Hinweis**: Diese README bietet einen Überblick. Für detaillierte Informationen siehe die verlinkten Dokumentationsdateien im `dokumentation/` Ordner.