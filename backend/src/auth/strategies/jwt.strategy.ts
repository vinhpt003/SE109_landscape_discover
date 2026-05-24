import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Lấy token từ header "Authorization: Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Đảm bảo bạn đã thêm JWT_SECRET="chuoi_bao_mat_cua_ban" vào file .env
      secretOrKey: process.env.JWT_SECRET || 'fallback_secret_key_for_dev', 
    });
  }

  // Hàm này tự động chạy sau khi token được giải mã thành công
  async validate(payload: any) {
    // Trả về object này, NestJS sẽ tự động gắn nó vào request.user
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
