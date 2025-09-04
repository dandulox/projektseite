-- Rollback Patch 007: Entfernung des erweiterten Modul-Systems
-- Rollback von Patch 006: Advanced Module System
-- Erstellt: $(date)

-- Entferne alle Tabellen, die durch das Modul-System erstellt wurden
DROP TABLE IF EXISTS module_team_assignments CASCADE;
DROP TABLE IF EXISTS module_logs CASCADE;
DROP TABLE IF EXISTS module_permissions CASCADE;
DROP TABLE IF EXISTS module_connections CASCADE;
DROP TABLE IF EXISTS standalone_modules CASCADE;

-- Entferne die Funktionen, die durch das Modul-System erstellt wurden
DROP FUNCTION IF EXISTS check_module_permission(INTEGER, INTEGER, VARCHAR(20), VARCHAR(20));
DROP FUNCTION IF EXISTS check_module_dependencies(INTEGER, VARCHAR(20));

-- Entferne die Spalten, die zur project_modules Tabelle hinzugefügt wurden
ALTER TABLE project_modules 
DROP COLUMN IF EXISTS visibility,
DROP COLUMN IF EXISTS team_id,
DROP COLUMN IF EXISTS completion_percentage,
DROP COLUMN IF EXISTS start_date,
DROP COLUMN IF EXISTS tags,
DROP COLUMN IF EXISTS dependencies,
DROP COLUMN IF EXISTS is_template,
DROP COLUMN IF EXISTS template_id;

-- Entferne den Trigger für standalone_modules (falls er noch existiert)
DROP TRIGGER IF EXISTS update_standalone_modules_updated_at ON standalone_modules;

COMMIT;
