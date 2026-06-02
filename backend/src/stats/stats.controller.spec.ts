import { Test, TestingModule } from '@nestjs/testing';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

describe('StatsController', () => {
  let controller: StatsController;
  let service: any;

  const mockStatsService = {
    getDashboard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [{ provide: StatsService, useValue: mockStatsService }],
    }).compile();

    controller = module.get<StatsController>(StatsController);
    service = module.get<StatsService>(StatsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should return dashboard data from service', async () => {
      const mockDashboard = {
        totalPosts: 10,
        pendingPosts: 3,
        totalUsers: 5,
        newPostsLast30d: 4,
        newUsersLast30d: 2,
        postsByRegion: [
          { region: 'North', count: 3 },
          { region: 'Central', count: 4 },
          { region: 'South', count: 3 },
        ],
      };
      service.getDashboard.mockResolvedValue(mockDashboard);

      const result = await controller.getDashboard();
      expect(service.getDashboard).toHaveBeenCalled();
      expect(result).toEqual(mockDashboard);
    });

    it('should propagate errors from service', async () => {
      service.getDashboard.mockRejectedValue(new Error('DB Error'));
      await expect(controller.getDashboard()).rejects.toThrow('DB Error');
    });
  });
});
