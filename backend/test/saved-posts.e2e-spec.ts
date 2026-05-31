import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { createTestUser, createTestLocation, createTestPost } from './utils/e2e-helpers';
import { Role, PostStatus } from '@prisma/client';

describe('SavedPostsController (integration / Testcontainer)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let adminUser: any;
  let regularUser: any, regularToken: string;
  let location: any;
  let post1: any;
  let post2: any;

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
    
    const adminData = await createTestUser(prisma, jwtService, `${suffix}_admin`, Role.Admin);
    adminUser = adminData.user;

    const regularData = await createTestUser(prisma, jwtService, `${suffix}_reg1`, Role.RegisteredUser);
    regularUser = regularData.user;
    regularToken = regularData.token;

    location = await createTestLocation(prisma, suffix);
    post1 = await createTestPost(prisma, adminUser.userId, location.locationId, `${suffix}_1`, PostStatus.Publish);
    post2 = await createTestPost(prisma, adminUser.userId, location.locationId, `${suffix}_2`, PostStatus.Publish);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /saved-posts (UC-08, UC-10)', () => {
    it('[UC-08] should save a post when not already saved', async () => {
      const res = await request(app.getHttpServer())
        .post('/saved-posts')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ postId: post1.postId })
        .expect(201);

      expect(res.body.saved).toBe(true);

      const dbRecord = await prisma.savedPost.findUnique({
        where: { userId_postId: { userId: regularUser.userId, postId: post1.postId } },
      });
      expect(dbRecord).not.toBeNull();
    });

    it('[UC-10] should unsave a post when already saved', async () => {
      // Toggle it again to unsave
      const res = await request(app.getHttpServer())
        .post('/saved-posts')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ postId: post1.postId })
        .expect(201);

      expect(res.body.saved).toBe(false);

      const dbRecord = await prisma.savedPost.findUnique({
        where: { userId_postId: { userId: regularUser.userId, postId: post1.postId } },
      });
      expect(dbRecord).toBeNull();
    });

    it('should return 401 when unauthorized', async () => {
      await request(app.getHttpServer())
        .post('/saved-posts')
        .send({ postId: post1.postId })
        .expect(401);
    });
  });

  describe('GET /saved-posts/me (UC-09)', () => {
    beforeAll(async () => {
      // Setup: user saves post2
      await request(app.getHttpServer())
        .post('/saved-posts')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ postId: post2.postId })
        .expect(201);
    });

    it('[UC-09] should retrieve list of saved posts for current user', async () => {
      const res = await request(app.getHttpServer())
        .get('/saved-posts/me')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.some((item: any) => item.postId === post2.postId)).toBe(true);
    });

    it('should return empty list when user has no saved posts', async () => {
      // Create new user
      const suffix = Date.now();
      const newUserData = await createTestUser(prisma, jwtService, `${suffix}_new`, Role.RegisteredUser);
      
      const res = await request(app.getHttpServer())
        .get('/saved-posts/me')
        .set('Authorization', `Bearer ${newUserData.token}`)
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });
});
