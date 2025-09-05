# API-Endpunkte - Projektseite

## Authentifizierung (`/api/auth`)
- `POST /api/auth/login` - Benutzer anmelden
- `POST /api/auth/register` - Neuen Benutzer registrieren
- `GET /api/auth/profile` - Benutzerprofil abrufen
- `PUT /api/auth/change-password` - Passwort ändern
- `GET /api/auth/validate` - Token validieren
- `POST /api/auth/logout` - Benutzer abmelden

## Admin-Funktionen (`/api/admin`)
- `GET /api/admin/users` - Alle Benutzer abrufen (mit Paginierung und Filter)
- `GET /api/admin/users/:id` - Einzelnen Benutzer abrufen
- `POST /api/admin/users` - Benutzer erstellen
- `PUT /api/admin/users/:id` - Benutzer bearbeiten
- `PUT /api/admin/users/:id/reset-password` - Benutzer-Passwort zurücksetzen
- `DELETE /api/admin/users/:id` - Benutzer löschen
- `GET /api/admin/stats` - System-Statistiken abrufen

## Projektverwaltung (`/api/projects`)
- `GET /api/projects` - Alle Projekte abrufen (mit Filterung)
- `GET /api/projects/:id` - Einzelnes Projekt abrufen
- `POST /api/projects` - Neues Projekt erstellen
- `PUT /api/projects/:id` - Projekt aktualisieren
- `DELETE /api/projects/:id` - Projekt löschen
- `POST /api/projects/:id/permissions` - Projekt-Berechtigung vergeben
- `DELETE /api/projects/:id/permissions/:userId` - Projekt-Berechtigung entfernen

## Modulverwaltung (`/api/modules`)
- `GET /api/modules` - Alle Module abrufen (mit Filterung)
- `GET /api/modules/:id` - Einzelnes Modul abrufen
- `POST /api/modules/project` - Neues Projekt-Modul erstellen
- `POST /api/modules/standalone` - Neues eigenständiges Modul erstellen
- `PUT /api/modules/:id` - Modul aktualisieren
- `DELETE /api/modules/:id` - Modul löschen
- `POST /api/modules/:id/permissions` - Modul-Berechtigung vergeben
- `DELETE /api/modules/:id/permissions/:userId` - Modul-Berechtigung entfernen
- `POST /api/modules/:id/dependencies` - Modul-Abhängigkeit erstellen
- `DELETE /api/modules/:id/dependencies/:connectionId` - Modul-Abhängigkeit entfernen

## Team-Management (`/api/teams`)
- `GET /api/teams` - Alle Teams abrufen
- `GET /api/teams/:id` - Einzelnes Team abrufen
- `POST /api/teams` - Neues Team erstellen
- `PUT /api/teams/:id` - Team aktualisieren
- `DELETE /api/teams/:id` - Team löschen
- `POST /api/teams/:id/members` - Team-Mitglied hinzufügen
- `DELETE /api/teams/:id/members/:userId` - Team-Mitglied entfernen
- `DELETE /api/teams/:id/leave` - Team verlassen

## Benachrichtigungen (`/api/notifications`)
- `GET /api/notifications` - Benachrichtigungen abrufen
- `PUT /api/notifications/:id/read` - Benachrichtigung als gelesen markieren
- `DELETE /api/notifications/:id` - Benachrichtigung löschen
- `PUT /api/notifications/mark-all-read` - Alle Benachrichtigungen als gelesen markieren

## Begrüßungen (`/api/greetings`)
- `GET /api/greetings` - Alle Begrüßungen abrufen
- `GET /api/greetings/random` - Zufällige Begrüßung abrufen
- `POST /api/greetings` - Neue Begrüßung erstellen (Admin)
- `PUT /api/greetings/:id` - Begrüßung aktualisieren (Admin)
- `DELETE /api/greetings/:id` - Begrüßung löschen (Admin)

## System-Status (`/api/system`)
- `GET /api/system/health` - System-Health-Check
- `GET /api/system/status` - Detaillierter System-Status
- `GET /api/system/stats` - System-Statistiken

## Debug-Endpunkte (`/api/debug`)
- `GET /api/debug/tables` - Alle Datenbank-Tabellen anzeigen
- `GET /api/debug/columns/:table` - Spalten einer Tabelle anzeigen
- `GET /api/debug/comments-tables` - Kommentar-Tabellen prüfen
