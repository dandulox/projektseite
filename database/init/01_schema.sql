-- Projektseite Datenbank Schema - Vollständige Version
-- Erstellt: $(date)
-- Enthält alle Features: Teams, Benachrichtigungen, Module, Fortschritts-Tracking

-- ==============================================
-- HAUPTTABELLEN
-- ==============================================

-- Tasks-System (aus Patch 004)
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES project_modules(id) ON DELETE SET NULL,
    due_date DATE,
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    tags TEXT[],
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Task-Kommentare
CREATE TABLE IF NOT EXISTS task_comments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task-Attachments
CREATE TABLE IF NOT EXISTS task_attachments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task-Aktivitäten
CREATE TABLE IF NOT EXISTS task_activities (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task-Berechtigungen
CREATE TABLE IF NOT EXISTS task_permissions (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    permission_type VARCHAR(20) DEFAULT 'view' CHECK (permission_type IN ('view', 'edit', 'admin')),
    granted_by INTEGER REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, user_id)
);

-- Activity-Logs (aus Patch 002)
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

-- Benutzer-Tabelle
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projekte-Tabelle
CREATE TABLE IF NOT EXISTS projects (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projekt-Module-Tabelle (erweitert)
CREATE TABLE IF NOT EXISTS project_modules (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'testing', 'completed')),
    priority VARCHAR(20) DEFAULT 'medium',
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    assigned_to INTEGER REFERENCES users(id),
    due_date DATE,
    visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'public')),
    team_id INTEGER REFERENCES teams(id),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    start_date DATE,
    tags TEXT[],
    dependencies TEXT[],
    is_template BOOLEAN DEFAULT false,
    template_id INTEGER REFERENCES project_modules(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Design-Einstellungen
CREATE TABLE IF NOT EXISTS design_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json', 'color')),
    category VARCHAR(50) DEFAULT 'general',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Begrüßungen-Tabelle (mit humorvollen Texten)
CREATE TABLE IF NOT EXISTS greetings (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    time_period VARCHAR(20) NOT NULL CHECK (time_period IN ('morning', 'afternoon', 'evening', 'night')),
    hour INTEGER CHECK (hour >= 0 AND hour <= 23),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projekt-Logs
CREATE TABLE IF NOT EXISTS project_logs (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- TEAM-SYSTEM
-- ==============================================

-- Teams-Tabelle
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    team_leader_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team-Mitgliedschaften
CREATE TABLE IF NOT EXISTS team_memberships (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('leader', 'member', 'viewer')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

-- Projekt-Berechtigungen
CREATE TABLE IF NOT EXISTS project_permissions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    permission_type VARCHAR(20) DEFAULT 'view' CHECK (permission_type IN ('view', 'edit', 'admin')),
    granted_by INTEGER REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- ==============================================
-- BENACHRICHTIGUNGSSYSTEM
-- ==============================================

-- Benachrichtigungstypen
CREATE TABLE IF NOT EXISTS notification_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- ==============================================
-- MODUL-SYSTEM (ERWEITERT)
-- ==============================================

-- Eigenständige Module
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

-- Modul-Kreuzverbindungen
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

-- Modul-Berechtigungen
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

-- Modul-Logs
CREATE TABLE IF NOT EXISTS module_logs (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL,
    module_type VARCHAR(20) NOT NULL CHECK (module_type IN ('project', 'standalone')),
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modul-Team-Zuweisungen
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

-- ==============================================
-- INDIZES FÜR PERFORMANCE
-- ==============================================

-- Basis-Indizes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_team ON projects(team_id);
CREATE INDEX IF NOT EXISTS idx_projects_visibility ON projects(visibility);
CREATE INDEX IF NOT EXISTS idx_modules_project ON project_modules(project_id);
CREATE INDEX IF NOT EXISTS idx_modules_status ON project_modules(status);
CREATE INDEX IF NOT EXISTS idx_modules_assigned ON project_modules(assigned_to);
CREATE INDEX IF NOT EXISTS idx_logs_project ON project_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON project_logs(timestamp);

-- Task-Indizes
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_status_due ON tasks(assignee_id, status, due_date);

-- Activity-Log-Indizes
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_project_id ON project_activity_logs (project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_user_id ON project_activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_action_type ON project_activity_logs (action_type);
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_created_at ON project_activity_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_module_activity_logs_module_id ON module_activity_logs (module_id, module_type);
CREATE INDEX IF NOT EXISTS idx_module_activity_logs_user_id ON module_activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_module_activity_logs_action_type ON module_activity_logs (action_type);
CREATE INDEX IF NOT EXISTS idx_module_activity_logs_project_id ON module_activity_logs (project_id);
CREATE INDEX IF NOT EXISTS idx_module_activity_logs_created_at ON module_activity_logs (created_at);

-- Greetings-Indizes
CREATE INDEX IF NOT EXISTS idx_greetings_time_period ON greetings(time_period);
CREATE INDEX IF NOT EXISTS idx_greetings_hour ON greetings(hour);
CREATE INDEX IF NOT EXISTS idx_greetings_active ON greetings(is_active);

-- Team-Indizes
CREATE INDEX IF NOT EXISTS idx_teams_leader ON teams(team_leader_id);
CREATE INDEX IF NOT EXISTS idx_teams_active ON teams(is_active);
CREATE INDEX IF NOT EXISTS idx_team_memberships_team ON team_memberships(team_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_user ON team_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_project_permissions_project ON project_permissions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_permissions_user ON project_permissions(user_id);

-- Benachrichtigungs-Indizes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_team_id ON notifications(team_id);
CREATE INDEX IF NOT EXISTS idx_notifications_project_id ON notifications(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Modul-Indizes
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

-- Fortschritts-Tracking-Indizes
CREATE INDEX IF NOT EXISTS idx_project_modules_status ON project_modules(project_id, status);

-- ==============================================
-- TRIGGER UND FUNKTIONEN
-- ==============================================

-- Trigger-Funktion für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger für updated_at auf allen Tabellen
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON project_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_updated_at BEFORE UPDATE ON design_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_greetings_updated_at BEFORE UPDATE ON greetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_standalone_modules_updated_at BEFORE UPDATE ON standalone_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Task-Trigger
CREATE TRIGGER trigger_update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger für completed_at
CREATE OR REPLACE FUNCTION update_tasks_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = CURRENT_TIMESTAMP;
    ELSIF NEW.status != 'completed' AND OLD.status = 'completed' THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tasks_completed_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_tasks_completed_at();

-- Benachrichtigungs-Trigger
CREATE OR REPLACE FUNCTION update_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_read = true AND OLD.is_read = false THEN
        NEW.read_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_read_trigger
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_read_at();

CREATE OR REPLACE FUNCTION update_user_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_notification_settings_updated_at_trigger
    BEFORE UPDATE ON user_notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_notification_settings_updated_at();

-- ==============================================
-- ACTIVITY-LOG-FUNKTIONEN
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
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger für Projekte
DROP TRIGGER IF EXISTS trigger_project_activity_log_trigger ON projects;
CREATE TRIGGER trigger_project_activity_log_trigger
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION trigger_project_activity_log();

-- ==============================================
-- TASK-FUNKTIONEN
-- ==============================================

-- Funktion: Task-Statistiken für Benutzer abrufen
CREATE OR REPLACE FUNCTION get_user_task_stats(user_id_param INTEGER)
RETURNS TABLE (
    total_tasks BIGINT,
    todo_count BIGINT,
    in_progress_count BIGINT,
    review_count BIGINT,
    completed_count BIGINT,
    overdue_count BIGINT,
    due_soon_count BIGINT,
    avg_completion_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo_count,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN status = 'review' THEN 1 END) as review_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled') THEN 1 END) as overdue_count,
        COUNT(CASE WHEN due_date <= CURRENT_DATE + INTERVAL '3 days' AND status NOT IN ('completed', 'cancelled') THEN 1 END) as due_soon_count,
        AVG(CASE WHEN status = 'completed' AND actual_hours IS NOT NULL THEN actual_hours END) as avg_completion_hours
    FROM tasks
    WHERE assignee_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- FORTSCHRITTS-TRACKING-FUNKTIONEN
-- ==============================================

-- Funktion zur Fortschrittsberechnung
CREATE OR REPLACE FUNCTION calculate_project_progress(project_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    total_modules INTEGER;
    completed_modules INTEGER;
    progress_percentage INTEGER;
BEGIN
    -- Zähle alle Module des Projekts
    SELECT COUNT(*) INTO total_modules
    FROM project_modules 
    WHERE project_modules.project_id = calculate_project_progress.project_id;
    
    -- Wenn keine Module vorhanden sind, Fortschritt = 0%
    IF total_modules = 0 THEN
        RETURN 0;
    END IF;
    
    -- Zähle abgeschlossene Module (Status = 'completed')
    SELECT COUNT(*) INTO completed_modules
    FROM project_modules 
    WHERE project_modules.project_id = calculate_project_progress.project_id 
    AND status = 'completed';
    
    -- Berechne Fortschritt in Prozent (gerundet)
    progress_percentage := ROUND((completed_modules::DECIMAL / total_modules::DECIMAL) * 100);
    
    RETURN progress_percentage;
END;
$$ LANGUAGE plpgsql;

-- Funktion zur automatischen Fortschrittsaktualisierung
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
DECLARE
    project_id INTEGER;
    new_progress INTEGER;
BEGIN
    -- Bestimme die Projekt-ID basierend auf dem Trigger-Kontext
    IF TG_OP = 'DELETE' THEN
        project_id := OLD.project_id;
    ELSE
        project_id := NEW.project_id;
    END IF;
    
    -- Berechne neuen Fortschritt
    new_progress := calculate_project_progress(project_id);
    
    -- Aktualisiere den Fortschritt in der projects-Tabelle
    UPDATE projects 
    SET completion_percentage = new_progress, updated_at = NOW()
    WHERE id = project_id;
    
    -- Gib den entsprechenden Datensatz zurück
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger für automatische Fortschrittsaktualisierung
CREATE TRIGGER trigger_update_progress_on_module_insert
    AFTER INSERT ON project_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_project_progress();

CREATE TRIGGER trigger_update_progress_on_module_update
    AFTER UPDATE ON project_modules
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION update_project_progress();

CREATE TRIGGER trigger_update_progress_on_module_delete
    AFTER DELETE ON project_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_project_progress();

-- ==============================================
-- MODUL-BERECHTIGUNGS-FUNKTIONEN
-- ==============================================

-- Funktion für Modul-Berechtigungen
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

-- ==============================================
-- BENACHRICHTIGUNGS-FUNKTIONEN
-- ==============================================

-- Funktion zum Bereinigen alter Benachrichtigungen
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

-- ==============================================
-- VIEWS
-- ==============================================

-- View für "Meine Aufgaben" mit allen relevanten Informationen
CREATE OR REPLACE VIEW my_tasks_view AS
SELECT 
    t.*,
    p.name as project_name,
    pm.name as module_name,
    u.username as assignee_username,
    u.email as assignee_email,
    creator.username as created_by_username,
    CASE 
        WHEN t.due_date < CURRENT_DATE AND t.status NOT IN ('completed', 'cancelled') THEN true
        ELSE false
    END as is_overdue,
    CASE 
        WHEN t.due_date <= CURRENT_DATE + INTERVAL '3 days' AND t.status NOT IN ('completed', 'cancelled') THEN true
        ELSE false
    END as is_due_soon
FROM tasks t
LEFT JOIN projects p ON p.id = t.project_id
LEFT JOIN project_modules pm ON pm.id = t.module_id
LEFT JOIN users u ON u.id = t.assignee_id
LEFT JOIN users creator ON creator.id = t.created_by;

-- View für Task-Statistiken
CREATE OR REPLACE VIEW task_stats_view AS
SELECT 
    assignee_id,
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo_count,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
    COUNT(CASE WHEN status = 'review' THEN 1 END) as review_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled') THEN 1 END) as overdue_count,
    COUNT(CASE WHEN due_date <= CURRENT_DATE + INTERVAL '3 days' AND status NOT IN ('completed', 'cancelled') THEN 1 END) as due_soon_count,
    AVG(CASE WHEN status = 'completed' AND actual_hours IS NOT NULL THEN actual_hours END) as avg_completion_hours
FROM tasks
WHERE assignee_id IS NOT NULL
GROUP BY assignee_id;

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

-- ==============================================
-- STANDARD-DATEN EINFÜGEN
-- ==============================================

-- Standard-Benachrichtigungstypen
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
('team_update', 'Team wurde aktualisiert'),
-- Erweiterte Activity-Log Benachrichtigungstypen
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

-- Humorvolle Begrüßungen
INSERT INTO greetings (text, time_period, hour, is_active) VALUES
-- Morgens 🌅 (ca. 5–11 Uhr)
('Guten Morgen! Zeit, motiviert zu wirken… mehr wollen wir ja gar nicht.', 'morning', NULL, true),
('Willkommen im Level ‚Ich tue so, als wäre ich wach‘. 🛌', 'morning', NULL, true),
('Kaffee ist fertig. Motivation… noch nicht. ☕', 'morning', NULL, true),
('Dein Projekt wartet schon – genau wie dein Bett. 😏', 'morning', NULL, true),
('Heute ist der perfekte Tag, um Dinge zu erledigen, die du gestern schon verschoben hast.', 'morning', NULL, true),

-- Mittags 🥪 (ca. 11–16 Uhr)
('Mittag! Endlich die Deadline, die wirklich jeder einhält. 🍽️', 'afternoon', NULL, true),
('Der Körper will essen, das Projekt will Fortschritt – eins von beiden gewinnt.', 'afternoon', NULL, true),
('Willkommen im Mittagskoma. Gehirn lädt… bitte warten. 💤', 'afternoon', NULL, true),
('Perfekte Zeit, um To-Dos auf morgen zu verschieben.', 'afternoon', NULL, true),
('Snack-Pause? Klar. Das Projekt kann warten. Wie immer. 🍪', 'afternoon', NULL, true),

-- Abends 🌇 (ca. 16–22 Uhr)
('Abend! Offiziell Feierabend, inoffiziell Panik, weil nichts fertig ist. 🫠', 'evening', NULL, true),
('Heute viel geschafft… also zumindest auf Netflix. 📺', 'evening', NULL, true),
('Perfekte Zeit, Projekte ‚nur noch kurz‘ zu machen. Spoiler: Es wird Mitternacht.', 'evening', NULL, true),
('Deine To-Do-Liste lacht dich aus. Laut. 📜', 'evening', NULL, true),
('Motivation offline. Snacks online. 🍫', 'evening', NULL, true),

-- Nachts 🌙 (ca. 22–5 Uhr)
('Mitternacht. Entweder Genie oder Wahnsinn – wir entscheiden später.', 'night', NULL, true),
('Nachtschicht? Respekt. Oder Existenzkrise? 😅', 'night', NULL, true),
('Alle schlafen, nur du trackst Projekte… und überlegst deine Lebensentscheidungen.', 'night', NULL, true),
('Es gibt zwei Arten von Menschen: die, die jetzt schlafen – und dich. 🦉', 'night', NULL, true),
('Die beste Zeit, um Projekte zu machen. Oder das Leben neu zu überdenken.', 'night', NULL, true)
ON CONFLICT DO NOTHING;

-- ==============================================
-- KOMMENTARE FÜR DOKUMENTATION
-- ==============================================

-- Tabellen-Kommentare
COMMENT ON TABLE users IS 'Benutzer der Anwendung mit Rollen und Berechtigungen';
COMMENT ON TABLE projects IS 'Projekte mit Status, Priorität und Team-Zuordnung';
COMMENT ON TABLE project_modules IS 'Module innerhalb von Projekten mit erweiterten Features';
COMMENT ON TABLE design_settings IS 'Design-Einstellungen für die Anwendung';
COMMENT ON TABLE greetings IS 'Humorvolle Begrüßungen für verschiedene Tageszeiten - Fun-Feature';
COMMENT ON TABLE project_logs IS 'Aktivitäts-Logs für Projekte';
COMMENT ON TABLE teams IS 'Teams für Projektorganisation';
COMMENT ON TABLE team_memberships IS 'Mitgliedschaften von Benutzern in Teams';
COMMENT ON TABLE project_permissions IS 'Erweiterte Berechtigungen für Projekte';
COMMENT ON TABLE notification_types IS 'Definierte Typen von Benachrichtigungen';
COMMENT ON TABLE notifications IS 'Benachrichtigungen für Benutzer';
COMMENT ON TABLE user_notification_settings IS 'Benachrichtigungseinstellungen pro Benutzer';
COMMENT ON TABLE standalone_modules IS 'Eigenständige Module, die nicht an Projekte gebunden sind';
COMMENT ON TABLE module_connections IS 'Kreuzverbindungen zwischen Modulen (Abhängigkeiten, Blocker, etc.)';
COMMENT ON TABLE module_permissions IS 'Explizite Berechtigungen für Module';
COMMENT ON TABLE module_logs IS 'Aktivitäts-Logs für Module';
COMMENT ON TABLE module_team_assignments IS 'Team-Zuweisungen für Module';
-- Task-System Kommentare
COMMENT ON TABLE tasks IS 'Haupttabelle für Tasks/Aufgaben';
COMMENT ON TABLE task_comments IS 'Kommentare zu Tasks';
COMMENT ON TABLE task_attachments IS 'Datei-Anhänge zu Tasks';
COMMENT ON TABLE task_activities IS 'Aktivitäts-Logs für Tasks';
COMMENT ON TABLE task_permissions IS 'Berechtigungen für Tasks';
-- Activity-Log Kommentare
COMMENT ON TABLE project_activity_logs IS 'Detaillierte Aktivitätslogs für Projekte mit JSON-Details';
COMMENT ON TABLE module_activity_logs IS 'Detaillierte Aktivitätslogs für Module mit JSON-Details';

-- Spalten-Kommentare
COMMENT ON COLUMN greetings.text IS 'Der humorvolle Begrüßungstext';
COMMENT ON COLUMN greetings.time_period IS 'Tageszeit (morning, afternoon, evening, night)';
COMMENT ON COLUMN greetings.hour IS 'Spezifische Stunde (0-23) oder NULL für gesamte Tageszeit';
COMMENT ON COLUMN greetings.is_active IS 'Ob die Begrüßung aktiv ist';
COMMENT ON COLUMN projects.team_id IS 'Team, dem das Projekt zugeordnet ist';
COMMENT ON COLUMN projects.visibility IS 'Sichtbarkeit des Projekts (private, team, public)';
COMMENT ON COLUMN module_connections.connection_type IS 'Art der Verbindung: depends_on, blocks, related_to, duplicates, supersedes';
COMMENT ON COLUMN module_permissions.permission_type IS 'Berechtigungstyp: view, edit, admin';
COMMENT ON COLUMN module_team_assignments.role IS 'Rolle des Teams im Modul: leader, member, viewer';

-- Funktions-Kommentare
COMMENT ON FUNCTION calculate_project_progress(INTEGER) IS 'Berechnet den Fortschritt eines Projekts basierend auf abgeschlossenen Modulen';
COMMENT ON FUNCTION update_project_progress() IS 'Trigger-Funktion zur automatischen Fortschrittsaktualisierung';
COMMENT ON FUNCTION check_module_permission(INTEGER, INTEGER, VARCHAR(20), VARCHAR(20)) IS 'Prüft Berechtigungen für Module basierend auf Benutzer, Team und expliziten Berechtigungen';
COMMENT ON FUNCTION cleanup_old_notifications() IS 'Bereinigt alte gelesene Benachrichtigungen (älter als 30 Tage)';
-- Activity-Log Funktions-Kommentare
COMMENT ON FUNCTION log_project_activity(INTEGER, INTEGER, VARCHAR(50), JSONB, JSONB, JSONB, INTEGER) IS 'Erstellt einen Projekt-Aktivitätslog-Eintrag';
COMMENT ON FUNCTION log_module_activity(INTEGER, VARCHAR(20), INTEGER, VARCHAR(50), JSONB, JSONB, JSONB, INTEGER, INTEGER) IS 'Erstellt einen Modul-Aktivitätslog-Eintrag';
COMMENT ON FUNCTION trigger_project_activity_log() IS 'Trigger-Funktion für automatische Projekt-Aktivitätslogs';
-- Task-Funktions-Kommentare
COMMENT ON FUNCTION get_user_task_stats(INTEGER) IS 'Gibt Task-Statistiken für einen Benutzer zurück';
COMMENT ON FUNCTION update_tasks_completed_at() IS 'Trigger-Funktion zur automatischen completed_at-Aktualisierung';

-- View-Kommentare
COMMENT ON VIEW my_tasks_view IS 'View für "Meine Aufgaben" mit allen relevanten Informationen';
COMMENT ON VIEW task_stats_view IS 'View für Task-Statistiken pro Benutzer';
COMMENT ON VIEW project_activity_logs_view IS 'View für Projekt-Aktivitätslogs mit Benutzerdetails';
COMMENT ON VIEW module_activity_logs_view IS 'View für Modul-Aktivitätslogs mit Benutzerdetails';

-- Trigger-Kommentare
COMMENT ON TRIGGER trigger_update_progress_on_module_insert ON project_modules IS 'Aktualisiert Projektfortschritt beim Hinzufügen neuer Module';
COMMENT ON TRIGGER trigger_update_progress_on_module_update ON project_modules IS 'Aktualisiert Projektfortschritt bei Statusänderungen von Modulen';
COMMENT ON TRIGGER trigger_update_progress_on_module_delete ON project_modules IS 'Aktualisiert Projektfortschritt beim Löschen von Modulen';
COMMENT ON TRIGGER trigger_project_activity_log_trigger ON projects IS 'Erstellt automatisch Activity-Logs für Projekt-Änderungen';
COMMENT ON TRIGGER trigger_update_tasks_updated_at ON tasks IS 'Aktualisiert updated_at bei Task-Änderungen';
COMMENT ON TRIGGER trigger_update_tasks_completed_at ON tasks IS 'Aktualisiert completed_at bei Status-Änderungen';

-- ==============================================
-- HINWEISE
-- ==============================================

-- Standard-Benutzer werden über das Initialisierungsskript erstellt
-- Siehe: backend/scripts/create-default-users.js
-- 
-- Standard-Zugangsdaten:
-- Admin: admin / admin
-- User: user / user123

-- Standard-Benachrichtigungseinstellungen werden automatisch für neue Benutzer erstellt
-- über die Funktion in den Benachrichtigungs-APIs

-- ========================================
-- VERSIONSVERWALTUNG
-- ========================================

-- Tabelle für Versionsverwaltung
CREATE TABLE IF NOT EXISTS system_versions (
    id SERIAL PRIMARY KEY,
    major_version INTEGER NOT NULL,
    minor_version INTEGER, -- Changed to allow NULL
    patch_version INTEGER, -- Changed to allow NULL
    version_type VARCHAR(20) DEFAULT 'major' CHECK (version_type IN ('major', 'minor', 'patch')),
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

-- Initiale Version einfügen
INSERT INTO system_versions (major_version, minor_version, patch_version, version_type, codename, release_date, changes, is_current)
VALUES (2, 1, 0, 'major', 'Stabilisator', '2024-12-19', 'Major Release mit vollständiger Projektverwaltung, Modulverwaltung, Team-Management, Benachrichtigungssystem, Fortschrittsverfolgung, Design-System, Mobile-Optimierung, Task-Management, Kanban-Board, Deadlines und Activity-Logs', true)
ON CONFLICT DO NOTHING;

-- Alle Features sind vollständig integriert:
-- ✅ Team-System mit Berechtigungen
-- ✅ Benachrichtigungssystem mit Einstellungen
-- ✅ Erweiterte Modulverwaltung
-- ✅ Automatisches Fortschritts-Tracking
-- ✅ Humorvolle Begrüßungen
-- ✅ Umfassende Berechtigungsprüfung
-- ✅ Versionsverwaltung mit Datenbank-Integration
-- ✅ Task-Management-System
-- ✅ Kanban-Board-Funktionalität
-- ✅ Deadlines und Fälligkeitsverfolgung
-- ✅ Activity-Logs für Projekte und Module
-- ✅ Erweiterte Benachrichtigungstypen
-- ✅ Task-Statistiken und Views