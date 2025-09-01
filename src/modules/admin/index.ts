import { AdminUserModule } from './user/admin-user.module';
import { AdminCategoryModule } from './category/admin-category.module';

/**
 * Коллекция модулей для админки
 *
 * Usage:
 * ```ts
 * import { ADMIN_MODULES } from './modules/admin';
 *
 * @NgModule({
 *   imports: [...ADMIN_MODULES]
 * })
 * ```
 */
export const ADMIN_MODULES = [AdminUserModule, AdminCategoryModule] as const;

// Для удобства импорта отдельных модулей
export { AdminUserModule, AdminCategoryModule };
