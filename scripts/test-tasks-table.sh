#!/bin/bash

# Test Script für Tasks-Tabelle
# Prüft ob die Tasks-Tabelle existiert und Demo-Daten hat

echo "🔍 Teste Tasks-Tabelle..."

# Verbinde zur PostgreSQL-Datenbank
PGPASSWORD=secure_password_123 psql -h localhost -U admin -d projektseite << EOF

-- Prüfe ob Tasks-Tabelle existiert
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') 
        THEN '✅ Tasks-Tabelle existiert'
        ELSE '❌ Tasks-Tabelle fehlt'
    END as table_status;

-- Zeige Tabellen-Struktur
\dt tasks

-- Zeige Anzahl der Tasks
SELECT COUNT(*) as task_count FROM tasks;

-- Zeige erste 5 Tasks
SELECT id, title, status, priority, assignee_id, due_date 
FROM tasks 
ORDER BY id 
LIMIT 5;

-- Zeige Tasks pro Benutzer
SELECT 
    u.username,
    COUNT(t.id) as task_count,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_count
FROM users u
LEFT JOIN tasks t ON t.assignee_id = u.id
GROUP BY u.id, u.username
ORDER BY task_count DESC;

EOF

echo "✅ Tasks-Tabelle Test abgeschlossen!"
