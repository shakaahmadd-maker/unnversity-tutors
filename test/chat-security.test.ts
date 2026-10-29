const BASE_URL = process.env.TEST_APP_URL || 'http://localhost:3000';

function getHeaders(token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Cookie'] = `auth_session=${token}`;
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function registerTestUser(name: string, role: string, suffix: string): Promise<{ token: string; user: any }> {
  const email = `audit_${role}_${suffix}@testmail.com`;
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      password: 'Password123!',
      role,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Failed to register test user ${email}: ${data.error}`);
  }
  return { token: data.token, user: data.user };
}

async function runTests() {
  console.log('--- STARTING CHAT ROOM SECURITY AND INTEGRITY AUDIT TESTS ---\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Logged-out access (401 Unauthorized)
  // -------------------------------------------------------------
  console.log('[Scenario 1]: Logged-out access rejection');
  const unauthGetRooms = await fetch(`${BASE_URL}/api/chat-rooms`, { headers: getHeaders() });
  assert(unauthGetRooms.status === 401, 'GET /api/chat-rooms returns 401 for unauthenticated user');

  const unauthPostRoom = await fetch(`${BASE_URL}/api/chat-rooms`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ title: 'Hacked Room' }),
  });
  assert(unauthPostRoom.status === 401, 'POST /api/chat-rooms returns 401 for unauthenticated user');

  const unauthGetMessages = await fetch(`${BASE_URL}/api/chat-rooms/room_test_1/messages`, { headers: getHeaders() });
  assert(unauthGetMessages.status === 401, 'GET /api/chat-rooms/:id/messages returns 401 for unauthenticated user');

  const unauthPostMessage = await fetch(`${BASE_URL}/api/chat-rooms/room_test_1/messages`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ content: 'Hello' }),
  });
  assert(unauthPostMessage.status === 401, 'POST /api/chat-rooms/:id/messages returns 401 for unauthenticated user');

  // -------------------------------------------------------------
  // Setup Authenticated Test Actors
  // -------------------------------------------------------------
  const testRunId = Date.now().toString(36);
  const studentA = await registerTestUser('Student Alpha', 'student', `a_${testRunId}`);
  const studentB = await registerTestUser('Student Beta', 'student', `b_${testRunId}`);
  const tutorMember = await registerTestUser('Tutor Member', 'tutor', `tm_${testRunId}`);
  const tutorStranger = await registerTestUser('Tutor Stranger', 'tutor', `ts_${testRunId}`);
  
  // Use seeded admin or register subadmin
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'shaka.ahmadd@gmail.com', password: 'Admin@123456' }),
  });
  const adminData = await adminLoginRes.json();
  const subadminToken = adminData.token;

  // -------------------------------------------------------------
  // TEST 2: Room creation & Room membership (403 for non-members)
  // -------------------------------------------------------------
  console.log('\n[Scenario 2]: Room creation and non-member isolation (403 Forbidden)');
  const roomId = `room_audit_${Date.now()}`;
  const createRoomRes = await fetch(`${BASE_URL}/api/chat-rooms`, {
    method: 'POST',
    headers: getHeaders(studentA.token),
    body: JSON.stringify({
      id: roomId,
      title: 'Private Math Consultation',
      memberIds: [tutorMember.user.id],
    }),
  });
  assert(createRoomRes.status === 201, 'Student A can create a private room with Tutor Member');

  // Student B (non-member) attempts to read messages
  const strangerRead = await fetch(`${BASE_URL}/api/chat-rooms/${roomId}/messages`, {
    headers: getHeaders(studentB.token),
  });
  assert(strangerRead.status === 403, 'Non-member Student B gets 403 Forbidden reading room messages');

  // Student B (non-member) attempts to send messages
  const strangerSend = await fetch(`${BASE_URL}/api/chat-rooms/${roomId}/messages`, {
    method: 'POST',
    headers: getHeaders(studentB.token),
    body: JSON.stringify({ content: 'Intruder message' }),
  });
  assert(strangerSend.status === 403, 'Non-member Student B gets 403 Forbidden posting to room');

  // -------------------------------------------------------------
  // TEST 3: Sender impersonation prevention
  // -------------------------------------------------------------
  console.log('\n[Scenario 3]: Sender impersonation prevention');
  const impersonateRes = await fetch(`${BASE_URL}/api/chat-rooms/${roomId}/messages`, {
    method: 'POST',
    headers: getHeaders(studentA.token),
    body: JSON.stringify({
      senderId: 'admin_shaka', // Attempting to spoof admin!
      content: 'This should be attributed to Student A, not admin_shaka',
    }),
  });
  assert(impersonateRes.status === 201, 'Student A sends message with spoof attempt');
  const impersonateData = await impersonateRes.json();
  assert(
    impersonateData.message?.senderId === studentA.user.id,
    `Backend ignores client senderId and forces session user ID (${studentA.user.id})`
  );

  // -------------------------------------------------------------
  // TEST 4: Tutor access (authorized tutor vs unauthorized stranger)
  // -------------------------------------------------------------
  console.log('\n[Scenario 4]: Tutor access control');
  const tutorMemberSend = await fetch(`${BASE_URL}/api/chat-rooms/${roomId}/messages`, {
    method: 'POST',
    headers: getHeaders(tutorMember.token),
    body: JSON.stringify({ content: 'Hello Student A, I reviewed your assignment.' }),
  });
  assert(tutorMemberSend.status === 201, 'Authorized member tutor can post messages to the room');

  const tutorStrangerSend = await fetch(`${BASE_URL}/api/chat-rooms/${roomId}/messages`, {
    method: 'POST',
    headers: getHeaders(tutorStranger.token),
    body: JSON.stringify({ content: 'Unsolicited tutor message' }),
  });
  assert(tutorStrangerSend.status === 403, 'Unauthorized stranger tutor gets 403 Forbidden');

  // -------------------------------------------------------------
  // TEST 5: Subadmin / Admin access
  // -------------------------------------------------------------
  console.log('\n[Scenario 5]: Subadmin / Admin governance access');
  const subadminRead = await fetch(`${BASE_URL}/api/chat-rooms/${roomId}/messages`, {
    headers: getHeaders(subadminToken),
  });
  assert(subadminRead.status === 200, 'Subadmin/Admin can access room messages for support oversight');

  // -------------------------------------------------------------
  // TEST 6: Message length & content validation
  // -------------------------------------------------------------
  console.log('\n[Scenario 6]: Message content & length validation');
  // Empty content
  const emptyRes = await fetch(`${BASE_URL}/api/chat-rooms/${roomId}/messages`, {
    method: 'POST',
    headers: getHeaders(studentA.token),
    body: JSON.stringify({ content: '    ' }),
  });
  assert(emptyRes.status === 400, 'Empty or whitespace-only message returns 400 Bad Request');

  // Over 5,000 characters
  const tooLong = 'A'.repeat(5001);
  const tooLongRes = await fetch(`${BASE_URL}/api/chat-rooms/${roomId}/messages`, {
    method: 'POST',
    headers: getHeaders(studentA.token),
    body: JSON.stringify({ content: tooLong }),
  });
  assert(tooLongRes.status === 400, 'Message exceeding 5,000 characters returns 400 Bad Request');

  // Exactly 5,000 characters
  const validLong = 'B'.repeat(5000);
  const validLongRes = await fetch(`${BASE_URL}/api/chat-rooms/${roomId}/messages`, {
    method: 'POST',
    headers: getHeaders(studentA.token),
    body: JSON.stringify({ content: validLong }),
  });
  assert(validLongRes.status === 201, 'Message within 5,000 characters is accepted with 201 Created');

  console.log(`\n--- TEST SUMMARY: ${passed}/${total} PASSED ---`);
  if (passed === total) {
    console.log('🎉 ALL SECURITY & INTEGRITY AUDIT TESTS PASSED CLEANLY!\n');
    process.exit(0);
  } else {
    console.error('💥 SOME TESTS FAILED!\n');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unexpected test error:', err);
  process.exit(1);
});
