import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostStatus } from '@prisma/client';

describe('PostsController', () => {
  let controller: PostsController;
  let service: any;

  const mockPostsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [{ provide: PostsService, useValue: mockPostsService }],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll with parameters', async () => {
      const mockPosts = [{ postId: '1', title: 'Post' }];
      service.findAll.mockResolvedValue(mockPosts);

      const result = await controller.findAll('query', 'loc1', PostStatus.Publish);
      expect(service.findAll).toHaveBeenCalledWith({
        search: 'query',
        locationId: 'loc1',
        status: PostStatus.Publish,
        page: undefined,
        limit: undefined,
        isAdmin: false,
      });
      expect(result).toEqual(mockPosts);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne', async () => {
      const mockPost = { postId: '1', title: 'Post' };
      service.findOne.mockResolvedValue(mockPost);

      const result = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockPost);
    });
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = { locationId: 'loc1', title: 'Title', content: 'Content' };
      const user = { userId: 'user1', role: 'Editor' };
      const createdPost = { postId: '1', ...dto, authorId: 'user1' };
      service.create.mockResolvedValue(createdPost);

      const result = await controller.create(dto, user);
      expect(service.create).toHaveBeenCalledWith(dto, 'user1', 'Editor');
      expect(result).toEqual(createdPost);
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const dto = { title: 'New Title' };
      const user = { userId: 'user1', role: 'RegisteredUser' };
      const updatedPost = { postId: '1', title: 'New Title' };
      service.update.mockResolvedValue(updatedPost);

      const result = await controller.update('1', dto, user);
      expect(service.update).toHaveBeenCalledWith('1', dto, 'user1', 'RegisteredUser');
      expect(result).toEqual(updatedPost);
    });
  });

  describe('updateStatus', () => {
    it('should call service.updateStatus', async () => {
      const dto = { status: PostStatus.Publish };
      const updatedPost = { postId: '1', status: PostStatus.Publish };
      service.updateStatus.mockResolvedValue(updatedPost);

      const result = await controller.updateStatus('1', dto, { userId: 'admin1' });
      expect(service.updateStatus).toHaveBeenCalledWith('1', dto, 'admin1');
      expect(result).toEqual(updatedPost);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      const user = { userId: 'user1', role: 'RegisteredUser' };
      service.remove.mockResolvedValue({ postId: '1' });

      const result = await controller.remove('1', user);
      expect(service.remove).toHaveBeenCalledWith('1', 'user1', 'RegisteredUser');
      expect(result).toEqual({ postId: '1' });
    });
  });
});
