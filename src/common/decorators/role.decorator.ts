import { SetMetadata } from '@nestjs/common';
import { Roles } from 'src/common/enums/role.enum';

export const ROLES_KEY = 'roles';
export const RolesDecorator = (...roles: Roles[]) =>
  SetMetadata(ROLES_KEY, roles);
