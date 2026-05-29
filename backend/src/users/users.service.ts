import { Injectable, ConflictException, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) { }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          userId: true,
          userName: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { data: users, total, page, limit };
  }

  async updateRole(targetUserId: string, dto: UpdateUserRoleDto) {
    const user = await this.prisma.user.findUnique({ where: { userId: targetUserId } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    return this.prisma.user.update({
      where: { userId: targetUserId },
      data: { role: dto.role },
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

    const current = await this.prisma.user.findUnique({ where: { userId } });
    if (!current) throw new NotFoundException('Người dùng không tồn tại');

    const { currentPassword, newPassword, ...profileData } = dto;

    if (newPassword) {
      if (!currentPassword) {
        throw new BadRequestException('Vui lòng nhập mật khẩu hiện tại');
      }
      const valid = await bcrypt.compare(currentPassword, current.password);
      if (!valid) throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
      profileData['password'] = await bcrypt.hash(newPassword, 10);
    }

    const updated = await this.prisma.user.update({
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

    if (
      current.avatarPublicId &&
      dto.avatarPublicId !== undefined &&
      dto.avatarPublicId !== current.avatarPublicId
    ) {
      this.cloudinary.deleteByPublicId(current.avatarPublicId).catch(() => { });
    }

    return updated;
  }
}
