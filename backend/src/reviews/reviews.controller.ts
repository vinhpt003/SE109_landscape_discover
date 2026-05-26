import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Bất kỳ ai cũng có thể xem bình luận (Không cần Guard)
  @Get('landmark/:landmarkId')
  findByLandmark(@Param('landmarkId') landmarkId: string) {
    return this.reviewsService.findByLandmark(+landmarkId);
  }

  // Phải đăng nhập mới được bình luận
  @UseGuards(JwtAuthGuard)
  @Post(':landmarkId')
  create(
    @Request() req: any,
    @Param('landmarkId') landmarkId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    // Lấy id của người dùng từ token đã giải mã
    const userId = req.user.id;
    return this.reviewsService.create(userId, +landmarkId, createReviewDto);
  }

  // Phải đăng nhập mới được xóa (Logic kiểm tra quyền nằm trong Service)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.reviewsService.remove(+id, userId, userRole);
  }
}
