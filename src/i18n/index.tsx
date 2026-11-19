import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import { en, type StringKey } from './en';
import { uk } from './uk';

export type Lang = 'uk' | 'en';

const DICTIONARIES: Record<Lang, Record<StringKey, string>> = { uk, en };

/** Date formatting locale for each language. */
const LOCALES: Record<Lang, string> = { uk: 'uk-UA', en: 'en-US' };

export type TFunction = (key: StringKey, vars?: Record<string, string | number>) => string;

type I18nValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TFunction;
  /** BCP 47 locale for toLocaleDateString and friends. */
  locale: string;
};

const I18nContext = createContext<I18nValue | null>(null);

/** Ukrainian is the default language; the choice lives in memory for now (no storage yet). */
export function I18nProvider({ children }: PropsWithChildren) {
  const [lang, setLang] = useState<Lang>('uk');

  const t = useCallback<TFunction>(
    (key, vars) => {
      const text = DICTIONARIES[lang][key];
      if (!vars) return text;
      return text.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t, locale: LOCALES[lang] }), [lang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside <I18nProvider>');
  return context;
}

/** Ukrainian plural form: 1 рік, 2–4 роки, 5+ років (and 11–14 always "many"). */
export function pluralUk(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
