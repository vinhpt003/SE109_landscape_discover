import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { createTestUser, createTestLocation, createTestPost } from './utils/e2e-helpers';
import { Role, Region } from '@prisma/client';

describe('StatsController (integration / Testcontainer)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let adminToken: string;
  let regularToken: string;

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

    const adminData = await createTestUser(prisma, jwtService, `${suffix}_stats_admin`, Role.Admin);
    adminToken = adminData.token;

    const regularData = await createTestUser(prisma, jwtService, `${suffix}_stats_reg`, Role.RegisteredUser);
    regularToken = regularData.token;

    // Seed locations with specific regions and posts for stats verification
    const northLoc = await prisma.location.create({
      data: { locationName: `Stats North ${suffix}`, region: Region.North },
    });
    const centralLoc = await prisma.location.create({
      data: { locationName: `Stats Central ${suffix}`, region: Region.Central },
    });
    const southLoc = await prisma.location.create({
      data: { locationName: `Stats South ${suffix}`, region: Region.South },
    });

    // Create posts linked to each region
    await createTestPost(prisma, adminData.user.userId, northLoc.locationId, `${suffix}_n1`);
    await createTestPost(prisma, adminData.user.userId, centralLoc.locationId, `${suffix}_c1`);
    await createTestPost(prisma, adminData.user.userId, centralLoc.locationId, `${suffix}_c2`);
    await createTestPost(prisma, adminData.user.userId, southLoc.locationId, `${suffix}_s1`, 'Pending');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /stats/dashboard', () => {
    it('should return dashboard data for Admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/stats/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('totalPosts');
      expect(res.body).toHaveProperty('pendingPosts');
      expect(res.body).toHaveProperty('totalUsers');
      expect(res.body).toHaveProperty('newPostsLast30d');
      expect(res.body).toHaveProperty('newUsersLast30d');
      expect(res.body).toHaveProperty('postsByRegion');

      // Verify types
      expect(typeof res.body.totalPosts).toBe('number');
      expect(typeof res.body.pendingPosts).toBe('number');
      expect(typeof res.body.totalUsers).toBe('number');
      expect(typeof res.body.newPostsLast30d).toBe('number');
      expect(typeof res.body.newUsersLast30d).toBe('number');

      // Verify postsByRegion shape
      expect(Array.isArray(res.body.postsByRegion)).toBe(true);
      expect(res.body.postsByRegion).toHaveLength(3);
      for (const entry of res.body.postsByRegion) {
        expect(entry).toHaveProperty('region');
        expect(entry).toHaveProperty('count');
        expect(['North', 'Central', 'South']).toContain(entry.region);
        expect(typeof entry.count).toBe('number');
      }
    });

    it('should reflect seeded data (at least 1 pending post)', async () => {
      const res = await request(app.getHttpServer())
        .get('/stats/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.totalPosts).toBeGreaterThanOrEqual(4);
      expect(res.body.pendingPosts).toBeGreaterThanOrEqual(1);
      expect(res.body.totalUsers).toBeGreaterThanOrEqual(2);
    });

    it('should return region counts that sum up coherently', async () => {
      const res = await request(app.getHttpServer())
        .get('/stats/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const regionTotal = res.body.postsByRegion.reduce(
        (sum: number, r: { count: number }) => sum + r.count,
        0,
      );
      // Region total can be ≤ totalPosts (locations without region are not counted)
      expect(regionTotal).toBeLessThanOrEqual(res.body.totalPosts);
    });

    it('should forbid non-admin users', async () => {
      await request(app.getHttpServer())
        .get('/stats/dashboard')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);
    });

    it('should return 401 when unauthenticated', async () => {
      await request(app.getHttpServer())
        .get('/stats/dashboard')
        .expect(401);
    });
  });
});
