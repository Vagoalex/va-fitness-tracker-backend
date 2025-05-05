import { AuthModule as AdminAuthModule } from './admin/auth/auth.module';
import { AuthModule } from './public/auth/auth.module';
import { UserModule } from './public/user/user.module';

export const ADMIN_MODULES = [AdminAuthModule];
export const PUBLIC_MODULES = [AuthModule, UserModule];
