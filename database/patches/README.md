# Datenbank-Patches

Dieses Verzeichnis enthält SQL-Patches für die Projektseite-Datenbank.

## Verwendung

Das `db-patch.sh` Skript wendet automatisch alle Patches in diesem Verzeichnis an.

## Patch-Namenskonvention

- `001_` - Nummerierung für Reihenfolge
- `beschreibung` - Kurze Beschreibung des Patches
- `.sql` - SQL-Dateiendung

## Beispiele

- `001_ensure_greetings_table.sql` - Stellt sicher, dass die greetings-Tabelle existiert
- `002_add_user_preferences.sql` - Fügt Benutzereinstellungen hinzu
- `003_update_project_status.sql` - Aktualisiert Projekt-Status-Optionen

## Patch-Erstellung

1. Erstelle eine neue SQL-Datei mit der nächsten Nummer
2. Verwende `CREATE TABLE IF NOT EXISTS` für neue Tabellen
3. Verwende `ALTER TABLE` für Änderungen an bestehenden Tabellen
4. Füge Kommentare hinzu, die den Patch beschreiben
5. Teste den Patch vor der Bereitstellung

## Wichtige Hinweise

- **Immer Backup erstellen** vor dem Anwenden von Patches
- **Idempotent** - Patches können mehrfach ausgeführt werden
- **Rückwärtskompatibel** - Keine Breaking Changes
- **Getestet** - Alle Patches müssen getestet werden

## Patch-System ausführen

```bash
# Auf dem Server
cd /opt/projektseite
./scripts/db-patch.sh
```

Das Skript:
1. Erstellt automatisch ein Backup
2. Prüft den aktuellen Datenbank-Status
3. Wendet alle verfügbaren Patches an
4. Startet das Backend neu
5. Zeigt den finalen Status
