import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { pl, enUS, de } from 'date-fns/locale';

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
      "weekends": "Ceny w weekend",
      "weekends_mobile": "Weekend",
      "weekdays": "Ceny w tygodniu",
      "weekdays_mobile": "Tydzień",
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
      "Order by distance": "Sortuj według odległości",
      "Get my location": "Pobierz moją lokalizację",
      "Getting location...": "Pobieranie lokalizacji...",
      "Location active": "Lokalizacja aktywna",
      "Location not available": "Lokalizacja niedostępna",
      "Location access denied": "Odmówiono dostępu do lokalizacji",
      "Distance": "Odległość",
      "Something went wrong": "Coś poszło nie tak",
      "something_went_wrong_message": "Przepraszamy, coś poszło nie tak. Spróbuj ponownie później.",
      "Reload Page": "Przeładuj stronę",
      "Report this problem": "Zgłoś problem",
      "start_hour": "Godzina Rozpoczęcia",
      "start_hour_mobile": "Godzina",
      "Disclaimer": "Zastrzeżenie",
      "disclaimer_content": "Ta strona internetowa nie jest powiązana z żadnymi klubami tenisowymi ani organizacjami wymienionymi tutaj. Wszystkie informacje o cenach pochodzą z ogólnie dostępnych danych i są udostępniane wyłącznie w celach informacyjnych. Chociaż staramy się zapewnić dokładność tych informacji, nie możemy zagwarantować, że wszystkie ceny są aktualne lub wolne od błędów. Prosimy o weryfikację cen bezpośrednio w odpowiednich klubach. Jeśli jesteś przedstawicielem klubu i chcesz zaktualizować lub usunąć informacje o swoich cenach, skontaktuj się z nami za pośrednictwem <a href='https://forms.gle/AAz9NTmnSYhfxGRJ9'>formularza</a>",
      "meta_title": "Korty Wrocławia",
      "meta_description": "Szukasz kortów tenisowych we Wrocławiu? Porównaj ceny, łatwo rezerwuj i znajdź idealny kort. Kompleksowy przewodnik po obiektach tenisowych we Wrocławiu."
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
      "weekends_mobile": "Weekends",
      "weekdays": "Weekday prices",
      "weekdays_mobile": "Weekdays",
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
      "Order by distance": "Order by distance",
      "Get my location": "Get my location",
      "Getting location...": "Getting location...",
      "Location active": "Location active",
      "Location not available": "Location not available",
      "Location access denied": "Location access denied",
      "Distance": "Distance",
      "Something went wrong": "Something went wrong",
      "something_went_wrong_message": "We're sorry, but something went wrong. Please try again later.",
      "Reload Page": "Reload Page",
      "Report this problem": "Report this problem",
      "start_hour": "Start Hour",
      "start_hour_mobile": "Start",
      "Disclaimer": "Disclaimer",
      "disclaimer_content": "This website is not affiliated with any tennis clubs or organizations listed herein. All pricing information is sourced from publicly available data and is provided for informational purposes only. While we strive to ensure the accuracy of the information, we cannot guarantee that all prices are up-to-date or error-free. Please verify prices directly with the respective clubs. If you are a club representative and wish to update or remove your pricing information, please contact us via <a href='https://forms.gle/AAz9NTmnSYhfxGRJ9' />.",
      "meta_title": "Tennis Courts in Wroclaw",
      "meta_description": "Looking for tennis courts in Wroclaw? Compare prices, book easily, and find your ideal court. Comprehensive guide to tennis facilities in Wrocław."
    }
  },
  de: {
    translation: {
      "Project Name": "Projektname",
      "Courts of Wroclaw": "Tennisplätze in Breslau",
      "Select Date": "Datum auswählen",
      "Report Problem": "Problem melden",
      "Court type": "Platztyp",
      "Surface": "Oberfläche",
      "Court": "Platz",
      "Change mode": "Modus ändern",
      "Start": "Start",
      "Duration": "Dauer (Stunden)",
      "duration_mobile": "Dauer",
      "Price": "Preis",
      "Closed": "Geschlossen",
      "weekends": "Wochenendpreise",
      "weekends_mobile": "Wochenenden",
      "weekdays": "Wochentagspreise",
      "weekdays_mobile": "Wochentage",
      "Show Closed": "Geschlossene anzeigen",
      "hour": "Stunde",
      "No heating": "Keine Heizung",
      "indoor": "Halle",
      "outdoor": "Außen",
      "tent": "Zelt",
      "baloon": "Ballon",
      "hard": "Hart",
      "clay": "Sand",
      "grass": "Rasen",
      "carpet": "Teppich",
      "artificial-grass": "Kunstrasen",
      "Order by price": "Nach Preis sortieren",
      "Order by club": "Nach Club sortieren",
      "Order by distance": "Nach Entfernung sortieren",
      "Get my location": "Meinen Standort abrufen",
      "Getting location...": "Standort wird abgerufen...",
      "Location active": "Standort aktiv",
      "Location not available": "Standort nicht verfügbar",
      "Location access denied": "Standortzugriff verweigert",
      "Distance": "Entfernung",
      "Something went wrong": "Etwas ist schief gelaufen",
      "something_went_wrong_message": "Es tut uns leid, aber etwas ist schief gelaufen. Bitte versuchen Sie es später noch einmal.",
      "Reload Page": "Seite neu laden",
      "Report this problem": "Dieses Problem melden",
      "start_hour": "Startzeit",
      "start_hour_mobile": "Start",
      "Disclaimer": "Haftungsausschluss",
      "disclaimer_content": "Diese Website ist nicht mit den hier aufgeführten Tennisclubs oder Organisationen verbunden. Alle Preisinformationen stammen aus öffentlich zugänglichen Daten und dienen nur zu Informationszwecken. Obwohl wir uns bemühen, die Richtigkeit der Informationen sicherzustellen, können wir nicht garantieren, dass alle Preise aktuell oder fehlerfrei sind. Bitte überprüfen Sie die Preise direkt bei den jeweiligen Clubs. Wenn Sie ein Clubvertreter sind und Ihre Preisinformationen aktualisieren oder entfernen möchten, kontaktieren Sie uns bitte über <a href='https://forms.gle/AAz9NTmnSYhfxGRJ9'>dieses Formular</a>.",
      "meta_title": "Tennisplätze in Breslau",
      "meta_description": "Suchen Sie Tennisplätze in Breslau? Vergleichen Sie Preise, buchen Sie einfach und finden Sie Ihren idealen Platz. Umfassender Führer zu Tennisanlagen in Breslau."
    }
  }
};

const dateFnsLocales = {
  pl,
  en: enUS,
  de
};

i18n.getDateFnsLocale = () => {
  return dateFnsLocales[i18n.language] || dateFnsLocales.en;
};
const defaultLanguage = localStorage.getItem('language') || 'pl';


i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: 'pl',
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
