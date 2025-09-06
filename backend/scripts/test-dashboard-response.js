const axios = require('axios');

async function testDashboardResponse() {
  console.log('🧪 Teste Dashboard-API-Response...\n');
  
  try {
    // 1. Authentifizierung
    console.log('1️⃣ Authentifizierung...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'admin',
      password: 'admin'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Authentifizierung erfolgreich');
    
    // 2. Dashboard-Daten abrufen
    console.log('\n2️⃣ Dashboard-Daten abrufen...');
    const dashboardResponse = await axios.get('http://localhost:3001/api/dashboard/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = dashboardResponse.data;
    console.log('✅ Dashboard-Daten erfolgreich abgerufen');
    
    // 3. Datenstruktur analysieren
    console.log('\n3️⃣ Datenstruktur-Analyse:');
    console.log('📊 Top-Level-Struktur:');
    console.log(`   - widgets: ${typeof data.widgets}`);
    console.log(`   - summary: ${typeof data.summary}`);
    console.log(`   - timezone: ${data.timezone}`);
    console.log(`   - lastUpdated: ${data.lastUpdated}`);
    
    // 4. Widgets prüfen
    console.log('\n4️⃣ Widgets prüfen:');
    const expectedWidgets = ['openTasks', 'upcomingDeadlines', 'recentProjects', 'projectProgress'];
    
    expectedWidgets.forEach(widgetName => {
      if (data.widgets && data.widgets[widgetName]) {
        const widget = data.widgets[widgetName];
        console.log(`✅ ${widgetName}:`);
        console.log(`   - title: ${widget.title}`);
        console.log(`   - count: ${widget.count}`);
        console.log(`   - items: ${Array.isArray(widget.items) ? widget.items.length : 'NICHT EIN ARRAY'}`);
        
        if (Array.isArray(widget.items) && widget.items.length > 0) {
          console.log(`   - Erstes Item:`, {
            id: widget.items[0].id,
            name: widget.items[0].name,
            status: widget.items[0].status
          });
        }
      } else {
        console.log(`❌ ${widgetName}: FEHLT`);
      }
    });
    
    // 5. Summary prüfen
    console.log('\n5️⃣ Summary prüfen:');
    if (data.summary) {
      console.log('✅ Summary vorhanden:');
      console.log(`   - totalOpenTasks: ${data.summary.totalOpenTasks}`);
      console.log(`   - totalUpcomingDeadlines: ${data.summary.totalUpcomingDeadlines}`);
      console.log(`   - totalActiveProjects: ${data.summary.totalActiveProjects}`);
      console.log(`   - averageProjectProgress: ${data.summary.averageProjectProgress}`);
    } else {
      console.log('❌ Summary fehlt');
    }
    
    // 6. Vollständige Response ausgeben
    console.log('\n6️⃣ Vollständige Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // 7. Frontend-Kompatibilität prüfen
    console.log('\n7️⃣ Frontend-Kompatibilität:');
    const issues = [];
    
    if (!data.widgets) {
      issues.push('widgets fehlt');
    } else {
      expectedWidgets.forEach(widgetName => {
        if (!data.widgets[widgetName]) {
          issues.push(`${widgetName} Widget fehlt`);
        } else if (!Array.isArray(data.widgets[widgetName].items)) {
          issues.push(`${widgetName}.items ist kein Array`);
        }
      });
    }
    
    if (!data.summary) {
      issues.push('summary fehlt');
    }
    
    if (issues.length === 0) {
      console.log('✅ Frontend-kompatible Datenstruktur');
    } else {
      console.log('❌ Frontend-Kompatibilitätsprobleme:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
  } catch (error) {
    console.error('❌ Test fehlgeschlagen:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Führe Test aus
testDashboardResponse();
