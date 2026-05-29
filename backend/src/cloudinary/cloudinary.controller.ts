import {
  Controller,
  Post,
  Delete,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import { CloudinaryService } from './cloudinary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Controller('uploads')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Editor', 'RegisteredUser')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_BYTES } }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Không tìm thấy file');
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException('Định dạng file không hỗ trợ (chỉ JPG/PNG/WEBP/GIF)');
    }
    return this.cloudinaryService.uploadBuffer(file.buffer);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Editor')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteImage(@Query('publicId') publicId: string) {
    if (!publicId) throw new BadRequestException('publicId là bắt buộc');
    await this.cloudinaryService.deleteByPublicId(publicId);
  }
}
