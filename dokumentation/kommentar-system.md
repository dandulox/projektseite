# Kommentar-System - Projektseite

## Installation

### Problem: 404 Fehler bei Kommentar-API

Wenn Sie 404-Fehler bei den Kommentar-API-Endpunkten erhalten, bedeutet das, dass das Kommentar-System noch nicht in der Datenbank installiert wurde.

### Lösung: Datenbank-Patch ausführen

#### Schritt 1: Patch-System ausführen
```bash
./scripts/db-patch.sh
```

#### Schritt 2: Backend neu starten
```bash
# Falls Docker verwendet wird
docker-compose -f docker/docker-compose.yml restart backend

# Oder falls direkt ausgeführt wird
# Backend-Server stoppen und neu starten
```

#### Schritt 3: Installation prüfen
Besuchen Sie diese URL um zu prüfen, ob die Kommentar-Tabellen erstellt wurden:
```
http://localhost:3001/debug/comments-tables
```

Sie sollten eine Antwort wie diese erhalten:
```json
{
  "comment_tables": ["comment_attachments", "comment_mentions", "comment_reactions", "comments"],
  "count": 4,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Final Fix

### Probleme identifiziert:

1. **Volume-Mount funktioniert nicht**: Das Backend findet das Patches-Verzeichnis nicht
2. **PostgreSQL-Syntax-Fehler**: `CREATE TRIGGER IF NOT EXISTS` wird nicht unterstützt

### Lösung:

#### Schritt 1: Container komplett neu starten
```bash
# Alle Container stoppen und entfernen
docker-compose -f docker/docker-compose.yml down

# Alle Container neu erstellen (mit den korrigierten Patches)
docker-compose -f docker/docker-compose.yml up -d --build
```

#### Schritt 2: Prüfe ob das Volume-Mount funktioniert
```bash
# Prüfe ob das database-Verzeichnis im Backend-Container verfügbar ist
docker exec projektseite-backend ls -la /app/database/patches/

# Sollte die Patch-Dateien anzeigen:
# 001_ensure_greetings_table.sql
# 002_example_patch_template.sql
# 003_new_humor_greetings.sql
# 004_team_functionality.sql
# 005_notifications_system.sql
# 008_module_management_system.sql
# 009_progress_tracking_system.sql
# 010_notes_comments_system.sql
```

#### Schritt 3: Backend-Logs prüfen
```bash
# Prüfe die Backend-Logs
docker logs projektseite-backend

# Sollte jetzt zeigen:
# 🔧 Wende Datenbank-Patches an...
# 📋 Gefundene Patches: 8
# 🔧 Wende Patch an: 001_ensure_greetings_table.sql
# ✅ Patch 001_ensure_greetings_table.sql erfolgreich angewendet
# ...
# 🔧 Wende Patch an: 010_notes_comments_system.sql
# ✅ Patch 010_notes_comments_system.sql erfolgreich angewendet
```

#### Schritt 4: Installation verifizieren
```bash
# Prüfe ob Kommentar-Tabellen erstellt wurden
curl http://localhost:3001/debug/comments-tables

# Sollte zurückgeben:
# {
#   "comment_tables": ["comment_attachments", "comment_mentions", "comment_reactions", "comments"],
#   "count": 4
# }
```

#### Schritt 5: Frontend testen
- Öffne die Anwendung im Browser
- Gehe zu einem Projekt
- Der Kommentarbereich sollte jetzt funktionieren
- Keine 404-Fehler mehr in der Browser-Konsole

## Was wurde korrigiert:

### 1. PostgreSQL-Syntax-Fehler behoben
**Vorher:**
```sql
CREATE TRIGGER IF NOT EXISTS update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Nachher:**
```sql
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Docker-Compose Volume-Mount
```yaml
volumes:
  - ../shared:/app/shared
  - ../database:/app/database  # ← Diese Zeile wurde hinzugefügt
```

## Alternative: Manuelle Installation

Falls das Patch-System nicht funktioniert, können Sie den Patch manuell ausführen:

```bash
# Mit Docker
docker exec -i projektseite-postgres psql -U admin -d projektseite < database/patches/010_notes_comments_system.sql

# Oder direkt mit psql
psql -h localhost -U admin -d projektseite -f database/patches/010_notes_comments_system.sql
```

## Verifikation

Nach der Installation sollten Sie:
1. Keine 404-Fehler mehr in der Browser-Konsole sehen
2. Den Kommentarbereich in Projekten und Modulen nutzen können
3. Kommentare erstellen, bearbeiten und löschen können

## Nach der Installation:

Das Kommentar-System sollte vollständig funktionieren:
- ✅ Kommentare zu Projekten hinzufügen
- ✅ Kommentare zu Modulen hinzufügen
- ✅ Antworten auf Kommentare
- ✅ Reaktionen (Like, Dislike, etc.)
- ✅ Kommentare anheften
- ✅ Private Kommentare
- ✅ Kommentare bearbeiten/löschen
- ✅ Chronologische Historie mit Zeitstempel

## Troubleshooting

### Problem: Container startet nicht
```bash
# Prüfe Docker-Compose Syntax
docker-compose -f docker/docker-compose.yml config

# Prüfe ob alle Dateien existieren
ls -la database/patches/
```

### Problem: Volume-Mount funktioniert immer noch nicht
```bash
# Prüfe ob das Verzeichnis im Container gemountet ist
docker exec projektseite-backend ls -la /app/database/patches/

# Falls leer, prüfe die Docker-Compose-Konfiguration
docker-compose -f docker/docker-compose.yml config
```

### Problem: PostgreSQL-Syntax-Fehler
```bash
# Prüfe PostgreSQL-Version
docker exec projektseite-postgres psql -U admin -d projektseite -c "SELECT version();"

# Sollte PostgreSQL 15.x anzeigen
```

### Problem: Patches werden nicht angewendet
```bash
# Prüfe ob Patches-Verzeichnis existiert
docker exec projektseite-backend ls -la /app/database/patches/

# Prüfe Backend-Logs
docker logs projektseite-backend | grep -i patch
```

### Problem: Patch-Script findet keine Datenbank
- Prüfen Sie, ob die Datenbank läuft
- Prüfen Sie die Umgebungsvariablen in `.env`
- Prüfen Sie die Docker-Container

### Problem: Berechtigungsfehler
- Stellen Sie sicher, dass der Datenbankbenutzer die nötigen Rechte hat
- Prüfen Sie die Datenbankverbindungsparameter

### Problem: Frontend zeigt immer noch Fehler
- Leeren Sie den Browser-Cache
- Starten Sie das Frontend neu
- Prüfen Sie die Browser-Konsole auf weitere Fehler

## Debug-Informationen:

### Prüfe Backend-Status:
```bash
curl http://localhost:3001/health
```

### Prüfe Kommentar-Tabellen:
```bash
curl http://localhost:3001/debug/comments-tables
```

### Prüfe alle Tabellen:
```bash
curl http://localhost:3001/debug/tables
```

### Prüfe Kommentar-Tabellen-Spalten:
```bash
curl http://localhost:3001/debug/columns/comments
```

## Support

Bei weiteren Problemen:
1. Prüfen Sie die Backend-Logs
2. Prüfen Sie die Datenbankverbindung
3. Kontaktieren Sie den Systemadministrator
