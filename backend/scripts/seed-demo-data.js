const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Demo-Daten für bessere UX
const seedDemoData = async () => {
  try {
    console.log('🌱 Starte Demo-Daten Seeding...');

    // 1. Demo-Benutzer erstellen
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    const users = [
      {
        username: 'admin',
        email: 'admin@demo.com',
        password_hash: hashedPassword,
        role: 'admin'
      },
      {
        username: 'demo_user',
        email: 'user@demo.com', 
        password_hash: hashedPassword,
        role: 'user'
      }
    ];

    for (const user of users) {
      await pool.query(`
        INSERT INTO users (username, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO UPDATE SET
          email = EXCLUDED.email,
          password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role
      `, [user.username, user.email, user.password_hash, user.role]);
    }

    console.log('✅ Demo-Benutzer erstellt');

    // 2. Demo-Projekte erstellen
    const projects = [
      {
        name: 'Website Redesign',
        description: 'Komplette Überarbeitung der Firmenwebsite',
        status: 'active',
        priority: 'high',
        owner_id: 1,
        target_date: '2024-12-31'
      },
      {
        name: 'Mobile App',
        description: 'Entwicklung einer mobilen App für Kunden',
        status: 'planning',
        priority: 'medium',
        owner_id: 1,
        target_date: '2025-02-15'
      }
    ];

    for (const project of projects) {
      await pool.query(`
        INSERT INTO projects (name, description, status, priority, owner_id, target_date)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, [project.name, project.description, project.status, project.priority, project.owner_id, project.target_date]);
    }

    console.log('✅ Demo-Projekte erstellt');

    // 3. Demo-Tasks erstellen
    const tasks = [
      {
        title: 'Design Mockups erstellen',
        description: 'Wireframes und Mockups für die neue Website',
        status: 'todo',
        priority: 'high',
        assignee_id: 1,
        project_id: 1,
        due_date: '2024-12-25',
        estimated_hours: 16
      },
      {
        title: 'Frontend Framework auswählen',
        description: 'React vs Vue.js vs Angular Vergleich',
        status: 'in_progress',
        priority: 'medium',
        assignee_id: 1,
        project_id: 1,
        due_date: '2024-12-22',
        estimated_hours: 8
      },
      {
        title: 'API-Dokumentation schreiben',
        description: 'Swagger/OpenAPI Dokumentation für Backend',
        status: 'review',
        priority: 'medium',
        assignee_id: 2,
        project_id: 1,
        due_date: '2024-12-28',
        estimated_hours: 12
      },
      {
        title: 'User Stories definieren',
        description: 'Detaillierte User Stories für Mobile App',
        status: 'todo',
        priority: 'high',
        assignee_id: 1,
        project_id: 2,
        due_date: '2025-01-10',
        estimated_hours: 20
      },
      {
        title: 'Technologie-Stack festlegen',
        description: 'React Native vs Flutter vs Native Entwicklung',
        status: 'completed',
        priority: 'high',
        assignee_id: 1,
        project_id: 2,
        due_date: '2024-12-20',
        estimated_hours: 6,
        actual_hours: 8
      },
      {
        title: 'Datenbank-Schema entwerfen',
        description: 'ERD und Tabellen-Design für Mobile App',
        status: 'todo',
        priority: 'medium',
        assignee_id: 2,
        project_id: 2,
        due_date: '2025-01-15',
        estimated_hours: 10
      }
    ];

    for (const task of tasks) {
      await pool.query(`
        INSERT INTO tasks (title, description, status, priority, assignee_id, project_id, due_date, estimated_hours, actual_hours, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT DO NOTHING
      `, [
        task.title, 
        task.description, 
        task.status, 
        task.priority, 
        task.assignee_id, 
        task.project_id, 
        task.due_date, 
        task.estimated_hours,
        task.actual_hours || null,
        task.assignee_id
      ]);
    }

    console.log('✅ Demo-Tasks erstellt');

    // 4. Demo-Team erstellen
    await pool.query(`
      INSERT INTO teams (name, description, team_leader_id)
      VALUES ('Entwicklungsteam', 'Hauptentwicklungsteam für alle Projekte', 1)
      ON CONFLICT DO NOTHING
    `);

    // Team-Mitgliedschaften
    await pool.query(`
      INSERT INTO team_memberships (team_id, user_id, role)
      VALUES (1, 1, 'leader'), (1, 2, 'member')
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ Demo-Team erstellt');

    console.log('🎉 Demo-Daten erfolgreich erstellt!');
    console.log('');
    console.log('📋 Demo-Zugangsdaten:');
    console.log('   Admin: admin / demo123');
    console.log('   User:  demo_user / demo123');
    console.log('');
    console.log('📊 Erstellt:');
    console.log('   - 2 Benutzer');
    console.log('   - 2 Projekte');
    console.log('   - 6 Tasks');
    console.log('   - 1 Team');

  } catch (error) {
    console.error('❌ Fehler beim Erstellen der Demo-Daten:', error);
    throw error;
  }
};

// Script ausführen
if (require.main === module) {
  seedDemoData()
    .then(() => {
      console.log('✅ Demo-Daten Seeding abgeschlossen');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Demo-Daten Seeding fehlgeschlagen:', error);
      process.exit(1);
    });
}

module.exports = { seedDemoData };
