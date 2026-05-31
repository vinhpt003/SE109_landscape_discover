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

describe('PostsController (integration / Testcontainer)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let adminUser: any, adminToken: string;
  let editorUser: any, editorToken: string;
  let regularUser: any, regularToken: string;
  let location: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    // Setup basic test data
    const suffix = Date.now();
    const adminData = await createTestUser(prisma, jwtService, `${suffix}_admin`, Role.Admin);
    adminUser = adminData.user;
    adminToken = adminData.token;

    const editorData = await createTestUser(prisma, jwtService, `${suffix}_editor`, Role.Editor);
    editorUser = editorData.user;
    editorToken = editorData.token;

    const regularData = await createTestUser(prisma, jwtService, `${suffix}_regular`, Role.RegisteredUser);
    regularUser = regularData.user;
    regularToken = regularData.token;

    location = await createTestLocation(prisma, suffix);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /posts (UC-01, UC-02)', () => {
    let post1: any, post2: any, loc2: any;

    beforeAll(async () => {
      const ts = Date.now();
      loc2 = await createTestLocation(prisma, `${ts}_loc2`);
      post1 = await createTestPost(prisma, adminUser.userId, location.locationId, `${ts}_p1`, PostStatus.Publish);
      // Update post1 to contain specific search keyword
      await prisma.post.update({
        where: { postId: post1.postId },
        data: { title: 'Đà Nẵng City Guide' },
      });
      post2 = await createTestPost(prisma, editorUser.userId, loc2.locationId, `${ts}_p2`, PostStatus.Publish);
    });

    it('[UC-01] should search posts by keyword (Tìm kiếm địa điểm)', async () => {
      const res = await request(app.getHttpServer())
        .get('/posts?search=Đà Nẵng')
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((p: any) => p.postId === post1.postId)).toBe(true);
      expect(res.body.data.some((p: any) => p.postId === post2.postId)).toBe(false);
    });

    it('[UC-02] should filter posts by locationId (Lọc địa điểm)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/posts?locationId=${loc2.locationId}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((p: any) => p.postId === post2.postId)).toBe(true);
      expect(res.body.data.every((p: any) => p.locationId === loc2.locationId)).toBe(true);
    });
  });

  describe('GET /posts/:id (UC-03)', () => {
    let post: any;

    beforeAll(async () => {
      post = await createTestPost(prisma, editorUser.userId, location.locationId, `${Date.now()}_view`, PostStatus.Publish);
    });

    it('[UC-03] should return post details', async () => {
      const res = await request(app.getHttpServer())
        .get(`/posts/${post.postId}`)
        .expect(200);

      expect(res.body.postId).toBe(post.postId);
      expect(res.body.title).toBe(post.title);
      expect(res.body.author.userId).toBe(editorUser.userId);
    });

    it('[UC-03] should return 404 for non-existent post', async () => {
      await request(app.getHttpServer())
        .get('/posts/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('POST /posts (UC-11)', () => {
    it('[UC-11] should create post with Admin role', async () => {
      const res = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          locationId: location.locationId,
          title: 'New Post Title',
          content: 'New Post Content',
        })
        .expect(201);

      expect(res.body.postId).toBeDefined();
      expect(res.body.status).toBe(PostStatus.Draft);
    });

    it('[UC-11] should be forbidden for RegisteredUser', async () => {
      await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          locationId: location.locationId,
          title: 'Forbidden Post',
          content: 'Content',
        })
        .expect(403);
    });
  });

  describe('PATCH /posts/:id (UC-12)', () => {
    let myPost: any;

    beforeAll(async () => {
      myPost = await createTestPost(prisma, editorUser.userId, location.locationId, `${Date.now()}_edit`, PostStatus.Publish);
    });

    it('[UC-12] should allow author to edit post', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/posts/${myPost.postId}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(res.body.title).toBe('Updated Title');
    });

    it('[UC-12] should return 403 when non-author tries to edit', async () => {
      await request(app.getHttpServer())
        .patch(`/posts/${myPost.postId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ title: 'Hacked Title' })
        .expect(403);
    });
  });

  describe('PATCH /posts/:id/status (UC-15, UC-16)', () => {
    let pendingPost: any;

    beforeEach(async () => {
      pendingPost = await createTestPost(prisma, editorUser.userId, location.locationId, `${Date.now()}_pending`, PostStatus.Pending);
    });

    it('[UC-15] Admin should approve post', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/posts/${pendingPost.postId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: PostStatus.Publish })
        .expect(200);

      expect(res.body.status).toBe(PostStatus.Publish);
    });

    it('[UC-16] Admin should reject post', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/posts/${pendingPost.postId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: PostStatus.Rejected })
        .expect(200);

      expect(res.body.status).toBe(PostStatus.Rejected);
    });

    it('should be forbidden for non-admin to change status', async () => {
      await request(app.getHttpServer())
        .patch(`/posts/${pendingPost.postId}/status`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ status: PostStatus.Publish })
        .expect(403);
    });
  });

  describe('DELETE /posts/:id (UC-17)', () => {
    let postToDelete: any;

    beforeEach(async () => {
      postToDelete = await createTestPost(prisma, editorUser.userId, location.locationId, `${Date.now()}_delete`, PostStatus.Publish);
    });

    it('[UC-17] should allow author to delete post', async () => {
      await request(app.getHttpServer())
        .delete(`/posts/${postToDelete.postId}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(204);
    });

    it('[UC-17] should allow admin to delete any post', async () => {
      const anotherPost = await createTestPost(prisma, editorUser.userId, location.locationId, `${Date.now()}_admin_delete`);
      await request(app.getHttpServer())
        .delete(`/posts/${anotherPost.postId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });

    it('[UC-17] should forbid non-author from deleting post', async () => {
      const somePost = await createTestPost(prisma, adminUser.userId, location.locationId, `${Date.now()}_reg_delete`);
      await request(app.getHttpServer())
        .delete(`/posts/${somePost.postId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);
    });
  });
});
