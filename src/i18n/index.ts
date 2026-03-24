import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, Translations } from './translations';
import { getTranslations } from './translations';
import { audioFeedback } from '../utils/audioFeedback';

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

export const useI18n = create<I18nState>()(
  persist(
    (set) => ({
      language: 'en', // English as default
      setLanguage: (lang: Language) => {
        set({ 
          language: lang,
          t: getTranslations(lang),
        });
        audioFeedback.setLanguage(lang === 'pl' ? 'pl-PL' : 'en-US');
      },
      t: getTranslations('en'),
    }),
    {
      name: 'language-storage',
      onRehydrateStorage: () => (state) => {
        // Rehydrate translations when store is loaded from storage
        if (state) {
          state.t = getTranslations(state.language);
          audioFeedback.setLanguage(state.language === 'pl' ? 'pl-PL' : 'en-US');
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

