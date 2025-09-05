# Wartung & Verwaltung - Projektseite

## Automatische Wartung
- **Backups**: Täglich um 2:00 Uhr
- **Updates**: Sonntags um 3:00 Uhr (überschreibt lokale Änderungen)
- **Log-Rotation**: Automatisch

## Manuelle Wartung
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

## Container-Verwaltung
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

## Diagnose & Fehlerbehebung
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

## System-Patch (Git + Docker)
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

## Datenbank-Patch-System
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

## App-Update (Nur Container)
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

## Systemd Service reparieren
```bash
# Repariert den systemd Service mit korrektem Pfad
./scripts/fix-systemd.sh

# Das Skript behebt:
# - Falsche Pfade zur docker-compose.yml
# - Fehlgeschlagene systemd Services
# - Automatischen Start der Container
```

## Admin-Benutzer erstellen
```bash
# Erstellt einen neuen Admin-Benutzer
./scripts/create-admin-user.sh

# Das Skript ermöglicht:
# - Interaktive Erstellung von Admin-Benutzern
# - Sichere Passwort-Eingabe
# - Automatische Datenbank-Integration
```

## Build-Probleme debuggen
```bash
# Debuggt Build-Probleme und Container-Issues
./scripts/debug-build.sh

# Das Skript überprüft:
# - Docker-Container-Status
# - Build-Logs und Fehler
# - Abhängigkeiten und Konfiguration
# - Netzwerk-Verbindungen
```

## Regelmäßige Updates
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

## Backup-Strategie
- **Tägliche Backups** um 2:00 Uhr
- **30 Tage Aufbewahrung**
- **Automatische Rotation**
- **Integritätsprüfung**
- **Git-Historie** wird mit gesichert

## Wiederherstellung
```bash
# Backup auflisten
ls -lh /opt/backups/projektseite/

# Backup wiederherstellen
./scripts/restore-system.sh
```
