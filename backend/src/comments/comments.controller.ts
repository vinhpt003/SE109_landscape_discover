import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, HttpCode, HttpStatus, ForbiddenException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtOptionalGuard } from '../auth/jwt-optional.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @UseGuards(JwtOptionalGuard)
  findAll(
    @Query('postId') postId?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: { userId: string; role: string },
  ) {
    const isAdmin = user?.role === 'Admin';
    if (!postId && !isAdmin) {
      throw new ForbiddenException('postId là bắt buộc');
    }
    if (!isAdmin) {
      return this.commentsService.findByPost(postId!);
    }
    return this.commentsService.findAll({
      postId,
      userId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.commentsService.create(dto, user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return this.commentsService.remove(id, user.userId, user.role);
  }
}
