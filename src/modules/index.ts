import { AuthModule } from './shared/auth/auth.module';
import { UserModule } from './shared/user/user.module';
import { AdminUserModule } from './admin/admin-user.module';
import { PublicUserModule } from './public/user/public-user.module';

export const ADMIN_MODULES = [AdminUserModule];
export const PUBLIC_MODULES = [PublicUserModule];
export const SHARED_MODULES = [AuthModule, UserModule];
