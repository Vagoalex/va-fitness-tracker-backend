import { AuthModule } from './shared/auth/auth.module';
import { UserModule } from './shared/user/user.module';
import { AdminUserModule } from './admin/user/admin-user.module';
import { PublicUserModule } from './public/user/public-user.module';
import { AdminCategoryModule } from './admin/category/admin-category.module';
import { CategoryModule } from './shared/category/category.module';

export const ADMIN_MODULES = [AdminUserModule, AdminCategoryModule];
export const PUBLIC_MODULES = [PublicUserModule];
export const SHARED_MODULES = [AuthModule, UserModule, CategoryModule];
