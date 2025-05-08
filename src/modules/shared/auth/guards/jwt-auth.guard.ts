import { AuthGuard } from '@nestjs/passport';
import { JwtTypeName } from '../constants/auth.constants';

export class JwtAuthGuard extends AuthGuard(JwtTypeName) {}
