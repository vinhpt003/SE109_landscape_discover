import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedPostsService {
  constructor(private prisma: PrismaService) {}

  async toggle(postId: string, userId: string) {
    const existing = await this.prisma.savedPost.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await this.prisma.savedPost.delete({ where: { userId_postId: { userId, postId } } });
      return { saved: false };
    }

    await this.prisma.savedPost.create({ data: { userId, postId } });
    return { saved: true };
  }

  findMyPosts(userId: string) {
    return this.prisma.savedPost.findMany({
      where: { userId },
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
  }
}
