// Simple API test script
// Run this with: node test-api.js

const testApiEndpoints = async () => {
  const baseUrl = 'http://localhost:3001';

  console.log('🧪 Testing Vehicle Sales API endpoints...\n');

  try {
    // Test 1: Get all vehicles
    console.log('1️⃣ Testing GET /vehicles');
    const vehiclesResponse = await fetch(`${baseUrl}/vehicles`);
    console.log('Status:', vehiclesResponse.status);

    if (vehiclesResponse.ok) {
      const vehiclesData = await vehiclesResponse.json();
      console.log('✅ Vehicles endpoint working');
      console.log('Total vehicles:', vehiclesData.total);
      console.log('Vehicles in response:', vehiclesData.data?.length || 0);
    } else {
      console.log('❌ Vehicles endpoint failed');
    }

    console.log('\n---\n');

    // Test 2: Get vehicle stats
    console.log('2️⃣ Testing GET /vehicles/stats');
    const statsResponse = await fetch(`${baseUrl}/vehicles/stats`);
    console.log('Status:', statsResponse.status);

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Stats endpoint working');
      console.log('Stats response:', JSON.stringify(statsData, null, 2));
      console.log('Vehicle types:', statsData.vehicleTypes);
      console.log('Total vehicles:', statsData.totalVehicles);
    } else {
      console.log('❌ Stats endpoint failed');
      const errorText = await statsResponse.text();
      console.log('Error:', errorText);
    }

  } catch (error) {
    console.log('🚨 Network Error - Is backend running on port 3001?');
    console.log('Error:', error.message);
    console.log('\n💡 To fix:');
    console.log('1. cd backend');
    console.log('2. npm run start:dev');
    console.log('3. npm run seed:all (if database is empty)');
  }
};

testApiEndpoints();