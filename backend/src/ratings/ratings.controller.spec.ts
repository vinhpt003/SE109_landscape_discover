import { Test, TestingModule } from '@nestjs/testing';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';

describe('RatingsController', () => {
  let controller: RatingsController;
  let service: any;

  const mockRatingsService = {
    getSummary: jest.fn(),
    upsert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatingsController],
      providers: [{ provide: RatingsService, useValue: mockRatingsService }],
    }).compile();

    controller = module.get<RatingsController>(RatingsController);
    service = module.get<RatingsService>(RatingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSummary', () => {
    it('should call service.getSummary', async () => {
      const summary = { postId: 'post1', avgRating: 4.5, count: 2 };
      service.getSummary.mockResolvedValue(summary);

      const result = await controller.getSummary('post1');
      expect(service.getSummary).toHaveBeenCalledWith('post1');
      expect(result).toEqual(summary);
    });
  });

  describe('upsert', () => {
    it('should call service.upsert', async () => {
      const dto = { postId: 'post1', score: 5 };
      const user = { userId: 'user1' };
      const createdRating = { rateId: '1', ...dto, userId: 'user1' };
      service.upsert.mockResolvedValue(createdRating);

      const result = await controller.upsert(dto, user);
      expect(service.upsert).toHaveBeenCalledWith(dto, 'user1');
      expect(result).toEqual(createdRating);
    });
  });
});
