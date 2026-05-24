import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        userName: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    return user;
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    if (dto.userName) {
      const existing = await this.prisma.user.findFirst({
        where: { userName: dto.userName, NOT: { userId } },
      });
      if (existing) throw new ConflictException('Tên đăng nhập đã được sử dụng');
    }

    return this.prisma.user.update({
      where: { userId },
      data: dto,
      select: {
        userId: true,
        userName: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });
  }
}
