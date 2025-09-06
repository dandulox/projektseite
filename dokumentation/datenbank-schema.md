# Datenbank-Schema - Projektseite v3.0

## Haupttabellen

### Benutzer (`users`)
- `id` - Primärschlüssel (CUID)
- `username` - Eindeutiger Benutzername
- `email` - E-Mail-Adresse
- `password` - Gehashtes Passwort
- `role` - Rolle (ADMIN, USER, VIEWER)
- `isActive` - Aktiv-Status
- `createdAt`, `updatedAt` - Zeitstempel

### Teams (`teams`)
- `id` - Primärschlüssel (CUID)
- `name` - Team-Name
- `description` - Team-Beschreibung
- `leaderId` - Team-Leader (Referenz auf users)
- `isActive` - Aktiv-Status
- `createdAt`, `updatedAt` - Zeitstempel

### Team-Mitgliedschaften (`team_memberships`)
- `id` - Primärschlüssel (CUID)
- `teamId` - Team-Referenz
- `userId` - Benutzer-Referenz
- `role` - Rolle im Team (LEADER, MEMBER, VIEWER)
- `joinedAt` - Beitrittsdatum

### Projekte (`projects`)
- `id` - Primärschlüssel (CUID)
- `name` - Projekt-Name
- `description` - Projekt-Beschreibung
- `status` - Status (PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED)
- `priority` - Priorität (LOW, MEDIUM, HIGH, CRITICAL)
- `ownerId` - Eigentümer (Referenz auf users)
- `teamId` - Team-Referenz (optional)
- `visibility` - Sichtbarkeit (PRIVATE, TEAM, PUBLIC)
- `completionPercentage` - Fortschritt in Prozent
- `startDate`, `targetDate` - Zeiträume
- `createdAt`, `updatedAt` - Zeitstempel

### Tasks (`tasks`)
- `id` - Primärschlüssel (CUID)
- `title` - Task-Titel
- `description` - Task-Beschreibung
- `status` - Status (TODO, IN_PROGRESS, REVIEW, COMPLETED, CANCELLED)
- `priority` - Priorität (LOW, MEDIUM, HIGH, CRITICAL)
- `assigneeId` - Zugewiesener Benutzer (optional)
- `projectId` - Projekt-Referenz (optional)
- `moduleId` - Modul-Referenz (optional)
- `createdById` - Ersteller (Referenz auf users)
- `dueDate` - Fälligkeitsdatum
- `estimatedHours`, `actualHours` - Zeitaufwand (Decimal)
- `tags` - Tags als Array
- `createdAt`, `updatedAt`, `completedAt` - Zeitstempel

### Module (`modules`)
- `id` - Primärschlüssel (CUID)
- `projectId` - Projekt-Referenz
- `name` - Modul-Name
- `description` - Modul-Beschreibung
- `status` - Status (NOT_STARTED, IN_PROGRESS, TESTING, COMPLETED)
- `priority` - Priorität (LOW, MEDIUM, HIGH, CRITICAL)
- `assignedTo` - Zugewiesener Benutzer (optional)
- `dueDate` - Fälligkeitsdatum
- `estimatedHours`, `actualHours` - Zeitaufwand (Decimal)
- `completionPercentage` - Fortschritt in Prozent
- `createdAt`, `updatedAt` - Zeitstempel

### Activity Logs (`activity_logs`)
- `id` - Primärschlüssel (CUID)
- `userId` - Benutzer (optional)
- `entityType` - Entitätstyp (project, task, module, team)
- `entityId` - Entitäts-ID
- `action` - Aktion (created, updated, deleted, status_changed)
- `details` - Details (JSON)
- `createdAt` - Zeitstempel

### Task Comments (`task_comments`)
- `id` - Primärschlüssel (CUID)
- `taskId` - Task-Referenz
- `userId` - Benutzer-Referenz
- `content` - Kommentar-Inhalt
- `createdAt`, `updatedAt` - Zeitstempel

### Task Attachments (`task_attachments`)
- `id` - Primärschlüssel (CUID)
- `taskId` - Task-Referenz
- `userId` - Benutzer-Referenz
- `filename` - Dateiname
- `originalName` - Originaler Dateiname
- `filePath` - Dateipfad
- `fileSize` - Dateigröße
- `mimeType` - MIME-Typ
- `uploadedAt` - Upload-Zeitstempel

### Task Activities (`task_activities`)
- `id` - Primärschlüssel (CUID)
- `taskId` - Task-Referenz
- `userId` - Benutzer (optional)
- `action` - Aktion
- `details` - Details (JSON)
- `createdAt` - Zeitstempel

### Module Activities (`module_activities`)
- `id` - Primärschlüssel (CUID)
- `moduleId` - Modul-Referenz
- `userId` - Benutzer (optional)
- `action` - Aktion
- `details` - Details (JSON)
- `createdAt` - Zeitstempel

## Enums

### UserRole
- `ADMIN` - Administrator
- `USER` - Standard-Benutzer
- `VIEWER` - Nur Lesezugriff

### ProjectStatus
- `PLANNING` - In Planung
- `ACTIVE` - Aktiv
- `ON_HOLD` - Pausiert
- `COMPLETED` - Abgeschlossen
- `CANCELLED` - Abgebrochen

### TaskStatus
- `TODO` - Zu erledigen
- `IN_PROGRESS` - In Bearbeitung
- `REVIEW` - In Überprüfung
- `COMPLETED` - Abgeschlossen
- `CANCELLED` - Abgebrochen

### ModuleStatus
- `NOT_STARTED` - Nicht begonnen
- `IN_PROGRESS` - In Bearbeitung
- `TESTING` - In Tests
- `COMPLETED` - Abgeschlossen

### Priority
- `LOW` - Niedrig
- `MEDIUM` - Mittel
- `HIGH` - Hoch
- `CRITICAL` - Kritisch

### Visibility
- `PRIVATE` - Privat
- `TEAM` - Team
- `PUBLIC` - Öffentlich

### TeamRole
- `LEADER` - Team-Leiter
- `MEMBER` - Mitglied
- `VIEWER` - Betrachter

