import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Role, PostStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function createTestUser(
  prisma: PrismaService,
  jwtService: JwtService,
  suffix: string | number,
  role: Role = Role.RegisteredUser,
) {
  const uniqueId = Math.random().toString(36).substring(7);
  const userName = `user_${suffix}_${uniqueId}`;
  const email = `user_${suffix}_${uniqueId}@example.com`;
  const password = await bcrypt.hash('Password123', 10);

  const user = await prisma.user.create({
    data: { userName, email, password, role },
  });

  const payload = { sub: user.userId, email: user.email, role: user.role, userName: user.userName };
  const token = await jwtService.signAsync(payload);

  return { user, token };
}

export async function createTestLocation(prisma: PrismaService, suffix: string | number) {
  return prisma.location.create({
    data: {
      locationName: `Location ${suffix}`,
      description: `Description ${suffix}`,
      coordinates: '10.0,20.0',
    },
  });
}

export async function createTestPost(
  prisma: PrismaService,
  authorId: string,
  locationId: string,
  suffix: string | number,
  status: PostStatus = PostStatus.Publish,
) {
  return prisma.post.create({
    data: {
      authorId,
      locationId,
      title: `Post Title ${suffix}`,
      content: `Post Content ${suffix}`,
      status,
    },
  });
}

export async function createTestComment(
  prisma: PrismaService,
  userId: string,
  postId: string,
  suffix: string | number,
) {
  return prisma.comment.create({
    data: {
      userId,
      postId,
      content: `Comment ${suffix}`,
    },
  });
}

export async function createTestNotification(
  prisma: PrismaService,
  userId: string,
  suffix: string | number,
  read: boolean = false,
) {
  return prisma.notification.create({
    data: {
      userId,
      type: 'PostApproved',
      message: `Notification ${suffix}`,
      read,
    },
  });
}
