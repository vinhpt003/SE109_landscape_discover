import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: any;

  const mockCommentsService = {
    findByPost: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [{ provide: CommentsService, useValue: mockCommentsService }],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findByPost if user is not Admin and postId is provided', async () => {
      const mockComments = [{ commentId: '1', content: 'comment' }];
      service.findByPost.mockResolvedValue(mockComments);

      const result = await controller.findAll('post1', undefined, undefined, undefined, { userId: '1', role: 'RegisteredUser' });
      expect(service.findByPost).toHaveBeenCalledWith('post1');
      expect(result).toEqual(mockComments);
    });

    it('should call service.findAll if user is Admin', async () => {
      const mockComments = [{ commentId: '1', content: 'comment' }];
      service.findAll.mockResolvedValue(mockComments);

      const result = await controller.findAll('post1', 'user1', '1', '10', { userId: '1', role: 'Admin' });
      expect(service.findAll).toHaveBeenCalledWith({
        postId: 'post1',
        userId: 'user1',
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(mockComments);
    });
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = { postId: 'post1', content: 'comment' };
      const user = { userId: 'user1' };
      const createdComment = { commentId: '1', ...dto, userId: 'user1' };
      service.create.mockResolvedValue(createdComment);

      const result = await controller.create(dto, user);
      expect(service.create).toHaveBeenCalledWith(dto, 'user1');
      expect(result).toEqual(createdComment);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      const user = { userId: 'user1', role: 'RegisteredUser' };
      service.remove.mockResolvedValue({ commentId: '1' });

      const result = await controller.remove('1', user);
      expect(service.remove).toHaveBeenCalledWith('1', 'user1', 'RegisteredUser');
      expect(result).toEqual({ commentId: '1' });
    });
  });
});
