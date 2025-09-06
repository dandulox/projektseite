-- Tasks System - Patch 004
-- Erstellt: 2024-12-19
-- Beschreibung: Implementierung des Tasks-Systems für "Meine Aufgaben"

-- ==============================================
-- TASKS SYSTEM
-- ==============================================

-- Tasks-Tabelle
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

-- Task-Aktivitäten (für Activity Log)
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

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at);

-- Composite Index für "Meine Aufgaben" Query
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_status_due ON tasks(assignee_id, status, due_date);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_tasks_updated_at();

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

-- ==============================================
-- DEMO DATA
-- ==============================================

-- Demo-Tasks für verschiedene Benutzer
INSERT INTO tasks (title, description, status, priority, assignee_id, project_id, due_date, estimated_hours, tags, created_by) VALUES
-- Admin Tasks
('Dashboard Design überarbeiten', 'Das Dashboard-Design modernisieren und responsive machen', 'in_progress', 'high', 1, 1, '2024-12-25', 8.0, ARRAY['design', 'frontend', 'ui'], 1),
('API-Dokumentation erstellen', 'Vollständige API-Dokumentation für alle Endpunkte', 'todo', 'medium', 1, 1, '2024-12-30', 12.0, ARRAY['documentation', 'api'], 1),
('Sicherheitsaudit durchführen', 'Umfassende Sicherheitsprüfung der Anwendung', 'todo', 'critical', 1, 1, '2025-01-15', 16.0, ARRAY['security', 'audit'], 1),

-- User Tasks
('Benutzerregistrierung testen', 'Alle Registrierungsflows testen und dokumentieren', 'completed', 'medium', 2, 1, '2024-12-20', 4.0, ARRAY['testing', 'registration'], 1),
('Login-Formular validieren', 'Client- und Server-seitige Validierung implementieren', 'in_progress', 'high', 2, 1, '2024-12-22', 6.0, ARRAY['validation', 'forms'], 1),
('Passwort-Reset implementieren', 'Passwort-Reset-Funktionalität hinzufügen', 'todo', 'medium', 2, 1, '2024-12-28', 8.0, ARRAY['auth', 'password'], 1),

-- Team Tasks
('Team-Management erweitern', 'Erweiterte Team-Funktionen implementieren', 'todo', 'medium', 3, 1, '2025-01-05', 10.0, ARRAY['teams', 'management'], 1),
('Berechtigungssystem überarbeiten', 'Granulare Berechtigungen implementieren', 'review', 'high', 3, 1, '2024-12-24', 14.0, ARRAY['permissions', 'security'], 1),
('Team-Dashboard erstellen', 'Spezifisches Dashboard für Team-Leads', 'todo', 'low', 3, 1, '2025-01-10', 12.0, ARRAY['dashboard', 'teams'], 1),

-- Overdue Tasks
('Legacy Code refactoring', 'Alten Code modernisieren und optimieren', 'in_progress', 'high', 1, 1, '2024-12-15', 20.0, ARRAY['refactoring', 'legacy'], 1),
('Performance-Optimierung', 'Datenbankabfragen und Frontend-Performance optimieren', 'todo', 'medium', 2, 1, '2024-12-18', 16.0, ARRAY['performance', 'optimization'], 1),

-- Future Tasks
('Mobile App entwickeln', 'React Native App für mobile Geräte', 'todo', 'low', 1, 1, '2025-02-01', 40.0, ARRAY['mobile', 'react-native'], 1),
('CI/CD Pipeline einrichten', 'Automatisierte Tests und Deployment', 'todo', 'medium', 2, 1, '2025-01-20', 24.0, ARRAY['ci-cd', 'devops'], 1),
('Monitoring Dashboard', 'Grafana-Dashboard für System-Monitoring', 'todo', 'low', 3, 1, '2025-01-25', 18.0, ARRAY['monitoring', 'grafana'], 1);

-- Demo-Kommentare
INSERT INTO task_comments (task_id, user_id, comment) VALUES
(1, 1, 'Design-Entwurf ist fertig, kann mit der Implementierung beginnen'),
(1, 2, 'Sehr gut! Welche Farbpalette soll verwendet werden?'),
(2, 1, 'Swagger/OpenAPI Schema ist bereits vorbereitet'),
(4, 2, 'Alle Tests bestanden, Registrierung funktioniert einwandfrei'),
(5, 1, 'Server-seitige Validierung ist implementiert, Client-seitig noch ausstehend'),
(8, 3, 'Berechtigungssystem ist sehr komplex, brauche mehr Zeit für die Implementierung');

-- Demo-Aktivitäten
INSERT INTO task_activities (task_id, user_id, action, details, old_values, new_values) VALUES
(1, 1, 'status_changed', 'Status von todo auf in_progress geändert', '{"status": "todo"}', '{"status": "in_progress"}'),
(1, 1, 'priority_changed', 'Priorität auf high gesetzt', '{"priority": "medium"}', '{"priority": "high"}'),
(4, 2, 'status_changed', 'Task als completed markiert', '{"status": "in_progress"}', '{"status": "completed"}'),
(5, 1, 'assigned', 'Task an User 2 zugewiesen', '{"assignee_id": null}', '{"assignee_id": 2}'),
(8, 3, 'status_changed', 'Status auf review gesetzt', '{"status": "in_progress"}', '{"status": "review"}');

-- ==============================================
-- BERECHTIGUNGEN
-- ==============================================

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

-- ==============================================
-- VIEWS FÜR PERFORMANCE
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

-- ==============================================
-- FUNKTIONEN
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
        COALESCE(ts.total_tasks, 0),
        COALESCE(ts.todo_count, 0),
        COALESCE(ts.in_progress_count, 0),
        COALESCE(ts.review_count, 0),
        COALESCE(ts.completed_count, 0),
        COALESCE(ts.overdue_count, 0),
        COALESCE(ts.due_soon_count, 0),
        COALESCE(ts.avg_completion_hours, 0)
    FROM task_stats_view ts
    WHERE ts.assignee_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Funktion: Tasks für Benutzer mit Filterung und Pagination
CREATE OR REPLACE FUNCTION get_user_tasks(
    user_id_param INTEGER,
    status_filter VARCHAR DEFAULT NULL,
    priority_filter VARCHAR DEFAULT NULL,
    project_filter INTEGER DEFAULT NULL,
    search_term VARCHAR DEFAULT NULL,
    sort_by VARCHAR DEFAULT 'due_date',
    sort_order VARCHAR DEFAULT 'ASC',
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id INTEGER,
    title VARCHAR,
    description TEXT,
    status VARCHAR,
    priority VARCHAR,
    assignee_id INTEGER,
    project_id INTEGER,
    module_id INTEGER,
    due_date DATE,
    estimated_hours DECIMAL,
    actual_hours DECIMAL,
    tags TEXT[],
    created_by INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    completed_at TIMESTAMP,
    project_name VARCHAR,
    module_name VARCHAR,
    assignee_username VARCHAR,
    assignee_email VARCHAR,
    created_by_username VARCHAR,
    is_overdue BOOLEAN,
    is_due_soon BOOLEAN
) AS $$
DECLARE
    query_text TEXT;
    where_conditions TEXT[] := ARRAY['t.assignee_id = $1'];
    param_count INTEGER := 1;
BEGIN
    -- Basis-Query
    query_text := '
        SELECT 
            t.id, t.title, t.description, t.status, t.priority, t.assignee_id, t.project_id, t.module_id,
            t.due_date, t.estimated_hours, t.actual_hours, t.tags, t.created_by, t.created_at, t.updated_at, t.completed_at,
            p.name as project_name, pm.name as module_name, u.username as assignee_username, u.email as assignee_email,
            creator.username as created_by_username,
            CASE WHEN t.due_date < CURRENT_DATE AND t.status NOT IN (''completed'', ''cancelled'') THEN true ELSE false END as is_overdue,
            CASE WHEN t.due_date <= CURRENT_DATE + INTERVAL ''3 days'' AND t.status NOT IN (''completed'', ''cancelled'') THEN true ELSE false END as is_due_soon
        FROM tasks t
        LEFT JOIN projects p ON p.id = t.project_id
        LEFT JOIN project_modules pm ON pm.id = t.module_id
        LEFT JOIN users u ON u.id = t.assignee_id
        LEFT JOIN users creator ON creator.id = t.created_by
        WHERE ' || array_to_string(where_conditions, ' AND ');
    
    -- Filter hinzufügen
    IF status_filter IS NOT NULL THEN
        param_count := param_count + 1;
        query_text := query_text || ' AND t.status = $' || param_count;
    END IF;
    
    IF priority_filter IS NOT NULL THEN
        param_count := param_count + 1;
        query_text := query_text || ' AND t.priority = $' || param_count;
    END IF;
    
    IF project_filter IS NOT NULL THEN
        param_count := param_count + 1;
        query_text := query_text || ' AND t.project_id = $' || param_count;
    END IF;
    
    IF search_term IS NOT NULL THEN
        param_count := param_count + 1;
        query_text := query_text || ' AND (t.title ILIKE $' || param_count || ' OR t.description ILIKE $' || param_count || ')';
    END IF;
    
    -- Sorting
    query_text := query_text || ' ORDER BY t.' || sort_by || ' ' || sort_order;
    
    -- Pagination
    param_count := param_count + 1;
    query_text := query_text || ' LIMIT $' || param_count;
    param_count := param_count + 1;
    query_text := query_text || ' OFFSET $' || param_count;
    
    -- Query ausführen
    RETURN QUERY EXECUTE query_text 
    USING user_id_param, status_filter, priority_filter, project_filter, search_term, limit_count, offset_count;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- KOMMENTARE
-- ==============================================

COMMENT ON TABLE tasks IS 'Haupttabelle für Tasks/Aufgaben';
COMMENT ON COLUMN tasks.status IS 'Aktueller Status der Aufgabe';
COMMENT ON COLUMN tasks.priority IS 'Priorität der Aufgabe';
COMMENT ON COLUMN tasks.assignee_id IS 'Zugewiesener Benutzer (NULL = unzugewiesen)';
COMMENT ON COLUMN tasks.due_date IS 'Fälligkeitsdatum (NULL = kein Fälligkeitsdatum)';
COMMENT ON COLUMN tasks.estimated_hours IS 'Geschätzte Arbeitsstunden';
COMMENT ON COLUMN tasks.actual_hours IS 'Tatsächliche Arbeitsstunden';
COMMENT ON COLUMN tasks.tags IS 'Tags zur Kategorisierung';
COMMENT ON COLUMN tasks.completed_at IS 'Zeitstempel der Fertigstellung (automatisch gesetzt)';

COMMENT ON VIEW my_tasks_view IS 'View für "Meine Aufgaben" mit allen relevanten Informationen';
COMMENT ON VIEW task_stats_view IS 'View für Task-Statistiken pro Benutzer';
COMMENT ON FUNCTION get_user_task_stats(INTEGER) IS 'Gibt Task-Statistiken für einen Benutzer zurück';
COMMENT ON FUNCTION get_user_tasks(INTEGER, VARCHAR, VARCHAR, INTEGER, VARCHAR, VARCHAR, VARCHAR, INTEGER, INTEGER) IS 'Gibt gefilterte und paginierte Tasks für einen Benutzer zurück';
