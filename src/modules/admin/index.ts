import { AdminUserModule } from './user/admin-user.module';
import { AdminCategoryModule } from './category/admin-category.module';
import { AdminExerciseTypeModule } from './exercise-type/admin-exercise-type.module';
import { AdminExerciseModule } from './exercise/admin-exercise.module';

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
export const ADMIN_MODULES = [
	AdminUserModule,
	AdminCategoryModule,
	AdminExerciseTypeModule,
	AdminExerciseModule,
] as const;

// Для удобства импорта отдельных модулей
export { AdminUserModule, AdminCategoryModule, AdminExerciseTypeModule };
