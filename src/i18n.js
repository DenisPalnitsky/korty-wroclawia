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
      "Price range on weekends": "Zakres cen w weekend",
      "Show Closed Courts": "Pokaż zamknięte korty"
    }
  },  
  en: {
    translation: {} // Ensure this is initialized
  }
};

Object.keys(resources.pl.translation).forEach(key => {
  resources.en.translation[key] = key;
});

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
