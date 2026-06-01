import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostStatus, Region } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const since30d = new Date();
    since30d.setDate(since30d.getDate() - 30);

    const regions: Region[] = ['North', 'Central', 'South'];

    const [
      totalPosts,
      pendingPosts,
      totalUsers,
      newPostsLast30d,
      newUsersLast30d,
      regionCounts,
    ] = await Promise.all([
      this.prisma.post.count(),
      this.prisma.post.count({ where: { status: PostStatus.Pending } }),
      this.prisma.user.count(),
      this.prisma.post.count({ where: { createdAt: { gte: since30d } } }),
      this.prisma.user.count({ where: { createdAt: { gte: since30d } } }),
      Promise.all(
        regions.map((region) =>
          this.prisma.post.count({ where: { location: { region } } }),
        ),
      ),
    ]);

    const postsByRegion = regions.map((region, i) => ({
      region,
      count: regionCounts[i],
    }));

    return {
      totalPosts,
      pendingPosts,
      totalUsers,
      newPostsLast30d,
      newUsersLast30d,
      postsByRegion,
    };
  }
}
