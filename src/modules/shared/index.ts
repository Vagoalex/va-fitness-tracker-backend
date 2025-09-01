import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';

/**
 * Коллекция модулей для общей части (передаются во все модули)
 *
 * Usage:
 * ```ts
 * import { SHARED_MODULES } from './modules/shared';
 *
 * @NgModule({
 *   imports: [...SHARED_MODULES]
 * })
 * ```
 */
export const SHARED_MODULES = [AuthModule, UserModule, CategoryModule] as const;

// Для удобства импорта отдельных модулей
export { AuthModule, UserModule, CategoryModule };
