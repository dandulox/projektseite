-- Patch 005: Benachrichtigungssystem (PostgreSQL-kompatibel)
-- Erstellt die Tabellen und Strukturen für das Benachrichtigungssystem

-- Benachrichtigungstypen definieren
CREATE TABLE IF NOT EXISTS notification_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Standard-Benachrichtigungstypen einfügen
INSERT INTO notification_types (name, description) VALUES
('project_created', 'Neues Projekt wurde erstellt'),
('project_updated', 'Projekt wurde aktualisiert'),
('project_deleted', 'Projekt wurde gelöscht'),
('team_invite', 'Einladung zu einem Team'),
('team_join', 'Neues Mitglied im Team'),
('team_leave', 'Mitglied hat das Team verlassen'),
('user_mention', 'Benutzer wurde erwähnt'),
('system_alert', 'System-Benachrichtigung'),
('project_comment', 'Kommentar zu einem Projekt'),
('team_update', 'Team wurde aktualisiert')
ON CONFLICT (name) DO NOTHING;

-- Haupttabelle für Benachrichtigungen
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    from_user_id INTEGER NULL,
    team_id INTEGER NULL,
    project_id INTEGER NULL,
    action_url VARCHAR(500) NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    -- Fremdschlüssel-Constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (type) REFERENCES notification_types(name) ON DELETE RESTRICT
);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_team_id ON notifications(team_id);
CREATE INDEX IF NOT EXISTS idx_notifications_project_id ON notifications(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Trigger für automatisches Setzen des read_at Timestamps
CREATE OR REPLACE FUNCTION update_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_read = true AND OLD.is_read = false THEN
        NEW.read_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notification_read_trigger ON notifications;
CREATE TRIGGER notification_read_trigger
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_read_at();

-- Benachrichtigungseinstellungen pro Benutzer
CREATE TABLE IF NOT EXISTS user_notification_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (user_id, notification_type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (notification_type) REFERENCES notification_types(name) ON DELETE CASCADE
);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_user_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_notification_settings_updated_at_trigger ON user_notification_settings;
CREATE TRIGGER user_notification_settings_updated_at_trigger
    BEFORE UPDATE ON user_notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_notification_settings_updated_at();

-- Standard-Einstellungen für alle Benutzer erstellen
INSERT INTO user_notification_settings (user_id, notification_type, email_enabled, push_enabled)
SELECT 
    u.id,
    nt.name,
    CASE 
        WHEN nt.name IN ('system_alert', 'team_invite') THEN TRUE
        ELSE TRUE
    END as email_enabled,
    CASE 
        WHEN nt.name IN ('team_invite', 'user_mention', 'project_comment') THEN TRUE
        ELSE FALSE
    END as push_enabled
FROM users u
CROSS JOIN notification_types nt
ON CONFLICT (user_id, notification_type) DO NOTHING;

-- View für Benachrichtigungsstatistiken
CREATE OR REPLACE VIEW notification_stats AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(n.id) as total_notifications,
    COUNT(CASE WHEN n.is_read = false THEN 1 END) as unread_count,
    COUNT(CASE WHEN n.is_read = false AND n.team_id IS NULL THEN 1 END) as unread_private,
    COUNT(CASE WHEN n.is_read = false AND n.team_id IS NOT NULL THEN 1 END) as unread_team,
    MAX(n.created_at) as last_notification
FROM users u
LEFT JOIN notifications n ON u.id = n.user_id
GROUP BY u.id, u.username;

-- Funktion zum Bereinigen alter Benachrichtigungen (älter als 30 Tage)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications 
    WHERE created_at < NOW() - INTERVAL '30 days' 
    AND is_read = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Beispiel-Benachrichtigungen für Tests (optional)
-- INSERT INTO notifications (user_id, type, title, message, team_id, project_id) VALUES
-- (1, 'project_created', 'Neues Projekt erstellt', 'Ein neues Projekt wurde in Ihrem Team erstellt.', 1, 1),
-- (1, 'team_invite', 'Team-Einladung', 'Sie wurden zu einem neuen Team eingeladen.', 1, NULL),
-- (2, 'user_mention', 'Erwähnung', 'Sie wurden in einem Projekt erwähnt.', NULL, 1);

COMMIT;
