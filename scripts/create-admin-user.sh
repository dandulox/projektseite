#!/bin/bash

# Skript zum Erstellen des Standard-Admin-Benutzers
# Verwendung: ./scripts/create-admin-user.sh

echo "🔐 Erstelle Standard-Admin-Benutzer..."

# Prüfe ob Node.js verfügbar ist
if ! command -v node &> /dev/null; then
    echo "❌ Node.js ist nicht installiert. Bitte installieren Sie Node.js zuerst."
    exit 1
fi

# Wechsle zum Backend-Verzeichnis
cd backend

# Installiere Abhängigkeiten falls nötig
if [ ! -d "node_modules" ]; then
    echo "📦 Installiere Backend-Abhängigkeiten..."
    npm install
fi

# Führe das Benutzer-Erstellungs-Skript aus
echo "👤 Erstelle Standard-Benutzer..."
node scripts/create-default-users.js

if [ $? -eq 0 ]; then
    echo "✅ Standard-Benutzer erfolgreich erstellt!"
    echo ""
    echo "🔑 Standard-Zugangsdaten:"
    echo "   👑 Admin: admin / admin"
    echo "   👤 User: user / user123"
    echo ""
    echo "🌐 Sie können sich jetzt unter http://localhost:3000/login anmelden"
else
    echo "❌ Fehler beim Erstellen der Standard-Benutzer"
    exit 1
fi
