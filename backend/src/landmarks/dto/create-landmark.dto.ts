import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Region, Status } from '@prisma/client';

export class CreateLandmarkDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsEnum(Region)
  region!: Region;

  @IsString()
  @IsNotEmpty()
  province!: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
