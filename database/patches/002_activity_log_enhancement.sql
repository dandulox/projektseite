-- Aktivitätslog-Erweiterung für Projekte und Module
-- Erstellt: $(date)
-- Erweitert das bestehende Log-System um detaillierte Aktivitätsverfolgung

-- ==============================================
-- ERWEITERTE AKTIVITÄTSLOG-TABELLEN
-- ==============================================

-- Erweiterte Projekt-Logs mit detaillierten Änderungen
CREATE TABLE IF NOT EXISTS project_activity_logs (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
        'created', 'updated', 'deleted', 'status_changed', 'priority_changed',
        'assigned', 'unassigned', 'permission_granted', 'permission_revoked',
        'module_added', 'module_removed', 'module_updated'
    )),
    action_details JSONB,
    old_values JSONB,
    new_values JSONB,
    affected_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_project_id ON project_activity_logs (project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_user_id ON project_activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_action_type ON project_activity_logs (action_type);
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_created_at ON project_activity_logs (created_at);

-- Erweiterte Modul-Logs mit detaillierten Änderungen
CREATE TABLE IF NOT EXISTS module_activity_logs (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL,
    module_type VARCHAR(20) NOT NULL CHECK (module_type IN ('project', 'standalone')),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
        'created', 'updated', 'deleted', 'status_changed', 'priority_changed',
        'assigned', 'unassigned', 'permission_granted', 'permission_revoked',
        'progress_updated', 'due_date_changed', 'team_changed'
    )),
    action_details JSONB,
    old_values JSONB,
    new_values JSONB,
    affected_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_module_activity_logs_module_id ON module_activity_logs (module_id, module_type);
CREATE INDEX IF NOT EXISTS idx_module_activity_logs_user_id ON module_activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_module_activity_logs_action_type ON module_activity_logs (action_type);
CREATE INDEX IF NOT EXISTS idx_module_activity_logs_project_id ON module_activity_logs (project_id);
CREATE INDEX IF NOT EXISTS idx_module_activity_logs_created_at ON module_activity_logs (created_at);

-- ==============================================
-- ERWEITERTE BENACHRICHTIGUNGSTYPEN
-- ==============================================

-- Neue Benachrichtigungstypen für Aktivitätslog
INSERT INTO notification_types (name, description) VALUES
('project_activity', 'Aktivität in einem Projekt'),
('module_activity', 'Aktivität in einem Modul'),
('project_assignment', 'Zuweisung zu einem Projekt'),
('module_assignment', 'Zuweisung zu einem Modul'),
('project_permission_change', 'Berechtigung für Projekt geändert'),
('module_permission_change', 'Berechtigung für Modul geändert'),
('project_status_change', 'Projekt-Status geändert'),
('module_status_change', 'Modul-Status geändert'),
('project_progress_update', 'Projekt-Fortschritt aktualisiert'),
('module_progress_update', 'Modul-Fortschritt aktualisiert')
ON CONFLICT (name) DO NOTHING;

-- ==============================================
-- AKTIVITÄTSLOG-FUNKTIONEN
-- ==============================================

-- Funktion zum Erstellen von Projekt-Aktivitätslogs
CREATE OR REPLACE FUNCTION log_project_activity(
    p_project_id INTEGER,
    p_user_id INTEGER,
    p_action_type VARCHAR(50),
    p_action_details JSONB DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_affected_user_id INTEGER DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    log_id INTEGER;
BEGIN
    INSERT INTO project_activity_logs (
        project_id, user_id, action_type, action_details,
        old_values, new_values, affected_user_id
    ) VALUES (
        p_project_id, p_user_id, p_action_type, p_action_details,
        p_old_values, p_new_values, p_affected_user_id
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Funktion zum Erstellen von Modul-Aktivitätslogs
CREATE OR REPLACE FUNCTION log_module_activity(
    p_module_id INTEGER,
    p_module_type VARCHAR(20),
    p_user_id INTEGER,
    p_action_type VARCHAR(50),
    p_action_details JSONB DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_affected_user_id INTEGER DEFAULT NULL,
    p_project_id INTEGER DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    log_id INTEGER;
BEGIN
    INSERT INTO module_activity_logs (
        module_id, module_type, user_id, action_type, action_details,
        old_values, new_values, affected_user_id, project_id
    ) VALUES (
        p_module_id, p_module_type, p_user_id, p_action_type, p_action_details,
        p_old_values, p_new_values, p_affected_user_id, p_project_id
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Funktion zum Erstellen von Benachrichtigungen für Projekt-Aktivitäten
CREATE OR REPLACE FUNCTION notify_project_activity(
    p_project_id INTEGER,
    p_user_id INTEGER,
    p_action_type VARCHAR(50),
    p_action_details JSONB DEFAULT NULL,
    p_affected_user_id INTEGER DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    project_record RECORD;
    team_member RECORD;
    notification_title VARCHAR(255);
    notification_message TEXT;
    notification_type VARCHAR(50);
BEGIN
    -- Projekt-Details abrufen
    SELECT p.*, u.username as owner_username, t.name as team_name
    INTO project_record
    FROM projects p
    LEFT JOIN users u ON u.id = p.owner_id
    LEFT JOIN teams t ON t.id = p.team_id
    WHERE p.id = p_project_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Benachrichtigungstyp und -text basierend auf Aktion bestimmen
    CASE p_action_type
        WHEN 'created' THEN
            notification_type := 'project_created';
            notification_title := 'Neues Projekt erstellt';
            notification_message := '"' || project_record.name || '" wurde erstellt.';
        WHEN 'updated' THEN
            notification_type := 'project_activity';
            notification_title := 'Projekt aktualisiert';
            notification_message := '"' || project_record.name || '" wurde aktualisiert.';
        WHEN 'status_changed' THEN
            notification_type := 'project_status_change';
            notification_title := 'Projekt-Status geändert';
            notification_message := '"' || project_record.name || '" Status wurde geändert.';
        WHEN 'assigned' THEN
            notification_type := 'project_assignment';
            notification_title := 'Projekt zugewiesen';
            notification_message := 'Sie wurden dem Projekt "' || project_record.name || '" zugewiesen.';
        WHEN 'permission_granted' THEN
            notification_type := 'project_permission_change';
            notification_title := 'Projekt-Berechtigung erhalten';
            notification_message := 'Sie haben neue Berechtigungen für "' || project_record.name || '".';
        ELSE
            notification_type := 'project_activity';
            notification_title := 'Projekt-Aktivität';
            notification_message := 'Aktivität in "' || project_record.name || '".';
    END CASE;
    
    -- Benachrichtigungen für Team-Mitglieder erstellen (falls Team-Projekt)
    IF project_record.team_id IS NOT NULL THEN
        FOR team_member IN 
            SELECT tm.user_id 
            FROM team_memberships tm 
            WHERE tm.team_id = project_record.team_id
            AND tm.user_id != p_user_id  -- Ersteller nicht benachrichtigen
        LOOP
            INSERT INTO notifications (
                user_id, type, title, message, from_user_id, 
                team_id, project_id, action_url, created_at
            ) VALUES (
                team_member.user_id, notification_type, notification_title, 
                notification_message, p_user_id, project_record.team_id, 
                p_project_id, '/projects/' || p_project_id, NOW()
            );
        END LOOP;
    END IF;
    
    -- Benachrichtigung für betroffenen Benutzer (falls Zuweisung oder Berechtigung)
    IF p_affected_user_id IS NOT NULL AND p_affected_user_id != p_user_id THEN
        INSERT INTO notifications (
            user_id, type, title, message, from_user_id, 
            team_id, project_id, action_url, created_at
        ) VALUES (
            p_affected_user_id, notification_type, notification_title, 
            notification_message, p_user_id, project_record.team_id, 
            p_project_id, '/projects/' || p_project_id, NOW()
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Funktion zum Erstellen von Benachrichtigungen für Modul-Aktivitäten
CREATE OR REPLACE FUNCTION notify_module_activity(
    p_module_id INTEGER,
    p_module_type VARCHAR(20),
    p_user_id INTEGER,
    p_action_type VARCHAR(50),
    p_action_details JSONB DEFAULT NULL,
    p_affected_user_id INTEGER DEFAULT NULL,
    p_project_id INTEGER DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    module_record RECORD;
    project_record RECORD;
    team_member RECORD;
    notification_title VARCHAR(255);
    notification_message TEXT;
    notification_type VARCHAR(50);
BEGIN
    -- Modul-Details abrufen
    IF p_module_type = 'project' THEN
        SELECT pm.*, p.name as project_name, p.team_id, u.username as assigned_username
        INTO module_record
        FROM project_modules pm
        JOIN projects p ON p.id = pm.project_id
        LEFT JOIN users u ON u.id = pm.assigned_to
        WHERE pm.id = p_module_id;
        
        -- Projekt-Details für Team-Benachrichtigungen
        SELECT p.*, t.name as team_name
        INTO project_record
        FROM projects p
        LEFT JOIN teams t ON t.id = p.team_id
        WHERE p.id = module_record.project_id;
    ELSE
        SELECT sm.*, u.username as assigned_username, t.name as team_name
        INTO module_record
        FROM standalone_modules sm
        LEFT JOIN users u ON u.id = sm.assigned_to
        LEFT JOIN teams t ON t.id = sm.team_id
        WHERE sm.id = p_module_id;
        
        project_record := NULL;
    END IF;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Benachrichtigungstyp und -text basierend auf Aktion bestimmen
    CASE p_action_type
        WHEN 'created' THEN
            notification_type := 'module_activity';
            notification_title := 'Neues Modul erstellt';
            notification_message := '"' || module_record.name || '" wurde erstellt.';
        WHEN 'updated' THEN
            notification_type := 'module_activity';
            notification_title := 'Modul aktualisiert';
            notification_message := '"' || module_record.name || '" wurde aktualisiert.';
        WHEN 'status_changed' THEN
            notification_type := 'module_status_change';
            notification_title := 'Modul-Status geändert';
            notification_message := '"' || module_record.name || '" Status wurde geändert.';
        WHEN 'assigned' THEN
            notification_type := 'module_assignment';
            notification_title := 'Modul zugewiesen';
            notification_message := 'Sie wurden dem Modul "' || module_record.name || '" zugewiesen.';
        WHEN 'permission_granted' THEN
            notification_type := 'module_permission_change';
            notification_title := 'Modul-Berechtigung erhalten';
            notification_message := 'Sie haben neue Berechtigungen für "' || module_record.name || '".';
        ELSE
            notification_type := 'module_activity';
            notification_title := 'Modul-Aktivität';
            notification_message := 'Aktivität in "' || module_record.name || '".';
    END CASE;
    
    -- Benachrichtigungen für Team-Mitglieder erstellen (falls Team-Modul)
    IF module_record.team_id IS NOT NULL THEN
        FOR team_member IN 
            SELECT tm.user_id 
            FROM team_memberships tm 
            WHERE tm.team_id = module_record.team_id
            AND tm.user_id != p_user_id  -- Ersteller nicht benachrichtigen
        LOOP
            INSERT INTO notifications (
                user_id, type, title, message, from_user_id, 
                team_id, project_id, action_url, created_at
            ) VALUES (
                team_member.user_id, notification_type, notification_title, 
                notification_message, p_user_id, module_record.team_id, 
                p_project_id, 
                CASE 
                    WHEN p_module_type = 'project' THEN '/projects/' || p_project_id || '/modules/' || p_module_id
                    ELSE '/modules/' || p_module_id
                END, 
                NOW()
            );
        END LOOP;
    END IF;
    
    -- Benachrichtigung für betroffenen Benutzer (falls Zuweisung oder Berechtigung)
    IF p_affected_user_id IS NOT NULL AND p_affected_user_id != p_user_id THEN
        INSERT INTO notifications (
            user_id, type, title, message, from_user_id, 
            team_id, project_id, action_url, created_at
        ) VALUES (
            p_affected_user_id, notification_type, notification_title, 
            notification_message, p_user_id, module_record.team_id, 
            p_project_id, 
            CASE 
                WHEN p_module_type = 'project' THEN '/projects/' || p_project_id || '/modules/' || p_module_id
                ELSE '/modules/' || p_module_id
            END, 
            NOW()
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- TRIGGER FÜR AUTOMATISCHE AKTIVITÄTSLOGS
-- ==============================================

-- Trigger-Funktion für Projekt-Änderungen
CREATE OR REPLACE FUNCTION trigger_project_activity_log()
RETURNS TRIGGER AS $$
DECLARE
    action_type VARCHAR(50);
    old_values JSONB;
    new_values JSONB;
    action_details JSONB;
BEGIN
    -- Bestimme Aktionstyp
    IF TG_OP = 'INSERT' THEN
        action_type := 'created';
        new_values := to_jsonb(NEW);
        old_values := NULL;
        action_details := jsonb_build_object('project_name', NEW.name);
    ELSIF TG_OP = 'UPDATE' THEN
        action_type := 'updated';
        old_values := to_jsonb(OLD);
        new_values := to_jsonb(NEW);
        
        -- Spezifische Änderungen erkennen
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            action_type := 'status_changed';
            action_details := jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'project_name', NEW.name
            );
        ELSIF OLD.priority IS DISTINCT FROM NEW.priority THEN
            action_type := 'priority_changed';
            action_details := jsonb_build_object(
                'old_priority', OLD.priority,
                'new_priority', NEW.priority,
                'project_name', NEW.name
            );
        ELSE
            action_details := jsonb_build_object('project_name', NEW.name);
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'deleted';
        old_values := to_jsonb(OLD);
        new_values := NULL;
        action_details := jsonb_build_object('project_name', OLD.name);
    END IF;
    
    -- Aktivitätslog erstellen
    PERFORM log_project_activity(
        COALESCE(NEW.id, OLD.id),
        COALESCE(NEW.owner_id, OLD.owner_id),
        action_type,
        action_details,
        old_values,
        new_values
    );
    
    -- Benachrichtigungen senden
    PERFORM notify_project_activity(
        COALESCE(NEW.id, OLD.id),
        COALESCE(NEW.owner_id, OLD.owner_id),
        action_type,
        action_details
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger-Funktion für Modul-Änderungen
CREATE OR REPLACE FUNCTION trigger_module_activity_log()
RETURNS TRIGGER AS $$
DECLARE
    action_type VARCHAR(50);
    old_values JSONB;
    new_values JSONB;
    action_details JSONB;
    module_type VARCHAR(20);
    project_id INTEGER;
BEGIN
    -- Bestimme Modultyp und Projekt-ID
    IF TG_TABLE_NAME = 'project_modules' THEN
        module_type := 'project';
        project_id := COALESCE(NEW.project_id, OLD.project_id);
    ELSE
        module_type := 'standalone';
        project_id := NULL;
    END IF;
    
    -- Bestimme Aktionstyp
    IF TG_OP = 'INSERT' THEN
        action_type := 'created';
        new_values := to_jsonb(NEW);
        old_values := NULL;
        action_details := jsonb_build_object('module_name', NEW.name);
    ELSIF TG_OP = 'UPDATE' THEN
        action_type := 'updated';
        old_values := to_jsonb(OLD);
        new_values := to_jsonb(NEW);
        
        -- Spezifische Änderungen erkennen
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            action_type := 'status_changed';
            action_details := jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'module_name', NEW.name
            );
        ELSIF OLD.priority IS DISTINCT FROM NEW.priority THEN
            action_type := 'priority_changed';
            action_details := jsonb_build_object(
                'old_priority', OLD.priority,
                'new_priority', NEW.priority,
                'module_name', NEW.name
            );
        ELSIF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
            IF OLD.assigned_to IS NULL AND NEW.assigned_to IS NOT NULL THEN
                action_type := 'assigned';
                action_details := jsonb_build_object(
                    'module_name', NEW.name,
                    'assigned_to', NEW.assigned_to
                );
            ELSIF OLD.assigned_to IS NOT NULL AND NEW.assigned_to IS NULL THEN
                action_type := 'unassigned';
                action_details := jsonb_build_object(
                    'module_name', NEW.name,
                    'unassigned_from', OLD.assigned_to
                );
            ELSE
                action_type := 'assigned';
                action_details := jsonb_build_object(
                    'module_name', NEW.name,
                    'assigned_to', NEW.assigned_to,
                    'assigned_from', OLD.assigned_to
                );
            END IF;
        ELSIF OLD.team_id IS DISTINCT FROM NEW.team_id THEN
            action_type := 'team_changed';
            action_details := jsonb_build_object(
                'old_team_id', OLD.team_id,
                'new_team_id', NEW.team_id,
                'module_name', NEW.name
            );
        ELSE
            action_details := jsonb_build_object('module_name', NEW.name);
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'deleted';
        old_values := to_jsonb(OLD);
        new_values := NULL;
        action_details := jsonb_build_object('module_name', OLD.name);
    END IF;
    
    -- Aktivitätslog erstellen
    PERFORM log_module_activity(
        COALESCE(NEW.id, OLD.id),
        module_type,
        COALESCE(NEW.assigned_to, OLD.assigned_to),
        action_type,
        action_details,
        old_values,
        new_values,
        COALESCE(NEW.assigned_to, OLD.assigned_to),
        project_id
    );
    
    -- Benachrichtigungen senden
    PERFORM notify_module_activity(
        COALESCE(NEW.id, OLD.id),
        module_type,
        COALESCE(NEW.assigned_to, OLD.assigned_to),
        action_type,
        action_details,
        COALESCE(NEW.assigned_to, OLD.assigned_to),
        project_id
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger für Projekte
DROP TRIGGER IF EXISTS trigger_project_activity_log_trigger ON projects;
CREATE TRIGGER trigger_project_activity_log_trigger
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION trigger_project_activity_log();

-- Trigger für Projekt-Module
DROP TRIGGER IF EXISTS trigger_project_module_activity_log_trigger ON project_modules;
CREATE TRIGGER trigger_project_module_activity_log_trigger
    AFTER INSERT OR UPDATE OR DELETE ON project_modules
    FOR EACH ROW
    EXECUTE FUNCTION trigger_module_activity_log();

-- Trigger für eigenständige Module
DROP TRIGGER IF EXISTS trigger_standalone_module_activity_log_trigger ON standalone_modules;
CREATE TRIGGER trigger_standalone_module_activity_log_trigger
    AFTER INSERT OR UPDATE OR DELETE ON standalone_modules
    FOR EACH ROW
    EXECUTE FUNCTION trigger_module_activity_log();

-- ==============================================
-- VIEWS FÜR AKTIVITÄTSLOGS
-- ==============================================

-- View für Projekt-Aktivitätslogs mit Benutzerdetails
CREATE OR REPLACE VIEW project_activity_logs_view AS
SELECT 
    pal.id,
    pal.project_id,
    p.name as project_name,
    pal.user_id,
    u.username,
    pal.action_type,
    pal.action_details,
    pal.old_values,
    pal.new_values,
    pal.affected_user_id,
    au.username as affected_username,
    pal.created_at
FROM project_activity_logs pal
JOIN projects p ON p.id = pal.project_id
LEFT JOIN users u ON u.id = pal.user_id
LEFT JOIN users au ON au.id = pal.affected_user_id
ORDER BY pal.created_at DESC;

-- View für Modul-Aktivitätslogs mit Benutzerdetails
CREATE OR REPLACE VIEW module_activity_logs_view AS
SELECT 
    mal.id,
    mal.module_id,
    mal.module_type,
    CASE 
        WHEN mal.module_type = 'project' THEN pm.name
        ELSE sm.name
    END as module_name,
    mal.user_id,
    u.username,
    mal.action_type,
    mal.action_details,
    mal.old_values,
    mal.new_values,
    mal.affected_user_id,
    au.username as affected_username,
    mal.project_id,
    p.name as project_name,
    mal.created_at
FROM module_activity_logs mal
LEFT JOIN project_modules pm ON pm.id = mal.module_id AND mal.module_type = 'project'
LEFT JOIN standalone_modules sm ON sm.id = mal.module_id AND mal.module_type = 'standalone'
LEFT JOIN projects p ON p.id = mal.project_id
LEFT JOIN users u ON u.id = mal.user_id
LEFT JOIN users au ON au.id = mal.affected_user_id
ORDER BY mal.created_at DESC;

-- ==============================================
-- KOMMENTARE
-- ==============================================

COMMENT ON TABLE project_activity_logs IS 'Detaillierte Aktivitätslogs für Projekte mit JSON-Details';
COMMENT ON TABLE module_activity_logs IS 'Detaillierte Aktivitätslogs für Module mit JSON-Details';
COMMENT ON FUNCTION log_project_activity(INTEGER, INTEGER, VARCHAR(50), JSONB, JSONB, JSONB, INTEGER) IS 'Erstellt einen Projekt-Aktivitätslog-Eintrag';
COMMENT ON FUNCTION log_module_activity(INTEGER, VARCHAR(20), INTEGER, VARCHAR(50), JSONB, JSONB, JSONB, INTEGER, INTEGER) IS 'Erstellt einen Modul-Aktivitätslog-Eintrag';
COMMENT ON FUNCTION notify_project_activity(INTEGER, INTEGER, VARCHAR(50), JSONB, INTEGER) IS 'Sendet Benachrichtigungen für Projekt-Aktivitäten';
COMMENT ON FUNCTION notify_module_activity(INTEGER, VARCHAR(20), INTEGER, VARCHAR(50), JSONB, INTEGER, INTEGER) IS 'Sendet Benachrichtigungen für Modul-Aktivitäten';
COMMENT ON VIEW project_activity_logs_view IS 'View für Projekt-Aktivitätslogs mit Benutzerdetails';
COMMENT ON VIEW module_activity_logs_view IS 'View für Modul-Aktivitätslogs mit Benutzerdetails';
