import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get('summary/:postId')
  getSummary(@Param('postId') postId: string) {
    return this.ratingsService.getSummary(postId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  upsert(
    @Body() dto: CreateRatingDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.ratingsService.upsert(dto, user.userId);
  }
}
