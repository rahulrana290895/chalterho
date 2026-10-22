
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import hi from './locales/hi.json';
import pa from './locales/pa.json';

const LANGUAGE_KEY = '@chalterho_language';

let initializationPromise = null;

export function initializeLanguage() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

      await i18n.use(initReactI18next).init({
        resources: {
          en: {translation: en},
          hi: {translation: hi},
          pa: {translation: pa},
        },
        lng: ['en', 'hi', 'pa'].includes(savedLanguage)
          ? savedLanguage
          : 'en',
        fallbackLng: 'en',
        supportedLngs: ['en', 'hi', 'pa'],
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
      });

      return i18n;
    })().catch(error => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
}

export async function changeAppLanguage(language) {
  if (!['en', 'hi', 'pa'].includes(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }

  await initializeLanguage();

  await i18n.changeLanguage(language);
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
}

export default i18n;
