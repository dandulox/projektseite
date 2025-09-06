# Benutzerverwaltung - Projektseite

## Verfügbare Rollen
- **👑 Administrator (admin)**: Vollzugriff auf alle Funktionen
  - Benutzerverwaltung (erstellen, bearbeiten, löschen)
  - System-Einstellungen
  - Alle Projekt- und Modulfunktionen
- **👤 Benutzer (user)**: Standard-Zugriff
  - Projektverwaltung
  - Modulverwaltung
  - Design-Einstellungen
- **👁️ Betrachter (viewer)**: Nur Lesezugriff
  - Projekte anzeigen
  - Module anzeigen
  - Keine Bearbeitungsrechte

## Benutzerverwaltung
- **Erstellen**: Neue Benutzer mit Rollen und Berechtigungen
- **Bearbeiten**: Benutzername, E-Mail, Rolle und Status ändern
- **Löschen**: Benutzer entfernen (außer eigenem Account)
- **Passwort zurücksetzen**: Neue Passwörter für Benutzer setzen
- **Status verwalten**: Benutzer aktivieren/deaktivieren

## Standard-Zugangsdaten
Nach der Installation sind folgende Benutzer automatisch verfügbar:

| Benutzername | Passwort | Rolle | Beschreibung |
|--------------|----------|-------|--------------|
| **admin** | **admin** | Administrator | Vollzugriff auf alle Funktionen |
| **user** | **user123** | Benutzer | Standard-Benutzerzugriff |

**Wichtiger Hinweis:** Ändern Sie diese Standard-Passwörter nach der ersten Anmeldung!

## Benutzer-API-Endpunkte

### Authentifizierung (`/api/auth`)
- `POST /api/auth/login` - Benutzer anmelden
- `POST /api/auth/register` - Neuen Benutzer registrieren
- `POST /api/auth/refresh` - Token erneuern
- `POST /api/auth/logout` - Benutzer abmelden

### Admin-Funktionen (`/api/admin`)
- `GET /api/admin/health` - System-Health-Check
- `GET /api/admin/db/status` - Datenbank-Status
- `GET /api/admin/db/tables` - Alle Datenbank-Tabellen auflisten
- `GET /api/admin/db/tables/:tableName` - Tabellen-Informationen abrufen
- `GET /api/admin/db/tables/:tableName/data` - Tabellen-Daten abrufen
- `GET /api/admin/db/tables/:tableName/count` - Anzahl der Datensätze
- `GET /api/admin/db/tables/:tableName/schema` - Tabellen-Schema abrufen

## Benutzer-Datenbank-Schema

### Benutzer (`users`)
- `id` - Primärschlüssel (CUID)
- `username` - Eindeutiger Benutzername
- `email` - E-Mail-Adresse
- `password` - Gehashtes Passwort
- `role` - Rolle (ADMIN, USER, VIEWER)
- `isActive` - Aktiv-Status
- `createdAt`, `updatedAt` - Zeitstempel

## Benutzer erstellen
```bash
# Benutzer werden über die API erstellt
# POST /api/auth/register

# Oder über das Frontend-Interface
# Registrierung über das Login-Formular
```

## Benutzerprofile
- **Einstellungen**: Design-Anpassungen, Theme-Auswahl
- **Profil-Informationen**: Benutzername, E-Mail, Rolle
- **Sicherheit**: Passwort ändern, Login-Historie
- **Berechtigungen**: Übersicht der Zugriffsrechte
