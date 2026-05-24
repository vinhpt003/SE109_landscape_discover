import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback_secret_key_for_dev',
      signOptions: { expiresIn: '1d' }, // Token có hạn 1 ngày
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // <-- Thêm JwtStrategy vào đây
})
export class AuthModule {}
