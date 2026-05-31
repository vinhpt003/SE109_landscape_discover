import { Test, TestingModule } from '@nestjs/testing';
import { RatingsService } from './ratings.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RatingsService', () => {
  let service: RatingsService;
  let prisma: any;

  const mockPrisma = {
    rating: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RatingsService>(RatingsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upsert', () => {
    it('should upsert rating and return it', async () => {
      const dto = { postId: 'post1', score: 5 };
      const userId = 'user1';
      const mockResult = { rateId: '1', postId: 'post1', userId, score: 5 };
      prisma.rating.upsert.mockResolvedValue(mockResult);

      const result = await service.upsert(dto, userId);
      expect(prisma.rating.upsert).toHaveBeenCalledWith({
        where: { postId_userId: { postId: 'post1', userId } },
        update: { score: 5 },
        create: { postId: 'post1', userId, score: 5 },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('getSummary', () => {
    it('should calculate average score and count correctly', async () => {
      const mockRatings = [
        { score: 3 },
        { score: 5 },
      ];
      prisma.rating.findMany.mockResolvedValue(mockRatings);

      const result = await service.getSummary('post1');
      expect(prisma.rating.findMany).toHaveBeenCalledWith({ where: { postId: 'post1' } });
      expect(result).toEqual({
        postId: 'post1',
        avgRating: 4,
        count: 2,
      });
    });

    it('should return null avgRating if there are no ratings', async () => {
      prisma.rating.findMany.mockResolvedValue([]);
      const result = await service.getSummary('post1');
      expect(result.avgRating).toBeNull();
      expect(result.count).toBe(0);
    });
  });

  // ─── Business Rule Tests ─────────────────────────────────────────────────────

  describe('[BR-12] Rating score boundary values: minimum 1, maximum 5', () => {
    it('[BR-12] upsert() stores score = 1 (minimum valid score per 1–5 scale)', async () => {
      prisma.rating.upsert.mockResolvedValue({ rateId: 'r1', postId: 'p1', userId: 'u1', score: 1 });

      const result = await service.upsert({ postId: 'p1', score: 1 }, 'u1');

      expect(result.score).toBe(1);
      expect(prisma.rating.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ create: expect.objectContaining({ score: 1 }) }),
      );
    });

    it('[BR-12] upsert() stores score = 5 (maximum valid score per 1–5 scale)', async () => {
      prisma.rating.upsert.mockResolvedValue({ rateId: 'r2', postId: 'p1', userId: 'u1', score: 5 });

      const result = await service.upsert({ postId: 'p1', score: 5 }, 'u1');

      expect(result.score).toBe(5);
      expect(prisma.rating.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ create: expect.objectContaining({ score: 5 }) }),
      );
    });
  });

  describe('[BR-13] One rating per user/post pair: subsequent call updates, not duplicates', () => {
    it('[BR-13] upsert() uses composite key [postId, userId] ensuring at-most-one rating per pair', async () => {
      prisma.rating.upsert.mockResolvedValue({ rateId: 'r1', postId: 'p1', userId: 'u1', score: 4 });

      await service.upsert({ postId: 'p1', score: 4 }, 'u1');

      expect(prisma.rating.upsert).toHaveBeenCalledWith({
        where: { postId_userId: { postId: 'p1', userId: 'u1' } },
        update: { score: 4 },
        create: { postId: 'p1', userId: 'u1', score: 4 },
      });
    });

    it('[BR-13] calling upsert() twice for same user/post updates the score rather than inserting a duplicate', async () => {
      prisma.rating.upsert.mockResolvedValueOnce({ rateId: 'r1', postId: 'p1', userId: 'u1', score: 3 });
      await service.upsert({ postId: 'p1', score: 3 }, 'u1');

      prisma.rating.upsert.mockResolvedValueOnce({ rateId: 'r1', postId: 'p1', userId: 'u1', score: 5 });
      const result = await service.upsert({ postId: 'p1', score: 5 }, 'u1');

      // Both calls go through upsert (no separate insert path)
      expect(prisma.rating.upsert).toHaveBeenCalledTimes(2);
      expect(result.score).toBe(5);
    });

    it('[BR-13] getSummary() correctly averages ratings from multiple distinct users', async () => {
      prisma.rating.findMany.mockResolvedValue([{ score: 5 }, { score: 3 }, { score: 4 }]);

      const result = await service.getSummary('p1');

      expect(result.count).toBe(3);
      expect(result.avgRating).toBeCloseTo(4.0, 2);
    });
  });
});
