import crypto from 'crypto';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { db, isDbConnected, checkDbConnection } from '../src/db/index';
import { users, passwordResetTokens as passwordResetTokensTable } from '../src/db/schema';
import { eq } from 'drizzle-orm';

process.env.SKIP_AUTO_SERVER_START = 'true';

const BASE_URL = process.env.TEST_APP_URL || 'http://localhost:3000';
const UPLOADS_DIR = process.env.UPLOADS_DIR || '/app/uploads';
const PERSISTED_UPDATES_FILE = path.join(UPLOADS_DIR, 'persisted_user_updates.json');
const PERSISTED_RESET_TOKENS_FILE = path.join(UPLOADS_DIR, 'persisted_reset_tokens.json');

function generateRuntimePassword(): string {
  return `${crypto.randomBytes(16).toString('base64url')}!9Aa`;
}

function getSetCookieList(res: Response): string[] {
  const anyHeaders = res.headers as any;
  if (typeof anyHeaders.getSetCookie === 'function') {
    return anyHeaders.getSetCookie();
  }
  const combined = res.headers.get('set-cookie');
  return combined ? [combined] : [];
}

function findSetCookieHeader(res: Response, cookieName: string): string | undefined {
  const prefix = `${cookieName}=`;
  return getSetCookieList(res).find((c) => c.trim().startsWith(prefix));
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
      confirmPassword: password,
      termsAccepted: true,
      role: 'admin', // Intentionally send admin to confirm backend ignores frontend role
    }),
  });
  const regData = await regRes.json();
  if (regRes.status !== 201) {
    throw new Error(`Registration failed for ${email}: ${JSON.stringify(regData)}`);
  }

  if (role === 'student') {
    const cookieHeader = findSetCookieHeader(regRes, 'auth_session') || regRes.headers.get('set-cookie') || '';
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
  const cookieHeader = findSetCookieHeader(loginRes, 'auth_session') || loginRes.headers.get('set-cookie') || '';
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
      demoLoginRes.status === 404 || !findSetCookieHeader(demoLoginRes, 'auth_session'),
      `Removed fake /api/auth/demo-login endpoint does not issue any session (status: ${demoLoginRes.status})`
    );

    // ------------------------------------------------------------------------
    // 2. Separate Google & Meta/Instagram Callback CSRF State Validation
    // ------------------------------------------------------------------------
    console.log('\n--- 2. Testing Separate Google & Meta/Instagram OAuth State Validation ---');
    const googleTampered = await fetch(`${BASE_URL}/api/auth/callback/google?code=test_code&state=forged_state_token`);
    testAssert(googleTampered.status === 400, 'Google callback (/api/auth/callback/google) rejects forged state with HTTP 400');
    testAssert(!findSetCookieHeader(googleTampered, 'auth_session'), 'Google callback with forged state sets no session cookie');

    const googleNonCanonical = await fetch(`${BASE_URL}/api/auth/google/callback?code=test_code`);
    testAssert(googleNonCanonical.status === 400, 'Non-canonical /api/auth/google/callback rejects request with HTTP 400');

    const instaTampered = await fetch(`${BASE_URL}/api/auth/callback/instagram?code=test_code&state=forged_state_token`);
    testAssert(instaTampered.status === 400, 'Instagram callback (/api/auth/callback/instagram) rejects forged state with HTTP 400');
    testAssert(!findSetCookieHeader(instaTampered, 'auth_session'), 'Instagram callback with forged state sets no session cookie');

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
    testAssert(
      studentActor.regData?.user?.passwordHash === undefined &&
      studentActor.regData?.redirectUrl === '/student/dashboard',
      'Successful registration returns HTTP 201 with safe user data and redirects to /student/dashboard'
    );
    testAssert(
      Boolean(
        studentActor.user?.id &&
        studentActor.user?.email &&
        studentActor.user?.role === 'student' &&
        studentActor.user?.fullName &&
        studentActor.user?.createdAt &&
        studentActor.user?.updatedAt
      ),
      'Registration provides all required fields: id, email, role, fullName, createdAt, updatedAt'
    );

    // Duplicate email registration -> HTTP 409
    const dupPass = generateRuntimePassword();
    const dupRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Student',
        email: studentActor.email,
        password: dupPass,
        confirmPassword: dupPass,
        termsAccepted: true,
      }),
    });
    testAssert(dupRes.status === 409, 'Duplicate email registration returns HTTP 409 Conflict');
    const dupData = await dupRes.json();
    testAssert(
      dupData.error === 'An account with this email already exists.',
      'Duplicate email registration returns exact safe message "An account with this email already exists."'
    );

    // Missing users table simulation -> HTTP 500
    const missingTableRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Simulate-Missing-Users-Table': 'true',
      },
      body: JSON.stringify({
        name: 'Missing Table User',
        email: `missing_table_${crypto.randomBytes(4).toString('hex')}@test.com`,
        password: 'ValidPassword123',
        confirmPassword: 'ValidPassword123',
        termsAccepted: true,
      }),
    });
    testAssert(missingTableRes.status === 500, 'Registration with missing users table returns HTTP 500');
    const missingTableData = await missingTableRes.json();
    testAssert(
      missingTableData.error === 'Unable to check account information.',
      'Missing users table returns exact error "Unable to check account information."'
    );

    // Missing email column simulation -> HTTP 500
    const missingColRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Simulate-Missing-Email-Column': 'true',
      },
      body: JSON.stringify({
        name: 'Missing Col User',
        email: `missing_col_${crypto.randomBytes(4).toString('hex')}@test.com`,
        password: 'ValidPassword123',
        confirmPassword: 'ValidPassword123',
        termsAccepted: true,
      }),
    });
    testAssert(missingColRes.status === 500, 'Registration with missing email column returns HTTP 500');
    const missingColData = await missingColRes.json();
    testAssert(
      missingColData.error === 'Unable to check account information.',
      'Missing email column returns exact error "Unable to check account information."'
    );

    // Database connection failure simulation -> HTTP 500
    const connFailRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Simulate-Db-Connection-Failure': 'true',
      },
      body: JSON.stringify({
        name: 'Conn Fail User',
        email: `conn_fail_${crypto.randomBytes(4).toString('hex')}@test.com`,
        password: 'ValidPassword123',
        confirmPassword: 'ValidPassword123',
        termsAccepted: true,
      }),
    });
    testAssert(connFailRes.status === 500, 'Registration with database connection failure returns HTTP 500');
    const connFailData = await connFailRes.json();
    testAssert(
      connFailData.error === 'Unable to check account information.',
      'Database connection failure returns exact error "Unable to check account information."'
    );

    // Safe diagnostic endpoint verification
    const diagRes = await fetch(`${BASE_URL}/api/auth/diagnostic/schema`);
    testAssert(diagRes.status === 200, 'Safe diagnostic schema endpoint returns HTTP 200');
    const diagData = await diagRes.json();
    testAssert(
      typeof diagData.usersTableExists === 'boolean' &&
      typeof diagData.emailColumnExists === 'boolean' &&
      Array.isArray(diagData.missingRequiredColumns),
      'Safe diagnostic schema endpoint returns structured verification data'
    );
    const diagStr = JSON.stringify(diagData);
    testAssert(
      !diagStr.includes('postgres://') &&
      !diagStr.includes('$2a$') &&
      !diagStr.includes('$2b$') &&
      !diagStr.includes('SESSION_SECRET') &&
      !diagStr.includes('GOCSPX') &&
      !(diagData as any).password &&
      !(diagData as any).passwordHash,
      'Safe diagnostic schema endpoint never reveals passwords, password hashes, connection strings, or secrets'
    );

    // Invalid email format -> HTTP 400
    const invalidEmailRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Invalid Email User',
        email: 'invalid-email-format',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
      }),
    });
    testAssert(invalidEmailRes.status === 400, 'Invalid email format registration is rejected with HTTP 400');

    // Weak password (<8 chars) -> HTTP 400
    const weakPassRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Weak Pass User',
        email: `weak_${crypto.randomBytes(4).toString('hex')}@test.com`,
        password: 'short',
        confirmPassword: 'short',
        termsAccepted: true,
      }),
    });
    testAssert(weakPassRes.status === 400, 'Weak password (<8 chars) registration is rejected with HTTP 400');

    // Password missing numbers -> HTTP 400
    const noNumPassRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'No Number Pass User',
        email: `nonum_${crypto.randomBytes(4).toString('hex')}@test.com`,
        password: 'onlylettershere',
        confirmPassword: 'onlylettershere',
        termsAccepted: true,
      }),
    });
    testAssert(noNumPassRes.status === 400, 'Password without numbers registration is rejected with HTTP 400');

    // Mismatched passwords -> HTTP 400
    const mismatchPassRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Mismatch Pass User',
        email: `mismatch_${crypto.randomBytes(4).toString('hex')}@test.com`,
        password: 'ValidPassword123',
        confirmPassword: 'DifferentPassword456',
        termsAccepted: true,
      }),
    });
    testAssert(mismatchPassRes.status === 400, 'Mismatched passwords registration is rejected with HTTP 400');

    // Terms not accepted -> HTTP 400
    const noTermsRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'No Terms User',
        email: `noterms_${crypto.randomBytes(4).toString('hex')}@test.com`,
        password: 'ValidPassword123',
        confirmPassword: 'ValidPassword123',
        termsAccepted: false,
      }),
    });
    testAssert(noTermsRes.status === 400, 'Registration without terms acceptance is rejected with HTTP 400');

    // Database failure during registration -> HTTP 500
    const dbFailRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Simulate-Db-Failure': 'true',
      },
      body: JSON.stringify({
        name: 'DB Fail User',
        email: `dbfail_${crypto.randomBytes(4).toString('hex')}@test.com`,
        password: 'ValidPassword123',
        confirmPassword: 'ValidPassword123',
        termsAccepted: true,
      }),
    });
    testAssert(dbFailRes.status === 500, 'Database failure during registration returns HTTP 500');
    const dbFailData = await dbFailRes.json();
    testAssert(
      dbFailData.code === 'DB_PERSISTENCE_FAILED' && typeof dbFailData.error === 'string',
      'Database failure returns structured JSON with error and code without exposing secrets'
    );

    // Successful login with registered user credentials
    const validLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentActor.email, password: studentActor.password }),
    });
    testAssert(validLoginRes.status === 200, 'Successful login with registered credentials returns HTTP 200');
    const loginCookie = findSetCookieHeader(validLoginRes, 'auth_session') || '';
    testAssert(
      loginCookie.includes('auth_session=') && loginCookie.toLowerCase().includes('httponly'),
      'Successful login sets secure HttpOnly session cookie'
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

    // Anti-account enumeration test: non-existent email returns same 200 response
    const nonExistentForgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '198.51.100.99',
      },
      body: JSON.stringify({ email: `nonexistent_${Date.now()}@universitytutors.test` }),
    });
    testAssert(nonExistentForgotRes.status === 200, 'Forgot-password request for non-existent email returns HTTP 200');
    const nonExistentData = await nonExistentForgotRes.json();
    testAssert(
      nonExistentData.message === forgotData.message,
      'Forgot-password returns identical message for existent and non-existent email (prevents account discovery)'
    );

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
    const resetSetCookie = findSetCookieHeader(validResetRes, 'auth_session') || '';
    testAssert(
      resetSetCookie.includes('auth_session=') && resetSetCookie.toLowerCase().includes('httponly'),
      'Password reset creates a secure HttpOnly session cookie after success'
    );

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

    // Pre-reset session invalidation check
    const oldSessionCheck = await fetch(`${BASE_URL}/api/student/dashboard`, {
      headers: cookieAuthHeaders(resetTarget.cookieHeader),
    });
    testAssert(oldSessionCheck.status === 401, 'Sessions issued prior to password reset are revoked with HTTP 401');

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

    const spoofAdminHeaderRes = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { 'X-User-Id': 'admin_shaka' },
    });
    testAssert(
      spoofAdminHeaderRes.status === 401,
      'Frontend-supplied X-User-Id header is ignored and rejected with HTTP 401'
    );

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

    // ------------------------------------------------------------------------
    // 6. Comprehensive Google OAuth Production Security End-to-End Suite
    //    Covers all 8 required Google OAuth test scenarios with zero hardcoded secrets
    // ------------------------------------------------------------------------
    console.log('\n--- 6. Testing Google OAuth Production Login Flow (All 8 Required Scenarios) ---');

    const { createApp, GOOGLE_OAUTH_CALLBACK_PATH } = await import('../server');
    testAssert(
      GOOGLE_OAUTH_CALLBACK_PATH === '/api/auth/callback/google',
      'Exact backend Google OAuth callback route is /api/auth/callback/google'
    );

    const savedEnv = {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
      APP_URL: process.env.APP_URL,
      SESSION_SECRET: process.env.SESSION_SECRET,
    };

    // Runtime-generated ephemeral test values (zero hardcoded secrets)
    const runtimeTestClientId = `test_cid_${crypto.randomBytes(12).toString('hex')}`;
    const runtimeTestClientSecret = `test_csec_${crypto.randomBytes(18).toString('hex')}`;
    const runtimeTestSessionSecret = crypto.randomBytes(32).toString('hex');
    const prodDomain = 'https://university-tutors.com';
    const prodCallbackUri = `${prodDomain}/api/auth/callback/google`;

    // Simulated PostgreSQL user repository to test user lookup, student role assignment, existing login, and DB failure
    const pgSimulatedUsers = new Map<string, any>();
    let simulatePgUserCreationFailure = false;

    // Mock Google OAuth HTTP behavior controller
    type MockGoogleMode =
      | 'success_new_student'
      | 'success_existing_user'
      | 'token_exchange_error'
      | 'token_redirect_uri_mismatch'
      | 'profile_request_error';
    let mockGoogleMode: MockGoogleMode = 'success_new_student';
    let lastTokenRequestParams: URLSearchParams | null = null;
    const newGoogleStudentEmail = `google_new_${crypto.randomBytes(6).toString('hex')}@universitytutors.test`;
    const existingGoogleUserEmail = `google_existing_${crypto.randomBytes(6).toString('hex')}@universitytutors.test`;

    // Seed an existing PostgreSQL user before OAuth login to test Scenario 7
    const preExistingUserId = `usr_existing_${crypto.randomBytes(8).toString('hex')}`;
    const preExistingUserRecord = {
      id: preExistingUserId,
      role: 'student',
      name: 'Existing University Student',
      email: existingGoogleUserEmail,
      passwordHash: null,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      createdAt: new Date(Date.now() - 86_400_000).toISOString(),
      suspended: false,
      verified: true,
      isApproved: true,
      status: 'active',
    };
    pgSimulatedUsers.set(existingGoogleUserEmail, preExistingUserRecord);

    const mockGoogleFetch: typeof fetch = async (input: any, init?: RequestInit) => {
      const targetUrl = typeof input === 'string' ? input : input.toString();

      if (targetUrl === 'https://oauth2.googleapis.com/token') {
        const rawBody = init?.body ? init.body.toString() : '';
        lastTokenRequestParams = new URLSearchParams(rawBody);

        if (mockGoogleMode === 'token_redirect_uri_mismatch') {
          return new Response(
            JSON.stringify({ error: 'redirect_uri_mismatch', error_description: 'Bad redirect_uri' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        if (mockGoogleMode === 'token_exchange_error') {
          return new Response(
            JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid authorization code' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const ephemeralAccessToken = `tok_${crypto.randomBytes(16).toString('hex')}`;
        return new Response(
          JSON.stringify({
            access_token: ephemeralAccessToken,
            expires_in: 3600,
            token_type: 'Bearer',
            scope: 'openid email profile',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (targetUrl === 'https://www.googleapis.com/oauth2/v2/userinfo') {
        if (mockGoogleMode === 'profile_request_error') {
          return new Response(
            JSON.stringify({ error: { code: 500, message: 'Upstream profile error' } }),
            { status: 502, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const activeEmail =
          mockGoogleMode === 'success_existing_user' ? existingGoogleUserEmail : newGoogleStudentEmail;
        return new Response(
          JSON.stringify({
            id: crypto.randomBytes(10).toString('hex'),
            email: activeEmail,
            verified_email: true,
            name: mockGoogleMode === 'success_existing_user' ? 'Existing University Student' : 'New Google Student',
            picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Unexpected external fetch in Google OAuth test: ${targetUrl}`);
    };

    const isolatedApp = await createApp({
      skipStaticAndVite: true,
      fetchImpl: mockGoogleFetch,
      oauthUserRepo: {
        findByEmail: async (email: string) => {
          if (simulatePgUserCreationFailure) {
            throw new Error('Simulated PostgreSQL connection failure');
          }
          return pgSimulatedUsers.get(email.toLowerCase().trim()) || null;
        },
        findById: async (id: string) => {
          for (const u of pgSimulatedUsers.values()) {
            if (u.id === id) return u;
          }
          return null;
        },
        createUser: async (record: any) => {
          if (simulatePgUserCreationFailure) {
            throw new Error('Simulated PostgreSQL INSERT failure');
          }
          pgSimulatedUsers.set(record.email.toLowerCase().trim(), record);
          return record;
        },
      },
    });

    const isolatedServer = http.createServer(isolatedApp);
    await new Promise<void>((resolve) => isolatedServer.listen(0, '127.0.0.1', () => resolve()));
    const addr = isolatedServer.address() as { port: number };
    const OAUTH_TEST_BASE = `http://127.0.0.1:${addr.port}`;

    function setValidProdGoogleEnv() {
      process.env.SESSION_SECRET = runtimeTestSessionSecret;
      process.env.APP_URL = prodDomain;
      process.env.GOOGLE_CLIENT_ID = runtimeTestClientId;
      process.env.GOOGLE_CLIENT_SECRET = runtimeTestClientSecret;
      process.env.GOOGLE_REDIRECT_URI = prodCallbackUri;
    }

    async function initiateValidGoogleFlow(): Promise<{ state: string; stateCookiePair: string; authUrl: string }> {
      const initRes = await fetch(`${OAUTH_TEST_BASE}/api/auth/google/url`, {
        headers: { 'X-Forwarded-Proto': 'https' },
      });
      const initJson = await initRes.json();
      const parsedUrl = new URL(initJson.url);
      const state = parsedUrl.searchParams.get('state') || '';
      const rawStateCookie = findSetCookieHeader(initRes, 'oauth_state_google') || '';
      const stateCookiePair = rawStateCookie.split(';')[0];
      return { state, stateCookiePair, authUrl: initJson.url };
    }

    try {
      // ----------------------------------------------------------------------
      // Scenario 6.1: Missing OAuth Environment Variables
      // ----------------------------------------------------------------------
      for (const missingVar of ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI', 'APP_URL'] as const) {
        setValidProdGoogleEnv();
        delete process.env[missingVar];

        const pRes = await fetch(`${OAUTH_TEST_BASE}/api/auth/providers`);
        const pData = await pRes.json();
        const rawProviderJson = JSON.stringify(pData);
        testAssert(
          pData.providers?.google?.configured === false &&
            Array.isArray(pData.providers?.google?.missingVars) &&
            pData.providers.google.missingVars.includes(missingVar) &&
            !rawProviderJson.includes(runtimeTestClientId) &&
            !rawProviderJson.includes(runtimeTestClientSecret) &&
            !rawProviderJson.includes(runtimeTestSessionSecret),
          `[6.1 Missing Env] providers.google.configured is false and missingVars safely lists only ${missingVar} without leaking values`
        );

        const uRes = await fetch(`${OAUTH_TEST_BASE}/api/auth/google/url`);
        const uData = await uRes.json();
        testAssert(
          uRes.status === 400 &&
            uData.code === 'missing_oauth_credentials' &&
            String(uData.error).includes(missingVar) &&
            !JSON.stringify(uData).includes(runtimeTestClientSecret),
          `[6.1 Missing Env] /api/auth/google/url rejects missing ${missingVar} with 400 missing_oauth_credentials`
        );

        const cbRes = await fetch(`${OAUTH_TEST_BASE}/api/auth/callback/google?code=abc&state=${'a'.repeat(64)}`);
        const cbData = await cbRes.json();
        testAssert(
          cbRes.status === 400 && cbData.code === 'missing_oauth_credentials' && !findSetCookieHeader(cbRes, 'auth_session'),
          `[6.1 Missing Env] /api/auth/callback/google rejects missing ${missingVar} with 400 missing_oauth_credentials`
        );
      }

      // Confirm provider status reports configured=true ONLY when all 4 required runtime variables exist
      setValidProdGoogleEnv();
      const allFourProvRes = await fetch(`${OAUTH_TEST_BASE}/api/auth/providers`);
      const allFourProvData = await allFourProvRes.json();
      testAssert(
        allFourProvData.providers?.google?.configured === true &&
          Array.isArray(allFourProvData.providers?.google?.missingVars) &&
          allFourProvData.providers.google.missingVars.length === 0 &&
          allFourProvData.providers?.google?.callbackPath === '/api/auth/callback/google',
        '[6.1 All Four Vars] /api/auth/providers reports configured=true and empty missingVars only when all 4 runtime variables exist'
      );

      // ----------------------------------------------------------------------
      // Scenario 6.2: Invalid OAuth State (missing, malformed, forged, tampered cookie, replayed)
      // ----------------------------------------------------------------------
      setValidProdGoogleEnv();

      const missingStateRes = await fetch(`${OAUTH_TEST_BASE}/api/auth/callback/google?code=valid_code`);
      const missingStateData = await missingStateRes.json();
      testAssert(
        missingStateRes.status === 400 && missingStateData.code === 'invalid_state',
        '[6.2 Invalid State] Missing state parameter returns HTTP 400 invalid_state'
      );

      const malformedStateRes = await fetch(`${OAUTH_TEST_BASE}/api/auth/callback/google?code=valid_code&state=not_64_hex`);
      const malformedStateData = await malformedStateRes.json();
      testAssert(
        malformedStateRes.status === 400 && malformedStateData.code === 'invalid_state',
        '[6.2 Invalid State] Malformed non-hex state parameter returns HTTP 400 invalid_state'
      );

      const forgedHexState = crypto.randomBytes(32).toString('hex');
      const forgedStateRes = await fetch(`${OAUTH_TEST_BASE}/api/auth/callback/google?code=valid_code&state=${forgedHexState}`);
      const forgedStateData = await forgedStateRes.json();
      testAssert(
        forgedStateRes.status === 400 &&
          forgedStateData.code === 'invalid_state' &&
          !findSetCookieHeader(forgedStateRes, 'auth_session'),
        '[6.2 Invalid State] Forged unissued 64-hex state returns HTTP 400 invalid_state and sets no session'
      );

      const flowForTamper = await initiateValidGoogleFlow();
      const tamperedCookieRes = await fetch(
        `${OAUTH_TEST_BASE}/api/auth/callback/google?code=valid_code&state=${flowForTamper.state}`,
        {
          headers: { Cookie: 'oauth_state_google=tampered.payload_signature' },
        }
      );
      const tamperedCookieData = await tamperedCookieRes.json();
      testAssert(
        tamperedCookieRes.status === 400 && tamperedCookieData.code === 'invalid_state',
        '[6.2 Invalid State] Tampered oauth_state_google cookie signature returns HTTP 400 invalid_state'
      );

      // ----------------------------------------------------------------------
      // Scenario 6.3: Redirect URI Mismatch (localhost, preview container URLs, domain/path mismatch, provider mismatch)
      // ----------------------------------------------------------------------
      const forbiddenUrls = [
        'http://localhost:3000',
        'https://localhost:3000',
        'https://ais-dev-preview-12345.us-west1.run.app',
        'https://ais-pre-preview-12345.us-west1.run.app',
        'http://university-tutors.com',
        'https://127.0.0.1:3000',
      ];

      for (const badAppUrl of forbiddenUrls) {
        setValidProdGoogleEnv();
        process.env.APP_URL = badAppUrl;
        process.env.GOOGLE_REDIRECT_URI = `${badAppUrl}/api/auth/callback/google`;
        const badRes = await fetch(`${OAUTH_TEST_BASE}/api/auth/google/url`);
        const badData = await badRes.json();
        testAssert(
          badRes.status === 400 && badData.code === 'redirect_uri_mismatch',
          `[6.3 Redirect URI Mismatch] Rejects non-production APP_URL (${badAppUrl}) with 400 redirect_uri_mismatch`
        );
      }

      // Unsupported callback path in GOOGLE_REDIRECT_URI
      setValidProdGoogleEnv();
      process.env.GOOGLE_REDIRECT_URI = `${prodDomain}/auth/google/callback`;
      const wrongPathRes = await fetch(`${OAUTH_TEST_BASE}/api/auth/google/url`);
      const wrongPathData = await wrongPathRes.json();
      testAssert(
        wrongPathRes.status === 400 && wrongPathData.code === 'redirect_uri_mismatch',
        '[6.3 Redirect URI Mismatch] Rejects GOOGLE_REDIRECT_URI using invalid callback path with 400 redirect_uri_mismatch'
      );

      // Mismatched domain in GOOGLE_REDIRECT_URI vs APP_URL
      setValidProdGoogleEnv();
      process.env.GOOGLE_REDIRECT_URI = 'https://other-domain.example.com/api/auth/callback/google';
      const wrongDomainRes = await fetch(`${OAUTH_TEST_BASE}/api/auth/google/url`);
      const wrongDomainData = await wrongDomainRes.json();
      testAssert(
        wrongDomainRes.status === 400 && wrongDomainData.code === 'redirect_uri_mismatch',
        '[6.3 Redirect URI Mismatch] Rejects GOOGLE_REDIRECT_URI on different domain than APP_URL with 400 redirect_uri_mismatch'
      );

      // Hitting /api/auth/google/callback when GOOGLE_REDIRECT_URI is /api/auth/callback/google returns 400 redirect_uri_mismatch
      setValidProdGoogleEnv();
      const nonCanonicalRes = await fetch(`${OAUTH_TEST_BASE}/api/auth/google/callback?code=abc&state=${'b'.repeat(64)}`);
      const nonCanonicalData = await nonCanonicalRes.json();
      testAssert(
        nonCanonicalRes.status === 400 && nonCanonicalData.code === 'redirect_uri_mismatch',
        '[6.3 Redirect URI Mismatch] Mismatched callback path (/api/auth/google/callback vs configured /api/auth/callback/google) returns 400 redirect_uri_mismatch'
      );

      // Google callback query ?error=redirect_uri_mismatch
      const providerMismatchRes = await fetch(
        `${OAUTH_TEST_BASE}/api/auth/callback/google?error=redirect_uri_mismatch`
      );
      const providerMismatchData = await providerMismatchRes.json();
      testAssert(
        providerMismatchRes.status === 400 && providerMismatchData.code === 'redirect_uri_mismatch',
        '[6.3 Redirect URI Mismatch] Google callback error=redirect_uri_mismatch returns 400 redirect_uri_mismatch'
      );

      // Google token endpoint returning redirect_uri_mismatch
      mockGoogleMode = 'token_redirect_uri_mismatch';
      const flowTokenMismatch = await initiateValidGoogleFlow();
      const tokenMismatchRes = await fetch(
        `${OAUTH_TEST_BASE}/api/auth/callback/google?code=auth_code_1&state=${flowTokenMismatch.state}`,
        { headers: { Cookie: flowTokenMismatch.stateCookiePair } }
      );
      const tokenMismatchData = await tokenMismatchRes.json();
      testAssert(
        tokenMismatchRes.status === 400 && tokenMismatchData.code === 'redirect_uri_mismatch',
        '[6.3 Redirect URI Mismatch] Token exchange redirect_uri_mismatch returns 400 redirect_uri_mismatch'
      );

      // ----------------------------------------------------------------------
      // Scenario 6.4: Failed Token Exchange, Failed Profile Request & Failed PostgreSQL User Creation
      // ----------------------------------------------------------------------
      mockGoogleMode = 'token_exchange_error';
      const flowFailedToken = await initiateValidGoogleFlow();
      const failedTokenRes = await fetch(
        `${OAUTH_TEST_BASE}/api/auth/callback/google?code=expired_code&state=${flowFailedToken.state}`,
        { headers: { Cookie: flowFailedToken.stateCookiePair } }
      );
      const failedTokenData = await failedTokenRes.json();
      const failedTokenRaw = JSON.stringify(failedTokenData);
      testAssert(
        failedTokenRes.status === 400 &&
          failedTokenData.code === 'token_exchange_failed' &&
          !failedTokenRaw.includes(runtimeTestClientSecret) &&
          !findSetCookieHeader(failedTokenRes, 'auth_session'),
        '[6.4 Failed Token Exchange] Returns HTTP 400 token_exchange_failed without leaking secrets or setting session'
      );

      mockGoogleMode = 'profile_request_error';
      const flowFailedProfile = await initiateValidGoogleFlow();
      const failedProfileRes = await fetch(
        `${OAUTH_TEST_BASE}/api/auth/callback/google?code=good_code&state=${flowFailedProfile.state}`,
        { headers: { Cookie: flowFailedProfile.stateCookiePair } }
      );
      const failedProfileData = await failedProfileRes.json();
      testAssert(
        failedProfileRes.status === 502 &&
          failedProfileData.code === 'profile_request_failed' &&
          !findSetCookieHeader(failedProfileRes, 'auth_session'),
        '[6.4 Failed Profile Request] Returns HTTP 502 profile_request_failed without setting session'
      );

      mockGoogleMode = 'success_new_student';
      simulatePgUserCreationFailure = true;
      const flowFailedDb = await initiateValidGoogleFlow();
      const failedDbRes = await fetch(
        `${OAUTH_TEST_BASE}/api/auth/callback/google?code=good_code&state=${flowFailedDb.state}`,
        { headers: { Cookie: flowFailedDb.stateCookiePair } }
      );
      const failedDbData = await failedDbRes.json();
      simulatePgUserCreationFailure = false;
      testAssert(
        failedDbRes.status === 500 &&
          failedDbData.code === 'user_creation_failed' &&
          !findSetCookieHeader(failedDbRes, 'auth_session'),
        '[6.4 Failed PostgreSQL User Creation] Returns HTTP 500 user_creation_failed without setting session'
      );

      // ----------------------------------------------------------------------
      // Scenarios 6.5 & 6.6: Successful Google Login + New Google User Receives "student" Role
      // ----------------------------------------------------------------------
      mockGoogleMode = 'success_new_student';
      lastTokenRequestParams = null;

      const prodDiscoveryRes = await fetch(`${OAUTH_TEST_BASE}/api/auth/providers`);
      const prodDiscoveryData = await prodDiscoveryRes.json();
      testAssert(
        prodDiscoveryData.providers?.google?.configured === true &&
          prodDiscoveryData.providers?.google?.redirectUri === prodCallbackUri &&
          !JSON.stringify(prodDiscoveryData).includes(runtimeTestClientSecret) &&
          !JSON.stringify(prodDiscoveryData).includes(runtimeTestClientId),
        '[6.5 Successful Login] /api/auth/providers reports Google configured with production callback URL and zero leaked credentials'
      );

      const validFlow = await initiateValidGoogleFlow();
      const parsedAuthUrl = new URL(validFlow.authUrl);
      testAssert(
        parsedAuthUrl.origin === 'https://accounts.google.com' &&
          parsedAuthUrl.searchParams.get('redirect_uri') === prodCallbackUri &&
          parsedAuthUrl.searchParams.get('response_type') === 'code' &&
          /^[a-f0-9]{64}$/.test(validFlow.state),
        '[6.5 Successful Login] Authorization URL uses APP_URL production callback (/api/auth/callback/google) and 64-hex CSPRNG state'
      );

      const authCode = `code_${crypto.randomBytes(12).toString('hex')}`;
      const successCallbackRes = await fetch(
        `${OAUTH_TEST_BASE}/api/auth/callback/google?code=${authCode}&state=${validFlow.state}`,
        {
          redirect: 'manual',
          headers: {
            Cookie: validFlow.stateCookiePair,
            'X-Forwarded-Proto': 'https',
          },
        }
      );

      testAssert(
        lastTokenRequestParams !== null &&
          lastTokenRequestParams.get('code') === authCode &&
          lastTokenRequestParams.get('redirect_uri') === prodCallbackUri &&
          lastTokenRequestParams.get('grant_type') === 'authorization_code',
        '[6.5 Successful Login] Backend exchanges authorization code directly with Google token endpoint'
      );

      const newSessionCookie = findSetCookieHeader(successCallbackRes, 'auth_session') || '';
      testAssert(
        successCallbackRes.status === 302 &&
          successCallbackRes.headers.get('location') === '/student/dashboard',
        '[6.5 Successful Login] Redirects authenticated Google student (HTTP 302) to /student/dashboard'
      );
      testAssert(
        newSessionCookie.includes('auth_session=') &&
          newSessionCookie.toLowerCase().includes('httponly') &&
          newSessionCookie.toLowerCase().includes('secure') &&
          newSessionCookie.toLowerCase().includes('samesite=lax'),
        '[6.5 Successful Login] Issues secure HttpOnly SameSite=Lax auth_session cookie'
      );

      // Replaying the exact same valid state a second time MUST fail with 400 invalid_state
      const replayStateRes = await fetch(
        `${OAUTH_TEST_BASE}/api/auth/callback/google?code=${authCode}&state=${validFlow.state}`,
        { headers: { Cookie: validFlow.stateCookiePair } }
      );
      const replayStateData = await replayStateRes.json();
      testAssert(
        replayStateRes.status === 400 && replayStateData.code === 'invalid_state',
        '[6.2 Single-Use State] Replaying a consumed OAuth state is rejected with HTTP 400 invalid_state'
      );

      // Verify Scenario 6.6: New Google user received default role "student" in PostgreSQL & session
      const createdPgUser = pgSimulatedUsers.get(newGoogleStudentEmail);
      testAssert(
        Boolean(createdPgUser && createdPgUser.role === 'student' && createdPgUser.passwordHash === null),
        '[6.6 Default Student Role] New Google user is persisted with default role "student" and null passwordHash'
      );

      const meNewStudentRes = await fetch(`${OAUTH_TEST_BASE}/api/auth/me`, {
        headers: cookieAuthHeaders(newSessionCookie),
      });
      const meNewStudentData = await meNewStudentRes.json();
      testAssert(
        meNewStudentRes.status === 200 &&
          meNewStudentData.user?.email === newGoogleStudentEmail &&
          meNewStudentData.user?.role === 'student',
        '[6.6 Default Student Role] GET /api/auth/me confirms authenticated Google user with role "student"'
      );

      const newStudentDashRes = await fetch(`${OAUTH_TEST_BASE}/api/student/dashboard`, {
        headers: cookieAuthHeaders(newSessionCookie),
      });
      const newStudentAdminRes = await fetch(`${OAUTH_TEST_BASE}/api/admin/dashboard`, {
        headers: cookieAuthHeaders(newSessionCookie),
      });
      testAssert(
        newStudentDashRes.status === 200 && newStudentAdminRes.status === 403,
        '[6.6 Default Student Role] New Google student can access /api/student/dashboard (200) and is blocked from /api/admin/dashboard (403)'
      );

      // ----------------------------------------------------------------------
      // Scenario 6.7: Existing PostgreSQL User Can Log In via Google OAuth
      // ----------------------------------------------------------------------
      mockGoogleMode = 'success_existing_user';
      const userCountBeforeExistingLogin = pgSimulatedUsers.size;
      const existingFlow = await initiateValidGoogleFlow();
      const existingCallbackRes = await fetch(
        `${OAUTH_TEST_BASE}/api/auth/callback/google?code=existing_code_123&state=${existingFlow.state}`,
        {
          redirect: 'manual',
          headers: {
            Cookie: existingFlow.stateCookiePair,
            'X-Forwarded-Proto': 'https',
          },
        }
      );
      const existingSessionCookie = findSetCookieHeader(existingCallbackRes, 'auth_session') || '';
      const existingMeRes = await fetch(`${OAUTH_TEST_BASE}/api/auth/me`, {
        headers: cookieAuthHeaders(existingSessionCookie),
      });
      const existingMeData = await existingMeRes.json();

      testAssert(
        existingCallbackRes.status === 302 &&
          existingCallbackRes.headers.get('location') === '/student/dashboard' &&
          pgSimulatedUsers.size === userCountBeforeExistingLogin &&
          existingMeRes.status === 200 &&
          existingMeData.user?.id === preExistingUserId &&
          existingMeData.user?.email === existingGoogleUserEmail,
        '[6.7 Existing User Login] Existing PostgreSQL user logs in via Google without duplicate creation and preserves user ID'
      );

      // ----------------------------------------------------------------------
      // Scenario 6.8: Logout Removes the Session (Clears Cookie & Revokes Server Token)
      // ----------------------------------------------------------------------
      const logoutRes = await fetch(`${OAUTH_TEST_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: cookieAuthHeaders(newSessionCookie, { 'X-Forwarded-Proto': 'https' }),
      });
      const clearedCookieHeader = findSetCookieHeader(logoutRes, 'auth_session') || '';
      testAssert(
        logoutRes.status === 200 &&
          (clearedCookieHeader.startsWith('auth_session=;') ||
            clearedCookieHeader.toLowerCase().includes('expires=thu, 01 jan 1970')),
        '[6.8 Logout Removes Session] POST /api/auth/logout clears HttpOnly auth_session cookie'
      );

      // Replaying the pre-logout session cookie must now return 401 Unauthorized
      const meAfterLogoutRes = await fetch(`${OAUTH_TEST_BASE}/api/auth/me`, {
        headers: cookieAuthHeaders(newSessionCookie),
      });
      const studentDashAfterLogoutRes = await fetch(`${OAUTH_TEST_BASE}/api/student/dashboard`, {
        headers: cookieAuthHeaders(newSessionCookie),
      });
      testAssert(
        meAfterLogoutRes.status === 401 && studentDashAfterLogoutRes.status === 401,
        '[6.8 Logout Removes Session] Revoked session cookie is rejected with HTTP 401 on /api/auth/me and /api/student/dashboard'
      );
    } finally {
      await new Promise<void>((resolve) => isolatedServer.close(() => resolve()));
      for (const [key, val] of Object.entries(savedEnv)) {
        if (val === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = val;
        }
      }
    }

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
