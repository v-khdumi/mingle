import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { en, type Translations } from './translations/en';
import { ro } from './translations/ro';

export type Language = 'en' | 'ro';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const translations: Record<Language, Translations> = { en, ro };

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: en,
});

function detectLanguage(): Language {
  try {
    const stored = localStorage.getItem('mingle-lang');
    if (stored === 'ro' || stored === 'en') return stored;
    const browserLang = navigator.language?.toLowerCase() || '';
    if (browserLang.startsWith('ro')) return 'ro';
  } catch {
    // ignore
  }
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(detectLanguage);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('mingle-lang', newLang);
    } catch {
      // ignore
    }
  }, []);

  const t = translations[lang];

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
