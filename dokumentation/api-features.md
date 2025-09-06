# API-Dokumentation: Task-Management Features
## My-Tasks, Deadlines und Kanban-Board

> **Version:** 2.1.0 "Stabilisator"  
> **Letzte Aktualisierung:** September 2025

## 📋 Übersicht

Diese Dokumentation beschreibt die API-Endpunkte für die drei Hauptfeatures des Task-Management-Systems:

1. **My-Tasks** - Personalisierte Task-Übersicht
2. **Deadlines** - Dashboard-Widget für anstehende Fälligkeiten  
3. **Kanban-Board** - Drag & Drop Task-Management

## 🔐 Authentifizierung

Alle API-Endpunkte erfordern JWT-Authentifizierung:

```http
Authorization: Bearer <JWT_TOKEN>
```

## 📊 Feature A: My-Tasks

### GET /api/tasks/my-tasks

**Beschreibung:** Ruft alle Tasks des eingeloggten Benutzers ab.

**Query-Parameter:**
- `status` (optional): Filter nach Status (`todo`, `in_progress`, `review`, `completed`, `cancelled`)
- `priority` (optional): Filter nach Priorität (`low`, `medium`, `high`, `critical`)
- `project_id` (optional): Filter nach Projekt-ID
- `due_before` (optional): Tasks fällig vor Datum (ISO-Format)
- `due_after` (optional): Tasks fällig nach Datum (ISO-Format)
- `page` (optional): Seitennummer (Standard: 1)
- `limit` (optional): Anzahl pro Seite (Standard: 20)

**Beispiel-Request:**
```http
GET /api/tasks/my-tasks?status=todo&priority=high&page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Beispiel-Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 1,
        "title": "Dashboard Widget implementieren",
        "description": "Deadlines-Widget für Dashboard erstellen",
        "status": "todo",
        "priority": "high",
        "due_date": "2025-09-13T00:00:00.000Z",
        "created_at": "2025-09-06T07:30:00.000Z",
        "updated_at": "2025-09-06T07:30:00.000Z",
        "project": {
          "id": 1,
          "name": "Projektseite v2.1"
        },
        "assignee": {
          "id": 1,
          "username": "admin"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 8,
      "pages": 1
    },
    "stats": {
      "total_tasks": 8,
      "todo_tasks": 3,
      "in_progress_tasks": 2,
      "completed_tasks": 3,
      "overdue_tasks": 1
    }
  }
}
```

**Status-Codes:**
- `200` - Erfolgreich
- `401` - Nicht authentifiziert
- `500` - Server-Fehler

## 📅 Feature B: Deadlines (Dashboard)

### GET /api/dashboard/me

**Beschreibung:** Ruft Dashboard-Daten für den eingeloggten Benutzer ab, inklusive anstehender Deadlines.

**Beispiel-Request:**
```http
GET /api/dashboard/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Beispiel-Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    },
    "widgets": {
      "openTasks": [
        {
          "id": 1,
          "title": "Dashboard Widget implementieren",
          "status": "todo",
          "priority": "high",
          "due_date": "2025-09-13T00:00:00.000Z",
          "project_name": "Projektseite v2.1",
          "days_until_due": 7
        }
      ],
      "upcomingDeadlines": [
        {
          "id": 1,
          "title": "Dashboard Widget implementieren",
          "description": "Deadlines-Widget für Dashboard erstellen",
          "status": "todo",
          "priority": "high",
          "due_date": "2025-09-13T00:00:00.000Z",
          "project_name": "Projektseite v2.1",
          "project_id": 1,
          "assigned_username": "admin",
          "completion_percentage": 0,
          "days_until_due": 7,
          "is_overdue": false,
          "urgency": "medium"
        }
      ]
    },
    "stats": {
      "open_tasks": 5,
      "completed_tasks": 3,
      "upcoming_deadlines": 4,
      "overdue_tasks": 1,
      "avg_task_progress": 0
    }
  }
}
```

**Deadline-Urgency-Levels:**
- `critical` - Heute fällig oder überfällig
- `high` - Morgen fällig
- `medium` - In 2-3 Tagen fällig
- `low` - In 4-7 Tagen fällig

**Status-Codes:**
- `200` - Erfolgreich
- `401` - Nicht authentifiziert
- `500` - Server-Fehler

## 🎯 Feature C: Kanban-Board

### GET /api/projects/:id/board

**Beschreibung:** Ruft Kanban-Board-Daten für ein spezifisches Projekt ab.

**URL-Parameter:**
- `id` - Projekt-ID

**Beispiel-Request:**
```http
GET /api/projects/1/board
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Beispiel-Response:**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": 1,
      "name": "Projektseite v2.1",
      "description": "Hauptprojekt für die Projektseite"
    },
    "columns": [
      {
        "id": "todo",
        "title": "Todo",
        "status": "todo",
        "tasks": [
          {
            "id": 1,
            "title": "Dashboard Widget implementieren",
            "description": "Deadlines-Widget für Dashboard erstellen",
            "status": "todo",
            "priority": "high",
            "due_date": "2025-09-13T00:00:00.000Z",
            "assignee": {
              "id": 1,
              "username": "admin"
            },
            "created_at": "2025-09-06T07:30:00.000Z",
            "updated_at": "2025-09-06T07:30:00.000Z"
          }
        ]
      },
      {
        "id": "in_progress",
        "title": "In Progress",
        "status": "in_progress",
        "tasks": []
      },
      {
        "id": "review",
        "title": "Review",
        "status": "review",
        "tasks": []
      },
      {
        "id": "completed",
        "title": "Completed",
        "status": "completed",
        "tasks": []
      },
      {
        "id": "cancelled",
        "title": "Cancelled",
        "status": "cancelled",
        "tasks": []
      }
    ],
    "stats": {
      "total_tasks": 1,
      "todo_tasks": 1,
      "in_progress_tasks": 0,
      "review_tasks": 0,
      "completed_tasks": 0,
      "cancelled_tasks": 0
    }
  }
}
```

**Status-Codes:**
- `200` - Erfolgreich
- `401` - Nicht authentifiziert
- `403` - Keine Berechtigung für Projekt
- `404` - Projekt nicht gefunden
- `500` - Server-Fehler

### PATCH /api/tasks/:id

**Beschreibung:** Aktualisiert den Status eines Tasks (für Drag & Drop).

**URL-Parameter:**
- `id` - Task-ID

**Request-Body:**
```json
{
  "status": "in_progress"
}
```

**Beispiel-Request:**
```http
PATCH /api/tasks/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "in_progress"
}
```

**Beispiel-Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Dashboard Widget implementieren",
    "status": "in_progress",
    "updated_at": "2025-09-06T08:15:00.000Z"
  }
}
```

**Gültige Status-Werte:**
- `todo` - Zu erledigen
- `in_progress` - In Bearbeitung
- `review` - Zur Überprüfung
- `completed` - Abgeschlossen
- `cancelled` - Abgebrochen

**Status-Codes:**
- `200` - Erfolgreich aktualisiert
- `400` - Ungültiger Status
- `401` - Nicht authentifiziert
- `403` - Keine Berechtigung
- `404` - Task nicht gefunden
- `500` - Server-Fehler

## 🔧 Status-Konstanten

### Task-Status
```javascript
const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const VALID_TASK_STATUSES = [
  'todo', 'in_progress', 'review', 'completed', 'cancelled'
];
```

### Task-Prioritäten
```javascript
const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

const VALID_TASK_PRIORITIES = [
  'low', 'medium', 'high', 'critical'
];
```

### Kanban-Spalten
```javascript
const KANBAN_COLUMNS = [
  { id: 'todo', title: 'Todo', status: 'todo' },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress' },
  { id: 'review', title: 'Review', status: 'review' },
  { id: 'completed', title: 'Completed', status: 'completed' },
  { id: 'cancelled', title: 'Cancelled', status: 'cancelled' }
];
```

## 📊 Error-Handling

### Standard-Error-Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Ungültiger Status-Wert",
    "details": {
      "field": "status",
      "value": "invalid_status",
      "allowed_values": ["todo", "in_progress", "review", "completed", "cancelled"]
    }
  }
}
```

### Häufige Error-Codes
- `VALIDATION_ERROR` - Eingabe-Validierung fehlgeschlagen
- `AUTHENTICATION_ERROR` - JWT-Token ungültig oder abgelaufen
- `AUTHORIZATION_ERROR` - Keine Berechtigung für die Aktion
- `NOT_FOUND` - Ressource nicht gefunden
- `RATE_LIMIT_EXCEEDED` - Zu viele Anfragen
- `INTERNAL_SERVER_ERROR` - Unerwarteter Server-Fehler

## 🚀 Rate-Limiting

**Aktuelle Limits:**
- **Standard:** 1000 Requests pro 15 Minuten pro IP
- **Development:** Rate-Limiting wird für localhost übersprungen
- **Error-Response:** JSON-Format mit Retry-After-Information

**Rate-Limit-Headers:**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1694000000
```

## 📝 Datumsformatierung

### Eingabe-Formate
- **API:** ISO 8601 (`2025-09-13T00:00:00.000Z`)
- **Frontend Forms:** `yyyy-MM-dd` (`2025-09-13`)

### Automatische Konvertierung
Das System konvertiert automatisch zwischen den Formaten:
- **API → Frontend:** ISO → `yyyy-MM-dd` für HTML Date-Inputs
- **Frontend → API:** `yyyy-MM-dd` → ISO für API-Requests

## 🧪 Testing

### Test-Endpunkte
```bash
# My-Tasks testen
curl -H "Authorization: Bearer $TOKEN" \
  http://91.98.135.242:3001/api/tasks/my-tasks

# Dashboard testen
curl -H "Authorization: Bearer $TOKEN" \
  http://91.98.135.242:3001/api/dashboard/me

# Kanban-Board testen
curl -H "Authorization: Bearer $TOKEN" \
  http://91.98.135.242:3001/api/projects/1/board

# Task-Status aktualisieren
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}' \
  http://91.98.135.242:3001/api/tasks/1
```

### Test-Script
```bash
# Alle Features testen
./scripts/test-features.sh
```

## 📈 Performance-Metriken

### Ziel-Performance
- **API Response Time:** < 500ms für 95% der Requests
- **Database Query Time:** < 100ms für Standard-Queries
- **Concurrent Users:** 100+ gleichzeitige Benutzer
- **Uptime:** > 99.9%

### Monitoring
```bash
# Performance-Monitoring
docker stats

# Database-Performance
docker exec projektseite-postgres psql -U postgres -d projektseite -c \
  "SELECT * FROM pg_stat_activity WHERE state = 'active';"
```

## 🔒 Sicherheit

### Authentifizierung
- JWT-Token mit 24h Gültigkeit
- Automatische Token-Erneuerung
- Secure HTTP-Only Cookies

### Autorisierung
- Projekt-basierte Berechtigungen
- Task-Zugriff nur für zugewiesene Benutzer
- Admin-Rechte für alle Projekte

### Input-Validierung
- Alle Eingaben werden validiert
- SQL-Injection-Schutz durch Parameterized Queries
- XSS-Schutz durch Input-Sanitization

## 📞 Support

Bei Problemen mit der API:

1. **Logs prüfen:**
   ```bash
   docker logs projektseite-backend
   ```

2. **Status prüfen:**
   ```bash
   ./scripts/check-logs.sh
   ```

3. **Tests ausführen:**
   ```bash
   ./scripts/test-features.sh
   ```

4. **Dokumentation konsultieren:**
   - [FEATURE_SETUP.md](../FEATURE_SETUP.md)
   - [RISKS_AND_FOLLOWUP.md](../RISKS_AND_FOLLOWUP.md)
