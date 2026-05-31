import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { createTestUser, createTestLocation, createTestPost, createTestComment } from './utils/e2e-helpers';
import { Role, PostStatus } from '@prisma/client';

describe('CommentsController (integration / Testcontainer)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let adminUser: any, adminToken: string;
  let regularUser: any, regularToken: string;
  let regularUser2: any, regularToken2: string;
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
    adminToken = adminData.token;

    const regularData = await createTestUser(prisma, jwtService, `${suffix}_reg1`, Role.RegisteredUser);
    regularUser = regularData.user;
    regularToken = regularData.token;

    const regularData2 = await createTestUser(prisma, jwtService, `${suffix}_reg2`, Role.RegisteredUser);
    regularUser2 = regularData2.user;
    regularToken2 = regularData2.token;

    // Seed location and post
    location = await createTestLocation(prisma, suffix);
    post = await createTestPost(prisma, adminUser.userId, location.locationId, suffix, PostStatus.Publish);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /comments (UC-06)', () => {
    it('[UC-06] should allow logged-in user to comment on a post', async () => {
      const res = await request(app.getHttpServer())
        .post('/comments')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          postId: post.postId,
          content: 'This is a great place!',
        })
        .expect(201);

      expect(res.body.commentId).toBeDefined();
      expect(res.body.content).toBe('This is a great place!');
      expect(res.body.userId).toBe(regularUser.userId);
    });

    it('should return 400 when content is empty', async () => {
      await request(app.getHttpServer())
        .post('/comments')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          postId: post.postId,
          content: '',
        })
        .expect(400);
    });

    it('should return 401 when unauthorized', async () => {
      await request(app.getHttpServer())
        .post('/comments')
        .send({
          postId: post.postId,
          content: 'No token comment',
        })
        .expect(401);
    });
  });

  describe('DELETE /comments/:id (UC-18)', () => {
    let commentByReg1: any;

    beforeEach(async () => {
      commentByReg1 = await createTestComment(prisma, regularUser.userId, post.postId, Date.now());
    });

    it('[UC-18] should allow Admin to moderate (delete) any comment', async () => {
      await request(app.getHttpServer())
        .delete(`/comments/${commentByReg1.commentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deleted = await prisma.comment.findUnique({ where: { commentId: commentByReg1.commentId }});
      expect(deleted).toBeNull();
    });

    it('should allow author to delete their own comment', async () => {
      await request(app.getHttpServer())
        .delete(`/comments/${commentByReg1.commentId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(204);
    });

    it('should forbid non-author from deleting someone else\'s comment', async () => {
      await request(app.getHttpServer())
        .delete(`/comments/${commentByReg1.commentId}`)
        .set('Authorization', `Bearer ${regularToken2}`)
        .expect(403);
    });
  });
});
