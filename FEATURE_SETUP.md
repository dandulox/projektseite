# Feature Setup Guide
## My-Tasks, Deadlines und Kanban-Board Features

Dieses Dokument beschreibt, wie die drei Hauptfeatures eingerichtet und getestet werden.

> **Status:** ✅ Vollständig implementiert und getestet (v2.1.0)
> 
> **Letzte Aktualisierung:** September 2025

## 🚀 Schnellstart

### 1. System starten
```bash
# Docker Container starten
./scripts/start-docker.sh

# Warten bis alle Container laufen (ca. 30 Sekunden)
docker ps

# Container-Status prüfen
./scripts/check-logs.sh
```

### 2. Enhanced Task Seeds anwenden
```bash
# Erweiterte Demo-Daten für alle Features erstellen
./scripts/seed-enhanced-tasks.sh
```

### 3. Features testen
```bash
# Alle Features testen
./scripts/test-features.sh
```

## 📋 Detaillierte Schritte

### Schritt 1: System-Vorbereitung

1. **Docker starten**
   ```bash
   ./scripts/start-docker.sh
   ```

2. **Container-Status prüfen**
   ```bash
   docker ps
   ```
   Erwartete Container:
   - `projektseite-db` (PostgreSQL)
   - `projektseite-backend` (Node.js API)
   - `projektseite-frontend` (React App)

3. **Datenbank-Verbindung testen**
   ```bash
   docker exec projektseite-db psql -U postgres -d projektseite -c "SELECT COUNT(*) FROM users;"
   ```

### Schritt 2: Enhanced Task Seeds anwenden

1. **Backup erstellen** (automatisch im Script)
   ```bash
   # Das Script erstellt automatisch ein Backup
   ./scripts/seed-enhanced-tasks.sh
   ```

2. **Erwartete Ergebnisse:**
   - User 1: 8+ Tasks
   - User 2: 4+ Tasks  
   - User 3: 4+ Tasks
   - Tasks mit Deadlines: 15+
   - Tasks in verschiedenen Status für Kanban

### Schritt 3: Features testen

1. **API-Tests ausführen**
   ```bash
   ./scripts/test-features.sh
   ```

2. **Manuelle Tests im Browser:**
   - **My-Tasks**: http://localhost:3000/my-tasks
   - **Dashboard**: http://localhost:3000/dashboard
   - **Kanban-Board**: http://localhost:3000/projects/1/board

## 🔧 Feature-spezifische Konfiguration

### A) My-Tasks Feature

**API-Endpunkt:** `GET /api/tasks/my-tasks`

**Frontend:** `MyTasksPage.jsx`

**Test-Daten:**
- User 1 (admin) hat 8 Tasks
- Verschiedene Status: todo, in_progress, review, completed
- Verschiedene Prioritäten: low, medium, high, critical
- Fälligkeitsdaten: heute bis +10 Tage

**Testen:**
```bash
# API direkt testen
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/tasks/my-tasks

# Frontend testen
open http://localhost:3000/my-tasks
```

### B) Deadlines Feature

**API-Endpunkt:** `GET /api/dashboard/me`

**Frontend:** `DeadlinesWidget.tsx` im Dashboard

**Test-Daten:**
- Tasks mit Fälligkeitsdaten in den nächsten 7 Tagen
- Überfällige Tasks
- Verschiedene Prioritäten

**Testen:**
```bash
# API direkt testen
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/dashboard/me

# Frontend testen
open http://localhost:3000/dashboard
```

### C) Kanban-Board Feature

**API-Endpunkt:** `GET /api/projects/:id/board`

**Frontend:** `KanbanBoard.jsx`

**Test-Daten:**
- Tasks in allen Status-Spalten
- Drag & Drop funktional
- Status-Updates via PATCH

**Testen:**
```bash
# API direkt testen
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/projects/1/board

# Frontend testen
open http://localhost:3000/projects/1/board
```

## 🧪 Test-Szenarien

### Szenario 1: "Meine Aufgaben" vollständig funktional

**Voraussetzungen:**
- User 1 ist eingeloggt
- Enhanced Task Seeds sind angewendet

**Erwartetes Verhalten:**
- 8+ Tasks werden angezeigt
- Filter funktionieren (Status, Priorität, Projekt)
- Pagination funktioniert
- Statistiken werden angezeigt

**Test-Schritte:**
1. Login als admin/admin123
2. Navigiere zu /my-tasks
3. Prüfe: Tasks werden angezeigt
4. Teste Filter: Status = "todo"
5. Teste Sortierung: Nach Fälligkeitsdatum
6. Prüfe Statistiken-Widget

### Szenario 2: Deadlines-Widget zeigt anstehende Tasks

**Voraussetzungen:**
- Dashboard ist geladen
- Tasks mit Fälligkeitsdaten existieren

**Erwartetes Verhalten:**
- 5+ Deadlines in den nächsten 7 Tagen
- Urgency-Anzeige (Heute, Morgen, in X Tagen)
- Überfällige Tasks werden rot markiert
- Klick auf Deadline navigiert zu Projekt

**Test-Schritte:**
1. Navigiere zu /dashboard
2. Prüfe Deadlines-Widget
3. Zähle anstehende Deadlines
4. Prüfe Urgency-Farben
5. Klicke auf eine Deadline

### Szenario 3: Kanban-Board Drag & Drop

**Voraussetzungen:**
- Projekt 1 existiert
- Tasks in verschiedenen Status

**Erwartetes Verhalten:**
- 5 Spalten: Todo, In Progress, Review, Completed, Cancelled
- Tasks in korrekten Spalten
- Drag & Drop funktioniert
- Status wird persistent gespeichert

**Test-Schritte:**
1. Navigiere zu /projects/1/board
2. Prüfe alle 5 Spalten
3. Zähle Tasks pro Spalte
4. Ziehe Task von "Todo" nach "In Progress"
5. Prüfe: Status wurde aktualisiert
6. Lade Seite neu: Änderung ist persistent

## 🐛 Troubleshooting

### Problem: "Keine Aufgaben gefunden"

**Ursachen:**
- Enhanced Task Seeds nicht angewendet
- Falscher User eingeloggt
- Datenbank-Verbindung fehlerhaft

**Lösung:**
```bash
# Seeds erneut anwenden
./scripts/seed-enhanced-tasks.sh

# User-Tasks prüfen
docker exec projektseite-postgres psql -U postgres -d projektseite -c \
  "SELECT COUNT(*) FROM tasks WHERE assignee_id = 1;"
```

### Problem: Deadlines-Widget leer

**Ursachen:**
- Dashboard verwendet falsche Tabelle (project_modules statt tasks)
- Keine Tasks mit Fälligkeitsdaten
- Falsche Zeitzone

**Lösung:**
```bash
# Deadlines-Daten prüfen
docker exec projektseite-postgres psql -U postgres -d projektseite -c \
  "SELECT COUNT(*) FROM tasks WHERE due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days';"

# Dashboard-API testen
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://91.98.135.242:3001/api/dashboard/me | jq '.widgets.upcomingDeadlines'
```

### Problem: 429 (Too Many Requests)

**Ursachen:**
- Rate-Limiting zu restriktiv
- Zu viele API-Requests in kurzer Zeit
- React Query Retries

**Lösung:**
```bash
# Rate-Limiting wurde bereits angepasst (1000 requests/15min)
# Für lokale Entwicklung wird Rate-Limiting übersprungen

# Backend neu starten
docker-compose restart backend

# Logs prüfen
docker logs projektseite-backend
```

### Problem: Datumsformat-Fehler

**Ursachen:**
- ISO-Datumsstrings in HTML Date-Inputs
- Falsche Datumsformatierung

**Lösung:**
```bash
# Datumsformatierung wurde bereits implementiert
# Frontend neu starten
docker-compose restart frontend

# Logs prüfen
docker logs projektseite-frontend
```

### Problem: Kanban-Board zeigt keine Spalten

**Ursachen:**
- Projekt existiert nicht
- Keine Tasks im Projekt
- API-Fehler

**Lösung:**
```bash
# Projekt prüfen
docker exec projektseite-postgres psql -U postgres -d projektseite -c \
  "SELECT id, name FROM projects WHERE id = 1;"

# Tasks im Projekt prüfen
docker exec projektseite-postgres psql -U postgres -d projektseite -c \
  "SELECT COUNT(*) FROM tasks WHERE project_id = 1;"

# Kanban-API testen
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://91.98.135.242:3001/api/projects/1/board | jq '.columns'
```

### Problem: Drag & Drop funktioniert nicht

**Ursachen:**
- react-beautiful-dnd nicht installiert
- JavaScript-Fehler
- API-Update fehlgeschlagen

**Lösung:**
```bash
# Frontend-Logs prüfen
docker logs projektseite-frontend

# Backend-Logs prüfen
docker logs projektseite-backend

# PATCH-API testen
curl -X PATCH -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}' \
  http://91.98.135.242:3001/api/tasks/1
```

## 📊 Monitoring & Logs

### Logs anzeigen
```bash
# Alle Container-Logs
docker-compose logs -f

# Spezifische Container-Logs
docker logs -f projektseite-backend
docker logs -f projektseite-frontend
docker logs -f projektseite-postgres
```

### Performance-Monitoring
```bash
# Container-Ressourcen
docker stats

# Datenbank-Performance
docker exec projektseite-postgres psql -U postgres -d projektseite -c \
  "SELECT * FROM pg_stat_activity WHERE state = 'active';"
```

## ✅ Prüfliste "Alles verbunden"

Nach dem Setup sollten alle Punkte erfüllt sein:

- [ ] **My-Tasks rendert >0 Einträge** mit Seeds
- [ ] **Deadlines zeigen Aufgaben ≤7 Tage** im Dashboard-Widget
- [ ] **Kanban lädt Spalten** aus Status-Quelle
- [ ] **DnD persistiert** Status-Änderungen
- [ ] **API-Endpunkte** antworten mit 200
- [ ] **Frontend-Komponenten** laden ohne Fehler
- [ ] **Datenbank-Verbindungen** funktionieren
- [ ] **Authentication** funktioniert
- [ ] **Empty States** werden korrekt angezeigt
- [ ] **Error Handling** funktioniert

## 🎯 Nächste Schritte

Nach erfolgreichem Setup:

1. **Feature-Erweiterungen:**
   - Task-Kommentare
   - Datei-Uploads
   - Benachrichtigungen
   - Team-Management

2. **Performance-Optimierung:**
   - Caching implementieren
   - Indizes optimieren
   - Lazy Loading

3. **Testing erweitern:**
   - E2E Tests mit Playwright
   - Load Testing
   - Security Testing

4. **Monitoring:**
   - Health Checks
   - Metrics Collection
   - Alerting
