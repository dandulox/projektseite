#!/bin/bash

# Script zum Aktualisieren der system_versions Tabelle
# Fügt version_type Spalte hinzu und aktualisiert bestehende Daten

echo "🔄 Aktualisiere system_versions Tabelle..."

# Verbinde zur PostgreSQL-Datenbank
PGPASSWORD=admin123 psql -h localhost -U admin -d projektseite << EOF

-- Füge version_type Spalte hinzu (falls sie nicht existiert)
ALTER TABLE system_versions 
ADD COLUMN IF NOT EXISTS version_type VARCHAR(20) DEFAULT 'major' 
CHECK (version_type IN ('major', 'minor', 'patch'));

-- Aktualisiere bestehende Einträge basierend auf den Versionsnummern
UPDATE system_versions 
SET version_type = CASE 
    WHEN patch_version > 0 THEN 'patch'
    WHEN minor_version > 0 THEN 'minor'
    ELSE 'major'
END
WHERE version_type IS NULL OR version_type = 'major';

-- Zeige aktualisierte Daten
SELECT id, major_version, minor_version, patch_version, version_type, codename, is_current 
FROM system_versions 
ORDER BY major_version DESC, minor_version DESC, patch_version DESC;

EOF

if [ $? -eq 0 ]; then
    echo "✅ system_versions Tabelle erfolgreich aktualisiert!"
    echo "🔄 Starte Backend neu..."
    docker-compose -f docker/docker-compose.yml restart backend
    echo "✅ Backend neu gestartet!"
else
    echo "❌ Fehler beim Aktualisieren der Tabelle!"
    exit 1
fi
