#!/bin/bash

# Enhanced Task Seeds Script
# Erstellt erweiterte Demo-Daten für alle drei Features

set -e

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Enhanced Task Seeds Script ===${NC}"
echo -e "${YELLOW}Erstellt erweiterte Demo-Daten für My-Tasks, Deadlines und Kanban-Board${NC}"
echo ""

# Prüfe ob Docker läuft
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}Fehler: Docker läuft nicht. Bitte starte Docker zuerst.${NC}"
    exit 1
fi

# Prüfe ob Container läuft
if ! docker ps | grep -q "projektseite-db"; then
    echo -e "${RED}Fehler: Datenbank-Container läuft nicht. Bitte starte das System zuerst.${NC}"
    echo -e "${YELLOW}Verwende: ./scripts/start-docker.sh${NC}"
    exit 1
fi

echo -e "${BLUE}1. Erstelle Backup der aktuellen Datenbank...${NC}"
docker exec projektseite-db pg_dump -U postgres -d projektseite > backup_before_seeds_$(date +%Y%m%d_%H%M%S).sql
echo -e "${GREEN}✓ Backup erstellt${NC}"

echo -e "${BLUE}2. Wende Enhanced Task Seeds Patch an...${NC}"
docker exec -i projektseite-db psql -U postgres -d projektseite < database/patches/006_enhanced_task_seeds.sql
echo -e "${GREEN}✓ Enhanced Task Seeds angewendet${NC}"

echo -e "${BLUE}3. Prüfe Datenbank-Status...${NC}"

# Prüfe Anzahl der Tasks
TASK_COUNT=$(docker exec projektseite-db psql -U postgres -d projektseite -t -c "SELECT COUNT(*) FROM tasks;")
echo -e "${GREEN}✓ Gesamtanzahl Tasks: ${TASK_COUNT}${NC}"

# Prüfe Tasks pro User
USER1_TASKS=$(docker exec projektseite-db psql -U postgres -d projektseite -t -c "SELECT COUNT(*) FROM tasks WHERE assignee_id = 1;")
USER2_TASKS=$(docker exec projektseite-db psql -U postgres -d projektseite -t -c "SELECT COUNT(*) FROM tasks WHERE assignee_id = 2;")
USER3_TASKS=$(docker exec projektseite-db psql -U postgres -d projektseite -t -c "SELECT COUNT(*) FROM tasks WHERE assignee_id = 3;")

echo -e "${GREEN}✓ User 1 Tasks: ${USER1_TASKS}${NC}"
echo -e "${GREEN}✓ User 2 Tasks: ${USER2_TASKS}${NC}"
echo -e "${GREEN}✓ User 3 Tasks: ${USER3_TASKS}${NC}"

# Prüfe Tasks mit Deadlines
DEADLINE_TASKS=$(docker exec projektseite-db psql -U postgres -d projektseite -t -c "SELECT COUNT(*) FROM tasks WHERE due_date IS NOT NULL;")
echo -e "${GREEN}✓ Tasks mit Deadlines: ${DEADLINE_TASKS}${NC}"

# Prüfe Tasks pro Status
TODO_TASKS=$(docker exec projektseite-db psql -U postgres -d projektseite -t -c "SELECT COUNT(*) FROM tasks WHERE status = 'todo';")
IN_PROGRESS_TASKS=$(docker exec projektseite-db psql -U postgres -d projektseite -t -c "SELECT COUNT(*) FROM tasks WHERE status = 'in_progress';")
REVIEW_TASKS=$(docker exec projektseite-db psql -U postgres -d projektseite -t -c "SELECT COUNT(*) FROM tasks WHERE status = 'review';")
COMPLETED_TASKS=$(docker exec projektseite-db psql -U postgres -d projektseite -t -c "SELECT COUNT(*) FROM tasks WHERE status = 'completed';")
CANCELLED_TASKS=$(docker exec projektseite-db psql -U postgres -d projektseite -t -c "SELECT COUNT(*) FROM tasks WHERE status = 'cancelled';")

echo -e "${GREEN}✓ Todo Tasks: ${TODO_TASKS}${NC}"
echo -e "${GREEN}✓ In Progress Tasks: ${IN_PROGRESS_TASKS}${NC}"
echo -e "${GREEN}✓ Review Tasks: ${REVIEW_TASKS}${NC}"
echo -e "${GREEN}✓ Completed Tasks: ${COMPLETED_TASKS}${NC}"
echo -e "${GREEN}✓ Cancelled Tasks: ${CANCELLED_TASKS}${NC}"

# Prüfe überfällige Tasks
OVERDUE_TASKS=$(docker exec projektseite-db psql -U postgres -d projektseite -t -c "SELECT COUNT(*) FROM tasks WHERE due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled');")
echo -e "${GREEN}✓ Überfällige Tasks: ${OVERDUE_TASKS}${NC}"

# Prüfe Tasks in den nächsten 7 Tagen
UPCOMING_TASKS=$(docker exec projektseite-db psql -U postgres -d projektseite -t -c "SELECT COUNT(*) FROM tasks WHERE due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' AND status NOT IN ('completed', 'cancelled');")
echo -e "${GREEN}✓ Tasks in den nächsten 7 Tagen: ${UPCOMING_TASKS}${NC}"

echo ""
echo -e "${GREEN}=== Enhanced Task Seeds erfolgreich angewendet! ===${NC}"
echo ""
echo -e "${YELLOW}Was wurde erstellt:${NC}"
echo -e "• ${USER1_TASKS} Tasks für User 1 (für 'Meine Aufgaben' Demo)"
echo -e "• ${DEADLINE_TASKS} Tasks mit Fälligkeitsdaten (für Deadlines-Demo)"
echo -e "• Tasks in allen Status für Kanban-Board Demo"
echo -e "• ${OVERDUE_TASKS} überfällige Tasks"
echo -e "• ${UPCOMING_TASKS} Tasks in den nächsten 7 Tagen"
echo -e "• Realistische Kommentare und Aktivitäten"
echo ""
echo -e "${BLUE}Teste jetzt die Features:${NC}"
echo -e "1. ${YELLOW}Meine Aufgaben${NC}: /my-tasks (sollte ${USER1_TASKS} Tasks zeigen)"
echo -e "2. ${YELLOW}Deadlines${NC}: Dashboard (sollte ${UPCOMING_TASKS} Tasks zeigen)"
echo -e "3. ${YELLOW}Kanban-Board${NC}: /projects/1/board (sollte Tasks in allen Spalten zeigen)"
echo ""
echo -e "${GREEN}Alle drei Features sollten jetzt funktionieren! 🎉${NC}"
