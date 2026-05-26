import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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

  async register(registerDto: RegisterDto) {
    // 1. Kiểm tra xem email đã tồn tại trong Database chưa
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email này đã được sử dụng!');
    }

    // 2. Mã hóa mật khẩu (Bơm muối 10 vòng)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // 3. Lưu user mới vào Database với Role mặc định là 'USER'
    const newUser = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        fullName: registerDto.fullName,
        role: 'USER',
      },
    });

    // 4. Bóc tách mật khẩu ra khỏi kết quả trả về để bảo mật
    const { password, ...result } = newUser;
    return result;
  }
}
