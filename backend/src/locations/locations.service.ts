import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.location.findMany({ orderBy: { locationName: 'asc' } });
  }

  async findOne(locationId: string) {
    const location = await this.prisma.location.findUnique({ where: { locationId } });
    if (!location) throw new NotFoundException('Địa điểm không tồn tại');
    return location;
  }

  create(dto: CreateLocationDto) {
    return this.prisma.location.create({ data: dto });
  }

  async update(locationId: string, dto: UpdateLocationDto) {
    await this.findOne(locationId);
    return this.prisma.location.update({ where: { locationId }, data: dto });
  }

  async remove(locationId: string) {
    await this.findOne(locationId);
    const postCount = await this.prisma.post.count({ where: { locationId } });
    if (postCount > 0) {
      throw new ConflictException(
        `Không thể xóa địa điểm vì đang có ${postCount} bài viết sử dụng`,
      );
    }
    return this.prisma.location.delete({ where: { locationId } });
  }
}
