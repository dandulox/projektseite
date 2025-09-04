-- Modulverwaltungs-System
-- Patch 008: Module Management System
-- Erstellt: $(date)

-- Stelle sicher, dass die project_modules Tabelle alle notwendigen Spalten hat
ALTER TABLE project_modules 
ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'public')),
ADD COLUMN IF NOT EXISTS team_id INTEGER REFERENCES teams(id),
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS dependencies TEXT[],
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS template_id INTEGER REFERENCES project_modules(id);

-- Erstelle Tabelle für eigenständige Module (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS standalone_modules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    start_date DATE,
    target_date DATE,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    owner_id INTEGER REFERENCES users(id),
    team_id INTEGER REFERENCES teams(id),
    visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'public')),
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    assigned_to INTEGER REFERENCES users(id),
    tags TEXT[],
    dependencies TEXT[],
    is_template BOOLEAN DEFAULT false,
    template_id INTEGER REFERENCES standalone_modules(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Erstelle Tabelle für Modul-Kreuzverbindungen (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS module_connections (
    id SERIAL PRIMARY KEY,
    source_module_id INTEGER NOT NULL,
    source_module_type VARCHAR(20) NOT NULL CHECK (source_module_type IN ('project', 'standalone')),
    target_module_id INTEGER NOT NULL,
    target_module_type VARCHAR(20) NOT NULL CHECK (target_module_type IN ('project', 'standalone')),
    connection_type VARCHAR(50) NOT NULL CHECK (connection_type IN ('depends_on', 'blocks', 'related_to', 'duplicates', 'supersedes')),
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_module_id, source_module_type, target_module_id, target_module_type, connection_type)
);

-- Erstelle Tabelle für Modul-Berechtigungen (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS module_permissions (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL,
    module_type VARCHAR(20) NOT NULL CHECK (module_type IN ('project', 'standalone')),
    user_id INTEGER REFERENCES users(id),
    permission_type VARCHAR(20) NOT NULL CHECK (permission_type IN ('view', 'edit', 'admin')),
    granted_by INTEGER REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(module_id, module_type, user_id)
);

-- Erstelle Tabelle für Modul-Logs (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS module_logs (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL,
    module_type VARCHAR(20) NOT NULL CHECK (module_type IN ('project', 'standalone')),
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Erstelle Tabelle für Modul-Team-Zuweisungen (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS module_team_assignments (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL,
    module_type VARCHAR(20) NOT NULL CHECK (module_type IN ('project', 'standalone')),
    team_id INTEGER REFERENCES teams(id),
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('leader', 'member', 'viewer')),
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(module_id, module_type, team_id)
);

-- Erstelle Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_standalone_modules_status ON standalone_modules(status);
CREATE INDEX IF NOT EXISTS idx_standalone_modules_owner ON standalone_modules(owner_id);
CREATE INDEX IF NOT EXISTS idx_standalone_modules_team ON standalone_modules(team_id);
CREATE INDEX IF NOT EXISTS idx_standalone_modules_assigned ON standalone_modules(assigned_to);
CREATE INDEX IF NOT EXISTS idx_module_connections_source ON module_connections(source_module_id, source_module_type);
CREATE INDEX IF NOT EXISTS idx_module_connections_target ON module_connections(target_module_id, target_module_type);
CREATE INDEX IF NOT EXISTS idx_module_permissions_module ON module_permissions(module_id, module_type);
CREATE INDEX IF NOT EXISTS idx_module_permissions_user ON module_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_module_logs_module ON module_logs(module_id, module_type);
CREATE INDEX IF NOT EXISTS idx_module_logs_timestamp ON module_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_module_team_assignments_module ON module_team_assignments(module_id, module_type);
CREATE INDEX IF NOT EXISTS idx_module_team_assignments_team ON module_team_assignments(team_id);

-- Trigger für updated_at
CREATE TRIGGER IF NOT EXISTS update_standalone_modules_updated_at BEFORE UPDATE ON standalone_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funktionen für Modul-Berechtigungen
CREATE OR REPLACE FUNCTION check_module_permission(
    p_user_id INTEGER,
    p_module_id INTEGER,
    p_module_type VARCHAR(20),
    p_required_permission VARCHAR(20) DEFAULT 'view'
) RETURNS BOOLEAN AS $$
DECLARE
    user_role VARCHAR(20);
    module_owner_id INTEGER;
    module_team_id INTEGER;
    team_role VARCHAR(20);
    explicit_permission VARCHAR(20);
BEGIN
    -- Admin hat immer Zugriff
    SELECT role INTO user_role FROM users WHERE id = p_user_id;
    IF user_role = 'admin' THEN
        RETURN TRUE;
    END IF;

    -- Modul-Details abrufen
    IF p_module_type = 'project' THEN
        SELECT owner_id, team_id INTO module_owner_id, module_team_id 
        FROM project_modules pm 
        JOIN projects p ON p.id = pm.project_id 
        WHERE pm.id = p_module_id;
    ELSE
        SELECT owner_id, team_id INTO module_owner_id, module_team_id 
        FROM standalone_modules WHERE id = p_module_id;
    END IF;

    -- Eigentümer hat immer Zugriff
    IF module_owner_id = p_user_id THEN
        RETURN TRUE;
    END IF;

    -- Prüfe Team-Berechtigung
    IF module_team_id IS NOT NULL THEN
        SELECT tm.role INTO team_role
        FROM team_memberships tm
        WHERE tm.team_id = module_team_id AND tm.user_id = p_user_id;

        IF team_role IS NOT NULL THEN
            IF team_role = 'leader' AND p_required_permission != 'admin' THEN
                RETURN TRUE;
            END IF;
            IF team_role = 'member' AND p_required_permission IN ('view', 'edit') THEN
                RETURN TRUE;
            END IF;
            IF team_role = 'viewer' AND p_required_permission = 'view' THEN
                RETURN TRUE;
            END IF;
        END IF;
    END IF;

    -- Prüfe explizite Modul-Berechtigungen
    SELECT permission_type INTO explicit_permission
    FROM module_permissions
    WHERE module_id = p_module_id AND module_type = p_module_type AND user_id = p_user_id;

    IF explicit_permission IS NOT NULL THEN
        IF explicit_permission = 'admin' THEN
            RETURN TRUE;
        END IF;
        IF explicit_permission = 'edit' AND p_required_permission IN ('view', 'edit') THEN
            RETURN TRUE;
        END IF;
        IF explicit_permission = 'view' AND p_required_permission = 'view' THEN
            RETURN TRUE;
        END IF;
    END IF;

    -- Prüfe Sichtbarkeit
    IF p_required_permission = 'view' THEN
        IF p_module_type = 'project' THEN
            SELECT visibility INTO explicit_permission
            FROM project_modules WHERE id = p_module_id;
        ELSE
            SELECT visibility INTO explicit_permission
            FROM standalone_modules WHERE id = p_module_id;
        END IF;
        
        IF explicit_permission = 'public' THEN
            RETURN TRUE;
        END IF;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Kommentare für Dokumentation
COMMENT ON TABLE standalone_modules IS 'Eigenständige Module, die nicht an Projekte gebunden sind';
COMMENT ON TABLE module_connections IS 'Kreuzverbindungen zwischen Modulen (Abhängigkeiten, Blocker, etc.)';
COMMENT ON TABLE module_permissions IS 'Explizite Berechtigungen für Module';
COMMENT ON TABLE module_logs IS 'Aktivitäts-Logs für Module';
COMMENT ON TABLE module_team_assignments IS 'Team-Zuweisungen für Module';

COMMENT ON COLUMN module_connections.connection_type IS 'Art der Verbindung: depends_on, blocks, related_to, duplicates, supersedes';
COMMENT ON COLUMN module_permissions.permission_type IS 'Berechtigungstyp: view, edit, admin';
COMMENT ON COLUMN module_team_assignments.role IS 'Rolle des Teams im Modul: leader, member, viewer';

-- Beispiel-Module für Tests
INSERT INTO project_modules (project_id, name, description, status, priority, estimated_hours, assigned_to, due_date, visibility, tags, dependencies)
SELECT 
    p.id,
    'Frontend-Entwicklung',
    'Entwicklung der Benutzeroberfläche',
    'in_progress',
    'high',
    40.0,
    u.id,
    CURRENT_DATE + INTERVAL '2 weeks',
    'private',
    ARRAY['frontend', 'react', 'ui'],
    ARRAY['Design-Phase']
FROM projects p, users u
WHERE p.name LIKE '%Test%' AND u.username = 'user'
LIMIT 1;

INSERT INTO project_modules (project_id, name, description, status, priority, estimated_hours, assigned_to, due_date, visibility, tags, dependencies)
SELECT 
    p.id,
    'Backend-API',
    'Entwicklung der REST-API',
    'not_started',
    'medium',
    60.0,
    u.id,
    CURRENT_DATE + INTERVAL '3 weeks',
    'private',
    ARRAY['backend', 'api', 'nodejs'],
    ARRAY['Datenbank-Design']
FROM projects p, users u
WHERE p.name LIKE '%Test%' AND u.username = 'admin'
LIMIT 1;

-- Log-Einträge für die Beispiel-Module
INSERT INTO module_logs (module_id, module_type, user_id, action, details)
SELECT 
    pm.id,
    'project',
    pm.assigned_to,
    'created',
    'Modul erstellt'
FROM project_modules pm
WHERE pm.name IN ('Frontend-Entwicklung', 'Backend-API');

-- Aktualisiere die Projekt-Fortschritte basierend auf Modulen
UPDATE projects 
SET completion_percentage = (
    SELECT COALESCE(AVG(pm.completion_percentage), 0)
    FROM project_modules pm
    WHERE pm.project_id = projects.id
)
WHERE id IN (SELECT DISTINCT project_id FROM project_modules);

-- Erfolgreiche Installation melden
INSERT INTO project_logs (project_id, user_id, action, details)
SELECT 
    p.id,
    u.id,
    'system_update',
    'Modulverwaltungs-System erfolgreich installiert (Patch 008)'
FROM projects p, users u
WHERE u.username = 'admin'
LIMIT 1;
