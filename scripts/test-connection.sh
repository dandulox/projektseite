#!/bin/bash

# Test-Skript für die Verbindung zwischen Frontend und Backend
# Dieses Skript testet, ob die API-Verbindung funktioniert

echo "🔍 Teste API-Verbindung..."

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funktion für farbige Ausgabe
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Test 1: Backend Health Check
echo -e "\n${YELLOW}1. Teste Backend Health Check...${NC}"
if curl -s http://localhost:3001/health > /dev/null; then
    print_status 0 "Backend ist erreichbar"
    curl -s http://localhost:3001/health | jq '.' 2>/dev/null || curl -s http://localhost:3001/health
else
    print_status 1 "Backend ist nicht erreichbar"
    echo "   Stelle sicher, dass das Backend auf Port 3001 läuft"
fi

# Test 2: Frontend erreichbar
echo -e "\n${YELLOW}2. Teste Frontend...${NC}"
if curl -s http://localhost:3000 > /dev/null; then
    print_status 0 "Frontend ist erreichbar"
else
    print_status 1 "Frontend ist nicht erreichbar"
    echo "   Stelle sicher, dass das Frontend auf Port 3000 läuft"
fi

# Test 3: API-Endpunkt testen
echo -e "\n${YELLOW}3. Teste API-Endpunkt...${NC}"
if curl -s -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}' > /dev/null; then
    print_status 0 "API-Endpunkt ist erreichbar"
else
    print_status 1 "API-Endpunkt ist nicht erreichbar"
fi

# Test 4: CORS-Header prüfen
echo -e "\n${YELLOW}4. Teste CORS-Header...${NC}"
CORS_HEADER=$(curl -s -I -X OPTIONS http://localhost:3001/api/auth/login \
    -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" | grep -i "access-control-allow-origin")

if [ ! -z "$CORS_HEADER" ]; then
    print_status 0 "CORS-Header sind korrekt konfiguriert"
    echo "   $CORS_HEADER"
else
    print_status 1 "CORS-Header fehlen oder sind falsch konfiguriert"
fi

# Test 5: Datenbank-Verbindung
echo -e "\n${YELLOW}5. Teste Datenbank-Verbindung...${NC}"
if docker exec projektseite-postgres pg_isready -U admin -d projektseite > /dev/null 2>&1; then
    print_status 0 "Datenbank ist erreichbar"
else
    print_status 1 "Datenbank ist nicht erreichbar"
    echo "   Stelle sicher, dass der PostgreSQL-Container läuft"
fi

echo -e "\n${YELLOW}📋 Zusammenfassung:${NC}"
echo "   - Backend: http://localhost:3001"
echo "   - Frontend: http://localhost:3000"
echo "   - API: http://localhost:3001/api"
echo "   - Health Check: http://localhost:3001/health"

echo -e "\n${YELLOW}🔧 Standard-Zugangsdaten:${NC}"
echo "   - Admin: admin / admin"
echo "   - User: user / user123"

echo -e "\n${YELLOW}💡 Tipps:${NC}"
echo "   - Starte das System mit: ./scripts/start-docker.sh"
echo "   - Logs anzeigen mit: ./scripts/check-logs.sh"
echo "   - System neu starten mit: docker-compose -f docker/docker-compose.yml restart"
