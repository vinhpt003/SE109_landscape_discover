import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @UseGuards(JwtAuthGuard) // Phải có token hợp lệ mới được gọi API này
  @Post()
  @UseInterceptors(FileInterceptor('file')) // Từ khóa 'file' phải khớp với key mà Frontend gửi lên
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file ảnh!');
    }

    // Gọi service đẩy lên Cloudinary
    const result = await this.uploadsService.uploadFile(file);
    // Trả về URL để Frontend lưu vào Database hoặc hiển thị ngay
    return {
      message: 'Upload ảnh thành công!',
      url: result.secure_url,
      publicId: result.public_id,
    };
  }
}
