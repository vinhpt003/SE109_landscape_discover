import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { LandmarksService } from './landmarks.service';
import { CreateLandmarkDto } from './dto/create-landmark.dto';
import { Region } from '@prisma/client';

@Controller('landmarks')
export class LandmarksController {
  constructor(private readonly landmarksService: LandmarksService) {}

  // TODO: Sau này sẽ thêm @UseGuards(JwtAuthGuard, RolesGuard) để bảo vệ API này
  @Post()
  create(@Body() createLandmarkDto: CreateLandmarkDto) {
    return this.landmarksService.create(createLandmarkDto);
  }

  // API lấy danh sách bài viết hỗ trợ Query Parameters (?search=...&region=...)
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
}
