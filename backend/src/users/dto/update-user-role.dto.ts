import { IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserRoleDto {
  @IsEnum(['RegisteredUser', 'Editor'], { message: 'Role phải là RegisteredUser hoặc Editor' })
  role!: Extract<Role, 'RegisteredUser' | 'Editor'>;
}
