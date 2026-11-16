import i18n from 'i18next';
// @ts-ignore
import { I18nextPlugin } from 'i18next-react-native';
import ar from './ar.json';
import en from './en.json';

i18n.use(I18nextPlugin).init({
  compatibilityJSON: 'v3',
  lng: 'ar',
  fallbackLng: 'en',
  defaultNS: 'translation',
  ns: ['translation'],
  interpolation: {
    escapeValue: false,
  },
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
