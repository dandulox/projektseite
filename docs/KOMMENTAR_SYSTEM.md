# Kommentar-System Dokumentation

## Übersicht

Das Kommentar-System ermöglicht es Benutzern, Notizen und Kommentare zu Projekten und Modulen hinzuzufügen. Es bietet eine vollständige Kommentarfunktionalität mit Threading, Reaktionen, Mentions und Berechtigungsmanagement.

## Features

### Kernfunktionen
- **Kommentare erstellen**: Benutzer können Kommentare zu Projekten und Modulen hinzufügen
- **Threading**: Antworten auf Kommentare mit verschachtelter Darstellung
- **Zeitstempel**: Automatische Zeitstempel für alle Kommentare
- **Chronologische Historie**: Kommentare werden chronologisch sortiert
- **Anheften**: Wichtige Kommentare können angeheftet werden
- **Bearbeiten**: Kommentare können nachträglich bearbeitet werden
- **Löschen**: Kommentare können gelöscht werden (mit Berechtigungsprüfung)

### Erweiterte Features
- **Reaktionen**: Like, Dislike, Helpful, Confused, Celebrate
- **Mentions**: Erwähnung von Benutzern in Kommentaren
- **Private Kommentare**: Kommentare nur für den Autor sichtbar
- **Berechtigungsmanagement**: Rollenbasierte Zugriffskontrolle
- **Benachrichtigungen**: Automatische Benachrichtigungen bei neuen Kommentaren

## Datenbankschema

### Haupttabelle: `comments`
```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('project', 'module', 'standalone_module')),
    target_id INTEGER NOT NULL,
    parent_comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    is_private BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Zusätzliche Tabellen
- `comment_mentions`: Erwähnungen von Benutzern
- `comment_reactions`: Reaktionen auf Kommentare
- `comment_attachments`: Anhänge zu Kommentaren (für zukünftige Erweiterungen)

## API-Endpunkte

### Kommentare abrufen
```http
GET /api/comments/:targetType/:targetId?include_private=false
Authorization: Bearer <token>
```

**Parameter:**
- `targetType`: `project`, `module`, oder `standalone_module`
- `targetId`: ID des Ziels
- `include_private`: `true`/`false` - Private Kommentare einbeziehen

**Response:**
```json
{
  "comments": [
    {
      "comment_id": 1,
      "content": "Kommentar-Text",
      "author_id": 1,
      "author_username": "benutzer",
      "author_email": "benutzer@example.com",
      "target_type": "project",
      "target_id": 1,
      "parent_comment_id": null,
      "is_private": false,
      "is_pinned": false,
      "is_edited": false,
      "edited_at": null,
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z",
      "reaction_counts": {
        "like": 3,
        "helpful": 1
      },
      "user_reactions": {
        "like": true
      },
      "mention_count": 0,
      "reply_count": 2
    }
  ]
}
```

### Kommentar erstellen
```http
POST /api/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Kommentar-Text",
  "target_type": "project",
  "target_id": 1,
  "parent_comment_id": null,
  "is_private": false
}
```

### Kommentar bearbeiten
```http
PUT /api/comments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Neuer Kommentar-Text"
}
```

### Kommentar löschen
```http
DELETE /api/comments/:id
Authorization: Bearer <token>
```

### Kommentar anheften/abheften
```http
POST /api/comments/:id/toggle-pin
Authorization: Bearer <token>
```

### Reaktion hinzufügen/entfernen
```http
POST /api/comments/:id/reactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "reaction_type": "like"
}
```

**Verfügbare Reaktionen:**
- `like`
- `dislike`
- `helpful`
- `confused`
- `celebrate`

### Mentions verwalten
```http
POST /api/comments/:id/mentions
Authorization: Bearer <token>
Content-Type: application/json

{
  "mentioned_user_ids": [1, 2, 3]
}
```

## Berechtigungen

### Kommentare erstellen
- Benutzer müssen mindestens `view`-Berechtigung für das Ziel haben
- Private Kommentare sind nur für den Autor sichtbar

### Kommentare bearbeiten/löschen
- Nur der Autor oder ein Admin kann Kommentare bearbeiten/löschen
- Anheften ist nur für den Autor oder Admin möglich

### Kommentare anzeigen
- Private Kommentare werden nur dem Autor angezeigt
- Öffentliche Kommentare sind für alle Benutzer mit `view`-Berechtigung sichtbar

## Frontend-Integration

### CommentsSection-Komponente
Die `CommentsSection`-Komponente kann in jede Seite integriert werden:

```jsx
import CommentsSection from './CommentsSection';

<CommentsSection 
  targetType="project" 
  targetId={projectId}
  className=""
/>
```

### ModuleDetails-Komponente
Für Module gibt es eine spezielle Detailansicht mit Kommentaren:

```jsx
import ModuleDetails from './ModuleDetails';

<ModuleDetails
  module={module}
  moduleType="project"
  onClose={() => setShowModuleDetails(false)}
  onEdit={handleEditModule}
  onDelete={handleDeleteModule}
  onUpdate={handleUpdateModule}
/>
```

## Installation

### Automatische Installation mit Patch-System
Das bestehende Patch-System wendet automatisch alle verfügbaren Patches an:

```bash
./scripts/db-patch.sh
```

Das Skript:
1. Erstellt automatisch ein Backup
2. Prüft den aktuellen Datenbank-Status
3. Wendet alle verfügbaren Patches an (einschließlich des Kommentar-Systems)
4. Startet das Backend neu
5. Zeigt den finalen Status

### Manuelle Installation
1. Datenbank-Patch ausführen:
```bash
psql -d projektseite -f database/patches/010_notes_comments_system.sql
```

2. Backend-Server neu starten

3. Frontend-Komponenten sind bereits integriert

## Verwendung

### In der Projektverwaltung
1. Öffne ein Projekt in der Projektverwaltung
2. Scrolle zum Ende der Seite
3. Verwende den Kommentarbereich, um Notizen hinzuzufügen

### In der Modulverwaltung
1. Klicke auf ein Modul in der Projektverwaltung
2. Das Modul-Detail-Fenster öffnet sich
3. Verwende den Kommentarbereich für Modul-spezifische Notizen

### Kommentar-Features
- **Neuer Kommentar**: Schreibe einen Kommentar und klicke auf "Kommentar hinzufügen"
- **Antworten**: Klicke auf "Antworten" unter einem Kommentar
- **Reaktionen**: Verwende die Reaktions-Buttons (👍, 👎, ❤️, 😕, 🎉)
- **Anheften**: Klicke auf das Pin-Symbol, um wichtige Kommentare hervorzuheben
- **Bearbeiten**: Klicke auf das Bearbeiten-Symbol (nur eigene Kommentare)
- **Löschen**: Klicke auf das Löschen-Symbol (nur eigene Kommentare oder Admin)

## Datenbankfunktionen

### get_comments_with_details()
Ruft Kommentare mit allen Details ab:
- Benutzerinformationen
- Reaktionszahlen
- Benutzer-Reaktionen
- Mention-Anzahl
- Antwort-Anzahl

### create_comment()
Erstellt einen neuen Kommentar mit Berechtigungsprüfung

### edit_comment()
Bearbeitet einen Kommentar (nur Autor oder Admin)

### delete_comment()
Löscht einen Kommentar (nur Autor oder Admin)

### toggle_comment_pin()
Heftet einen Kommentar an oder ab (nur Autor oder Admin)

## Sicherheit

- Alle API-Endpunkte erfordern Authentifizierung
- Berechtigungen werden auf Datenbankebene geprüft
- SQL-Injection-Schutz durch parametrisierte Abfragen
- XSS-Schutz durch Frontend-Escaping

## Performance

- Indizierte Datenbankabfragen für schnelle Suche
- Lazy Loading für große Kommentar-Threads
- Caching von Benutzerinformationen
- Optimierte Abfragen mit Joins

## Erweiterungsmöglichkeiten

### Geplante Features
- Datei-Anhänge zu Kommentaren
- Kommentar-Templates
- Kommentar-Export
- Erweiterte Suchfunktionen
- Kommentar-Statistiken

### Anpassungen
- Zusätzliche Reaktionstypen
- Kommentar-Kategorien
- Automatische Benachrichtigungen
- Kommentar-Moderations-Tools

## Troubleshooting

### Häufige Probleme

**Kommentare werden nicht angezeigt:**
- Prüfe Berechtigungen für das Ziel
- Prüfe ob `include_private=true` gesetzt ist
- Prüfe Datenbankverbindung

**Kommentare können nicht erstellt werden:**
- Prüfe Authentifizierung
- Prüfe Berechtigungen für das Ziel
- Prüfe API-Endpunkt-URL

**Reaktionen funktionieren nicht:**
- Prüfe JavaScript-Konsole auf Fehler
- Prüfe API-Antworten
- Prüfe Datenbank-Constraints

### Debug-Informationen
```bash
# Prüfe Tabellen
psql -d projektseite -c "SELECT * FROM comments LIMIT 5;"

# Prüfe Funktionen
psql -d projektseite -c "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE '%comment%';"

# Prüfe Indizes
psql -d projektseite -c "SELECT indexname FROM pg_indexes WHERE tablename = 'comments';"
```

## Support

Bei Problemen oder Fragen:
1. Prüfe die Logs des Backend-Servers
2. Prüfe die Browser-Konsole auf JavaScript-Fehler
3. Prüfe die Datenbankverbindung
4. Kontaktiere den Systemadministrator
