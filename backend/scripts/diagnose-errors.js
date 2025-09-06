const pool = require('../config/database');
const { authenticateToken } = require('../routes/auth');

async function diagnoseErrors() {
  console.log('🔍 Starte umfassende Diagnose der API-Fehler...\n');
  
  try {
    // 1. Datenbankverbindung testen
    console.log('1️⃣ Teste Datenbankverbindung...');
    const connectionTest = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Datenbankverbindung erfolgreich');
    console.log(`   Zeit: ${connectionTest.rows[0].current_time}`);
    console.log(`   PostgreSQL Version: ${connectionTest.rows[0].pg_version.split(' ')[0]}\n`);
    
    // 2. Prüfe alle wichtigen Tabellen
    console.log('2️⃣ Prüfe Datenbankschema...');
    const requiredTables = [
      'users', 'projects', 'tasks', 'teams', 'project_modules', 
      'team_memberships', 'notifications', 'project_activity_logs',
      'module_activity_logs', 'system_versions'
    ];
    
    const existingTables = [];
    const missingTables = [];
    
    for (const table of requiredTables) {
      try {
        const result = await pool.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = $1
        `, [table]);
        
        if (parseInt(result.rows[0].count) > 0) {
          existingTables.push(table);
          // Prüfe auch die Anzahl der Einträge
          const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
          console.log(`✅ Tabelle '${table}': ${countResult.rows[0].count} Einträge`);
        } else {
          missingTables.push(table);
          console.log(`❌ Tabelle '${table}': FEHLT`);
        }
      } catch (error) {
        missingTables.push(table);
        console.log(`❌ Tabelle '${table}': FEHLER - ${error.message}`);
      }
    }
    
    console.log(`\n📊 Schema-Status: ${existingTables.length}/${requiredTables.length} Tabellen vorhanden\n`);
    
    // 3. Prüfe Benutzer-Tabelle
    console.log('3️⃣ Prüfe Benutzer-Tabelle...');
    try {
      const usersResult = await pool.query('SELECT id, username, email, role, is_active FROM users LIMIT 5');
      if (usersResult.rows.length > 0) {
        console.log('✅ Benutzer gefunden:');
        usersResult.rows.forEach(user => {
          console.log(`   - ${user.username} (${user.email}) - ${user.role} - ${user.is_active ? 'aktiv' : 'inaktiv'}`);
        });
      } else {
        console.log('⚠️ Keine Benutzer in der Datenbank gefunden');
      }
    } catch (error) {
      console.log(`❌ Fehler beim Abrufen der Benutzer: ${error.message}`);
    }
    
    // 4. Teste spezifische Queries, die in den API-Routen verwendet werden
    console.log('\n4️⃣ Teste API-spezifische Queries...');
    
    // Teste Tasks-Query
    try {
      const tasksQuery = `
        SELECT 
          t.*,
          p.name as project_name,
          pm.name as module_name,
          u.username as assignee_username,
          u.email as assignee_email,
          creator.username as created_by_username
        FROM tasks t
        LEFT JOIN projects p ON p.id = t.project_id
        LEFT JOIN project_modules pm ON pm.id = t.module_id
        LEFT JOIN users u ON u.id = t.assignee_id
        LEFT JOIN users creator ON creator.id = t.created_by
        LIMIT 1
      `;
      
      const tasksResult = await pool.query(tasksQuery);
      console.log('✅ Tasks-Query erfolgreich');
    } catch (error) {
      console.log(`❌ Tasks-Query fehlgeschlagen: ${error.message}`);
    }
    
    // Teste Projects-Query
    try {
      const projectsQuery = `
        SELECT p.*, 
               u.username as owner_username
        FROM projects p
        LEFT JOIN users u ON u.id = p.owner_id
        LIMIT 1
      `;
      
      const projectsResult = await pool.query(projectsQuery);
      console.log('✅ Projects-Query erfolgreich');
    } catch (error) {
      console.log(`❌ Projects-Query fehlgeschlagen: ${error.message}`);
    }
    
    // Teste Dashboard-Query
    try {
      const dashboardQuery = `
        SELECT 
          t.id,
          t.title as name,
          t.description,
          t.status,
          t.priority,
          t.due_date,
          t.estimated_hours,
          t.actual_hours,
          0 as completion_percentage,
          p.name as project_name,
          p.id as project_id,
          p.owner_id as project_owner_id,
          u.username as assigned_username
        FROM tasks t
        JOIN projects p ON p.id = t.project_id
        LEFT JOIN users u ON u.id = t.assignee_id
        LIMIT 1
      `;
      
      const dashboardResult = await pool.query(dashboardQuery);
      console.log('✅ Dashboard-Query erfolgreich');
    } catch (error) {
      console.log(`❌ Dashboard-Query fehlgeschlagen: ${error.message}`);
    }
    
    // 5. Prüfe Indizes
    console.log('\n5️⃣ Prüfe wichtige Indizes...');
    const importantIndexes = [
      'idx_tasks_assignee',
      'idx_tasks_status', 
      'idx_tasks_project',
      'idx_projects_owner',
      'idx_projects_status'
    ];
    
    for (const index of importantIndexes) {
      try {
        const indexResult = await pool.query(`
          SELECT indexname 
          FROM pg_indexes 
          WHERE indexname = $1 AND schemaname = 'public'
        `, [index]);
        
        if (indexResult.rows.length > 0) {
          console.log(`✅ Index '${index}' vorhanden`);
        } else {
          console.log(`⚠️ Index '${index}' fehlt`);
        }
      } catch (error) {
        console.log(`❌ Fehler beim Prüfen des Index '${index}': ${error.message}`);
      }
    }
    
    // 6. Prüfe Funktionen
    console.log('\n6️⃣ Prüfe wichtige Funktionen...');
    const importantFunctions = [
      'calculate_project_progress',
      'update_project_progress',
      'log_project_activity',
      'get_user_task_stats'
    ];
    
    for (const func of importantFunctions) {
      try {
        const funcResult = await pool.query(`
          SELECT routine_name 
          FROM information_schema.routines 
          WHERE routine_name = $1 AND routine_schema = 'public'
        `, [func]);
        
        if (funcResult.rows.length > 0) {
          console.log(`✅ Funktion '${func}' vorhanden`);
        } else {
          console.log(`⚠️ Funktion '${func}' fehlt`);
        }
      } catch (error) {
        console.log(`❌ Fehler beim Prüfen der Funktion '${func}': ${error.message}`);
      }
    }
    
    // 7. Zusammenfassung
    console.log('\n📋 DIAGNOSE-ZUSAMMENFASSUNG:');
    console.log(`✅ Datenbankverbindung: OK`);
    console.log(`📊 Tabellen: ${existingTables.length}/${requiredTables.length} vorhanden`);
    console.log(`❌ Fehlende Tabellen: ${missingTables.length > 0 ? missingTables.join(', ') : 'Keine'}`);
    
    if (missingTables.length > 0) {
      console.log('\n🚨 KRITISCHE PROBLEME GEFUNDEN:');
      console.log('Die folgenden Tabellen fehlen und verursachen die 500-Fehler:');
      missingTables.forEach(table => console.log(`   - ${table}`));
      console.log('\n💡 LÖSUNG: Führe das Datenbankschema-Skript aus:');
      console.log('   psql -U admin -d projektseite -f database/init/01_schema.sql');
    } else {
      console.log('\n✅ Schema ist vollständig - Problem liegt woanders');
    }
    
  } catch (error) {
    console.error('❌ Diagnose fehlgeschlagen:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
    console.log('\n🔚 Diagnose abgeschlossen');
  }
}

// Führe Diagnose aus
diagnoseErrors();
