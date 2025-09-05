# Kommentar-System Fix

## Problem
Die Kommentar-API gibt 404-Fehler zurück, weil:
1. Das `database`-Verzeichnis ist nicht im Backend-Container gemountet
2. Die Patches können daher nicht geladen werden
3. Die Kommentar-Tabellen existieren nicht in der Datenbank

## Lösung

### Schritt 1: Container neu starten
```bash
# Stoppe alle Container
docker-compose -f docker/docker-compose.yml down

# Starte Container neu (mit dem aktualisierten docker-compose.yml)
docker-compose -f docker/docker-compose.yml up -d
```

### Schritt 2: Prüfe die Logs
```bash
# Backend-Logs prüfen
docker logs projektseite-backend

# Sollte jetzt zeigen:
# 🔧 Wende Datenbank-Patches an...
# 📋 Gefundene Patches: X
# 🔧 Wende Patch an: 010_notes_comments_system.sql
# ✅ Patch 010_notes_comments_system.sql erfolgreich angewendet
```

### Schritt 3: Installation verifizieren
```bash
# Prüfe ob Kommentar-Tabellen erstellt wurden
curl http://localhost:3001/debug/comments-tables

# Sollte zurückgeben:
# {
#   "comment_tables": ["comment_attachments", "comment_mentions", "comment_reactions", "comments"],
#   "count": 4
# }
```

### Schritt 4: Frontend testen
- Öffne die Anwendung im Browser
- Gehe zu einem Projekt
- Der Kommentarbereich sollte jetzt funktionieren
- Keine 404-Fehler mehr in der Browser-Konsole

## Was wurde geändert

### docker-compose.yml
```yaml
volumes:
  - ../shared:/app/shared
  - ../database:/app/database  # ← Diese Zeile wurde hinzugefügt
```

### Backend-Script
Das `init-database.js` Script wurde bereits so konfiguriert, dass es:
- Das `database/patches` Verzeichnis durchsucht
- Alle `.sql` Dateien alphabetisch sortiert
- Jeden Patch nacheinander anwendet
- Fehler bei bereits angewendeten Patches ignoriert

## Troubleshooting

### Problem: Container startet nicht
```bash
# Prüfe Docker-Compose Syntax
docker-compose -f docker/docker-compose.yml config

# Prüfe ob alle Dateien existieren
ls -la database/patches/
```

### Problem: Patches werden immer noch nicht gefunden
```bash
# Prüfe ob das Verzeichnis im Container gemountet ist
docker exec projektseite-backend ls -la /app/database/patches/

# Sollte die Patch-Dateien anzeigen
```

### Problem: Datenbankfehler
```bash
# Prüfe Datenbankverbindung
docker exec projektseite-postgres psql -U admin -d projektseite -c "SELECT 1;"

# Prüfe ob Tabellen existieren
docker exec projektseite-postgres psql -U admin -d projektseite -c "SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%comment%';"
```

## Nach der Installation

Das Kommentar-System sollte vollständig funktionieren:
- ✅ Kommentare zu Projekten hinzufügen
- ✅ Kommentare zu Modulen hinzufügen
- ✅ Antworten auf Kommentare
- ✅ Reaktionen (Like, Dislike, etc.)
- ✅ Kommentare anheften
- ✅ Private Kommentare
- ✅ Kommentare bearbeiten/löschen
