# Admin Diagnose-Werkzeuge

## Übersicht

Die Admin-Diagnose-Werkzeuge bieten Administratoren umfassende Systemüberwachung und Debugging-Funktionen. Diese Features sind ausschließlich für Benutzer mit Admin-Rolle verfügbar.

## Features

### 1. API-Debug
- **Vordefinierte API-Checks**: Konfigurierbare Endpoint-Tests
- **Freie Eingabe**: HTTP-Methode, URL, Headers und Body
- **Response-Analyse**: Statuscode mit Tooltip-Erklärung, Laufzeit, JSON-Preview
- **Sicherheit**: Nur relative Pfade erlaubt, Rate-Limiting

### 2. System-Health
- **Web/App Alive**: Selbst-Ping-Test
- **DB-Verbindung**: Ping und Latenz-Messung
- **Migrations-Status**: Pending-Migrations-Erkennung
- **Optional Services**: SMTP, Storage, Cache (per ENV-Flag)

### 3. DB-Schema-Abgleich
- **Schema-Drift-Erkennung**: Vergleich App-Model vs. physische DB
- **Tabellen-Status**: Vorhandene vs. erwartete Tabellen
- **Migration-Status**: Pending-Migrations-Liste

## Konfiguration

### Umgebungsvariablen

```bash
# Optional: SMTP-Check aktivieren
ENABLE_SMTP_CHECK=true

# Optional: Storage-Check aktivieren  
ENABLE_STORAGE_CHECK=true

# Optional: Cache-Check aktivieren
ENABLE_CACHE_CHECK=true

# Optional: API-Debug deaktivieren
ADMIN_API_DEBUG_ENABLED=false
```

### Rate-Limiting

- **API-Debug**: 30 Requests pro 5 Minuten pro IP
- **Health-Check**: Kein Limit
- **DB-Status**: Kein Limit

## Sicherheit

### Zugriffskontrolle
- Nur `ROLE_ADMIN` Zugriff
- Server- und Client-seitige Guards
- JWT-Token-Validierung

### API-Debug-Schutz
- **SSRF-Schutz**: Nur relative Pfade erlaubt
- **Whitelist**: Nur vordefinierte Endpoints
- **Body-Limit**: 256KB Maximum
- **Header-Filtering**: Keine Auth-Headers weiterleiten

### Erlaubte API-Debug-Pfade
```
/api/me
/api/projects
/api/tasks
/api/health
/api/dashboard/me
/api/teams
/api/notifications
```

## HTTP-Statuscode-Erklärungen

### 2xx - Erfolg
- **200 OK**: Anfrage erfolgreich verarbeitet
- **201 Created**: Ressource erfolgreich erstellt
- **204 No Content**: Erfolgreich, aber keine Daten

### 4xx - Client-Fehler
- **400 Bad Request**: Ungültige Anfrage-Parameter
- **401 Unauthorized**: Nicht authentifiziert
- **403 Forbidden**: Keine Berechtigung
- **404 Not Found**: Ressource existiert nicht
- **409 Conflict**: Ressource bereits vorhanden
- **422 Unprocessable Entity**: Validierungsfehler
- **429 Too Many Requests**: Rate-Limit überschritten

### 5xx - Server-Fehler
- **500 Internal Server Error**: Server-Fehler
- **502 Bad Gateway**: Upstream-Server-Fehler
- **503 Service Unavailable**: Service nicht verfügbar

## Verwendung

### Admin-Zugang
1. Als Admin anmelden
2. `/admin` aufrufen
3. Tab "Diagnose" auswählen

### API-Debug
1. Vordefinierten Check auswählen oder manuell konfigurieren
2. "Ausführen" klicken
3. Ergebnis analysieren (Statuscode, Laufzeit, Response)

### Health-Check
1. "Alles prüfen" klicken
2. Status aller Services überprüfen
3. Bei Fehlern Details analysieren

### DB-Status
1. "Diff neu berechnen" klicken
2. Schema-Konsistenz prüfen
3. Pending-Migrations überprüfen

## Troubleshooting

### Häufige Probleme

#### API-Debug-Fehler
- **"Absolute URLs sind nicht erlaubt"**: Nur relative Pfade verwenden
- **"Pfad nicht in der Whitelist"**: Nur erlaubte Endpoints verwenden
- **"Body zu groß"**: JSON-Body auf 256KB begrenzen

#### Health-Check-Fehler
- **DB-Verbindung fehlgeschlagen**: Datenbank-Service prüfen
- **SMTP nicht erreichbar**: E-Mail-Konfiguration überprüfen
- **Storage nicht verfügbar**: Dateisystem-Berechtigungen prüfen

#### DB-Status-Probleme
- **Schema-Drift erkannt**: Migrationen ausführen
- **Fehlende Tabellen**: Datenbank-Schema aktualisieren
- **Pending-Migrations**: Migrationen in Produktion ausführen

### Logs überwachen
```bash
# Backend-Logs
docker logs projektseite-backend --tail 50

# Health-Check-Logs
grep "Health-Check" /var/log/projektseite/backend.log

# API-Debug-Logs  
grep "API-Debug" /var/log/projektseite/backend.log
```

## Erweiterte Konfiguration

### Preset-Checks anpassen
Datei: `frontend/src/constants/adminPresetChecks.js`

```javascript
export const adminPresetChecks = [
  {
    id: 'custom-check',
    name: 'Custom Check',
    method: 'GET',
    path: '/api/custom-endpoint',
    description: 'Custom endpoint test'
  }
];
```

### Statuscode-Map erweitern
Datei: `frontend/src/utils/statusCodeMap.js`

```javascript
export const statusCodeMap = {
  418: {
    description: 'I\'m a teapot',
    causes: ['April Fools'],
    checks: ['Check date']
  }
};
```

## Monitoring und Alerting

### Health-Check-Monitoring
- Automatische Überwachung aller Services
- E-Mail-Benachrichtigungen bei Fehlern
- Dashboard-Integration

### Performance-Metriken
- API-Response-Zeiten
- Datenbank-Latenz
- System-Uptime

### Log-Analyse
- Strukturierte Logs für alle Diagnose-Aktivitäten
- Fehler-Tracking und -Analyse
- Performance-Trends

## Best Practices

### Regelmäßige Checks
- Täglich: Health-Check ausführen
- Wöchentlich: DB-Status prüfen
- Bei Problemen: API-Debug verwenden

### Sicherheit
- Admin-Zugang regelmäßig überprüfen
- Rate-Limits respektieren
- Sensible Daten nicht in API-Debug verwenden

### Wartung
- Preset-Checks aktuell halten
- Statuscode-Map erweitern
- Logs regelmäßig analysieren
