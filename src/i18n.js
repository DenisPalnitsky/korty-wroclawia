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
      "Duration": "Czas Trwania(godziny)",
      "duration_mobile": "Czas (godz.)",
      "Price": "Cena",
      "Closed": "Zamknięte",
      "weekends": "Ceny w weekendy",
      "weekdays": "Ceny w tygodniu",
      "Show Closed": "Pokaż zamknięte",
      "hour": "godzina",
      "No heating": "Bez ogrzewania",
      "indoor": "hala",
      "outdoor": "zewnętrzny",
      "tent": "namiot",
      "baloon": "balon",
      "hard": "twarda",
      "clay": "mączka",
      "grass": "trawa",
      "carpet": "dywan",
      "artificial-grass": "sztuczna trawa",
      "Order by price": "Sortuj według ceny",
      "Order by club": "Sortuj według nazwy",
      "Something went wrong": "Coś poszło nie tak",
      "something_went_wrong_message": "Przepraszamy, coś poszło nie tak. Spróbuj ponownie później.",
      "Reload Page": "Przeładuj stronę",
      "Report this problem": "Zgłoś problem",
      "start_hour": "Godzina Rozpoczęcia",
      "start_hour_mobile": "Godzina",
      "Disclaimer": "Zastrzeżenie",
      "disclaimer_content": "Ta strona internetowa nie jest powiązana z żadnymi klubami tenisowymi ani organizacjami wymienionymi tutaj. Wszystkie informacje o cenach pochodzą z ogólnie dostępnych danych i są udostępniane wyłącznie w celach informacyjnych. Chociaż staramy się zapewnić dokładność tych informacji, nie możemy zagwarantować, że wszystkie ceny są aktualne lub wolne od błędów. Prosimy o weryfikację cen bezpośrednio w odpowiednich klubach. Jeśli jesteś przedstawicielem klubu i chcesz zaktualizować lub usunąć informacje o swoich cenach, skontaktuj się z nami za pośrednictwem <a href='https://forms.gle/AAz9NTmnSYhfxGRJ9'>formularza</a>"
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
      "Duration": "Duration (hours)",
      "duration_mobile": "Duration",
      "Price": "Price",
      "Closed": "Closed",
      "weekends": "Weekend prices",
      "weekdays": "Weekday prices",
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
      "something_went_wrong_message": "We're sorry, but something went wrong. Please try again later.",
      "Reload Page": "Reload Page",
      "Report this problem": "Report this problem",
      "start_hour": "Start Hour",
      "start_hour_mobile": "Start",
      "Disclaimer": "Disclaimer",
      "disclaimer_content": "This website is not affiliated with any tennis clubs or organizations listed herein. All pricing information is sourced from publicly available data and is provided for informational purposes only. While we strive to ensure the accuracy of the information, we cannot guarantee that all prices are up-to-date or error-free. Please verify prices directly with the respective clubs. If you are a club representative and wish to update or remove your pricing information, please contact us via <a href='https://forms.gle/AAz9NTmnSYhfxGRJ9' />."
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
