import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { createTestUser, createTestLocation } from './utils/e2e-helpers';
import { Role, Region } from '@prisma/client';

describe('LocationsController (integration / Testcontainer)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let adminToken: string;
  let regularToken: string;
  let existingLoc: any;

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
    adminToken = adminData.token;

    const regularData = await createTestUser(prisma, jwtService, `${suffix}_reg1`, Role.RegisteredUser);
    regularToken = regularData.token;

    existingLoc = await createTestLocation(prisma, suffix, Region.North);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /locations', () => {
    it('should retrieve all locations', async () => {
      const res = await request(app.getHttpServer())
        .get('/locations')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.some((l: any) => l.locationId === existingLoc.locationId)).toBe(true);
      // Verify region field is present in the response
      const seededLoc = res.body.find((l: any) => l.locationId === existingLoc.locationId);
      expect(seededLoc.region).toBe('North');
    });
  });

  describe('GET /locations/:id', () => {
    it('should retrieve specific location', async () => {
      const res = await request(app.getHttpServer())
        .get(`/locations/${existingLoc.locationId}`)
        .expect(200);

      expect(res.body.locationId).toBe(existingLoc.locationId);
      expect(res.body.locationName).toBe(existingLoc.locationName);
      expect(res.body.region).toBe('North');
    });

    it('should return 404 for non-existent location', async () => {
      await request(app.getHttpServer())
        .get('/locations/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('POST /locations', () => {
    const locPayload = {
      locationName: 'New Location',
      description: 'Desc',
      coordinates: '10,20',
      region: 'South',
    };

    it('Admin should create new location', async () => {
      const res = await request(app.getHttpServer())
        .post('/locations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(locPayload)
        .expect(201);

      expect(res.body.locationId).toBeDefined();
      expect(res.body.locationName).toBe('New Location');
      expect(res.body.region).toBe('South');
    });

    it('Admin should create location without region', async () => {
      const res = await request(app.getHttpServer())
        .post('/locations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ locationName: 'No Region Loc', description: 'Desc' })
        .expect(201);

      expect(res.body.locationId).toBeDefined();
      expect(res.body.region).toBeNull();
    });

    it('should reject invalid region value', async () => {
      await request(app.getHttpServer())
        .post('/locations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ locationName: 'Bad Region', region: 'InvalidRegion' })
        .expect(400);
    });

    it('should forbid non-admin from creating location', async () => {
      await request(app.getHttpServer())
        .post('/locations')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(locPayload)
        .expect(403);
    });

    it('should return 400 for validation errors', async () => {
      await request(app.getHttpServer())
        .post('/locations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({}) // Missing locationName
        .expect(400);
    });
  });
});
