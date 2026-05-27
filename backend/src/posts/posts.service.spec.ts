import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostStatus } from '@prisma/client';

describe('PostsService', () => {
  let service: PostsService;
  let prisma: any;

  const mockPrisma = {
    post: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should find posts based on default status Publish', async () => {
      const mockPosts = [
        { postId: '1', title: 'Post 1', status: PostStatus.Publish },
      ];
      prisma.post.findMany.mockResolvedValue(mockPosts);

      const result = await service.findAll({});
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: {
          status: PostStatus.Publish,
        },
        include: {
          author: { select: { userId: true, userName: true, avatar: true } },
          location: { select: { locationId: true, locationName: true } },
          _count: { select: { comments: true, ratings: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockPosts);
    });

    it('should filter posts by search and locationId', async () => {
      prisma.post.findMany.mockResolvedValue([]);
      await service.findAll({ search: 'query', locationId: 'loc1', status: PostStatus.Pending });

      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: {
          status: PostStatus.Pending,
          locationId: 'loc1',
          OR: [
            { title: { contains: 'query', mode: 'insensitive' } },
            { content: { contains: 'query', mode: 'insensitive' } },
          ],
        },
        include: {
          author: { select: { userId: true, userName: true, avatar: true } },
          location: { select: { locationId: true, locationName: true } },
          _count: { select: { comments: true, ratings: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return post with computed average rating and rating count', async () => {
      const mockPost = {
        postId: '1',
        title: 'Post 1',
        ratings: [
          { score: 4 },
          { score: 5 },
        ],
      };
      prisma.post.findUnique.mockResolvedValue(mockPost);

      const result = await service.findOne('1');
      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { postId: '1' },
        include: {
          author: { select: { userId: true, userName: true, avatar: true } },
          location: true,
          comments: {
            include: { user: { select: { userId: true, userName: true, avatar: true } } },
            orderBy: { createdAt: 'desc' },
          },
          ratings: true,
        },
      });
      expect(result).toEqual({
        ...mockPost,
        avgRating: 4.5,
        ratingCount: 2,
      });
    });

    it('should return null avgRating if there are no ratings', async () => {
      const mockPost = {
        postId: '1',
        ratings: [],
      };
      prisma.post.findUnique.mockResolvedValue(mockPost);
      const result = await service.findOne('1');
      expect(result.avgRating).toBeNull();
      expect(result.ratingCount).toBe(0);
    });

    it('should throw NotFoundException if post does not exist', async () => {
      prisma.post.findUnique.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create post and return it', async () => {
      const dto = { locationId: 'loc1', title: 'Post Title', content: 'Post content', imageUrl: 'url' };
      const createdPost = { postId: '1', ...dto, authorId: 'user1' };
      prisma.post.create.mockResolvedValue(createdPost);

      const result = await service.create(dto, 'user1');
      expect(prisma.post.create).toHaveBeenCalledWith({
        data: { ...dto, authorId: 'user1' },
        include: {
          author: { select: { userId: true, userName: true, avatar: true } },
          location: { select: { locationId: true, locationName: true } },
        },
      });
      expect(result).toEqual(createdPost);
    });
  });

  describe('update', () => {
    const dto = { title: 'Updated Title' };

    it('should allow author to update post', async () => {
      prisma.post.findUnique.mockResolvedValue({ postId: '1', authorId: 'user1' });
      prisma.post.update.mockResolvedValue({ postId: '1', title: 'Updated Title' });

      const result = await service.update('1', dto, 'user1', 'RegisteredUser');
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { postId: '1' },
        data: dto,
      });
      expect(result.title).toBe('Updated Title');
    });

    it('should allow admin to update post', async () => {
      prisma.post.findUnique.mockResolvedValue({ postId: '1', authorId: 'user1' });
      prisma.post.update.mockResolvedValue({ postId: '1', title: 'Updated Title' });

      await service.update('1', dto, 'admin1', 'Admin');
      expect(prisma.post.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not author and is not Admin', async () => {
      prisma.post.findUnique.mockResolvedValue({ postId: '1', authorId: 'user1' });
      await expect(service.update('1', dto, 'user2', 'RegisteredUser')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if post not found', async () => {
      prisma.post.findUnique.mockResolvedValue(null);
      await expect(service.update('1', dto, 'user1', 'RegisteredUser')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update status and return post', async () => {
      prisma.post.findUnique.mockResolvedValue({ postId: '1' });
      prisma.post.update.mockResolvedValue({ postId: '1', status: PostStatus.Publish });

      const result = await service.updateStatus('1', { status: PostStatus.Publish });
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { postId: '1' },
        data: { status: PostStatus.Publish },
      });
      expect(result.status).toBe(PostStatus.Publish);
    });

    it('should throw NotFoundException if post not found', async () => {
      prisma.post.findUnique.mockResolvedValue(null);
      await expect(service.updateStatus('1', { status: PostStatus.Publish })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should allow author to delete post', async () => {
      prisma.post.findUnique.mockResolvedValue({ postId: '1', authorId: 'user1' });
      prisma.post.delete.mockResolvedValue({ postId: '1' });

      const result = await service.remove('1', 'user1', 'RegisteredUser');
      expect(prisma.post.delete).toHaveBeenCalledWith({ where: { postId: '1' } });
      expect(result).toEqual({ postId: '1' });
    });

    it('should throw ForbiddenException if user not author and not Admin', async () => {
      prisma.post.findUnique.mockResolvedValue({ postId: '1', authorId: 'user1' });
      await expect(service.remove('1', 'user2', 'RegisteredUser')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if post not found', async () => {
      prisma.post.findUnique.mockResolvedValue(null);
      await expect(service.remove('1', 'user1', 'RegisteredUser')).rejects.toThrow(NotFoundException);
    });
  });
});
