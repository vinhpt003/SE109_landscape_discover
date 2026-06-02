import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { PrismaService } from '../prisma/prisma.service';

describe('StatsService', () => {
  let service: StatsService;
  let prisma: any;

  const mockPrisma = {
    post: {
      count: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should return correct dashboard structure', async () => {
      // Mock counts: totalPosts, pending, totalUsers, newPosts30d, newUsers30d
      // Plus 3 region counts (North, Central, South)
      mockPrisma.post.count
        .mockResolvedValueOnce(25)   // totalPosts
        .mockResolvedValueOnce(5)    // pendingPosts (status: Pending)
        .mockResolvedValueOnce(10)   // newPostsLast30d (createdAt gte)
        .mockResolvedValueOnce(8)    // North region count
        .mockResolvedValueOnce(12)   // Central region count
        .mockResolvedValueOnce(5);   // South region count

      mockPrisma.user.count
        .mockResolvedValueOnce(15)   // totalUsers
        .mockResolvedValueOnce(3);   // newUsersLast30d

      const result = await service.getDashboard();

      expect(result.totalPosts).toBe(25);
      expect(result.pendingPosts).toBe(5);
      expect(result.totalUsers).toBe(15);
      expect(result.newPostsLast30d).toBe(10);
      expect(result.newUsersLast30d).toBe(3);

      // postsByRegion
      expect(result.postsByRegion).toHaveLength(3);
      expect(result.postsByRegion).toEqual([
        { region: 'North', count: 8 },
        { region: 'Central', count: 12 },
        { region: 'South', count: 5 },
      ]);
    });

    it('should query posts by Pending status', async () => {
      mockPrisma.post.count.mockResolvedValue(0);
      mockPrisma.user.count.mockResolvedValue(0);

      await service.getDashboard();

      // The second post.count call should filter by Pending status
      const calls = mockPrisma.post.count.mock.calls;
      expect(calls[1][0]).toEqual({ where: { status: 'Pending' } });
    });

    it('should query region counts with correct location filter', async () => {
      mockPrisma.post.count.mockResolvedValue(0);
      mockPrisma.user.count.mockResolvedValue(0);

      await service.getDashboard();

      const calls = mockPrisma.post.count.mock.calls;
      // Calls index 3, 4, 5 are the three region count queries
      expect(calls[3][0]).toEqual({ where: { location: { region: 'North' } } });
      expect(calls[4][0]).toEqual({ where: { location: { region: 'Central' } } });
      expect(calls[5][0]).toEqual({ where: { location: { region: 'South' } } });
    });

    it('should handle zero counts gracefully', async () => {
      mockPrisma.post.count.mockResolvedValue(0);
      mockPrisma.user.count.mockResolvedValue(0);

      const result = await service.getDashboard();

      expect(result.totalPosts).toBe(0);
      expect(result.pendingPosts).toBe(0);
      expect(result.totalUsers).toBe(0);
      expect(result.newPostsLast30d).toBe(0);
      expect(result.newUsersLast30d).toBe(0);
      expect(result.postsByRegion).toEqual([
        { region: 'North', count: 0 },
        { region: 'Central', count: 0 },
        { region: 'South', count: 0 },
      ]);
    });
  });
});
