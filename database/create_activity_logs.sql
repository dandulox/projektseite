-- Einfache Erstellung der Aktivitätslog-Tabellen
-- Führen Sie diese Datei direkt in der PostgreSQL-Datenbank aus

-- Erstelle project_activity_logs Tabelle
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

-- Erstelle Indizes für project_activity_logs
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_project_id ON project_activity_logs (project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_user_id ON project_activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_action_type ON project_activity_logs (action_type);
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_created_at ON project_activity_logs (created_at);

-- Erstelle module_activity_logs Tabelle
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

-- Erstelle Indizes für module_activity_logs
CREATE INDEX IF NOT EXISTS idx_module_activity_logs_module_id ON module_activity_logs (module_id, module_type);
CREATE INDEX IF NOT EXISTS idx_module_activity_logs_user_id ON module_activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_module_activity_logs_action_type ON module_activity_logs (action_type);
CREATE INDEX IF NOT EXISTS idx_module_activity_logs_project_id ON module_activity_logs (project_id);
CREATE INDEX IF NOT EXISTS idx_module_activity_logs_created_at ON module_activity_logs (created_at);

-- Erstelle Benachrichtigungstypen
INSERT INTO notification_types (name, description) VALUES
('project_created', 'Neues Projekt erstellt'),
('project_updated', 'Projekt aktualisiert'),
('project_activity', 'Allgemeine Projekt-Aktivität'),
('project_status_change', 'Projekt-Statusänderung'),
('project_assignment', 'Projekt-Zuweisung'),
('project_permission_change', 'Projekt-Berechtigungsänderung'),
('module_activity', 'Allgemeine Modul-Aktivität'),
('module_status_change', 'Modul-Statusänderung'),
('module_assignment', 'Modul-Zuweisung'),
('module_permission_change', 'Modul-Berechtigungsänderung')
ON CONFLICT (name) DO NOTHING;

-- Erstelle Aktivitätslog-Funktionen
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

-- Erfolgsmeldung
SELECT 'Aktivitätslog-Tabellen und Funktionen erfolgreich erstellt!' as message;
