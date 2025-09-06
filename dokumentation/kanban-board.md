# Kanban Board Feature

## Übersicht

Das Kanban Board Feature ermöglicht es Benutzern, Aufgaben in einem visuellen Board-Format zu verwalten. Tasks können per Drag & Drop zwischen verschiedenen Status-Spalten verschoben werden.

## Features

### ✅ Akzeptanzkriterien erfüllt

- **Route `/projects/:id/board`** - Kanban Board für spezifische Projekte
- **Spalten = Statuswerte** - Verwendet bestehende Task-Status: `todo`, `in_progress`, `review`, `completed`, `cancelled`
- **Drag & Drop** - Wechselt Task-Status, persistiert optimistisch
- **API: PATCH `/api/tasks/:id`** - Status-Updates über REST API

### 🎯 Zusätzliche Features

- **Optimistic Updates** - Sofortige UI-Updates für bessere UX
- **Real-time Updates** - Automatische Aktualisierung alle 30 Sekunden
- **Task-Details** - Priorität, Assignee, Due Date, Tags
- **Responsive Design** - Funktioniert auf Desktop und Mobile
- **Filter & Suche** - Aufgaben filtern und durchsuchen
- **Overdue Indicators** - Visuelle Kennzeichnung überfälliger Tasks

## Technische Implementierung

### Backend

#### API Endpoints

```javascript
// Kanban Board Daten abrufen
GET /api/projects/:id/board
Authorization: Bearer <token>

Response:
{
  "project": { ... },
  "columns": [
    {
      "id": "todo",
      "title": "Zu erledigen",
      "tasks": [ ... ]
    },
    ...
  ],
  "totalTasks": 25
}

// Task Status aktualisieren
PATCH /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

Body: { "status": "in_progress" }

Response: { ... updated task ... }
```

#### Datenbank

- Verwendet bestehende `tasks` Tabelle
- Status-Constraint: `CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'cancelled'))`
- Automatische Aktivitäts-Logs bei Status-Änderungen

### Frontend

#### Komponenten

- **`KanbanBoard.jsx`** - Hauptkomponente mit Drag & Drop
- **`TaskCard`** - Einzelne Task-Karte
- **`KanbanColumn`** - Spalte für bestimmten Status

#### Technologien

- **React Beautiful DnD** - Drag & Drop Funktionalität
- **React Query** - Datenmanagement und Caching
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

#### State Management

```javascript
// Optimistic Updates
queryClient.setQueryData(['kanbanBoard', projectId], (oldData) => {
  // Update local state immediately
  // API call happens in background
});
```

## Verwendung

### 1. Kanban Board öffnen

1. Navigiere zu **Projekte**
2. Wähle ein Projekt aus
3. Klicke auf **"Kanban Board"** Button

### 2. Tasks verschieben

1. **Drag & Drop** - Ziehe Tasks zwischen Spalten
2. **Automatische Speicherung** - Status wird sofort aktualisiert
3. **Optimistic Updates** - UI reagiert sofort

### 3. Task-Details anzeigen

- **Hover** über Task-Karte für Details
- **Priorität** - Farbkodierte Badges
- **Assignee** - Benutzername angezeigt
- **Due Date** - Mit Overdue-Indikator
- **Tags** - Bis zu 3 Tags sichtbar

## Demo-Daten

### Patch 005 - Kanban Demo Data

Zusätzliche Demo-Daten für realistische Kanban Board Demonstration:

- **25+ Tasks** in verschiedenen Status
- **Überfällige Tasks** für Demo
- **Abgebrochene Tasks** 
- **Realistische Kommentare** und Aktivitäten
- **Verschiedene Assignees** für Team-Demo

### Anwenden der Demo-Daten

```bash
# Patch anwenden
./scripts/db-patch.sh 005_kanban_demo_data.sql
```

## Konfiguration

### Umgebungsvariablen

Keine zusätzlichen Umgebungsvariablen erforderlich. Verwendet bestehende API-Konfiguration.

### Berechtigungen

- **View** - Kanban Board anzeigen
- **Edit** - Tasks verschieben (Status ändern)
- **Admin** - Alle Aktionen

## Performance

### Optimierungen

- **React Query Caching** - Reduziert API-Aufrufe
- **Optimistic Updates** - Sofortige UI-Reaktion
- **Lazy Loading** - Spalten werden nur bei Bedarf geladen
- **Debounced Search** - Effiziente Suche

### Monitoring

- **Automatische Updates** alle 30 Sekunden
- **Error Handling** mit Toast-Benachrichtigungen
- **Loading States** für bessere UX

## Erweiterungsmöglichkeiten

### Geplante Features

- **WebSocket Integration** - Echtzeit-Updates
- **Task-Filter** - Nach Priorität, Assignee, etc.
- **Bulk Operations** - Mehrere Tasks gleichzeitig verschieben
- **Custom Columns** - Benutzerdefinierte Status
- **Task Templates** - Vordefinierte Task-Typen

### API Erweiterungen

```javascript
// Bulk Status Update
PATCH /api/tasks/bulk-update
Body: {
  "taskIds": [1, 2, 3],
  "status": "completed"
}

// Custom Columns
GET /api/projects/:id/board/columns
POST /api/projects/:id/board/columns
```

## Troubleshooting

### Häufige Probleme

1. **Drag & Drop funktioniert nicht**
   - Prüfe Browser-Kompatibilität
   - Aktualisiere React Beautiful DnD

2. **Tasks werden nicht gespeichert**
   - Prüfe API-Verbindung
   - Prüfe Berechtigungen

3. **Performance-Probleme**
   - Reduziere Anzahl der Tasks
   - Aktiviere Virtualisierung

### Debug-Modus

```javascript
// React Query DevTools aktivieren
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<ReactQueryDevtools initialIsOpen={false} />
```

## Changelog

### Version 1.0.0 (2024-12-19)

- ✅ Kanban Board Implementierung
- ✅ Drag & Drop Funktionalität
- ✅ Optimistic Updates
- ✅ Responsive Design
- ✅ Demo-Daten
- ✅ API Integration
- ✅ Berechtigungsprüfung

## Support

Bei Fragen oder Problemen:

1. **Dokumentation** - Siehe `dokumentation/` Ordner
2. **API-Docs** - Siehe `dokumentation/api-endpunkte.md`
3. **Issues** - Erstelle GitHub Issue
4. **Logs** - Prüfe Browser Console und Server Logs

