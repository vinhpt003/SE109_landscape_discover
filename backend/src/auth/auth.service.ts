import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { userName: dto.userName }] },
    });
    if (existing) {
      throw new ConflictException('Email hoặc tên đăng nhập đã được sử dụng');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { userName: dto.userName, email: dto.email, password: hashed },
    });

    return this.buildTokenResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.identifier }, { userName: dto.identifier }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Sai thông tin đăng nhập');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Sai mật khẩu');
    }

    return this.buildTokenResponse(user);
  }

  private async buildTokenResponse(user: {
    userId: string;
    email: string;
    userName: string;
    role: string;
    avatar: string | null;
  }) {
    const payload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
      userName: user.userName,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        userId: user.userId,
        email: user.email,
        userName: user.userName,
        role: user.role,
        avatar: user.avatar,
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
