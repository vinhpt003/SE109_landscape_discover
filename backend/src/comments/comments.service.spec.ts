import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CommentsService', () => {
  let service: CommentsService;
  let prisma: any;

  const mockPrisma = {
    comment: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByPost', () => {
    it('should return comments for a post ordered newest first', async () => {
      const mockComments = [
        { commentId: '1', content: 'New comment', createdAt: new Date() },
      ];
      prisma.comment.findMany.mockResolvedValue(mockComments);

      const result = await service.findByPost('post1');
      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { postId: 'post1' },
        include: { user: { select: { userId: true, userName: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockComments);
    });
  });

  describe('create', () => {
    it('should create and return comment', async () => {
      const dto = { postId: 'post1', content: 'hello' };
      const mockComment = { commentId: '1', ...dto, userId: 'user1' };
      prisma.comment.create.mockResolvedValue(mockComment);

      const result = await service.create(dto, 'user1');
      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: { postId: 'post1', content: 'hello', userId: 'user1' },
        include: { user: { select: { userId: true, userName: true, avatar: true } } },
      });
      expect(result).toEqual(mockComment);
    });
  });

  describe('remove', () => {
    it('should allow comment owner to delete comment', async () => {
      prisma.comment.findUnique.mockResolvedValue({ commentId: '1', userId: 'user1' });
      prisma.comment.delete.mockResolvedValue({ commentId: '1' });

      const result = await service.remove('1', 'user1', 'RegisteredUser');
      expect(prisma.comment.delete).toHaveBeenCalledWith({ where: { commentId: '1' } });
      expect(result).toEqual({ commentId: '1' });
    });

    it('should allow admin to delete comment', async () => {
      prisma.comment.findUnique.mockResolvedValue({ commentId: '1', userId: 'user1' });
      prisma.comment.delete.mockResolvedValue({ commentId: '1' });

      await service.remove('1', 'admin1', 'Admin');
      expect(prisma.comment.delete).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user not owner and not Admin', async () => {
      prisma.comment.findUnique.mockResolvedValue({ commentId: '1', userId: 'user1' });
      await expect(service.remove('1', 'user2', 'RegisteredUser')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if comment not found', async () => {
      prisma.comment.findUnique.mockResolvedValue(null);
      await expect(service.remove('1', 'user1', 'RegisteredUser')).rejects.toThrow(NotFoundException);
    });
  });
});
