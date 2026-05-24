import { Controller, Get, Post, Body, Query, Param, UseGuards, Patch, Delete } from '@nestjs/common';
import { LandmarksService } from './landmarks.service';
import { CreateLandmarkDto } from './dto/create-landmark.dto';
import { Region } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateLandmarkDto } from './dto/update-landmark.dto';

@Controller('landmarks')
export class LandmarksController {
  constructor(private readonly landmarksService: LandmarksService) {}

  // API Đọc dữ liệu (Public - Ai cũng xem được)
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('region') region?: Region,
    @Query('province') province?: string,
  ) {
    return this.landmarksService.findAll(search, region, province);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.landmarksService.findOne(+id);
  }

  // ==========================================
  // KHU VỰC BẢO MẬT (Chỉ Admin mới được gọi)
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN') // <-- Chỉ user có role ADMIN mới vượt qua được
  @Post()
  create(@Body() createLandmarkDto: CreateLandmarkDto) {
    return this.landmarksService.create(createLandmarkDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLandmarkDto: UpdateLandmarkDto) {
    // Dấu + đằng trước id là để ép kiểu từ chuỗi (string) trên URL thành số nguyên (number)
    return this.landmarksService.update(+id, updateLandmarkDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.landmarksService.remove(+id);
  }
}
