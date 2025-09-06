# Projektseite - Projektstatus-Tracker

Eine modulare Website zur Dokumentation und Verfolgung von Projektstatus mit Live-Edit-Funktionalität, Docker-Containerisierung und umfassendem Monitoring.

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