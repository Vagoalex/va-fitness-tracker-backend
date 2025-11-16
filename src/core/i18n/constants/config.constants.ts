export const AVAILABLE_LANGUAGES = ['en', 'ru'] as const;

export const I18N_CONFIG = {
  defaultLanguage: 'en',
  supportedLanguages: [...AVAILABLE_LANGUAGES],
  resolvers: {
    query: ['lang', 'l'],
    header: ['x-custom-lang'],
  },
} as const;

export type AppLanguage = (typeof I18N_CONFIG.supportedLanguages)[number];
