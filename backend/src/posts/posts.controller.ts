import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto, UpdatePostStatusDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtOptionalGuard } from '../auth/jwt-optional.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { PostStatus } from '@prisma/client';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @UseGuards(JwtOptionalGuard)
  findAll(
    @Query('search') search?: string,
    @Query('locationId') locationId?: string,
    @Query('status') status?: PostStatus | 'all',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: { userId: string; role: string },
  ) {
    return this.postsService.findAll({
      search,
      locationId,
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      isAdmin: user?.role === 'Admin',
    });
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Editor')
  findMine(
    @CurrentUser() user: { userId: string },
    @Query('status') status?: PostStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postsService.findMine(user.userId, {
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Editor')
  create(
    @Body() dto: CreatePostDto,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return this.postsService.create(dto, user.userId, user.role);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return this.postsService.update(id, dto, user.userId, user.role);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePostStatusDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.postsService.updateStatus(id, dto, user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return this.postsService.remove(id, user.userId, user.role);
  }
}
