import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { JWT_REFRESH_STRATEGY_NAME } from '@/common/security/constants/security.constants';

/**
 * Guard для авторизации через JWT refresh токен
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard(JWT_REFRESH_STRATEGY_NAME) {}
