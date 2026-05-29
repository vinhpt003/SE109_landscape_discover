import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadsService {
  uploadFile(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'landmark_blog' }, // Ảnh sẽ được lưu vào thư mục này trên Cloudinary
        (error, result) => {
          if (error) return reject(error);
          if (result) return resolve(result);
        },
      );
      // Chuyển file từ buffer (bộ nhớ tạm) thành stream và đẩy lên Cloudinary
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
