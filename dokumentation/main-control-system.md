# Main Control System - Projektseite

Das Main Control System bietet eine zentrale Steuerung für alle Projektseite-Scripts mit Unterstützung für Einzelausführung, Warteschlangen und Batch-Operationen.

## 🎮 Hauptscript: `main-control.sh`

### Verwendung
```bash
sudo ./scripts/main-control.sh
```

### Funktionen
- **Interaktives Menü**: Benutzerfreundliche Oberfläche
- **Script-Ausführung**: Einzelne Scripts gezielt ausführen
- **Warteschlangen**: Scripts in Reihenfolge abarbeiten
- **Schnellstart**: Vordefinierte Operationssequenzen
- **System-Status**: Überblick über Systemzustand
- **Logging**: Vollständige Protokollierung aller Aktionen

### Menü-Optionen
1. **Script einzeln ausführen** - Direkte Ausführung eines Scripts
2. **Script zur Warteschlange hinzufügen** - Scripts sammeln
3. **Warteschlange anzeigen** - Aktuelle Warteschlange anzeigen
4. **Warteschlange abarbeiten** - Alle Scripts nacheinander ausführen
5. **Warteschlange leeren** - Warteschlange zurücksetzen
6. **Verfügbare Scripts anzeigen** - Liste aller Scripts
7. **System-Status anzeigen** - Docker, Services, Verzeichnisse
8. **Log-Datei anzeigen** - Protokoll anzeigen
9. **Schnellstart-Optionen** - Vordefinierte Sequenzen

## 🚀 Launcher: `launcher.sh`

### Verwendung
```bash
sudo ./scripts/launcher.sh
```

### Funktionen
- **Einfacher Zugang**: Benutzerfreundliche Oberfläche für alle Scripts
- **Schnellstart-Optionen**: Vordefinierte Operationssequenzen
- **FastPatch**: Direkter Zugriff auf Patch-Manager
- **FastUpdate**: Schnelles App-Update
- **System-Status**: Überblick über Systemzustand
- **Hilfe-System**: Integrierte Dokumentation

### Menü-Optionen
1. **Main Control** - Interaktive Steuerung aller Scripts
2. **Batch Runner** - Batch-Ausführung von Scripts
3. **Batch Creator** - Batch-Dateien erstellen und verwalten
4. **Schnellstart-Optionen** - Vordefinierte Operationssequenzen
   - Komplette Installation
   - System-Update
   - System-Backup
   - System-Wartung
   - **FastPatch (Patch-Manager)** - Patch-Management für Systemupdates
   - **FastUpdate (App-Update)** - Schnelles App-Update mit Git-Pull
   - System-Wipe
5. **System-Status** - Aktueller Systemzustand
6. **Hilfe** - Integrierte Dokumentation

### FastPatch-Funktionalität
```bash
# Automatischer Start des Patch-Managers
./scripts/patches/patch-manager.sh

# Verfügbare Patches anzeigen
./scripts/patches/patch-manager.sh list

# Patch installieren
./scripts/patches/patch-manager.sh install activity-log
```

### FastUpdate-Funktionalität
```bash
# Automatischer Start des App-Updates
./scripts/update-app.sh

# Führt automatisch aus:
# - Git-Pull (git reset --hard origin/main)
# - Dependencies-Update (npm install)
# - Docker-Build (docker-compose build)
# - Container-Restart (docker-compose up -d)
# - Service-Verfügbarkeit prüfen
```

## 📦 Batch Runner: `batch-runner.sh`

### Verwendung
```bash
# Batch aus Datei
sudo ./scripts/batch-runner.sh -f batches/install.txt

# Batch aus Kommandozeile
sudo ./scripts/batch-runner.sh start backup test

# Vordefinierte Presets
sudo ./scripts/batch-runner.sh -p install

# Bei Fehler fortfahren
sudo ./scripts/batch-runner.sh -c start backup test
```

### Optionen
- `-f, --file FILE` - Batch aus Datei ausführen
- `-p, --preset PRESET` - Vordefiniertes Batch ausführen
- `-c, --continue` - Bei Fehler fortfahren (Standard: stoppen)
- `-l, --list` - Verfügbare Scripts anzeigen
- `-h, --help` - Hilfe anzeigen

### Vordefinierte Presets
- **install** - Komplette Installation (setup + start + test)
- **update** - System-Update (stop + update + patch + start + test)
- **backup** - Backup erstellen (backup + logs)
- **maintenance** - Wartung (stop + clean + patch + start + test)
- **wipe** - System-Wipe (stop + wipe)
- **restore** - Restore (stop + restore + start + test)

## 📝 Batch Creator: `create-batch.sh`

### Verwendung
```bash
sudo ./scripts/create-batch.sh
```

### Funktionen
- **Interaktive Erstellung** - Schritt-für-Schritt Batch-Erstellung
- **Preset-Batches** - Vordefinierte Batches erstellen
- **Batch-Verwaltung** - Anzeigen, Bearbeiten, Ausführen
- **Editor-Integration** - Direkte Bearbeitung von Batch-Dateien

### Menü-Optionen
1. **Interaktive Batch-Erstellung** - Schritt-für-Schritt
2. **Preset-Batch erstellen** - Vordefinierte Batches
3. **Alle Preset-Batches erstellen** - Alle auf einmal
4. **Batch-Dateien anzeigen** - Übersicht vorhandener Batches
5. **Batch-Datei bearbeiten** - Mit Editor öffnen
6. **Batch-Datei ausführen** - Direkt ausführen
7. **Verfügbare Scripts anzeigen** - Script-Liste
8. **Vordefinierte Batches anzeigen** - Preset-Liste

## 📁 Batch-Dateien

### Verzeichnis
```
scripts/batches/
├── install.txt          # Komplette Installation
├── update.txt           # System-Update
├── maintenance.txt      # Wartung
├── backup.txt           # Backup erstellen
└── (weitere...)
```

### Format
```bash
# Projektseite Batch: batch-name
# Erstellt: $(date)
# Beschreibung: Beschreibung des Batches

script1
script2
script3
# System-Kommentar
```

### Beispiel-Batch
```bash
# Projektseite Batch: production-update
# Erstellt: 2024-01-15
# Beschreibung: Production-System-Update

stop
backup
update
patch
start
test
logs
```

## 🔧 Verfügbare Scripts

| Script | Beschreibung |
|--------|-------------|
| setup | Server-Setup (komplette Installation) |
| start | Docker-Container starten |
| stop | Docker-Container stoppen |
| restart | Docker-Container neu starten |
| update | System-Updates anwenden |
| backup | System-Backup erstellen |
| restore | System-Backup wiederherstellen |
| patch | Datenbank-Patches anwenden |
| clean | Sanfte Systembereinigung |
| wipe | Kompletter System-Wipe |
| selective | Selektive Bereinigung |
| logs | Log-Dateien überprüfen |
| test | Verbindungen testen |
| debug | Debug-Build durchführen |
| fix | Systemd-Probleme beheben |
| admin | Admin-Benutzer erstellen |

## 🚀 Verwendungsszenarien

### 1. Komplette Installation
```bash
# Option A: Main Control
sudo ./scripts/main-control.sh
# Menü: 9 → 1 (Schnellstart: Komplette Installation)

# Option B: Batch Runner
sudo ./scripts/batch-runner.sh -p install

# Option C: Batch-Datei
sudo ./scripts/batch-runner.sh -f batches/install.txt
```

### 2. System-Update
```bash
# Option A: Main Control
sudo ./scripts/main-control.sh
# Menü: 9 → 2 (Schnellstart: System-Update)

# Option B: Batch Runner
sudo ./scripts/batch-runner.sh -p update

# Option C: Manuell
sudo ./scripts/batch-runner.sh stop update patch start test
```

### 3. Wartung
```bash
# Option A: Main Control
sudo ./scripts/main-control.sh
# Menü: 9 → 5 (Schnellstart: Sanfte Bereinigung + Neustart)

# Option B: Batch Runner
sudo ./scripts/batch-runner.sh -p maintenance

# Option C: Batch-Datei
sudo ./scripts/batch-runner.sh -f batches/maintenance.txt
```

### 4. Backup
```bash
# Option A: Main Control
sudo ./scripts/main-control.sh
# Menü: 9 → 3 (Schnellstart: System-Backup)

# Option B: Batch Runner
sudo ./scripts/batch-runner.sh -p backup

# Option C: Batch-Datei
sudo ./scripts/batch-runner.sh -f batches/backup.txt
```

### 5. System-Wipe
```bash
# Option A: Main Control
sudo ./scripts/main-control.sh
# Menü: 9 → 4 (Schnellstart: System-Wipe)

# Option B: Batch Runner
sudo ./scripts/batch-runner.sh -p wipe

# Option C: Manuell
sudo ./scripts/batch-runner.sh stop wipe
```

## 📊 Logging und Monitoring

### Log-Dateien
- **Main Control**: `/var/log/projektseite/main-control.log`
- **Batch Runner**: `/var/log/projektseite/batch-runner.log`

### Log-Format
```
[2024-01-15 10:30:45] Starting: setup (setup-server.sh)
[2024-01-15 10:35:20] Completed: setup - SUCCESS
[2024-01-15 10:35:21] Starting: start (start-docker.sh)
[2024-01-15 10:35:45] Completed: start - SUCCESS
```

### System-Status
```bash
# Docker-Container
docker ps -a --filter "name=projektseite"

# Systemd-Service
systemctl status projektseite.service

# Verzeichnisse
ls -la /opt/projektseite/
ls -la /opt/backups/projektseite/
ls -la /var/log/projektseite/
```

## ⚠️ Wichtige Hinweise

### Sicherheit
- **Root-Rechte**: Scripts benötigen Root-Rechte für Systemoperationen
- **Bestätigungen**: Kritische Operationen (wie Wipe) fragen nach Bestätigung
- **Logging**: Alle Aktionen werden protokolliert

### Fehlerbehandlung
- **Stop on Error**: Standardmäßig stoppen Batches bei Fehlern
- **Continue on Error**: Mit `-c` Flag bei Fehlern fortfahren
- **Interaktive Bestätigung**: Bei Fehlern kann Benutzer entscheiden

### Performance
- **Parallelisierung**: Scripts werden sequenziell ausgeführt
- **Timeout**: Keine expliziten Timeouts (Scripts bestimmen selbst)
- **Ressourcen**: Docker-Container werden vor neuen Operationen gestoppt

## 🔧 Troubleshooting

### Script läuft nicht
```bash
# Berechtigungen setzen
chmod +x scripts/*.sh

# Als Root ausführen
sudo ./scripts/main-control.sh
```

### Batch-Fehler
```bash
# Batch-Datei prüfen
cat scripts/batches/install.txt

# Scripts einzeln testen
sudo ./scripts/setup-server.sh
sudo ./scripts/start-docker.sh
```

### Log-Probleme
```bash
# Log-Verzeichnis erstellen
sudo mkdir -p /var/log/projektseite

# Berechtigungen setzen
sudo chown $USER:$USER /var/log/projektseite
```

## 📞 Support

Bei Problemen mit dem Main Control System:

1. **Logs prüfen**: `/var/log/projektseite/`
2. **Scripts einzeln testen**: Direkte Ausführung
3. **System-Status**: `main-control.sh` → Option 7
4. **Batch-Dateien prüfen**: `create-batch.sh` → Option 4
