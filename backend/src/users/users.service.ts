import { Injectable, ConflictException, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

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

    const { currentPassword, newPassword, ...profileData } = dto;

    if (newPassword) {
      if (!currentPassword) {
        throw new BadRequestException('Vui lòng nhập mật khẩu hiện tại');
      }
      const user = await this.prisma.user.findUnique({ where: { userId } });
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
      profileData['password'] = await bcrypt.hash(newPassword, 10);
    }

    return this.prisma.user.update({
      where: { userId },
      data: profileData,
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
