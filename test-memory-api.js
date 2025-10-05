// Test script for Memory API
const API_BASE_URL = 'http://localhost:5000/api';

async function testMemoryAPI() {
  try {
    console.log('🧪 Testing Memory API...\n');

    // Test 1: Create a test memory
    console.log('1. Creating test memory...');
    const createResponse = await fetch(`${API_BASE_URL}/memories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      },
      body: JSON.stringify({
        title: 'Trip to Paris',
        content: 'Amazing vacation in Paris with beautiful architecture and delicious food.',
        category: 'Travel',
        importance: 8,
        tags: ['vacation', 'paris', 'travel'],
        relatedIds: []
      })
    });

    if (createResponse.ok) {
      const memory = await createResponse.json();
      console.log('✅ Memory created successfully:', memory.data.title);
      
      // Test 2: Get all memories
      console.log('\n2. Fetching all memories...');
      const getResponse = await fetch(`${API_BASE_URL}/memories`, {
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE'
        }
      });

      if (getResponse.ok) {
        const memories = await getResponse.json();
        console.log('✅ Memories fetched successfully:', memories.data.length, 'memories found');
      } else {
        console.log('❌ Failed to fetch memories:', getResponse.status);
      }
    } else {
      console.log('❌ Failed to create memory:', createResponse.status);
    }

  } catch (error) {
    console.error('❌ Error testing Memory API:', error.message);
  }
}

// Run the test
testMemoryAPI();
