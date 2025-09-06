-- Enhanced Task Seeds - Patch 006
-- Erstellt: 2024-12-19
-- Beschreibung: Erweiterte Demo-Daten für alle drei Features (My-Tasks, Deadlines, Kanban)

-- ==============================================
-- ENHANCED TASK SEEDS
-- ==============================================

-- Zusätzliche Demo-Tasks für bessere Feature-Demonstration
-- Diese Tasks sind speziell darauf ausgelegt, alle drei Features zu testen:

INSERT INTO tasks (title, description, status, priority, assignee_id, project_id, due_date, estimated_hours, tags, created_by) VALUES

-- ==============================================
-- USER 1 TASKS (für "Meine Aufgaben" Demo)
-- ==============================================

-- Heute fällige Tasks (für Deadlines-Demo)
('Dashboard Widget implementieren', 'Responsive Dashboard-Widget für Task-Übersicht erstellen', 'in_progress', 'high', 1, 1, CURRENT_DATE, 8.0, ARRAY['frontend', 'dashboard', 'widget'], 1),
('API-Endpunkt testen', 'Unit-Tests für neue Task-API schreiben', 'todo', 'medium', 1, 1, CURRENT_DATE + INTERVAL '1 day', 4.0, ARRAY['testing', 'api', 'backend'], 1),

-- Diese Woche fällige Tasks
('User Authentication verbessern', 'JWT-Token Refresh-Mechanismus implementieren', 'todo', 'high', 1, 1, CURRENT_DATE + INTERVAL '2 days', 6.0, ARRAY['auth', 'security', 'jwt'], 1),
('Database Migration schreiben', 'Neue Spalten für Task-Priorität hinzufügen', 'in_progress', 'medium', 1, 1, CURRENT_DATE + INTERVAL '3 days', 3.0, ARRAY['database', 'migration'], 1),
('Frontend Validierung', 'Client-seitige Formular-Validierung implementieren', 'review', 'medium', 1, 1, CURRENT_DATE + INTERVAL '4 days', 5.0, ARRAY['frontend', 'validation'], 1),

-- Nächste Woche fällige Tasks
('Performance Optimierung', 'Lazy Loading für große Task-Listen implementieren', 'todo', 'low', 1, 1, CURRENT_DATE + INTERVAL '8 days', 12.0, ARRAY['performance', 'optimization'], 1),
('Dokumentation aktualisieren', 'API-Dokumentation mit neuen Endpunkten erweitern', 'todo', 'low', 1, 1, CURRENT_DATE + INTERVAL '10 days', 6.0, ARRAY['documentation', 'api'], 1),

-- ==============================================
-- USER 2 TASKS (für Team-Demo)
-- ==============================================

-- Heute fällige Tasks
('Mobile Responsive Design', 'CSS Grid für mobile Geräte optimieren', 'in_progress', 'critical', 2, 1, CURRENT_DATE, 10.0, ARRAY['mobile', 'css', 'responsive'], 1),
('Error Handling verbessern', 'Einheitliche Fehlerbehandlung in allen Komponenten', 'todo', 'high', 2, 1, CURRENT_DATE + INTERVAL '1 day', 7.0, ARRAY['error-handling', 'frontend'], 1),

-- Diese Woche fällige Tasks
('State Management refactoring', 'Redux Store für bessere Performance optimieren', 'todo', 'medium', 2, 1, CURRENT_DATE + INTERVAL '2 days', 8.0, ARRAY['redux', 'state-management'], 1),
('Component Library erweitern', 'Neue UI-Komponenten für Task-Management', 'in_progress', 'medium', 2, 1, CURRENT_DATE + INTERVAL '5 days', 15.0, ARRAY['ui', 'components', 'library'], 1),

-- ==============================================
-- USER 3 TASKS (für verschiedene Status-Demo)
-- ==============================================

-- Verschiedene Status für Kanban-Demo
('Backend API erweitern', 'Neue Endpunkte für Task-Filter implementieren', 'completed', 'high', 3, 1, CURRENT_DATE - INTERVAL '2 days', 6.0, ARRAY['backend', 'api', 'filter'], 1),
('Database Schema optimieren', 'Indizes für bessere Query-Performance hinzufügen', 'completed', 'medium', 3, 1, CURRENT_DATE - INTERVAL '1 day', 4.0, ARRAY['database', 'performance', 'indexes'], 1),
('Code Review durchführen', 'Pull Request Review für Task-Management Feature', 'review', 'medium', 3, 1, CURRENT_DATE + INTERVAL '1 day', 2.0, ARRAY['code-review', 'quality'], 1),
('Bug Fix implementieren', 'Kritischer Bug in Task-Erstellung beheben', 'in_progress', 'critical', 3, 1, CURRENT_DATE + INTERVAL '1 day', 3.0, ARRAY['bug-fix', 'critical'], 1),

-- ==============================================
-- ÜBERFÄLLIGE TASKS (für Deadlines-Demo)
-- ==============================================

('Legacy Code Refactoring', 'Alte Task-Management Komponenten modernisieren', 'in_progress', 'critical', 1, 1, CURRENT_DATE - INTERVAL '3 days', 20.0, ARRAY['refactoring', 'legacy'], 1),
('Security Audit', 'Umfassende Sicherheitsprüfung der Task-API', 'todo', 'critical', 2, 1, CURRENT_DATE - INTERVAL '2 days', 16.0, ARRAY['security', 'audit'], 1),
('Backup System testen', 'Backup- und Restore-Prozesse für Task-Daten testen', 'todo', 'high', 3, 1, CURRENT_DATE - INTERVAL '1 day', 8.0, ARRAY['backup', 'testing'], 1),

-- ==============================================
-- ABGEBROCHENE TASKS (für Kanban-Demo)
-- ==============================================

('Flash Player Support', 'Flash Player Unterstützung entfernen (veraltet)', 'cancelled', 'low', 1, 1, CURRENT_DATE - INTERVAL '5 days', 4.0, ARRAY['legacy', 'flash'], 1),
('IE11 Support', 'Internet Explorer 11 Unterstützung entfernen', 'cancelled', 'low', 2, 1, CURRENT_DATE - INTERVAL '4 days', 6.0, ARRAY['legacy', 'ie11'], 1),

-- ==============================================
-- PROJEKT 2 TASKS (falls vorhanden)
-- ==============================================

('Mobile App Icon Design', 'Neues App-Icon für verschiedene Größen erstellen', 'completed', 'medium', 1, 2, CURRENT_DATE - INTERVAL '1 day', 4.0, ARRAY['design', 'mobile', 'icon'], 1),
('Splash Screen implementieren', 'Animierter Splash Screen mit Logo', 'in_progress', 'low', 2, 2, CURRENT_DATE + INTERVAL '2 days', 3.0, ARRAY['mobile', 'animation'], 1),
('Push Notifications einrichten', 'Firebase Cloud Messaging konfigurieren', 'todo', 'high', 1, 2, CURRENT_DATE + INTERVAL '5 days', 8.0, ARRAY['mobile', 'notifications', 'firebase'], 1),
('Offline-Funktionalität', 'Service Worker für Offline-Nutzung implementieren', 'todo', 'medium', 3, 2, CURRENT_DATE + INTERVAL '8 days', 12.0, ARRAY['mobile', 'offline', 'pwa'], 1);

-- ==============================================
-- DEMO-KOMMENTARE FÜR AKTIVITÄT
-- ==============================================

INSERT INTO task_comments (task_id, user_id, comment) VALUES
-- User 1 Tasks
(35, 1, 'Dashboard Widget ist fast fertig, nur noch Responsive Design fehlt'),
(35, 2, 'Sehr gut! Welche Breakpoints sollen verwendet werden?'),
(36, 1, 'API-Tests sind geschrieben, aber noch nicht alle Edge Cases abgedeckt'),
(37, 1, 'JWT-Refresh ist implementiert, aber noch nicht getestet'),
(38, 1, 'Migration läuft, aber noch nicht auf Produktions-DB getestet'),
(39, 1, 'Validierung funktioniert, aber Server-seitige Prüfung noch ausstehend'),

-- User 2 Tasks
(40, 2, 'Mobile Design ist fast fertig, nur noch Tablet-Ansicht fehlt'),
(40, 1, 'Sieht gut aus! Können wir das auch für Desktop optimieren?'),
(41, 2, 'Error Handling ist implementiert, aber noch nicht vollständig getestet'),
(42, 2, 'Redux-Refactoring läuft, aber noch nicht alle Komponenten migriert'),
(43, 2, 'Component Library wächst, aber noch nicht alle Komponenten dokumentiert'),

-- User 3 Tasks
(44, 3, 'Backend API ist erweitert und funktioniert einwandfrei'),
(45, 3, 'Database-Indizes sind erstellt, Performance hat sich deutlich verbessert'),
(46, 3, 'Code Review ist abgeschlossen, nur noch kleine Verbesserungen'),
(47, 3, 'Bug Fix ist implementiert, aber noch nicht vollständig getestet'),

-- Überfällige Tasks
(48, 1, 'Legacy Code Refactoring ist komplexer als erwartet'),
(48, 2, 'Können wir das in kleinere Tasks aufteilen?'),
(49, 2, 'Security Audit ergab einige kritische Schwachstellen'),
(50, 3, 'Backup-System funktioniert, aber Restore-Prozess muss optimiert werden');

-- ==============================================
-- DEMO-AKTIVITÄTEN FÜR ACTIVITY LOG
-- ==============================================

INSERT INTO task_activities (task_id, user_id, action, details, old_values, new_values) VALUES
-- User 1 Activities
(35, 1, 'status_changed', 'Status von todo auf in_progress geändert', '{"status": "todo"}', '{"status": "in_progress"}'),
(35, 1, 'priority_changed', 'Priorität auf high gesetzt', '{"priority": "medium"}', '{"priority": "high"}'),
(36, 1, 'assigned', 'Task an User 1 zugewiesen', '{"assignee_id": null}', '{"assignee_id": 1}'),
(37, 1, 'status_changed', 'Status auf todo gesetzt', '{"status": "in_progress"}', '{"status": "todo"}'),
(38, 1, 'status_changed', 'Status auf in_progress gesetzt', '{"status": "todo"}', '{"status": "in_progress"}'),
(39, 1, 'status_changed', 'Status auf review gesetzt', '{"status": "in_progress"}', '{"status": "review"}'),

-- User 2 Activities
(40, 2, 'status_changed', 'Status von todo auf in_progress geändert', '{"status": "todo"}', '{"status": "in_progress"}'),
(40, 2, 'priority_changed', 'Priorität auf critical gesetzt', '{"priority": "high"}', '{"priority": "critical"}'),
(41, 2, 'assigned', 'Task an User 2 zugewiesen', '{"assignee_id": null}', '{"assignee_id": 2}'),
(42, 2, 'status_changed', 'Status auf todo gesetzt', '{"status": "in_progress"}', '{"status": "todo"}'),
(43, 2, 'status_changed', 'Status auf in_progress gesetzt', '{"status": "todo"}', '{"status": "in_progress"}'),

-- User 3 Activities
(44, 3, 'status_changed', 'Task als completed markiert', '{"status": "in_progress"}', '{"status": "completed"}'),
(45, 3, 'status_changed', 'Task als completed markiert', '{"status": "review"}', '{"status": "completed"}'),
(46, 3, 'status_changed', 'Status auf review gesetzt', '{"status": "todo"}', '{"status": "review"}'),
(47, 3, 'status_changed', 'Status auf in_progress gesetzt', '{"status": "todo"}', '{"status": "in_progress"}'),
(47, 3, 'priority_changed', 'Priorität auf critical gesetzt', '{"priority": "high"}', '{"priority": "critical"}'),

-- Überfällige Tasks
(48, 1, 'status_changed', 'Status auf in_progress gesetzt', '{"status": "todo"}', '{"status": "in_progress"}'),
(48, 1, 'priority_changed', 'Priorität auf critical gesetzt', '{"priority": "high"}', '{"priority": "critical"}'),
(49, 2, 'assigned', 'Task an User 2 zugewiesen', '{"assignee_id": null}', '{"assignee_id": 2}'),
(50, 3, 'assigned', 'Task an User 3 zugewiesen', '{"assignee_id": null}', '{"assignee_id": 3}');

-- ==============================================
-- KOMMENTARE
-- ==============================================

COMMENT ON TABLE tasks IS 'Haupttabelle für Tasks/Aufgaben - erweitert mit umfassenden Demo-Daten für alle Features';
COMMENT ON TABLE task_comments IS 'Kommentare zu Tasks - erweitert mit realistischen Demo-Kommentaren';
COMMENT ON TABLE task_activities IS 'Aktivitäten-Log für Tasks - erweitert mit Demo-Aktivitäten für Activity Feed';

-- ==============================================
-- HINWEISE
-- ==============================================

-- Diese erweiterten Demo-Daten bieten:
-- 1. "Meine Aufgaben" Demo: User 1 hat 8 Tasks mit verschiedenen Status und Fälligkeitsdaten
-- 2. "Deadlines" Demo: Tasks mit Fälligkeitsdaten von heute bis +10 Tage, inkl. überfällige
-- 3. "Kanban Board" Demo: Tasks in allen Status (todo, in_progress, review, completed, cancelled)
-- 4. Realistische Kommentare und Aktivitäten für Activity Feed
-- 5. Verschiedene Assignees für Team-Demo
-- 6. Überfällige Tasks für Deadlines-Widget
-- 7. Abgebrochene Tasks für Kanban-Demo

-- Nach diesem Patch sollten alle drei Features funktionieren:
-- - /my-tasks zeigt mindestens 8 Tasks für User 1
-- - Dashboard Deadlines zeigt mindestens 5 Tasks in den nächsten 7 Tagen
-- - Kanban Board zeigt Tasks in allen Spalten
