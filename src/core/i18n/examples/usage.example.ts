/**
 * Примеры использования TypedI18nService
 * Демонстрирует автодополнение и типобезопасность
 */

import { TypedI18nService } from '../i18n.service';
import { AUTH_TRANSLATION_KEYS } from '../constants/translation-keys.constants';

// Пример 1: Базовое использование с автодополнением
export class ExampleService1 {
  constructor(private readonly i18nService: TypedI18nService) {}

  async example() {
    // ✅ При вводе 'auth.success.' IDE покажет автодополнение:
    //    - registered
    //    - logged_in
    const message1 = await this.i18nService.translateAsync('auth.success.registered');

    // ✅ При вводе 'auth.errors.' IDE покажет:
    //    - invalid_credentials
    //    - user_exists
    //    - unauthorized
    const message2 = await this.i18nService.translateAsync('auth.errors.user_exists');

    // ❌ Ошибка компиляции - ключ не существует
    // const message3 = await this.i18nService.translateAsync('auth.errors.wrong_key');
  }
}

// Пример 2: Использование с константами
export class ExampleService2 {
  constructor(private readonly i18nService: TypedI18nService) {}

  async example() {
    // ✅ Использование констант для типобезопасности
    const message = await this.i18nService.translateAsync(
      AUTH_TRANSLATION_KEYS.errors.invalid_credentials,
    );
  }
}

// Пример 3: Использование с параметрами
export class ExampleService3 {
  constructor(private readonly i18nService: TypedI18nService) {}

  example() {
    // ✅ Перевод с параметрами
    const message = this.i18nService.translate('validation.min_length', {
      args: { min: 8 },
    });
  }
}

// Пример 4: Синхронное использование
export class ExampleService4 {
  constructor(private readonly i18nService: TypedI18nService) {}

  example() {
    // ✅ Синхронный метод (если перевод уже загружен)
    const message = this.i18nService.translate('common.success.created');
  }
}
