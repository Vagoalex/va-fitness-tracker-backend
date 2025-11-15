import { PublicUserModule } from './user/public-user.module';

/**
 * Коллекция модулей для публичной части
 *
 * Usage:
 * ```ts
 * import { PUBLIC_MODULES } from './modules/public';
 *
 * @NgModule({
 *   imports: [...PUBLIC_MODULES]
 * })
 * ```
 */
export const PUBLIC_MODULES = [PublicUserModule] as const;

// Для удобства импорта отдельных модулей
export { PublicUserModule };
