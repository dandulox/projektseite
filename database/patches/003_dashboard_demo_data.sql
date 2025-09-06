-- Dashboard Demo-Daten für Entwicklung und Testing
-- Erstellt: $(date)
-- Zweck: Demo-Daten für Dashboard-Widgets erstellen

-- ==============================================
-- DEMO-PROJEKTE
-- ==============================================

-- Demo-Projekt 1: Website-Redesign
INSERT INTO projects (name, description, status, priority, start_date, target_date, completion_percentage, owner_id, visibility)
VALUES (
  'Website-Redesign',
  'Komplettes Redesign der Unternehmenswebsite mit modernem Design und verbesserter UX',
  'active',
  'high',
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '15 days',
  65,
  1, -- Admin User
  'public'
) ON CONFLICT DO NOTHING;

-- Demo-Projekt 2: Mobile App
INSERT INTO projects (name, description, status, priority, start_date, target_date, completion_percentage, owner_id, visibility)
VALUES (
  'Mobile App Entwicklung',
  'Entwicklung einer iOS und Android App für Kundenmanagement',
  'in_progress',
  'critical',
  CURRENT_DATE - INTERVAL '45 days',
  CURRENT_DATE + INTERVAL '30 days',
  40,
  1, -- Admin User
  'public'
) ON CONFLICT DO NOTHING;

-- Demo-Projekt 3: Datenbank-Migration
INSERT INTO projects (name, description, status, priority, start_date, target_date, completion_percentage, owner_id, visibility)
VALUES (
  'Datenbank-Migration',
  'Migration von MySQL zu PostgreSQL mit Performance-Optimierungen',
  'planning',
  'medium',
  CURRENT_DATE + INTERVAL '7 days',
  CURRENT_DATE + INTERVAL '45 days',
  15,
  1, -- Admin User
  'public'
) ON CONFLICT DO NOTHING;

-- Demo-Projekt 4: API-Integration
INSERT INTO projects (name, description, status, priority, start_date, target_date, completion_percentage, owner_id, visibility)
VALUES (
  'API-Integration',
  'Integration von Drittanbieter-APIs für Zahlungsabwicklung',
  'completed',
  'high',
  CURRENT_DATE - INTERVAL '60 days',
  CURRENT_DATE - INTERVAL '5 days',
  100,
  1, -- Admin User
  'public'
) ON CONFLICT DO NOTHING;

-- ==============================================
-- DEMO-MODULE (AUFGABEN)
-- ==============================================

-- Module für Website-Redesign (Projekt 1)
INSERT INTO project_modules (project_id, name, description, status, priority, estimated_hours, assigned_to, due_date, completion_percentage)
VALUES 
  (1, 'Design-System erstellen', 'Einheitliches Design-System mit Farben, Typografie und Komponenten', 'completed', 'high', 16, 1, CURRENT_DATE - INTERVAL '5 days', 100),
  (1, 'Homepage-Layout', 'Responsive Layout für die Hauptseite entwickeln', 'in_progress', 'high', 24, 1, CURRENT_DATE + INTERVAL '3 days', 75),
  (1, 'Produktseiten', 'Template für Produktseiten mit Filter- und Suchfunktion', 'not_started', 'medium', 32, 1, CURRENT_DATE + INTERVAL '10 days', 0),
  (1, 'Kontaktformular', 'Kontaktformular mit Validierung und E-Mail-Versand', 'testing', 'medium', 8, 1, CURRENT_DATE + INTERVAL '2 days', 90),
  (1, 'SEO-Optimierung', 'Meta-Tags, Sitemap und Performance-Optimierung', 'not_started', 'low', 12, 1, CURRENT_DATE + INTERVAL '12 days', 0);

-- Module für Mobile App (Projekt 2)
INSERT INTO project_modules (project_id, name, description, status, priority, estimated_hours, assigned_to, due_date, completion_percentage)
VALUES 
  (2, 'App-Architektur', 'Grundlegende App-Struktur und Navigation', 'completed', 'critical', 20, 1, CURRENT_DATE - INTERVAL '10 days', 100),
  (2, 'Benutzer-Authentifizierung', 'Login, Registrierung und Passwort-Reset', 'in_progress', 'critical', 16, 1, CURRENT_DATE + INTERVAL '5 days', 60),
  (2, 'Dashboard-UI', 'Hauptdashboard mit Übersicht und Navigation', 'in_progress', 'high', 24, 1, CURRENT_DATE + INTERVAL '8 days', 40),
  (2, 'Daten-Synchronisation', 'Offline-Funktionalität und Sync mit Backend', 'not_started', 'high', 32, 1, CURRENT_DATE + INTERVAL '15 days', 0),
  (2, 'Push-Benachrichtigungen', 'Push-Notifications für wichtige Updates', 'not_started', 'medium', 12, 1, CURRENT_DATE + INTERVAL '20 days', 0);

-- Module für Datenbank-Migration (Projekt 3)
INSERT INTO project_modules (project_id, name, description, status, priority, estimated_hours, assigned_to, due_date, completion_percentage)
VALUES 
  (3, 'Schema-Analyse', 'Analyse des aktuellen MySQL-Schemas', 'in_progress', 'medium', 16, 1, CURRENT_DATE + INTERVAL '3 days', 30),
  (3, 'Daten-Mapping', 'Mapping der Datenstrukturen zwischen MySQL und PostgreSQL', 'not_started', 'medium', 24, 1, CURRENT_DATE + INTERVAL '10 days', 0),
  (3, 'Migration-Script', 'Automatisiertes Migrations-Script entwickeln', 'not_started', 'high', 40, 1, CURRENT_DATE + INTERVAL '20 days', 0),
  (3, 'Performance-Tests', 'Benchmark-Tests und Performance-Optimierung', 'not_started', 'medium', 20, 1, CURRENT_DATE + INTERVAL '35 days', 0);

-- Module für API-Integration (Projekt 4) - Abgeschlossen
INSERT INTO project_modules (project_id, name, description, status, priority, estimated_hours, assigned_to, due_date, completion_percentage)
VALUES 
  (4, 'API-Dokumentation', 'Dokumentation der verfügbaren APIs', 'completed', 'medium', 8, 1, CURRENT_DATE - INTERVAL '20 days', 100),
  (4, 'Zahlungs-API', 'Integration der Stripe-Zahlungs-API', 'completed', 'high', 16, 1, CURRENT_DATE - INTERVAL '15 days', 100),
  (4, 'Webhook-Handler', 'Handler für eingehende Webhooks', 'completed', 'medium', 12, 1, CURRENT_DATE - INTERVAL '10 days', 100),
  (4, 'Error-Handling', 'Umfassendes Error-Handling und Logging', 'completed', 'high', 10, 1, CURRENT_DATE - INTERVAL '5 days', 100);

-- ==============================================
-- DEMO-TEAMS
-- ==============================================

-- Demo-Team 1: Frontend-Team
INSERT INTO teams (name, description, team_leader_id, is_active)
VALUES (
  'Frontend-Team',
  'Entwicklung von Benutzeroberflächen und Frontend-Anwendungen',
  1, -- Admin als Team-Leader
  true
) ON CONFLICT DO NOTHING;

-- Demo-Team 2: Backend-Team
INSERT INTO teams (name, description, team_leader_id, is_active)
VALUES (
  'Backend-Team',
  'API-Entwicklung, Datenbank-Design und Server-Infrastruktur',
  1, -- Admin als Team-Leader
  true
) ON CONFLICT DO NOTHING;

-- Team-Mitgliedschaften
INSERT INTO team_memberships (team_id, user_id, role)
VALUES 
  (1, 1, 'leader'), -- Admin als Frontend-Team-Leader
  (1, 2, 'member'), -- User als Frontend-Team-Mitglied
  (2, 1, 'leader'), -- Admin als Backend-Team-Leader
  (2, 2, 'member'); -- User als Backend-Team-Mitglied

-- ==============================================
-- DEMO-AKTIVITÄTSLOGS
-- ==============================================

-- Projekt-Logs für Website-Redesign
INSERT INTO project_logs (project_id, user_id, action, details, timestamp)
VALUES 
  (1, 1, 'created', 'Projekt Website-Redesign erstellt', CURRENT_TIMESTAMP - INTERVAL '30 days'),
  (1, 1, 'updated', 'Projektstatus auf aktiv gesetzt', CURRENT_TIMESTAMP - INTERVAL '25 days'),
  (1, 1, 'module_completed', 'Design-System erfolgreich abgeschlossen', CURRENT_TIMESTAMP - INTERVAL '5 days'),
  (1, 1, 'progress_updated', 'Fortschritt auf 65% aktualisiert', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Projekt-Logs für Mobile App
INSERT INTO project_logs (project_id, user_id, action, details, timestamp)
VALUES 
  (2, 1, 'created', 'Projekt Mobile App Entwicklung erstellt', CURRENT_TIMESTAMP - INTERVAL '45 days'),
  (2, 1, 'updated', 'Priorität auf kritisch gesetzt', CURRENT_TIMESTAMP - INTERVAL '40 days'),
  (2, 1, 'module_completed', 'App-Architektur abgeschlossen', CURRENT_TIMESTAMP - INTERVAL '10 days'),
  (2, 1, 'progress_updated', 'Fortschritt auf 40% aktualisiert', CURRENT_TIMESTAMP - INTERVAL '2 hours');

-- Modul-Logs
INSERT INTO module_logs (module_id, module_type, user_id, action, details, timestamp)
VALUES 
  (1, 'project', 1, 'created', 'Modul Design-System erstellen erstellt', CURRENT_TIMESTAMP - INTERVAL '25 days'),
  (1, 'project', 1, 'completed', 'Design-System erfolgreich abgeschlossen', CURRENT_TIMESTAMP - INTERVAL '5 days'),
  (2, 'project', 1, 'created', 'Modul Homepage-Layout erstellt', CURRENT_TIMESTAMP - INTERVAL '20 days'),
  (2, 'project', 1, 'progress_updated', 'Fortschritt auf 75% aktualisiert', CURRENT_TIMESTAMP - INTERVAL '1 day'),
  (3, 'project', 1, 'created', 'Modul Produktseiten erstellt', CURRENT_TIMESTAMP - INTERVAL '15 days'),
  (4, 'project', 1, 'created', 'Modul Kontaktformular erstellt', CURRENT_TIMESTAMP - INTERVAL '10 days'),
  (4, 'project', 1, 'status_changed', 'Status auf Testing gesetzt', CURRENT_TIMESTAMP - INTERVAL '2 days');

-- ==============================================
-- DEMO-BENACHRICHTIGUNGEN
-- ==============================================

-- Benachrichtigungen für Admin
INSERT INTO notifications (user_id, type, title, message, from_user_id, project_id, action_url, is_read, created_at)
VALUES 
  (1, 'project_created', 'Neues Projekt erstellt', 'Das Projekt "Website-Redesign" wurde erfolgreich erstellt.', 1, 1, '/projects/1', false, CURRENT_TIMESTAMP - INTERVAL '30 days'),
  (1, 'project_updated', 'Projekt aktualisiert', 'Das Projekt "Mobile App Entwicklung" wurde aktualisiert.', 1, 2, '/projects/2', false, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
  (1, 'team_invite', 'Team-Einladung', 'Sie wurden zum Frontend-Team eingeladen.', 1, NULL, '/teams/1', true, CURRENT_TIMESTAMP - INTERVAL '1 day'),
  (1, 'system_alert', 'System-Benachrichtigung', 'Neue Dashboard-Features sind verfügbar!', NULL, NULL, '/dashboard', false, CURRENT_TIMESTAMP - INTERVAL '30 minutes');

-- Benachrichtigungen für User
INSERT INTO notifications (user_id, type, title, message, from_user_id, project_id, action_url, is_read, created_at)
VALUES 
  (2, 'team_invite', 'Team-Einladung', 'Sie wurden zum Frontend-Team eingeladen.', 1, NULL, '/teams/1', false, CURRENT_TIMESTAMP - INTERVAL '1 day'),
  (2, 'team_invite', 'Team-Einladung', 'Sie wurden zum Backend-Team eingeladen.', 1, NULL, '/teams/2', false, CURRENT_TIMESTAMP - INTERVAL '1 day'),
  (2, 'user_mention', 'Erwähnung', 'Sie wurden in einem Projekt erwähnt.', 1, 1, '/projects/1', true, CURRENT_TIMESTAMP - INTERVAL '2 days');

-- ==============================================
-- KOMMENTARE
-- ==============================================

-- Diese Demo-Daten bieten:
-- 1. 4 verschiedene Projekte mit unterschiedlichen Status
-- 2. 16 Module/Aufgaben mit verschiedenen Prioritäten und Deadlines
-- 3. 2 Teams mit Mitgliedschaften
-- 4. Aktivitätslogs für Nachverfolgung
-- 5. Benachrichtigungen für verschiedene Szenarien
-- 6. Realistische Zeitstempel und Fortschrittsdaten

-- Die Daten sind so strukturiert, dass sie alle Dashboard-Widgets mit relevanten Inhalten füllen:
-- - Offene Aufgaben: Module mit Status 'not_started', 'in_progress', 'testing'
-- - Anstehende Deadlines: Module mit due_date in den nächsten 7 Tagen
-- - Zuletzt aktualisierte Projekte: Projekte sortiert nach updated_at
-- - Projektfortschritt: Projekte mit verschiedenen completion_percentage Werten
