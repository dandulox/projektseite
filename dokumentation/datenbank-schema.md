# Datenbank-Schema - Projektseite

## Haupttabellen

### Benutzer (`users`)
- `id` - Primärschlüssel
- `username` - Eindeutiger Benutzername
- `email` - E-Mail-Adresse
- `password_hash` - Gehashtes Passwort
- `role` - Rolle (admin, user, viewer)
- `is_active` - Aktiv-Status
- `created_at`, `updated_at` - Zeitstempel

### Teams (`teams`)
- `id` - Primärschlüssel
- `name` - Team-Name
- `description` - Team-Beschreibung
- `team_leader_id` - Team-Leader (Referenz auf users)
- `is_active` - Aktiv-Status
- `created_at`, `updated_at` - Zeitstempel

### Team-Mitgliedschaften (`team_memberships`)
- `id` - Primärschlüssel
- `team_id` - Team-Referenz
- `user_id` - Benutzer-Referenz
- `role` - Rolle im Team (leader, member, viewer)
- `joined_at` - Beitrittsdatum

### Projekte (`projects`)
- `id` - Primärschlüssel
- `name` - Projekt-Name
- `description` - Projekt-Beschreibung
- `status` - Status (planning, active, on_hold, completed, cancelled)
- `priority` - Priorität (low, medium, high, critical)
- `owner_id` - Eigentümer (Referenz auf users)
- `team_id` - Team-Referenz (optional)
- `visibility` - Sichtbarkeit (private, team, public)
- `completion_percentage` - Fortschritt in Prozent
- `start_date`, `target_date` - Zeiträume
- `created_at`, `updated_at` - Zeitstempel

### Projekt-Module (`project_modules`)
- `id` - Primärschlüssel
- `project_id` - Projekt-Referenz
- `name` - Modul-Name
- `description` - Modul-Beschreibung
- `status` - Status (not_started, in_progress, testing, completed)
- `priority` - Priorität (low, medium, high, critical)
- `assigned_to` - Zugewiesener Benutzer
- `estimated_hours`, `actual_hours` - Zeitaufwand
- `due_date` - Fälligkeitsdatum
- `completion_percentage` - Fortschritt in Prozent
- `visibility` - Sichtbarkeit (private, team, public)
- `team_id` - Team-Referenz (optional)
- `tags` - Tags als Array
- `dependencies` - Abhängigkeiten als Array
- `created_at`, `updated_at` - Zeitstempel

### Eigenständige Module (`standalone_modules`)
- `id` - Primärschlüssel
- `name` - Modul-Name
- `description` - Modul-Beschreibung
- `status` - Status (planning, active, on_hold, completed, cancelled)
- `priority` - Priorität (low, medium, high, critical)
- `owner_id` - Eigentümer (Referenz auf users)
- `team_id` - Team-Referenz (optional)
- `assigned_to` - Zugewiesener Benutzer
- `start_date`, `target_date` - Zeiträume
- `estimated_hours`, `actual_hours` - Zeitaufwand
- `completion_percentage` - Fortschritt in Prozent
- `visibility` - Sichtbarkeit (private, team, public)
- `tags` - Tags als Array
- `dependencies` - Abhängigkeiten als Array
- `created_at`, `updated_at` - Zeitstempel

### Benachrichtigungen (`notifications`)
- `id` - Primärschlüssel
- `user_id` - Empfänger (Referenz auf users)
- `type` - Benachrichtigungstyp
- `title` - Titel
- `message` - Nachricht
- `is_read` - Gelesen-Status
- `from_user_id` - Absender (optional)
- `project_id` - Projekt-Referenz (optional)
- `team_id` - Team-Referenz (optional)
- `action_url` - Aktions-URL (optional)
- `created_at` - Erstellungsdatum

### Begrüßungen (`greetings`)
- `id` - Primärschlüssel
- `text` - Begrüßungstext
- `category` - Kategorie (morning, afternoon, evening, general)
- `is_active` - Aktiv-Status
- `created_at`, `updated_at` - Zeitstempel

## Berechtigungstabellen

### Projekt-Berechtigungen (`project_permissions`)
- `id` - Primärschlüssel
- `project_id` - Projekt-Referenz
- `user_id` - Benutzer-Referenz
- `permission_type` - Berechtigungstyp (view, edit, admin)
- `granted_by` - Gewährt von (Referenz auf users)
- `granted_at` - Gewährungsdatum

### Modul-Berechtigungen (`module_permissions`)
- `id` - Primärschlüssel
- `module_id` - Modul-Referenz
- `module_type` - Modul-Typ (project, standalone)
- `user_id` - Benutzer-Referenz
- `permission_type` - Berechtigungstyp (view, edit, admin)
- `granted_by` - Gewährt von (Referenz auf users)
- `granted_at` - Gewährungsdatum

## Log-Tabellen

### Projekt-Logs (`project_logs`)
- `id` - Primärschlüssel
- `project_id` - Projekt-Referenz
- `user_id` - Benutzer-Referenz
- `action` - Aktion
- `details` - Details
- `timestamp` - Zeitstempel

### Modul-Logs (`module_logs`)
- `id` - Primärschlüssel
- `module_id` - Modul-Referenz
- `module_type` - Modul-Typ (project, standalone)
- `user_id` - Benutzer-Referenz
- `action` - Aktion
- `details` - Details
- `timestamp` - Zeitstempel

## Kommentar-System

### Kommentare (`comments`)
- `id` - Primärschlüssel
- `content` - Kommentarinhalt
- `author_id` - Autor (Referenz auf users)
- `parent_id` - Übergeordneter Kommentar (optional)
- `entity_type` - Entitätstyp (project, module)
- `entity_id` - Entitäts-ID
- `is_pinned` - Angeheftet-Status
- `is_private` - Privat-Status
- `created_at`, `updated_at` - Zeitstempel

### Kommentar-Reaktionen (`comment_reactions`)
- `id` - Primärschlüssel
- `comment_id` - Kommentar-Referenz
- `user_id` - Benutzer-Referenz
- `reaction_type` - Reaktionstyp (like, dislike, etc.)
- `created_at` - Zeitstempel

### Kommentar-Anhänge (`comment_attachments`)
- `id` - Primärschlüssel
- `comment_id` - Kommentar-Referenz
- `file_name` - Dateiname
- `file_path` - Dateipfad
- `file_size` - Dateigröße
- `mime_type` - MIME-Typ
- `created_at` - Zeitstempel

### Kommentar-Erwähnungen (`comment_mentions`)
- `id` - Primärschlüssel
- `comment_id` - Kommentar-Referenz
- `mentioned_user_id` - Erwähnter Benutzer
- `created_at` - Zeitstempel
