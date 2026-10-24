import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';

import { STRINGS, type Lang, type StringKey } from '@/i18n/strings';

type Vars = Record<string, string | number>;
export type Translate = (key: StringKey, vars?: Vars) => string;

interface I18n {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translate;
}

const I18nContext = createContext<I18n | null>(null);

export function translate(lang: Lang, key: StringKey, vars?: Vars): string {
  let s = STRINGS[lang][key] ?? STRINGS.fr[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  }
  return s;
}

function initialLang(): Lang {
  // Web only: lets a preview link open the app directly in Portuguese (?lang=pt).
  if (Platform.OS === 'web' && typeof window !== 'undefined' && /[?&]lang=pt/.test(window.location.search)) return 'pt';
  return 'fr';
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const t = useCallback<Translate>((key, vars) => translate(lang, key, vars), [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}

export const LOCALE: Record<Lang, string> = { fr: 'fr-FR', pt: 'pt-PT' };
