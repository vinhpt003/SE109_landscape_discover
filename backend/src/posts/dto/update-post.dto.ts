import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PostStatus } from '@prisma/client';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdatePostStatusDto {
  @IsEnum(PostStatus, { message: 'Trạng thái không hợp lệ' })
  status!: PostStatus;
}
