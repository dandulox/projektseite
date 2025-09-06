-- Kanban Board Demo Data - Patch 005
-- Erstellt: 2024-12-19
-- Beschreibung: Zusätzliche Demo-Daten für Kanban Board Demonstration

-- ==============================================
-- KANBAN BOARD DEMO DATA
-- ==============================================

-- Zusätzliche Demo-Tasks für bessere Kanban Board Demonstration
INSERT INTO tasks (title, description, status, priority, assignee_id, project_id, due_date, estimated_hours, tags, created_by) VALUES
-- Projekt 1 - Webseite Redesign (mehr Tasks für Kanban)
('Header Design überarbeiten', 'Neues Header-Design mit verbesserter Navigation implementieren', 'todo', 'high', 1, 1, '2024-12-28', 6.0, ARRAY['design', 'frontend', 'ui'], 1),
('Footer Komponente erstellen', 'Responsive Footer mit Links und Kontaktinformationen', 'todo', 'medium', 2, 1, '2024-12-30', 4.0, ARRAY['frontend', 'component'], 1),
('Mobile Navigation implementieren', 'Hamburger-Menü für mobile Geräte', 'in_progress', 'high', 1, 1, '2024-12-26', 8.0, ARRAY['mobile', 'navigation', 'responsive'], 1),
('Kontaktformular validieren', 'Client- und Server-seitige Validierung für Kontaktformular', 'review', 'medium', 2, 1, '2024-12-24', 5.0, ARRAY['validation', 'forms', 'backend'], 1),
('SEO-Optimierung durchführen', 'Meta-Tags, Alt-Texte und Strukturierte Daten hinzufügen', 'todo', 'medium', 3, 1, '2025-01-05', 12.0, ARRAY['seo', 'optimization'], 1),
('Performance-Tests durchführen', 'Ladezeiten messen und optimieren', 'todo', 'low', 1, 1, '2025-01-10', 8.0, ARRAY['performance', 'testing'], 1),
('Accessibility Audit', 'WCAG 2.1 Konformität prüfen und verbessern', 'todo', 'medium', 2, 1, '2025-01-15', 10.0, ARRAY['accessibility', 'wcag'], 1),
('Cross-Browser Testing', 'Kompatibilität mit verschiedenen Browsern testen', 'todo', 'low', 3, 1, '2025-01-20', 6.0, ARRAY['testing', 'browser'], 1),

-- Projekt 2 - Mobile App (falls vorhanden)
('App Icon Design', 'Neues App-Icon für verschiedene Größen erstellen', 'completed', 'medium', 1, 2, '2024-12-20', 4.0, ARRAY['design', 'mobile', 'icon'], 1),
('Splash Screen implementieren', 'Animierter Splash Screen mit Logo', 'in_progress', 'low', 2, 2, '2024-12-25', 3.0, ARRAY['mobile', 'animation'], 1),
('Push Notifications einrichten', 'Firebase Cloud Messaging konfigurieren', 'todo', 'high', 1, 2, '2024-12-30', 8.0, ARRAY['mobile', 'notifications', 'firebase'], 1),
('Offline-Funktionalität', 'Service Worker für Offline-Nutzung implementieren', 'todo', 'medium', 3, 2, '2025-01-08', 12.0, ARRAY['mobile', 'offline', 'pwa'], 1),
('App Store Optimierung', 'ASO für bessere Sichtbarkeit in App Stores', 'review', 'low', 2, 2, '2025-01-12', 6.0, ARRAY['mobile', 'aso', 'marketing'], 1),

-- Projekt 3 - Backend API (falls vorhanden)
('API Rate Limiting', 'Rate Limiting für API-Endpunkte implementieren', 'completed', 'high', 1, 3, '2024-12-18', 6.0, ARRAY['backend', 'security', 'api'], 1),
('Database Indexing', 'Performance-Optimierung durch bessere Indizes', 'in_progress', 'medium', 2, 3, '2024-12-22', 8.0, ARRAY['database', 'performance'], 1),
('API Dokumentation', 'Swagger/OpenAPI Dokumentation erstellen', 'todo', 'medium', 3, 3, '2024-12-28', 10.0, ARRAY['documentation', 'api'], 1),
('Error Handling verbessern', 'Einheitliche Fehlerbehandlung implementieren', 'todo', 'high', 1, 3, '2024-12-26', 7.0, ARRAY['backend', 'error-handling'], 1),
('Logging System', 'Strukturiertes Logging mit Winston implementieren', 'review', 'medium', 2, 3, '2024-12-24', 5.0, ARRAY['backend', 'logging'], 1),
('Health Check Endpoint', 'Monitoring-Endpunkt für System-Status', 'todo', 'low', 3, 3, '2025-01-02', 3.0, ARRAY['backend', 'monitoring'], 1),

-- Überfällige Tasks (für Demo)
('Legacy Code Refactoring', 'Alten Code modernisieren und optimieren', 'in_progress', 'critical', 1, 1, '2024-12-15', 20.0, ARRAY['refactoring', 'legacy'], 1),
('Security Audit', 'Umfassende Sicherheitsprüfung durchführen', 'todo', 'critical', 2, 1, '2024-12-10', 16.0, ARRAY['security', 'audit'], 1),
('Backup System testen', 'Backup- und Restore-Prozesse testen', 'todo', 'high', 3, 1, '2024-12-12', 8.0, ARRAY['backup', 'testing'], 1),

-- Abgebrochene Tasks (für Demo)
('Flash Player Support', 'Flash Player Unterstützung entfernen (veraltet)', 'cancelled', 'low', 1, 1, '2024-12-01', 4.0, ARRAY['legacy', 'flash'], 1),
('IE11 Support', 'Internet Explorer 11 Unterstützung entfernen', 'cancelled', 'low', 2, 1, '2024-11-30', 6.0, ARRAY['legacy', 'ie11'], 1);

-- Zusätzliche Demo-Kommentare für bessere Aktivität
INSERT INTO task_comments (task_id, user_id, comment) VALUES
(16, 1, 'Design-Entwurf ist fertig, kann mit der Implementierung beginnen'),
(16, 2, 'Sehr gut! Welche Farbpalette soll verwendet werden?'),
(17, 1, 'Footer sollte responsive sein und auf allen Geräten gut aussehen'),
(18, 2, 'Mobile Navigation ist fast fertig, nur noch Animationen fehlen'),
(19, 1, 'Validierung funktioniert, aber Server-seitige Prüfung noch ausstehend'),
(20, 3, 'SEO-Analyse ist abgeschlossen, Meta-Tags können implementiert werden'),
(21, 1, 'Performance-Tests zeigen gute Ergebnisse, aber noch Optimierungspotential'),
(22, 2, 'Accessibility Audit ergab einige Verbesserungsmöglichkeiten'),
(23, 3, 'Cross-Browser Tests laufen, Ergebnisse werden morgen erwartet'),
(24, 1, 'App Icon ist fertig und wurde in verschiedenen Größen getestet'),
(25, 2, 'Splash Screen Animation läuft, nur noch Timing optimieren'),
(26, 1, 'Firebase ist konfiguriert, Push Notifications können getestet werden'),
(27, 3, 'Service Worker ist implementiert, Offline-Funktionalität funktioniert'),
(28, 2, 'ASO-Keywords sind recherchiert, Beschreibungen können optimiert werden'),
(29, 1, 'Rate Limiting ist implementiert und funktioniert einwandfrei'),
(30, 2, 'Database Indizes sind erstellt, Performance hat sich deutlich verbessert'),
(31, 3, 'API Dokumentation ist fast fertig, nur noch Beispiele hinzufügen'),
(32, 1, 'Error Handling ist implementiert, aber noch nicht vollständig getestet'),
(33, 2, 'Logging System funktioniert, aber Log-Level müssen noch konfiguriert werden'),
(34, 3, 'Health Check Endpoint ist implementiert und funktioniert');

-- Zusätzliche Demo-Aktivitäten
INSERT INTO task_activities (task_id, user_id, action, details, old_values, new_values) VALUES
(16, 1, 'status_changed', 'Status von todo auf in_progress geändert', '{"status": "todo"}', '{"status": "in_progress"}'),
(16, 1, 'priority_changed', 'Priorität auf high gesetzt', '{"priority": "medium"}', '{"priority": "high"}'),
(17, 2, 'assigned', 'Task an User 2 zugewiesen', '{"assignee_id": null}', '{"assignee_id": 2}'),
(18, 1, 'status_changed', 'Status auf in_progress gesetzt', '{"status": "todo"}', '{"status": "in_progress"}'),
(19, 2, 'status_changed', 'Status auf review gesetzt', '{"status": "in_progress"}', '{"status": "review"}'),
(20, 3, 'assigned', 'Task an User 3 zugewiesen', '{"assignee_id": null}', '{"assignee_id": 3}'),
(21, 1, 'priority_changed', 'Priorität auf low gesetzt', '{"priority": "medium"}', '{"priority": "low"}'),
(22, 2, 'assigned', 'Task an User 2 zugewiesen', '{"assignee_id": null}', '{"assignee_id": 2}'),
(23, 3, 'status_changed', 'Status von todo auf in_progress geändert', '{"status": "todo"}', '{"status": "in_progress"}'),
(24, 1, 'status_changed', 'Task als completed markiert', '{"status": "in_progress"}', '{"status": "completed"}'),
(25, 2, 'status_changed', 'Status auf in_progress gesetzt', '{"status": "todo"}', '{"status": "in_progress"}'),
(26, 1, 'priority_changed', 'Priorität auf high gesetzt', '{"priority": "medium"}', '{"priority": "high"}'),
(27, 3, 'assigned', 'Task an User 3 zugewiesen', '{"assignee_id": null}', '{"assignee_id": 3}'),
(28, 2, 'status_changed', 'Status auf review gesetzt', '{"status": "todo"}', '{"status": "review"}'),
(29, 1, 'status_changed', 'Task als completed markiert', '{"status": "in_progress"}', '{"status": "completed"}'),
(30, 2, 'status_changed', 'Status auf in_progress gesetzt', '{"status": "todo"}', '{"status": "in_progress"}'),
(31, 3, 'assigned', 'Task an User 3 zugewiesen', '{"assignee_id": null}', '{"assignee_id": 3}'),
(32, 1, 'priority_changed', 'Priorität auf high gesetzt', '{"priority": "medium"}', '{"priority": "high"}'),
(33, 2, 'status_changed', 'Status auf review gesetzt', '{"status": "todo"}', '{"status": "review"}'),
(34, 3, 'assigned', 'Task an User 3 zugewiesen', '{"assignee_id": null}', '{"assignee_id": 3}');

-- ==============================================
-- KOMMENTARE
-- ==============================================

COMMENT ON TABLE tasks IS 'Haupttabelle für Tasks/Aufgaben - erweitert mit Kanban Board Demo-Daten';
COMMENT ON TABLE task_comments IS 'Kommentare zu Tasks - erweitert mit Demo-Kommentaren';
COMMENT ON TABLE task_activities IS 'Aktivitäten-Log für Tasks - erweitert mit Demo-Aktivitäten';

-- ==============================================
-- HINWEISE
-- ==============================================

-- Diese Demo-Daten erweitern die bestehenden Tasks aus Patch 004
-- Sie bieten eine realistische Darstellung eines Kanban Boards mit:
-- - Verschiedenen Task-Status (todo, in_progress, review, completed, cancelled)
-- - Unterschiedlichen Prioritäten (low, medium, high, critical)
-- - Überfälligen Tasks für bessere Demo
-- - Abgebrochenen Tasks
-- - Realistischen Kommentaren und Aktivitäten
-- - Verschiedenen Assignees für Team-Demo

