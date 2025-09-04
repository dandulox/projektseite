-- Patch 002: Beispiel-Patch-Vorlage
-- Erstellt: $(date)
-- Beschreibung: Vorlage für zukünftige Datenbank-Patches

-- ==============================================
-- PATCH-VORLAGE FÜR ZUKÜNFTIGE ÄNDERUNGEN
-- ==============================================

-- 1. NEUE TABELLE HINZUFÜGEN
-- CREATE TABLE IF NOT EXISTS neue_tabelle (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     description TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- 2. SPALTE ZU BESTEHENDER TABELLE HINZUFÜGEN
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- 3. INDEX HINZUFÜGEN
-- CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- 4. CONSTRAINT HINZUFÜGEN
-- ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS check_email_format 
--     CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 5. TRIGGER HINZUFÜGEN
-- CREATE TRIGGER update_neue_tabelle_updated_at BEFORE UPDATE ON neue_tabelle
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. KOMMENTARE HINZUFÜGEN
-- COMMENT ON TABLE neue_tabelle IS 'Beschreibung der neuen Tabelle';
-- COMMENT ON COLUMN neue_tabelle.name IS 'Beschreibung der Spalte';

-- ==============================================
-- WICHTIGE HINWEISE:
-- ==============================================
-- - Verwende IMMER "IF NOT EXISTS" oder "IF EXISTS"
-- - Patches müssen idempotent sein (mehrfach ausführbar)
-- - Erstelle Backups vor größeren Änderungen
-- - Teste Patches in einer Test-Umgebung
-- - Dokumentiere alle Änderungen

-- ==============================================
-- BEISPIEL: BENUTZER-EINSTELLUNGEN HINZUFÜGEN
-- ==============================================

-- Erstelle Tabelle für Benutzereinstellungen
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, setting_key)
);

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_key ON user_settings(setting_key);

-- Trigger für updated_at
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Kommentare
COMMENT ON TABLE user_settings IS 'Benutzerspezifische Einstellungen';
COMMENT ON COLUMN user_settings.user_id IS 'Referenz zum Benutzer';
COMMENT ON COLUMN user_settings.setting_key IS 'Einstellungsschlüssel (z.B. theme, language)';
COMMENT ON COLUMN user_settings.setting_value IS 'Einstellungswert';
COMMENT ON COLUMN user_settings.setting_type IS 'Datentyp der Einstellung';
