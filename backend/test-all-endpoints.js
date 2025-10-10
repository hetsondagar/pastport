/**
 * Comprehensive Backend API Test Script
 * Tests all major endpoints and database operations
 */

import fetch from 'node-fetch';

const API_BASE = process.env.API_URL || 'http://localhost:5000/api';
let authToken = '';
let userId = '';
let testJournalId = '';
let testCapsuleId = '';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null, useAuth = true) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (useAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// Test Results Tracker
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${name}${message ? ': ' + message : ''}`);
  results.tests.push({ name, passed, message });
  if (passed) results.passed++;
  else results.failed++;
}

// ============================================
// 1. AUTHENTICATION TESTS
// ============================================
console.log('\n📋 TESTING AUTHENTICATION...\n');

async function testAuth() {
  // Test 1: Register new user
  const registerData = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'password123'
  };

  const registerRes = await apiCall('/auth/register', 'POST', registerData, false);
  logTest('Register User', registerRes.data?.success, `Status: ${registerRes.status}`);
  
  if (registerRes.data?.token) {
    authToken = registerRes.data.token;
    userId = registerRes.data.user?._id || registerRes.data.user?.id;
  }

  // Test 2: Login
  const loginRes = await apiCall('/auth/login', 'POST', {
    email: registerData.email,
    password: registerData.password
  }, false);
  logTest('Login User', loginRes.data?.success, `Status: ${loginRes.status}`);

  // Test 3: Get current user
  const meRes = await apiCall('/auth/me');
  logTest('Get Current User', meRes.data?.success && meRes.data?.user, `Status: ${meRes.status}`);
}

// ============================================
// 2. JOURNAL ENTRY TESTS
// ============================================
console.log('\n📔 TESTING JOURNAL ENTRIES...\n');

async function testJournal() {
  // Test 1: Create journal entry
  const createRes = await apiCall('/journal', 'POST', {
    content: 'This is a test journal entry for today!',
    mood: 'happy',
    date: new Date().toISOString(),
    isCapsule: false,
    tags: ['test', 'demo']
  });
  logTest('Create Journal Entry', createRes.data?.success, `Status: ${createRes.status}`);
  
  if (createRes.data?.data?._id) {
    testJournalId = createRes.data.data._id;
  }

  // Test 2: Get month entries
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  const monthRes = await apiCall(`/journal/${userId}/month/${year}/${month}`);
  logTest('Get Month Entries', monthRes.data?.success, `Status: ${monthRes.status}, Entries: ${Object.keys(monthRes.data?.data?.entries || {}).length}`);

  // Test 3: Get streak data
  const streakRes = await apiCall('/journal/streak');
  logTest('Get Journal Streak', streakRes.data?.success, `Streak: ${streakRes.data?.data?.streakCount || 0} days`);

  // Test 4: Update journal entry
  if (testJournalId) {
    const updateRes = await apiCall(`/journal/${testJournalId}`, 'PUT', {
      content: 'Updated journal entry content',
      mood: 'excited'
    });
    logTest('Update Journal Entry', updateRes.data?.success, `Status: ${updateRes.status}`);
  }
}

// ============================================
// 3. CAPSULE TESTS
// ============================================
console.log('\n🕰️  TESTING TIME CAPSULES...\n');

async function testCapsules() {
  // Test 1: Create capsule
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const createRes = await apiCall('/capsules', 'POST', {
    title: 'Test Capsule',
    message: 'This is a test time capsule message',
    emoji: '📝',
    mood: 'excited',
    unlockDate: tomorrow.toISOString(),
    lockType: 'time',
    tags: ['test']
  });
  logTest('Create Capsule', createRes.data?.success, `Status: ${createRes.status}`);
  
  if (createRes.data?.data?._id) {
    testCapsuleId = createRes.data.data._id;
  }

  // Test 2: Get all capsules
  const capsulesRes = await apiCall('/capsules?status=all&page=1&limit=50');
  logTest('Get All Capsules', capsulesRes.data?.success, `Count: ${capsulesRes.data?.data?.capsules?.length || 0}`);

  // Test 3: Get capsule stats
  const statsRes = await apiCall('/capsules/stats');
  logTest('Get Capsule Stats', statsRes.data?.success, `Total: ${statsRes.data?.data?.stats?.totalCapsules || 0}`);

  // Test 4: Get single capsule
  if (testCapsuleId) {
    const singleRes = await apiCall(`/capsules/${testCapsuleId}`);
    logTest('Get Single Capsule', singleRes.data?.success, `Status: ${singleRes.status}`);
  }
}

// ============================================
// 4. LOTTERY SYSTEM TESTS
// ============================================
console.log('\n🎟️  TESTING LOTTERY SYSTEM...\n');

async function testLottery() {
  // Test 1: Get lottery capsule
  const lotteryRes = await apiCall('/lottery');
  logTest('Get Lottery Capsule', lotteryRes.data?.success, `Type: ${lotteryRes.data?.data?.type || 'none'}`);

  // Test 2: Get lottery history
  const historyRes = await apiCall('/lottery/history?page=1&limit=10');
  logTest('Get Lottery History', historyRes.status === 200, `Status: ${historyRes.status}`);
}

// ============================================
// 5. USER PROFILE TESTS
// ============================================
console.log('\n👤 TESTING USER PROFILE...\n');

async function testUserProfile() {
  // Test 1: Get user profile
  const profileRes = await apiCall(`/users/${userId}`);
  logTest('Get User Profile', profileRes.data?.success, `Status: ${profileRes.status}`);

  // Test 2: Update profile
  const updateRes = await apiCall(`/users/${userId}`, 'PUT', {
    bio: 'Updated bio from test script',
    name: 'Test User Updated'
  });
  logTest('Update User Profile', updateRes.data?.success, `Status: ${updateRes.status}`);

  // Test 3: Get user streak
  const streakRes = await apiCall(`/users/${userId}/streak`);
  logTest('Get User Streak', streakRes.status === 200, `Status: ${streakRes.status}`);
}

// ============================================
// 6. NOTIFICATIONS TESTS
// ============================================
console.log('\n🔔 TESTING NOTIFICATIONS...\n');

async function testNotifications() {
  // Test 1: Get notifications
  const notifRes = await apiCall('/notifications?page=1&limit=10');
  logTest('Get Notifications', notifRes.status === 200, `Status: ${notifRes.status}`);

  // Test 2: Get unread count
  const unreadRes = await apiCall('/notifications/unread/count');
  logTest('Get Unread Count', unreadRes.status === 200, `Count: ${unreadRes.data?.count || 0}`);
}

// ============================================
// RUN ALL TESTS
// ============================================
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Backend API Tests...\n');
  console.log(`API Base URL: ${API_BASE}\n`);
  console.log('='.repeat(50));

  try {
    await testAuth();
    await testJournal();
    await testCapsules();
    await testLottery();
    await testUserProfile();
    await testNotifications();
  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
  }

  // Print Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 TEST SUMMARY\n');
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  console.log('\n📋 Detailed Results:\n');
  results.tests.forEach((test, i) => {
    console.log(`${i + 1}. ${test.passed ? '✅' : '❌'} ${test.name}${test.message ? ' - ' + test.message : ''}`);
  });

  console.log('\n' + '='.repeat(50));
  
  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Backend is working correctly.\n');
  } else {
    console.log(`\n⚠️  ${results.failed} test(s) failed. Please check the issues above.\n`);
  }
}

// Execute tests
runAllTests().catch(console.error);

