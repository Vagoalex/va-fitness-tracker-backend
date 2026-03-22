import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SECURITY_CONSTANTS } from '../constants/security.constants';

/**
 * Guard для авторизации через JWT
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-access') {}
