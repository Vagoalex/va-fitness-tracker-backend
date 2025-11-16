# I18n Module - Типизированные Переводы

## Структура

```
i18n/
├── locales/ # Файлы переводов
│ ├── en/ # Английские переводы
│ │ ├── auth.json
│ │ ├── common.json
│ │ └── validation.json
│ └── ru/ # Русские переводы
│ ├── auth.json
│ ├── common.json
│ └── validation.json
├── generated/ # Автогенерируемые типы (не редактировать)
│ └── i18n.generated.ts
├── constants.ts # Конфигурация и константы
├── i18n.module.ts # Глобальный модуль
├── i18n.service.ts # Типизированный сервис
└── index.ts # Barrel export
```

## Особенности

- ✅ **Полная типизация** - автодополнение и проверка ключей
- ✅ **Автогенерация типов** - типы всегда синхронизированы с JSON файлами
- ✅ **Вложенные ключи** - поддержка `common.errors.not_found`
- ✅ **Быстрые методы** - удобные методы для каждого namespace
- ✅ **Глобальная доступность** - модуль регистрируется глобально

## Использование

### Базовое Использование с Автодополнением

```typescript
import { I18nService } from './core/i18n';

@Injectable()
export class AuthService {
	constructor(private readonly i18n: I18nService) {}
	
	async register(userName: string) {
		// ✅ Полное автодополнение для всех неймспейсов и ключей
		const welcome = this.i18n.auth('welcome', { args: { name: userName } });
		const success = this.i18n.common('success');
		const requiredError = this.i18n.validation('required');
		
		return { welcome, success, requiredError };
	}
}
```

### Использование с Вложенными Ключами


```typescript
@Injectable()
export class ErrorService {
	constructor(private readonly i18n: I18nService) {}
	
	handleErrors() {
		// ✅ Автодополнение работает для любых уровней вложенности
		const notFound = this.i18n.common('errors.not_found');
		const validationError = this.i18n.common('errors.validation.required');
		const authError = this.i18n.auth('errors.invalid_credentials');
		
		return { notFound, validationError, authError };
	}
}
```

### Использование с Параметрами и Языком

```typescript
// validation.json
{
	"min_length": "Must be at least {{min}} characters"
}

// Использование
this.i18n.validation('min_length', {
	args: { min: 8 },
	lang: 'en' // опционально, по умолчанию определяется автоматически
});
```

[//]: # (// TODO: Сделать все и поддерживать)
## Доступные Методы

### Auth (`auth.*`)
```typescript
this.i18n.auth('login');
this.i18n.auth('welcome', { args: { name: 'John' } });
this.i18n.auth('errors.invalid_credentials');
```

### Common (`common.*`)
```typescript
this.i18n.common('success');
this.i18n.common('errors.not_found');
this.i18n.common('errors.validation.required');
this.i18n.common('messages.welcome');
```

### Validation (`validation.*`)
```typescript
this.i18n.validation('required');
this.i18n.validation('invalid_email');
this.i18n.validation('min_length', { args: { min: 6 } });
```

## Утилитарные Методы
```typescript
// Получить текущий язык
const currentLang = this.i18n.getCurrentLanguage(); // 'en' | 'ru'

// Проверить поддержку языка
if (this.i18n.isLanguageSupported('fr')) {
	// ...
}

// Получить все поддерживаемые языки
const languages = this.i18n.getSupportedLanguages(); // ['en', 'ru']
```

## Генерация Типов

Типы генерируются автоматически при запуске в development режиме или через команду:

```
npm run i18n:generate
```

Файл типов создается в src/core/i18n/generated/i18n.generated.ts и автоматически обновляется при изменении JSON файлов.
Генерация запускается автоматически при сборке проекта из файла `scripts/generate-i18n.js`

## Добавление Новых Переводов

1. Добавьте ключ в JSON файлы всех языков:
```typescript
// en/common.json
{
  "new_feature": {
    "title": "New Feature",
    "description": "This is a new feature"
  }
}

// ru/common.json  
{
  "new_feature": {
    "title": "Новая Функция",
    "description": "Это новая функция"
  }
}
```

2. Типы сгенерируются автоматически в пути `src/core/i18n/generated/i18n.generated.ts` - можно сразу использовать:
```typescript
this.i18n.common('new_feature.title');
this.i18n.common('new_feature.description');
```

## Конфигурация

Модуль автоматически определяет язык через:
- Query параметры: ?lang=en или ?l=ru
- HTTP заголовки: x-custom-lang
- Cookies
- Accept-Language header