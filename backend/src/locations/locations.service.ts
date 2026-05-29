import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';

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
}
