import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async login(loginDto: LoginDto) {
    // 1. Tìm user trong Database
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    // 2. Kiểm tra xem có phải ADMIN không
    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('Sai thông tin đăng nhập hoặc không đủ quyền!');
    }

    // 3. Kiểm tra mật khẩu (giả định mật khẩu trong DB đã được hash bằng bcrypt)
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Sai thông tin đăng nhập!');
    }

    // 4. Tạo JWT Token trả về cho Client
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}
