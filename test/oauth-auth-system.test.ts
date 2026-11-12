import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { db, isDbConnected, checkDbConnection } from '../src/db/index';
import { users, passwordResetTokens as passwordResetTokensTable } from '../src/db/schema';
import { eq } from 'drizzle-orm';

const BASE_URL = process.env.TEST_APP_URL || 'http://localhost:3000';
const UPLOADS_DIR = process.env.UPLOADS_DIR || '/app/uploads';
const PERSISTED_UPDATES_FILE = path.join(UPLOADS_DIR, 'persisted_user_updates.json');
const PERSISTED_RESET_TOKENS_FILE = path.join(UPLOADS_DIR, 'persisted_reset_tokens.json');

function generateRuntimePassword(): string {
  return `${crypto.randomBytes(16).toString('base64url')}!9Aa`;
}

function updatePersistedUserRecord(userId: string, patch: Record<string, any>) {
  const dir = path.dirname(PERSISTED_UPDATES_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  let current: Record<string, any> = {};
  if (fs.existsSync(PERSISTED_UPDATES_FILE)) {
    current = JSON.parse(fs.readFileSync(PERSISTED_UPDATES_FILE, 'utf-8'));
  }
  current[userId] = { ...(current[userId] || {}), ...patch, updatedAt: new Date().toISOString() };
  fs.writeFileSync(PERSISTED_UPDATES_FILE, JSON.stringify(current, null, 2), 'utf-8');
}

async function createActorWithRole(role: 'student' | 'tutor' | 'subadmin' | 'admin', label: string) {
  const email = `sec_${role}_${label}_${crypto.randomBytes(6).toString('hex')}@universitytutors.test`;
  const password = generateRuntimePassword();

  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `Test ${role.toUpperCase()} ${label}`,
      email,
      password,
      role: 'admin', // Intentionally send admin to confirm backend ignores frontend role
    }),
  });
  const regData = await regRes.json();
  if (regRes.status !== 201) {
    throw new Error(`Registration failed for ${email}: ${JSON.stringify(regData)}`);
  }

  if (role === 'student') {
    const cookieHeader = regRes.headers.get('set-cookie') || '';
    return { user: regData.user, token: regData.token, cookieHeader, password, email, regData };
  }

  // Elevate role in PostgreSQL (or persistent fallback store when DB is offline) and re-login
  if (isDbConnected() && db) {
    await db.update(users).set({ role }).where(eq(users.id, regData.user.id));
  }
  updatePersistedUserRecord(regData.user.id, { role });

  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const loginData = await loginRes.json();
  if (loginRes.status !== 200) {
    throw new Error(`Role login failed for ${email}: ${JSON.stringify(loginData)}`);
  }
  const cookieHeader = loginRes.headers.get('set-cookie') || '';
  return { user: loginData.user, token: loginData.token, cookieHeader, password, email, regData };
}

function cookieAuthHeaders(cookieHeader: string, extra: Record<string, string> = {}) {
  const sessionPair = cookieHeader.split(';')[0];
  return {
    'Content-Type': 'application/json',
    Cookie: sessionPair,
    ...extra,
  };
}

async function runAuthSystemTests() {
  console.log('=== RUNNING SECURITY-HARDENED OAUTH, AUTHENTICATION & RBAC SUITE ===\n');
  await checkDbConnection();

  let passed = 0;
  let total = 0;

  function testAssert(condition: boolean, testName: string, detail?: string) {
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
    // 1. OAuth Discovery, Missing Credential Rejection & No Fake Logins
    // ------------------------------------------------------------------------
    console.log('--- 1. Testing OAuth Discovery, Production URL Rules & No Fake Logins ---');
    const provRes = await fetch(`${BASE_URL}/api/auth/providers`);
    testAssert(provRes.status === 200, 'GET /api/auth/providers returns 200 OK');
    const provData = await provRes.json();
    const provRaw = JSON.stringify(provData);
    testAssert(!provRaw.includes('clientSecret') && !provRaw.includes('GOCSPX'), 'Provider discovery never leaks client secrets');

    for (const p of ['google', 'instagram', 'apple', 'x', 'linkedin']) {
      testAssert(Boolean(provData.providers?.[p]), `Provider "${p}" registered in discovery response`);
      const redirectUri = provData.providers?.[p]?.redirectUri || '';
      testAssert(
        !redirectUri.includes('ais-dev-') && !redirectUri.includes('ais-pre-') && !redirectUri.includes('localhost'),
        `Provider "${p}" redirectUri does not expose preview or localhost URLs in production (${redirectUri || 'empty'})`
      );
    }

    // Missing credentials must return HTTP 400 config error (never a fake login);
    // runtime-configured providers must return a real authorization URL with CSPRNG state (never a fake login).
    if (!provData.providers?.google?.configured) {
      const googleInitRes = await fetch(`${BASE_URL}/api/auth/google/url`);
      testAssert(googleInitRes.status === 400, 'Missing Google OAuth credentials return HTTP 400 configuration error');
      const googleInitData = await googleInitRes.json();
      testAssert(
        typeof googleInitData.error === 'string' && !googleInitData.token && !googleInitData.user,
        'Unconfigured Google OAuth returns clear error message and does NOT create a fake login'
      );
    } else {
      const googleInitRes = await fetch(`${BASE_URL}/api/auth/google/url`);
      testAssert(googleInitRes.status === 200, 'Runtime-configured Google OAuth returns HTTP 200 authorization URL');
      const googleInitData = await googleInitRes.json();
      testAssert(
        typeof googleInitData.url === 'string' &&
          googleInitData.url.startsWith('https://accounts.google.com/o/oauth2/v2/auth?') &&
          googleInitData.url.includes('state=') &&
          !googleInitData.token &&
          !googleInitData.user,
        'Configured Google OAuth generates real Google authorization URL with state and no fake login'
      );
    }

    if (!provData.providers?.instagram?.configured) {
      const instaInitRes = await fetch(`${BASE_URL}/api/auth/instagram/url`);
      testAssert(instaInitRes.status === 400, 'Missing Instagram/Meta OAuth credentials return HTTP 400 configuration error');
      const instaInitData = await instaInitRes.json();
      testAssert(
        typeof instaInitData.error === 'string' && !instaInitData.token && !instaInitData.user,
        'Unconfigured Instagram/Meta OAuth returns clear error message and does NOT create a fake login'
      );
    } else {
      const instaInitRes = await fetch(`${BASE_URL}/api/auth/instagram/url`);
      testAssert(instaInitRes.status === 200, 'Runtime-configured Instagram/Meta OAuth returns HTTP 200 authorization URL');
      const instaInitData = await instaInitRes.json();
      testAssert(
        typeof instaInitData.url === 'string' &&
          instaInitData.url.includes('state=') &&
          !instaInitData.token &&
          !instaInitData.user,
        'Configured Instagram/Meta OAuth generates real Meta authorization URL with state and no fake login'
      );
    }

    // Fake demo-login route must not exist or issue sessions
    const demoLoginRes = await fetch(`${BASE_URL}/api/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'google' }),
    });
    testAssert(
      demoLoginRes.status === 404 || !demoLoginRes.headers.get('set-cookie'),
      `Removed fake /api/auth/demo-login endpoint does not issue any session (status: ${demoLoginRes.status})`
    );

    // ------------------------------------------------------------------------
    // 2. Separate Google & Meta/Instagram Callback CSRF State Validation
    // ------------------------------------------------------------------------
    console.log('\n--- 2. Testing Separate Google & Meta/Instagram OAuth State Validation ---');
    const googleTampered = await fetch(`${BASE_URL}/api/auth/callback/google?code=test_code&state=forged_state_token`);
    testAssert(googleTampered.status === 400, 'Google callback (/api/auth/callback/google) rejects forged state with HTTP 400');
    testAssert(!googleTampered.headers.get('set-cookie')?.includes('auth_session='), 'Google callback with forged state sets no session cookie');

    const googleMissingState = await fetch(`${BASE_URL}/api/auth/google/callback?code=test_code`);
    testAssert(googleMissingState.status === 400, 'Google callback (/api/auth/google/callback) rejects missing state with HTTP 400');

    const instaTampered = await fetch(`${BASE_URL}/api/auth/callback/instagram?code=test_code&state=forged_state_token`);
    testAssert(instaTampered.status === 400, 'Instagram callback (/api/auth/callback/instagram) rejects forged state with HTTP 400');
    testAssert(!instaTampered.headers.get('set-cookie')?.includes('auth_session='), 'Instagram callback with forged state sets no session cookie');

    const instaMissingState = await fetch(`${BASE_URL}/api/auth/instagram/callback?code=test_code`);
    testAssert(instaMissingState.status === 400, 'Instagram callback (/api/auth/instagram/callback) rejects missing state with HTTP 400');

    // ------------------------------------------------------------------------
    // 3. Registration, Password Validation & Social Account Protection
    // ------------------------------------------------------------------------
    console.log('\n--- 3. Testing Registration, HTTP 401 Invalid Passwords & Social Account Protection ---');
    const studentActor = await createActorWithRole('student', 'alpha');
    testAssert(
      studentActor.user.role === 'student',
      'Public registration ignores frontend-supplied role and assigns "student"'
    );
    testAssert(
      studentActor.cookieHeader.includes('auth_session=') && studentActor.cookieHeader.toLowerCase().includes('httponly'),
      'Registration starts a secure HttpOnly server session cookie'
    );

    // Invalid password -> HTTP 401
    const wrongPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentActor.email, password: generateRuntimePassword() }),
    });
    testAssert(wrongPassRes.status === 401, 'Invalid password returns HTTP 401 Unauthorized');

    // Empty/missing password -> HTTP 401
    const emptyPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentActor.email, password: '' }),
    });
    testAssert(emptyPassRes.status === 401, 'Empty password returns HTTP 401 Unauthorized');

    // Social account (passwordHash: null) must NOT allow arbitrary passwords -> HTTP 401
    const socialUserId = `usr_social_${crypto.randomBytes(8).toString('hex')}`;
    const socialEmail = `social_${crypto.randomBytes(6).toString('hex')}@universitytutors.test`;
    const socialRecord = {
      id: socialUserId,
      role: 'student',
      name: 'Google OAuth Student',
      email: socialEmail,
      passwordHash: null,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      createdAt: new Date().toISOString(),
      suspended: false,
      verified: true,
      isApproved: true,
      status: 'active',
    };
    if (isDbConnected() && db) {
      await db.insert(users).values(socialRecord);
    }
    updatePersistedUserRecord(socialUserId, socialRecord);

    const socialArbitraryPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: socialEmail, password: generateRuntimePassword() }),
    });
    testAssert(
      socialArbitraryPassRes.status === 401,
      'Social account (passwordHash: null) rejects arbitrary password login with HTTP 401'
    );

    const socialBlankPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: socialEmail }),
    });
    testAssert(
      socialBlankPassRes.status === 401,
      'Social account rejects missing password login with HTTP 401'
    );

    // ------------------------------------------------------------------------
    // 4. Password Reset: CSPRNG Token, SHA-256 Hash Only, Expiry, Single-Use & Rate Limit
    // ------------------------------------------------------------------------
    console.log('\n--- 4. Testing Hashed Password Reset, Expiry & Rate Limiting ---');
    const resetTarget = await createActorWithRole('student', 'reset');
    const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '198.51.100.10',
      },
      body: JSON.stringify({ email: resetTarget.email }),
    });
    testAssert(forgotRes.status === 200, 'POST /api/auth/forgot-password returns 200 OK');
    const forgotData = await forgotRes.json();
    testAssert(
      forgotData.token === undefined,
      'POST /api/auth/forgot-password NEVER returns the plaintext reset token in JSON'
    );

    // Confirm stored token is a 64-character SHA-256 hex digest
    if (isDbConnected() && db) {
      const dbTokens = await db
        .select()
        .from(passwordResetTokensTable)
        .where(eq(passwordResetTokensTable.userId, resetTarget.user.id));
      testAssert(
        dbTokens.length > 0 && /^[a-f0-9]{64}$/.test(dbTokens[0].tokenHash),
        'PostgreSQL stores only a 64-char SHA-256 hash of the password reset token'
      );
    } else if (fs.existsSync(PERSISTED_RESET_TOKENS_FILE)) {
      const storedList = JSON.parse(fs.readFileSync(PERSISTED_RESET_TOKENS_FILE, 'utf-8'));
      const userRec = storedList.find((r: any) => r.userId === resetTarget.user.id);
      testAssert(
        Boolean(userRec && /^[a-f0-9]{64}$/.test(userRec.tokenHash) && !userRec.token),
        'Persistent fallback stores only a 64-char SHA-256 hash and never stores plaintext token'
      );
    }

    // Invalid token rejected
    const invalidResetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '198.51.100.11' },
      body: JSON.stringify({
        email: resetTarget.email,
        token: crypto.randomBytes(32).toString('hex'),
        newPassword: generateRuntimePassword(),
      }),
    });
    testAssert(invalidResetRes.status === 400, 'Invalid password reset token is rejected with HTTP 400');

    // Expired token rejected
    const expiredRaw = crypto.randomBytes(32).toString('hex');
    const expiredHash = crypto.createHash('sha256').update(expiredRaw).digest('hex');
    const expiredRec = {
      id: `prt_exp_${crypto.randomBytes(8).toString('hex')}`,
      userId: resetTarget.user.id,
      tokenHash: expiredHash,
      expiresAt: new Date(Date.now() - 60_000).toISOString(),
      usedAt: null,
      createdAt: new Date(Date.now() - 960_000).toISOString(),
    };
    if (isDbConnected() && db) {
      await db.insert(passwordResetTokensTable).values(expiredRec);
    } else {
      const existing = fs.existsSync(PERSISTED_RESET_TOKENS_FILE)
        ? JSON.parse(fs.readFileSync(PERSISTED_RESET_TOKENS_FILE, 'utf-8'))
        : [];
      existing.push(expiredRec);
      fs.writeFileSync(PERSISTED_RESET_TOKENS_FILE, JSON.stringify(existing, null, 2), 'utf-8');
    }

    const expiredResetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '198.51.100.12' },
      body: JSON.stringify({
        email: resetTarget.email,
        token: expiredRaw,
        newPassword: generateRuntimePassword(),
      }),
    });
    testAssert(expiredResetRes.status === 400, 'Expired password reset token is rejected with HTTP 400');

    // Valid token updates passwordHash, creates HttpOnly session, and invalidates token against reuse
    const validRaw = crypto.randomBytes(32).toString('hex');
    const validHash = crypto.createHash('sha256').update(validRaw).digest('hex');
    const validRec = {
      id: `prt_val_${crypto.randomBytes(8).toString('hex')}`,
      userId: resetTarget.user.id,
      tokenHash: validHash,
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
      usedAt: null,
      createdAt: new Date().toISOString(),
    };
    if (isDbConnected() && db) {
      await db.insert(passwordResetTokensTable).values(validRec);
    } else {
      const existing = fs.existsSync(PERSISTED_RESET_TOKENS_FILE)
        ? JSON.parse(fs.readFileSync(PERSISTED_RESET_TOKENS_FILE, 'utf-8'))
        : [];
      existing.push(validRec);
      fs.writeFileSync(PERSISTED_RESET_TOKENS_FILE, JSON.stringify(existing, null, 2), 'utf-8');
    }

    const updatedPassword = generateRuntimePassword();
    const validResetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '198.51.100.13' },
      body: JSON.stringify({
        email: resetTarget.email,
        token: validRaw,
        newPassword: updatedPassword,
      }),
    });
    testAssert(validResetRes.status === 200, 'Valid hashed reset token resets password with HTTP 200');
    const resetSetCookie = validResetRes.headers.get('set-cookie') || '';
    testAssert(
      resetSetCookie.includes('auth_session=') && resetSetCookie.toLowerCase().includes('httponly'),
      'Password reset creates a secure HttpOnly session cookie after success'
    );

    // Old password must now fail with 401, new password must succeed with 200
    const oldPassCheck = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetTarget.email, password: resetTarget.password }),
    });
    testAssert(oldPassCheck.status === 401, 'Previous password is rejected with HTTP 401 after password reset');

    const newPassCheck = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetTarget.email, password: updatedPassword }),
    });
    testAssert(newPassCheck.status === 200, 'Updated password hash allows login with HTTP 200');

    // Reusing consumed token must fail with 400
    const reuseRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '198.51.100.14' },
      body: JSON.stringify({
        email: resetTarget.email,
        token: validRaw,
        newPassword: generateRuntimePassword(),
      }),
    });
    testAssert(reuseRes.status === 400, 'Consumed password reset token cannot be reused (HTTP 400)');

    // Rate-limit check on forgot-password (>3 requests per 15 min per email -> HTTP 429)
    const rateLimitEmail = `ratelimit_${crypto.randomBytes(5).toString('hex')}@universitytutors.test`;
    let saw429 = false;
    for (let i = 0; i < 5; i++) {
      const rlRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': `203.0.113.${20 + i}` },
        body: JSON.stringify({ email: rateLimitEmail }),
      });
      if (rlRes.status === 429) saw429 = true;
    }
    testAssert(saw429, 'Password reset endpoint enforces rate limiting with HTTP 429');

    // ------------------------------------------------------------------------
    // 5. Complete Role-Based Authorization Matrix (Guest, Student, Tutor, Subadmin, Admin)
    // ------------------------------------------------------------------------
    console.log('\n--- 5. Testing RBAC Across Logged-Out, Student, Tutor, Subadmin, and Admin Roles ---');

    const tutorActor = await createActorWithRole('tutor', 'beta');
    const subadminActor = await createActorWithRole('subadmin', 'gamma');
    const adminActor = await createActorWithRole('admin', 'delta');

    // 5a. Frontend header spoofing (X-User-Id) MUST be rejected with 401
    const spoofAdminHeaderRes = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { 'X-User-Id': 'admin_shaka' },
    });
    testAssert(
      spoofAdminHeaderRes.status === 401,
      'Frontend-supplied X-User-Id header is ignored and rejected with HTTP 401'
    );

    // 5b. Logged-out guest -> 401 on all protected endpoints
    const guestMe = await fetch(`${BASE_URL}/api/auth/me`);
    const guestStudentDash = await fetch(`${BASE_URL}/api/student/dashboard`);
    const guestTutorDash = await fetch(`${BASE_URL}/api/tutor/dashboard`);
    const guestAdminDash = await fetch(`${BASE_URL}/api/admin/dashboard`);
    const guestEditTutor = await fetch(`${BASE_URL}/api/admin/tutors/tutor-001`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hourlyRate: 99 }),
    });
    testAssert(
      guestMe.status === 401 &&
      guestStudentDash.status === 401 &&
      guestTutorDash.status === 401 &&
      guestAdminDash.status === 401 &&
      guestEditTutor.status === 401,
      'Logged-out guest receives HTTP 401 across /api/auth/me, student, tutor, and admin routes'
    );

    // 5c. Student permissions: 200 on student dashboard; 403 on tutor and admin routes
    const stuDash = await fetch(`${BASE_URL}/api/student/dashboard`, {
      headers: cookieAuthHeaders(studentActor.cookieHeader),
    });
    const stuTutorDash = await fetch(`${BASE_URL}/api/tutor/dashboard`, {
      headers: cookieAuthHeaders(studentActor.cookieHeader),
    });
    const stuAdminDash = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: cookieAuthHeaders(studentActor.cookieHeader),
    });
    const stuEditTutor = await fetch(`${BASE_URL}/api/admin/tutors/tutor-001`, {
      method: 'PUT',
      headers: cookieAuthHeaders(studentActor.cookieHeader),
      body: JSON.stringify({ hourlyRate: 99 }),
    });
    const stuSelfEscalate = await fetch(`${BASE_URL}/api/users/${studentActor.user.id}`, {
      method: 'PUT',
      headers: cookieAuthHeaders(studentActor.cookieHeader),
      body: JSON.stringify({ role: 'admin' }),
    });
    const stuMeAfterEscalate = await (await fetch(`${BASE_URL}/api/auth/me`, {
      headers: cookieAuthHeaders(studentActor.cookieHeader),
    })).json();

    testAssert(stuDash.status === 200, 'Student can access /api/student/dashboard (HTTP 200)');
    testAssert(stuTutorDash.status === 403, 'Student CANNOT access /api/tutor/dashboard (HTTP 403)');
    testAssert(stuAdminDash.status === 403, 'Student CANNOT access /api/admin/dashboard (HTTP 403)');
    testAssert(stuEditTutor.status === 403, 'Student CANNOT edit tutors via /api/admin/tutors/:id (HTTP 403)');
    testAssert(
      stuSelfEscalate.status === 200 && stuMeAfterEscalate.user?.role === 'student',
      'Student cannot escalate their own role via PUT /api/users/:id'
    );

    // 5d. Tutor permissions: 200 on tutor dashboard; 403 on student and admin routes
    const tutTutorDash = await fetch(`${BASE_URL}/api/tutor/dashboard`, {
      headers: cookieAuthHeaders(tutorActor.cookieHeader),
    });
    const tutStudentDash = await fetch(`${BASE_URL}/api/student/dashboard`, {
      headers: cookieAuthHeaders(tutorActor.cookieHeader),
    });
    const tutAdminDash = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: cookieAuthHeaders(tutorActor.cookieHeader),
    });
    const tutEditTutor = await fetch(`${BASE_URL}/api/admin/tutors/tutor-001`, {
      method: 'PUT',
      headers: cookieAuthHeaders(tutorActor.cookieHeader),
      body: JSON.stringify({ hourlyRate: 99 }),
    });
    const tutAuditLogs = await fetch(`${BASE_URL}/api/audit-logs`, {
      headers: cookieAuthHeaders(tutorActor.cookieHeader),
    });

    testAssert(tutTutorDash.status === 200, 'Tutor can access /api/tutor/dashboard (HTTP 200)');
    testAssert(tutStudentDash.status === 403, 'Tutor CANNOT access /api/student/dashboard (HTTP 403)');
    testAssert(tutAdminDash.status === 403, 'Tutor CANNOT access /api/admin/dashboard (HTTP 403)');
    testAssert(tutEditTutor.status === 403, 'Tutor CANNOT edit tutors via /api/admin/tutors/:id (HTTP 403)');
    testAssert(tutAuditLogs.status === 403, 'Tutor CANNOT access /api/audit-logs (HTTP 403)');

    // 5e. Subadmin permissions: 200 on admin dashboard & tutor edit; 403 on admin-only create-privileged-user
    const subDash = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: cookieAuthHeaders(subadminActor.cookieHeader),
    });
    const subEditTutor = await fetch(`${BASE_URL}/api/admin/tutors/tutor-001`, {
      method: 'PUT',
      headers: cookieAuthHeaders(subadminActor.cookieHeader),
      body: JSON.stringify({ name: 'Prof. Dr. Casey Davis', hourlyRate: 166 }),
    });
    const subCreateAdmin = await fetch(`${BASE_URL}/api/create-privileged-user`, {
      method: 'POST',
      headers: cookieAuthHeaders(subadminActor.cookieHeader),
      body: JSON.stringify({
        name: 'Blocked Admin',
        email: `blocked_${Date.now()}@universitytutors.test`,
        role: 'admin',
        password: generateRuntimePassword(),
      }),
    });

    testAssert(subDash.status === 200, 'Subadmin can access /api/admin/dashboard (HTTP 200)');
    testAssert(subEditTutor.status === 200, 'Subadmin can edit tutors via HttpOnly cookie session (HTTP 200)');
    testAssert(subCreateAdmin.status === 403, 'Subadmin CANNOT create admin accounts via /api/create-privileged-user (HTTP 403)');

    // 5f. Admin permissions: 200 on admin dashboard, tutor edit, audit logs, and privileged user creation
    const admDash = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: cookieAuthHeaders(adminActor.cookieHeader),
    });
    const admAudit = await fetch(`${BASE_URL}/api/audit-logs`, {
      headers: cookieAuthHeaders(adminActor.cookieHeader),
    });
    const admEditTutor = await fetch(`${BASE_URL}/api/admin/tutors/tutor-001`, {
      method: 'PUT',
      headers: cookieAuthHeaders(adminActor.cookieHeader),
      body: JSON.stringify({ name: 'Prof. Dr. Casey Davis', hourlyRate: 166 }),
    });
    const admCreatePriv = await fetch(`${BASE_URL}/api/create-privileged-user`, {
      method: 'POST',
      headers: cookieAuthHeaders(adminActor.cookieHeader),
      body: JSON.stringify({
        name: 'Provisioned Tutor',
        email: `prov_tutor_${crypto.randomBytes(5).toString('hex')}@universitytutors.test`,
        role: 'tutor',
        password: generateRuntimePassword(),
      }),
    });

    testAssert(admDash.status === 200, 'Admin can access /api/admin/dashboard (HTTP 200)');
    testAssert(admAudit.status === 200, 'Admin can access /api/audit-logs (HTTP 200)');
    testAssert(admEditTutor.status === 200, 'Admin can edit tutors via HttpOnly cookie session (HTTP 200)');
    testAssert(admCreatePriv.status === 200, 'Admin can create privileged hashed accounts via /api/create-privileged-user (HTTP 200)');

    console.log(`\n========================================`);
    console.log(`SUMMARY: ${passed} / ${total} security & authentication tests passed!`);
    console.log(`========================================\n`);

    if (passed !== total) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runAuthSystemTests();
