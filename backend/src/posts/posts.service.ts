import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto, UpdatePostStatusDto } from './dto/update-post.dto';
import { PostStatus } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { search?: string; locationId?: string; status?: PostStatus }) {
    const { search, locationId, status } = query;

    return this.prisma.post.findMany({
      where: {
        ...(status ? { status } : { status: PostStatus.Publish }),
        ...(locationId ? { locationId } : {}),
        ...(search
          ? { OR: [{ title: { contains: search, mode: 'insensitive' } }, { content: { contains: search, mode: 'insensitive' } }] }
          : {}),
      },
      include: {
        author: { select: { userId: true, userName: true, avatar: true } },
        location: { select: { locationId: true, locationName: true } },
        _count: { select: { comments: true, ratings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
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

  create(dto: CreatePostDto, authorId: string) {
    return this.prisma.post.create({
      data: { ...dto, authorId },
      include: {
        author: { select: { userId: true, userName: true, avatar: true } },
        location: { select: { locationId: true, locationName: true } },
      },
    });
  }

  async update(postId: string, dto: UpdatePostDto, userId: string, role: string) {
    const post = await this.prisma.post.findUnique({ where: { postId } });
    if (!post) throw new NotFoundException('Bài viết không tồn tại');
    if (post.authorId !== userId && role !== 'Admin') {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa bài viết này');
    }
    return this.prisma.post.update({ where: { postId }, data: dto });
  }

  async updateStatus(postId: string, dto: UpdatePostStatusDto) {
    const post = await this.prisma.post.findUnique({ where: { postId } });
    if (!post) throw new NotFoundException('Bài viết không tồn tại');
    return this.prisma.post.update({ where: { postId }, data: { status: dto.status } });
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
