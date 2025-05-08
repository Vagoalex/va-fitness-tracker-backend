import { AuthModule } from './shared/auth/auth.module';
import { UserModule } from './shared/user/user.module';

export const ADMIN_MODULES = [];
export const PUBLIC_MODULES = [AuthModule, UserModule];
