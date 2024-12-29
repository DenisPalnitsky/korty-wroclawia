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
      "We're sorry, but something poszło nie tak. Proszę spróbować ponownie później.",
      "Reload Page": "Przeładuj stronę",
      "Report this problem": "Zgłoś problem",
      "Start Hour": "Początek",
      "Disclaimer": "Zastrzeżenie",
      "This is a disclaimer page. The content of this page is translated using i18n.": "To jest strona z zastrzeżeniami. Zawartość tej strony jest tłumaczona za pomocą i18n."
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
      "Start": "Start",
      "Duration": "Duration",
      "Price": "Price",
      "Closed": "Closed",
      "Price range": "Price range",
      "weekends": "weekends",
      "weekdays": "weekdays",
      "Show Closed": "Show Closed",
      "hour": "hour",
      "No heating": "No heating",
      "indoor": "indoor",
      "outdoor": "outdoor",
      "tent": "tent",
      "baloon": "baloon",
      "hard": "hard",
      "clay": "clay",
      "grass": "grass",
      "carpet": "carpet",
      "artificial-grass": "artificial-grass",
      "Order by price": "Order by price",
      "Order by club": "Order by club",
      "Something went wrong": "Something went wrong",
      "We're sorry, but something went wrong. Please try again later.": "We're sorry, but something went wrong. Please try again later.",
      "Reload Page": "Reload Page",
      "Report this problem": "Report this problem",
      "Start Hour": "Start Hour",
      "Disclaimer": "Disclaimer",
      "This is a disclaimer page. The content of this page is translated using i18n.": "This is a disclaimer page. The content of this page is translated using i18n."
    }
  }
};

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
