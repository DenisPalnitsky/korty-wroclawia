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
      "Start": "Początek",
      "Duration": "Czas trwania",
      "Price": "Cena",
      "Closed": "Zamknięte",
      "Price range": "Zakres cen",
      "weekends": "weekendy",
      "weekdays": "tydzień",
      "Show Closed Courts": "Pokaż zamknięte korty",
      "hour": "godzina",
      "No heating": "Bez ogrzewania"
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
      escapeValue: false,
      format: (value, format, lng) => {
        if (format === 'currency') {
          return new Intl.NumberFormat(lng, {
            style: 'currency',
            currency: 'zl'
          }).format(value);
        }
        return value;
      }
    }
  });

export default i18n;
