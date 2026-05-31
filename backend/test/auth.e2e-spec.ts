
import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (integration / Testcontainer)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  // Unique suffix so test names are traceable in logs
  const suffix = Date.now();
  const testUser = {
    userName: `integtest_${suffix}`,
    email: `integtest_${suffix}@example.com`,
    password: 'Password123',
  };

  // ── App bootstrap ──────────────────────────────────────────────────────────
  beforeAll(async () => {
    // DATABASE_URL is already overridden by global-setup.ts to point at the
    // Testcontainer, so AppModule connects to the isolated DB automatically.
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Mirror the global ValidationPipe from main.ts
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // No manual DB cleanup needed — the container is torn down after all suites
    // by global-teardown.ts.
    await app.close();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // UC-04: Đăng ký tài khoản (Register Account)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('POST /auth/register  [UC-04]', () => {

    // ── Success Flow ──────────────────────────────────────────────────────
    it('[UC-04] should register a new user and return 201 with access_token and user object', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      // JWT token present
      expect(res.body).toHaveProperty('access_token');
      expect(typeof res.body.access_token).toBe('string');
      expect(res.body.access_token.length).toBeGreaterThan(0);

      // User object with correct identity
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.userName).toBe(testUser.userName);
      expect(res.body.user.email).toBe(testUser.email);

      // [BR-03] password must NOT be exposed in the response
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('[BR-03] newly registered user has role = RegisteredUser by default', async () => {
      const dbUser = await prisma.user.findUnique({
        where: { userName: testUser.userName },
      });

      expect(dbUser).not.toBeNull();
      expect(dbUser!.role).toBe('RegisteredUser');
    });

    it('[BR-03] stored password is bcrypt-hashed (not the plaintext value)', async () => {
      const dbUser = await prisma.user.findUnique({
        where: { userName: testUser.userName },
      });

      expect(dbUser).not.toBeNull();
      // bcrypt hashes always start with $2b$ or $2a$
      expect(dbUser!.password).toMatch(/^\$2[ab]\$/);
      expect(dbUser!.password).not.toBe(testUser.password);
    });

    // ── Alternative Flow: duplicate username / email ───────────────────────
    it('[UC-04] should return 409 Conflict when the same username is registered again', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)          // identical to the successful registration above
        .expect(409);

      expect(res.body.message).toBeDefined();
    });

    it('[UC-04] should return 409 Conflict when only the email is duplicated', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          userName: `other_${suffix}`,
          email: testUser.email,   // duplicate email
          password: 'Password123',
        })
        .expect(409);

      expect(res.body.message).toBeDefined();
    });

    // ── Alternative Flow: DTO validation errors ───────────────────────────
    it('[UC-04] should return 400 Bad Request when password is shorter than 6 characters', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          userName: `shortpw_${suffix}`,
          email: `shortpw_${suffix}@example.com`,
          password: '123',
        })
        .expect(400);
    });

    it('[UC-04] should return 400 Bad Request when email format is invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          userName: `bademail_${suffix}`,
          email: 'not-an-email',
          password: 'Password123',
        })
        .expect(400);
    });

    it('[UC-04] should return 400 Bad Request when userName is missing', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `nousername_${suffix}@example.com`,
          password: 'Password123',
        })
        .expect(400);
    });

    it('[UC-04] should return 400 Bad Request when body is completely empty', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({})
        .expect(400);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // UC-05: Đăng nhập (Login)
  // Precondition: testUser was registered successfully in UC-04 above.
  // ═══════════════════════════════════════════════════════════════════════════
  describe('POST /auth/login  [UC-05]', () => {

    // ── Success Flow: login by username ───────────────────────────────────
    it('[UC-05] should login with username and return 201 with access_token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: testUser.userName,
          password: testUser.password,
        })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(typeof res.body.access_token).toBe('string');
      expect(res.body.access_token.length).toBeGreaterThan(0);

      expect(res.body.user.userName).toBe(testUser.userName);
      expect(res.body.user.email).toBe(testUser.email);
    });

    // ── Success Flow: login by email ──────────────────────────────────────
    it('[UC-05] should login with email as identifier and return 201 with access_token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('[UC-05] login response must NOT expose the password field', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: testUser.userName,
          password: testUser.password,
        })
        .expect(201);

      expect(res.body.user).not.toHaveProperty('password');
    });

    // ── Alternative Flow: wrong password ─────────────────────────────────
    it('[UC-05] should return 401 Unauthorized when password is incorrect', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: testUser.userName,
          password: 'WrongPassword!',
        })
        .expect(401);

      expect(res.body.message).toBeDefined();
    });

    // ── Alternative Flow: unknown user ────────────────────────────────────
    it('[UC-05] should return 401 Unauthorized when username does not exist', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: 'ghost_user_that_does_not_exist',
          password: 'Password123',
        })
        .expect(401);

      expect(res.body.message).toBeDefined();
    });

    // ── Alternative Flow: DTO validation errors ───────────────────────────
    it('[UC-05] should return 400 Bad Request when identifier is missing', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ password: 'Password123' })
        .expect(400);
    });

    it('[UC-05] should return 400 Bad Request when password is shorter than 6 characters', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: testUser.userName,
          password: '123',
        })
        .expect(400);
    });

    it('[UC-05] should return 400 Bad Request when body is completely empty', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });
  });
});
