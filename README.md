# Projektseite - Projektstatus-Tracker

Eine modulare Website zur Dokumentation und Verfolgung von Projektstatus mit Live-Edit-Funktionalität, Docker-Containerisierung und umfassendem Monitoring.

## 📚 Dokumentation

Die vollständige Dokumentation ist in den folgenden Dateien aufgeteilt:

### 🚀 Grundlagen
- **[Features](dokumentation/features.md)** - Alle implementierten und geplanten Features
- **[Technologie-Stack](dokumentation/technologie-stack.md)** - Verwendete Technologien und Frameworks
- **[Projektstruktur](dokumentation/projektstruktur.md)** - Detaillierte Verzeichnisstruktur

### 🛠️ Installation & Setup
- **[Setup-Anweisungen](dokumentation/setup-anweisungen.md)** - Komplette Installationsanleitung
- **[Wartung & Verwaltung](dokumentation/wartung-verwaltung.md)** - Wartung, Updates und Backups
- **[Main Control System](dokumentation/main-control-system.md)** - Script-Verwaltung und Batch-Operationen

### 🔧 Technische Details
- **[API-Endpunkte](dokumentation/api-endpunkte.md)** - Vollständige API-Dokumentation
- **[Datenbank-Schema](dokumentation/datenbank-schema.md)** - Datenbankstruktur und Tabellen
- **[Benutzerverwaltung](dokumentation/benutzerverwaltung.md)** - Rollen, Berechtigungen und Benutzer-API

### 🔒 Sicherheit & Monitoring
- **[Sicherheit](dokumentation/sicherheit.md)** - Sicherheitsmaßnahmen und Best Practices
- **[Monitoring & Überwachung](dokumentation/monitoring-ueberwachung.md)** - Grafana, Prometheus und Logs

### 🐛 Spezielle Systeme
- **[Kommentar-System](dokumentation/kommentar-system.md)** - Installation und Troubleshooting
- **[Entwicklung & Erweiterung](dokumentation/entwicklung-erweiterung.md)** - Entwicklungsumgebung und Erweiterungen

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

- **🔐 Vollständiges Authentifizierungssystem** mit JWT und bcrypt
- **👥 Benutzerverwaltung** mit Rollen (Admin, User, Viewer)
- **📁 Projektverwaltung** mit CRUD-Operationen und Filterung
- **🧩 Modulverwaltung** für Projekte mit eigenständigen Modulen
- **👥 Team-Management** mit Rollen und Berechtigungen
- **🔔 Benachrichtigungssystem** mit Echtzeit-Updates
- **📊 Fortschrittsverfolgung** mit visuellen Indikatoren
- **🎨 Design-System** mit Theme-Management und konsistenten CSS-Klassen
- **📱 Responsive Design** mit Mobile-First-Ansatz
- **🔧 Flexible API-Konfiguration** für verschiedene Deployment-Umgebungen

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