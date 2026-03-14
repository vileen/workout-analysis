import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, Translations } from './translations';
import { getTranslations } from './translations';

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

export const useI18n = create<I18nState>()(
  persist(
    (set) => ({
      language: 'pl', // Polish as default
      setLanguage: (lang: Language) => {
        set({ 
          language: lang,
          t: getTranslations(lang),
        });
      },
      t: getTranslations('pl'),
    }),
    {
      name: 'language-storage',
      onRehydrateStorage: () => (state) => {
        // Rehydrate translations when store is loaded from storage
        if (state) {
          state.t = getTranslations(state.language);
        }
      },
    }
  )
);

// Hook for easy access to translations
export function useTranslation() {
  const { t, language, setLanguage } = useI18n();
  return { t, language, setLanguage };
}
