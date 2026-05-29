import { Test, TestingModule } from '@nestjs/testing';
import { SavedPostsController } from './saved-posts.controller';
import { SavedPostsService } from './saved-posts.service';

describe('SavedPostsController', () => {
  let controller: SavedPostsController;
  let service: any;

  const mockSavedPostsService = {
    findMyPosts: jest.fn(),
    toggle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedPostsController],
      providers: [{ provide: SavedPostsService, useValue: mockSavedPostsService }],
    }).compile();

    controller = module.get<SavedPostsController>(SavedPostsController);
    service = module.get<SavedPostsService>(SavedPostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findMyPosts', () => {
    it('should call service.findMyPosts', async () => {
      const mockSaved = [{ userId: 'user1', postId: 'post1' }];
      service.findMyPosts.mockResolvedValue(mockSaved);

      const result = await controller.findMyPosts({ userId: 'user1' });
      expect(service.findMyPosts).toHaveBeenCalledWith('user1');
      expect(result).toEqual(mockSaved);
    });
  });

  describe('toggle', () => {
    it('should call service.toggle', async () => {
      const dto = { postId: 'post1' };
      const user = { userId: 'user1' };
      service.toggle.mockResolvedValue({ saved: true });

      const result = await controller.toggle(dto, user);
      expect(service.toggle).toHaveBeenCalledWith('post1', 'user1');
      expect(result).toEqual({ saved: true });
    });
  });
});
