import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { createTestUser, createTestNotification } from './utils/e2e-helpers';
import { Role } from '@prisma/client';

describe('NotificationsController (integration / Testcontainer)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let regularUser: any, regularToken: string;
  let otherUser: any, otherToken: string;
  let notif1: any, notif2: any;

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
    
    const regularData = await createTestUser(prisma, jwtService, `${suffix}_reg`, Role.RegisteredUser);
    regularUser = regularData.user;
    regularToken = regularData.token;

    const otherData = await createTestUser(prisma, jwtService, `${suffix}_other`, Role.RegisteredUser);
    otherUser = otherData.user;
    otherToken = otherData.token;

    notif1 = await createTestNotification(prisma, regularUser.userId, `${suffix}_1`, false);
    notif2 = await createTestNotification(prisma, regularUser.userId, `${suffix}_2`, true);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /notifications/me', () => {
    it('should retrieve notifications for current user', async () => {
      const res = await request(app.getHttpServer())
        .get('/notifications/me')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should retrieve only unread notifications when unreadOnly=true', async () => {
      const res = await request(app.getHttpServer())
        .get('/notifications/me?unreadOnly=true')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((n: any) => n.notificationId === notif1.notificationId)).toBe(true);
      expect(res.body.data.some((n: any) => n.notificationId === notif2.notificationId)).toBe(false);
    });

    it('should return 401 when unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/notifications/me')
        .expect(401);
    });
  });

  describe('PATCH /notifications/:id/read', () => {
    it('should mark single notification as read', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/notifications/${notif1.notificationId}/read`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(200);

      expect(res.body.read).toBe(true);
    });

    it('should return 404 for non-existent notification', async () => {
      await request(app.getHttpServer())
        .patch('/notifications/00000000-0000-0000-0000-000000000000/read')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(404);
    });

    it('should return 403 if attempting to read someone else\'s notification', async () => {
      await request(app.getHttpServer())
        .patch(`/notifications/${notif1.notificationId}/read`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });
  });

  describe('POST /notifications/read-all', () => {
    beforeAll(async () => {
      // Setup some new unread notifications
      await createTestNotification(prisma, regularUser.userId, `${Date.now()}_3`, false);
      await createTestNotification(prisma, regularUser.userId, `${Date.now()}_4`, false);
    });

    it('should mark all user notifications as read', async () => {
      const res = await request(app.getHttpServer())
        .post('/notifications/read-all')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(201); // Assuming standard POST response

      expect(res.body.count).toBeDefined(); // prisma.updateMany returns { count: N }
      
      // Verify no unread left
      const unread = await prisma.notification.count({
        where: { userId: regularUser.userId, read: false },
      });
      expect(unread).toBe(0);
    });
  });
});
