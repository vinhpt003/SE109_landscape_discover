import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { createTestUser } from './utils/e2e-helpers';
import { Role } from '@prisma/client';

describe('UsersController (integration / Testcontainer)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let adminUser: any, adminToken: string;
  let regularUser: any, regularToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    const suffix = Date.now();
    
    // Seed users
    const adminData = await createTestUser(prisma, jwtService, `${suffix}_admin`, Role.Admin);
    adminUser = adminData.user;
    adminToken = adminData.token;

    const regularData = await createTestUser(prisma, jwtService, `${suffix}_reg1`, Role.RegisteredUser);
    regularUser = regularData.user;
    regularToken = regularData.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users/me', () => {
    it('should retrieve own profile', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(200);

      expect(res.body.userId).toBe(regularUser.userId);
      expect(res.body.userName).toBe(regularUser.userName);
      expect(res.body).not.toHaveProperty('password');
    });

    it('should return 401 when unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .expect(401);
    });
  });

  describe('PATCH /users/me', () => {
    it('should update own profile', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ userName: `new_name_${Date.now()}` })
        .expect(200);

      expect(res.body.userName).toMatch(/^new_name_/);
    });

    it('should throw conflict when updating to existing username', async () => {
      await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ userName: adminUser.userName })
        .expect(409);
    });
  });

  describe('GET /users', () => {
    it('Admin should fetch paginated users', async () => {
      const res = await request(app.getHttpServer())
        .get('/users?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.total).toBeDefined();
    });

    it('should forbid non-admin from fetching users', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);
    });
  });

  describe('PATCH /users/:id/role', () => {
    it('Admin should update user role', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${regularUser.userId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: Role.Editor })
        .expect(200);

      expect(res.body.role).toBe(Role.Editor);
    });

    it('should forbid non-admin from updating user role', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${adminUser.userId}/role`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ role: Role.RegisteredUser })
        .expect(403);
    });

    it('should return 404 if user not found', async () => {
      await request(app.getHttpServer())
        .patch('/users/00000000-0000-0000-0000-000000000000/role')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: Role.Editor })
        .expect(404);
    });
  });
});
