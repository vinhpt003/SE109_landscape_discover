import { Test, TestingModule } from '@nestjs/testing';
import { SavedPostsService } from './saved-posts.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SavedPostsService', () => {
  let service: SavedPostsService;
  let prisma: any;

  const mockPrisma = {
    savedPost: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavedPostsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SavedPostsService>(SavedPostsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('toggle', () => {
    const postId = 'post1';
    const userId = 'user1';

    it('should delete and return saved: false if already saved', async () => {
      prisma.savedPost.findUnique.mockResolvedValue({ userId, postId });
      prisma.savedPost.delete.mockResolvedValue({});

      const result = await service.toggle(postId, userId);

      expect(prisma.savedPost.findUnique).toHaveBeenCalledWith({
        where: { userId_postId: { userId, postId } },
      });
      expect(prisma.savedPost.delete).toHaveBeenCalledWith({
        where: { userId_postId: { userId, postId } },
      });
      expect(result).toEqual({ saved: false });
    });

    it('should create and return saved: true if not already saved', async () => {
      prisma.savedPost.findUnique.mockResolvedValue(null);
      prisma.savedPost.create.mockResolvedValue({});

      const result = await service.toggle(postId, userId);

      expect(prisma.savedPost.findUnique).toHaveBeenCalledWith({
        where: { userId_postId: { userId, postId } },
      });
      expect(prisma.savedPost.create).toHaveBeenCalledWith({
        data: { userId, postId },
      });
      expect(result).toEqual({ saved: true });
    });
  });

  describe('findMyPosts', () => {
    it('should query saved posts of user', async () => {
      const mockSaved = [{ userId: 'user1', postId: 'post1', post: {} }];
      prisma.savedPost.findMany.mockResolvedValue(mockSaved);

      const result = await service.findMyPosts('user1');

      expect(prisma.savedPost.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        include: {
          post: {
            include: {
              author: { select: { userId: true, userName: true, avatar: true } },
              location: { select: { locationId: true, locationName: true } },
              _count: { select: { comments: true, ratings: true } },
            },
          },
        },
        orderBy: { savedAt: 'desc' },
      });
      expect(result).toEqual(mockSaved);
    });
  });
});
