import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

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
}
