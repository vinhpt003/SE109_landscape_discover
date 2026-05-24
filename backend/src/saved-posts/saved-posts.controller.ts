import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { SavedPostsService } from './saved-posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { IsNotEmpty, IsUUID } from 'class-validator';

class ToggleSavedDto {
  @IsUUID()
  @IsNotEmpty()
  postId!: string;
}

@Controller('saved-posts')
@UseGuards(JwtAuthGuard)
export class SavedPostsController {
  constructor(private readonly savedPostsService: SavedPostsService) {}

  @Get('me')
  findMyPosts(@CurrentUser() user: { userId: string }) {
    return this.savedPostsService.findMyPosts(user.userId);
  }

  @Post()
  toggle(
    @Body() dto: ToggleSavedDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.savedPostsService.toggle(dto.postId, user.userId);
  }
}
