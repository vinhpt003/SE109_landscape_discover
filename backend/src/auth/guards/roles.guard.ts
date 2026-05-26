import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy danh sách roles yêu cầu từ Decorator @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu API không yêu cầu role nào, cho phép đi tiếp
    if (!requiredRoles) {
      return true;
    }

    // Lấy thông tin user đã được JwtStrategy giải mã
    const { user } = context.switchToHttp().getRequest();

    // Nếu không có user hoặc role không khớp
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Bạn không có quyền thực hiện hành động này!');
    }

    return true;
  }
}
