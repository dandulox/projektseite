-- Patch 001: Stelle sicher, dass die greetings-Tabelle existiert
-- Erstellt: $(date)
-- Beschreibung: Erstellt die greetings-Tabelle falls sie nicht existiert

-- Prüfe ob die greetings-Tabelle existiert und erstelle sie falls nötig
CREATE TABLE IF NOT EXISTS greetings (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    time_period VARCHAR(20) NOT NULL CHECK (time_period IN ('morning', 'afternoon', 'evening', 'night')),
    hour INTEGER CHECK (hour >= 0 AND hour <= 23),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Erstelle Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_greetings_time_period ON greetings(time_period);
CREATE INDEX IF NOT EXISTS idx_greetings_hour ON greetings(hour);
CREATE INDEX IF NOT EXISTS idx_greetings_active ON greetings(is_active);

-- Trigger für updated_at
CREATE TRIGGER update_greetings_updated_at BEFORE UPDATE ON greetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Kommentar hinzufügen
COMMENT ON TABLE greetings IS 'Tabelle für humorvolle Begrüßungen basierend auf Tageszeit - Fun-Feature';
COMMENT ON COLUMN greetings.text IS 'Der humorvolle Begrüßungstext';
COMMENT ON COLUMN greetings.time_period IS 'Tageszeit (morning, afternoon, evening, night)';
COMMENT ON COLUMN greetings.hour IS 'Spezifische Stunde (0-23) oder NULL für gesamte Tageszeit';
COMMENT ON COLUMN greetings.is_active IS 'Ob die Begrüßung aktiv ist';
