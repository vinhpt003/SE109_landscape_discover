import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      // Chỉ select những thông tin cần thiết, KHÔNG lấy password
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng!');
    }
    return user;
  }
}
