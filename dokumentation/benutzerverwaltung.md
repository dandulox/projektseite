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
- `GET /api/auth/profile` - Benutzerprofil abrufen
- `PUT /api/auth/change-password` - Passwort ändern
- `GET /api/auth/validate` - Token validieren
- `POST /api/auth/logout` - Benutzer abmelden

### Admin-Funktionen (`/api/admin`)
- `GET /api/admin/users` - Alle Benutzer abrufen (mit Paginierung und Filter)
- `GET /api/admin/users/:id` - Einzelnen Benutzer abrufen
- `POST /api/admin/users` - Benutzer erstellen
- `PUT /api/admin/users/:id` - Benutzer bearbeiten
- `PUT /api/admin/users/:id/reset-password` - Benutzer-Passwort zurücksetzen
- `DELETE /api/admin/users/:id` - Benutzer löschen
- `GET /api/admin/stats` - System-Statistiken abrufen

## Benutzer-Datenbank-Schema

### Benutzer (`users`)
- `id` - Primärschlüssel
- `username` - Eindeutiger Benutzername
- `email` - E-Mail-Adresse
- `password_hash` - Gehashtes Passwort
- `role` - Rolle (admin, user, viewer)
- `is_active` - Aktiv-Status
- `created_at`, `updated_at` - Zeitstempel

## Admin-Benutzer erstellen
```bash
# Erstellt einen neuen Admin-Benutzer
./scripts/create-admin-user.sh

# Das Skript ermöglicht:
# - Interaktive Erstellung von Admin-Benutzern
# - Sichere Passwort-Eingabe
# - Automatische Datenbank-Integration
```

## Benutzerprofile
- **Einstellungen**: Design-Anpassungen, Theme-Auswahl
- **Profil-Informationen**: Benutzername, E-Mail, Rolle
- **Sicherheit**: Passwort ändern, Login-Historie
- **Berechtigungen**: Übersicht der Zugriffsrechte
