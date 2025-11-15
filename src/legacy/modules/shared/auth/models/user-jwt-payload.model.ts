import { RoleTypes } from '../../../../core/enums/RoleTypes';

export interface UserJwtPayloadModel {
  userId: string;
  email: string;
  roles: RoleTypes[];
  iat?: number;
  exp?: number;
}
