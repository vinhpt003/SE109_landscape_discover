import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Region } from '@prisma/client';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên địa điểm không được để trống' })
  locationName!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coordinates?: string;

  @IsOptional()
  @IsEnum(Region, { message: 'Vùng miền không hợp lệ' })
  region?: Region;
}
