-- Notizen/Kommentar-System
-- Patch 010: Notes and Comments System
-- Erstellt: $(date)

-- Erstelle Tabelle für Kommentare/Notizen
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('project', 'module', 'standalone_module')),
    target_id INTEGER NOT NULL,
    parent_comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    is_private BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Erstelle Tabelle für Kommentar-Mentions (Erwähnungen von Benutzern)
CREATE TABLE IF NOT EXISTS comment_mentions (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    mentioned_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, mentioned_user_id)
);

-- Erstelle Tabelle für Kommentar-Reaktionen (Likes, etc.)
CREATE TABLE IF NOT EXISTS comment_reactions (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'dislike', 'helpful', 'confused', 'celebrate')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, user_id, reaction_type)
);

-- Erstelle Tabelle für Kommentar-Anhänge (falls später benötigt)
CREATE TABLE IF NOT EXISTS comment_attachments (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Erstelle Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_pinned ON comments(is_pinned, created_at);
CREATE INDEX IF NOT EXISTS idx_comment_mentions_comment ON comment_mentions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_mentions_user ON comment_mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user ON comment_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_attachments_comment ON comment_attachments(comment_id);

-- Trigger für updated_at
CREATE TRIGGER IF NOT EXISTS update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funktion zum Abrufen von Kommentaren mit Benutzerinformationen
CREATE OR REPLACE FUNCTION get_comments_with_details(
    p_target_type VARCHAR(20),
    p_target_id INTEGER,
    p_user_id INTEGER DEFAULT NULL,
    p_include_private BOOLEAN DEFAULT false
) RETURNS TABLE (
    comment_id INTEGER,
    content TEXT,
    author_id INTEGER,
    author_username VARCHAR(50),
    author_email VARCHAR(100),
    target_type VARCHAR(20),
    target_id INTEGER,
    parent_comment_id INTEGER,
    is_private BOOLEAN,
    is_pinned BOOLEAN,
    is_edited BOOLEAN,
    edited_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    reaction_counts JSONB,
    user_reactions JSONB,
    mention_count INTEGER,
    reply_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.content,
        c.author_id,
        u.username,
        u.email,
        c.target_type,
        c.target_id,
        c.parent_comment_id,
        c.is_private,
        c.is_pinned,
        c.is_edited,
        c.edited_at,
        c.created_at,
        c.updated_at,
        COALESCE(
            jsonb_object_agg(
                cr.reaction_type, 
                reaction_counts.count
            ) FILTER (WHERE cr.reaction_type IS NOT NULL),
            '{}'::jsonb
        ) as reaction_counts,
        COALESCE(
            jsonb_object_agg(
                user_reactions.reaction_type,
                true
            ) FILTER (WHERE user_reactions.reaction_type IS NOT NULL),
            '{}'::jsonb
        ) as user_reactions,
        COALESCE(mention_count.count, 0) as mention_count,
        COALESCE(reply_count.count, 0) as reply_count
    FROM comments c
    LEFT JOIN users u ON c.author_id = u.id
    LEFT JOIN (
        SELECT 
            comment_id,
            reaction_type,
            COUNT(*) as count
        FROM comment_reactions
        GROUP BY comment_id, reaction_type
    ) reaction_counts ON c.id = reaction_counts.comment_id
    LEFT JOIN comment_reactions cr ON c.id = cr.comment_id
    LEFT JOIN (
        SELECT 
            comment_id,
            reaction_type
        FROM comment_reactions
        WHERE user_id = p_user_id
    ) user_reactions ON c.id = user_reactions.comment_id
    LEFT JOIN (
        SELECT 
            comment_id,
            COUNT(*) as count
        FROM comment_mentions
        GROUP BY comment_id
    ) mention_count ON c.id = mention_count.comment_id
    LEFT JOIN (
        SELECT 
            parent_comment_id,
            COUNT(*) as count
        FROM comments
        WHERE parent_comment_id IS NOT NULL
        GROUP BY parent_comment_id
    ) reply_count ON c.id = reply_count.parent_comment_id
    WHERE c.target_type = p_target_type 
        AND c.target_id = p_target_id
        AND (c.is_private = false OR p_include_private = true OR c.author_id = p_user_id)
    GROUP BY 
        c.id, c.content, c.author_id, u.username, u.email, c.target_type, c.target_id,
        c.parent_comment_id, c.is_private, c.is_pinned, c.is_edited, c.edited_at,
        c.created_at, c.updated_at, mention_count.count, reply_count.count
    ORDER BY c.is_pinned DESC, c.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Funktion zum Erstellen eines Kommentars mit Berechtigungsprüfung
CREATE OR REPLACE FUNCTION create_comment(
    p_content TEXT,
    p_author_id INTEGER,
    p_target_type VARCHAR(20),
    p_target_id INTEGER,
    p_parent_comment_id INTEGER DEFAULT NULL,
    p_is_private BOOLEAN DEFAULT false
) RETURNS INTEGER AS $$
DECLARE
    new_comment_id INTEGER;
    has_permission BOOLEAN := false;
BEGIN
    -- Berechtigung prüfen
    IF p_target_type = 'project' THEN
        -- Prüfe Projekt-Berechtigung
        SELECT EXISTS(
            SELECT 1 FROM projects p
            LEFT JOIN project_modules pm ON p.id = pm.project_id
            WHERE p.id = p_target_id
            AND (p.owner_id = p_author_id OR EXISTS(
                SELECT 1 FROM team_memberships tm
                JOIN teams t ON tm.team_id = t.id
                WHERE t.id = p.team_id AND tm.user_id = p_author_id
            ))
        ) INTO has_permission;
    ELSIF p_target_type = 'module' THEN
        -- Prüfe Modul-Berechtigung
        SELECT check_module_permission(p_author_id, p_target_id, 'project', 'view') INTO has_permission;
    ELSIF p_target_type = 'standalone_module' THEN
        -- Prüfe Standalone-Modul-Berechtigung
        SELECT check_module_permission(p_author_id, p_target_id, 'standalone', 'view') INTO has_permission;
    END IF;

    IF NOT has_permission THEN
        RAISE EXCEPTION 'Keine Berechtigung zum Kommentieren';
    END IF;

    -- Kommentar erstellen
    INSERT INTO comments (content, author_id, target_type, target_id, parent_comment_id, is_private)
    VALUES (p_content, p_author_id, p_target_type, p_target_id, p_parent_comment_id, p_is_private)
    RETURNING id INTO new_comment_id;

    -- Log-Eintrag erstellen
    INSERT INTO module_logs (module_id, module_type, user_id, action, details)
    VALUES (
        p_target_id,
        CASE WHEN p_target_type = 'project' THEN 'project' ELSE p_target_type END,
        p_author_id,
        'comment_added',
        'Kommentar hinzugefügt: ' || LEFT(p_content, 50) || '...'
    );

    RETURN new_comment_id;
END;
$$ LANGUAGE plpgsql;

-- Funktion zum Bearbeiten eines Kommentars
CREATE OR REPLACE FUNCTION edit_comment(
    p_comment_id INTEGER,
    p_user_id INTEGER,
    p_new_content TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    comment_author_id INTEGER;
BEGIN
    -- Prüfe ob der Benutzer der Autor ist oder Admin
    SELECT author_id INTO comment_author_id
    FROM comments
    WHERE id = p_comment_id;

    IF comment_author_id IS NULL THEN
        RAISE EXCEPTION 'Kommentar nicht gefunden';
    END IF;

    IF comment_author_id != p_user_id AND NOT EXISTS(
        SELECT 1 FROM users WHERE id = p_user_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Keine Berechtigung zum Bearbeiten';
    END IF;

    -- Kommentar aktualisieren
    UPDATE comments
    SET content = p_new_content, is_edited = true, edited_at = CURRENT_TIMESTAMP
    WHERE id = p_comment_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Funktion zum Löschen eines Kommentars
CREATE OR REPLACE FUNCTION delete_comment(
    p_comment_id INTEGER,
    p_user_id INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    comment_author_id INTEGER;
    comment_target_type VARCHAR(20);
    comment_target_id INTEGER;
BEGIN
    -- Prüfe Berechtigung
    SELECT author_id, target_type, target_id INTO comment_author_id, comment_target_type, comment_target_id
    FROM comments
    WHERE id = p_comment_id;

    IF comment_author_id IS NULL THEN
        RAISE EXCEPTION 'Kommentar nicht gefunden';
    END IF;

    IF comment_author_id != p_user_id AND NOT EXISTS(
        SELECT 1 FROM users WHERE id = p_user_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Keine Berechtigung zum Löschen';
    END IF;

    -- Kommentar löschen (CASCADE löscht automatisch Antworten, Mentions, etc.)
    DELETE FROM comments WHERE id = p_comment_id;

    -- Log-Eintrag erstellen
    INSERT INTO module_logs (module_id, module_type, user_id, action, details)
    VALUES (
        comment_target_id,
        CASE WHEN comment_target_type = 'project' THEN 'project' ELSE comment_target_type END,
        p_user_id,
        'comment_deleted',
        'Kommentar gelöscht'
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Funktion zum Anheften/Abheften eines Kommentars
CREATE OR REPLACE FUNCTION toggle_comment_pin(
    p_comment_id INTEGER,
    p_user_id INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    comment_author_id INTEGER;
    comment_target_type VARCHAR(20);
    comment_target_id INTEGER;
    is_admin BOOLEAN;
BEGIN
    -- Prüfe Berechtigung
    SELECT author_id, target_type, target_id INTO comment_author_id, comment_target_type, comment_target_id
    FROM comments
    WHERE id = p_comment_id;

    SELECT role = 'admin' INTO is_admin FROM users WHERE id = p_user_id;

    IF comment_author_id IS NULL THEN
        RAISE EXCEPTION 'Kommentar nicht gefunden';
    END IF;

    -- Nur Admin oder Autor können Kommentare anheften
    IF comment_author_id != p_user_id AND NOT is_admin THEN
        RAISE EXCEPTION 'Keine Berechtigung zum Anheften';
    END IF;

    -- Pin-Status umkehren
    UPDATE comments
    SET is_pinned = NOT is_pinned
    WHERE id = p_comment_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Kommentare für Dokumentation
COMMENT ON TABLE comments IS 'Kommentare/Notizen für Projekte und Module';
COMMENT ON TABLE comment_mentions IS 'Erwähnungen von Benutzern in Kommentaren';
COMMENT ON TABLE comment_reactions IS 'Reaktionen auf Kommentare (Likes, etc.)';
COMMENT ON TABLE comment_attachments IS 'Anhänge zu Kommentaren';

COMMENT ON COLUMN comments.target_type IS 'Typ des Ziels: project, module, standalone_module';
COMMENT ON COLUMN comments.parent_comment_id IS 'ID des übergeordneten Kommentars für Antworten';
COMMENT ON COLUMN comments.is_private IS 'Privater Kommentar (nur für Autor sichtbar)';
COMMENT ON COLUMN comments.is_pinned IS 'Angehefteter Kommentar (wird oben angezeigt)';

-- Beispiel-Kommentare für Tests
INSERT INTO comments (content, author_id, target_type, target_id, is_private)
SELECT 
    'Erster Kommentar zum Projekt - alles läuft gut!',
    u.id,
    'project',
    p.id,
    false
FROM users u, projects p
WHERE u.username = 'admin' AND p.name LIKE '%Test%'
LIMIT 1;

INSERT INTO comments (content, author_id, target_type, target_id, is_private)
SELECT 
    'Wichtige Notiz: Deadline wurde auf nächste Woche verschoben.',
    u.id,
    'project',
    p.id,
    false
FROM users u, projects p
WHERE u.username = 'user' AND p.name LIKE '%Test%'
LIMIT 1;

-- Erfolgreiche Installation melden
INSERT INTO project_logs (project_id, user_id, action, details)
SELECT 
    p.id,
    u.id,
    'system_update',
    'Notizen/Kommentar-System erfolgreich installiert (Patch 010)'
FROM projects p, users u
WHERE u.username = 'admin'
LIMIT 1;
