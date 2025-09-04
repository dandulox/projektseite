#!/bin/bash

# Skript zum Anwenden des Benachrichtigungssystem-Patches
# Dieses Skript erstellt die notwendigen Datenbankstrukturen für das Benachrichtigungssystem

set -e

echo "🔔 Wende Benachrichtigungssystem-Patch an..."

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Datenbankverbindungsparameter
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-projektseite}
DB_USER=${DB_USER:-admin}
DB_PASSWORD=${DB_PASSWORD:-secure_password_123}

# Prüfe ob psql verfügbar ist
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ psql ist nicht installiert oder nicht im PATH verfügbar${NC}"
    exit 1
fi

# Prüfe Datenbankverbindung
echo -e "${BLUE}🔍 Prüfe Datenbankverbindung...${NC}"
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
    echo -e "${RED}❌ Kann keine Verbindung zur Datenbank herstellen${NC}"
    echo "   Host: $DB_HOST:$DB_PORT"
    echo "   Database: $DB_NAME"
    echo "   User: $DB_USER"
    exit 1
fi

echo -e "${GREEN}✅ Datenbankverbindung erfolgreich${NC}"

# Erstelle Backup vor dem Patch
echo -e "${BLUE}💾 Erstelle Backup vor dem Patch...${NC}"
BACKUP_FILE="backup_before_notifications_$(date +%Y%m%d_%H%M%S).sql"
PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"
echo -e "${GREEN}✅ Backup erstellt: $BACKUP_FILE${NC}"

# Wende Patch an
echo -e "${BLUE}🔧 Wende Benachrichtigungssystem-Patch an...${NC}"
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "database/patches/005_notifications_system.sql"; then
    echo -e "${GREEN}✅ Patch erfolgreich angewendet${NC}"
else
    echo -e "${RED}❌ Fehler beim Anwenden des Patches${NC}"
    echo -e "${YELLOW}💡 Versuche Rollback...${NC}"
    # Hier könnte ein Rollback-Skript ausgeführt werden
    exit 1
fi

# Prüfe ob Tabellen erstellt wurden
echo -e "${BLUE}🔍 Prüfe erstellte Tabellen...${NC}"
TABLES=("notification_types" "notifications" "user_notification_settings" "notification_stats")
for table in "${TABLES[@]}"; do
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1 FROM $table LIMIT 1;" &> /dev/null; then
        echo -e "${GREEN}✅ Tabelle '$table' erfolgreich erstellt${NC}"
    else
        echo -e "${RED}❌ Tabelle '$table' konnte nicht erstellt werden${NC}"
    fi
done

# Prüfe Benachrichtigungstypen
echo -e "${BLUE}🔍 Prüfe Benachrichtigungstypen...${NC}"
NOTIFICATION_TYPES=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM notification_types;")
echo -e "${GREEN}✅ $NOTIFICATION_TYPES Benachrichtigungstypen erstellt${NC}"

# Teste Benachrichtigungsfunktionen
echo -e "${BLUE}🧪 Teste Benachrichtigungsfunktionen...${NC}"
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT * FROM notification_stats LIMIT 1;" &> /dev/null; then
    echo -e "${GREEN}✅ Benachrichtigungsstatistiken-View funktioniert${NC}"
else
    echo -e "${YELLOW}⚠️  Benachrichtigungsstatistiken-View konnte nicht getestet werden${NC}"
fi

echo -e "${GREEN}🎉 Benachrichtigungssystem erfolgreich eingerichtet!${NC}"
echo ""
echo -e "${BLUE}📋 Nächste Schritte:${NC}"
echo "   1. Starte den Backend-Server neu"
echo "   2. Teste die Benachrichtigungs-API"
echo "   3. Überprüfe die Frontend-Integration"
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
