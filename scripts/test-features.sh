#!/bin/bash

# Feature Tests Script
# Testet alle drei Features (My-Tasks, Deadlines, Kanban-Board)

set -e

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Feature Tests Script ===${NC}"
echo -e "${YELLOW}Testet My-Tasks, Deadlines und Kanban-Board Features${NC}"
echo ""

# Prüfe ob Docker läuft
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}Fehler: Docker läuft nicht. Bitte starte Docker zuerst.${NC}"
    exit 1
fi

# Prüfe ob Container laufen
if ! docker ps | grep -q "projektseite-db"; then
    echo -e "${RED}Fehler: Datenbank-Container läuft nicht. Bitte starte das System zuerst.${NC}"
    echo -e "${YELLOW}Verwende: ./scripts/start-docker.sh${NC}"
    exit 1
fi

if ! docker ps | grep -q "projektseite-backend"; then
    echo -e "${RED}Fehler: Backend-Container läuft nicht. Bitte starte das System zuerst.${NC}"
    echo -e "${YELLOW}Verwende: ./scripts/start-docker.sh${NC}"
    exit 1
fi

echo -e "${BLUE}1. Teste Backend API-Endpunkte...${NC}"

# Teste My-Tasks API
echo -e "${YELLOW}  → Teste My-Tasks API...${NC}"
MY_TASKS_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/my_tasks_response.json \
  -H "Authorization: Bearer $(docker exec projektseite-backend node -e "console.log(require('jsonwebtoken').sign({id: 1, username: 'admin'}, 'your-secret-key'))")" \
  http://localhost:3001/api/tasks/my-tasks)

if [ "$MY_TASKS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}  ✓ My-Tasks API funktioniert${NC}"
    MY_TASKS_COUNT=$(cat /tmp/my_tasks_response.json | docker exec -i projektseite-db psql -U postgres -d projektseite -t -c "SELECT COUNT(*) FROM json_array_length('$(cat /tmp/my_tasks_response.json | jq -r '.tasks')');" 2>/dev/null || echo "0")
    echo -e "${GREEN}    → ${MY_TASKS_COUNT} Tasks gefunden${NC}"
else
    echo -e "${RED}  ✗ My-Tasks API Fehler: HTTP ${MY_TASKS_RESPONSE}${NC}"
fi

# Teste Dashboard API
echo -e "${YELLOW}  → Teste Dashboard API...${NC}"
DASHBOARD_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/dashboard_response.json \
  -H "Authorization: Bearer $(docker exec projektseite-backend node -e "console.log(require('jsonwebtoken').sign({id: 1, username: 'admin'}, 'your-secret-key'))")" \
  http://localhost:3001/api/dashboard/me)

if [ "$DASHBOARD_RESPONSE" = "200" ]; then
    echo -e "${GREEN}  ✓ Dashboard API funktioniert${NC}"
    DEADLINES_COUNT=$(cat /tmp/dashboard_response.json | jq -r '.widgets.upcomingDeadlines.items | length' 2>/dev/null || echo "0")
    echo -e "${GREEN}    → ${DEADLINES_COUNT} Deadlines gefunden${NC}"
else
    echo -e "${RED}  ✗ Dashboard API Fehler: HTTP ${DASHBOARD_RESPONSE}${NC}"
fi

# Teste Kanban-Board API
echo -e "${YELLOW}  → Teste Kanban-Board API...${NC}"
KANBAN_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/kanban_response.json \
  -H "Authorization: Bearer $(docker exec projektseite-backend node -e "console.log(require('jsonwebtoken').sign({id: 1, username: 'admin'}, 'your-secret-key'))")" \
  http://localhost:3001/api/projects/1/board)

if [ "$KANBAN_RESPONSE" = "200" ]; then
    echo -e "${GREEN}  ✓ Kanban-Board API funktioniert${NC}"
    KANBAN_COLUMNS=$(cat /tmp/kanban_response.json | jq -r '.columns | length' 2>/dev/null || echo "0")
    KANBAN_TASKS=$(cat /tmp/kanban_response.json | jq -r '.totalTasks' 2>/dev/null || echo "0")
    echo -e "${GREEN}    → ${KANBAN_COLUMNS} Spalten, ${KANBAN_TASKS} Tasks${NC}"
else
    echo -e "${RED}  ✗ Kanban-Board API Fehler: HTTP ${KANBAN_RESPONSE}${NC}"
fi

echo ""
echo -e "${BLUE}2. Teste Datenbank-Verbindungen...${NC}"

# Teste Datenbank-Verbindung
DB_CONNECTION=$(docker exec projektseite-db psql -U postgres -d projektseite -c "SELECT 1;" 2>/dev/null && echo "OK" || echo "ERROR")
if [ "$DB_CONNECTION" = "OK" ]; then
    echo -e "${GREEN}  ✓ Datenbank-Verbindung funktioniert${NC}"
else
    echo -e "${RED}  ✗ Datenbank-Verbindung Fehler${NC}"
fi

# Teste Tasks-Tabelle
TASKS_TABLE=$(docker exec projektseite-db psql -U postgres -d projektseite -c "SELECT COUNT(*) FROM tasks;" 2>/dev/null | grep -o '[0-9]*' | tail -1)
if [ -n "$TASKS_TABLE" ] && [ "$TASKS_TABLE" -gt 0 ]; then
    echo -e "${GREEN}  ✓ Tasks-Tabelle: ${TASKS_TABLE} Einträge${NC}"
else
    echo -e "${RED}  ✗ Tasks-Tabelle leer oder Fehler${NC}"
fi

# Teste User-Tabelle
USERS_TABLE=$(docker exec projektseite-db psql -U postgres -d projektseite -c "SELECT COUNT(*) FROM users;" 2>/dev/null | grep -o '[0-9]*' | tail -1)
if [ -n "$USERS_TABLE" ] && [ "$USERS_TABLE" -gt 0 ]; then
    echo -e "${GREEN}  ✓ Users-Tabelle: ${USERS_TABLE} Einträge${NC}"
else
    echo -e "${RED}  ✗ Users-Tabelle leer oder Fehler${NC}"
fi

echo ""
echo -e "${BLUE}3. Teste Feature-spezifische Daten...${NC}"

# Teste My-Tasks Daten
MY_TASKS_DB=$(docker exec projektseite-db psql -U postgres -d projektseite -t -c "SELECT COUNT(*) FROM tasks WHERE assignee_id = 1;" 2>/dev/null | tr -d ' ')
if [ -n "$MY_TASKS_DB" ] && [ "$MY_TASKS_DB" -gt 0 ]; then
    echo -e "${GREEN}  ✓ My-Tasks: ${MY_TASKS_DB} Tasks für User 1${NC}"
else
    echo -e "${RED}  ✗ My-Tasks: Keine Tasks für User 1${NC}"
fi

# Teste Deadlines Daten
DEADLINES_DB=$(docker exec projektseite-db psql -U postgres -d projektseite -t -c "SELECT COUNT(*) FROM tasks WHERE due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' AND status NOT IN ('completed', 'cancelled');" 2>/dev/null | tr -d ' ')
if [ -n "$DEADLINES_DB" ] && [ "$DEADLINES_DB" -gt 0 ]; then
    echo -e "${GREEN}  ✓ Deadlines: ${DEADLINES_DB} Tasks in den nächsten 7 Tagen${NC}"
else
    echo -e "${RED}  ✗ Deadlines: Keine Tasks in den nächsten 7 Tagen${NC}"
fi

# Teste Kanban-Board Daten
KANBAN_TODO=$(docker exec projektseite-db psql -U postgres -d projektseite -t -c "SELECT COUNT(*) FROM tasks WHERE status = 'todo';" 2>/dev/null | tr -d ' ')
KANBAN_IN_PROGRESS=$(docker exec projektseite-db psql -U postgres -d projektseite -t -c "SELECT COUNT(*) FROM tasks WHERE status = 'in_progress';" 2>/dev/null | tr -d ' ')
KANBAN_REVIEW=$(docker exec projektseite-db psql -U postgres -d projektseite -t -c "SELECT COUNT(*) FROM tasks WHERE status = 'review';" 2>/dev/null | tr -d ' ')
KANBAN_COMPLETED=$(docker exec projektseite-db psql -U postgres -d projektseite -t -c "SELECT COUNT(*) FROM tasks WHERE status = 'completed';" 2>/dev/null | tr -d ' ')

echo -e "${GREEN}  ✓ Kanban-Board Status-Verteilung:${NC}"
echo -e "${GREEN}    → Todo: ${KANBAN_TODO}${NC}"
echo -e "${GREEN}    → In Progress: ${KANBAN_IN_PROGRESS}${NC}"
echo -e "${GREEN}    → Review: ${KANBAN_REVIEW}${NC}"
echo -e "${GREEN}    → Completed: ${KANBAN_COMPLETED}${NC}"

echo ""
echo -e "${BLUE}4. Teste Frontend-Verbindungen...${NC}"

# Teste ob Frontend erreichbar ist
if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Frontend erreichbar${NC}"
else
    echo -e "${RED}  ✗ Frontend nicht erreichbar${NC}"
fi

# Teste ob Backend erreichbar ist
if curl -s -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Backend erreichbar${NC}"
else
    echo -e "${RED}  ✗ Backend nicht erreichbar${NC}"
fi

echo ""
echo -e "${BLUE}5. Zusammenfassung der Tests...${NC}"

# Zähle erfolgreiche Tests
SUCCESS_COUNT=0
TOTAL_TESTS=0

# API Tests
TOTAL_TESTS=$((TOTAL_TESTS + 3))
if [ "$MY_TASKS_RESPONSE" = "200" ]; then SUCCESS_COUNT=$((SUCCESS_COUNT + 1)); fi
if [ "$DASHBOARD_RESPONSE" = "200" ]; then SUCCESS_COUNT=$((SUCCESS_COUNT + 1)); fi
if [ "$KANBAN_RESPONSE" = "200" ]; then SUCCESS_COUNT=$((SUCCESS_COUNT + 1)); fi

# DB Tests
TOTAL_TESTS=$((TOTAL_TESTS + 3))
if [ "$DB_CONNECTION" = "OK" ]; then SUCCESS_COUNT=$((SUCCESS_COUNT + 1)); fi
if [ -n "$TASKS_TABLE" ] && [ "$TASKS_TABLE" -gt 0 ]; then SUCCESS_COUNT=$((SUCCESS_COUNT + 1)); fi
if [ -n "$USERS_TABLE" ] && [ "$USERS_TABLE" -gt 0 ]; then SUCCESS_COUNT=$((SUCCESS_COUNT + 1)); fi

# Feature Tests
TOTAL_TESTS=$((TOTAL_TESTS + 3))
if [ -n "$MY_TASKS_DB" ] && [ "$MY_TASKS_DB" -gt 0 ]; then SUCCESS_COUNT=$((SUCCESS_COUNT + 1)); fi
if [ -n "$DEADLINES_DB" ] && [ "$DEADLINES_DB" -gt 0 ]; then SUCCESS_COUNT=$((SUCCESS_COUNT + 1)); fi
if [ -n "$KANBAN_TODO" ] && [ "$KANBAN_TODO" -gt 0 ]; then SUCCESS_COUNT=$((SUCCESS_COUNT + 1)); fi

# Frontend Tests
TOTAL_TESTS=$((TOTAL_TESTS + 2))
if curl -s -f http://localhost:3000 > /dev/null 2>&1; then SUCCESS_COUNT=$((SUCCESS_COUNT + 1)); fi
if curl -s -f http://localhost:3001/api/health > /dev/null 2>&1; then SUCCESS_COUNT=$((SUCCESS_COUNT + 1)); fi

echo -e "${GREEN}Erfolgreiche Tests: ${SUCCESS_COUNT}/${TOTAL_TESTS}${NC}"

if [ "$SUCCESS_COUNT" -eq "$TOTAL_TESTS" ]; then
    echo -e "${GREEN}=== Alle Tests erfolgreich! 🎉 ===${NC}"
    echo ""
    echo -e "${YELLOW}Features sind bereit:${NC}"
    echo -e "• ${GREEN}My-Tasks${NC}: /my-tasks"
    echo -e "• ${GREEN}Deadlines${NC}: Dashboard"
    echo -e "• ${GREEN}Kanban-Board${NC}: /projects/1/board"
    exit 0
else
    echo -e "${RED}=== Einige Tests fehlgeschlagen! ❌ ===${NC}"
    echo -e "${YELLOW}Prüfe die Fehlermeldungen oben und behebe die Probleme.${NC}"
    exit 1
fi
