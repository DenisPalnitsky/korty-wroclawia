import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { pl, enUS } from 'date-fns/locale';


const resources = {
  pl: {
    translation: {
      "Project Name": "Nazwa Projektu",
      "Courts of Wroclaw": "Korty Wrocławia",
      "Select Date": "Wybierz Datę",
      "Report Problem": "Zgłoś problem lub przekaż opinię",
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
      "Show Closed": "Pokaż zamknięte",
      "hour": "godzina",
      "No heating": "Bez ogrzewania",
      "indoor": "hala",
      "outdoor": "zewnętrzny",
      "tent": "namiot",
      "baloon": "balon",
      "hard": "twarda",
      "clay": "mączka ceglana",
      "grass": "trawa",
      "carpet": "dywan",
      "artificial-grass": "sztuczna trawa",
      "Order by price": "Sortuj według ceny",
      "Order by club": "Sortuj według nazwy",
      "Something went wrong": "Coś poszło nie tak",
      "We're sorry, but something went wrong. Please try again later.": "Przepraszamy, ale coś poszło nie tak. Proszę spróbować ponownie później.",
      "Reload Page": "Przeładuj stronę",
      "Report this problem": "Zgłoś problem"
    }
  },  
  en: {
    translation: {} // Ensure this is initialized
  }
};

Object.keys(resources.pl.translation).forEach(key => {
  resources.en.translation[key] = key;
});

const dateFnsLocales = {
  pl,
  en: enUS
};

i18n.getDateFnsLocale = () => {
  return dateFnsLocales[i18n.language] || dateFnsLocales.en;
};

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
