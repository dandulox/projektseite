# API-Fehlerbehebung - 500 Internal Server Errors

## Problem
Die API-Endpunkte geben 500 Internal Server Errors zurück, obwohl der Code korrekt aussieht.

## Ursache
Das Problem liegt wahrscheinlich an fehlenden oder unvollständigen Datenbanktabellen.

## Lösung

### 1. Diagnose durchführen
```bash
cd backend
node scripts/diagnose-errors.js
```

Dieses Skript prüft:
- Datenbankverbindung
- Vorhandene Tabellen
- Fehlende Tabellen
- API-spezifische Queries
- Indizes und Funktionen

### 2. Minimale Datenbank initialisieren
```bash
cd backend
node scripts/init-minimal-database.js
```

Dieses Skript erstellt:
- Alle wichtigen Tabellen (users, projects, tasks, teams, etc.)
- Standard-Benutzer (admin/admin, user/user123)
- Test-Daten
- Wichtige Indizes

### 3. API-Endpunkte testen
```bash
cd backend
node scripts/test-api-endpoints.js
```

Dieses Skript testet:
- Health Check
- Authentifizierung
- Alle API-Endpunkte
- POST-Operationen

### 4. Server neu starten
```bash
cd backend
npm start
# oder für Entwicklung
npm run dev
```

## Implementierte Lösungen

### Fallback-System
- **Datei**: `backend/middleware/databaseFallback.js`
- **Funktion**: Vereinfachte Queries, die auch funktionieren, wenn Tabellen fehlen
- **Verwendung**: Alle API-Routen verwenden jetzt das Fallback-System

### Verbessertes Error-Handling
- **Datei**: `backend/middleware/errorHandler.js`
- **Funktion**: Strukturierte Fehlerbehandlung mit asyncHandler
- **Verwendung**: Alle API-Routen verwenden jetzt asyncHandler

### Vereinfachte API-Routen
- **Dashboard**: Verwendet `getDashboardSimple()`
- **Tasks**: Verwendet `getTasksSimple()` und `getTaskStatsSimple()`
- **Projects**: Verwendet `getProjectsSimple()`

## Standard-Benutzer

Nach der Initialisierung sind folgende Benutzer verfügbar:

| Benutzername | Passwort | Rolle | Beschreibung |
|--------------|----------|-------|--------------|
| admin | admin | admin | Administrator |
| user | user123 | user | Standard-Benutzer |

## API-Endpunkte

### Authentifizierung
- `POST /api/auth/login` - Anmelden
- `POST /api/auth/register` - Registrieren

### Dashboard
- `GET /api/dashboard/me` - Dashboard-Daten
- `GET /api/dashboard/me/stats` - Dashboard-Statistiken

### Tasks
- `GET /api/tasks/my-tasks` - Meine Aufgaben
- `GET /api/tasks/my-tasks/stats` - Task-Statistiken
- `GET /api/tasks/:id` - Einzelne Aufgabe
- `POST /api/tasks` - Aufgabe erstellen
- `PUT /api/tasks/:id` - Aufgabe aktualisieren
- `DELETE /api/tasks/:id` - Aufgabe löschen

### Projects
- `GET /api/projects` - Alle Projekte
- `GET /api/projects/:id` - Einzelnes Projekt
- `POST /api/projects` - Projekt erstellen
- `PUT /api/projects/:id` - Projekt aktualisieren
- `DELETE /api/projects/:id` - Projekt löschen

### Admin
- `GET /api/admin/users` - Benutzer verwalten
- `GET /api/admin/health` - System-Status
- `GET /api/admin/db/status` - Datenbank-Status

### Teams
- `GET /api/teams` - Alle Teams
- `GET /api/teams/:id` - Einzelnes Team
- `POST /api/teams` - Team erstellen

### Notifications
- `GET /api/notifications` - Benachrichtigungen
- `POST /api/notifications` - Benachrichtigung erstellen

## Fehlerbehebung

### 500 Internal Server Error
1. Führe das Diagnose-Skript aus
2. Initialisiere die Datenbank
3. Starte den Server neu
4. Teste die API-Endpunkte

### 404 Not Found
- Prüfe, ob die Route korrekt definiert ist
- Prüfe, ob die Route in `server.js` geladen wird

### 401 Unauthorized
- Prüfe, ob der JWT-Token gültig ist
- Prüfe, ob der Benutzer existiert

### Datenbankfehler
- Prüfe die Datenbankverbindung
- Prüfe, ob alle Tabellen existieren
- Führe das Initialisierungsskript aus

## Logs überwachen

```bash
# Server-Logs
cd backend
npm run dev

# Docker-Logs
cd docker
docker-compose logs -f backend
```

## Nächste Schritte

1. **Datenbank initialisieren**: `node scripts/init-minimal-database.js`
2. **API testen**: `node scripts/test-api-endpoints.js`
3. **Dashboard-Response testen**: `node scripts/test-dashboard-response.js`
4. **Aktualisierte Routen testen**: `node scripts/test-updated-routes.js`
5. **Frontend testen**: Öffne die Anwendung im Browser
6. **Logs überwachen**: Prüfe Server-Logs auf weitere Fehler

## Frontend-Fehler beheben

### "Cannot read properties of undefined (reading 'items')"
Dieser Fehler tritt auf, wenn die API-Response nicht die erwartete Datenstruktur hat.

**Lösung:**
1. Führe das Dashboard-Response-Test-Skript aus:
   ```bash
   cd backend
   node scripts/test-dashboard-response.js
   ```

2. Prüfe, ob alle vier Widgets vorhanden sind:
   - `openTasks`
   - `upcomingDeadlines` 
   - `recentProjects`
   - `projectProgress`

3. Jedes Widget muss eine `items`-Array-Eigenschaft haben.

### Status-Werte korrigieren
Das Frontend erwartet spezifische Status-Werte:

**Tasks:**
- `not_started` (statt `todo`)
- `in_progress`
- `testing` (statt `review`)
- `completed`

**Projekte:**
- `planning`
- `active`
- `in_progress`
- `on_hold`
- `completed`
- `cancelled`

## Weitere 500-Fehler beheben

### Teams-Route (/api/teams/:id)
**Problem:** 500-Fehler beim Abrufen von Team-Details

**Lösung:**
1. Teams-Route wurde mit Fallback-System ausgestattet
2. Verwendet `getTeamSimple()` bei fehlenden Tabellen
3. Gibt leere Arrays für Mitglieder/Projekte zurück, falls Tabellen fehlen

### POST /api/projects
**Problem:** 500-Fehler beim Erstellen neuer Projekte

**Lösung:**
1. POST-Route wurde mit `asyncHandler` ausgestattet
2. Robuste Fehlerbehandlung für fehlende Tabellen
3. Projekt-Erstellung funktioniert auch bei unvollständigem Schema

### Alle Routen
**Implementierte Verbesserungen:**
- `asyncHandler` für bessere Fehlerbehandlung
- Fallback-System für fehlende Datenbanktabellen
- Robuste Fehlerbehandlung mit detailliertem Logging
- Graceful Degradation bei unvollständigem Schema

## Support

Bei weiteren Problemen:
1. Führe das Diagnose-Skript aus
2. Prüfe die Server-Logs
3. Teste die API-Endpunkte einzeln
4. Prüfe die Datenbankverbindung
