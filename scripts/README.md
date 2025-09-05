# Scripts Verzeichnis

Dieses Verzeichnis enthält alle Verwaltungsscripts für die Projektseite.

## Struktur

```
scripts/
├── README.md                    # Diese Datei
├── functions/                   # Hilfsfunktionen für Scripts
│   └── set-permissions.sh      # Berechtigungs-Management
├── patches/                     # Patch-Scripts für Systemupdates
│   ├── README.md               # Patch-Scripts Dokumentation
│   ├── patch-manager.sh        # Patch-Management-Tool
│   └── install-activity-log.sh # Aktivitätslog-System Installation
├── batches/                     # Batch-Dateien für automatisierte Tasks
├── [Hauptscripts...]           # Systemverwaltungsscripts
└── README-WIPE.md              # Wichtige Warnung vor Löschvorgängen
```

## Hauptscripts

### Systemverwaltung
- `main-control.sh` - Hauptsteuerungsscript
- `launcher.sh` - Systemstarter
- `setup-server.sh` - Server-Initialisierung
- `update-system.sh` - Systemupdates

### Datenbank
- `db-patch.sh` - Datenbank-Patches
- `update-versions-schema.sh` - Versionsschema-Updates
- `fix-versions-table.sh` - Versions-Tabellen-Reparatur

### Wartung
- `backup-system.sh` - System-Backup
- `restore-system.sh` - System-Wiederherstellung
- `clean-system.sh` - System-Bereinigung
- `selective-clean.sh` - Selektive Bereinigung

### Docker
- `start-docker.sh` - Docker-Container starten
- `debug-build.sh` - Debug-Build

### Benutzerverwaltung
- `create-admin-user.sh` - Admin-Benutzer erstellen

### Monitoring
- `check-logs.sh` - Log-Überprüfung
- `test-connection.sh` - Verbindungstest

## Hilfsfunktionen

### Berechtigungs-Management
```bash
# Setze Berechtigungen für alle Scripts
./scripts/functions/set-permissions.sh set

# Prüfe und repariere Berechtigungen
./scripts/functions/set-permissions.sh check

# Zeige Status aller Scripts
./scripts/functions/set-permissions.sh status
```

## Patch-Scripts

**Wichtiger Hinweis**: Patch-Scripts befinden sich im `patches/` Unterverzeichnis.

### Patch-Manager verwenden (Empfohlen)
```bash
# Alle verfügbaren Patches anzeigen
./scripts/patches/patch-manager.sh list

# Patch installieren
./scripts/patches/patch-manager.sh install activity-log
```

### Direkte Installation
```bash
# Aktivitätslog-System direkt installieren
./scripts/patches/install-activity-log.sh
```

Weitere Informationen zu Patch-Scripts finden Sie in `patches/README.md`.

## Batch-System

Das Batch-System ermöglicht die Ausführung mehrerer Scripts in Folge:

```bash
./scripts/batch-runner.sh [batch-name]
```

Verfügbare Batches:
- `backup` - Backup-Prozess
- `install` - Installationsprozess
- `maintenance` - Wartungsprozess
- `update` - Update-Prozess

## Sicherheitshinweise

⚠️ **WICHTIG**: Lesen Sie `README-WIPE.md` bevor Sie Löschvorgänge durchführen!

- Alle Scripts erstellen automatisch Backups
- Prüfen Sie die Auswirkungen vor der Ausführung
- Testen Sie in einer Entwicklungsumgebung
- Dokumentieren Sie alle Änderungen

## Verwendung

### Script ausführbar machen
```bash
chmod +x scripts/[script-name].sh
```

### Script ausführen
```bash
./scripts/[script-name].sh
```

### Mit Logging
```bash
./scripts/[script-name].sh 2>&1 | tee logs/[script-name].log
```

## Fehlerbehebung

1. Prüfen Sie die Logs in `logs/`
2. Überprüfen Sie die Berechtigungen
3. Stellen Sie sicher, dass alle Abhängigkeiten installiert sind
4. Konsultieren Sie die spezifische Dokumentation für das Script

## Entwicklung

Bei der Entwicklung neuer Scripts:

1. Folgen Sie den bestehenden Konventionen
2. Fügen Sie ausführliche Kommentare hinzu
3. Implementieren Sie Fehlerbehandlung
4. Erstellen Sie entsprechende Tests
5. Aktualisieren Sie diese Dokumentation
