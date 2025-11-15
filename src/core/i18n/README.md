# I18n Module - Типизированные Переводы

## Структура

```
i18n/
├── en/                    # Английские переводы
│   ├── auth.json
│   ├── common.json
│   └── validation.json
├── ru/                    # Русские переводы
│   ├── auth.json
│   ├── common.json
│   └── validation.json
├── types/
│   └── translations.types.ts  # TypeScript типы для автодополнения
├── constants/
│   └── translation-keys.constants.ts  # Константы ключей
├── i18n.module.ts         # Модуль (глобальный)
├── i18n.service.ts        # Типизированный сервис
└── index.ts               # Barrel export
```

## Использование

### Базовое Использование с Автодополнением

```typescript
import { TypedI18nService } from './core/i18n';

@Injectable()
export class AuthService {
  constructor(private readonly i18nService: TypedI18nService) {}

  async register() {
    // ✅ Автодополнение работает!
    // При вводе 'auth.success.' IDE покажет: registered, logged_in
    const message = await this.i18nService.translateAsync('auth.success.registered');
    
    return { message };
  }
}
```

### Использование с Константами

```typescript
import { TypedI18nService, AUTH_TRANSLATION_KEYS } from './core/i18n';

@Injectable()
export class AuthService {
  constructor(private readonly i18nService: TypedI18nService) {}

  async login() {
    // ✅ Использование констант для типобезопасности
    const message = await this.i18nService.translateAsync(
      AUTH_TRANSLATION_KEYS.errors.invalid_credentials
    );
  }
}
```

### Использование с Параметрами

```typescript
// validation.json
{
  "min_length": "Must be at least {min} characters"
}

// Использование
this.i18nService.translate('validation.min_length', {
  args: { min: 8 }
});
```

## Доступные Ключи

### Auth (`auth.*`)
- `auth.errors.invalid_credentials`
- `auth.errors.user_exists`
- `auth.errors.unauthorized`
- `auth.success.registered`
- `auth.success.logged_in`

### Common (`common.*`)
- `common.errors.not_found`
- `common.errors.internal_error`
- `common.errors.validation_failed`
- `common.success.created`
- `common.success.updated`
- `common.success.deleted`

### Validation (`validation.*`)
- `validation.is_email`
- `validation.is_not_empty`
- `validation.min_length`
- `validation.max_length`
- `validation.is_string`
- `validation.is_number`

## Миграция

### Замена I18nService на TypedI18nService

```typescript
// Было
import { I18nService } from 'nestjs-i18n';
constructor(private readonly i18nService: I18nService) {}

// Стало
import { TypedI18nService } from './core/i18n';
constructor(private readonly i18nService: TypedI18nService) {}
```

### Обновление Вызовов

```typescript
// Оба варианта работают
await this.i18nService.translateAsync('auth.errors.user_exists');
this.i18nService.translate('auth.errors.user_exists');
```

## Добавление Новых Переводов

1. Добавить ключ в JSON файлы всех языков
2. Обновить типы в `translations.types.ts`
3. (Опционально) Добавить константу в `translation-keys.constants.ts`

Пример:
```json
// en/auth.json
{
  "errors": {
    "new_error": "New error message"
  }
}
```

```typescript
// translations.types.ts
type AuthTranslations = {
  errors: {
    // ... существующие
    new_error: string; // добавить
  };
};
```

