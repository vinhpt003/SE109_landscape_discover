import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
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
      count: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    notification: {
      updateMany: jest.fn(),
    },
  };

  const mockNotifications = {
    create: jest.fn().mockResolvedValue(true),
    createMany: jest.fn().mockResolvedValue(true),
  };

  const mockCloudinary = {
    deleteByPublicId: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifications },
        { provide: CloudinaryService, useValue: mockCloudinary },
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
      prisma.post.count.mockResolvedValue(1);

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
        skip: 0,
        take: 12,
      });
      expect(result).toEqual({ data: mockPosts, total: 1, page: 1, limit: 12 });
    });

    it('should filter posts by search and locationId', async () => {
      prisma.post.findMany.mockResolvedValue([]);
      prisma.post.count.mockResolvedValue(0);
      const result = await service.findAll({ search: 'query', locationId: 'loc1', status: PostStatus.Pending, isAdmin: true });

      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: {
          status: PostStatus.Pending,
          locationId: 'loc1',
          OR: [
            { title: { contains: 'query', mode: 'insensitive' } },
            { content: { contains: 'query', mode: 'insensitive' } },
            { location: { locationName: { contains: 'query', mode: 'insensitive' } } },
          ],
        },
        include: {
          author: { select: { userId: true, userName: true, avatar: true } },
          location: { select: { locationId: true, locationName: true } },
          _count: { select: { comments: true, ratings: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 12,
      });
      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 12 });
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

      const result = await service.create(dto, 'user1', 'RegisteredUser');
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
      prisma.post.findUnique.mockResolvedValue({ postId: '1', authorId: 'user1', author: { userId: 'user1', userName: 'author' } });
      prisma.post.update.mockResolvedValue({ postId: '1', status: PostStatus.Publish });

      const result = await service.updateStatus('1', { status: PostStatus.Publish }, 'admin1');
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { postId: '1' },
        data: { status: PostStatus.Publish },
      });
      expect(result.status).toBe(PostStatus.Publish);
    });

    it('should throw NotFoundException if post not found', async () => {
      prisma.post.findUnique.mockResolvedValue(null);
      await expect(service.updateStatus('1', { status: PostStatus.Publish }, 'admin1')).rejects.toThrow(NotFoundException);
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

  // ─── Business Rule Tests ─────────────────────────────────────────────────────

  describe('[BR-05] Post status enum: Draft, Pending, Publish, Rejected', () => {
    it('[BR-05] PostStatus enum contains all four required workflow values', () => {
      expect(PostStatus.Draft).toBe('Draft');
      expect(PostStatus.Pending).toBe('Pending');
      expect(PostStatus.Publish).toBe('Publish');
      expect(PostStatus.Rejected).toBe('Rejected');
    });
  });

  describe('[BR-06] Post approval workflow: status transitions send notifications to author', () => {
    it('[BR-06] updateStatus() to Publish fires a PostApproved notification to the post author', async () => {
      prisma.post.findUnique.mockResolvedValue({
        postId: 'p1', title: 'Hội An', authorId: 'author1', status: PostStatus.Pending,
        author: { userId: 'author1', userName: 'Nguyễn A' },
      });
      prisma.post.update.mockResolvedValue({ postId: 'p1', status: PostStatus.Publish });
      prisma.notification.updateMany.mockResolvedValue({ count: 0 });

      await service.updateStatus('p1', { status: PostStatus.Publish }, 'admin1');

      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'author1', type: 'PostApproved', postId: 'p1' }),
      );
    });

    it('[BR-06] updateStatus() to Rejected fires a PostRejected notification to the post author', async () => {
      prisma.post.findUnique.mockResolvedValue({
        postId: 'p2', title: 'Đà Lạt', authorId: 'author2', status: PostStatus.Pending,
        author: { userId: 'author2', userName: 'Trần B' },
      });
      prisma.post.update.mockResolvedValue({ postId: 'p2', status: PostStatus.Rejected });
      prisma.notification.updateMany.mockResolvedValue({ count: 0 });

      await service.updateStatus('p2', { status: PostStatus.Rejected }, 'admin1');

      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'author2', type: 'PostRejected', postId: 'p2' }),
      );
    });

    it('[BR-06] create() as Editor with Pending status notifies all Admin users via createMany', async () => {
      const createdPost = {
        postId: 'p3', title: 'Sa Pa', status: PostStatus.Pending, authorId: 'editor1',
        author: { userId: 'editor1', userName: 'Lê C' },
        location: { locationId: 'loc1', locationName: 'Lào Cai' },
      };
      prisma.post.create.mockResolvedValue(createdPost);
      prisma.user.findMany.mockResolvedValue([{ userId: 'admin1' }, { userId: 'admin2' }]);

      await service.create(
        { locationId: 'loc1', title: 'Sa Pa', content: 'Content', status: PostStatus.Pending },
        'editor1',
        'Editor',
      );

      expect(mockNotifications.createMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ userId: 'admin1', type: 'PostPending' }),
          expect.objectContaining({ userId: 'admin2', type: 'PostPending' }),
        ]),
      );
    });
  });

  describe('[BR-07] Post creation requires title, content, and locationId', () => {
    it('[BR-07] create() persists title, content, locationId, and authorId to the database', async () => {
      const dto = { locationId: 'loc1', title: 'Phong Nha', content: 'Hang động đẹp nhất VN.', status: PostStatus.Pending };
      const createdPost = {
        ...dto, postId: 'p1', authorId: 'editor1',
        author: { userId: 'editor1', userName: 'Lê C' },
        location: { locationId: 'loc1', locationName: 'Quảng Bình' },
      };
      prisma.post.create.mockResolvedValue(createdPost);
      prisma.user.findMany.mockResolvedValue([{ userId: 'admin1' }]);

      const result = await service.create(dto, 'editor1', 'Editor');

      expect(prisma.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Phong Nha',
            content: 'Hang động đẹp nhất VN.',
            locationId: 'loc1',
            authorId: 'editor1',
          }),
        }),
      );
      expect(result.title).toBe('Phong Nha');
    });
  });

  describe('[BR-14] Case-insensitive keyword search across title and content', () => {
    it('[BR-14] findAll() applies mode:insensitive to both title and content OR clauses', async () => {
      prisma.post.findMany.mockResolvedValue([]);
      prisma.post.count.mockResolvedValue(0);

      await service.findAll({ search: 'Hội An' });

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'Hội An', mode: 'insensitive' } },
              { content: { contains: 'Hội An', mode: 'insensitive' } },
              { location: { locationName: { contains: 'Hội An', mode: 'insensitive' } } },
            ],
          }),
        }),
      );
    });

    it('[BR-14] findAll() with no search term omits the OR filter entirely', async () => {
      prisma.post.findMany.mockResolvedValue([]);
      prisma.post.count.mockResolvedValue(0);

      await service.findAll({});

      const callArg = prisma.post.findMany.mock.calls[0][0];
      expect(callArg.where).not.toHaveProperty('OR');
    });
  });

  describe('[BR-15] Location-based post filtering by locationId', () => {
    it('[BR-15] findAll() includes locationId in the where clause when provided', async () => {
      prisma.post.findMany.mockResolvedValue([]);
      prisma.post.count.mockResolvedValue(0);

      await service.findAll({ locationId: 'loc-hue' });

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ locationId: 'loc-hue' }),
        }),
      );
    });

    it('[BR-15] findAll() omits locationId from the where clause when not provided', async () => {
      prisma.post.findMany.mockResolvedValue([]);
      prisma.post.count.mockResolvedValue(0);

      await service.findAll({});

      const callArg = prisma.post.findMany.mock.calls[0][0];
      expect(callArg.where).not.toHaveProperty('locationId');
    });
  });

  describe('[BR-18] Admin-only post status update writes to the database', () => {
    it('[BR-18] updateStatus() calls prisma.post.update with the new status value', async () => {
      prisma.post.findUnique.mockResolvedValue({
        postId: 'p1', title: 'T', authorId: 'u1',
        author: { userId: 'u1', userName: 'U' },
      });
      prisma.post.update.mockResolvedValue({ postId: 'p1', status: PostStatus.Publish });
      prisma.notification.updateMany.mockResolvedValue({ count: 0 });

      await service.updateStatus('p1', { status: PostStatus.Publish }, 'admin1');

      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { postId: 'p1' },
        data: { status: PostStatus.Publish },
      });
    });
  });

  describe('[BR-19] Admin can delete any post; image cleanup runs when imagePublicId is set', () => {
    it('[BR-19] Admin can delete a post authored by another user without ForbiddenException', async () => {
      prisma.post.findUnique.mockResolvedValue({ postId: 'p1', authorId: 'user1', imagePublicId: null });
      prisma.post.delete.mockResolvedValue({ postId: 'p1' });

      const result = await service.remove('p1', 'admin1', 'Admin');

      expect(prisma.post.delete).toHaveBeenCalledWith({ where: { postId: 'p1' } });
      expect(result.postId).toBe('p1');
    });

    it('[BR-19] remove() triggers Cloudinary cleanup when imagePublicId is present', async () => {
      prisma.post.findUnique.mockResolvedValue({
        postId: 'p1', authorId: 'user1', imagePublicId: 'cloud/img123',
      });
      prisma.post.delete.mockResolvedValue({ postId: 'p1' });

      await service.remove('p1', 'admin1', 'Admin');

      expect(mockCloudinary.deleteByPublicId).toHaveBeenCalledWith('cloud/img123');
    });
  });
});
