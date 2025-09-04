const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Teste Greetings API...');
    
    const baseUrl = 'http://localhost:3001';
    
    // Test 1: Health Check
    console.log('1. Teste Health Check...');
    try {
      const healthResponse = await fetch(`${baseUrl}/health`);
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('✅ Health Check OK:', healthData);
      } else {
        console.log('❌ Health Check fehlgeschlagen:', healthResponse.status);
      }
    } catch (error) {
      console.log('❌ Health Check Fehler:', error.message);
    }
    
    // Test 2: Greetings API
    console.log('2. Teste Greetings API...');
    try {
      const greetingsResponse = await fetch(`${baseUrl}/api/greetings`);
      console.log('Status:', greetingsResponse.status);
      console.log('Headers:', Object.fromEntries(greetingsResponse.headers.entries()));
      
      if (greetingsResponse.ok) {
        const greetingsData = await greetingsResponse.json();
        console.log('✅ Greetings API OK:', greetingsData.length, 'Begrüßungen');
        if (greetingsData.length > 0) {
          console.log('Erste Begrüßung:', greetingsData[0]);
        }
      } else {
        const errorText = await greetingsResponse.text();
        console.log('❌ Greetings API Fehler:', errorText);
      }
    } catch (error) {
      console.log('❌ Greetings API Fehler:', error.message);
    }
    
    // Test 3: Random Greeting
    console.log('3. Teste Random Greeting...');
    try {
      const randomResponse = await fetch(`${baseUrl}/api/greetings/random`);
      if (randomResponse.ok) {
        const randomData = await randomResponse.json();
        console.log('✅ Random Greeting OK:', randomData);
      } else {
        const errorText = await randomResponse.text();
        console.log('❌ Random Greeting Fehler:', errorText);
      }
    } catch (error) {
      console.log('❌ Random Greeting Fehler:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Allgemeiner Fehler:', error);
  }
}

testAPI();
