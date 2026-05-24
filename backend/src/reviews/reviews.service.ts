import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  // 1. Thêm bình luận mới
  async create(userId: number, landmarkId: number, createReviewDto: CreateReviewDto) {
    // Kiểm tra địa điểm có tồn tại không
    const landmark = await this.prisma.landmark.findUnique({
      where: { id: landmarkId },
    });

    if (!landmark) {
      throw new NotFoundException('Không tìm thấy địa điểm này!');
    }

    return await this.prisma.review.create({
      data: {
        rating: createReviewDto.rating,
        content: createReviewDto.content,
        userId: userId,
        landmarkId: landmarkId,
      },
      include: {
        user: { select: { fullName: true, avatarUrl: true } }, // Trả về kèm tên người bình luận
      },
    });
  }

  // 2. Lấy tất cả bình luận của một địa điểm
  async findByLandmark(landmarkId: number) {
    return await this.prisma.review.findMany({
      where: { landmarkId },
      include: {
        user: { select: { fullName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' }, // Bình luận mới nhất xếp trên
    });
  }

  // 3. Xóa bình luận
  async remove(reviewId: number, userId: number, userRole: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Không tìm thấy bình luận!');
    }

    // Chỉ Admin hoặc chính chủ mới được xóa
    if (userRole !== 'ADMIN' && review.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa bình luận này!');
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    return { message: 'Đã xóa bình luận thành công!' };
  }
}
