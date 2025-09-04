# Begrüßungs-System Setup

## Problem
Die API-Route `/api/greetings` gibt einen 404-Fehler zurück.

## Lösung

### 1. Server neu starten
Der Server muss neu gestartet werden, damit die neue Route geladen wird:

```bash
# Im Backend-Verzeichnis
cd backend
npm run dev
# oder
npm start
```

### 2. Datenbank testen
Teste, ob die Datenbank korrekt funktioniert:

```bash
# Im Backend-Verzeichnis
node test-greetings.js
```

### 3. Begrüßungen initialisieren (falls nötig)
Falls noch keine Begrüßungen in der Datenbank sind:

```bash
# Im Backend-Verzeichnis
node scripts/init-greetings.js
```

### 4. Vollständige Datenbank-Initialisierung
Falls das Problem weiterhin besteht, führe eine vollständige Initialisierung durch:

```bash
# Im Backend-Verzeichnis
node scripts/init-database.js
```

## Debugging

### Server-Logs überprüfen
Beim Start des Servers sollten folgende Meldungen erscheinen:
```
🔧 Lade API-Routen...
🔧 Greetings-Route wird geladen...
🚀 Server läuft auf Port 3001
```

### API testen
Teste die API direkt:

```bash
# Zufällige Begrüßung abrufen
curl http://localhost:3001/api/greetings/random

# Alle Begrüßungen abrufen
curl http://localhost:3001/api/greetings
```

### Datenbank prüfen
Prüfe, ob die greetings Tabelle existiert:

```sql
SELECT * FROM greetings LIMIT 5;
```

## Erwartete Ausgabe

Nach erfolgreichem Setup sollte die API folgende Antworten geben:

### GET /api/greetings/random
```json
{
  "text": "Guten Morgen! Ein neuer Tag voller Möglichkeiten beginnt! 🌅",
  "timePeriod": "morning",
  "isFallback": false
}
```

### GET /api/greetings
```json
[
  {
    "id": 1,
    "text": "Guten Morgen! Ein neuer Tag voller Möglichkeiten beginnt! 🌅",
    "time_period": "morning",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

## Häufige Probleme

1. **Server nicht neu gestartet**: Die neue Route wird erst nach einem Neustart geladen
2. **Datenbankverbindung**: Prüfe die Umgebungsvariablen für die Datenbank
3. **Tabelle existiert nicht**: Führe das Datenbankschema aus
4. **Keine Begrüßungen**: Initialisiere die Standard-Begrüßungen

## Nächste Schritte

Nach erfolgreichem Setup:
1. Öffne die Admin-Seite
2. Gehe zum "Begrüßungen" Tab
3. Verwalte die Begrüßungen über die Benutzeroberfläche
