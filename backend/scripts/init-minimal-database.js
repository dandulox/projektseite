const pool = require('../config/database');

async function initMinimalDatabase() {
  console.log('🔧 Initialisiere minimale Datenbank...\n');
  
  try {
    // 1. Benutzer-Tabelle
    console.log('1️⃣ Erstelle Benutzer-Tabelle...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Benutzer-Tabelle erstellt');

    // 2. Projekte-Tabelle
    console.log('2️⃣ Erstelle Projekte-Tabelle...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
        start_date DATE,
        target_date DATE,
        completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
        owner_id INTEGER REFERENCES users(id),
        team_id INTEGER,
        visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'public')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Projekte-Tabelle erstellt');

    // 3. Tasks-Tabelle
    console.log('3️⃣ Erstelle Tasks-Tabelle...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'cancelled')),
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
        assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        module_id INTEGER,
        due_date DATE,
        estimated_hours DECIMAL(8,2),
        actual_hours DECIMAL(8,2),
        tags TEXT[],
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )
    `);
    console.log('✅ Tasks-Tabelle erstellt');

    // 4. Teams-Tabelle
    console.log('4️⃣ Erstelle Teams-Tabelle...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        team_leader_id INTEGER REFERENCES users(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Teams-Tabelle erstellt');

    // 5. Team-Mitgliedschaften
    console.log('5️⃣ Erstelle Team-Mitgliedschaften-Tabelle...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS team_memberships (
        id SERIAL PRIMARY KEY,
        team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('leader', 'member', 'viewer')),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team_id, user_id)
      )
    `);
    console.log('✅ Team-Mitgliedschaften-Tabelle erstellt');

    // 6. Projekt-Module-Tabelle
    console.log('6️⃣ Erstelle Projekt-Module-Tabelle...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_modules (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'testing', 'completed')),
        priority VARCHAR(20) DEFAULT 'medium',
        estimated_hours DECIMAL(8,2),
        actual_hours DECIMAL(8,2),
        assigned_to INTEGER REFERENCES users(id),
        due_date DATE,
        visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'public')),
        team_id INTEGER REFERENCES teams(id),
        completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
        start_date DATE,
        tags TEXT[],
        dependencies TEXT[],
        is_template BOOLEAN DEFAULT false,
        template_id INTEGER REFERENCES project_modules(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Projekt-Module-Tabelle erstellt');

    // 7. Benachrichtigungen-Tabelle
    console.log('7️⃣ Erstelle Benachrichtigungen-Tabelle...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        from_user_id INTEGER NULL,
        team_id INTEGER NULL,
        project_id INTEGER NULL,
        action_url VARCHAR(500) NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Benachrichtigungen-Tabelle erstellt');

    // 8. Wichtige Indizes erstellen
    console.log('8️⃣ Erstelle wichtige Indizes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id)',
      'CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id)',
      'CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)',
      'CREATE INDEX IF NOT EXISTS idx_teams_leader ON teams(team_leader_id)',
      'CREATE INDEX IF NOT EXISTS idx_team_memberships_team ON team_memberships(team_id)',
      'CREATE INDEX IF NOT EXISTS idx_team_memberships_user ON team_memberships(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read)'
    ];

    for (const indexQuery of indexes) {
      await pool.query(indexQuery);
    }
    console.log('✅ Indizes erstellt');

    // 9. Standard-Benutzer erstellen
    console.log('9️⃣ Erstelle Standard-Benutzer...');
    const bcrypt = require('bcryptjs');
    
    // Prüfe ob Admin bereits existiert
    const adminCheck = await pool.query('SELECT id FROM users WHERE username = $1', ['admin']);
    if (adminCheck.rows.length === 0) {
      const adminPasswordHash = await bcrypt.hash('admin', 10);
      await pool.query(`
        INSERT INTO users (username, email, password_hash, role, is_active)
        VALUES ($1, $2, $3, $4, $5)
      `, ['admin', 'admin@projektseite.de', adminPasswordHash, 'admin', true]);
      console.log('✅ Admin-Benutzer erstellt (admin/admin)');
    } else {
      console.log('ℹ️ Admin-Benutzer bereits vorhanden');
    }

    // Prüfe ob User bereits existiert
    const userCheck = await pool.query('SELECT id FROM users WHERE username = $1', ['user']);
    if (userCheck.rows.length === 0) {
      const userPasswordHash = await bcrypt.hash('user123', 10);
      await pool.query(`
        INSERT INTO users (username, email, password_hash, role, is_active)
        VALUES ($1, $2, $3, $4, $5)
      `, ['user', 'user@projektseite.de', userPasswordHash, 'user', true]);
      console.log('✅ Standard-Benutzer erstellt (user/user123)');
    } else {
      console.log('ℹ️ Standard-Benutzer bereits vorhanden');
    }

    // 10. Test-Daten erstellen
    console.log('🔟 Erstelle Test-Daten...');
    
    // Test-Projekt
    const projectCheck = await pool.query('SELECT id FROM projects WHERE name = $1', ['Test-Projekt']);
    if (projectCheck.rows.length === 0) {
      const projectResult = await pool.query(`
        INSERT INTO projects (name, description, status, priority, owner_id, visibility)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, ['Test-Projekt', 'Ein Test-Projekt für die Entwicklung', 'active', 'medium', 1, 'public']);
      
      const projectId = projectResult.rows[0].id;
      
      // Test-Task
      await pool.query(`
        INSERT INTO tasks (title, description, status, priority, assignee_id, project_id, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, ['Test-Aufgabe', 'Eine Test-Aufgabe', 'todo', 'medium', 2, projectId, 1]);
      
      console.log('✅ Test-Daten erstellt');
    } else {
      console.log('ℹ️ Test-Daten bereits vorhanden');
    }

    console.log('\n🎉 Minimale Datenbank erfolgreich initialisiert!');
    console.log('\n📋 Verfügbare Benutzer:');
    console.log('   👑 Admin: admin / admin');
    console.log('   👤 User: user / user123');
    console.log('\n🚀 Die API sollte jetzt funktionieren!');

  } catch (error) {
    console.error('❌ Fehler bei der Datenbank-Initialisierung:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
    console.log('\n🔚 Datenbankverbindung geschlossen');
  }
}

// Führe Initialisierung aus
initMinimalDatabase();
