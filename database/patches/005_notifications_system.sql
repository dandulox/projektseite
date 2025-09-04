-- Patch 005: Benachrichtigungssystem
-- Erstellt die Tabellen und Strukturen für das Benachrichtigungssystem

-- Benachrichtigungstypen definieren
CREATE TABLE IF NOT EXISTS notification_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Standard-Benachrichtigungstypen einfügen
INSERT IGNORE INTO notification_types (name, description) VALUES
('project_created', 'Neues Projekt wurde erstellt'),
('project_updated', 'Projekt wurde aktualisiert'),
('project_deleted', 'Projekt wurde gelöscht'),
('team_invite', 'Einladung zu einem Team'),
('team_join', 'Neues Mitglied im Team'),
('team_leave', 'Mitglied hat das Team verlassen'),
('user_mention', 'Benutzer wurde erwähnt'),
('system_alert', 'System-Benachrichtigung'),
('project_comment', 'Kommentar zu einem Projekt'),
('team_update', 'Team wurde aktualisiert');

-- Haupttabelle für Benachrichtigungen
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    from_user_id INT NULL,
    team_id INT NULL,
    project_id INT NULL,
    action_url VARCHAR(500) NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    -- Indizes für bessere Performance
    INDEX idx_user_id (user_id),
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_team_id (team_id),
    INDEX idx_project_id (project_id),
    INDEX idx_created_at (created_at),
    
    -- Fremdschlüssel-Constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (type) REFERENCES notification_types(name) ON DELETE RESTRICT
);

-- Trigger für automatisches Setzen des read_at Timestamps
DELIMITER //
CREATE TRIGGER IF NOT EXISTS notification_read_trigger
    BEFORE UPDATE ON notifications
    FOR EACH ROW
BEGIN
    IF NEW.is_read = 1 AND OLD.is_read = 0 THEN
        SET NEW.read_at = NOW();
    END IF;
END//
DELIMITER ;

-- Benachrichtigungseinstellungen pro Benutzer
CREATE TABLE IF NOT EXISTS user_notification_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_notification (user_id, notification_type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (notification_type) REFERENCES notification_types(name) ON DELETE CASCADE
);

-- Standard-Einstellungen für alle Benutzer erstellen
INSERT IGNORE INTO user_notification_settings (user_id, notification_type, email_enabled, push_enabled)
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
CROSS JOIN notification_types nt;

-- View für Benachrichtigungsstatistiken
CREATE OR REPLACE VIEW notification_stats AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(n.id) as total_notifications,
    COUNT(CASE WHEN n.is_read = 0 THEN 1 END) as unread_count,
    COUNT(CASE WHEN n.is_read = 0 AND n.team_id IS NULL THEN 1 END) as unread_private,
    COUNT(CASE WHEN n.is_read = 0 AND n.team_id IS NOT NULL THEN 1 END) as unread_team,
    MAX(n.created_at) as last_notification
FROM users u
LEFT JOIN notifications n ON u.id = n.user_id
GROUP BY u.id, u.username;

-- Prozedur zum Bereinigen alter Benachrichtigungen (älter als 30 Tage)
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS CleanupOldNotifications()
BEGIN
    DELETE FROM notifications 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY) 
    AND is_read = 1;
    
    SELECT ROW_COUNT() as deleted_count;
END//
DELIMITER ;

-- Event Scheduler für automatische Bereinigung (falls aktiviert)
-- SET GLOBAL event_scheduler = ON;
-- CREATE EVENT IF NOT EXISTS cleanup_notifications_event
-- ON SCHEDULE EVERY 1 DAY
-- STARTS CURRENT_TIMESTAMP
-- DO CALL CleanupOldNotifications();

-- Beispiel-Benachrichtigungen für Tests (optional)
-- INSERT INTO notifications (user_id, type, title, message, team_id, project_id) VALUES
-- (1, 'project_created', 'Neues Projekt erstellt', 'Ein neues Projekt wurde in Ihrem Team erstellt.', 1, 1),
-- (1, 'team_invite', 'Team-Einladung', 'Sie wurden zu einem neuen Team eingeladen.', 1, NULL),
-- (2, 'user_mention', 'Erwähnung', 'Sie wurden in einem Projekt erwähnt.', NULL, 1);

COMMIT;
