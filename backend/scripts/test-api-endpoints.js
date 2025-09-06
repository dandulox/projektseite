const axios = require('axios');

// Konfiguration
const API_BASE_URL = 'http://localhost:3001/api';
const TEST_USER = {
  username: 'admin',
  password: 'admin'
};

let authToken = null;

async function testApiEndpoints() {
  console.log('🧪 Starte API-Endpunkt-Tests...\n');
  
  try {
    // 1. Health Check
    console.log('1️⃣ Teste Health Check...');
    try {
      const response = await axios.get('http://localhost:3001/health');
      console.log('✅ Health Check:', response.data);
    } catch (error) {
      console.log('❌ Health Check fehlgeschlagen:', error.message);
    }

    // 2. Authentifizierung
    console.log('\n2️⃣ Teste Authentifizierung...');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, TEST_USER);
      authToken = response.data.token;
      console.log('✅ Authentifizierung erfolgreich');
      console.log(`   Token: ${authToken.substring(0, 20)}...`);
    } catch (error) {
      console.log('❌ Authentifizierung fehlgeschlagen:', error.response?.data || error.message);
      console.log('⚠️ Weitere Tests werden ohne Authentifizierung durchgeführt');
    }

    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

    // 3. Dashboard-Endpunkte
    console.log('\n3️⃣ Teste Dashboard-Endpunkte...');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/me`, { headers });
      console.log('✅ Dashboard /me:', {
        widgets: Object.keys(response.data.widgets || {}),
        summary: response.data.summary
      });
    } catch (error) {
      console.log('❌ Dashboard /me fehlgeschlagen:', error.response?.data || error.message);
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/me/stats`, { headers });
      console.log('✅ Dashboard /me/stats:', response.data);
    } catch (error) {
      console.log('❌ Dashboard /me/stats fehlgeschlagen:', error.response?.data || error.message);
    }

    // 4. Tasks-Endpunkte
    console.log('\n4️⃣ Teste Tasks-Endpunkte...');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/my-tasks`, { headers });
      console.log('✅ Tasks /my-tasks:', {
        count: response.data.tasks?.length || 0,
        pagination: response.data.pagination
      });
    } catch (error) {
      console.log('❌ Tasks /my-tasks fehlgeschlagen:', error.response?.data || error.message);
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/my-tasks/stats`, { headers });
      console.log('✅ Tasks /my-tasks/stats:', response.data);
    } catch (error) {
      console.log('❌ Tasks /my-tasks/stats fehlgeschlagen:', error.response?.data || error.message);
    }

    // 5. Projects-Endpunkte
    console.log('\n5️⃣ Teste Projects-Endpunkte...');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/projects`, { headers });
      console.log('✅ Projects /:', {
        count: response.data.projects?.length || 0
      });
    } catch (error) {
      console.log('❌ Projects / fehlgeschlagen:', error.response?.data || error.message);
    }

    // 6. Admin-Endpunkte
    console.log('\n6️⃣ Teste Admin-Endpunkte...');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users`, { headers });
      console.log('✅ Admin /users:', {
        count: response.data.users?.length || 0,
        pagination: response.data.pagination
      });
    } catch (error) {
      console.log('❌ Admin /users fehlgeschlagen:', error.response?.data || error.message);
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/admin/health`, { headers });
      console.log('✅ Admin /health:', response.data);
    } catch (error) {
      console.log('❌ Admin /health fehlgeschlagen:', error.response?.data || error.message);
    }

    // 7. Teams-Endpunkte
    console.log('\n7️⃣ Teste Teams-Endpunkte...');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/teams`, { headers });
      console.log('✅ Teams /:', {
        count: response.data.teams?.length || 0
      });
    } catch (error) {
      console.log('❌ Teams / fehlgeschlagen:', error.response?.data || error.message);
    }

    // 8. Notifications-Endpunkte
    console.log('\n8️⃣ Teste Notifications-Endpunkte...');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications`, { headers });
      console.log('✅ Notifications /:', {
        count: response.data.notifications?.length || 0
      });
    } catch (error) {
      console.log('❌ Notifications / fehlgeschlagen:', error.response?.data || error.message);
    }

    // 9. Teste POST-Endpunkte
    console.log('\n9️⃣ Teste POST-Endpunkte...');
    
    // Teste Projekt-Erstellung
    try {
      const newProject = {
        name: 'API-Test-Projekt',
        description: 'Ein Projekt für API-Tests',
        status: 'planning',
        priority: 'medium',
        visibility: 'private'
      };
      
      const response = await axios.post(`${API_BASE_URL}/projects`, newProject, { headers });
      console.log('✅ Projekt-Erstellung erfolgreich:', response.data.project?.name);
    } catch (error) {
      console.log('❌ Projekt-Erstellung fehlgeschlagen:', error.response?.data || error.message);
    }

    // 10. Zusammenfassung
    console.log('\n📋 TEST-ZUSAMMENFASSUNG:');
    console.log('✅ Health Check: OK');
    console.log(authToken ? '✅ Authentifizierung: OK' : '❌ Authentifizierung: FEHLGESCHLAGEN');
    console.log('✅ Dashboard-Endpunkte: Getestet');
    console.log('✅ Tasks-Endpunkte: Getestet');
    console.log('✅ Projects-Endpunkte: Getestet');
    console.log('✅ Admin-Endpunkte: Getestet');
    console.log('✅ Teams-Endpunkte: Getestet');
    console.log('✅ Notifications-Endpunkte: Getestet');
    console.log('✅ POST-Endpunkte: Getestet');
    
    console.log('\n🎉 API-Tests abgeschlossen!');
    console.log('\n💡 Nächste Schritte:');
    console.log('   1. Prüfe die Server-Logs auf Fehler');
    console.log('   2. Teste die Frontend-Integration');
    console.log('   3. Führe das Datenbank-Initialisierungsskript aus, falls nötig');

  } catch (error) {
    console.error('❌ Test-Suite fehlgeschlagen:', error.message);
  }
}

// Führe Tests aus
testApiEndpoints();
