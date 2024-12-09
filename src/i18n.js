import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  pl: {
    translation: {
      "Project Name": "Nazwa Projektu",
      "Courts of Wroclaw": "Korty Wrocławia",
      "Select Date": "Wybierz Datę",
      "Report Problem": "Zgłoś Problem",
      "Court type": "Typ kortu",
      "Surface": "Nawierzchnia",
      "Court": "Kort",
      "Change mode": "Zmień tryb",
      "Start": "Początek {{val, datetime}}",
      "Duration": "Czas trwania",
      "Price": "Cena",
      "Closed": "Zamknięte",
      "Price range on weekdays": "Zakres cen w dni robocze",
      "Price range on weekends": "Zakres cen w weekend"
    }
  },
  en: {
    translation: {
      "Project Name": "Project Name",
      "Courts of Wroclaw": "Courts of Wroclaw",
      "Select Date": "Select Date",
      "Report Problem": "Report Problem",
      "Court type": "Court type",
      "Surface": "Surface",
      "Court": "Court",
      "Change mode": "Change mode",
      "Start": "Start {{val, datetime}}",
      "Duration": "Duration",
      "Price": "Price",
      "Closed": "Closed",
      "Price range on weekdays": "Price range on weekdays",
      "Price range on weekends": "Price range on weekends"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pl',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
