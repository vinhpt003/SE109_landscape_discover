import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto, UpdatePostStatusDto } from './dto/update-post.dto';
import { PostStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async findAll(query: {
    search?: string;
    locationId?: string;
    status?: PostStatus | 'all';
    page?: number;
    limit?: number;
    isAdmin?: boolean;
  }) {
    const { search, locationId, status, page = 1, limit = 12, isAdmin = false } = query;
    const skip = (page - 1) * limit;

    let statusFilter: { status?: PostStatus } = { status: PostStatus.Publish };
    if (isAdmin) {
      if (!status || status === 'all') statusFilter = {};
      else statusFilter = { status };
    }

    const where = {
      ...statusFilter,
      ...(locationId ? { locationId } : {}),
      ...(search
        ? { OR: [{ title: { contains: search, mode: 'insensitive' as const } }, { content: { contains: search, mode: 'insensitive' as const } }] }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          author: { select: { userId: true, userName: true, avatar: true } },
          location: { select: { locationId: true, locationName: true } },
          _count: { select: { comments: true, ratings: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findMine(authorId: string, query: { status?: PostStatus; page?: number; limit?: number }) {
    const { status, page = 1, limit = 12 } = query;
    const skip = (page - 1) * limit;

    const where = {
      authorId,
      ...(status ? { status } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          author: { select: { userId: true, userName: true, avatar: true } },
          location: { select: { locationId: true, locationName: true } },
          _count: { select: { comments: true, ratings: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { postId },
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

    if (!post) throw new NotFoundException('Bài viết không tồn tại');

    const avgRating =
      post.ratings.length > 0
        ? post.ratings.reduce((sum, r) => sum + r.score, 0) / post.ratings.length
        : null;

    return { ...post, avgRating, ratingCount: post.ratings.length };
  }

  async create(dto: CreatePostDto, authorId: string, authorRole: string) {
    const post = await this.prisma.post.create({
      data: { ...dto, authorId },
      include: {
        author: { select: { userId: true, userName: true, avatar: true } },
        location: { select: { locationId: true, locationName: true } },
      },
    });

    if (post.status === PostStatus.Pending && authorRole === 'Editor') {
      const admins = await this.prisma.user.findMany({
        where: { role: 'Admin' },
        select: { userId: true },
      });
      await this.notifications.createMany(
        admins.map(a => ({
          userId: a.userId,
          type: 'PostPending' as const,
          message: `${post.author.userName} vừa gửi bài "${post.title}" chờ duyệt`,
          postId: post.postId,
          actorId: authorId,
        })),
      );
    }

    return post;
  }

  async update(postId: string, dto: UpdatePostDto, userId: string, role: string) {
    const post = await this.prisma.post.findUnique({ where: { postId } });
    if (!post) throw new NotFoundException('Bài viết không tồn tại');
    if (post.authorId !== userId && role !== 'Admin') {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa bài viết này');
    }
    return this.prisma.post.update({ where: { postId }, data: dto });
  }

  async updateStatus(postId: string, dto: UpdatePostStatusDto, actorId: string) {
    const post = await this.prisma.post.findUnique({
      where: { postId },
      include: { author: { select: { userId: true, userName: true } } },
    });
    if (!post) throw new NotFoundException('Bài viết không tồn tại');

    const updated = await this.prisma.post.update({
      where: { postId },
      data: { status: dto.status },
    });

    if (dto.status === PostStatus.Publish || dto.status === PostStatus.Rejected) {
      const type = dto.status === PostStatus.Publish ? 'PostApproved' : 'PostRejected';
      const message =
        dto.status === PostStatus.Publish
          ? `Bài viết "${post.title}" của bạn đã được duyệt`
          : `Bài viết "${post.title}" của bạn đã bị từ chối`;
      await this.notifications.create({
        userId: post.authorId,
        type,
        message,
        postId: post.postId,
        actorId,
      });

      await this.prisma.notification.updateMany({
        where: { postId, type: 'PostPending', read: false },
        data: { read: true },
      });
    }

    return updated;
  }

  async remove(postId: string, userId: string, role: string) {
    const post = await this.prisma.post.findUnique({ where: { postId } });
    if (!post) throw new NotFoundException('Bài viết không tồn tại');
    if (post.authorId !== userId && role !== 'Admin') {
      throw new ForbiddenException('Bạn không có quyền xóa bài viết này');
    }
    return this.prisma.post.delete({ where: { postId } });
  }
}
