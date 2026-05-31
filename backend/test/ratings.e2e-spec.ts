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

describe('RatingsController (integration / Testcontainer)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let adminUser: any;
  let regularUser: any, regularToken: string;
  let location: any;
  let post: any;

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

    const regularData = await createTestUser(prisma, jwtService, `${suffix}_reg1`, Role.RegisteredUser);
    regularUser = regularData.user;
    regularToken = regularData.token;

    // Seed location and post
    location = await createTestLocation(prisma, suffix);
    post = await createTestPost(prisma, adminUser.userId, location.locationId, suffix, PostStatus.Publish);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /ratings (UC-07)', () => {
    it('[UC-07] should allow user to rate a post', async () => {
      const res = await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          postId: post.postId,
          score: 5,
        })
        .expect(201);

      expect(res.body.score).toBe(5);
      expect(res.body.userId).toBe(regularUser.userId);
    });

    it('[UC-07] should upsert rating if user rates again', async () => {
      // User rates the same post again with a different score
      const res = await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          postId: post.postId,
          score: 3,
        })
        .expect(201);

      expect(res.body.score).toBe(3);

      // Verify DB only has 1 rating for this user-post pair
      const count = await prisma.rating.count({
        where: { userId: regularUser.userId, postId: post.postId },
      });
      expect(count).toBe(1);
    });

    it('should return 400 when score is out of bounds', async () => {
      await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          postId: post.postId,
          score: 10,
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/ratings')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          postId: post.postId,
          score: 0,
        })
        .expect(400);
    });

    it('should return 401 when unauthorized', async () => {
      await request(app.getHttpServer())
        .post('/ratings')
        .send({
          postId: post.postId,
          score: 5,
        })
        .expect(401);
    });
  });
});
