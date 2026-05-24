import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard) // Phải có token mới vào được đây
  @Get('me')
  getProfile(@Request() req: any) {
    // req.user.id lấy từ Payload của Token giải mã được
    return this.usersService.findOne(req.user.id);
  }
}
