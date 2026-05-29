import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { PostStatus } from '@prisma/client';

export class CreatePostDto {
  @IsUUID()
  @IsNotEmpty()
  locationId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  content!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imagePublicId?: string;

  @IsOptional()
  @IsEnum(PostStatus, { message: 'Trạng thái không hợp lệ' })
  status?: PostStatus;
}
