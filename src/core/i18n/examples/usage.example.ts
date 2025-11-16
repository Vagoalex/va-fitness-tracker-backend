/**
 * Примеры использования I18nService
 * Демонстрирует автодополнение и типобезопасность новой реализации
 */

import { I18nService } from '../i18n.service';

// Пример 1: Базовое использование с автодополнением
export class ExampleService1 {
  constructor(private readonly i18n: I18nService) {}

  example() {
    // ✅ При вводе 'this.i18n.auth(' IDE покажет автодополнение для всех ключей auth
    const loginText = this.i18n.auth('messages.login');
    const welcomeText = this.i18n.auth('messages.welcome', { args: { name: 'John' } });
    const errorText = this.i18n.auth('errors.invalid_credentials');

    // ✅ При вводе 'this.i18n.common(' IDE покажет автодополнение для common
    const successText = this.i18n.common('messages.success');
    const notFoundText = this.i18n.common('errors.not_found');
    const validationText = this.i18n.common('errors.validation_failed');

    // ✅ При вводе 'this.i18n.validation(' IDE покажет автодополнение для validation
    const requiredText = this.i18n.validation('is_required');
    const minLengthText = this.i18n.validation('min_length', { args: { min: 6 } });

    // ❌ Ошибка компиляции - ключ не существует
    // this.i18n.auth('wrong_key');
    // this.i18n.common('errors.wrong_key');
  }
}

// Пример 2: Использование с параметрами и языком
export class ExampleService2 {
  constructor(private readonly i18n: I18nService) {}

  example() {
    // ✅ Перевод с параметрами
    const minLength = this.i18n.validation('min_length', {
      args: { min: 8 },
    });

    // ✅ Явное указание языка
    const welcomeEN = this.i18n.auth('messages.welcome', {
      args: { name: 'John' },
      lang: 'en',
    });

    const welcomeRU = this.i18n.auth('messages.welcome', {
      args: { name: 'Иван' },
      lang: 'ru',
    });

    // ✅ Значение по умолчанию
    // const customMessage = this.i18n.common('custom_key', {
    //   defaultValue: 'Default message',
    // });

    return { minLength, welcomeEN, welcomeRU };
  }
}

// Пример 3: Утилитарные методы
export class ExampleService3 {
  constructor(private readonly i18n: I18nService) {}

  example() {
    // ✅ Получение текущего языка
    const currentLang = this.i18n.getCurrentLanguage();
    console.log(`Current language: ${currentLang}`);

    // ✅ Проверка поддержки языка
    const isFrenchSupported = this.i18n.isLanguageSupported('fr');
    console.log(`French supported: ${isFrenchSupported}`);

    // ✅ Получение всех поддерживаемых языков
    const supportedLangs = this.i18n.getSupportedLanguages();
    console.log(`Supported languages: ${supportedLangs.join(', ')}`);

    return { currentLang, isFrenchSupported, supportedLangs };
  }
}

// Пример 4: Универсальный метод translate
export class ExampleService4 {
  constructor(private readonly i18n: I18nService) {}

  example() {
    // ✅ Универсальный метод для любых namespace
    const authMessage = this.i18n.t('auth', 'messages.login');
    const commonMessage = this.i18n.t('common', 'errors.not_found');
    const validationMessage = this.i18n.t('validation', 'is_required', {
      lang: 'en',
    });

    return { authMessage, commonMessage, validationMessage };
  }
}

// Пример 5: Реальное использование в сервисе
export class AuthService {
  constructor(private readonly i18n: I18nService) {}

  login(email: string, password: string) {
    try {
      // Логика аутентификации...

      // ✅ Типизированные сообщения об успехе
      const successMessage = this.i18n.auth('messages.welcome', {
        args: { name: 'User' },
        lang: this.i18n.getCurrentLanguage(),
      });

      return {
        success: true,
        message: successMessage,
        data: { user: {} },
      };
    } catch (error: unknown) {
      // ✅ Типизированные сообщения об ошибках
      const errorMessage = this.i18n.auth('errors.invalid_credentials');

      return {
        success: false,
        message: errorMessage,
      };
    }
  }
}

// Пример 6: Валидация с переводами
export class ValidationService {
  constructor(private readonly i18n: I18nService) {}

  validateEmail(email: string): string | null {
    if (!email) {
      return this.i18n.validation('is_required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      // return this.i18n.validation('invalid_email');
    }

    return null;
  }

  validatePassword(password: string): string | null {
    if (!password) {
      return this.i18n.validation('is_required');
    }

    if (password.length < 6) {
      return this.i18n.validation('min_length', {
        args: { min: 6 },
      });
    }

    return null;
  }
}
