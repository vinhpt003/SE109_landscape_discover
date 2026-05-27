import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: any;

  const mockCommentsService = {
    findByPost: jest.fn(),
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

  describe('findByPost', () => {
    it('should call service.findByPost', async () => {
      const mockComments = [{ commentId: '1', content: 'comment' }];
      service.findByPost.mockResolvedValue(mockComments);

      const result = await controller.findByPost('post1');
      expect(service.findByPost).toHaveBeenCalledWith('post1');
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
