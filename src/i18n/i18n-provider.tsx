import { getLocales } from 'expo-localization';
import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import {
  formatDate as formatDateWithLocale,
  formatMonth as formatMonthWithLocale,
  daysBetween,
  fromISODate,
  today,
  type ISODate,
} from '@/lib/dates';

import { LOCALES, TRANSLATIONS, type Language, type Translation } from './translations';

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translation;
  locale: string;
  formatDate: (value: ISODate, options?: Intl.DateTimeFormatOptions) => string;
  formatMonth: (year: number, month: number) => string;
  /** "Today", "Tomorrow", "In 5 days", "3 days ago", or a date further out. */
  formatRelative: (value: ISODate, from?: ISODate) => string;
  /** "2 years 4 months" */
  formatAge: (birthDate: ISODate, from?: ISODate) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function deviceLanguage(): Language {
  try {
    const code = getLocales()[0]?.languageCode;
    return code === 'uk' ? 'uk' : 'en';
  } catch {
    return 'en';
  }
}

// TODO: persist the chosen language once the app has storage.
export function I18nProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState<Language>(deviceLanguage);

  const value = useMemo<I18nContextValue>(() => {
    const t = TRANSLATIONS[language];
    const locale = LOCALES[language];

    // Ukrainian weekday/month names are lower-case; capitalise since they usually start a label.
    const formatDate = (value: ISODate, options?: Intl.DateTimeFormatOptions) => {
      const text = formatDateWithLocale(value, locale, options);
      return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const formatRelative = (value: ISODate, from: ISODate = today()) => {
      const diff = daysBetween(from, value);
      if (diff === 0) return t.time.today;
      if (diff === 1) return t.time.tomorrow;
      if (diff === -1) return t.time.yesterday;
      if (diff > 1 && diff <= 14) return t.time.inDays(diff);
      if (diff < -1 && diff >= -14) return t.time.daysAgo(-diff);
      const sameYear = value.slice(0, 4) === from.slice(0, 4);
      return formatDate(value, sameYear ? { year: undefined } : {});
    };

    const formatAge = (birthDate: ISODate, from: ISODate = today()) => {
      const birth = fromISODate(birthDate);
      const now = fromISODate(from);
      let months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
      if (now.getDate() < birth.getDate()) months -= 1;
      if (months < 1) return t.time.underMonth;
      const years = Math.floor(months / 12);
      const rest = months % 12;
      return [years ? t.time.years(years) : null, rest ? t.time.months(rest) : null]
        .filter(Boolean)
        .join(' ');
    };

    return {
      language,
      setLanguage,
      t,
      locale,
      formatDate,
      formatMonth: (year, month) => formatMonthWithLocale(year, month, locale),
      formatRelative,
      formatAge,
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside <I18nProvider>');
  }
  return context;
}
