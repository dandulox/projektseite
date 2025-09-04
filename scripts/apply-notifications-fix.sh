#!/bin/bash

# Einfaches Skript zum Anwenden des Benachrichtigungssystem-Fixes
# Dieses Skript kann direkt ausgeführt werden

set -e

echo "🔔 Wende Benachrichtigungssystem-Fix an..."

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Prüfe ob Docker läuft
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker läuft nicht. Bitte starte Docker zuerst.${NC}"
    exit 1
fi

# Prüfe ob PostgreSQL-Container läuft
if ! docker ps | grep -q "projektseite-postgres"; then
    echo -e "${RED}❌ PostgreSQL-Container läuft nicht. Bitte starte das System zuerst.${NC}"
    echo "   Führe aus: ./scripts/start-docker.sh"
    exit 1
fi

echo -e "${BLUE}🔍 Prüfe Datenbankverbindung...${NC}"

# Teste Verbindung
if docker exec projektseite-postgres pg_isready -U admin -d projektseite > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Datenbankverbindung erfolgreich${NC}"
else
    echo -e "${RED}❌ Kann keine Verbindung zur Datenbank herstellen${NC}"
    exit 1
fi

# Erstelle Backup
echo -e "${BLUE}💾 Erstelle Backup...${NC}"
BACKUP_FILE="backup_before_notifications_$(date +%Y%m%d_%H%M%S).sql"
if docker exec projektseite-postgres pg_dump -U admin -d projektseite > "$BACKUP_FILE"; then
    echo -e "${GREEN}✅ Backup erstellt: $BACKUP_FILE${NC}"
else
    echo -e "${RED}❌ Backup-Erstellung fehlgeschlagen${NC}"
    exit 1
fi

# Wende Patch an
echo -e "${BLUE}🔧 Wende Benachrichtigungssystem-Patch an...${NC}"
if docker exec -i projektseite-postgres psql -U admin -d projektseite < "database/patches/005_notifications_system_fixed.sql"; then
    echo -e "${GREEN}✅ Patch erfolgreich angewendet${NC}"
else
    echo -e "${RED}❌ Fehler beim Anwenden des Patches${NC}"
    echo -e "${YELLOW}💡 Das Backup wurde erstellt: $BACKUP_FILE${NC}"
    exit 1
fi

# Prüfe erstellte Tabellen
echo -e "${BLUE}🔍 Prüfe erstellte Tabellen...${NC}"
TABLES=("notification_types" "notifications" "user_notification_settings")
for table in "${TABLES[@]}"; do
    if docker exec projektseite-postgres psql -U admin -d projektseite -c "SELECT 1 FROM $table LIMIT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Tabelle '$table' erfolgreich erstellt${NC}"
    else
        echo -e "${RED}❌ Tabelle '$table' konnte nicht erstellt werden${NC}"
    fi
done

# Prüfe Benachrichtigungstypen
echo -e "${BLUE}🔍 Prüfe Benachrichtigungstypen...${NC}"
NOTIFICATION_TYPES=$(docker exec projektseite-postgres psql -U admin -d projektseite -t -c "SELECT COUNT(*) FROM notification_types;" 2>/dev/null | tr -d ' \n')
echo -e "${GREEN}✅ $NOTIFICATION_TYPES Benachrichtigungstypen erstellt${NC}"

# Teste Benachrichtigungsfunktionen
echo -e "${BLUE}🧪 Teste Benachrichtigungsfunktionen...${NC}"
if docker exec projektseite-postgres psql -U admin -d projektseite -c "SELECT * FROM notification_stats LIMIT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Benachrichtigungsstatistiken-View funktioniert${NC}"
else
    echo -e "${YELLOW}⚠️  Benachrichtigungsstatistiken-View konnte nicht getestet werden${NC}"
fi

# Starte Backend neu
echo -e "${BLUE}🔄 Starte Backend neu...${NC}"
if docker-compose -f docker/docker-compose.yml restart backend; then
    echo -e "${GREEN}✅ Backend erfolgreich neu gestartet${NC}"
else
    echo -e "${YELLOW}⚠️  Backend-Neustart fehlgeschlagen - bitte manuell neu starten${NC}"
fi

echo -e "${GREEN}🎉 Benachrichtigungssystem erfolgreich eingerichtet!${NC}"
echo ""
echo -e "${BLUE}📋 Nächste Schritte:${NC}"
echo "   1. Teste die Benachrichtigungs-API"
echo "   2. Überprüfe die Frontend-Integration"
echo "   3. Erstelle ein Test-Projekt oder Team-Mitglied"
echo ""
echo -e "${YELLOW}💡 Hinweise:${NC}"
echo "   - Benachrichtigungen werden automatisch bei relevanten Aktionen erstellt"
echo "   - Alte Benachrichtigungen werden nach 30 Tagen automatisch bereinigt"
echo "   - Benutzer können ihre Benachrichtigungseinstellungen anpassen"
echo ""
echo -e "${BLUE}🔗 API-Endpunkte:${NC}"
echo "   GET    /api/notifications              - Benachrichtigungen abrufen"
echo "   PUT    /api/notifications/:id/read     - Als gelesen markieren"
echo "   PUT    /api/notifications/mark-all-read - Alle als gelesen markieren"
echo "   DELETE /api/notifications/:id          - Benachrichtigung löschen"
echo "   GET    /api/notifications/unread-count - Ungelesene Anzahl abrufen"
echo ""
echo -e "${GREEN}✅ Das Benachrichtigungssystem ist jetzt einsatzbereit!${NC}"
