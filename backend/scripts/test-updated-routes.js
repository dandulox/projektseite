const axios = require('axios');

async function testUpdatedRoutes() {
  console.log('🧪 Teste aktualisierte API-Routen...\n');
  
  try {
    // 1. Authentifizierung
    console.log('1️⃣ Authentifizierung...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'admin',
      password: 'admin'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Authentifizierung erfolgreich');
    
    // 2. Teams-Route testen
    console.log('\n2️⃣ Teams-Route testen...');
    try {
      const teamsResponse = await axios.get('http://localhost:3001/api/teams', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ GET /api/teams erfolgreich');
      console.log(`   - Anzahl Teams: ${teamsResponse.data.teams.length}`);
      
      // Teste einzelnes Team (falls Teams vorhanden)
      if (teamsResponse.data.teams.length > 0) {
        const teamId = teamsResponse.data.teams[0].id;
        try {
          const teamResponse = await axios.get(`http://localhost:3001/api/teams/${teamId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('✅ GET /api/teams/:id erfolgreich');
          console.log(`   - Team: ${teamResponse.data.team.name}`);
          console.log(`   - Mitglieder: ${teamResponse.data.members.length}`);
          console.log(`   - Projekte: ${teamResponse.data.projects.length}`);
        } catch (teamError) {
          console.error('❌ GET /api/teams/:id fehlgeschlagen:', teamError.response?.status, teamError.response?.data);
        }
      } else {
        console.log('ℹ️ Keine Teams vorhanden, überspringe Einzelteam-Test');
      }
    } catch (teamsError) {
      console.error('❌ GET /api/teams fehlgeschlagen:', teamsError.response?.status, teamsError.response?.data);
    }
    
    // 3. POST /api/projects testen
    console.log('\n3️⃣ POST /api/projects testen...');
    try {
      const projectData = {
        name: 'Test-Projekt',
        description: 'Ein Test-Projekt zur Überprüfung der API',
        status: 'planning',
        priority: 'medium',
        visibility: 'private'
      };
      
      const projectResponse = await axios.post('http://localhost:3001/api/projects', projectData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ POST /api/projects erfolgreich');
      console.log(`   - Projekt erstellt: ${projectResponse.data.project.name}`);
      console.log(`   - Projekt-ID: ${projectResponse.data.project.id}`);
      
      // Lösche das Test-Projekt wieder
      try {
        await axios.delete(`http://localhost:3001/api/projects/${projectResponse.data.project.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Test-Projekt erfolgreich gelöscht');
      } catch (deleteError) {
        console.warn('⚠️ Test-Projekt konnte nicht gelöscht werden:', deleteError.response?.status);
      }
      
    } catch (projectError) {
      console.error('❌ POST /api/projects fehlgeschlagen:', projectError.response?.status, projectError.response?.data);
    }
    
    // 4. Dashboard-Route testen
    console.log('\n4️⃣ Dashboard-Route testen...');
    try {
      const dashboardResponse = await axios.get('http://localhost:3001/api/dashboard/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ GET /api/dashboard/me erfolgreich');
      console.log('   - Widgets vorhanden:', Object.keys(dashboardResponse.data.widgets || {}));
      console.log('   - Summary vorhanden:', !!dashboardResponse.data.summary);
    } catch (dashboardError) {
      console.error('❌ GET /api/dashboard/me fehlgeschlagen:', dashboardError.response?.status, dashboardError.response?.data);
    }
    
    // 5. Tasks-Route testen
    console.log('\n5️⃣ Tasks-Route testen...');
    try {
      const tasksResponse = await axios.get('http://localhost:3001/api/tasks/my-tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ GET /api/tasks/my-tasks erfolgreich');
      console.log(`   - Anzahl Tasks: ${tasksResponse.data.tasks.length}`);
    } catch (tasksError) {
      console.error('❌ GET /api/tasks/my-tasks fehlgeschlagen:', tasksError.response?.status, tasksError.response?.data);
    }
    
    // 6. Admin-Route testen
    console.log('\n6️⃣ Admin-Route testen...');
    try {
      const adminResponse = await axios.get('http://localhost:3001/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ GET /api/admin/users erfolgreich');
      console.log(`   - Anzahl Benutzer: ${adminResponse.data.users.length}`);
    } catch (adminError) {
      console.error('❌ GET /api/admin/users fehlgeschlagen:', adminError.response?.status, adminError.response?.data);
    }
    
    console.log('\n🎉 Alle Tests abgeschlossen!');
    
  } catch (error) {
    console.error('❌ Test fehlgeschlagen:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Führe Test aus
testUpdatedRoutes();
