# Patch Scripts

Dieser Ordner enthält alle Patch-Scripts für die Installation und Aktualisierung von Systemkomponenten.

## Struktur

```
scripts/patches/
├── README.md                           # Diese Datei
├── patch-manager.sh                   # Patch-Management-Tool
├── install-activity-log.sh            # Aktivitätslog-System Installation
├── fix-database-connection.sh         # Datenbankverbindung reparieren
└── [weitere Patch-Scripts...]         # Zukünftige Patches
```

## Verwendung

### Patch-Manager verwenden (Empfohlen)

```bash
# Alle verfügbaren Patches anzeigen
./scripts/patches/patch-manager.sh list

# Status eines Patches prüfen
./scripts/patches/patch-manager.sh status activity-log

# Patch installieren
./scripts/patches/patch-manager.sh install activity-log

# Datenbankverbindung reparieren
./scripts/patches/patch-manager.sh install fix-db

# Hilfe anzeigen
./scripts/patches/patch-manager.sh help
```

### Direkte Installation

```bash
# Aktivitätslog-System direkt installieren
./scripts/patches/install-activity-log.sh

# Datenbankverbindung reparieren
./scripts/patches/fix-database-connection.sh
```

## Verfügbare Patches

### 1. Aktivitätslog-System (activity-log)
- **Beschreibung**: Erweiterte Aktivitätslog-Tabellen mit automatischen Benachrichtigungen
- **Features**:
  - Projekt- und Modul-Aktivitätslogs
  - Automatische Benachrichtigungen
  - Team- und Private-Tab-Integration
  - Erweiterte Protokollierung mit old_data/new_data

### 2. Datenbankverbindung reparieren (fix-db)
- **Beschreibung**: Repariert Datenbankverbindungsprobleme
- **Features**:
  - Docker-Container-Status prüfen
  - PostgreSQL-Container starten
  - Datenbankverbindung testen
  - Diagnose-Informationen anzeigen

## Fehlerbehebung

### Datenbankverbindungsfehler

Wenn Sie einen Fehler wie "Datenbankverbindung fehlgeschlagen!" erhalten:

1. **Verwenden Sie das Reparatur-Script**:
   ```bash
   ./scripts/patches/patch-manager.sh install fix-db
   ```

2. **Oder manuell reparieren**:
   ```bash
   # Container starten
   docker-compose -f docker/docker-compose.yml up -d postgres
   
   # Warten und testen
   sleep 15
   ./scripts/patches/install-activity-log.sh
   ```

3. **Prüfen Sie die Container**:
   ```bash
   docker ps | grep postgres
   docker-compose -f docker/docker-compose.yml logs postgres
   ```

### Umgebungsvariablen

Falls keine `.env`-Datei vorhanden ist, wird `env.example` als Vorlage bereitgestellt:

```bash
# Kopieren Sie die Vorlage
cp env.example .env

# Passen Sie die Werte an Ihre Konfiguration an
nano .env
```

## Installation

Dieses Script installiert:
- Erweiterte Aktivitätslog-Tabellen
- Automatische Trigger für Projekt- und Modul-Änderungen
- Benachrichtigungsfunktionen
- Patch-Management-System