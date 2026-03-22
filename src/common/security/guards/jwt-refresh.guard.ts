import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard для авторизации через JWT refresh токен
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
