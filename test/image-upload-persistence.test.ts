import fs from 'fs';
import path from 'path';
import { db, isDbConnected } from '../src/db/index';
import { tutors, users } from '../src/db/schema';
import { eq } from 'drizzle-orm';

const BASE_URL = process.env.TEST_APP_URL || 'http://localhost:3000';
const UPLOADS_DIR = process.env.UPLOADS_DIR || '/app/uploads';

function getHeaders(token?: string, extra: Record<string, string> = {}) {
  const headers: Record<string, string> = { ...extra };
  if (token) {
    headers['Cookie'] = `auth_session=${token}`;
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function registerTestUser(name: string, role: string, suffix: string): Promise<{ token: string; user: any }> {
  const email = `test_${role}_${suffix}_${Date.now()}@testplatform.com`;
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      password: 'AdminPassword123!',
      role,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Failed to register test user ${email}: ${data.error}`);
  }
  return { token: data.token, user: data.user };
}

// Minimal valid 1x1 JPEG image buffer
const SAMPLE_JPEG = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
  0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
  0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
  0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20,
  0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27,
  0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
  0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
  0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
  0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
  0x00, 0xbf, 0x80, 0xff, 0xd9
]);

function buildMultipartBody(fields: Record<string, string>, fileField?: { name: string; filename: string; mime: string; buffer: Buffer }) {
  const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`;
  const chunks: Buffer[] = [];

  for (const [k, v] of Object.entries(fields)) {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`));
  }

  if (fileField) {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${fileField.name}"; filename="${fileField.filename}"\r\nContent-Type: ${fileField.mime}\r\n\r\n`));
    chunks.push(fileField.buffer);
    chunks.push(Buffer.from('\r\n'));
  }

  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  return {
    contentType: `multipart/form-data; boundary=${boundary}`,
    body: Buffer.concat(chunks)
  };
}

async function runTests() {
  console.log('=== RUNNING IMAGE UPLOAD PERSISTENCE & AUDIT TEST SUITE ===\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
      process.exitCode = 1;
    }
  }

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Unauthorized upload rejection (Requirement 10)
    // ------------------------------------------------------------------------
    console.log('\n--- 1. Testing Unauthorized Upload Rejection ---');

    // 1a. Unauthenticated anonymous upload
    const { contentType: ctAnon, body: bodyAnon } = buildMultipartBody({}, {
      name: 'image',
      filename: 'hacker_avatar.jpg',
      mime: 'image/jpeg',
      buffer: SAMPLE_JPEG
    });
    const anonRes = await fetch(`${BASE_URL}/api/admin/tutors/upload-avatar`, {
      method: 'POST',
      headers: { 'Content-Type': ctAnon },
      body: bodyAnon
    });
    assert(anonRes.status === 401, 'Anonymous upload returns 401 Unauthorized');

    // 1b. Student role upload (must be rejected with 403 Forbidden)
    const student = await registerTestUser('Test Student', 'student', 'uploader');
    const { contentType: ctStudent, body: bodyStudent } = buildMultipartBody({}, {
      name: 'image',
      filename: 'student_avatar.jpg',
      mime: 'image/jpeg',
      buffer: SAMPLE_JPEG
    });
    const studentRes = await fetch(`${BASE_URL}/api/admin/tutors/upload-avatar`, {
      method: 'POST',
      headers: getHeaders(student.token, { 'Content-Type': ctStudent }),
      body: bodyStudent
    });
    assert(studentRes.status === 403, 'Student role upload returns 403 Forbidden');

    // 1c. Tutor role upload to admin endpoint (must be rejected with 403 Forbidden)
    const tutorUser = await registerTestUser('Test Tutor Role', 'tutor', 'uploader');
    const tutorRes = await fetch(`${BASE_URL}/api/admin/tutors/upload-avatar`, {
      method: 'POST',
      headers: getHeaders(tutorUser.token, { 'Content-Type': ctStudent }),
      body: bodyStudent
    });
    assert(tutorRes.status === 403, 'Tutor role upload to admin endpoint returns 403 Forbidden');

    // ------------------------------------------------------------------------
    // TEST 2: Upload image by authorized admin (Requirements 1, 4, 6, 7, 9)
    // ------------------------------------------------------------------------
    console.log('\n--- 2. Testing Authorized Image Upload ---');

    // Register admin user
    const admin = await registerTestUser('Audit Admin', 'admin', 'tester');

    // 2a. Reject invalid file type (e.g. .txt)
    const { contentType: ctText, body: bodyText } = buildMultipartBody({}, {
      name: 'image',
      filename: 'malicious.txt',
      mime: 'text/plain',
      buffer: Buffer.from('not an image')
    });
    const invalidTypeRes = await fetch(`${BASE_URL}/api/admin/tutors/upload-avatar`, {
      method: 'POST',
      headers: getHeaders(admin.token, { 'Content-Type': ctText }),
      body: bodyText
    });
    assert(invalidTypeRes.status === 400, 'Invalid file type is rejected with 400 Bad Request');

    // 2b. Upload valid JPEG image
    const targetTutorId = 'tutor-001'; // Prof. Dr. Casey Davis from trending tutors
    const { contentType: ctValid, body: bodyValid } = buildMultipartBody({ tutorId: targetTutorId }, {
      name: 'image',
      filename: 'casey_davis_new_avatar.jpg',
      mime: 'image/jpeg',
      buffer: SAMPLE_JPEG
    });

    const uploadRes = await fetch(`${BASE_URL}/api/admin/tutors/upload-avatar`, {
      method: 'POST',
      headers: getHeaders(admin.token, { 'Content-Type': ctValid }),
      body: bodyValid
    });

    assert(uploadRes.status === 200, 'Admin image upload returns 200 OK');
    const uploadData = await uploadRes.json();
    assert(uploadData.success === true, 'Upload API response indicates success: true');
    assert(typeof uploadData.relativeUrl === 'string' && uploadData.relativeUrl.startsWith('/uploads/avatars/'), 'Returns stable relative URL starting with /uploads/avatars/');
    assert(typeof uploadData.filename === 'string', 'Returns saved file name on server');

    const uploadedFilename = uploadData.filename;
    const uploadedRelativeUrl = uploadData.relativeUrl;

    // 2c. Requirement 1 & 6: Verify file exists on disk in UPLOADS_DIR/avatars/
    const diskPath = path.join(UPLOADS_DIR, 'avatars', uploadedFilename);
    const fileExistsOnDisk = fs.existsSync(diskPath);
    assert(fileExistsOnDisk, `Uploaded file verified on persistent disk at: ${diskPath}`);

    // ------------------------------------------------------------------------
    // TEST 3: Save image path in PostgreSQL (Requirement 3 & 6)
    // ------------------------------------------------------------------------
    console.log('\n--- 3. Testing Save Image Path in PostgreSQL ---');

    // Update tutor profile via PUT /api/admin/tutors/:id
    const putTutorRes = await fetch(`${BASE_URL}/api/admin/tutors/${targetTutorId}`, {
      method: 'PUT',
      headers: getHeaders(admin.token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        profileImageUrl: uploadedRelativeUrl,
        avatarUrl: uploadedRelativeUrl,
        name: 'Prof. Dr. Casey Davis',
        hourlyRate: 166
      })
    });

    assert(putTutorRes.status === 200, `PUT /api/admin/tutors/${targetTutorId} returns 200 OK`);
    const putData = await putTutorRes.json();
    assert(putData.success === true, 'PUT response reports success: true');

    // Direct database verification if PostgreSQL is active
    if (isDbConnected() && db) {
      const dbTutors = await db.select().from(tutors).where(eq(tutors.id, targetTutorId)).limit(1);
      assert(dbTutors.length > 0, `PostgreSQL contains tutor record for ${targetTutorId}`);
      if (dbTutors.length > 0) {
        assert(dbTutors[0].profileImageUrl?.includes(uploadedFilename), `PostgreSQL tutors.profile_image_url contains ${uploadedFilename}`);
      }

      const dbUsers = await db.select().from(users).where(eq(users.id, targetTutorId)).limit(1);
      assert(dbUsers.length > 0, `PostgreSQL contains user record for ${targetTutorId}`);
      if (dbUsers.length > 0) {
        assert(dbUsers[0].avatarUrl?.includes(uploadedFilename), `PostgreSQL users.avatar_url contains ${uploadedFilename}`);
      }
    } else {
      console.log('ℹ️ [DB] Running in persistent JSON storage fallback mode (DB connection disabled)');
    }

    // Disk persistence verification in UPLOADS_DIR
    const persistedFile = path.join(UPLOADS_DIR, 'persisted_user_updates.json');
    assert(fs.existsSync(persistedFile), `Persistent file exists at ${persistedFile}`);
    if (fs.existsSync(persistedFile)) {
      const persistedContent = JSON.parse(fs.readFileSync(persistedFile, 'utf-8'));
      assert(Boolean(persistedContent[targetTutorId]?.profileImageUrl?.includes(uploadedFilename) || persistedContent[targetTutorId]?.avatarUrl?.includes(uploadedFilename)), `persisted_user_updates.json contains updated avatar URL for ${targetTutorId}`);
    }

    // ------------------------------------------------------------------------
    // TEST 4: Refresh page and load image again (Requirement 5)
    // ------------------------------------------------------------------------
    console.log('\n--- 4. Testing Refresh Page & Load Image Again ---');

    // 4a. GET /api/tutors (Public tutors directory query after page refresh)
    const refreshTutorsRes = await fetch(`${BASE_URL}/api/tutors?limit=1000`);
    assert(refreshTutorsRes.status === 200, 'GET /api/tutors returns 200 OK after refresh');
    const refreshTutorsData = await refreshTutorsRes.json();
    const refreshedCasey = refreshTutorsData.tutors?.find((t: any) => t.id === targetTutorId);
    assert(Boolean(refreshedCasey), `Target tutor ${targetTutorId} found in refreshed tutors directory`);
    assert(refreshedCasey?.avatarUrl?.includes(uploadedFilename), `Refreshed tutor avatarUrl retained persistent URL: ${refreshedCasey?.avatarUrl}`);

    // 4b. GET /api/tutors/:id (Direct tutor profile fetch)
    const directTutorRes = await fetch(`${BASE_URL}/api/tutors/${targetTutorId}`);
    assert(directTutorRes.status === 200, `GET /api/tutors/${targetTutorId} returns 200 OK`);
    const directTutorData = await directTutorRes.json();
    assert(directTutorData.tutor?.avatarUrl?.includes(uploadedFilename), `Direct tutor API returns saved image URL: ${directTutorData.tutor?.avatarUrl}`);

    // 4c. GET /api/users (Users sync query after browser reload)
    const refreshUsersRes = await fetch(`${BASE_URL}/api/users`);
    assert(refreshUsersRes.status === 200, 'GET /api/users returns 200 OK after refresh');
    const refreshUsersData = await refreshUsersRes.json();
    const userCasey = refreshUsersData.users?.find((u: any) => u.id === targetTutorId);
    assert(Boolean(userCasey), `User ${targetTutorId} found in refreshed users list`);
    assert(userCasey?.avatarUrl?.includes(uploadedFilename), `User avatarUrl retained persistent URL: ${userCasey?.avatarUrl}`);

    // 4d. Static image URL download test (confirm image is publicly accessible)
    const cleanPublicPath = uploadedRelativeUrl.split('?')[0];
    const imageGetRes = await fetch(`${BASE_URL}${cleanPublicPath}`);
    assert(imageGetRes.status === 200, `Static avatar route GET ${cleanPublicPath} returns 200 OK`);
    const fetchedImgBuffer = Buffer.from(await imageGetRes.arrayBuffer());
    assert(fetchedImgBuffer.length === SAMPLE_JPEG.length, `Downloaded image size matches uploaded file (${fetchedImgBuffer.length} bytes)`);

    // ------------------------------------------------------------------------
    // TEST 5: Restart application and load image again (Persistence across reboots)
    // ------------------------------------------------------------------------
    console.log('\n--- 5. Testing Application Restart Persistence ---');

    // Simulate complete process restart by validating independent disk storage & PostgreSQL persistence
    // In a restarted Node process, in-memory store is empty and reads from UPLOADS_DIR and PostgreSQL:
    const rawPersistedOnDisk = JSON.parse(fs.readFileSync(persistedFile, 'utf-8'));
    assert(rawPersistedOnDisk[targetTutorId] !== undefined, 'Target tutor has permanent record on disk in UPLOADS_DIR');
    assert(rawPersistedOnDisk[targetTutorId]?.avatarUrl?.includes(uploadedFilename), 'Disk record stores the permanent /uploads/avatars URL');
    assert(fs.existsSync(diskPath), 'Physical avatar image file still exists in /app/uploads/avatars/ after simulation');

    console.log(`\n========================================`);
    console.log(`SUMMARY: ${passed} / ${total} tests passed successfully!`);
    console.log(`========================================\n`);

    if (passed !== total) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Unhandled test execution error:', err);
    process.exit(1);
  }
}

runTests();
