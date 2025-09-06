# API-Endpunkte - Projektseite v3.0

## API-Info
- `GET /api` - API-Informationen und verfügbare Endpunkte

## Authentifizierung (`/api/auth`)
- `POST /api/auth/login` - Benutzer anmelden
- `POST /api/auth/register` - Neuen Benutzer registrieren
- `POST /api/auth/refresh` - Token erneuern
- `POST /api/auth/logout` - Benutzer abmelden

## Admin-Funktionen (`/api/admin`)
- `GET /api/admin/health` - System-Health-Check
- `GET /api/admin/db/status` - Datenbank-Status
- `GET /api/admin/db/tables` - Alle Datenbank-Tabellen auflisten
- `GET /api/admin/db/tables/:tableName` - Tabellen-Informationen abrufen
- `GET /api/admin/db/tables/:tableName/data` - Tabellen-Daten abrufen
- `GET /api/admin/db/tables/:tableName/count` - Anzahl der Datensätze
- `GET /api/admin/db/tables/:tableName/schema` - Tabellen-Schema abrufen

## Projektverwaltung (`/api/projects`)
- `GET /api/projects` - Alle Projekte abrufen (mit Filterung)
- `GET /api/projects/:id` - Einzelnes Projekt abrufen
- `POST /api/projects` - Neues Projekt erstellen
- `PATCH /api/projects/:id` - Projekt aktualisieren
- `DELETE /api/projects/:id` - Projekt löschen
- `GET /api/projects/stats` - Projekt-Statistiken abrufen

## Task-Management (`/api/tasks`)
- `GET /api/tasks` - Alle Tasks abrufen (mit Filterung)
- `GET /api/tasks/:id` - Einzelnen Task abrufen
- `POST /api/tasks` - Neuen Task erstellen
- `PATCH /api/tasks/:id` - Task aktualisieren
- `PATCH /api/tasks/:id/status` - Task-Status aktualisieren
- `DELETE /api/tasks/:id` - Task löschen
- `GET /api/tasks/stats` - Task-Statistiken abrufen
