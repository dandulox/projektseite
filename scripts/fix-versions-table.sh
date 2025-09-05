#!/bin/bash

# ===== VERSIONS-TABELLE FIX =====
# Erstellt die system_versions Tabelle direkt

set -e

echo "🔧 Erstelle system_versions Tabelle..."

# Wechsle zum Projektverzeichnis
cd /opt/projektseite

# SQL-Befehl zum Erstellen der Tabelle
docker-compose -f docker/docker-compose.yml exec -T postgres psql -U admin -d projektseite << 'EOF'
-- Erstelle system_versions Tabelle
CREATE TABLE IF NOT EXISTS system_versions (
    id SERIAL PRIMARY KEY,
    major_version INTEGER NOT NULL,
    minor_version INTEGER NOT NULL,
    patch_version INTEGER NOT NULL,
    codename VARCHAR(50),
    release_date DATE NOT NULL,
    changes TEXT,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index für aktuelle Version
CREATE INDEX IF NOT EXISTS idx_system_versions_current ON system_versions(is_current);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_system_versions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_system_versions_updated_at
    BEFORE UPDATE ON system_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_system_versions_updated_at();

-- Initiale Version einfügen falls noch keine existiert
INSERT INTO system_versions (major_version, minor_version, patch_version, codename, release_date, changes, is_current)
SELECT 2, 0, 0, 'Phoenix', '2024-12-19', 'Major Release mit vollständiger Projektverwaltung, Modulverwaltung, Team-Management, Benachrichtigungssystem, Fortschrittsverfolgung, Design-System und Mobile-Optimierung', true
WHERE NOT EXISTS (SELECT 1 FROM system_versions WHERE is_current = true);

-- Zeige Ergebnis
SELECT 'Tabelle erstellt' as status, COUNT(*) as anzahl_versionen FROM system_versions;
EOF

echo "✅ system_versions Tabelle erstellt!"

# Backend neu starten
echo "🔄 Starte Backend neu..."
docker-compose -f docker/docker-compose.yml restart backend

echo "✅ Fertig! Versionsverwaltung sollte jetzt funktionieren."
