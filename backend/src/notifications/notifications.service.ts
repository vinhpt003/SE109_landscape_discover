import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  message: string;
  postId?: string;
  commentId?: string;
  actorId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  create(input: CreateNotificationInput) {
    return this.prisma.notification.create({ data: input });
  }

  createMany(inputs: CreateNotificationInput[]) {
    if (inputs.length === 0) return Promise.resolve({ count: 0 });
    return this.prisma.notification.createMany({ data: inputs });
  }

  async findMine(userId: string, query: { unreadOnly?: boolean; page?: number; limit?: number }) {
    const { unreadOnly, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(unreadOnly ? { read: false } : {}),
    };

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return { data, total, page, limit, unreadCount };
  }

  async markRead(notificationId: string, userId: string) {
    const noti = await this.prisma.notification.findUnique({ where: { notificationId } });
    if (!noti) throw new NotFoundException('Thông báo không tồn tại');
    if (noti.userId !== userId) throw new ForbiddenException('Không có quyền');
    return this.prisma.notification.update({
      where: { notificationId },
      data: { read: true },
    });
  }

  markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
