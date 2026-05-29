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
});
