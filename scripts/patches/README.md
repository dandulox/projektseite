# Patch Scripts

Dieser Ordner enthält alle Patch-Scripts für die Installation und Aktualisierung von Systemkomponenten.

## Struktur

```
scripts/patches/
├── README.md                           # Diese Datei
├── install-activity-log.sh            # Aktivitätslog-System Installation
└── [weitere Patch-Scripts...]         # Zukünftige Patches
```

## Verwendung

### Aktivitätslog-System installieren

```bash
./scripts/patches/install-activity-log.sh
```

Dieses Script installiert:
- Erweiterte Aktivitätslog-Tabellen
- Automatische Trigger für Projekt- und Modul-Änderungen
- Benachrichtigungsfunktionen
- API-Endpunkte für Aktivitätslogs

## Patch-Script Konventionen

Alle Patch-Scripts sollten folgende Struktur haben:

1. **Header**: Script-Name und Beschreibung
2. **Umgebungsprüfung**: Prüfung der Voraussetzungen
3. **Backup**: Automatisches Backup vor Änderungen
4. **Installation**: Schritt-für-Schritt Installation
5. **Verifikation**: Prüfung der erfolgreichen Installation
6. **Dokumentation**: Nächste Schritte und verfügbare Features

## Sicherheit

- Alle Patch-Scripts erstellen automatisch Backups
- Rollback-Funktionalität bei Fehlern
- Detaillierte Logging und Fehlerbehandlung
- Prüfung der Datenbankverbindung vor Änderungen

## Neue Patches hinzufügen

1. Script im `scripts/patches/` Ordner erstellen
2. Konventionen befolgen (siehe oben)
3. README.md aktualisieren
4. Testen in Entwicklungsumgebung
5. Dokumentation der neuen Features

## Wartung

- Regelmäßige Überprüfung der Patch-Scripts
- Aktualisierung bei Änderungen der Datenbankstruktur
- Entfernung veralteter Patches nach vollständiger Migration
