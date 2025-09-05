# Kommentar-System Installation

## Problem: 404 Fehler bei Kommentar-API

Wenn Sie 404-Fehler bei den Kommentar-API-Endpunkten erhalten, bedeutet das, dass das Kommentar-System noch nicht in der Datenbank installiert wurde.

## Lösung: Datenbank-Patch ausführen

### Schritt 1: Patch-System ausführen
```bash
./scripts/db-patch.sh
```

### Schritt 2: Backend neu starten
```bash
# Falls Docker verwendet wird
docker-compose -f docker/docker-compose.yml restart backend

# Oder falls direkt ausgeführt wird
# Backend-Server stoppen und neu starten
```

### Schritt 3: Installation prüfen
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

## Troubleshooting

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

## Support

Bei weiteren Problemen:
1. Prüfen Sie die Backend-Logs
2. Prüfen Sie die Datenbankverbindung
3. Kontaktieren Sie den Systemadministrator
