import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLandmarkDto } from './dto/create-landmark.dto';
import { UpdateLandmarkDto } from './dto/update-landmark.dto';
import { Region } from '@prisma/client';

@Injectable()
export class LandmarksService {
  constructor(private prisma: PrismaService) {}

  // Dành cho Admin thêm bài viết
  async create(createLandmarkDto: CreateLandmarkDto) {
    return this.prisma.landmark.create({
      data: createLandmarkDto,
    });
  }

  // Lấy danh sách (Public) kèm các tính năng Tìm kiếm & Lọc (FE-1, FE-3)
  async findAll(search?: string, region?: Region, province?: string) {
    return this.prisma.landmark.findMany({
      where: {
        status: 'PUBLISHED', // Ở Release 1, user chỉ thấy các bài đã PUBLISHED
        title: search ? { contains: search } : undefined, // Tìm kiếm theo tiêu đề
        region: region ? region : undefined, // Lọc theo Miền
        province: province ? province : undefined, // Lọc theo Tỉnh
      },
      orderBy: { createdAt: 'desc' }, // Bài mới nhất lên đầu
    });
  }

  async findOne(id: number) {
    return this.prisma.landmark.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateLandmarkDto: UpdateLandmarkDto) {
    try {
      return await this.prisma.landmark.update({
        where: { id },
        data: updateLandmarkDto,
      });
    } catch (error) {
      // Prisma sẽ văng lỗi nếu không tìm thấy id trong Database
      throw new NotFoundException(`Không tìm thấy địa điểm với ID là ${id} để cập nhật!`);
    }
  }

  async remove(id: number) {
    try {
      // Theo yêu cầu Release 1, ta tạm thời dùng xóa cứng (Hard Delete).
      // Sang Release 2, nếu muốn Archive, ta sẽ đổi hàm này thành: update({ where: { id }, data: { status: 'ARCHIVED' } })
      await this.prisma.landmark.delete({
        where: { id },
      });
      return { message: `Đã xóa thành công địa điểm có ID ${id}` };
    } catch (error) {
      throw new NotFoundException(`Không tìm thấy địa điểm với ID là ${id} để xóa!`);
    }
  }
}
