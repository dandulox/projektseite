-- Team-Funktionalität hinzufügen
-- Patch: 004_team_functionality.sql
-- Beschreibung: Fügt Team-Management und erweiterte Projekt-Berechtigungen hinzu

-- Teams Tabelle erstellen
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    team_leader_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team-Mitgliedschaften Tabelle
CREATE TABLE IF NOT EXISTS team_memberships (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('leader', 'member', 'viewer')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

-- Projekte erweitern um Team-Zugehörigkeit
ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_id INTEGER REFERENCES teams(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'public'));

-- Projekt-Berechtigungen Tabelle für erweiterte Zugriffskontrolle
CREATE TABLE IF NOT EXISTS project_permissions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    permission_type VARCHAR(20) DEFAULT 'view' CHECK (permission_type IN ('view', 'edit', 'admin')),
    granted_by INTEGER REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_teams_leader ON teams(team_leader_id);
CREATE INDEX IF NOT EXISTS idx_teams_active ON teams(is_active);
CREATE INDEX IF NOT EXISTS idx_team_memberships_team ON team_memberships(team_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_user ON team_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_team ON projects(team_id);
CREATE INDEX IF NOT EXISTS idx_projects_visibility ON projects(visibility);
CREATE INDEX IF NOT EXISTS idx_project_permissions_project ON project_permissions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_permissions_user ON project_permissions(user_id);

-- Trigger für updated_at auf teams
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Standard-Team erstellen (für bestehende Benutzer)
INSERT INTO teams (name, description, team_leader_id) 
SELECT 'Standard Team', 'Standard-Team für alle Benutzer', id 
FROM users 
WHERE role = 'admin' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Alle bestehenden Benutzer zum Standard-Team hinzufügen
INSERT INTO team_memberships (team_id, user_id, role)
SELECT 
    t.id as team_id,
    u.id as user_id,
    CASE 
        WHEN u.role = 'admin' THEN 'leader'
        ELSE 'member'
    END as role
FROM teams t
CROSS JOIN users u
WHERE t.name = 'Standard Team'
ON CONFLICT (team_id, user_id) DO NOTHING;

-- Bestehende Projekte dem Standard-Team zuweisen
UPDATE projects 
SET team_id = (SELECT id FROM teams WHERE name = 'Standard Team' LIMIT 1),
    visibility = 'team'
WHERE team_id IS NULL;

-- Kommentar hinzufügen
COMMENT ON TABLE teams IS 'Teams für Projektorganisation';
COMMENT ON TABLE team_memberships IS 'Mitgliedschaften von Benutzern in Teams';
COMMENT ON TABLE project_permissions IS 'Erweiterte Berechtigungen für Projekte';
COMMENT ON COLUMN projects.team_id IS 'Team, dem das Projekt zugeordnet ist';
COMMENT ON COLUMN projects.visibility IS 'Sichtbarkeit des Projekts (private, team, public)';
