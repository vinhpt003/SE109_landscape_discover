import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { CloudinaryProvider } from '../common/config/cloudinary.config';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, CloudinaryProvider],
  exports: [UploadsService], // Export ra lỡ các Module khác muốn dùng
})
export class UploadsModule {}
