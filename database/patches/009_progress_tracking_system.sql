-- Fortschritts-Tracking-System
-- Patch: 009_progress_tracking_system.sql
-- Beschreibung: Implementiert automatische Fortschrittsberechnung für Projekte basierend auf Modulen

-- 1. Stelle sicher, dass das completion_percentage Feld existiert (falls es noch nicht existiert)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'completion_percentage'
    ) THEN
        ALTER TABLE projects ADD COLUMN completion_percentage INTEGER DEFAULT 0 
        CHECK (completion_percentage >= 0 AND completion_percentage <= 100);
    END IF;
END $$;

-- 2. Erstelle eine Funktion zur Fortschrittsberechnung
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

-- 3. Erstelle eine Funktion zur automatischen Fortschrittsaktualisierung
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

-- 4. Erstelle Trigger für automatische Fortschrittsaktualisierung
-- Trigger für INSERT (neues Modul hinzugefügt)
DROP TRIGGER IF EXISTS trigger_update_progress_on_module_insert ON project_modules;
CREATE TRIGGER trigger_update_progress_on_module_insert
    AFTER INSERT ON project_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_project_progress();

-- Trigger für UPDATE (Modul-Status geändert)
DROP TRIGGER IF EXISTS trigger_update_progress_on_module_update ON project_modules;
CREATE TRIGGER trigger_update_progress_on_module_update
    AFTER UPDATE ON project_modules
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION update_project_progress();

-- Trigger für DELETE (Modul gelöscht)
DROP TRIGGER IF EXISTS trigger_update_progress_on_module_delete ON project_modules;
CREATE TRIGGER trigger_update_progress_on_module_delete
    AFTER DELETE ON project_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_project_progress();

-- 5. Aktualisiere alle bestehenden Projekte mit dem korrekten Fortschritt
UPDATE projects 
SET completion_percentage = calculate_project_progress(id),
    updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT project_id 
    FROM project_modules 
    WHERE project_id IS NOT NULL
);

-- 6. Erstelle Index für bessere Performance bei Fortschrittsberechnungen
CREATE INDEX IF NOT EXISTS idx_project_modules_status ON project_modules(project_id, status);

-- 7. Kommentare hinzufügen
COMMENT ON FUNCTION calculate_project_progress(INTEGER) IS 'Berechnet den Fortschritt eines Projekts basierend auf abgeschlossenen Modulen';
COMMENT ON FUNCTION update_project_progress() IS 'Trigger-Funktion zur automatischen Fortschrittsaktualisierung';
COMMENT ON TRIGGER trigger_update_progress_on_module_insert ON project_modules IS 'Aktualisiert Projektfortschritt beim Hinzufügen neuer Module';
COMMENT ON TRIGGER trigger_update_progress_on_module_update ON project_modules IS 'Aktualisiert Projektfortschritt bei Statusänderungen von Modulen';
COMMENT ON TRIGGER trigger_update_progress_on_module_delete ON project_modules IS 'Aktualisiert Projektfortschritt beim Löschen von Modulen';
