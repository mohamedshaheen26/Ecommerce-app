import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: "en",
    resources: {
      en: {
        translation: enTranslations,
      },
      ar: {
        translation: arTranslations,
      },
    },
    fallbackLng: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    debug: false,
    returnNull: false,
    returnEmptyString: false,
    saveMissing: false,
  });

  // i18n.on("missingKey", (ns, key) => {
  //   throw new Error(`Missing translation key: ${key} in namespace: ${ns}`);
  // });

export default i18n;
